/// Which window size class a widget is being drawn in.
///
/// The Dart half of the React package's `internal/window-class.ts`. There, the
/// stylesheet answers the question with a media query before anything runs,
/// and the JavaScript copy of the boundaries is only for the components that
/// have to decide in code. Here there is no stylesheet, so every responsive
/// parameter in the package is answered from this file.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/container/mp_responsive.dart';
import 'package:material_plus_ui/src/types.dart';

/// The window size class [context] is in.
///
/// Read off the **window**, through [MediaQuery], and not off the box the
/// widget was given, because that is what a window size class is: a grid three
/// cards deep changes shape at the same width as everything else on the
/// screen, exactly as a media query makes it in the React package. A widget
/// that wants its own box measured instead is a [LayoutBuilder]'s job, and
/// `MPPageLayout` is the one component here that asks that question.
///
/// The boundaries are MD3's unless an [MPConfigProvider] above moved them.
/// With no [MediaQuery] above at all the width reads as nothing, which is
/// [MPWindowClass.compact]: the arrangement every layout in the package is
/// written to fall back to.
MPWindowClass mpWindowClassOf(BuildContext context) {
  final double width = MediaQuery.maybeSizeOf(context)?.width ?? 0;

  return MPConfigProvider.of(context).windowClassOf(width);
}

/// Where each window size class begins at [context], in logical pixels:
/// MD3's, with whatever an [MPConfigProvider] moved written over them.
Map<MPWindowClass, double> mpWindowMinimumsOf(BuildContext context) {
  return MPConfigProvider.of(context).breakpoints;
}

/// How wide [maxWidth] lets content get at [context], in logical pixels.
///
/// The one function `MPContainer`, `MPHeader` and `MPFooter` share, and it is
/// shared for the reason the React package gives for its `measure.ts`: they are
/// the three that hold content to a width while the sheet around them spans the
/// window, and they have to agree about where that edge is or a bar and the
/// article under it line up at every width but one.
///
/// `null` and [MPMeasure.none] are both [double.infinity], no limit.
double mpMeasureOf(BuildContext context, MPResponsive<MPMeasure>? maxWidth) {
  if (maxWidth == null) {
    return double.infinity;
  }

  return maxWidth
      .resolve(mpWindowClassOf(context), MPMeasure.none)
      .resolve(mpWindowMinimumsOf(context));
}
