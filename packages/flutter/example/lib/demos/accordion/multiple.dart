import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_data.dart';

class AccordionMultiple extends StatefulWidget {
  const AccordionMultiple({super.key});

  @override
  State<AccordionMultiple> createState() => _AccordionMultipleState();
}

class _AccordionMultipleState extends State<AccordionMultiple> {
  List<Object> _open = <Object>['network'];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: <Widget>[
          MPAccordion(
            multiple: true,
            value: _open,
            onChanged: (List<Object> open) => setState(() => _open = open),
            variant: MPVariant.text,
            dividers: false,
            size: MPSize.sm,
            children: const <Widget>[
              MPAccordionItem(
                value: 'network',
                title: Text('Network'),
                startIcon: MPIcon(icon: LinkGlyph(), size: 18),
                child: Text('Proxy, DNS and the two timeouts nobody has ever changed.'),
              ),
              MPAccordionItem(
                value: 'storage',
                title: Text('Storage'),
                startIcon: MPIcon(icon: UploadGlyph(), size: 18),
                child: Text('Where uploads land, and how long they stay there.'),
              ),
              MPAccordionItem(
                value: 'alerts',
                title: Text('Alerts'),
                startIcon: MPIcon(icon: InfoCircleGlyph(), size: 18),
                child: Text('Which of these are worth interrupting somebody for.'),
              ),
            ],
          ),
          MPTypography(
            'Open: ${_open.isEmpty ? 'nothing' : _open.join(', ')}',
            level: MPTypographyLevel.caption,
          ),
        ],
      ),
    );
  }
}
