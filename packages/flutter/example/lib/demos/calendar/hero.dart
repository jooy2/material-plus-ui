import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The grid `MPDatePicker` opens, with nothing in front of it.
///
/// Press the month name or the year: any month of the year on screen is two
/// presses and any year at all is three. The arrow keys move a cell at a time
/// and step the month when they run off an edge, and `Tab` leaves the grid
/// rather than walking forty-two cells.
class CalendarHero extends StatefulWidget {
  const CalendarHero({super.key});

  @override
  State<CalendarHero> createState() => _CalendarHeroState();
}

class _CalendarHeroState extends State<CalendarHero> {
  DateTime? _day = DateTime.now();

  @override
  Widget build(BuildContext context) {
    return MPCalendar(value: _day, onChanged: (DateTime next) => setState(() => _day = next));
  }
}
