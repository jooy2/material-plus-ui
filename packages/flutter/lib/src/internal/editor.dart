/// What a tap and a screen reader's focus do to a field built on an
/// [EditableText].
///
/// The editor answers neither on its own: its focus is kept off the semantics
/// tree, and a field's press on its shell excludes itself from it. So the
/// field's own node carries the two, answered as a Material `TextField` answers
/// them. The focus is the one that matters most: a screen reader on the web
/// moves the browser's focus onto the field's `<input>`, and that arrives as
/// nothing but a focus action.
///
/// The tap is also what a press on the field does. The editor asks for the
/// keyboard only when a press on its text moves the caret, and hears nothing of
/// a press round the text, or of any press on a field whose editor takes none.
/// [MPEditorPress] hears a press on the text, and the field's shell a press
/// round it.
library;

import 'dart:async';

import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/arrows.dart';

/// A tap on a field, from a screen reader or from a press on the field: a caret
/// at the end of the text if it has no selection yet, and the keyboard, which
/// brings the focus with it.
///
/// A field that holds the focus with its keyboard put away gets the keyboard
/// back, which a focus request alone would not do, and a caret already placed
/// stays where it is. A read-only field takes the focus and opens no keyboard.
void mpTapEditor(GlobalKey<EditableTextState> editor) {
  final EditableTextState? state = editor.currentState;

  if (state == null) {
    return;
  }

  final TextEditingController controller = state.widget.controller;

  if (!controller.selection.isValid) {
    controller.selection = TextSelection.collapsed(offset: controller.text.length);
  }

  state.requestKeyboard();
}

/// A screen reader moving the focus onto a field: the field takes it, or,
/// holding it already, gets back the keyboard the platform had put away, as it
/// does when the web closes its editing session under a focused field.
///
/// [focus] is how the field takes the focus, for a field that puts its caret
/// somewhere of its own as it does; a plain focus request otherwise.
void mpFocusEditor(GlobalKey<EditableTextState> editor, {VoidCallback? focus}) {
  final EditableTextState? state = editor.currentState;

  if (state == null) {
    return;
  }

  final FocusNode node = state.widget.focusNode;

  if (!node.hasFocus) {
    (focus ?? node.requestFocus)();
  } else if (!state.widget.readOnly) {
    state.requestKeyboard();
  }
}

/// Hears a press on an editor's text, which the editor answers with the
/// keyboard only when the press moves the caret, and calls [onPress] for it
/// once the editor has answered it.
///
/// It takes no part in deciding what the press was, so the editor still puts
/// the caret where the press landed and a long press still takes a word, and
/// the shell round the text, whose press loses to the editor's, never hears the
/// same press. A press counts when it is made with the primary button and ends
/// within [kTouchSlop] of where it went down, however long it was held; a drag
/// across the text does not.
class MPEditorPress extends StatefulWidget {
  /// Creates a listener for a press on the text of the editor in [child].
  const MPEditorPress({super.key, required this.onPress, required this.child});

  /// What a tap on the text does, usually [mpTapEditor], or `null` for
  /// nothing, as on a disabled field, whose editor then takes no press at all.
  final VoidCallback? onPress;

  /// The editor, and whatever is drawn in its place, such as a placeholder.
  final Widget child;

  @override
  State<MPEditorPress> createState() => _MPEditorPressState();
}

class _MPEditorPressState extends State<MPEditorPress> {
  /// Where the press went down, for as long as it can still be a tap.
  Offset? _pressedAt;

  void _down(PointerDownEvent event) {
    _pressedAt = event.buttons == kPrimaryButton ? event.position : null;
  }

  void _move(PointerMoveEvent event) {
    final Offset? at = _pressedAt;

    if (at != null && (event.position - at).distance > kTouchSlop) {
      _pressedAt = null;
    }
  }

