/// What a touch platform puts round a text selection: the gestures that make
/// one, the drag handles under it, and the menu of Cut, Copy, Paste and Select
/// all above it.
///
/// Flutter's `TextField` gets these from Material and Cupertino. This package
/// imports neither, and an `EditableText` alone draws no handles and opens no
/// menu, so a long press on a phone did nothing and a reader had no way to
/// paste. The pieces the framework does supply in `widgets.dart` (the gesture
/// builder, the handle controls, the toolbar's layout delegate and iOS's own
/// system menu) are assembled here, and the handles and the menu are drawn in
/// Material Design 3's roles.
///
/// Every field that edits text builds its `EditableText` inside an
/// [MPTextSelectionArea] and hands it the [MPTextSelection] the area gives it:
///
/// ```dart
/// MPTextSelectionArea(
///   editableKey: _editor,
///   enabled: !disabled,
///   builder: (BuildContext context, MPTextSelection selection) {
///     return EditableText(
///       key: _editor,
///       // ...
///       selectionControls: selection.controls,
///       contextMenuBuilder: selection.contextMenuBuilder,
///       showSelectionHandles: selection.showHandles,
///       onSelectionChanged: selection.onSelectionChanged,
///       rendererIgnoresPointer: selection.rendererIgnoresPointer,
///     );
///   },
/// )
/// ```
///
/// On the web the browser's own menu stays in charge, as it does for every
/// Flutter text field there. None of this is exported from
/// `material_plus_ui.dart`.
library;

import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

/// What an [MPTextSelectionArea] hands the `EditableText` it wraps.
@immutable
class MPTextSelection {
  /// Creates the set. Only [MPTextSelectionArea] should need to.
  const MPTextSelection({
    required this.controls,
    required this.contextMenuBuilder,
    required this.showHandles,
    required this.onSelectionChanged,
    required this.rendererIgnoresPointer,
  });

  /// The drag handles, for `EditableText.selectionControls`.
  final TextSelectionControls? controls;

  /// The menu, for `EditableText.contextMenuBuilder`.
  final EditableTextContextMenuBuilder? contextMenuBuilder;

  /// Whether the handles are up, for `EditableText.showSelectionHandles`.
  final bool showHandles;

  /// For `EditableText.onSelectionChanged`: decides whether the handles show.
  final SelectionChangedCallback onSelectionChanged;

  /// For `EditableText.rendererIgnoresPointer`: `true` while the area's own
  /// gestures place the caret and make selections.
  final bool rendererIgnoresPointer;
}

/// Builds an `EditableText` with the selection gestures, handles and menu of a
/// touch platform round it.
///
/// [editableKey] must be the key the built `EditableText` carries, which is
/// how the gestures reach it. With [enabled] off the field keeps the framework's
/// own pointer handling and shows neither handles nor a menu, which is what a
/// disabled field wants.
class MPTextSelectionArea extends StatefulWidget {
  /// Wraps the editor [builder] returns.
  const MPTextSelectionArea({
    required this.editableKey,
    required this.builder,
    this.enabled = true,
    super.key,
  });

  /// The key on the `EditableText` that [builder] returns.
  final GlobalKey<EditableTextState> editableKey;

  /// Builds the editor from the [MPTextSelection] it is handed.
  final Widget Function(BuildContext context, MPTextSelection selection) builder;

  /// Whether selections can be made at all.
  final bool enabled;

  @override
  State<MPTextSelectionArea> createState() => _MPTextSelectionAreaState();
}

