import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `groupSize` splits the row with a separator, and `charset` decides what may
/// be typed at all: anything rejected is dropped rather than shown.
class OtpFieldGrouping extends StatelessWidget {
  const OtpFieldGrouping({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 24,
      children: <Widget>[
        MPOtpField(label: Text('Two blocks of three'), length: 6, groupSize: 3),
        MPOtpField(
          label: Text('Licence key'),
          length: 8,
          groupSize: 4,
          charset: MPOtpFieldCharset.alphanumeric,
          separator: Text('—'),
          size: MPSize.sm,
        ),
        MPOtpField(label: Text('PIN'), length: 4, mask: true, size: MPSize.sm),
      ],
    );
  }
}
