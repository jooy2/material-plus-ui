import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class SkeletonShapes extends StatelessWidget {
  const SkeletonShapes({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          MPSkeleton(lines: 2),
          MPSkeleton(shape: MPSkeletonShape.rect, height: 80),
          MPSkeleton(shape: MPSkeletonShape.circle),
        ],
      ),
    );
  }
}
