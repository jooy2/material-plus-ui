---
title: Material Plus and material_ui
order: 5
---

# Material Plus and `material_ui`

<p class="mp-lede">Flutter has a Material library of its own, and since Flutter 3.47 it is a package, <code>material_ui</code>. This page says what Material Plus adds to it, what it leaves to it, and how the two sit in one app.</p>

## The short answer

Use `material_ui` for the frame of an app: `MaterialApp`, `Scaffold`, `AppBar`, routes and their transitions, bottom sheets, and the platform behaviour around text selection. Use Material Plus for the components inside that frame, especially the ones Material Design never described: charts, a data table with search and selection, a command palette, a tour, a transfer list, a tree, a colour picker, an OTP field.

They are not exclusive. Material Plus reads nothing from a `MaterialApp` and changes nothing in it, so the two run side by side in one widget tree, and an app can adopt Material Plus one screen at a time.

## At a glance

|  | `material_ui` | `material_plus_ui` |
| --- | --- | --- |
| Published by | flutter.dev | CDGet |
| Licence | BSD-3-Clause | MIT |
| Dependencies | `collection`, `cupertino_ui`, `flutter`, `flutter_localizations`, `intl`, `material_color_utilities`, `vector_math` | `flutter` only |
| Built on | the framework, with Cupertino beside it | `package:flutter/widgets.dart` alone |
| Needs above it | a `MaterialApp` (or a `Theme`, `Material` and `MaterialLocalizations`) for most widgets | nothing; `MPTheme` and `MPConfigProvider` are optional overrides |
| Scope | the components MD3 names, plus the app structure around them | the components MD3 names, plus dozens it does not |
| Size | one size per component, as the specification defines it | a five-rung `size` ladder on every control, MD3's size at `md` |
| Density | `VisualDensity` on the theme | `density` on every container, MD3's `0` to `-3`, spacing only |
| Scheme from one colour | `ColorScheme.fromSeed`, HCT | `MPTheme(sourceColor:)`, the same derivation as the React package |
| A React twin | no | `material-plus-ui` on npm: the same components, names, props and numbers |
| Translations | `MaterialLocalizations`, through localization delegates | eighteen tables you register once; a component falls back to the app's locale, then English |

## What Material Plus adds

### Components the specification never named

Material Design describes the controls of an app. A real product also needs the things around them, and in a Material app those are usually a second package with a second look. Material Plus draws them in the same roles, corners and type:

- **Charts.** Area, bar, gauge, heatmap, line, pie, scatter, sparkline and timeline charts, with tooltips, legends, a keyboard path and a summary for screen readers, coloured from an eight-slot ramp that keeps its hues in the dark scheme.
- **Data.** `MPDataTable` with sorting, search, selection, pages, resizable columns and a CSV export handed to your app; `MPTable`, `MPDataList`, `MPList`, `MPTreeView` and `MPTimeline`.
- **Inputs Material does not have.** `MPCombobox` with multiple selection, `MPNumberField` with steppers, `MPOtpField`, `MPColorPicker`, `MPFilePicker`, `MPRating`, `MPTransfer`, `MPTreeSelect`, `MPDateTimePicker` and `MPPagination`.
- **Guidance and overlays.** `MPCommandPalette`, `MPTour`, `MPPopconfirm`, `MPHoverCard`, `MPPopover` and `MPConfirmProvider`, which asks a question and waits for the answer.
- **Display.** `MPCodeBlock`, `MPChatBubble`, `MPStatistic`, `MPMeter`, `MPSkeleton`, `MPEmpty`, `MPBreadcrumb`, `MPShortcut`, `MPHighlight`, `MPMockup` and more.
- **Layout.** `MPPanes` (resizable), `MPSidebar`, `MPPageLayout`, `MPGrid` on MD3's window size classes, `MPShow` and `MPScrollZone`.
- **Seventeen animations**, from a fade to a typewriter, that stop when the platform asks for less motion.

The [component index](../components/) has every one, each with a live Flutter preview.

### One vocabulary across every component

`size`, `color`, `variant`, `density` and `elevation` mean the same thing on a button, a chip, a card, a list and a table. A screen that runs dense is one `MPConfigProvider(density: -1)` rather than a theme for each component type, and a filter bar that needs small controls is `size: MPSize.sm` on each of them, or once on the provider.

