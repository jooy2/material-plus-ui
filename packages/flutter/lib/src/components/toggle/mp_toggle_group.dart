/// A run of toggles that share one state.
library;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/toggle/mp_toggle.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/button_group.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/joined_run.dart';
import 'package:material_plus_ui/src/internal/roving.dart';
import 'package:material_plus_ui/src/internal/toggle_group.dart';
import 'package:material_plus_ui/src/types.dart';

/// A run of toggles that share one state.
///
/// ```dart
/// MPToggleGroup(
///   multiple: true,
///   value: marks,
///   onChanged: (List<String> next) => setState(() => marks = next),
///   semanticLabel: 'Text style',
///   children: const <Widget>[
///     MPToggle(value: 'bold', child: Text('Bold')),
///     MPToggle(value: 'italic', child: Text('Italic')),
///   ],
/// )
/// ```
///
/// Two things happen here and only one of them is visual. The corners that face
/// a neighbour are cut back to `small`, the same connected shape an
/// `MPButtonGroup` draws. The other half is that the **set owns the value**:
/// the toggles report into one list, [multiple] decides whether more than one
/// of them can be on, and [variant], [size], [color] and [disabled] are set
/// once here rather than on every toggle.
///
/// The value is a **list in both cases**, which is the one shape that does not
/// change type when [multiple] is turned on.
///
/// The set takes one focus stop, with the arrow keys moving it between the
/// toggles, which makes a toolbar of eight toggles two key presses deep
/// instead of eight. Enter and Space press the toggle holding the stop.
///
/// ## When this is the wrong component
///
/// When what is being chosen is a **value** rather than a state. A run of
/// toggles with [multiple] off is a one-of-a-set, and the two components that
/// say so properly are `MPSegmentedButton` and `MPRadioGroup`. A toggle group
/// is for a toolbar: bold, italic, underline; grid, snap, rulers.
class MPToggleGroup extends StatefulWidget {
  /// Creates a set of toggles.
  const MPToggleGroup({
    required this.children,
    this.value,
    this.initialValue = const <String>[],
    this.onChanged,
    this.multiple = false,
    this.orientation = MPOrientation.horizontal,
    this.variant,
    this.size,
    this.color,
    this.disabled,
    this.loopFocus = true,
    this.fullWidth = false,
    this.semanticLabel,
    super.key,
  });

  /// The toggles that make up the set. Each needs a `value` to be part of it.
  final List<Widget> children;

  /// Which toggles are on, by their `value`. Given, the set is controlled.
  final List<String>? value;

  /// Which start on, for a set that holds its own value.
  final List<String> initialValue;

  /// Called with every value that is on, whenever that changes.
  final ValueChanged<List<String>>? onChanged;

  /// Whether more than one may be on at a time. Off, turning one on turns the
  /// last one off.
  final bool multiple;

  /// Which way the toggles run, and which pair of arrow keys moves along them.
  final MPOrientation orientation;

  /// Passed to every toggle in the set. [MPVariant.outlined] when neither the
  /// set nor the toggle says.
  final MPVariant? variant;

  /// Passed to every toggle in the set.
  final MPSize? size;

  /// Passed to every toggle in the set.
  final MPColor? color;

  /// Disables every toggle in the set at once.
  final bool? disabled;

  /// Whether the arrow keys wrap round at the ends.
  final bool loopFocus;

  /// Stretches the set to its container and divides the space evenly between
  /// the toggles.
  final bool fullWidth;

  /// The set's name: "Text style", "Alignment".
  final String? semanticLabel;

  @override
  State<MPToggleGroup> createState() => _MPToggleGroupState();
}

class _MPToggleGroupState extends State<MPToggleGroup> with MPRovingStop<MPToggleGroup> {
  late List<String> _own = List<String>.of(widget.initialValue);

  /// The member the arrows or a press last put the stop on.
  int? _active;

  /// The member holding the focus, painted over its neighbours.
  int? _focused;

  @override
  FocusNode? get callerStop => null;

  List<String> get _value => widget.value ?? _own;

  bool get _disabled => (widget.disabled ?? false) || MPFieldsetScope.disabledOf(context);

  List<MPToggle?> get _members => widget.children.map(_toggleWithin).toList(growable: false);

  bool _reachable(MPToggle? toggle) {
    return toggle != null && toggle.value != null && !(toggle.disabled ?? _disabled);
  }