class _MPTextSelectionAreaState extends State<MPTextSelectionArea>
    implements TextSelectionGestureDetectorBuilderDelegate {
  late final TextSelectionGestureDetectorBuilder _gestures = TextSelectionGestureDetectorBuilder(
    delegate: this,
  );

  bool _showHandles = false;

  @override
  GlobalKey<EditableTextState> get editableTextKey => widget.editableKey;

  /// A firm press selects a word on iOS, as it does in a native field.
  @override
  bool get forcePressEnabled => defaultTargetPlatform == TargetPlatform.iOS;

  @override
  bool get selectionEnabled => _enabled;

  /// Material's rule for when the handles go up: after a long press or a
  /// stylus, or any selection made by touch in a field with text in it, and
  /// never after one made with the keyboard.
  bool _shouldShowHandles(SelectionChangedCause? cause) {
    final EditableText? editable = widget.editableKey.currentState?.widget;

    if (!_enabled || editable == null || !_gestures.shouldShowSelectionToolbar) {
      return false;
    }

    if (cause == SelectionChangedCause.keyboard) {
      return false;
    }

    if (editable.readOnly && editable.controller.selection.isCollapsed) {
      return false;
    }

    if (cause == SelectionChangedCause.longPress ||
        cause == SelectionChangedCause.stylusHandwriting) {
      return true;
    }

    return editable.controller.text.isNotEmpty;
  }

  void _onSelectionChanged(TextSelection selection, SelectionChangedCause? cause) {
    final bool show = _shouldShowHandles(cause);

    if (show != _showHandles) {
      setState(() => _showHandles = show);
    }
  }

  /// Whether there is anywhere to put the handles and the menu. An app always
  /// has an `Overlay`, from its `WidgetsApp`; a field put somewhere with none
  /// keeps the framework's own editing rather than asserting on the first tap.
  bool get _enabled => widget.enabled && Overlay.maybeOf(context) != null;

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final bool enabled = _enabled;
    final bool touch = switch (defaultTargetPlatform) {
      TargetPlatform.android || TargetPlatform.iOS || TargetPlatform.fuchsia => true,
      TargetPlatform.linux || TargetPlatform.macOS || TargetPlatform.windows => false,
    };

    final MPTextSelection selection = MPTextSelection(
      // A desktop has a pointer to drag with and no handles to give it, so the
      // controls there draw nothing and the menu opens on a right click.
      controls: enabled
          ? (touch ? MPTextSelectionControls(colors.primary) : _desktopControls)
          : null,
      contextMenuBuilder: enabled ? mpTextContextMenu : null,
      showHandles: enabled && _showHandles,
      onSelectionChanged: _onSelectionChanged,
      rendererIgnoresPointer: enabled,
    );

    final Widget editor = widget.builder(context, selection);

    if (!enabled) {
      return editor;
    }

    return _gestures.buildGestureDetector(behavior: HitTestBehavior.translucent, child: editor);
  }
}

/// The controls on a desktop: no handles, since a mouse selects by dragging.
final TextSelectionControls _desktopControls = _NoHandleControls();

class _NoHandleControls extends TextSelectionControls with TextSelectionHandleControls {
  @override
  Widget buildHandle(
    BuildContext context,
    TextSelectionHandleType type,
    double textLineHeight, [
    VoidCallback? onTap,
  ]) {
    return const SizedBox.shrink();
  }

  @override
  Offset getHandleAnchor(TextSelectionHandleType type, double textLineHeight) => Offset.zero;

  @override
  Size getHandleSize(double textLineHeight) => Size.zero;
}

/// Material's selection handles: a drop with one square corner, the corner
/// pointing at the end of the selection it holds, in the primary role.
class MPTextSelectionControls extends TextSelectionControls with TextSelectionHandleControls {
  /// Handles drawn in [color].
  MPTextSelectionControls(this.color);

  /// The handles' colour, `primary` as MD3 draws it.
  final Color color;

  /// The drop's size. Material's own, and larger than the glyph it marks so a
  /// finger can take hold of it.
  static const double size = 22;

