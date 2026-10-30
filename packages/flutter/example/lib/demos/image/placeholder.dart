import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const String _photo = '/samples/photos/forest-trail-sunbeams.webp';

class ImagePlaceholder extends StatefulWidget {
  const ImagePlaceholder({super.key});

  @override
  State<ImagePlaceholder> createState() => _ImagePlaceholderState();
}

class _ImagePlaceholderState extends State<ImagePlaceholder> {
  int _load = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        MPButton(
          size: MPSize.sm,
          variant: MPVariant.tonal,
          onPressed: () => setState(() => _load += 1),
          child: const Text('Load again'),
        ),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: MPImage(
            image: NetworkImage('$_photo?load=$_load'),
            semanticLabel:
                'A dirt trail through a forest of tall trees, with sunlight between the trunks',
            ratio: 3 / 2,
            placeholder: const MPImagePlaceholder(
              image: NetworkImage('/samples/photos/tiny/forest-trail-sunbeams.webp'),
              blur: 20,
            ),
          ),
        ),
      ],
    );
  }
}
