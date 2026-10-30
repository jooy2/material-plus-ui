import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/container/mp_responsive.dart';
import 'package:material_plus_ui/src/components/grid/mp_grid.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite measures the items a browser laid out in a 1200px box. Here
/// the box is the frame `host` draws, and the items are measured the same way.

/// A cell that is a key and a height, so its laid-out box can be found.
Widget _cell(String name, {double height = 20}) => SizedBox(key: Key(name), height: height);

Rect _rectOf(WidgetTester tester, String name) => tester.getRect(find.byKey(Key(name)));

double _widthOf(WidgetTester tester, String name) => _rectOf(tester, name).width;

/// Where [name] starts, measured from the grid's leading edge.
double _startOf(WidgetTester tester, String name) {
  return _rectOf(tester, name).left - tester.getTopLeft(find.byType(MPGrid)).dx;
}

/// A screen wide enough for the large window classes.
void _widen(WidgetTester tester) {
  tester.view
    ..physicalSize = const Size(2400, 1200)
    ..devicePixelRatio = 1;
  addTearDown(tester.view.reset);
}

/// [child] in a window [width] wide, drawn [width] wide.
Widget _inWindow(double width, Widget child) {
  return host(
    width: width,
    MediaQuery(
      data: MediaQueryData(size: Size(width, 900)),
      child: child,
    ),
  );
}

MPResponsive<MPGridSpan> _span(int columns) => MPResponsive<MPGridSpan>(MPGridSpan(columns));

const MPResponsive<double> _noGap = MPResponsive<double>(0);

