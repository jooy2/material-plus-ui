import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A sheet that opens beside the thing that opened it, and, unlike a tooltip,
/// one you can reach: it stays up until it is dismissed, and what is inside it
/// can be pressed and typed into.
class PopoverHero extends StatefulWidget {
  const PopoverHero({super.key});

  @override
  State<PopoverHero> createState() => _PopoverHeroState();
}

class _PopoverHeroState extends State<PopoverHero> {
  String _name = '';

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: <Widget>[
        MPPopover(
          trigger: (BuildContext context, VoidCallback toggle) =>
              MPButton(variant: MPVariant.outlined, onPressed: toggle, child: const Text('Rename')),
          title: const Text('Rename this view'),
          description: const Text('Only you will see it'),
          showClose: true,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: 12,
            children: <Widget>[
              MPTextField(
                label: const Text('Name'),
                value: _name,
                onChanged: (String value) => setState(() => _name = value),
                fullWidth: true,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                spacing: 8,
                children: <Widget>[
                  MPPopoverClose(
                    builder: (BuildContext context, VoidCallback close) => MPButton(
                      variant: MPVariant.text,
                      onPressed: close,
                      child: const Text('Cancel'),
                    ),
                  ),
                  MPPopoverClose(
                    builder: (BuildContext context, VoidCallback close) =>
                        MPButton(onPressed: close, child: const Text('Save')),
                  ),
                ],
              ),
            ],
          ),
        ),
        MPPopover(
          trigger: (BuildContext context, VoidCallback toggle) => MPButton(
            variant: MPVariant.text,
            onPressed: toggle,
            child: const Text('What is this?'),
          ),
          side: MPSide.right,
          arrow: true,
          size: MPSize.sm,
          child: const Text(
            'A popover can hold a paragraph too. The difference from a tooltip is that this one '
            'can be reached with the keyboard.',
          ),
        ),
      ],
    );
  }
}
