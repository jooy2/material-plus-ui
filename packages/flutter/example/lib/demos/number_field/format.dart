import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The field shows a written number; the value stays a plain one.
///
/// `format` writes the box as `$1,240.00` while `onChanged` still hands over
/// `1240`, which is the whole reason it is a parameter rather than something a
/// caller does to `value` on the way in. Type into it: the separators and the
/// symbol come back on their own.
class NumberFieldFormat extends StatefulWidget {
  const NumberFieldFormat({super.key});

  @override
  State<NumberFieldFormat> createState() => _NumberFieldFormatState();
}

/// Thousands separated by commas, two decimal places, a dollar sign.
String _currency(double value) {
  final String fixed = value.abs().toStringAsFixed(2);
  final String whole = fixed
      .substring(0, fixed.length - 3)
      .replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (Match match) => '${match[1]},');

  return '${value < 0 ? '-' : ''}\$$whole${fixed.substring(fixed.length - 3)}';
}

/// A share written as a percentage, to one decimal place at most.
String _percent(double value) {
  final String fixed = (value * 100).toStringAsFixed(1);

  return '${fixed.endsWith('.0') ? fixed.substring(0, fixed.length - 2) : fixed}%';
}

/// What a percentage is typed as, read back as a share.
double? _readPercent(String text) {
  final String digits = text.replaceAll(RegExp(r'[^0-9.\-]'), '');
  final double? number = double.tryParse(digits);

  return number == null ? null : number / 100;
}

class _NumberFieldFormatState extends State<NumberFieldFormat> {
  double? _price = 1240;
  double? _share = 0.15;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 300),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          MPNumberField(
            label: const Text('Price'),
            value: _price,
            onChanged: (double? next) => setState(() => _price = next),
            format: _currency,
            step: 10,
            min: 0,
            fullWidth: true,
          ),
          MPNumberField(
            label: const Text('Commission'),
            value: _share,
            onChanged: (double? next) => setState(() => _share = next),
            format: _percent,
            parse: _readPercent,
            step: 0.01,
            min: 0,
            max: 1,
            fullWidth: true,
          ),
          MPTypography(
            'The values behind those are $_price and $_share.',
            level: MPTypographyLevel.caption,
          ),
        ],
      ),
    );
  }
}