  @override
  Widget buildHandle(
    BuildContext context,
    TextSelectionHandleType type,
    double textLineHeight, [
    VoidCallback? onTap,
  ]) {
    final Widget handle = SizedBox.square(
      dimension: size,
      child: CustomPaint(painter: _HandlePainter(color)),
    );

    // The drop is drawn with its square corner top-left, which is the right
    // end's: it hangs below the end of the selection and points back at it.
    final Widget shaped = switch (type) {
      TextSelectionHandleType.left => Transform.rotate(angle: math.pi / 2, child: handle),
      TextSelectionHandleType.right => handle,
      TextSelectionHandleType.collapsed => Transform.rotate(angle: math.pi / 4, child: handle),
    };

    return GestureDetector(behavior: HitTestBehavior.translucent, onTap: onTap, child: shaped);
  }

  @override
  Offset getHandleAnchor(TextSelectionHandleType type, double textLineHeight) {
    return switch (type) {
      TextSelectionHandleType.left => const Offset(size, 0),
      TextSelectionHandleType.right => Offset.zero,
      TextSelectionHandleType.collapsed => const Offset(size / 2, -4),
    };
  }

  @override
  Size getHandleSize(double textLineHeight) => const Size(size, size);

  // Equal by colour. An `EditableText` handed controls that are not `==` to
  // the last ones throws its selection overlay away and builds another, which
  // on every rebuild of the field would take the handles down with it.
  @override
  bool operator ==(Object other) => other is MPTextSelectionControls && other.color == color;

  @override
  int get hashCode => color.hashCode;
}

class _HandlePainter extends CustomPainter {
  const _HandlePainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()..color = color;
    final double radius = size.width / 2;

    canvas
      ..drawCircle(Offset(radius, radius), radius, paint)
      ..drawRect(Rect.fromLTWH(0, 0, radius, radius), paint);
  }

  @override
  bool shouldRepaint(_HandlePainter oldDelegate) => oldDelegate.color != color;
}

/// The menu above a selection: iOS's own where the system offers it, and
/// Material Design 3's everywhere else.
///
/// iOS 16 and later can show the system's edit menu for a Flutter field, which
/// is the menu a reader there expects, with Look Up and Translate in it, and
/// the one that does not ask permission to paste.
Widget mpTextContextMenu(BuildContext context, EditableTextState state) {
  if (SystemContextMenu.isSupported(context) && !state.widget.readOnly) {
    return SystemContextMenu.editableText(editableTextState: state);
  }

  // The menu is built in the app's `Overlay`, above everything the field sits
  // in, so it reads the theme and the language where the field is rather than
  // where it is drawn: a field in a dark section, or under a Korean
  // `MPLocaleProvider`, gets a menu that matches it.
  return MPTextSelectionToolbar(
    anchors: state.contextMenuAnchors,
    items: state.contextMenuButtonItems,
    theme: MPTheme.of(state.context),
    words: mpMessagesOf(state.context, mpTextSelectionMessages),
  );
}

/// Material Design 3's text selection menu: a row of text buttons on the
/// `surfaceContainer` tone at elevation 2, above the selection if it fits and
/// below it if not.
class MPTextSelectionToolbar extends StatelessWidget {
  /// A menu of [items] placed by [anchors], in [theme] and [words] when the
  /// field's own are given, and in the ones where it is built otherwise.
  const MPTextSelectionToolbar({
    required this.anchors,
    required this.items,
    this.theme,
    this.words,
    this.onDismiss,
    super.key,
  });

  /// Where the selection is, from `EditableTextState.contextMenuAnchors`.
  final TextSelectionToolbarAnchors anchors;

  /// What the menu offers, from `EditableTextState.contextMenuButtonItems`.
  final List<ContextMenuButtonItem> items;

  /// The field's theme.
  final MPThemeData? theme;

  /// The field's words for the buttons, from the `textSelection` namespace.
  final Map<String, String>? words;

  /// Called on a press outside the menu, for a menu its caller shows and takes
  /// down itself. A field's own menu leaves it out, since the field closes the
  /// menu when the selection or the focus moves.
  final VoidCallback? onDismiss;

