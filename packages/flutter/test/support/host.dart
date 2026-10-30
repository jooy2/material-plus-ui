/// The tree a Material Plus widget is put under to be tested.
///
/// Deliberately no `MaterialApp` and no `WidgetsApp`: the package imports
/// neither Material nor Cupertino, so the tests must not either. A suite that
/// passes only inside a `MaterialApp` is not testing what a consumer of this
/// package gets.
///
/// A browser test can read a class name off an element; a widget test reads the
/// render tree. So `expect(element).toHaveClass('h-10')` becomes a measurement
/// of the laid-out box and `--p-fill` becomes the [BoxDecoration] the widget
/// actually built. The *questions* stay the same questions, which is the point:
/// the two packages are one design language, and a rule that holds in one of
/// them has to hold in the other.
library;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

/// Wraps [child] in the minimum a Material Plus widget needs: a direction to run in and
/// a brightness to read.
Widget host(
  Widget child, {
  Brightness brightness = Brightness.light,
  double? width,
  double? height,
  bool disableAnimations = false,
  bool overlay = false,
  TextDirection textDirection = TextDirection.ltr,
}) {
  final Widget body = Center(
    child: SizedBox(width: width, height: height, child: child),
  );

  return Directionality(
    textDirection: textDirection,
    child: MediaQuery(
      data: MediaQueryData(platformBrightness: brightness, disableAnimations: disableAnimations),
      // Anything that lifts itself out of the tree — a modal, an overlay — needs
      // somewhere to go, and in a real app that is the navigator's. A test that
      // asks for one gets the bare `Overlay` and nothing else, so the component
      // is still being tested without a `WidgetsApp` around it.
      child: overlay ? Overlay.wrap(child: body) : body,
    ),
  );
}

/// A page 400 tall that scrolls down, with [child] at its top and 1000 pixels
/// of page under it, so a jump of 600 takes [child] out of view and lands
/// inside the page, where nothing springs back.
Widget scrollingPage(ScrollController page, Widget child) {
  return host(
    SingleChildScrollView(
      controller: page,
      child: Column(children: <Widget>[child, const SizedBox(height: 1000)]),
    ),
    width: 300,
    height: 400,
  );
}

/// Draws the frames a widget takes to act on a scroll that has just moved it,
/// with no time passing: the frame that lays it out where the scroll left it
/// and measures it there, the one that builds it again with what that found,
/// and the one a ticker it stopped or started had already asked for.
Future<void> pumpScrolled(WidgetTester tester) async {
  await tester.pump();
  await tester.pump();
  await tester.pump();
}

/// Moves the clock on a minute without drawing a frame, and says whether
/// anything asked for one in that time: a ticker that is running, or a timer
/// that fired and changed something.
Future<bool> redrawsIn(WidgetTester tester) async {
  await tester.binding.delayed(const Duration(minutes: 1));

  return tester.binding.hasScheduledFrame;
}

/// Builds [widget] on the frame an app builds first: a warm-up frame, drawn
/// before the engine has stamped any, on which the frame clock still reads
/// zero.
///
/// `pumpWidget` stamps every frame it draws with the test's clock, so the
/// first frame it draws is not the one an app's first build is drawn on.
void pumpFirstFrame(WidgetTester tester, Widget widget) {
  tester.binding.attachRootWidget(tester.binding.wrapWithDefaultView(widget));
  tester.binding.handleBeginFrame(Duration.zero);
  tester.binding.handleDrawFrame();
}

/// Every [BoxDecoration] under [finder], outermost first.
///
/// A Material Plus surface is two boxes — the one carrying the drop shadows and the one
/// carrying the fill — plus whatever the component stacked on top. Asking for
/// them as a list rather than by index keeps a test that wants "the one with a
/// gradient" from having to know how many there are.
List<BoxDecoration> decorationsOf(WidgetTester tester, Finder finder) {
  return <BoxDecoration>[
    ...tester
        .widgetList<AnimatedContainer>(
          find.descendant(of: finder, matching: find.byType(AnimatedContainer), matchRoot: true),
        )
        .map((AnimatedContainer container) => container.decoration)
        .whereType<BoxDecoration>(),
    ...tester
        .widgetList<DecoratedBox>(
          find.descendant(of: finder, matching: find.byType(DecoratedBox), matchRoot: true),
        )
        .map((DecoratedBox box) => box.decoration)
        .whereType<BoxDecoration>(),
  ];
}

/// The first decoration under [finder] that [test] accepts.
BoxDecoration decorationWhere(
  WidgetTester tester,
  Finder finder,
  bool Function(BoxDecoration decoration) test,
) {
  return decorationsOf(tester, finder).firstWhere(test);
}

/// The semantics node a component built for itself.
///
/// Not `tester.getSemantics(find.byType(TheComponent))`, which walks *up* from
/// the component's own render object and lands on whatever node encloses it —
/// often the root. The node a component means is the one its own `Semantics`
/// created, and that is the first one inside it.
SemanticsNode semanticsOf(WidgetTester tester, Finder finder) {
  return tester.getSemantics(find.descendant(of: finder, matching: find.byType(Semantics)).first);
}