The ladder goes beyond the specification knowingly, and only in one direction you can see: `md` **is** MD3's size, so nobody has to know the ladder exists to be given the Material one.

### The same library in React and Flutter

A team that ships a web app and a mobile app writes one design system twice. With Material Plus the second time is a translation, not a redesign: `MPButton(variant: MPVariant.tonal, size: MPSize.sm)` and `<MPButton variant="tonal" size="sm">` are the same button, 40px tall, in the same role, and one documentation page covers both. The same source colour generates the same hex values in both packages, which a test in the Flutter package holds against the React token sheet.

### Nothing to depend on

`material_plus_ui` has no dependencies and imports neither Material nor Cupertino. It adds no `intl`, no localization delegates and no second copy of anything to an app, and it is unaffected by the design libraries moving out of the framework: it did not use them to begin with.

## Where `material_ui` is the better choice

- **The frame of the app.** `Scaffold`, `AppBar`, `NavigationRail`, `NavigationDrawer`, `MaterialPageRoute` and its transitions, modal bottom sheets with drag, and `SnackBar` tied to a scaffold are Flutter's own and belong there. Material Plus has an `MPPageLayout`, an `MPHeader`, an `MPDrawer` and an `MPBottomNavigation`, but it does not replace the router or the scaffold.
- **Platform behaviour around text.** `material_ui`'s `TextField` brings the magnifier and the spell-check suggestions as well as the selection handles and toolbar. `MPTextField` is built on the framework's `EditableText` and keeps composition intact for Korean, Japanese and Chinese input. It draws its own handles and menu on Android and a desktop and uses the system menu on iOS, but it has no magnifier and offers no spelling suggestions.
- **Ecosystem fit.** Every Flutter tutorial and most third-party widgets read `Theme.of(context)`. Material Plus does not, which is what lets it coexist, and also what means a third-party widget will not follow an `MPTheme`.
- **Official support.** `material_ui` is maintained by the Flutter team, on Flutter's schedule.

## Using the two together

Material Plus reads its own theme and nothing else, so an app with both gives each its colours. Give them the same seed and the schemes come out close:

```dart
const Color brand = Color(0xFF00639B);

MaterialApp(
  theme: ThemeData(colorSchemeSeed: brand),
  builder: (BuildContext context, Widget? child) {
    return MPTheme(
      sourceColor: brand,
      brightness: Theme.of(context).brightness,
      child: child!,
    );
  },
  home: const HomeScreen(),
);
```

Close, not identical: `ColorScheme.fromSeed` works in HCT, and Material Plus derives its roles in OKLCh so that they match the React package to the hex. Where a screen has a Material widget and a Material Plus one side by side and the difference shows, hand Material Plus the Material roles:

```dart
final ColorScheme material = Theme.of(context).colorScheme;

MPTheme(
  colors: MPColorScheme.fromSource(
    sourceColor: brand,
    brightness: material.brightness,
  ).copyWith(
    primary: material.primary,
    onPrimary: material.onPrimary,
    primaryContainer: material.primaryContainer,
    onPrimaryContainer: material.onPrimaryContainer,
    secondary: material.secondary,
    secondaryContainer: material.secondaryContainer,
    surface: material.surface,
    surfaceContainerHighest: material.surfaceContainerHighest,
    onSurface: material.onSurface,
    onSurfaceVariant: material.onSurfaceVariant,
    outline: material.outline,
    outlineVariant: material.outlineVariant,
  ),
  child: child,
);
```

The role names are MD3's in both libraries, so the mapping is one line per role.

Languages work the same way: Material Plus does not read `MaterialLocalizations`, but with no locale of its own a component follows the app's `Localizations`, so registering the tables once with `registerMPMessages(mpLocales)` is enough for it to speak whatever language the `MaterialApp` is in.

## See also

- [Getting started](./getting-started) for the install, in either framework.
- [Prop conventions](../design/prop-conventions) for the shared vocabulary.
- [Migrate to the standalone `material_ui` and `cupertino_ui` packages](https://docs.flutter.dev/release/breaking-changes/material-ui-and-cupertino-ui), Flutter's own guide to the move.
