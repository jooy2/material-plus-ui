import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class OverlayHero extends StatefulWidget {
  const OverlayHero({super.key});

  @override
  State<OverlayHero> createState() => _OverlayHeroState();
}

class _OverlayHeroState extends State<OverlayHero> {
  bool _open = false;
  Timer? _done;

  @override
  void dispose() {
    _done?.cancel();
    super.dispose();
  }

  void _publish() {
    setState(() => _open = true);
    _done?.cancel();
    _done = Timer(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _open = false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        MPButton(onPressed: _publish, child: const Text('Publish')),
        MPOverlay(
          open: _open,
          label: 'Publishing',
          onOpenChange: (bool next) => setState(() => _open = next),
          child: const Column(
            mainAxisSize: MainAxisSize.min,
            spacing: 16,
            children: <Widget>[
              MPProgressCircular(size: MPSize.lg),
              MPTypography('Publishing your changes…'),
            ],
          ),
        ),
      ],
    );
  }
}
