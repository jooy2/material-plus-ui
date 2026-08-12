/**
 * The one place `lucide-react` is imported.
 *
 * Every glyph the library's own components draw is named here and nowhere else,
 * so the whole of the icon set's surface — which icons are in use, and what
 * this project calls each of them — can be read in a single file rather than
 * hunted for across components.
 *
 * ## Why the names are not lucide's names
 *
 * The keys are the roles the components ask for (`visibility`), not the
 * drawings lucide happens to ship (`Eye`). A component asks for the idea, and
 * the drawing behind it can be swapped — or the whole set replaced — without
 * touching a component. It also keeps the vocabulary stable for a caller: the
 * name `visibility` is a promise, `Eye` is an implementation detail.
 *
 * ## Two ways out of this file, and why
 *
 * - **The named exports** (`VisibilityIcon`, …) are what the library's own
 *   components import. A named import of one export lets a bundler drop every
 *   other binding in this module, so a project that only uses `MPTextField`
 *   ships two glyphs rather than all of them.
 * - **`ICONS`** is the same set as a lookup table, for an application that
 *   wants a name-keyed registry of its own — `<MPIcon icon={ICONS.close} />`.
 *   An object literal cannot be tree-shaken property by property, so importing
 *   it pulls in every glyph listed below. That is the trade it exists to make,
 *   and it is why the components never reach for it.
 *
 * Adding a glyph means adding an import and a line to both lists. Keep the set
 * to what components actually draw: this file's cost is paid by anyone who
 * imports `ICONS`, and an icon nobody renders is bytes nobody asked for.
 */
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  Clock,
  Copy,
  Ellipsis,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Link,
  LoaderCircle,
  Minus,
  Plus,
  Search,
  TriangleAlert,
  Upload,
  X
} from 'lucide-react';

/** The glyph a password field shows while the password is legible. */
export const VisibilityIcon = Eye;
/** The glyph a password field shows while the password is masked. */
export const VisibilityOffIcon = EyeOff;
/** Dismiss: a chip, a dialog, an alert. */
export const CloseIcon = X;
/** A ticked option, a completed step. */
export const CheckIcon = Check;
/** Disclosure, pointing down. */
export const ChevronDownIcon = ChevronDown;
/** Disclosure, pointing up. */
export const ChevronUpIcon = ChevronUp;
/** Previous, in a pager or a carousel. */
export const ChevronLeftIcon = ChevronLeft;
/** Next, in a pager or a carousel. */
export const ChevronRightIcon = ChevronRight;
/** Search, for a field's leading adornment. */
export const SearchIcon = Search;
/** Sorted ascending: the arrow a table's sorted column carries. */
export const ArrowUpIcon = ArrowUp;
/** Sorted descending. */
export const ArrowDownIcon = ArrowDown;
/** And then: the mark a breadcrumb can put between two steps. */
export const ArrowRightIcon = ArrowRight;
/** The trail a breadcrumb hides behind, and any other "there is more here". */
export const MoreIcon = Ellipsis;
/** A link that goes somewhere on this site. */
export const LinkIcon = Link;
/** A link that takes over the window. */
export const ExternalLinkIcon = ExternalLink;
/** Copy to clipboard. */
export const CopyIcon = Copy;
/** Severity: something worth knowing. */
export const InfoIcon = Info;
/** Severity: it worked. */
export const SuccessIcon = CircleCheck;
/** Severity: proceed carefully. */
export const WarningIcon = TriangleAlert;
/** Severity: it did not work. */
export const ErrorIcon = CircleAlert;
/** One step up: a number field's increment. */
export const AddIcon = Plus;
/** One step down: a number field's decrement, and a half-ticked checkbox. */
export const RemoveIcon = Minus;
/** Send a file the other way. A file picker's dropzone. */
export const UploadIcon = Upload;
/** A day on a calendar: what a date picker's trigger wears. */
export const CalendarIcon = CalendarDays;
/** A time of day: what a time picker's trigger wears. */
export const ClockIcon = Clock;
/** Work in progress, spun by whatever is waiting on it. */
export const SpinnerIcon = LoaderCircle;

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
  search: SearchIcon,
  'arrow-up': ArrowUpIcon,
  'arrow-down': ArrowDownIcon,
  'arrow-right': ArrowRightIcon,
  more: MoreIcon,
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
  spinner: SpinnerIcon
} as const;

/** Every role name `ICONS` answers to. */
export type MPIconName = keyof typeof ICONS;
