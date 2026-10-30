import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/aspect_ratio/mp_aspect_ratio.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite measures the element and reads `object-fit` and the corner
/// off it. Here the proportion is the laid-out box, the fit is the [FittedBox]
/// round the child, and the corner is the clip.

Size _boxOf(WidgetTester tester) => tester.getSize(find.byType(MPAspectRatio));

void main() {
  group('the proportion', () {
    testWidgets('is square by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPAspectRatio()));

      expect(_boxOf(tester), const Size(300, 300));
    });

    testWidgets('takes a ratio as width over height', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 320, const MPAspectRatio(ratio: 16 / 9)));

      expect(_boxOf(tester), const Size(320, 180));
    });

    testWidgets('reserves the space before the media has arrived', (WidgetTester tester) async {
      // Nothing inside at all, which is what a picture still loading lays out as.
      await tester.pumpWidget(
        host(
          width: 400,
          const Column(
            children: <Widget>[
              MPAspectRatio(ratio: 4 / 3),
              Text('Below'),
            ],
          ),
        ),
      );

      expect(_boxOf(tester).height, 300);
      expect(
        tester.getTopLeft(find.text('Below')).dy - tester.getTopLeft(find.byType(Column)).dy,
        300,
      );
    });

    testWidgets('lays its child out to the full box', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 200, const MPAspectRatio(ratio: 2, child: SizedBox(key: Key('media')))),
      );

      expect(tester.getSize(find.byKey(const Key('media'))), const Size(200, 100));
    });
  });

  group('the media inside', () {
    testWidgets('is laid out as it is until a fit is asked for', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 200, const MPAspectRatio(child: Text('Words'))));

      expect(find.byType(FittedBox), findsNothing);
    });

    testWidgets('is fitted by the BoxFit each word names', (WidgetTester tester) async {
      final Map<MPAspectFit, BoxFit> fits = <MPAspectFit, BoxFit>{
        MPAspectFit.cover: BoxFit.cover,
        MPAspectFit.contain: BoxFit.contain,
        MPAspectFit.fill: BoxFit.fill,
        MPAspectFit.none: BoxFit.none,
        MPAspectFit.scaleDown: BoxFit.scaleDown,
      };

      for (final MapEntry<MPAspectFit, BoxFit> entry in fits.entries) {
        await tester.pumpWidget(
          host(
            width: 200,
            MPAspectRatio(fit: entry.key, child: const SizedBox(width: 50, height: 100)),
          ),
        );

        expect(tester.widget<FittedBox>(find.byType(FittedBox)).fit, entry.value);
      }
    });

    testWidgets('covers the box and keeps the overflow inside it', (WidgetTester tester) async {
      // A portrait picture in a landscape box: `cover` scales it up to the
      // width, and the box clips the height it no longer has room for.
      await tester.pumpWidget(
        host(
          width: 200,
          const MPAspectRatio(
            ratio: 2,
            fit: MPAspectFit.cover,
            child: SizedBox(key: Key('media'), width: 50, height: 100),
          ),
        ),
      );

      final Rect media = tester.getRect(find.byKey(const Key('media')));

      expect(media.width, 200);
      expect(media.height, 400);
      expect(find.byType(ClipRect), findsWidgets);
    });
  });

  group('the corner', () {
    BorderRadiusGeometry? cornerOf(WidgetTester tester) {
      final Finder clip = find.byType(ClipRRect);

      return clip.evaluate().isEmpty ? null : tester.widget<ClipRRect>(clip).borderRadius;
    }

    testWidgets('is square unless asked for', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 200, const MPAspectRatio(child: SizedBox())));

      expect(cornerOf(tester), isNull);
      expect(find.byType(ClipRect), findsOneWidget);
    });

    testWidgets('is the card corner at md', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 200, const MPAspectRatio(rounded: true, child: SizedBox())),
      );

      expect(cornerOf(tester), BorderRadius.circular(12));
    });

    testWidgets('moves along the ladder with size', (WidgetTester tester) async {
      final List<BorderRadiusGeometry?> corners = <BorderRadiusGeometry?>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(width: 200, MPAspectRatio(rounded: true, size: size, child: const SizedBox())),
        );
        corners.add(cornerOf(tester));
      }

      expect(corners, <BorderRadius>[
        BorderRadius.circular(4),
        BorderRadius.circular(8),
        BorderRadius.circular(12),
        BorderRadius.circular(12),
        BorderRadius.circular(28),
      ]);
    });

    testWidgets('takes its rung from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 200,
          const MPConfigProvider(
            size: MPSize.xs,
            child: MPAspectRatio(rounded: true, child: SizedBox()),
          ),
        ),
      );

      expect(cornerOf(tester), BorderRadius.circular(4));
    });
  });
}
