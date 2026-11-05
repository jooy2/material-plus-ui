import 'package:flutter/widgets.dart';
import 'package:material_plus_showcase/app/page.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<MPSelectOption> _teams = <MPSelectOption>[
  MPSelectOption(value: 'design', label: Text('Design')),
  MPSelectOption(value: 'engineering', label: Text('Engineering')),
  MPSelectOption(value: 'finance', label: Text('Finance')),
  MPSelectOption(value: 'support', label: Text('Support')),
];

const List<MPComboboxOption> _cities = <MPComboboxOption>[
  MPComboboxOption(value: 'lisbon', label: 'Lisbon'),
  MPComboboxOption(value: 'seoul', label: 'Seoul'),
  MPComboboxOption(value: 'tokyo', label: 'Tokyo'),
  MPComboboxOption(value: 'toronto', label: 'Toronto'),
  MPComboboxOption(value: 'nairobi', label: 'Nairobi'),
];

/// A travel request in three steps: who, where and when, and a last look.
class RequestScreen extends StatefulWidget {
  /// Creates the screen.
  const RequestScreen({super.key});

  @override
  State<RequestScreen> createState() => _RequestScreenState();
}

class _RequestScreenState extends State<RequestScreen> {
  final GlobalKey<MPFormState> _form = GlobalKey<MPFormState>();

  int _step = 0;
  String _name = '';
  String _email = '';
  MPSelectValue? _team;
  String _kind = 'client';
  MPComboboxValue? _city;
  DateTime? _departure;
  DateTime? _time;
  double? _nights = 3;
  List<double> _budget = <double>[1200];
  List<String> _seat = <String>['aisle'];
  List<MPFile> _files = <MPFile>[];
  bool _agree = false;
  bool _agreeMissing = false;
  bool _notify = true;
  double _rating = 0;
  String? _sent;

  void _next() {
    if (_step == 0 && !(_form.currentState?.submit() ?? false)) {
      return;
    }

    setState(() => _step += 1);
  }

  void _send() {
    if (!_agree) {
      setState(() => _agreeMissing = true);

      return;
    }

    setState(() => _sent = _name.trim());
    MPSnackbarProvider.of(context).add(MPSnackbarOptions(message: Text('Request sent for $_sent')));
  }

  Widget _who() {
    return MPForm(
      key: _form,
      children: <Widget>[
        MPTextField(
          name: 'name',
          label: const Text('Your name'),
          required: true,
          value: _name,
          onChanged: (String next) => setState(() => _name = next),
          fullWidth: true,
        ),
        MPTextField(
          name: 'email',
          type: MPTextFieldType.email,
          label: const Text('Work email'),
          value: _email,
          onChanged: (String next) => setState(() => _email = next),
          fullWidth: true,
        ),
        MPSelect(
          name: 'team',
          items: _teams,
          label: const Text('Team'),
          value: _team,
          onChanged: (MPSelectValue? next) => setState(() => _team = next),
          fullWidth: true,
        ),
        MPRadioGroup(
          label: const Text('Purpose'),
          value: _kind,
          onChanged: (String next) => setState(() => _kind = next),
          children: const <Widget>[
            MPRadio(value: 'client', label: Text('Meeting a client')),
            MPRadio(value: 'event', label: Text('Conference or event')),
            MPRadio(value: 'team', label: Text('Seeing the team')),
          ],
        ),
      ],
    );
  }

  Widget _where() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        MPCombobox(
          items: _cities,
          label: const Text('Destination'),
          value: _city,
          onChanged: (MPComboboxValue? next) => setState(() => _city = next),
          fullWidth: true,
        ),
        MPDatePicker(
          label: const Text('Departure'),
          placeholder: 'Pick a day',
          value: _departure,
          onChanged: (DateTime? next) => setState(() => _departure = next),
          minDate: DateTime(2026),
          fullWidth: true,
        ),
        MPTimePicker(
          label: const Text('Flight leaves at'),
          value: _time,
          onChanged: (DateTime? next) => setState(() => _time = next),
          fullWidth: true,
        ),
        MPNumberField(
          label: const Text('Nights'),
          value: _nights ?? double.nan,
          min: 1,
          max: 30,
          onChanged: (double? next) => setState(() => _nights = next),
          fullWidth: true,
        ),
        MPSlider(
          label: const Text('Budget'),
          value: _budget,
          min: 200,
          max: 5000,
          step: 100,
          showValue: true,
          onChanged: (List<double> next) => setState(() => _budget = next),
        ),
        MPToggleGroup(
          semanticLabel: 'Seat',
          value: _seat,
          onChanged: (List<String> next) => setState(() => _seat = next),
          children: const <Widget>[
            MPToggle(value: 'window', child: Text('Window')),
            MPToggle(value: 'aisle', child: Text('Aisle')),
            MPToggle(value: 'any', child: Text('Any')),
          ],
        ),
      ],
    );
  }

  Widget _review() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        MPDataList(
          dividers: true,
          children: <MPDataListItem>[
            MPDataListItem(
              label: const Text('Name'),
              child: Text(_name.isEmpty ? 'Not given' : _name),
            ),
            MPDataListItem(
              label: const Text('Destination'),
              child: Text(_city == null ? 'Not chosen' : '$_city'),
            ),
            MPDataListItem(
              label: const Text('Nights'),
              child: Text(_nights == null ? '-' : '${_nights!.round()}'),
            ),
            MPDataListItem(label: const Text('Budget'), child: Text('£${_budget.first.round()}')),
          ],
        ),
        MPFilePicker(
          label: const Text('Receipts and tickets'),
          multiple: true,
          value: _files,
          onFilesChanged: (List<MPFile> next) => setState(() => _files = next),
          onBrowse: () async => <MPFile>[
            MPFile(name: 'ticket-${_files.length + 1}.pdf', size: 184320),
          ],
        ),
        MPFieldset(
          legend: const Text('Before you send'),
          children: <Widget>[
            MPCheckbox(
              checked: _agree,
              onChanged: (bool next) => setState(() {
                _agree = next;
                _agreeMissing = false;
              }),
              label: const Text('I have read the travel policy'),
              errorMessage: _agreeMissing ? const Text('Agree to the travel policy first') : null,
            ),
            MPSwitch(
              checked: _notify,
              onChanged: (bool next) => setState(() => _notify = next),
              label: const Text('Tell my manager'),
            ),
          ],
        ),
        Row(
          spacing: 12,
          children: <Widget>[
            const Text('How easy was this?'),
            MPRating(value: _rating, onChanged: (double next) => setState(() => _rating = next)),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return ScreenScroll(
      title: 'Request',
      subtitle: 'Ask for a trip to be booked',
      children: <Widget>[
        MPCard(
          child: MPStepper(
            active: _step,
            onActiveChange: (int next) => setState(() => _step = next),
            children: <Widget>[
              MPStep(label: const Text('Who'), child: _who()),
              MPStep(label: const Text('Where'), child: _where()),
              MPStep(label: const Text('Review'), child: _review()),
            ],
          ),
        ),
        Row(
          spacing: 8,
          children: <Widget>[
            MPButton(
              variant: MPVariant.text,
              onPressed: _step == 0 ? null : () => setState(() => _step -= 1),
              child: const Text('Back'),
            ),
            const Spacer(),
            if (_step < 2)
              MPButton(onPressed: _next, child: const Text('Next'))
            else
              MPButton(onPressed: _send, child: const Text('Send request')),
          ],
        ),
        if (_sent != null) MPAlert(color: MPColor.primary, child: Text('Request sent for $_sent')),
      ],
    );
  }
}