  /// Where the stop rests: where the arrows last left it, otherwise the first
  /// toggle that is on, otherwise the first that can be reached.
  int _stopIndex(List<MPToggle?> members) {
    final int? active = _active;

    if (active != null && active < members.length && _reachable(members[active])) {
      return active;
    }

    final int on = members.indexWhere(
      (MPToggle? toggle) => _reachable(toggle) && _value.contains(toggle!.value),
    );

    if (on >= 0) {
      return on;
    }

    final int first = members.indexWhere(_reachable);

    return first < 0 ? 0 : first;
  }

  void _toggle(String value) {
    final List<String> current = _value;
    final List<String> next;

    if (current.contains(value)) {
      next = current.where((String entry) => entry != value).toList(growable: false);
    } else if (widget.multiple) {
      next = <String>[...current, value];
    } else {
      // One of a set: turning one on turns whatever was on off.
      next = <String>[value];
    }

    if (widget.value == null) {
      setState(() => _own = next);
    }

    widget.onChanged?.call(next);
  }

  void _activate(int index) {
    if (_active != index) {
      keepStop(null);
      setState(() => _active = index);
    }
  }

  /// Moves the stop by [step], skipping what cannot be reached, and says
  /// whether it moved.
  bool _move(int step) {
    final List<MPToggle?> members = _members;
    final int count = members.length;

    if (count == 0) {
      return false;
    }

    int index = _stopIndex(members);

    for (int tried = 0; tried < count; tried += 1) {
      index += step;

      if (widget.loopFocus && !mpArrowsMoveFocus(context)) {
        index = (index + count) % count;
      } else if (index < 0 || index >= count) {
        return false;
      }

      if (_reachable(members[index])) {
        keepStop(null);
        setState(() => _active = index);

        return true;
      }
    }

    return false;
  }

  /// Puts the stop on the first or the last member that can be reached.
  bool _jump({required bool end}) {
    final List<MPToggle?> members = _members;
    final int index = end ? members.lastIndexWhere(_reachable) : members.indexWhere(_reachable);

    if (index < 0) {
      return false;
    }

    keepStop(null);
    setState(() => _active = index);

    return true;
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final bool horizontal = widget.orientation == MPOrientation.horizontal;
    final int forward = Directionality.of(context) == TextDirection.rtl ? -1 : 1;
    final LogicalKeyboardKey key = event.logicalKey;

    if (key == LogicalKeyboardKey.home) {
      return _jump(end: false) ? KeyEventResult.handled : KeyEventResult.ignored;
    }

    if (key == LogicalKeyboardKey.end) {
      return _jump(end: true) ? KeyEventResult.handled : KeyEventResult.ignored;
    }

    // Only the arrows along the run move the stop; the other two are left to
    // whatever is round the set.
    if (horizontal) {
      return switch (key) {
        LogicalKeyboardKey.arrowRight => mpArrowResult(context, moved: _move(forward)),
        LogicalKeyboardKey.arrowLeft => mpArrowResult(context, moved: _move(-forward)),
        _ => KeyEventResult.ignored,
      };
    }

    return switch (key) {
      LogicalKeyboardKey.arrowDown => mpArrowResult(context, moved: _move(1)),
      LogicalKeyboardKey.arrowUp => mpArrowResult(context, moved: _move(-1)),
      _ => KeyEventResult.ignored,
    };
  }

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

    return MPToggleGroupScope(
      value: _value,
      onToggle: _toggle,
      stopIndex: _stopIndex(_members),
      stop: stop,
      onActivate: _activate,
      child: Semantics(
        container: true,
        explicitChildNodes: true,
        label: widget.semanticLabel,
        child: Focus(
          canRequestFocus: false,
          skipTraversal: true,
          onKeyEvent: _onKey,
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
                  child: MPToggleGroupSlot(
                    index: index,
                    child: MPButtonGroupScope(
                      orientation: widget.orientation,
                      before: index > 0,
                      after: index < last,
                      variant: widget.variant,
                      size: widget.size,
                      color: widget.color,
                      disabled: widget.disabled,
                      child: widget.children[index],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The [MPToggle] inside [child], seen through the wrappers that only place a
/// widget, or `null` when there is none to see.
MPToggle? _toggleWithin(Widget child) {
  if (child is MPToggle) {
    return child;
  }

  if (child is KeyedSubtree) {
    return _toggleWithin(child.child);
  }

  if (child is SingleChildRenderObjectWidget && child.child != null) {
    return _toggleWithin(child.child!);
  }

  if (child is ProxyWidget) {
    return _toggleWithin(child.child);
  }

  return null;
}
