import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class TimelineHero extends StatelessWidget {
  const TimelineHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 460),
      child: const MPTimeline(
        active: 2,
        children: <MPTimelineItem>[
          MPTimelineItem(
            title: Text('Ordered'),
            meta: Text('9 Aug, 09:14'),
            bullet: Text('1'),
            child: Text('Payment authorised.'),
          ),
          MPTimelineItem(
            title: Text('Packed'),
            meta: Text('9 Aug, 15:02'),
            bullet: Text('2'),
            child: Text('Left the warehouse in Incheon.'),
          ),
          MPTimelineItem(
            title: Text('In transit'),
            meta: Text('Now'),
            bullet: Text('3'),
            child: Text('Out for delivery, arriving today.'),
          ),
          MPTimelineItem(
            title: Text('Delivered'),
            bullet: Text('4'),
            connector: MPTimelineConnector.dashed,
          ),
        ],
      ),
    );
  }
}
