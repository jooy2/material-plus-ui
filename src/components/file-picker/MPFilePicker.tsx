import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import { CloseIcon, UploadIcon } from '../../constants/icons';
import { fillMessage } from '../../internal/i18n';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { COMMON } from '../../internal/messages/common';
import { FILE_PICKER } from '../../internal/messages/file-picker';
import { MPStateLayer } from '../../internal/StateLayer';
import { CONTROL_ICON, META_TEXT, PROSE_TEXT, STACK_GAP, hasContent } from '../../internal/scale';
import { useMPSize } from '../../internal/config';
import type { MPSize, MPStyleProps } from '../../types';

/** Why a file was turned away. One reason per file, in the order they are checked. */
export type MPFileRejectionReason = 'type' | 'size' | 'count';

export interface MPFileRejection {
  file: File;
  reason: MPFileRejectionReason;
}

/**
 * The box's inner padding, on its own ladder rather than the control one.
 *
 * A dropzone is sized by the gesture it has to catch rather than by what is
 * written in it. Every other control on the ladder is a line of text tall on
 * purpose; a drop target that is a line of text tall is a drop target you miss.
 */
const ZONE_PADDING: Record<MPSize, string> = {
  xs: 'p-4',
  sm: 'p-5',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10'
};

/**
 * `1.4 MB`, in the units the reader's own file browser uses.
 *
 * Base 1000 and `MB` rather than base 1024 and `MiB`: it is the number every
 * desktop file manager shows, and a picker that disagrees with the Finder about
 * how big a file is has picked a fight it cannot win.
 *
 * Exported because a caller writing their own `hint` — "up to 5 MB" — needs the
 * same spelling the list underneath will use, and two spellings of one number in
 * one component is the version of this that looks like a bug.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1000) {
    return `${bytes} B`;
  }

  const units = ['kB', 'MB', 'GB', 'TB'];
  let value = bytes / 1000;
  let unit = 0;

  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }

  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

/**
 * Whether a file matches an `accept` string.
 *
 * The browser applies `accept` to its own dialog and to nothing else, so a file
 * that arrives by drag has never been checked against it — which is how a
 * dropzone that only sets the attribute ends up accepting anything at all. This
 * is that check: the same three forms the attribute takes, `.ext`,
 * `type/subtype` and `type/*`.
 */
function matchesAccept(file: File, accept: string): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => {
      if (entry.startsWith('.')) {
        return name.endsWith(entry);
      }

      if (entry.endsWith('/*')) {
        return type.startsWith(entry.slice(0, -1));
      }

      return type === entry;
    });
}

