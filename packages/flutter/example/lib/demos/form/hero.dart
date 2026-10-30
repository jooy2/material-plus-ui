import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A submit collects every field's validity at once, and the focus lands on
/// the first one that failed, which is the part that has to be owned above the
/// fields.
///
/// `validationMode` is `onSubmit` by default, and on every change afterwards:
/// the only mode that does not tell somebody their email address is wrong while
/// they are still typing it.
class FormHero extends StatefulWidget {
  const FormHero({super.key});

  @override
  State<FormHero> createState() => _FormHeroState();
}

class _FormHeroState extends State<FormHero> {
  final GlobalKey<MPFormState> _form = GlobalKey<MPFormState>();
  String _email = '';
  String _name = '';
  String? _saved;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 360),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 12,
        children: <Widget>[
          MPForm(
            key: _form,
            onSubmit: (Map<String, Object?> values) {
              setState(() => _saved = '${values['email'] ?? ''}');
            },
            children: <Widget>[
              MPTextField(
                name: 'name',
                label: const Text('Name'),
                required: true,
                value: _name,
                onChanged: (String next) => setState(() => _name = next),
                fullWidth: true,
              ),
              MPTextField(
                name: 'email',
                type: MPTextFieldType.email,
                label: const Text('Email'),
                required: true,
                value: _email,
                onChanged: (String next) => setState(() => _email = next),
                fullWidth: true,
              ),
              MPButton(
                onPressed: () => _form.currentState!.submit(),
                fullWidth: true,
                child: const Text('Save'),
              ),
            ],
          ),
          if (_saved != null) MPTypography('Submitted $_saved.', level: MPTypographyLevel.caption),
        ],
      ),
    );
  }
}
