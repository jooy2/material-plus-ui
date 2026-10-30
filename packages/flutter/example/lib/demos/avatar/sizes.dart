import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class AvatarSizes extends StatelessWidget {
  const AvatarSizes({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        Wrap(
          spacing: 16,
          runSpacing: 16,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: <Widget>[
            for (final MPSize size in MPSize.values)
              MPAvatar(
                size: size,
                image: const NetworkImage('/samples/people/helen-voss.webp'),
                name: 'Helen Voss',
              ),
          ],
        ),
        Wrap(
          spacing: 16,
          runSpacing: 16,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: <Widget>[
            for (final MPSize size in MPSize.values) MPAvatar(size: size, name: 'Jane Doe'),
          ],
        ),
      ],
    );
  }
}
