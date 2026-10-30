/// Which band a reading has landed in.
///
/// One rule, shared by the two widgets that draw a value against a scale a
/// caller described: [MPMeter]'s bar and `MPGaugeChart`'s arc. Written twice
/// they would drift, and a quota that turns `danger` on a bar but not on the
/// dial beside it is a dashboard that contradicts itself.
///
/// It is not exported from `material_plus_ui.dart`.
library;

import 'package:material_plus_ui/src/types.dart';

/// The family a value lands in.
///
/// The highest band at or below the value, or [color] when the value is under
/// all of them. A single pass rather than a sort, because the list is small and
/// sorting a caller's list — or a copy of it on every build — buys nothing.
/// Reading it rather than walking it in order is also what makes the prop
/// order-independent, which is what a caller assumes.
MPColor bandColor(double value, MPColor color, List<MPThreshold>? thresholds) {
  if (thresholds == null || thresholds.isEmpty) {
    return color;
  }

  MPThreshold? best;

  for (final MPThreshold threshold in thresholds) {
    if (value >= threshold.from && (best == null || threshold.from > best.from)) {
      best = threshold;
    }
  }

  return best?.color ?? color;
}

/// The family a value lands in, read the way the React package's
/// `thresholdColor` reads it: the last threshold in the list that the value
/// has reached, or [color] when it has reached none.
///
/// A scan rather than a sort, so the list is read in the order it was given.
/// Thresholds are meant to be listed smallest first, and quietly reordering
/// them would hide the one call site that did not; for a list in that order it
/// agrees with [bandColor]. `MPMeter` reads this one, so a meter and its React
/// twin turn the same colour for the same list.
MPColor thresholdColor(double value, MPColor color, List<MPThreshold>? thresholds) {
  if (thresholds == null || thresholds.isEmpty) {
    return color;
  }

  MPColor current = color;

  for (final MPThreshold threshold in thresholds) {
    if (value >= threshold.from) {
      current = threshold.color;
    }
  }

  return current;
}
