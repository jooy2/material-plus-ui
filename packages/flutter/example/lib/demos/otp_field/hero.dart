import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// One hidden value behind six slots. Paste spreads across the slots,
/// backspace steps back a box, and a phone can offer the code straight from the
/// message.
class OtpFieldHero extends StatefulWidget {
  const OtpFieldHero({super.key});

  @override
  State<OtpFieldHero> createState() => _OtpFieldHeroState();
}

class _OtpFieldHeroState extends State<OtpFieldHero> {
  String _code = '';
  bool _done = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 12,
      children: <Widget>[
        MPOtpField(
          label: const Text('Verification code'),
          description: const Text('We texted a six-digit code to your phone.'),
          value: _code,
          onChanged: (String next) => setState(() {
            _code = next;
            _done = false;
          }),
          onComplete: (String code) => setState(() => _done = true),
        ),
        if (_done) MPTypography('Checking “$_code”…', level: MPTypographyLevel.caption),
      ],
    );
  }
}
