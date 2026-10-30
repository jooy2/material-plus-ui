import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class TextLinkUnderline extends StatelessWidget {
  const TextLinkUnderline({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return DefaultTextStyle.merge(
      style: theme.typescale.bodyLarge.style(theme.colors.onSurface),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: <Widget>[
          MPTextLink(onPressed: () {}, child: const Text('always — the default')),
          MPTextLink(
            underline: MPTextLinkUnderline.hover,
            onPressed: () {},
            child: const Text('hover — the line arrives with the pointer'),
          ),
          MPTextLink(
            underline: MPTextLinkUnderline.none,
            color: MPColor.primary,
            onPressed: () {},
            child: const Text('none — position or colour is saying what it is'),
          ),
        ],
      ),
    );
  }
}
