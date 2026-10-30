import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class ImageRotate extends StatefulWidget {
  const ImageRotate({super.key});

  @override
  State<ImageRotate> createState() => _ImageRotateState();
}

class _ImageRotateState extends State<ImageRotate> {
  static const List<int> _turns = <int>[0, 90, 180, 270];
  static const Map<String, MPImageFlip> _flips = <String, MPImageFlip>{
    'none': MPImageFlip.none,
    'horizontal': MPImageFlip.horizontal,
    'vertical': MPImageFlip.vertical,
    'both': MPImageFlip.both,
  };

  List<String> _turn = <String>['90'];
  List<String> _mirror = <String>['none'];

  @override
  Widget build(BuildContext context) {
    final int rotate = int.parse(_turn.isEmpty ? '0' : _turn.first);
    final MPImageFlip flip = _flips[_mirror.isEmpty ? 'none' : _mirror.first]!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        MPSegmentedButton(
          semanticLabel: 'Rotate',
          value: _turn,
          onChanged: (List<String> next) => setState(() => _turn = next),
          items: <MPSegment>[
            for (final int degrees in _turns)
              MPSegment(value: '$degrees', label: Text('$degrees°')),
          ],
        ),
        MPSegmentedButton(
          semanticLabel: 'Flip',
          value: _mirror,
          onChanged: (List<String> next) => setState(() => _mirror = next),
          items: <MPSegment>[
            for (final String name in _flips.keys) MPSegment(value: name, label: Text(name)),
          ],
        ),
        SizedBox(
          width: 240,
          child: MPImage(
            image: const NetworkImage('/samples/photos/thumbs/rowboat-misty-pond-sunrise.webp'),
            previewImage: const NetworkImage('/samples/photos/rowboat-misty-pond-sunrise.webp'),
            semanticLabel: 'A rowboat on a still pond in morning mist',
            width: 480,
            height: 320,
            rotate: rotate,
            flip: flip,
            preview: true,
          ),
        ),
      ],
    );
  }
}
