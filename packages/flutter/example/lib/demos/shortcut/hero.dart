import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class ShortcutHero extends StatelessWidget {
  const ShortcutHero({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 380),
      child: DefaultTextStyle.merge(
        style: theme.typescale.bodyLarge.style(theme.colors.onSurface),
        child: const Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 14,
          children: <Widget>[
            _Row(
              label: 'Command palette',
              child: MPShortcut(keys: 'Mod+K', size: MPSize.sm),
            ),
            _Row(
              label: 'Save',
              child: MPShortcut(keys: 'Mod+S', size: MPSize.sm),
            ),
            _Row(
              label: 'Go to line',
              child: MPShortcut(keys: 'Mod+Shift+G', size: MPSize.sm),
            ),
            _Row(
              label: 'Close',
              child: MPShortcut(keys: 'Escape', size: MPSize.sm),
            ),
          ],
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.child});

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Row(
      spacing: 16,
      children: <Widget>[
        Expanded(child: Text(label)),
        child,
      ],
    );
  }
}
