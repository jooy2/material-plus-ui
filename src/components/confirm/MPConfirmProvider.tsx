import * as React from 'react';
import { MPButton } from '../button/MPButton';
import { MPDialog } from '../dialog/MPDialog';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { CONFIRM } from '../../internal/messages/confirm';
import type { MPColor, MPSize } from '../../types';

/** What a confirmation asks, and how it is drawn. */
export interface MPConfirmOptions {
  /** The question, as a heading. */
  title?: React.ReactNode;
  /** The sentence under it — what happens, and to what. */
  description?: React.ReactNode;
  /** A glyph above the title, the way `MPDialog` draws one. */
  icon?: React.ReactNode;
  /**
   * Anything else the dialog should hold — a field, a list of what is about to
   * be deleted, a checkbox that says "do not ask again".
   */
  children?: React.ReactNode;
  /** What the yes button says. @default the translation of `Confirm` */
  confirmLabel?: React.ReactNode;
  /** What the no button says. @default the translation of `Cancel` */
  cancelLabel?: React.ReactNode;
  /**
   * The accent the yes button is drawn in.
   *
   * `'error'` is what a destructive confirmation wants, and it is not the
   * default: most confirmations are not destructive, and a red button on every
   * one of them stops being a warning.
   * @default 'primary'
   */
  color?: MPColor;
  /** @default 'md' */
  size?: MPSize;
  /**
   * Whether Escape and a press outside answer **no**.
   *
   * On by default, because a dialog a reader cannot leave is a trap and because
   * the safe answer to "are you sure" is no. Switch it off for a question that
   * genuinely has to be answered — and be sure it does, because the reader then
   * has exactly two ways out and both of them are your buttons.
   * @default true
   */
  dismissible?: boolean;
}

export interface MPConfirmResult {
  /**
   * Asks, and resolves with the answer.
   *
   * `true` for the confirm button, `false` for cancel — and `false` for Escape,
   * a press outside, and anything else that closes the dialog. There is no third
   * answer, so a caller writes one `if`.
   */
  confirm: (options: MPConfirmOptions) => Promise<boolean>;
  /**
   * Tells, and resolves once it has been acknowledged.
   *
   * One button, because there is nothing to refuse. `Promise<void>` rather than
   * `Promise<boolean>` for the same reason: an acknowledgement has no answer,
   * and a boolean nobody can vary is a value a caller would have to learn to
   * ignore.
   */
  alert: (options: MPConfirmOptions) => Promise<void>;
}

interface Pending extends MPConfirmOptions {
  /** An acknowledgement draws one button and cannot be refused. */
  acknowledge: boolean;
}

const MPConfirmContext = React.createContext<MPConfirmResult | null>(null);

export interface MPConfirmProviderProps {
  /**
   * Defaults for every confirmation raised under this — a `size` to match the
   * application, an accent, a `cancelLabel` in your own words. Each call still
   * says whatever it needs to and wins.
   */
  defaults?: Omit<MPConfirmOptions, 'title' | 'description' | 'children'>;
  children?: React.ReactNode;
}

/**
 * Holds the one dialog every `confirm()` in the application is drawn in.
 *
 * Wrap the application, the way `MPSnackbarProvider` is wrapped, and for the
 * same reason: what a caller has at the moment a question is warranted is a
 * click handler, not a place in the tree.
 *
 * ```tsx
 * <MPConfirmProvider>
 *   <App />
 * </MPConfirmProvider>
 * ```
 *
 * ## One at a time
 *
 * A second `confirm()` raised while one is open **replaces** it, and the first
 * promise resolves `false`. Not a queue, deliberately: a queue would ask a
 * question about something the reader has already moved on from, and the answer
 * to a stale question is not information. Two confirmations racing is a bug in
 * the calling code, and resolving the first as *no* is the safe reading of it.
 */
