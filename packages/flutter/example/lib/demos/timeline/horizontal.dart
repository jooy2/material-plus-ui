import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class TimelineHorizontal extends StatelessWidget {
  const TimelineHorizontal({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: double.infinity,
      child: MPTimeline(
        orientation: MPOrientation.horizontal,
        size: MPSize.sm,
        active: 1,
        children: <MPTimelineItem>[
          MPTimelineItem(title: Text('Cart'), bullet: Text('1')),
          MPTimelineItem(title: Text('Address'), bullet: Text('2')),
          MPTimelineItem(title: Text('Payment'), bullet: Text('3')),
        ],
      ),
    );
  }
}