  /// Between the menu and the edge of the screen, and above the selection.
  static const double _gap = 8;

  /// Below the selection, which clears a handle hanging under it.
  static const double _gapBelow = 20;

  /// The menu's height, a 40dp button.
  static const double _height = 40;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const SizedBox.shrink();
    }

    final MPThemeData theme = this.theme ?? MPTheme.of(context);
    final double top = MediaQuery.paddingOf(context).top + _gap;
    final Offset above = anchors.primaryAnchor - const Offset(0, _gap);
    final Offset below =
        (anchors.secondaryAnchor ?? anchors.primaryAnchor) + const Offset(0, _gapBelow);
    // The layout runs inside the padding, so the anchors move with it.
    final Offset inset = Offset(_gap, top);
    final Map<String, String> words = this.words ?? mpMessagesOf(context, mpTextSelectionMessages);

    return Padding(
      padding: EdgeInsets.fromLTRB(_gap, top, _gap, _gap),
      child: CustomSingleChildLayout(
        delegate: TextSelectionToolbarLayoutDelegate(
          anchorAbove: above - inset,
          anchorBelow: below - inset,
          fitsAbove: _height <= above.dy - top,
        ),
        child: _dismissible(
          DecoratedBox(
            decoration: BoxDecoration(
              color: theme.colors.surfaceContainer,
              borderRadius: BorderRadius.circular(theme.shapes.small),
              boxShadow: MPShadows.of(2),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(theme.shapes.small),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    for (final ContextMenuButtonItem item in items)
                      _MenuButton(
                        label: _labelOf(item, words),
                        onPressed: item.onPressed,
                        theme: theme,
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// [menu] in a region that hears a press outside it, around the menu itself
  /// rather than the layout, which fills the screen.
  Widget _dismissible(Widget menu) {
    final VoidCallback? dismiss = onDismiss;

    if (dismiss == null) {
      return menu;
    }

    return TapRegion(onTapOutside: (PointerDownEvent event) => dismiss(), child: menu);
  }

  static String _labelOf(ContextMenuButtonItem item, Map<String, String> words) {
    return item.label ??
        switch (item.type) {
          ContextMenuButtonType.cut => words['cut']!,
          ContextMenuButtonType.copy => words['copy']!,
          ContextMenuButtonType.paste => words['paste']!,
          ContextMenuButtonType.selectAll => words['selectAll']!,
          ContextMenuButtonType.delete => words['delete']!,
          ContextMenuButtonType.lookUp => words['lookUp']!,
          ContextMenuButtonType.searchWeb => words['searchWeb']!,
          ContextMenuButtonType.share => words['share']!,
          ContextMenuButtonType.liveTextInput => words['liveTextInput']!,
          ContextMenuButtonType.custom => '',
        };
  }
}

/// One entry of the menu, a text button in `onSurface`.
class _MenuButton extends StatelessWidget {
  const _MenuButton({required this.label, required this.onPressed, required this.theme});

  final String label;
  final VoidCallback? onPressed;
  final MPThemeData theme;

  @override
  Widget build(BuildContext context) {
    final Color ink = theme.colors.onSurface;

    // Out of the focus order: a button that took the focus would take it off
    // the field whose selection the menu acts on, and the field closes the
    // menu the moment it loses it.
    return ExcludeFocus(
      child: MPInteractive(
        onTap: onPressed,
        enabled: onPressed != null,
        builder: (BuildContext context, MPInteraction state) {
          return Semantics(
            button: true,
            label: label,
            onTap: onPressed,
            child: ExcludeSemantics(
              child: MPStateLayer(
                color: ink,
                opacity: mpStateLayerOpacity(state),
                child: Container(
                  height: MPTextSelectionToolbar._height,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  alignment: Alignment.center,
                  child: Text(label, maxLines: 1, style: theme.typescale.labelLarge.style(ink)),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
