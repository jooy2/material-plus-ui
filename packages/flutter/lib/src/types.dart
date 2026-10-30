/// The parameter vocabulary shared across Material Plus components.
///
/// The rule is the React package's: **where the specification already has a
/// word, use the specification's word.** A colour role is `primary` because
/// that is what MD3 calls it, a corner is `extraSmall`, a type role is
/// `bodyLarge`. Dart spells them in camelCase; the words are the same.
///
/// What lives here is only what more than one component needs in its
/// parameters. A type that belongs to one component lives beside it.
library;

/// The size ladder every control is drawn at.
///
/// **This is the one place the library goes beyond the specification,
/// knowingly.** Material defines a single size per component, because it is
/// describing a design system for whole products. A component library is used
/// in places a design system does not plan for: a filter bar, a table's inline
/// editor, a dense settings page, a marketing hero. Those need a ladder.
///
/// So [md] **is** the specification's size, and the other four are ours. It is
/// what you get by saying nothing, and nobody has to know the ladder exists to
/// be given the Material size.
enum MPSize {
  /// The smallest rung, at the edge of a 24px touch target.
  xs,

  /// One rung below the specification.
  sm,

  /// The specification's own size, and every component's default.
  md,

  /// One rung above it.
  lg,

  /// The largest rung.
  xl,
}

/// How tightly a component that holds other things is packed: `0`, `-1`, `-2`
/// or `-3`.
///
/// Material's own scale and Material's own numbers, written the way the React
/// package writes them (`density: -2` here, `density={-2}` there). `0` is the
/// component at the size it was asked for, and each step below takes 4dp out of
/// the **spacing only**: the type scale does not move, so a table at `-2` is the
/// same words in less room rather than smaller words.
///
/// Only containers take it. A button is one control at one height, and `size`
/// is the axis it has. A step that would take a control under 24px is not
/// taken; see [mpClampDensity].
typedef MPDensity = int;

/// Keeps [density] on Material's four steps, `0` to `-3`.
///
/// Clamping is the better of the three answers: refusing a value would make
/// `-4` an error, and honouring it would ship a control nobody can hit.
MPDensity mpClampDensity(MPDensity density) => density.clamp(-3, 0);

/// How far off the page a surface is lifted: `0` to `5`.
///
/// MD3's own levels. Each level names a surface tone as well as a shadow,
/// because MD3 treats the two as one decision: an elevated surface is
/// `surfaceContainerLow` **under** a level-1 shadow.
///
/// | `elevation` | Surface role              | Shadow  |
/// | ----------- | ------------------------- | ------- |
/// | `0`         | `surface`                 | none    |
/// | `1`         | `surfaceContainerLow`     | level 1 |
/// | `2`         | `surfaceContainer`        | level 2 |
/// | `3`         | `surfaceContainerHigh`    | level 3 |
/// | `4`         | `surfaceContainerHigh`    | level 4 |
/// | `5`         | `surfaceContainerHighest` | level 5 |
typedef MPElevation = int;

/// An accent colour role.
///
/// MD3's four, not Material UI's six: there is no `info`, `success` or
/// `warning` in the specification's colour system, and offering them would
/// promise roles the scheme has no way to derive.
enum MPColor {
  /// The main accent.
  primary,

  /// The secondary accent.
  secondary,

  /// The third accent, a hue turned away from the source colour.
  tertiary,

  /// The error family.
  error,
}

/// Where a reading changes colour.
///
/// A meter and a gauge are one quantity in two shapes, and a page carrying
/// both must not disagree about where the amber starts, so the thresholds are
/// one type both read. There is no `warning` in the specification, so an
/// amber band is `tertiary` under whatever source colour the page is themed
/// from.
class MPThreshold {
  /// The family [color] applies from [from] upward.
  const MPThreshold({required this.from, required this.color});

  /// The value from which this family applies, in the reading's own units.
  final double from;

  /// What the reading turns at and above that point.
  final MPColor color;
}

/// How much of a surface a component paints.
///
/// Material's own five button styles, in the order they get louder, and the
/// vocabulary is shared with the components that are not buttons: a `filled`
/// segmented button and a `filled` button are the same statement about
/// emphasis. A component that has no meaningful raised state simply does not
/// offer [elevated].
enum MPVariant {
  /// The accent, with its own ink on top. One per screen.
  filled,

  /// The accent's container tone, for the second-most-important action.
  tonal,

  /// A neutral surface that separates itself with a shadow instead of colour.
  elevated,

  /// A hairline and nothing else.
  outlined,

  /// A label.
  text,
}

/// Which way a set of controls runs.
enum MPOrientation {
  /// Along a row.
  horizontal,

  /// Down a column.
  vertical,
}

/// Where something sits along an axis.
///
/// [start] and [end] rather than left and right: the two words that name a
/// physical side swap meaning under right-to-left text.
enum MPAlign {
  /// The leading edge in the reading direction.
  start,

  /// The middle.
  center,

  /// The trailing edge in the reading direction.
  end,
}

/// Which side of an anchor something is drawn on.
///
/// These *are* physical sides, deliberately: a tooltip above its trigger is
/// above it in every writing direction.
enum MPSide {
  /// Above.
  top,

  /// To the right.
  right,

  /// Below.
  bottom,

  /// To the left.
  left,
}

/// Which corner of a box something is pinned to. Logical, for the reason
/// [MPAlign] is.
enum MPCorner {
  /// The top corner on the leading side.
  topStart,

  /// The top corner on the trailing side.
  topEnd,

  /// The bottom corner on the leading side.
  bottomStart,

  /// The bottom corner on the trailing side.
  bottomEnd,
}

/// How wide the window is, in Material's own words.
///
/// MD3 describes a layout in **window size classes** rather than pixels:
/// [compact] below 600dp, [medium] from 600, [expanded] from 840, [large] from
/// 1200 and [extraLarge] from 1600. They are the axis the specification's
/// layout grid changes along, so they are the axis this library's does too.
enum MPWindowClass {
  /// Below 600dp: a phone held upright.
  compact,

  /// From 600dp: a tablet held upright, a phone on its side.
  medium,

  /// From 840dp: a tablet on its side, a small laptop.
  expanded,

  /// From 1200dp: a desktop window.
  large,

  /// From 1600dp: a wide desktop window.
  extraLarge,
}

/// A day of the week, for the calendars' `weekStartsOn`.
///
/// Dart's own numbering, [DateTime.monday] (1) through [DateTime.sunday] (7),
/// so a comparison with `DateTime.weekday` needs no conversion.
enum MPWeekday {
  /// Monday.
  monday(DateTime.monday),

  /// Tuesday.
  tuesday(DateTime.tuesday),

  /// Wednesday.
  wednesday(DateTime.wednesday),

  /// Thursday.
  thursday(DateTime.thursday),

  /// Friday.
  friday(DateTime.friday),

  /// Saturday.
  saturday(DateTime.saturday),

  /// Sunday.
  sunday(DateTime.sunday);

  const MPWeekday(this.value);

  /// The day as [DateTime.weekday] counts it.
  final int value;
}
