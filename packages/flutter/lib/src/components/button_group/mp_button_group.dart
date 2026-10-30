/// A run of buttons that belong together.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/button_group.dart';
import 'package:material_plus_ui/src/internal/joined_run.dart';
import 'package:material_plus_ui/src/types.dart';

/// A run of buttons that belong together.
///
/// ```dart
/// MPButtonGroup(
///   variant: MPVariant.outlined,
///   semanticLabel: 'Alignment',
///   children: <Widget>[
///     MPButton(onPressed: alignLeft, child: const Text('Left')),
///     MPButton(onPressed: alignCenter, child: const Text('Centre')),
///     MPButton(onPressed: alignRight, child: const Text('Right')),
///   ],
/// )
/// ```
///
/// Two things happen here and only one of them is visual. The corners that face
/// a neighbour are cut back to `small`, MD3's connected button group, so the
/// row reads as one shape that has been divided rather than as three pills that
/// happen to be adjacent; the seam is a 2px gap. The other half is that
/// [variant], [size], [color] and [disabled] are set once for the set rather
/// than repeated on every button, which is the failure this exists to prevent:
/// a group where one button is a size out is not a group.
///
/// A button's own parameter still wins over the group's, and the group's wins
/// over an `MPConfigProvider`.
///
/// The buttons stay real buttons, and the group does not manage selection. For
/// one-of-a-set, reach for `MPSegmentedButton`: a row of buttons that remembers
/// which one was pressed is a radio group in a costume, and it is announced as
/// four unrelated actions.
class MPButtonGroup extends StatefulWidget {
  /// Creates a group of [children].
  const MPButtonGroup({
    required this.children,
    this.orientation = MPOrientation.horizontal,
    this.variant,
    this.size,
    this.color,
    this.disabled,
    this.fullWidth = false,
    this.semanticLabel,
    super.key,
  });

  /// The buttons, in order. Each one is a member of the run, joined to its
  /// neighbours.
  final List<Widget> children;

  /// Which way the buttons run.
  final MPOrientation orientation;

  /// Passed to every button in the group.
  final MPVariant? variant;

  /// Passed to every button in the group.
  final MPSize? size;

  /// Passed to every button in the group.
  final MPColor? color;

  /// Disables every button in the group at once.
  final bool? disabled;

  /// Stretches the group to its container and divides the space evenly between
  /// the buttons.
  final bool fullWidth;

  /// The group's name, worth setting whenever the run is a *set* rather than a
  /// row that happens to be adjacent: "Alignment", "Text style". A screen
  /// reader announces the group either way; the name is what makes crossing
  /// into it mean something.
  final String? semanticLabel;

  @override
  State<MPButtonGroup> createState() => _MPButtonGroupState();
}

class _MPButtonGroupState extends State<MPButtonGroup> {
  /// The member holding the focus, painted over its neighbours so its ring is
  /// not drawn under the next one.
  int? _focused;

  void _onFocus(int index, bool focused) {
    setState(() {
      if (focused) {
        _focused = index;
      } else if (_focused == index) {
        _focused = null;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final int last = widget.children.length - 1;

    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: widget.semanticLabel,
      child: MPJoinedRun(
        orientation: widget.orientation,
        fill: widget.fullWidth,
        raised: _focused,
        children: <Widget>[
          for (int index = 0; index <= last; index += 1)
            Focus(
              canRequestFocus: false,
              skipTraversal: true,
              includeSemantics: false,
              onFocusChange: (bool focused) => _onFocus(index, focused),
              child: MPButtonGroupScope(
                orientation: widget.orientation,
                // A run of one is joined to nothing, which keeps a group built
                // from a list that turned out to have one entry looking like
                // an ordinary button.
                before: index > 0,
                after: index < last,
                variant: widget.variant,
                size: widget.size,
                color: widget.color,
                disabled: widget.disabled,
                child: widget.children[index],
              ),
            ),
        ],
      ),
    );
  }
}
