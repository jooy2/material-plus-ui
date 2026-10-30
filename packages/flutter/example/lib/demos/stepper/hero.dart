import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A rail, one panel, and the app's own Next and Back.
///
/// The stepper ships no navigation buttons on purpose: what *next* means is
/// whether the current step validates, and a library that drew them would
/// either have to guess that or ask for a validator per step.
///
/// Press a step you have already been to: going back is always allowed, and
/// so is returning to the furthest step you had reached.
class StepperHero extends StatefulWidget {
  const StepperHero({super.key});

  @override
  State<StepperHero> createState() => _StepperHeroState();
}

class _StepperHeroState extends State<StepperHero> {
  int _step = 0;
  String _email = '';
  String _card = '';

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 20,
      children: <Widget>[
        MPStepper(
          active: _step,
          onActiveChange: (int next) => setState(() => _step = next),
          children: <Widget>[
            MPStep(
              label: const Text('Account'),
              child: MPTextField(
                label: const Text('Email'),
                value: _email,
                onChanged: (String value) => setState(() => _email = value),
                fullWidth: true,
              ),
            ),
            MPStep(
              label: const Text('Payment'),
              description: const Text('Card or transfer'),
              child: MPTextField(
                label: const Text('Card number'),
                value: _card,
                onChanged: (String value) => setState(() => _card = value),
                fullWidth: true,
              ),
            ),
            const MPStep(
              label: Text('Done'),
              child: MPTypography('All set, nothing left to fill in.'),
            ),
          ],
        ),
        Row(
          spacing: 8,
          children: <Widget>[
            MPButton(
              variant: MPVariant.text,
              onPressed: _step == 0 ? null : () => setState(() => _step -= 1),
              child: const Text('Back'),
            ),
            MPButton(
              onPressed: _step == 2 ? null : () => setState(() => _step += 1),
              child: const Text('Next'),
            ),
          ],
        ),
      ],
    );
  }
}
