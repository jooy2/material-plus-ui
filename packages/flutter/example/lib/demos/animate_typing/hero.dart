import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `repeat`, `hold` and `erase` are what make it a loop: type, hold, delete,
/// type again. Without `erase` a repeat clears in one frame, which is right for
/// a line being replaced rather than rewritten.
class AnimateTypingHero extends StatelessWidget {
  const AnimateTypingHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: const MPBox(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            MPTypography('Search for', level: MPTypographyLevel.overline),
            MPAnimateTyping(
              text: 'anything you can name',
              speed: 16,
              repeat: null,
              erase: true,
              hold: Duration(milliseconds: 1600),
              style: TextStyle(fontSize: 20),
            ),
          ],
        ),
      ),
    );
  }
}
