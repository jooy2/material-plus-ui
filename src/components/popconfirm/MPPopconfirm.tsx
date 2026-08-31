import * as React from 'react';
import { MPButton } from '../button/MPButton';
import { MPPopover } from '../popover/MPPopover';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { CONFIRM } from '../../internal/messages/confirm';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPAlign, MPColor, MPSide, MPSize } from '../../types';

export interface MPPopconfirmProps {
  /**
   * The control that asks, and that the question hangs off. Exactly one element,
   * and it must accept a ref and spread props — every Material Plus component
   * does.
   */
  trigger: React.ReactElement;
  /** The question, as the popup's heading. */
  title?: React.ReactNode;
  /** A line under it — what happens, and to what. */
  description?: React.ReactNode;
  /** Anything else the popup should hold. */
  children?: React.ReactNode;
  /**
   * Called when the reader says yes.
   *
   * A callback rather than a promise, and that is the whole difference from
   * [`useMPConfirm`](../feedback/confirm): this one is written where the button
   * is, so there is already a handler there to put it in.
   */
  onConfirm?: () => void;
  /** Called when they say no. Dismissing counts — see `onOpenChange`. */
  onCancel?: () => void;
  /** What the yes button says. @default the translation of `Confirm` */
  confirmLabel?: React.ReactNode;
  /** What the no button says. @default the translation of `Cancel` */
  cancelLabel?: React.ReactNode;
  /**
   * The accent the yes button is drawn in. `'error'` is what a destructive
   * question wants, and it is not the default for the reason `useMPConfirm`
   * gives: a red button on every confirmation stops being a warning.
   */
  color?: MPColor;
  /** Which edge of the trigger the question appears on. @default 'top' */
  side?: MPSide;
  /** @default 'center' */
  align?: MPAlign;
  /** @default true */
  arrow?: boolean;
  size?: MPSize;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * A confirmation that stays where the control is.
 *
 * ```tsx
 * <MPPopconfirm
 *   trigger={<MPButton color="error">Delete</MPButton>}
 *   title="Delete this row?"
 *   confirmLabel="Delete"
 *   color="error"
 *   onConfirm={() => remove(id)}
 * />
 * ```
 *
 * ## When this rather than `useMPConfirm`
 *
 * They ask the same question and the difference is **where the reader's eye
 * is**, which is a real difference and not a stylistic one:
 *
 * | | `MPPopconfirm` | [`useMPConfirm`](../feedback/confirm) |
 * | --- | --- | --- |
 * | Appears | at the control | in the middle of the screen |
 * | The page behind | stays put | goes under a scrim |
 * | Costs | one element | a provider |
 * | Answers with | a callback | a promise |
 *
 * A row of twelve delete buttons is the case for this one: a modal that covered
 * the table would take away the row the reader was pointing at, and having to
 * re-find it afterwards is how the wrong row gets deleted. A confirmation about
 * the *page* — leaving with unsaved changes, an irreversible account action —
 * wants the modal, because it is not about a thing on the page at all.
 *
 * ## Every other way out is *no*
 *
 * Escape, a press outside and the cancel button all close it without confirming,
 * and `onCancel` is called for all three. That is the same rule `useMPConfirm`
 * follows and for the same reason: the safe answer to "are you sure" is no.
 *
 * ## It is a popover, not a dialog
 *
 * So it does not trap the focus and the page behind it stays live. That is the
 * point of the shape — but it also means a reader can walk away from the
 * question with Tab, which a modal would not allow. Use the modal where the
 * answer genuinely has to be given.
 */
export function MPPopconfirm({
  trigger,
  title,
  description,
  children,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  color: colorProp,
  side = 'top',
  align = 'center',
  arrow = true,
  size: sizeProp,
  open: openProp,
  defaultOpen,
  onOpenChange,
  className
}: MPPopconfirmProps) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);
  const labels = useMPMessages(CONFIRM, useMPLocale());

  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const open = openProp ?? uncontrolled;

  const setOpen = (next: boolean) => {
    if (openProp === undefined) {
      setUncontrolled(next);
    }

    onOpenChange?.(next);
  };

  const answer = (given: boolean) => {
    setOpen(false);

    if (given) {
      onConfirm?.();
    } else {
      onCancel?.();
    }
  };

  return (
    <MPPopover
      trigger={trigger}
      title={title}
      description={description}
      side={side}
      align={align}
      arrow={arrow}
      size={size}
      open={open}
      onOpenChange={(next) => {
        // Escape, the outside press, and anything else that closes it. Only a
        // *close* is an answer — an open is the question being asked.
        if (!next) {
          answer(false);

          return;
        }

        setOpen(true);
      }}
      className={className}
    >
      {children}

      <div className="mt-3 flex justify-end gap-1">
        <MPButton variant="text" size="sm" onClick={() => answer(false)}>
          {cancelLabel ?? labels.cancel}
        </MPButton>
        <MPButton variant="text" size="sm" color={color} onClick={() => answer(true)}>
          {confirmLabel ?? labels.confirm}
        </MPButton>
      </div>
    </MPPopover>
  );
}
