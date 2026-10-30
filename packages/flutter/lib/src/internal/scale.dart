/// The numbers the size ladder resolves to, shared by every component.
///
/// The React package's `internal/scale.ts` and `internal/density.ts`, in
/// logical pixels instead of Tailwind classes. A control at [MPSize.md] is 56px
/// in both packages because both read these tables, and a component that needs
/// a number not here reads the React component it ports rather than inventing
/// one.
library;

import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// A control's height: 32, 40, 56, 64, 72.
///
/// `md` is MD3's 56dp, the height of a text field and a large button. `sm` is
/// the 40dp of a standard button and `xs` the 32dp of a chip. `lg` and `xl` are
/// the library's own two rungs above the specification.
const Map<MPSize, double> mpControlHeight = <MPSize, double>{
  MPSize.xs: 32,
  MPSize.sm: 40,
  MPSize.md: 56,
  MPSize.lg: 64,
  MPSize.xl: 72,
};

/// The same heights with density taken out, `-1` to `-3`.
const Map<MPSize, List<double>> _controlHeightDense = <MPSize, List<double>>{
  MPSize.xs: <double>[28, 24, 24],
  MPSize.sm: <double>[36, 32, 28],
  MPSize.md: <double>[52, 48, 44],
  MPSize.lg: <double>[60, 56, 52],
  MPSize.xl: <double>[68, 64, 60],
};

/// A control's height at [size] with [density] taken out. Never under 24px.
double mpControlHeightOf(MPSize size, [MPDensity density = 0]) {
  final MPDensity step = mpClampDensity(density);

  return step == 0 ? mpControlHeight[size]! : _controlHeightDense[size]![-step - 1];
}

/// A control's label: `labelLarge` on the two small rungs, `titleMedium` from
/// `md` up, which is the role MD3 gives a 56dp control.
MPTypeRole mpControlText(MPTypescale scale, MPSize size) {
  return size == MPSize.xs || size == MPSize.sm ? scale.labelLarge : scale.titleMedium;
}

/// A control's inline padding.
const Map<MPSize, double> mpControlPadX = <MPSize, double>{
  MPSize.xs: 12,
  MPSize.sm: 16,
  MPSize.md: 24,
  MPSize.lg: 32,
  MPSize.xl: 40,
};

/// The gap between a control's icon and its label.
const Map<MPSize, double> mpControlGap = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 8,
  MPSize.md: 8,
  MPSize.lg: 10,
  MPSize.xl: 12,
};

/// A control's icon.
const Map<MPSize, double> mpControlIcon = <MPSize, double>{
  MPSize.xs: 16,
  MPSize.sm: 18,
  MPSize.md: 20,
  MPSize.lg: 22,
  MPSize.xl: 24,
};

/// Prose inside a component: `bodyMedium` on the two small rungs, `bodyLarge`
/// from `md` up.
MPTypeRole mpProseText(MPTypescale scale, MPSize size) {
  return size == MPSize.xs || size == MPSize.sm ? scale.bodyMedium : scale.bodyLarge;
}

/// The padding inside a sheet: a card, an alert, a dialog's body.
const Map<MPSize, double> mpSheetPad = <MPSize, double>{
  MPSize.xs: 10,
  MPSize.sm: 12,
  MPSize.md: 16,
  MPSize.lg: 20,
  MPSize.xl: 24,
};

const Map<MPSize, List<double>> _sheetPadDense = <MPSize, List<double>>{
  MPSize.xs: <double>[8, 6, 6],
  MPSize.sm: <double>[10, 8, 6],
  MPSize.md: <double>[14, 12, 10],
  MPSize.lg: <double>[18, 16, 14],
  MPSize.xl: <double>[22, 20, 18],
};

/// A sheet's padding at [size] with [density] taken out.
double mpSheetPadOf(MPSize size, [MPDensity density = 0]) {
  final MPDensity step = mpClampDensity(density);

  return step == 0 ? mpSheetPad[size]! : _sheetPadDense[size]![-step - 1];
}

/// A sheet's title: `titleSmall`, `titleSmall`, `titleMedium`, `titleLarge`,
/// `headlineSmall`.
MPTypeRole mpSheetTitle(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
    case MPSize.sm:
      return scale.titleSmall;
    case MPSize.md:
      return scale.titleMedium;
    case MPSize.lg:
      return scale.titleLarge;
    case MPSize.xl:
      return scale.headlineSmall;
  }
}

/// Between a sheet's stacked parts: a heading and the paragraph under it.
const Map<MPSize, double> mpSheetGap = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 8,
  MPSize.md: 12,
  MPSize.lg: 14,
  MPSize.xl: 16,
};

/// Between two lines that belong together: a label and its supporting text.
const Map<MPSize, double> mpStackGap = <MPSize, double>{
  MPSize.xs: 2,
  MPSize.sm: 2,
  MPSize.md: 4,
  MPSize.lg: 4,
  MPSize.xl: 6,
};

/// The focus indicator's stroke, as the React package's `outline-2`.
const double focusRingWidth = 2;

/// How far outside the control the focus indicator sits, as `outline-offset-2`.
///
/// MD3's rule: a ring drawn inside a filled button is a ring drawn on top of
/// the fill it is meant to be distinguishable from.
const double focusRingOffset = 2;
