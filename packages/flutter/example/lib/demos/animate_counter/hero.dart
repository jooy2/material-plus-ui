import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Three tiles, which is what a counter is nearly always for — and three
/// formats, because the pieces of a number are not in the same order
/// everywhere. The React demo asks `Intl` for the last two; here they are a
/// `format` each.
class AnimateCounterHero extends StatefulWidget {
  const AnimateCounterHero({super.key});

  @override
  State<AnimateCounterHero> createState() => _AnimateCounterHeroState();
}

class _AnimateCounterHeroState extends State<AnimateCounterHero> {
  bool _play = true;

  void _replay() {
    setState(() => _play = false);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        setState(() => _play = true);
      }
    });
  }

  /// Euros the way German writes them: `48.251 €`.
  static String _euros(double value) {
    final String digits = value.round().toString();
    final StringBuffer grouped = StringBuffer();

    for (int index = 0; index < digits.length; index += 1) {
      if (index > 0 && (digits.length - index) % 3 == 0) {
        grouped.write('.');
      }

      grouped.write(digits[index]);
    }

    return '$grouped €';
  }

  /// A share as a percentage to two places: `99.92%`.
  static String _percent(double value) => '${(value * 100).toStringAsFixed(2)}%';

  Widget _tile(BuildContext context, String label, Widget counter) {
    final MPThemeData theme = MPTheme.of(context);

    return MPBox(
      size: MPSize.sm,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          MPTypography(label, level: MPTypographyLevel.caption),
          // The `h3` role, which the counter's text takes from here.
          DefaultTextStyle.merge(
            style: theme.typescale.headlineMedium.style(theme.colors.onSurface),
            child: counter,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const Duration count = Duration(milliseconds: 1200);

    return Column(
      mainAxisSize: MainAxisSize.min,
      spacing: 24,
      children: <Widget>[
        Wrap(
          spacing: 16,
          runSpacing: 16,
          alignment: WrapAlignment.center,
          children: <Widget>[
            _tile(
              context,
              'Downloads',
              MPAnimateCounter(
                trigger: MPAnimateTrigger.manual,
                play: _play,
                value: 128400,
                duration: count,
              ),
            ),
            _tile(
              context,
              'Revenue',
              MPAnimateCounter(
                trigger: MPAnimateTrigger.manual,
                play: _play,
                value: 48250.5,
                duration: count,
                format: _euros,
              ),
            ),
            _tile(
              context,
              'Uptime',
              MPAnimateCounter(
                trigger: MPAnimateTrigger.manual,
                play: _play,
                value: 0.9992,
                duration: count,
                format: _percent,
              ),
            ),
          ],
        ),
        MPButton(variant: MPVariant.tonal, onPressed: _replay, child: const Text('Count again')),
      ],
    );
  }
}
