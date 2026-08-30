/**
 * The one place `lucide-react` is imported.
 *
 * Every glyph the library's own components draw is named here and nowhere else,
 * so the whole of the icon set's surface — which icons are in use, and what this
 * project calls each of them — can be read in a single file rather than hunted
 * for across components.
 *
 * ## Why the names are not lucide's names
 *
 * The keys are the roles the components ask for (`visibility`), not the drawings
 * lucide happens to ship (`Eye`). A component asks for the idea, and the drawing
 * behind it can be swapped — or the whole set replaced — without touching a
 * component. It also keeps the vocabulary stable for a caller: the name
 * `visibility` is a promise, `Eye` is an implementation detail.
 *
 * ## Why this file is not `constants/icons.ts`
 *
 * It was, until the two halves turned out to need opposite answers about React
 * Server Components.
 *
 * These are components, and a component that will be handed to a client
 * component *as a prop* has to be a client reference — otherwise
 * `<MPIcon icon={CheckIcon} />` written in a server component fails with
 * *Functions cannot be passed directly to Client Components*, pointing at a
 * `forwardRef` object. `lucide-react` marks its `Icon` module and not its icons,
 * so ours are built on a server unless this file says otherwise. It does:
 * `scripts/mark-client.mjs` marks any module that hands on a value it imported
 * from another package, which is exactly what the lines below do.
 *
 * `ICONS` needs the opposite. Reading `.check` off a client module's namespace
 * is not something a server can do, so the table has to live in a module that
 * *is* server-side and hold the references this one produces. That module is
 * `constants/icons.ts`, it re-exports everything here, and it is still the only
 * name anything imports — components included.
 *
 * Adding a glyph means adding an import and a line here, and a line to the table
 * next door. Keep the set to what components actually draw: this file's cost is
 * paid by anyone who imports `ICONS`, and an icon nobody renders is bytes nobody
 * asked for.
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
  ChevronsLeft,
  ChevronsRight,
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
  Menu,
  Minus,
  Plus,
  Search,
  Star,
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
/** First, in a pager: the stepper that jumps to an end rather than by one. */
export const ChevronsLeftIcon = ChevronsLeft;
/** And last. */
export const ChevronsRightIcon = ChevronsRight;
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
/**
 * A score. Drawn as an outline, and filled by whatever is scoring with it —
 * lucide draws it `fill="none"`, and `MPRating` overlays a copy in `fill-current`
 * rather than shipping a second glyph.
 */
export const StarIcon = Star;
/** Work in progress, spun by whatever is waiting on it. */
export const SpinnerIcon = LoaderCircle;
/**
 * Three lines: the navigation a window has become too narrow to show.
 *
 * The one glyph in the set that is a picture of a *menu* rather than a picture
 * of what pressing it does, and it is here anyway. Thirty years of it have made
 * it the one shape a reader recognises with no word beside it, which is the only
 * argument that ever justifies a symbol — and `MPSidebarTrigger` gives it a
 * name for the readers it still says nothing to.
 */
export const MenuIcon = Menu;
