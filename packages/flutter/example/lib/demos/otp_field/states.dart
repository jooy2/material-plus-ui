import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// There is no `error` boolean: the message is what puts the field into its
/// error state. Type `000000` to see it.
class OtpFieldStates extends StatefulWidget {
  const OtpFieldStates({super.key});

  @override
  State<OtpFieldStates> createState() => _OtpFieldStatesState();
}

class _OtpFieldStatesState extends State<OtpFieldStates> {
  String _code = '000000';

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 24,
      children: <Widget>[
        MPOtpField(
          label: const Text('Verification code'),
          value: _code,
          onChanged: (String next) => setState(() => _code = next),
          errorMessage: _code == '000000' ? const Text('That code has expired.') : null,
        ),
        const MPOtpField(
          label: Text('Verification code'),
          initialValue: '4821',
          length: 4,
          disabled: true,
        ),
        const MPOtpField(label: Text('Recovery code'), initialValue: '931204', readOnly: true),
      ],
    );
  }
}
