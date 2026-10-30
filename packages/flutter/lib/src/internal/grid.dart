/// The arithmetic `MPGrid` and `MPGridItem` share.
///
/// Like `internal/scales.dart` this is the library talking to itself. It is the
/// Dart half of the React package's `internal/grid.ts` **and** of the grid rules
/// in its `styles.css` — there is no stylesheet here, so the width a cell takes
/// is computed rather than declared, and this is where.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

/// One step of `spacing`, in logical pixels.
///
/// Tailwind's spacing scale, not Material's 8px one: `spacing: 4` is 16, which
/// is what `gap-4` means in the React package and what its padding tables
/// already use. A `rem` against a 16px root and a logical pixel are the same
/// length, so the two packages measure a gutter identically.
const double spacingStep = 4;

/// A gutter, as a length. Fractions are the point — `1.5` is 6.
double spacingValue(double units) => (units < 0 ? 0 : units) * spacingStep;

/// A count of columns.
///
/// Rounded and floored at 1 because the value ends up as a divisor: a grid of
/// 2.5 columns is not a thing anybody meant, and a grid of 0 is a division by
/// zero.
int columnCount(int value) => value < 1 ? 1 : value;

/// A span or an offset, clamped to the row.
///
/// A span wider than the row fills it rather than overflowing, which is what
/// the caller meant; an offset of nothing is meaningful and stays.
int columnUnits(int value, {required int min, required int columns}) {
  if (value < min) return min;

  return value > columns ? columns : value;
}

/// The width of one column plus one gutter.
///
/// The React package writes this as `calc((100% + gap) / columns)`, and it is
/// the same sentence: adding one gutter before dividing is what lets every cell
/// give one back, so a row of spans that add up to the column count is exactly
/// the width of the row.
double trackWidth({required double width, required double gap, required int columns}) {
  return (width + gap) / columns;
}
