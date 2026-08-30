/**
 * The glyphs, and the table that names them.
 *
 * The glyphs themselves are `constants/glyphs.ts` and are re-exported from here
 * unchanged — this is the file everything imports, components included, and
 * `material-plus-ui/constants/icons` is still the path a caller writes.
 *
 * ## Two ways out of this file, and why
 *
 * - **The named exports** (`VisibilityIcon`, …) are what the library's own
 *   components import. A named import of one export lets a bundler drop every
 *   other binding, so a project that only uses `MPTextField` ships two glyphs
 *   rather than all of them.
 * - **`ICONS`** is the same set as a lookup table, for an application that wants
 *   a name-keyed registry of its own — `<MPIcon icon={ICONS.close} />`. An
 *   object literal cannot be tree-shaken property by property, so importing it
 *   pulls in every glyph listed below. That is the trade it exists to make, and
 *   it is why the components never reach for it.
 *
 * ## Why the table is here and the glyphs are next door
 *
 * Because this module has to stay server-side and that one cannot. `ICONS` is
 * read with a property access — `ICONS.check` — and a server component cannot
 * read a property off a client module's namespace; it gets `undefined` and
 * React reports an invalid element type. Held here, in a module with no
 * directive on it, the table is a plain object whose values are the client
 * references `constants/glyphs.ts` produces: a server component reads one out
 * and passes it to `MPIcon` exactly as it would pass `CheckIcon`.
 *
 * Both halves therefore work from a server component, which is not something
 * either arrangement managed on its own. See `scripts/mark-client.mjs`.
 */
export * from './glyphs';

import {
  VisibilityIcon,
  VisibilityOffIcon,
  CloseIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SearchIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  MoreIcon,
  MenuIcon,
  LinkIcon,
  ExternalLinkIcon,
  CopyIcon,
  InfoIcon,
  SuccessIcon,
  WarningIcon,
  ErrorIcon,
  AddIcon,
  RemoveIcon,
  UploadIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  SpinnerIcon
} from './glyphs';

/**
 * The same glyphs, keyed by role.
 *
 * Kebab-case keys so a name can be carried in a prop, a config file or a
 * database column without a second spelling to translate.
 *
 * Importing this pulls in every glyph above — see the note at the top of the
 * file. Reach for the named exports when only one or two are needed.
 */
export const ICONS = {
  visibility: VisibilityIcon,
  'visibility-off': VisibilityOffIcon,
  close: CloseIcon,
  check: CheckIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'chevrons-left': ChevronsLeftIcon,
  'chevrons-right': ChevronsRightIcon,
  search: SearchIcon,
  'arrow-up': ArrowUpIcon,
  'arrow-down': ArrowDownIcon,
  'arrow-right': ArrowRightIcon,
  more: MoreIcon,
  menu: MenuIcon,
  link: LinkIcon,
  'external-link': ExternalLinkIcon,
  copy: CopyIcon,
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  add: AddIcon,
  remove: RemoveIcon,
  upload: UploadIcon,
  calendar: CalendarIcon,
  clock: ClockIcon,
  star: StarIcon,
  spinner: SpinnerIcon
} as const;

/** Every role name `ICONS` answers to. */
export type MPIconName = keyof typeof ICONS;
