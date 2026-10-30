import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The page margin, said once at the top of a page.
///
/// The rule around it is the preview's, not the widget's: a container paints
/// nothing at all, which is the whole reason it can be the outermost thing on
/// a page.
class ContainerHero extends StatelessWidget {
  const ContainerHero({super.key});

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: MPTheme.of(context).colors.outlineVariant),
      ),
      child: const SizedBox(
        width: double.infinity,
        child: MPContainer(
          maxWidth: MPResponsive<MPMeasure>(MPMeasure.sm),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              MPTypography('Held off the edge', level: MPTypographyLevel.h5, gutter: true),
              MPTypography(
                '16dp of margin at md, which is Material’s own compact margin, and a measure '
                'that stops the line getting wider than a medium window.',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
