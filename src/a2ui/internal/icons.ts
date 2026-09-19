/**
 * The protocol's fifty-nine icon names, and the glyph each one draws here.
 *
 * A2UI fixes the vocabulary: an agent may ask for `shoppingCart` and may not ask
 * for anything else, because a name the client cannot draw is a hole in the
 * interface. So the whole list is written out, in the protocol's order, and
 * every entry resolves — there is no fallback glyph, because a fallback is how a
 * missing mapping survives review.
 *
 * ## Why these are not `constants/icons.ts`
 *
 * That file is the set the library's own components draw, and its own note asks
 * for it to stay that way: it is imported by everything, and a glyph nobody
 * renders is bytes every consumer carries. This set is the opposite shape. It is
 * fifty-nine glyphs that only a page rendering an agent's interface needs, and
 * an agent may ask for any one of them at any moment — so they cannot be split
 * and cannot be deferred. Holding them here keeps that cost inside
 * `material-plus-ui/a2ui`, where the project that opted into it pays it.
 *
 * ## Why the names do not line up
 *
 * A2UI names Material Symbols (`moreVert`, `locationOn`, `favoriteOff`) and this
 * library draws lucide, which names the *drawing* (`EllipsisVertical`, `MapPin`,
 * `HeartOff`). Neither set is a superset of the other, so a few entries are the
 * nearest honest drawing rather than the same one: `payment` is a credit card,
 * `stop` is a square, and `phone` is a handset where `call` is a receiver.
 */
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BellOff,
  Calendar,
  CalendarDays,
  Camera,
  Check,
  CircleAlert,
  CircleQuestionMark,
  CircleUser,
  CreditCard,
  Download,
  Ellipsis,
  EllipsisVertical,
  Eye,
  EyeOff,
  FastForward,
  Folder,
  Heart,
  HeartOff,
  House,
  Image,
  Info,
  Lock,
  LockOpen,
  Mail,
  MapPin,
  Menu,
  Paperclip,
  Pause,
  Pencil,
  Phone,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Rewind,
  Search,
  Send,
  Settings,
  Share2,
  ShoppingCart,
  SkipBack,
  SkipForward,
  Smartphone,
  Square,
  Star,
  StarHalf,
  StarOff,
  Trash2,
  TriangleAlert,
  Upload,
  User,
  Volume1,
  Volume2,
  VolumeOff,
  VolumeX,
  X
} from 'lucide-react';
import type { MPIconGlyph } from '../../types';

/** Every name the `Icon` component accepts, and what it draws. */
export const A2UI_ICONS: Record<string, MPIconGlyph> = {
  accountCircle: CircleUser,
  add: Plus,
  arrowBack: ArrowLeft,
  arrowForward: ArrowRight,
  attachFile: Paperclip,
  calendarToday: CalendarDays,
  call: Phone,
  camera: Camera,
  check: Check,
  close: X,
  delete: Trash2,
  download: Download,
  edit: Pencil,
  event: Calendar,
  error: CircleAlert,
  fastForward: FastForward,
  favorite: Heart,
  favoriteOff: HeartOff,
  folder: Folder,
  help: CircleQuestionMark,
  home: House,
  info: Info,
  locationOn: MapPin,
  lock: Lock,
  lockOpen: LockOpen,
  mail: Mail,
  menu: Menu,
  moreVert: EllipsisVertical,
  moreHoriz: Ellipsis,
  notificationsOff: BellOff,
  notifications: Bell,
  pause: Pause,
  payment: CreditCard,
  person: User,
  phone: Smartphone,
  photo: Image,
  play: Play,
  print: Printer,
  refresh: RefreshCw,
  rewind: Rewind,
  search: Search,
  send: Send,
  settings: Settings,
  share: Share2,
  shoppingCart: ShoppingCart,
  skipNext: SkipForward,
  skipPrevious: SkipBack,
  star: Star,
  starHalf: StarHalf,
  starOff: StarOff,
  stop: Square,
  upload: Upload,
  visibility: Eye,
  visibilityOff: EyeOff,
  volumeDown: Volume1,
  volumeMute: VolumeX,
  volumeOff: VolumeOff,
  volumeUp: Volume2,
  warning: TriangleAlert
};
