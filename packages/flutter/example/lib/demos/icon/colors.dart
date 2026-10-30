import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_display.dart';

class IconColors extends StatelessWidget {
  const IconColors({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final double caption = theme.typescale.bodySmall.size;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 24,
      children: <Widget>[
        // A colour named outright. Any colour works, including one of the
        // scheme's own roles, which is what keeps it right in both schemes
        // without the demo knowing which one it is in.
        Wrap(
          spacing: 24,
          runSpacing: 24,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: <Widget>[
            MPIcon(icon: const InfoGlyph(), size: 24, color: colors.primary, label: 'Info'),
            MPIcon(icon: const ErrorGlyph(), size: 24, color: colors.error, label: 'Failed'),
            MPIcon(
              icon: const WarningGlyph(),
              size: 24,
              color: colors.onSurfaceVariant,
              label: 'Careful',
            ),
            const MPIcon(icon: SuccessGlyph(), size: 24, color: Color(0xFF2E7D32), label: 'Done'),
          ],
        ),

        // No colour at all. The icon takes whatever the surrounding text is,
        // which is why both of these come out right without being told.
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          spacing: 12,
          children: <Widget>[
            _Line(
              color: colors.error,
              icon: MPIcon(icon: const WarningGlyph(), size: caption * 1.2),
              text: 'This certificate expires in three days.',
            ),
            _Line(
              color: colors.onSurfaceVariant,
              icon: MPIcon(icon: const InfoGlyph(), size: caption * 1.2),
              text: 'Renewal is automatic.',
            ),
          ],
        ),
      ],
    );
  }
}

/// A caption in one colour, with an icon that inherits it.
class _Line extends StatelessWidget {
  const _Line({required this.color, required this.icon, required this.text});

  final Color color;
  final Widget icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return DefaultTextStyle.merge(
      style: theme.typescale.bodySmall.style(color),
      child: IconTheme.merge(
        data: IconThemeData(color: color),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            icon,
            Flexible(child: Text(text)),
          ],
        ),
      ),
    );
  }
}