void main() {
  testWidgets('renders what it was handed', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(width: 400, const MPGrid(children: <Widget>[MPGridItem(child: Text('Cell'))])),
    );

    expect(find.text('Cell'), findsOneWidget);
  });

  testWidgets('divides the row by the column count it was given', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 1200,
        MPGrid(
          spacing: _noGap,
          children: <Widget>[MPGridItem(span: _span(6), child: _cell('half'))],
        ),
      ),
    );
    _widen(tester);
    await tester.pumpWidget(
      host(
        width: 1200,
        MPGrid(
          spacing: _noGap,
          children: <Widget>[MPGridItem(span: _span(6), child: _cell('half'))],
        ),
      ),
    );

    expect(_widthOf(tester, 'half'), 600);
  });

  testWidgets('reads a span against the grid it is in, not against twelve', (
    WidgetTester tester,
  ) async {
    _widen(tester);
    await tester.pumpWidget(
      host(
        width: 1200,
        MPGrid(
          columns: const MPResponsive<int>(24),
          spacing: _noGap,
          children: <Widget>[MPGridItem(span: _span(12), child: _cell('half'))],
        ),
      ),
    );

    expect(_widthOf(tester, 'half'), 600);
  });

  testWidgets('fills the row when no span was asked for', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 600,
        MPGrid(
          children: <Widget>[
            MPGridItem(child: _cell('full')),
            _cell('plain'),
          ],
        ),
      ),
    );

    expect(_widthOf(tester, 'full'), 600);
    expect(_widthOf(tester, 'plain'), 600);
  });

  testWidgets('clamps a span wider than the row instead of overflowing', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        width: 600,
        MPGrid(
          children: <Widget>[MPGridItem(span: _span(20), child: _cell('wide'))],
        ),
      ),
    );

    expect(_widthOf(tester, 'wide'), 600);
  });

  testWidgets('takes the gutter out of the columns rather than out of the grid', (
    WidgetTester tester,
  ) async {
    // Two halves with the default 16 between them are the whole row, exactly.
    await tester.pumpWidget(
      host(
        width: 616,
        MPGrid(
          children: <Widget>[
            MPGridItem(span: _span(6), child: _cell('a')),
            MPGridItem(span: _span(6), child: _cell('b')),
          ],
        ),
      ),
    );

    expect(_widthOf(tester, 'a'), 300);
    expect(_startOf(tester, 'b'), 316);
    expect(_rectOf(tester, 'a').top, _rectOf(tester, 'b').top);
  });

  testWidgets('wraps onto the next row when the columns run out', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 600,
        MPGrid(
          spacing: const MPResponsive<double>(2),
          children: <Widget>[
            MPGridItem(span: _span(8), child: _cell('a')),
            MPGridItem(span: _span(8), child: _cell('b')),
          ],
        ),
      ),
    );

    expect(_rectOf(tester, 'b').top - _rectOf(tester, 'a').bottom, 8);
    expect(_startOf(tester, 'b'), 0);
  });

  testWidgets('pushes an item along by its offset', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 1200,
        MPGrid(
          spacing: _noGap,
          children: <Widget>[
            MPGridItem(span: _span(4), offset: const MPResponsive<int>(4), child: _cell('middle')),
          ],
        ),
      ),
    );
    _widen(tester);
    await tester.pump();

    expect(_startOf(tester, 'middle'), 400);
    expect(_widthOf(tester, 'middle'), 400);
  });

  testWidgets('counts an offset from the item before it', (WidgetTester tester) async {
    _widen(tester);
    await tester.pumpWidget(
      host(
        width: 1200,
        MPGrid(
          spacing: _noGap,
          children: <Widget>[
            MPGridItem(span: _span(4), child: _cell('first')),
            MPGridItem(span: _span(4), offset: const MPResponsive<int>(4), child: _cell('last')),
          ],
        ),
      ),
    );

    expect(_startOf(tester, 'last'), 800);
  });

  testWidgets('applies the entry for the window class it is being drawn at', (
    WidgetTester tester,
  ) async {
    _widen(tester);
    final MPGrid grid = MPGrid(
      spacing: _noGap,
      children: <Widget>[
        MPGridItem(
          span: const MPResponsive<MPGridSpan>(MPGridSpan(12), large: MPGridSpan(6)),
          child: _cell('cell'),
        ),
      ],
    );

    await tester.pumpWidget(_inWindow(1280, grid));
    expect(_widthOf(tester, 'cell'), 640);

    await tester.pumpWidget(_inWindow(1000, grid));
    expect(_widthOf(tester, 'cell'), 1000);
  });

  testWidgets('changes its column count and gutter with the window class', (
    WidgetTester tester,
  ) async {
    // MD3's own grid: four columns and 16dp compact, twelve and 24dp from medium.
    final MPGrid grid = MPGrid(
      columns: const MPResponsive<int>(4, medium: 12),
      spacing: const MPResponsive<double>(4, medium: 6),
      children: <Widget>[
        MPGridItem(span: _span(2), child: _cell('a')),
        MPGridItem(span: _span(2), child: _cell('b')),
      ],
    );

    await tester.pumpWidget(_inWindow(400, grid));
    expect(_startOf(tester, 'b') - _rectOf(tester, 'a').width, 16);
    expect(_widthOf(tester, 'a'), (400 + 16) / 4 * 2 - 16);

    await tester.pumpWidget(_inWindow(720, grid));
    expect(_startOf(tester, 'b') - _rectOf(tester, 'a').width, 24);
    expect(_widthOf(tester, 'a'), closeTo((720 + 24) / 12 * 2 - 24, 0.001));
  });

  testWidgets('keeps the documented gutter under a partial map', (WidgetTester tester) async {
    await tester.pumpWidget(
      _inWindow(
        600,
        MPGrid(
          spacing: const MPResponsive<double>.from(expanded: 8),
          children: <Widget>[
            MPGridItem(span: _span(6), child: _cell('a')),
            MPGridItem(span: _span(6), child: _cell('b')),
          ],
        ),
      ),
    );

    expect(_startOf(tester, 'b') - _widthOf(tester, 'a'), 16);
  });

  testWidgets('lets one gutter be set without the other', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 600,
        MPGrid(
          columnSpacing: _noGap,
          children: <Widget>[
            MPGridItem(span: _span(6), child: _cell('a')),
            MPGridItem(span: _span(6), child: _cell('b')),
            MPGridItem(span: _span(6), child: _cell('c')),
          ],
        ),
      ),
    );

    expect(_startOf(tester, 'b'), 300);
    expect(_rectOf(tester, 'c').top - _rectOf(tester, 'a').bottom, 16);
  });

  testWidgets('divides a nested grid by its own column count', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 600,
        MPGrid(
          spacing: _noGap,
          children: <Widget>[
            MPGridItem(
              span: _span(6),
              child: MPGrid(
                columns: const MPResponsive<int>(2),
                spacing: _noGap,
                children: <Widget>[MPGridItem(span: _span(1), child: _cell('inner'))],
              ),
            ),
          ],
        ),
      ),
    );

    expect(_widthOf(tester, 'inner'), 150);
  });

  testWidgets('lays an item out as its child when there is no grid to talk to', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        width: 300,
        MPGrid(
          children: <Widget>[
            MPGridItem(
              span: _span(6),
              child: Column(
                children: <Widget>[MPGridItem(span: _span(1), child: _cell('stray'))],
              ),
            ),
          ],
        ),
      ),
    );

    expect(tester.takeException(), isNull);
    expect(find.byKey(const Key('stray')), findsOneWidget);
  });

  testWidgets('scrolls one row sideways when told not to wrap', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 600,
        MPGrid(
          spacing: _noGap,
          wrap: false,
          children: <Widget>[
            MPGridItem(span: _span(8), child: _cell('a')),
            MPGridItem(span: _span(8), child: _cell('b')),
          ],
        ),
      ),
    );

    // Still read against the visible 600, and both on one row.
    expect(_widthOf(tester, 'a'), 400);
    expect(_rectOf(tester, 'a').top, _rectOf(tester, 'b').top);
    expect(find.byType(SingleChildScrollView), findsOneWidget);
  });

  group('alignment', () {
    Widget row({
      MPGridJustify? justify,
      MPGridAlign align = MPGridAlign.stretch,
      MPGridAlignSelf? self,
    }) {
      return host(
        width: 600,
        MPGrid(
          spacing: _noGap,
          justifyContent: justify,
          alignItems: align,
          children: <Widget>[
            MPGridItem(span: _span(3), child: _cell('short', height: 20)),
            MPGridItem(span: _span(3), alignSelf: self, child: _cell('tall', height: 60)),
          ],
        ),
      );
    }

    testWidgets('stretches every item to the row by default', (WidgetTester tester) async {
      await tester.pumpWidget(row());

      expect(_rectOf(tester, 'short').height, 60);
    });

    testWidgets('places items across the row as alignItems says', (WidgetTester tester) async {
      await tester.pumpWidget(row(align: MPGridAlign.center));
      expect(_rectOf(tester, 'short').top - _rectOf(tester, 'tall').top, 20);

      await tester.pumpWidget(row(align: MPGridAlign.end));
      expect(_rectOf(tester, 'short').bottom, _rectOf(tester, 'tall').bottom);
    });

    testWidgets('lets one item override the row', (WidgetTester tester) async {
      await tester.pumpWidget(row(align: MPGridAlign.start, self: MPGridAlignSelf.end));

      expect(_rectOf(tester, 'short').height, 20);
      expect(_rectOf(tester, 'short').top, _rectOf(tester, 'tall').top);
    });

    testWidgets('distributes the width the items did not take', (WidgetTester tester) async {
      await tester.pumpWidget(row(justify: MPGridJustify.end));
      expect(_startOf(tester, 'short'), 300);

      await tester.pumpWidget(row(justify: MPGridJustify.center));
      expect(_startOf(tester, 'short'), 150);

      await tester.pumpWidget(row(justify: MPGridJustify.spaceBetween));
      expect(_startOf(tester, 'tall'), 450);
    });

    testWidgets('lines items up on their baselines', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          MPGrid(
            alignItems: MPGridAlign.baseline,
            children: const <Widget>[
              MPGridItem(
                span: MPResponsive<MPGridSpan>(MPGridSpan(6)),
                child: Text('Small', style: TextStyle(fontSize: 12)),
              ),
              MPGridItem(
                span: MPResponsive<MPGridSpan>(MPGridSpan(6)),
                child: Text('Large', style: TextStyle(fontSize: 40)),
              ),
            ],
          ),
        ),
      );

      expect(
        tester.getBottomLeft(find.text('Small')).dy,
        lessThan(tester.getBottomLeft(find.text('Large')).dy),
      );
      expect(
        tester.getTopLeft(find.text('Small')).dy,
        greaterThan(tester.getTopLeft(find.text('Large')).dy),
      );
    });

    testWidgets('sits the rows in a taller grid as alignContent says', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          height: 300,
          MPGrid(
            alignContent: MPGridAlignContent.end,
            children: <Widget>[_cell('only', height: 20)],
          ),
        ),
      );

      final double top = tester.getTopLeft(find.byType(MPGrid)).dy;

      expect(_rectOf(tester, 'only').top - top, 280);
    });

    testWidgets('mirrors the row under right-to-left text', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          textDirection: TextDirection.rtl,
          MPGrid(
            spacing: _noGap,
            children: <Widget>[MPGridItem(span: _span(4), child: _cell('first'))],
          ),
        ),
      );

      final double right = tester.getTopRight(find.byType(MPGrid)).dx;

      expect(_rectOf(tester, 'first').right, right);
    });
  });

  group('MPGridSpan.grow', () {
    testWidgets('takes the width the row has left', (WidgetTester tester) async {
      _widen(tester);
      await tester.pumpWidget(
        host(
          width: 1200,
          MPGrid(
            spacing: _noGap,
            children: <Widget>[
              MPGridItem(span: _span(3), child: _cell('thumb')),
              MPGridItem(
                span: const MPResponsive<MPGridSpan>(MPGridSpan.grow),
                child: _cell('body'),
              ),
            ],
          ),
        ),
      );

      expect(_widthOf(tester, 'thumb'), 300);
      expect(_widthOf(tester, 'body'), 900);
    });

    testWidgets('splits the remainder equally between two of them', (WidgetTester tester) async {
      _widen(tester);
      await tester.pumpWidget(
        host(
          width: 1200,
          MPGrid(
            spacing: _noGap,
            children: const <Widget>[
              MPGridItem(span: MPResponsive<MPGridSpan>(MPGridSpan(2)), child: Text('Anchor')),
              MPGridItem(
                span: MPResponsive<MPGridSpan>(MPGridSpan.grow),
                child: Text('A much longer run of words than the other one has', key: Key('one')),
              ),
              MPGridItem(
                span: MPResponsive<MPGridSpan>(MPGridSpan.grow),
                child: Text('Short', key: Key('two')),
              ),
            ],
          ),
        ),
      );

      expect(_widthOf(tester, 'one'), 500);
      expect(_widthOf(tester, 'two'), 500);
    });

    testWidgets('is responsive like any other span', (WidgetTester tester) async {
      _widen(tester);
      final MPGrid grid = MPGrid(
        spacing: _noGap,
        children: <Widget>[
          MPGridItem(span: _span(4), child: _cell('side')),
          MPGridItem(
            span: const MPResponsive<MPGridSpan>(MPGridSpan.grow, large: MPGridSpan(2)),
            child: _cell('cell'),
          ),
        ],
      );

      await tester.pumpWidget(_inWindow(1200, grid));
      expect(_widthOf(tester, 'cell'), 200);

      await tester.pumpWidget(_inWindow(1199, grid));
      expect(_widthOf(tester, 'cell'), closeTo(1199 * 8 / 12, 0.001));
    });
  });

  group('MPGridSpan.auto', () {
    testWidgets('takes exactly the width of what is inside it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          MPGrid(
            spacing: _noGap,
            children: const <Widget>[
              MPGridItem(
                span: MPResponsive<MPGridSpan>(MPGridSpan.auto),
                child: SizedBox(key: Key('buttons'), width: 96, height: 20),
              ),
            ],
          ),
        ),
      );

      expect(_widthOf(tester, 'buttons'), 96);
    });

    testWidgets('pairs with grow, one taking what it needs and the other the rest', (
      WidgetTester tester,
    ) async {
      _widen(tester);
      await tester.pumpWidget(
        host(
          width: 1200,
          MPGrid(
            spacing: _noGap,
            children: <Widget>[
              MPGridItem(
                span: const MPResponsive<MPGridSpan>(MPGridSpan.grow),
                child: _cell('transport'),
              ),
              const MPGridItem(
                span: MPResponsive<MPGridSpan>(MPGridSpan.auto),
                child: SizedBox(key: Key('buttons'), width: 96, height: 20),
              ),
            ],
          ),
        ),
      );

      expect(_widthOf(tester, 'buttons'), 96);
      expect(_widthOf(tester, 'transport'), 1104);
    });

    testWidgets('is what a number below it gives way to', (WidgetTester tester) async {
      _widen(tester);
      final MPGrid grid = MPGrid(
        spacing: _noGap,
        children: const <Widget>[
          MPGridItem(
            span: MPResponsive<MPGridSpan>(MPGridSpan(6), large: MPGridSpan.auto),
            child: SizedBox(key: Key('cell'), width: 96, height: 20),
          ),
        ],
      );

      await tester.pumpWidget(_inWindow(1200, grid));
      expect(_widthOf(tester, 'cell'), 96);

      await tester.pumpWidget(_inWindow(1000, grid));
      expect(_widthOf(tester, 'cell'), 500);
    });
  });

  testWidgets('moves with a boundary an MPConfigProvider moved', (WidgetTester tester) async {
    await tester.pumpWidget(
      _inWindow(
        650,
        MPConfigProvider(
          breakpoints: const <MPWindowClass, double>{MPWindowClass.medium: 700},
          child: MPGrid(
            spacing: _noGap,
            children: <Widget>[
              MPGridItem(
                span: const MPResponsive<MPGridSpan>(MPGridSpan(12), medium: MPGridSpan(6)),
                child: _cell('cell'),
              ),
            ],
          ),
        ),
      ),
    );

    expect(_widthOf(tester, 'cell'), 650);
  });

  testWidgets('answers an intrinsic height without throwing', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 600,
        IntrinsicHeight(
          child: MPGrid(
            spacing: _noGap,
            children: <Widget>[
              MPGridItem(span: _span(6), child: _cell('a', height: 30)),
              MPGridItem(span: _span(6), child: _cell('b', height: 50)),
            ],
          ),
        ),
      ),
    );

    expect(tester.takeException(), isNull);
    expect(tester.getSize(find.byType(MPGrid)).height, 50);
  });

  testWidgets('paints no surface of its own', (WidgetTester tester) async {
    await tester.pumpWidget(host(width: 300, MPGrid(children: <Widget>[_cell('a')])));

    expect(
      find.descendant(of: find.byType(MPGrid), matching: find.byType(DecoratedBox)),
      findsNothing,
    );
  });
}
