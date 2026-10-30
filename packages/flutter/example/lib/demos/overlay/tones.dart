import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class OverlayTones extends StatefulWidget {
  const OverlayTones({super.key});

  @override
  State<OverlayTones> createState() => _OverlayTonesState();
}

class _OverlayTonesState extends State<OverlayTones> {
  MPOverlayTone? _tone;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: <Widget>[
        for (final MPOverlayTone tone in MPOverlayTone.values)
          MPButton(
            variant: MPVariant.outlined,
            size: MPSize.sm,
            onPressed: () => setState(() => _tone = tone),
            child: Text(tone.name),
          ),
        MPOverlay(
          open: _tone != null,
          onOpenChange: (bool next) {
            if (!next) {
              setState(() => _tone = null);
            }
          },
          tone: _tone ?? MPOverlayTone.scrim,
          label: '${_tone?.name} overlay',
          dismissible: true,
          child: const MPTypography('Click anywhere to close.', level: MPTypographyLevel.lead),
        ),
      ],
    );
  }
}
