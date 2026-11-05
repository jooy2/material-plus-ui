/// What a person does in the app, written once.
///
/// `test/app_test.dart` runs these on the host at a phone's and a tablet's size,
/// and `integration_test/app_test.dart` runs them on a device, where they also
/// leave a screenshot of every step.
library;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:material_plus_showcase/app/app.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Takes a picture of the screen under a name.
typedef Shot = Future<void> Function(WidgetTester tester, String name);

/// Draws enough frames for a sheet or a popup to finish arriving.
Future<void> settle(WidgetTester tester) async {
  for (int frame = 0; frame < 15; frame += 1) {
    await tester.pump(const Duration(milliseconds: 40));
  }
}

Future<void> _open(WidgetTester tester) async {
  await tester.pumpWidget(const ShowcaseApp());
  await settle(tester);
}

Future<void> _go(WidgetTester tester, String destination) async {
  // The bottom bar on a phone and the sidebar on a tablet, rather than a word
  // on the screen that happens to match.
  final Finder bar = find.byWidgetPredicate(
    (Widget widget) => widget is MPBottomNavigation || widget is MPSidebar,
  );

  await tester.tap(find.descendant(of: bar, matching: find.text(destination)));
  await settle(tester);
}

Future<void> _press(WidgetTester tester, String label) async {
  await tester.ensureVisible(find.text(label).last);
  await settle(tester);
  await tester.tap(find.text(label).last);
  await settle(tester);
}

Future<void> _pressLabelled(WidgetTester tester, String label) async {
  await tester.ensureVisible(find.bySemanticsLabel(label).first);
  await settle(tester);
  await tester.tap(find.bySemanticsLabel(label).first);
  await settle(tester);
}

/// Types [text] into [field].
///
/// Straight into the editor rather than through `tester.enterText`, whose
/// message carries a client id only a debug build accepts, so a run in profile
/// mode on a device would type nothing.
Future<void> _type(WidgetTester tester, Finder field, String text) async {
  await tester.showKeyboard(field);
  tester
      .state<EditableTextState>(field)
      .updateEditingValue(
        TextEditingValue(
          text: text,
          selection: TextSelection.collapsed(offset: text.length),
        ),
      );
  await settle(tester);
}

Future<void> _back(WidgetTester tester) async {
  await tester.binding.handlePopRoute();
  await settle(tester);
}

/// Takes the keyboard's focus away, so it does not carry into the next flow.
Future<void> _unfocus(WidgetTester tester) async {
  FocusManager.instance.primaryFocus?.unfocus();
  await settle(tester);
}

/// The size of the screen in logical pixels.
Size _screen(WidgetTester tester) => tester.view.physicalSize / tester.view.devicePixelRatio;

