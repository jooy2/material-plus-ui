import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class ImageFit extends StatefulWidget {
  const ImageFit({super.key});

  @override
  State<ImageFit> createState() => _ImageFitState();
}

class _ImageFitState extends State<ImageFit> {
  static const Map<String, MPImageFit> _fits = <String, MPImageFit>{
    'cover': MPImageFit.cover,
    'contain': MPImageFit.contain,
    'fill': MPImageFit.fill,
    'none': MPImageFit.none,
    'scale-down': MPImageFit.scaleDown,
  };

  List<String> _choice = <String>['contain'];

  @override
  Widget build(BuildContext context) {
    final MPImageFit fit = _fits[_choice.isEmpty ? 'cover' : _choice.first]!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        Align(
          alignment: AlignmentDirectional.centerStart,
          child: MPSegmentedButton(
            semanticLabel: 'Fit',
            value: _choice,
            onChanged: (List<String> next) => setState(() => _choice = next),
            items: <MPSegment>[
              for (final String name in _fits.keys) MPSegment(value: name, label: Text(name)),
            ],
          ),
        ),
        MPImage(
          image: const NetworkImage('/samples/photos/thumbs/lakeside-observatory-blue-hour.webp'),
          semanticLabel: 'A small lit observatory on the shore of a mountain lake at dusk',
          height: 360,
          fit: fit,
          letterbox: MPImageLetterbox(
            BoxDecoration(color: MPTheme.of(context).colors.surfaceContainerHighest),
          ),
        ),
      ],
    );
  }
}
