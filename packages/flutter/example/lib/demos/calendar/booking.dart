import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The shape the component exists for: a page that shows the month it is
/// talking about instead of asking the reader to open something to see it.
///
/// `minDate` closes the past and `shouldDisableDate` closes the Sundays. Both
/// are *marked* rather than removed: a grid with holes in it is a grid a
/// reader arrowing across a month falls into.
class CalendarBooking extends StatefulWidget {
  const CalendarBooking({super.key});

  @override
  State<CalendarBooking> createState() => _CalendarBookingState();
}

class _CalendarBookingState extends State<CalendarBooking> {
  DateTime? _day;

  @override
  Widget build(BuildContext context) {
    final DateTime? day = _day;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 12,
      children: <Widget>[
        MPCalendar(
          variant: MPVariant.outlined,
          value: day,
          onChanged: (DateTime next) => setState(() => _day = next),
          minDate: DateTime.now(),
          shouldDisableDate: (DateTime date) => date.weekday == DateTime.sunday,
        ),
        MPTypography(
          day == null
              ? 'Closed on Sundays. Pick a day.'
              : 'Booked for ${day.month}/${day.day}/${day.year}',
          level: MPTypographyLevel.caption,
        ),
      ],
    );
  }
}