/// Every flow, as tests.
void defineFlows({required Shot shot}) {
  testWidgets('Home shows its figures, changes period and answers the bell', (
    WidgetTester tester,
  ) async {
    await _open(tester);
    await shot(tester, 'home');

    expect(find.text('£48,120'), findsOneWidget);

    await _pressLabelled(tester, 'Notifications');
    expect(find.text('3 new messages'), findsOneWidget);
    await shot(tester, 'home-snackbar');

    // Above the bottom bar on a phone, as MD3 has it, rather than over it.
    final Finder bar = find.byType(MPBottomNavigation);

    if (bar.evaluate().isNotEmpty) {
      expect(tester.getRect(find.text('3 new messages')).bottom, lessThan(tester.getRect(bar).top));
    }

    await _press(tester, 'Week');
    expect(find.text('£12,840'), findsOneWidget);
    await shot(tester, 'home-week');

    await _pressLabelled(tester, 'Dismiss');
    expect(find.text('Prices change on 1 December'), findsNothing);

    await tester.ensureVisible(find.text('Lately'));
    await settle(tester);
    await shot(tester, 'home-lately');
  });

  testWidgets('Inbox searches, opens a conversation and sends a reply', (
    WidgetTester tester,
  ) async {
    await _open(tester);
    await _go(tester, 'Inbox');
    await shot(tester, 'inbox');

    await _type(tester, find.byType(EditableText).first, 'invoice');
    expect(find.text('Theo Quinn'), findsOneWidget);
    expect(find.text('Anya Sol'), findsNothing);

    await _type(tester, find.byType(EditableText).first, 'nobody at all');
    expect(find.text('Nothing found'), findsOneWidget);
    await shot(tester, 'inbox-empty');

    await _press(tester, 'Clear the search');
    await _unfocus(tester);
    await _press(tester, 'Nadia Rowan');
    await shot(tester, 'thread');

    final Finder reply = find.byType(EditableText).last;

    // A keyboard over the bottom of the screen, which the reply field sits
    // above rather than behind. Only on the host: a device's window reports
    // its own keyboard, and a simulator with a hardware keyboard shows none.
    final bool host = tester.binding is! LiveTestWidgetsFlutterBinding;

    if (host) {
      tester.view.viewInsets = const FakeViewPadding(bottom: 300);
      await settle(tester);
      expect(tester.getRect(reply).bottom, lessThanOrEqualTo(_screen(tester).height - 300));
    }

    await _type(tester, reply, 'On my way');
    tester.state<EditableTextState>(reply).performAction(TextInputAction.done);
    await settle(tester);
    expect(find.text('On my way'), findsOneWidget);
    await shot(tester, 'thread-sent');

    if (host) {
      tester.view.resetViewInsets();
      await settle(tester);
    }

    await _unfocus(tester);
    await _back(tester);
    expect(find.text('6 conversations'), findsOneWidget);
  });

  testWidgets('Orders filters from a drawer, and deletes through a menu and a question', (
    WidgetTester tester,
  ) async {
    await _open(tester);
    await _go(tester, 'Orders');
    await shot(tester, 'orders');

    await _press(tester, 'Filters');
    await shot(tester, 'orders-filters');

    // A side drawer reaches the top of the screen.
    expect(
      tester.getTopLeft(find.text('Show orders that are:')).dy,
      lessThan(_screen(tester).height / 4),
    );

    await _press(tester, 'Paid');
    expect(find.text('12 shown'), findsOneWidget);
    await _press(tester, 'Paid');
    expect(find.text('23 shown'), findsOneWidget);
    await _press(tester, 'Done');
    expect(find.text('Show orders that are:'), findsNothing);

    final Finder actions = find.bySemanticsLabel('Actions for INV-0104');

    await tester.ensureVisible(actions.first);
    await settle(tester);
    await tester.tap(actions.first, warnIfMissed: false);
    await settle(tester);
    await shot(tester, 'orders-menu');

    // A popup stays on the screen, however close to the edge its button is.
    expect(tester.getTopRight(find.text('Delete')).dx, lessThanOrEqualTo(_screen(tester).width));

    await tester.tap(find.text('Delete'));
    await settle(tester);
    expect(find.text('Delete INV-0104?'), findsOneWidget);
    await shot(tester, 'orders-confirm');

    await tester.tap(find.text('Delete').last);
    await settle(tester);
    expect(find.text('Deleted INV-0104'), findsOneWidget);
    expect(find.text('22 shown'), findsOneWidget);
    await shot(tester, 'orders-deleted');

    await tester.tap(find.text('Undo'));
    await settle(tester);
    expect(find.text('23 shown'), findsOneWidget);
  });

  testWidgets('Request checks the name, walks three steps and sends', (WidgetTester tester) async {
    await _open(tester);
    await _go(tester, 'Request');
    await shot(tester, 'request-1');

    await _press(tester, 'Next');
    expect(find.text('Required'), findsOneWidget);
    await shot(tester, 'request-required');

    await _type(tester, find.byType(EditableText).first, 'Ada');
    await _unfocus(tester);
    await _press(tester, 'Next');
    await shot(tester, 'request-2');

    await _press(tester, 'Pick a day');
    await shot(tester, 'request-calendar');
    await _back(tester);

    await _press(tester, 'Next');
    await shot(tester, 'request-3');

    await _press(tester, 'Send request');
    expect(find.text('Agree to the travel policy first'), findsOneWidget);

    await _press(tester, 'I have read the travel policy');
    await _press(tester, 'Send request');
    expect(find.text('Request sent for Ada'), findsWidgets);
    await shot(tester, 'request-sent');
  });

  testWidgets('A field takes a word on a double tap and shows its handles', (
    WidgetTester tester,
  ) async {
    await _open(tester);
    await _go(tester, 'Request');

    final Finder field = find.byType(EditableText).first;

    await _type(tester, field, 'Ada Lovelace');

    final Offset word = tester.getTopLeft(field) + const Offset(12, 10);

    await tester.tapAt(word);
    await tester.pump(const Duration(milliseconds: 60));
    await tester.tapAt(word);
    await settle(tester);

    final EditableTextState editor = tester.state<EditableTextState>(field);
    final TextEditingValue value = editor.textEditingValue;

    expect(value.selection.textInside(value.text), 'Ada');
    expect(editor.selectionOverlay?.handlesAreVisible, isTrue);
    await shot(tester, 'selection');

    await _unfocus(tester);
  });

  testWidgets('More changes the theme, the direction and the language of the whole app', (
    WidgetTester tester,
  ) async {
    await _open(tester);
    await _go(tester, 'More');
    await shot(tester, 'more');

    await _press(tester, 'Dark mode');
    await shot(tester, 'more-dark');
    await _go(tester, 'Home');
    await shot(tester, 'home-dark');
    await _go(tester, 'Orders');
    await shot(tester, 'orders-dark');
    await _go(tester, 'More');
    await _press(tester, 'Dark mode');

    await _press(tester, 'Right to left');
    await _go(tester, 'Inbox');
    await shot(tester, 'inbox-rtl');
    await _go(tester, 'Home');
    await shot(tester, 'home-rtl');
    await _go(tester, 'More');
    await _press(tester, 'Right to left');

    await _press(tester, 'Compact');
    await _go(tester, 'Orders');
    await shot(tester, 'orders-compact');
    await _go(tester, 'More');
    await _press(tester, 'Compact');
  });

  testWidgets('Overlays open, and close on the system back', (WidgetTester tester) async {
    await _open(tester);
    await _go(tester, 'More');
    await _press(tester, 'Overlays');
    await shot(tester, 'overlays');

    for (final (String button, String inside) in const <(String, String)>[
      ('Dialog', 'Rename project'),
      ('Full-screen dialog', 'Terms'),
      ('Bottom drawer', 'Share'),
      ('Side drawer', 'Projects'),
      ('Popover', 'Effective rate'),
      ('Menu', 'Paste'),
      ('Command palette', 'Invite a colleague'),
      ('Confirm', 'Delete this project?'),
      ('Popconfirm', 'Archive this board?'),
    ]) {
      await _press(tester, button);
      expect(find.text(inside), findsOneWidget, reason: button);
      await shot(tester, 'overlay-$button');
      await _back(tester);
      expect(find.text(inside), findsNothing, reason: button);
    }

    await _press(tester, 'Snackbar');
    expect(find.text('Your changes are live.'), findsOneWidget);
    await shot(tester, 'overlay-snackbar');

    await tester.longPress(find.text('Tooltip'));
    await settle(tester);
    expect(find.text('Saved two minutes ago'), findsOneWidget);
    await shot(tester, 'overlay-tooltip');
    await tester.pump(const Duration(seconds: 3));
    await settle(tester);

    await _press(tester, 'Show the card');
    expect(find.text('Design lead'), findsOneWidget);
    await shot(tester, 'overlay-hover-card');
    await _press(tester, 'Show the card');

    await _press(tester, 'Tour');
    expect(find.text('Each button opens one kind of surface.'), findsOneWidget);
    await shot(tester, 'overlay-tour');
    await _back(tester);

    await _back(tester);
    expect(find.text('Components'), findsOneWidget);
  });

  testWidgets('Components finds a component and shows its demos', (WidgetTester tester) async {
    await _open(tester);
    await _go(tester, 'More');
    await _press(tester, 'Components');
    await shot(tester, 'components');

    await _type(tester, find.byType(EditableText).first, 'butt');
    await _unfocus(tester);
    await _press(tester, 'button');
    await shot(tester, 'component-button');
    await _press(tester, 'sizes');
    await shot(tester, 'component-button-sizes');
  });

  testWidgets('Media shows its pictures in three tabs', (WidgetTester tester) async {
    await _open(tester);
    await _go(tester, 'More');
    await _press(tester, 'Media');
    await tester.pump(const Duration(milliseconds: 400));
    await shot(tester, 'media');

    expect(find.text('Gallery'), findsOneWidget);

    await _press(tester, 'People');
    expect(find.text('Design lead'), findsOneWidget);
    await shot(tester, 'media-people');

    await _press(tester, 'Devices');
    await shot(tester, 'media-devices');
  });
}
