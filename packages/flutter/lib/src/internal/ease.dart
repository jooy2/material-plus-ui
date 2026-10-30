/// The curve a fold or a fade eases on, whichever way it runs.
///
/// It is not exported from `material_plus_ui.dart`.
library;

import 'package:flutter/animation.dart';

/// Hands [animation] [curve] for both of its directions.
///
/// A `CurvedAnimation` with no reverse curve reads its one curve backwards as
/// the parent runs back, so an ease-out open becomes an ease-in close: slow to
/// leave and then a snap. A CSS transition that runs back plays its timing
/// function forwards in time, and [Curve.flipped] is that, so a close covers as
/// much of the way at each moment as the open did at the same moment.
///
/// Both are set on every call rather than the reverse once, because the theme's
/// curve can change under a fold that is already on screen.
void easeBothWays(CurvedAnimation animation, Curve curve) {
  animation
    ..curve = curve
    ..reverseCurve = curve.flipped;
}