export function MPConfirmProvider({ defaults, children }: MPConfirmProviderProps) {
  const [pending, setPending] = React.useState<Pending | null>(null);
  const labels = useMPMessages(CONFIRM, useMPLocale());

  // Held in a ref as well as in state, so that closing can resolve the promise
  // exactly once — from the button, from Escape, and from the unmount that a
  // replacement causes — without any of the three needing to know about the
  // others.
  const settle = React.useRef<((answer: boolean) => void) | null>(null);

  const raise = React.useCallback(
    (options: MPConfirmOptions, acknowledge: boolean) =>
      new Promise<boolean>((resolve) => {
        // A confirmation already on screen is answered `false` before this one
        // takes its place. Its caller asked about something the reader has since
        // moved past, and no is the safe reading of that.
        settle.current?.(false);
        settle.current = resolve;

        setPending({ ...defaults, ...options, acknowledge });
      }),
    [defaults]
  );

  const value = React.useMemo<MPConfirmResult>(
    () => ({
      confirm: (options: MPConfirmOptions) => raise(options, false),
      alert: (options: MPConfirmOptions) => raise(options, true).then(() => undefined)
    }),
    [raise]
  );

  const answer = (given: boolean) => {
    settle.current?.(given);
    settle.current = null;
    setPending(null);
  };

  const acknowledging = pending?.acknowledge ?? false;

  return (
    <MPConfirmContext.Provider value={value}>
      {children}

      <MPDialog
        open={pending !== null}
        onOpenChange={(next) => {
          if (!next) {
            // Escape, the scrim, the × — every one of them is `no`. An
            // acknowledgement has no `no`, so it resolves the same way its one
            // button does.
            answer(acknowledging);
          }
        }}
        icon={pending?.icon}
        title={pending?.title}
        description={pending?.description}
        size={pending?.size ?? 'md'}
        color={pending?.color ?? 'primary'}
        dismissible={pending?.dismissible ?? true}
        actions={
          <>
            {acknowledging ? null : (
              <MPButton variant="text" onClick={() => answer(false)}>
                {pending?.cancelLabel ?? labels.cancel}
              </MPButton>
            )}
            <MPButton
              variant="text"
              color={pending?.color ?? 'primary'}
              onClick={() => answer(true)}
            >
              {pending?.confirmLabel ?? (acknowledging ? labels.ok : labels.confirm)}
            </MPButton>
          </>
        }
      >
        {pending?.children}
      </MPDialog>
    </MPConfirmContext.Provider>
  );
}

/**
 * Asks a question and waits for the answer.
 *
 * ```tsx
 * const { confirm } = useMPConfirm();
 *
 * async function remove() {
 *   const sure = await confirm({
 *     title: 'Delete this project?',
 *     description: 'Everything in it goes too, and it cannot be undone.',
 *     confirmLabel: 'Delete',
 *     color: 'error'
 *   });
 *
 *   if (sure) {
 *     await api.delete(id);
 *   }
 * }
 * ```
 *
 * ## Why this rather than a dialog of your own
 *
 * Because the dialog is not the hard part. "Are you sure" needs a piece of open
 * state, a piece of state for *what* is being confirmed, two handlers, and a
 * dialog kept mounted somewhere it does not belong — per call site. What the
 * caller actually has at that moment is a click handler, and what they want back
 * is a boolean.
 *
 * It is the same trade `useMPSnackbar` makes, run the other way: a snackbar is
 * something to say, this is something to ask.
 *
 * ## `false` is every other answer
 *
 * The confirm button resolves `true`; the cancel button, Escape, a press outside
 * and any other close resolve `false`. There is no third outcome and the promise
 * never rejects, so a caller writes an `if` and not a `try`.
 *
 * `alert()` is the one-button form and resolves `void` once it has been
 * acknowledged — an acknowledgement has nothing to refuse, and a boolean nobody
 * can vary is a value a caller would have to learn to ignore.
 *
 * ## Sharp edges
 *
 * - **It needs an `MPConfirmProvider` above it.** Without one the hook throws,
 *   rather than returning a function that silently never resolves — a promise
 *   that never settles is the hardest possible way to be told about a missing
 *   provider.
 * - **One at a time.** A second `confirm()` raised while one is open replaces it
 *   and resolves the first `false`. See the provider for why that is not a queue.
 * - **Do not `await` it inside a render.** It is a click handler's tool.
 */
export function useMPConfirm(): MPConfirmResult {
  const value = React.useContext(MPConfirmContext);

  if (!value) {
    throw new Error(
      'useMPConfirm was called outside an <MPConfirmProvider>. Wrap the application in one — ' +
        'the provider is what holds the dialog every confirm() is drawn in.'
    );
  }

  return value;
}
