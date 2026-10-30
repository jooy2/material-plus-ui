import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class CarouselControlled extends StatefulWidget {
  const CarouselControlled({super.key});

  @override
  State<CarouselControlled> createState() => _CarouselControlledState();
}

class _CarouselControlledState extends State<CarouselControlled> {
  static const List<String> _cities = <String>['Seoul', 'Busan', 'Jeju'];

  int _index = 0;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 480),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: <Widget>[
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              for (int index = 0; index < _cities.length; index += 1)
                MPChip(
                  selected: index == _index,
                  onPressed: () => setState(() => _index = index),
                  child: Text(_cities[index]),
                ),
            ],
          ),
          MPCarousel(
            value: _index,
            onChanged: (int index) => setState(() => _index = index),
            loop: false,
            variant: MPVariant.filled,
            label: 'Cities',
            children: <Widget>[
              for (final String city in _cities)
                SizedBox(
                  height: 140,
                  child: Center(child: MPTypography(city, level: MPTypographyLevel.h4)),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