  void _up(PointerUpEvent event) {
    if (_pressedAt == null) {
      return;
    }

    _pressedAt = null;

    // After the editor has answered the press, which it does as the arena is
    // swept once this event has reached every listener. Asked first, on a
    // field without the focus, the caret [mpTapEditor] puts at the end would
    // be one the press then finds already in place, and the editor answers a
    // press that changed nothing on such a field by building a selection
    // overlay.
    scheduleMicrotask(() {
      if (mounted) {
        widget.onPress?.call();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final bool live = widget.onPress != null;

    return Listener(
      onPointerDown: live ? _down : null,
      onPointerMove: live ? _move : null,
      onPointerUp: live ? _up : null,
      onPointerCancel: (PointerCancelEvent event) => _pressedAt = null,
      // A field nothing answers a press on, a disabled one, keeps the pointer
      // off its editor as well, which would otherwise take the press itself
      // and move the selection, as a React `<input disabled>` ignores a click.
      // In the tree either way, so the editor is not built again.
      child: IgnorePointer(ignoring: !live, child: widget.child),
    );
  }
}

/// An arrow key on a field under [NavigationMode.directional].
class _EditorArrowIntent extends Intent {
  const _EditorArrowIntent(this.direction);

  final TraversalDirection direction;
}

/// Answers an arrow only under [NavigationMode.directional]. Anywhere else it
/// is not there, and the key goes on to the editor's own caret keys.
class _EditorArrowAction extends MPArrowAction<_EditorArrowIntent> {
  _EditorArrowAction(super.context, {required super.onArrow});

  @override
  bool isEnabled(_EditorArrowIntent intent) => mpArrowsMoveFocus(context);
}

/// Lets the arrow keys take the focus off a field built on an [EditableText]
/// under [NavigationMode.directional], as an Android TV text box lets them.
///
/// A `WidgetsApp` turns every arrow into a caret move that the editor reports
/// handled, and its own arrow keys pass a text field over when they move the
/// focus, so on a remote, where the arrows are the only way from one control
/// to the next, a reader who reached a field could never leave it. Here, up
/// and down leave a field of one line, and left and right leave any field once
/// the caret is at the start or the end of the text the key points past. Any
/// other arrow moves the caret as it always has, and so does every arrow under
/// [NavigationMode.traditional].
///
/// Put right round the editor, nearer it than the app's caret keys. [vertical]
/// is `false` for a field that answers up and down itself: a number that
/// steps, a list that opens.
class MPEditorArrows extends StatelessWidget {
  /// Wraps the editor [editor] is the key of.
  const MPEditorArrows({
    required this.editor,
    required this.child,
    this.vertical = true,
    super.key,
  });

  /// The editor's key, which is where its text, its caret and its focus node
  /// are read.
  final GlobalKey<EditableTextState> editor;

  /// Whether up and down leave the field.
  final bool vertical;

  /// The editor.
  final Widget child;

  /// Moves the focus the way [intent] points, if the field lets it go that
  /// way, and says whether it moved.
  bool _leave(BuildContext context, _EditorArrowIntent intent) {
    final EditableTextState? state = editor.currentState;

    if (state == null) {
      return false;
    }

    final EditableText field = state.widget;
    final TraversalDirection direction = intent.direction;

    if (direction == TraversalDirection.up || direction == TraversalDirection.down) {
      // Up and down move between the lines of a field that has more than one.
      if (field.maxLines != 1) {
        return false;
      }
    } else {
      final TextSelection selection = field.controller.selection;
      final bool rtl = (field.textDirection ?? Directionality.of(context)) == TextDirection.rtl;
      // The arrow that points back through the text, which under RTL is the
      // right one.
      final bool back = (direction == TraversalDirection.left) != rtl;
      final int end = back ? 0 : field.controller.text.length;

      // A field with no caret yet is at either end.
      if (selection.isValid && (!selection.isCollapsed || selection.extentOffset != end)) {
        return false;
      }
    }

    return field.focusNode.focusInDirection(direction);
  }

  @override
  Widget build(BuildContext context) {
    return Shortcuts(
      shortcuts: <ShortcutActivator, Intent>{
        const SingleActivator(LogicalKeyboardKey.arrowLeft): const _EditorArrowIntent(
          TraversalDirection.left,
        ),
        const SingleActivator(LogicalKeyboardKey.arrowRight): const _EditorArrowIntent(
          TraversalDirection.right,
        ),
        if (vertical) ...<ShortcutActivator, Intent>{
          const SingleActivator(LogicalKeyboardKey.arrowUp): const _EditorArrowIntent(
            TraversalDirection.up,
          ),
          const SingleActivator(LogicalKeyboardKey.arrowDown): const _EditorArrowIntent(
            TraversalDirection.down,
          ),
        },
      },
      // Nothing to say: the node that can take the focus is the field's.
      includeSemantics: false,
      child: Actions(
        actions: <Type, Action<Intent>>{
          _EditorArrowIntent: _EditorArrowAction(
            context,
            onArrow: (_EditorArrowIntent intent) => _leave(context, intent),
          ),
        },
        child: child,
      ),
    );
  }
}

/// Hears every key pressed in the editor in [child] before anything round it
/// answers the key, and calls [onKey] for each one that is not a key a reader
/// presses to leave the field or to hold a modifier.
///
/// What puts a field's pointer light out: a key that moves a list's highlight
/// or submits the field is typing as much as a letter is, whoever answers it,
/// as the React field's `keydown` on its shell hears every key but those.
class MPEditorKeys extends StatelessWidget {
  /// Wraps the editor.
  const MPEditorKeys({required this.onKey, required this.child, super.key});

  /// Called for a key pressed or repeated in the editor.
  final VoidCallback onKey;

  /// The editor.
  final Widget child;

  /// The keys that leave the light on, as the React field's `leavingKeys`.
  static final Set<LogicalKeyboardKey> _leaving = <LogicalKeyboardKey>{
    LogicalKeyboardKey.tab,
    LogicalKeyboardKey.escape,
    LogicalKeyboardKey.shiftLeft,
    LogicalKeyboardKey.shiftRight,
    LogicalKeyboardKey.controlLeft,
    LogicalKeyboardKey.controlRight,
    LogicalKeyboardKey.altLeft,
    LogicalKeyboardKey.altRight,
    LogicalKeyboardKey.metaLeft,
    LogicalKeyboardKey.metaRight,
    LogicalKeyboardKey.capsLock,
  };

  @override
  Widget build(BuildContext context) {
    return Focus(
      // Not a stop, and nothing to say: it only listens.
      canRequestFocus: false,
      skipTraversal: true,
      includeSemantics: false,
      onKeyEvent: (FocusNode node, KeyEvent event) {
        if ((event is KeyDownEvent || event is KeyRepeatEvent) &&
            !_leaving.contains(event.logicalKey)) {
          onKey();
        }

        return KeyEventResult.ignored;
      },
      child: child,
    );
  }
}