/// The `TextStyle` the text reading [data] was actually laid out with.
TextStyle styleOf(WidgetTester tester, String data) {
  return tester.renderObject<RenderParagraph>(find.text(data)).text.style!;
}

/// Puts [child] after a focus stop of its own and gives the tree the Tab key a
/// `WidgetsApp` would, so a test reaches [child] the way a keyboard reader does.
///
/// `autofocus` hides a whole kind of bug: a node that loses focus hands it back
/// to its scope, and an `autofocus` in the rebuilt tree takes it again at once.
/// Arriving by Tab from [before] is the case where losing it shows.
Widget afterFocusStop(FocusNode before, Widget child) {
  return Shortcuts(
    shortcuts: WidgetsApp.defaultShortcuts,
    child: Actions(
      actions: WidgetsApp.defaultActions,
      child: FocusScope(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Focus(focusNode: before, child: const SizedBox.square(dimension: 1)),
            child,
          ],
        ),
      ),
    ),
  );
}

/// [child] under the navigation [mode], with everything else the tree around it
/// says left as it is.
///
/// [NavigationMode.directional] is a remote's D-pad, where the arrow keys are
/// the only way from one control to the next.
Widget inNavigationMode(NavigationMode mode, Widget child) {
  return Builder(
    builder: (BuildContext context) => MediaQuery(
      data: MediaQuery.of(context).copyWith(navigationMode: mode),
      child: child,
    ),
  );
}

/// Whether the primary focus is on something inside [finder], or on it.
///
/// What a test checks before it presses a key and expects the key to be handed
/// on: with nothing focused, no key is handled by anyone.
bool holdsFocus(WidgetTester tester, Finder finder) {
  final BuildContext? focused = FocusManager.instance.primaryFocus?.context;

  if (focused is! Element) {
    return false;
  }

  final Element target = tester.element(finder);
  bool inside = identical(focused, target);

  focused.visitAncestorElements((Element ancestor) {
    inside = inside || identical(ancestor, target);

    return !inside;
  });

  return inside;
}

/// Runs [change] once the next frame has been built, and builds the tree again
/// at once, ahead of everything that frame's build put off until after it.
///
/// A widget that leaves part of its work until the frame is over has to cope
/// with being handed a new widget, or taken out of the tree, before that work
/// runs. Called before the frame is pumped, this queues [change] ahead of
/// anything the frame's build queues, so the tree has been built again with
/// [change] applied by the time any of that runs.
void rebuildBeforeDeferredWork(WidgetTester tester, VoidCallback change) {
  tester.binding.addPostFrameCallback((Duration _) {
    change();
    tester.binding.buildOwner!.buildScope(tester.binding.rootElement!);
    tester.binding.buildOwner!.finalizeTree();
  });
}

/// The first node on the semantics tree carrying [label], walked the same way
/// [semanticsLabels] walks it, so it reaches a layer lifted into an overlay.
SemanticsNode? semanticsNodeLabelled(WidgetTester tester, String label) {
  SemanticsNode? found;

  bool visit(SemanticsNode node) {
    if (node.label == label) {
      found = node;

      return false;
    }

    node.visitChildren(visit);

    return found == null;
  }

  tester.binding.renderViews.first.debugSemantics?.visitChildren(visit);

  return found;
}

/// Every label on the semantics tree, in tree order.
///
/// `find.semantics` does not reach a layer lifted through an `OverlayPortal`,
/// so a test about what a layer puts on the tree, or takes off it, walks the
/// tree itself.
List<String> semanticsLabels(WidgetTester tester) {
  final List<String> labels = <String>[];

  bool visit(SemanticsNode node) {
    if (node.label.isNotEmpty) {
      labels.add(node.label);
    }

    node.visitChildren(visit);

    return true;
  }

  tester.binding.renderViews.first.debugSemantics?.visitChildren(visit);

  return labels;
}

/// Every node on the semantics tree that says it is a text field, in tree order.
///
/// Walked the same way [semanticsLabels] walks it, so it reaches a layer lifted
/// into an overlay. A field is one of these, and a field that is two of them is
/// a stop that holds the name over a stop that holds the text.
List<SemanticsNode> semanticsTextFields(WidgetTester tester) {
  final List<SemanticsNode> fields = <SemanticsNode>[];

  bool visit(SemanticsNode node) {
    if (node.getSemanticsData().flagsCollection.isTextField) {
      fields.add(node);
    }

    node.visitChildren(visit);

    return true;
  }

  tester.binding.renderViews.first.debugSemantics?.visitChildren(visit);

  return fields;
}

/// The label of every node on the semantics tree that offers [action], in tree
/// order, and an empty string for a node with no name.
///
/// Walked the same way [semanticsLabels] walks it, so it reaches a layer lifted
/// into an overlay, which `find.semantics.byAction` does not.
List<String> semanticsLabelsWithAction(WidgetTester tester, SemanticsAction action) {
  final List<String> labels = <String>[];

  bool visit(SemanticsNode node) {
    if (node.getSemanticsData().hasAction(action)) {
      labels.add(node.label);
    }

    node.visitChildren(visit);

    return true;
  }

  tester.binding.renderViews.first.debugSemantics?.visitChildren(visit);

  return labels;
}
