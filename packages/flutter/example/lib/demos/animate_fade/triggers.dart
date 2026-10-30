import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The four triggers, and the one that matters most on a real page.
///
/// `visible` waits for the widget to be scrolled into view, which is the only
/// one that needs nothing from the caller and still runs at the moment a reader
/// arrives. `hover` starts again on every entry — and when the focus lands
/// inside it too, or the effect would be unreachable without a mouse.
///
/// `repeat: null` with `alternate` is what turns a one-way entrance into a
/// breath: every other pass runs backwards, so it returns instead of jumping.
class AnimateFadeTriggers extends StatelessWidget {
  const AnimateFadeTriggers({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: const Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 16,
        children: <Widget>[
          MPAnimateFade(
            trigger: MPAnimateTrigger.visible,
            once: false,
            threshold: 0.6,
            child: MPBox(child: MPTypography('Fades in whenever it is scrolled back into view.')),
          ),
          MPAnimateFade(
            trigger: MPAnimateTrigger.hover,
            from: 0.35,
            duration: Duration(milliseconds: 600),
            // A stop of its own in the tab order, as the React demo's
            // `tabIndex={0}` gives its box.
            child: Focus(child: MPBox(child: MPTypography('Point at this one, or tab to it.'))),
          ),
          MPAnimateFade(
            from: 0.4,
            repeat: null,
            alternate: true,
            duration: Duration(milliseconds: 1400),
            child: MPBox(child: MPTypography('A breath, rather than an arrival.')),
          ),
        ],
      ),
    );
  }
}
