import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class SkeletonHero extends StatelessWidget {
  const SkeletonHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          Row(
            spacing: 14,
            children: <Widget>[
              MPSkeleton(shape: MPSkeletonShape.circle),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  spacing: 8,
                  children: <Widget>[
                    FractionallySizedBox(
                      widthFactor: 0.55,
                      alignment: AlignmentDirectional.centerStart,
                      child: MPSkeleton(),
                    ),
                    FractionallySizedBox(
                      widthFactor: 0.35,
                      alignment: AlignmentDirectional.centerStart,
                      child: MPSkeleton(size: MPSize.sm),
                    ),
                  ],
                ),
              ),
            ],
          ),
          MPSkeleton(shape: MPSkeletonShape.rect, label: 'Loading the chart'),
          MPSkeleton(lines: 3),
        ],
      ),
    );
  }
}
