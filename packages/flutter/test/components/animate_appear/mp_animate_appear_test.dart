import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_appear/mp_animate_appear.dart';
import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

List<double> _opacities(WidgetTester tester) {
  return tester
      .widgetList<MPAnimateOpacity>(
        find.descendant(of: find.byType(MPAnimateAppear), matching: find.byType(MPAnimateOpacity)),
      )
      .map((MPAnimateOpacity widget) => widget.opacity)
      .toList();
}

/// How far [text] is drawn from where it is laid out.
Offset _drift(WidgetTester tester, String text) {
  final Finder found = find.text(text);
  final RenderBox box = tester.renderObject<RenderBox>(found);
  final Element element = tester.element(found);
  final RenderBox slot = element.findAncestorRenderObjectOfType<RenderBox>()!;

  return box.localToGlobal(Offset.zero) - slot.localToGlobal(Offset.zero);
}

Future<void> _advance(WidgetTester tester, Duration time) async {
  const Duration frame = Duration(milliseconds: 10);

  for (Duration gone = Duration.zero; gone < time; gone += frame) {
    await tester.pump(frame);
  }
}

const List<Widget> _people = <Widget>[
  Text('Ada Lovelace'),
  Text('Grace Hopper'),
  Text('Alan Turing'),
];

void main() {
  testWidgets('animates each child, and nothing around them', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateAppear(children: _people)));

    // One per child: the effect is the set's, so the box has none of its own.
    expect(_opacities(tester), <double>[0, 0, 0]);

    await tester.pumpAndSettle();

    expect(_opacities(tester), <double>[1, 1, 1]);
  });

  testWidgets('holds each child back by its position, 80ms apart by default', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(const MPAnimateAppear(duration: Duration(milliseconds: 80), children: _people)),
    );
    await tester.pump();
    await _advance(tester, const Duration(milliseconds: 120));

    final List<double> opacities = _opacities(tester);

    expect(opacities[0], 1);
    expect(opacities[1], allOf(greaterThan(0), lessThan(1)));
    expect(opacities[2], 0);

    await tester.pumpAndSettle();
  });

  testWidgets('adds its own delay before the first step', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateAppear(
          delay: Duration(milliseconds: 300),
          duration: Duration(milliseconds: 80),
          children: _people,
        ),
      ),
    );
    await tester.pump();
    await _advance(tester, const Duration(milliseconds: 200));

    expect(_opacities(tester), <double>[0, 0, 0]);

    await tester.pumpAndSettle();
  });

  testWidgets('runs the list backwards', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateAppear(
          reverse: true,
          duration: Duration(milliseconds: 80),
          children: _people,
        ),
      ),
    );
    await tester.pump();
    await _advance(tester, const Duration(milliseconds: 100));

    final List<double> opacities = _opacities(tester);

    expect(opacities[0], 0);
    expect(opacities[2], 1);

    await tester.pumpAndSettle();
  });

  testWidgets('drifts a short way, not from off screen', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateAppear(children: _people)));

    expect(_drift(tester, 'Ada Lovelace'), const Offset(0, 12));

    await tester.pumpWidget(
      host(
        const MPAnimateAppear(key: Key('left'), from: MPSide.left, distance: 20, children: _people),
      ),
    );

    expect(_drift(tester, 'Ada Lovelace'), const Offset(-20, 0));

    await tester.pumpAndSettle();
  });

  testWidgets('still arrives all at once at a stagger of nought', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateAppear(stagger: Duration.zero, children: _people)));

    expect(_opacities(tester), hasLength(3));

    await tester.pump();
    await _advance(tester, const Duration(milliseconds: 200));

    final List<double> opacities = _opacities(tester);

    expect(opacities[0], opacities[2]);

    await tester.pumpAndSettle();
  });

  testWidgets('lays the children out where the builder puts them', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        MPAnimateAppear(
          layoutBuilder: (BuildContext context, List<Widget> children) {
            return Row(mainAxisSize: MainAxisSize.min, children: children);
          },
          children: _people,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(
      tester.getTopLeft(find.text('Ada Lovelace')).dy,
      tester.getTopLeft(find.text('Alan Turing')).dy,
    );
  });

  testWidgets('replays the whole set on a rise of `play`', (WidgetTester tester) async {
    Widget appear(bool play) {
      return host(MPAnimateAppear(trigger: MPAnimateTrigger.manual, play: play, children: _people));
    }

    await tester.pumpWidget(appear(false));
    await tester.pump(const Duration(seconds: 1));

    expect(_opacities(tester), <double>[0, 0, 0]);

    await tester.pumpWidget(appear(true));
    await tester.pumpAndSettle();

    expect(_opacities(tester), <double>[1, 1, 1]);

    await tester.pumpWidget(appear(false));
    await tester.pumpWidget(appear(true));

    expect(_opacities(tester), <double>[0, 0, 0]);

    await tester.pumpAndSettle();
  });

  testWidgets('is simply there under reduced motion', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateAppear(children: _people), disableAnimations: true),
    );

    expect(_opacities(tester), <double>[1, 1, 1]);
    expect(_drift(tester, 'Grace Hopper'), Offset.zero);
  });
}