export interface MPFilePickerProps extends MPStyleProps {
  /**
   * Which files the browser's own dialog offers, in the `accept` grammar —
   * `'image/*,.pdf'`. Dropped files are checked against it too, which the
   * attribute alone does not do.
   */
  accept?: string;
  /** Whether more than one file may be chosen. @default false */
  multiple?: boolean;
  /** The largest a single file may be, in bytes. */
  maxSize?: number;
  /**
   * How many files may be held at once. Checked against what is already chosen
   * rather than against one drop, which is the difference between "you may drop
   * five files" and "you may end up with five files" — only the second is what
   * this means.
   */
  maxFiles?: number;
  /** The chosen files. Use with `onFilesChange` for a controlled picker. */
  value?: readonly File[];
  /** The files chosen at the start, for an uncontrolled picker. */
  defaultValue?: readonly File[];
  onFilesChange?: (files: File[]) => void;
  /**
   * Called with everything that was turned away, and why. Without it a rejected
   * file disappears in silence, which is the single worst thing a dropzone does.
   */
  onReject?: (rejections: MPFileRejection[]) => void;
  /** Label above the box. */
  label?: React.ReactNode;
  /** The line under the box. Replaced by `errorMessage` when there is one. */
  description?: React.ReactNode;
  /** The message under the box, which also turns the picker over. */
  errorMessage?: React.ReactNode;
  /** The line inside the box. Defaults to the wording in `locale`. */
  title?: React.ReactNode;
  /** The line under it — what is accepted, how big, how many. */
  hint?: React.ReactNode;
  /** The glyph above the title. Pass `null` for a box with no picture in it. */
  icon?: React.ReactNode;
  /** Lists the chosen files under the box, each with a way to remove it. @default true */
  showList?: boolean;
  /**
   * The accessible name of a file's remove button. Receives the file's name.
   *
   * Left out, each button is still named for its own file — in `locale`'s own
   * word order — rather than being one of five buttons all called "Remove".
   */
  removeLabel?: (name: string) => string;
  /**
   * Which language the box's own words are written in — the prompt inside it and
   * the remove buttons' names. Falls back to the nearest `MPLocaleProvider`,
   * then to English.
   */
  locale?: string;
  /** Marks the field required. */
  required?: boolean;
  /** Greys the picker out and stops it taking files. */
  disabled?: boolean;
  /** Shows what was chosen without allowing it to be added to or removed from. */
  readOnly?: boolean;
  /** Name of the form control. */
  name?: string;
  /** The id put on the browse button. */
  id?: string;
  /**
   * Added to the picker's outermost element — the box around the label, the drop
   * zone and the list of files that have been chosen.
   */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A box you drop files on, or click to open the file dialog.
 *
 * There is no Material component for this and no Base UI primitive under it, and
 * both absences are fine: a dropzone is a `<div>` listening for four drag events
 * plus an `<input type="file">` it clicks for you. There is no popup to position,
 * no focus to trap, no roving anything. What it borrows from Material is the part
 * that is a *surface* — the corner size, the `outline-variant` edge, the state
 * layers, the supporting text — so it sits in a form with the rest of these
 * components rather than beside them.
 *
 * The edge is dashed, which is the one place this library draws a line that is
 * not solid. It is not decoration: a dashed rectangle is the established sign for
 * "this area takes a drop", and a dropzone that looks like a card is a card
 * nobody tries to drop on.
 *
 * ## The two things a hand-rolled dropzone gets wrong
 *
 * **The drag counter.** `dragenter` and `dragleave` both fire as the pointer
 * crosses a *child* of the zone, so a zone that toggles a boolean flickers the
 * entire time a file is being dragged across its own contents. Counting the
 * events instead is the only version that survives having anything inside the
 * box.
 *
 * **`accept`.** The browser enforces it on its own dialog and never on a drop.
 * See `matchesAccept` above.
 */
export const MPFilePicker = React.forwardRef<HTMLInputElement, MPFilePickerProps>(
  function MPFilePicker(
    {
      accept,
      multiple = false,
      maxSize,
      maxFiles,
      value,
      defaultValue,
      onFilesChange,
      onReject,
      label,
      description,
      errorMessage,
      title,
      hint,
      icon,
      showList = true,
      removeLabel,
      locale: localeProp,
      size: sizeProp,
      fullWidth = true,
      required = false,
      disabled = false,
      readOnly = false,
      name,
      id,
      className,
      style
    },
    ref
  ) {
    const size = useMPSize(sizeProp);
    const locale = useMPLocale(localeProp);
    const messages = useMPMessages(COMMON, locale);
    const words = useMPMessages(FILE_PICKER, locale);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Empty deps: the ref this hands over is the same one for the life of the
    // component, so recomputing it on every render was rebuilding a constant.
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

    const [uncontrolled, setUncontrolled] = React.useState<File[]>(() => [...(defaultValue ?? [])]);
    const files = value ? [...value] : uncontrolled;

    const dragDepth = React.useRef(0);
    const [over, setOver] = React.useState(false);

    const invalid = hasContent(errorMessage);
    const inert = disabled || readOnly;
    const describedById = React.useId();
    const labelId = React.useId();

    const commit = React.useCallback(
      (next: File[]) => {
        if (!value) {
          setUncontrolled(next);
        }

        onFilesChange?.(next);
      },
      [onFilesChange, value]
    );

    /** Sorts an incoming batch into kept and rejected, in that order of checks. */
    const accepting = React.useCallback(
      (incoming: File[]) => {
        const kept: File[] = [];
        const rejections: MPFileRejection[] = [];
        const room = multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1;
        const held = multiple ? files.length : 0;

        for (const file of incoming) {
          if (accept && !matchesAccept(file, accept)) {
            rejections.push({ file, reason: 'type' });
          } else if (maxSize !== undefined && file.size > maxSize) {
            rejections.push({ file, reason: 'size' });
          } else if (held + kept.length >= room) {
            rejections.push({ file, reason: 'count' });
          } else {
            kept.push(file);
          }
        }

        return { kept, rejections };
      },
      [accept, files.length, maxFiles, maxSize, multiple]
    );

    const add = React.useCallback(
      (incoming: File[]) => {
        const { kept, rejections } = accepting(incoming);

        if (rejections.length > 0) {
          onReject?.(rejections);
        }

        if (kept.length > 0) {
          commit(multiple ? [...files, ...kept] : kept);
        }
      },
      [accepting, commit, files, multiple, onReject]
    );

    const browse = () => {
      if (inert || !inputRef.current) {
        return;
      }

      // Cleared first, so choosing the same file twice in a row still fires
      // `change` — the input holds its value otherwise, and the second pick is
      // dropped in silence.
      inputRef.current.value = '';
      inputRef.current.click();
    };

    return (
      <div
        className={[
          'mp-file-picker flex-col align-top',
          STACK_GAP[size],
          fullWidth ? 'flex w-full' : 'inline-flex',
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        style={style}
        data-mp-size={size}
        data-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
      >
        {hasContent(label) ? (
          <span
            id={labelId}
            className={[
              META_TEXT,
              disabled
                ? 'text-mp-on-surface/38'
                : invalid
                  ? 'text-mp-error'
                  : 'text-mp-on-surface-variant'
            ].join(' ')}
          >
            {label}
            {required ? <span aria-hidden="true"> *</span> : null}
          </span>
        ) : null}

        {/* The drag listeners belong to the shell rather than to the button: a
            drop is a gesture over an *area*, and the list of files under the box
            is part of the same area as far as the pointer is concerned. */}
        <div
          // `relative`, because the real `<input>` below is positioned. Without
          // a containing block of its own it resolves against whatever ancestor
          // happens to be positioned — the page, most of the time — and a
          // clipped one-pixel box lands wherever that turns out to be.
          className="relative flex w-full flex-col"
          onDragEnter={(event) => {
            if (inert) {
              return;
            }

            event.preventDefault();
            dragDepth.current += 1;
            setOver(true);
          }}
          onDragOver={(event) => {
            if (inert) {
              return;
            }

            // Without this the browser navigates to the file instead of dropping
            // it, which is the default and is never what anybody wants.
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
          }}
          onDragLeave={() => {
            if (inert) {
              return;
            }

            dragDepth.current = Math.max(0, dragDepth.current - 1);

            if (dragDepth.current === 0) {
              setOver(false);
            }
          }}
          onDrop={(event) => {
            if (inert) {
              return;
            }

            event.preventDefault();
            dragDepth.current = 0;
            setOver(false);
            add(Array.from(event.dataTransfer.files));
          }}
        >
          <button
            type="button"
            id={id}
            disabled={disabled}
            aria-describedby={hasContent(description) || invalid ? describedById : undefined}
            aria-invalid={invalid || undefined}
            className={[
              'mp-file-picker__zone group relative flex w-full flex-col items-center',
              'justify-center gap-2 text-center',
              'rounded-mp-md box-border border-2 border-dashed',
              'appearance-none bg-transparent font-[inherit] outline-none',
              'transition-[border-color,background-color] duration-(--mp-sys-motion-duration-short4)',
              ZONE_PADDING[size],
              PROSE_TEXT[size],
              disabled
                ? 'border-mp-on-surface/12 text-mp-on-surface/38 cursor-default'
                : [
                    readOnly ? 'cursor-default' : 'cursor-pointer',
                    invalid ? 'border-mp-error' : 'border-mp-outline-variant',
                    'text-mp-on-surface',
                    // While something is over the box: the edge takes the accent
                    // and the fill deepens. Colour only, and the same two the
                    // hover state already moves — a dropzone that grows under the
                    // pointer moves the target while the reader is aiming at it.
                    over ? 'border-mp-primary bg-mp-primary/8' : ''
                  ]
                    .filter(Boolean)
                    .join(' ')
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={browse}
          >
            {inert ? null : <MPStateLayer layer="inset-0 rounded-[inherit] bg-mp-primary" />}

            {icon === undefined ? (
              <MPIcon
                icon={UploadIcon}
                size={CONTROL_ICON[size] * 1.6}
                className={disabled ? '' : 'text-mp-primary'}
              />
            ) : hasContent(icon) ? (
              <span className={disabled ? '' : 'text-mp-primary'}>{icon}</span>
            ) : null}

            <span className="font-medium">{title ?? words.prompt}</span>

            {hasContent(hint) ? (
              <span
                className={[
                  META_TEXT,
                  disabled ? 'text-mp-on-surface/38' : 'text-mp-on-surface-variant'
                ].join(' ')}
              >
                {hint}
              </span>
            ) : null}
          </button>

          {/*
           * The real control, kept off-screen rather than hidden: `display: none`
           * and `visibility: hidden` both make an input unfocusable, and this one
           * still has to be reachable by a form and by a `required` validation
           * message.
           *
           * `tabIndex={-1}` keeps it out of the tab order — the zone above is
           * what a reader tabs to — but it is deliberately **not** `aria-hidden`.
           * The two cannot both be true: a `required` field that is empty is one
           * the browser focuses to hang its validation bubble off, and focusing
           * an element that has been taken out of the accessibility tree moves a
           * screen reader to somewhere it has been told does not exist. The
           * message is then delivered to nobody.
           *
           * So it carries the field's own name instead. The cost is one more
           * node a reader can meet while browsing, which is what a bare
           * `<input type="file">` would have presented anyway.
           */}
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept={accept}
            multiple={multiple}
            required={required && files.length === 0}
            disabled={inert}
            tabIndex={-1}
            aria-labelledby={hasContent(label) ? labelId : undefined}
            aria-describedby={hasContent(description) || invalid ? describedById : undefined}
            className="absolute size-px overflow-hidden opacity-0 [clip-path:inset(50%)]"
            onChange={(event) => add(Array.from(event.target.files ?? []))}
          />
        </div>

        {showList && files.length > 0 ? (
          <ul
            className={[
              'mp-file-picker__list m-0 flex w-full list-none flex-col p-0',
              STACK_GAP[size]
            ].join(' ')}
          >
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                className={[
                  'rounded-mp-xs bg-mp-surface-container-low flex w-full items-center gap-3',
                  'px-3 py-2',
                  PROSE_TEXT[size],
                  disabled ? 'text-mp-on-surface/38' : 'text-mp-on-surface'
                ].join(' ')}
              >
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span
                  className={[
                    META_TEXT,
                    'shrink-0 tabular-nums',
                    disabled ? 'text-mp-on-surface/38' : 'text-mp-on-surface-variant'
                  ].join(' ')}
                >
                  {formatFileSize(file.size)}
                </span>
                {inert ? null : (
                  <button
                    type="button"
                    aria-label={
                      removeLabel
                        ? removeLabel(file.name)
                        : fillMessage(messages.removeNamed, { label: file.name })
                    }
                    className={[
                      'group text-mp-on-surface-variant relative flex size-8 shrink-0',
                      'cursor-pointer appearance-none items-center justify-center rounded-full',
                      'bg-transparent p-0 font-[inherit] outline-none'
                    ].join(' ')}
                    onClick={() => commit(files.filter((_, at) => at !== index))}
                  >
                    <MPStateLayer />
                    <MPIcon icon={CloseIcon} size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : null}

        {invalid ? (
          <span id={describedById} className={[META_TEXT, 'text-mp-error'].join(' ')}>
            {errorMessage}
          </span>
        ) : hasContent(description) ? (
          <span
            id={describedById}
            className={[
              META_TEXT,
              disabled ? 'text-mp-on-surface/38' : 'text-mp-on-surface-variant'
            ].join(' ')}
          >
            {description}
          </span>
        ) : null}
      </div>
    );
  }
);
