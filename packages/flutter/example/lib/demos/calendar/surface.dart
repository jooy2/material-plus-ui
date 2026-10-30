import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `variant` decides how much surface the calendar paints under itself.
///
/// The default is `text`, nothing at all, because a standalone calendar
/// usually lands somewhere that is already a surface, and a default that
/// painted a second one would be a box inside a box. The other four are the
/// container ladder every box in this library shares.
class CalendarSurface extends StatelessWidget {
  const CalendarSurface({super.key});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 24,
      runSpacing: 24,
      children: <Widget>[
        for (final MPVariant variant in <MPVariant>[
          MPVariant.text,
          MPVariant.outlined,
          MPVariant.elevated,
        ])
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: 8,
            children: <Widget>[
              MPTypography(
                variant == MPVariant.text ? 'text — the default' : variant.name,
                level: MPTypographyLevel.overline,
              ),
              MPCalendar(variant: variant, size: MPSize.sm, initialValue: DateTime.now()),
            ],
          ),
      ],
    );
  }
}
