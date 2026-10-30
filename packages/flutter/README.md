<img src="https://raw.githubusercontent.com/jooy2/material-plus-ui/main/docs/public/logo-large.png" alt="Material Plus" width="96" height="96">

# Material Plus for Flutter

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jooy2/material-plus-ui/blob/main/LICENSE) [![pub package](https://img.shields.io/pub/v/material_plus_ui.svg)](https://pub.dev/packages/material_plus_ui)

### [**material-plus.cdget.com**](https://material-plus.cdget.com)

Live previews and full parameters for every component. Pick **Flutter** in the sidebar. This README is just the quick start.

![Material Plus components arranged around the Material Plus mark: a search field, a settings card, radio buttons and checkboxes, buttons and chips, a segmented button and pagination, an alert, a slider, a progress bar and a meter, an avatar stack, a badge and a rating](https://raw.githubusercontent.com/jooy2/material-plus-ui/main/.github/showcase.png)

---

**Material Plus is Material Design 3, written from the specification and extended past it.** This is the Flutter half. The [React package](https://www.npmjs.com/package/material-plus-ui) is the other one, and the two hold the same components under the same names, the same parameter vocabulary and the same numbers. They version independently, so this package's number and the npm one's will not always agree.

Flutter already has Material: `material_ui`, the framework's own library. This package is not a replacement for it and does not depend on it. It is the components Material Design describes, drawn from the specification's tokens, plus the ones it never named: charts, a data table, a command palette, a tour, a transfer list, a tree view, a date range picker, a colour picker and a set of animations. [Material Plus and `material_ui`](https://material-plus.cdget.com/guide/flutter-material-ui) compares the two in detail.

- **Themed from one colour.** `MPTheme(sourceColor: ...)` generates every role the way Material generates a scheme from a source colour, with the same arithmetic as the React package, so the same colour comes out as the same hex values in both.
- **Five parameters, not fifty.** `size`, `color`, `variant`, `density` and `elevation` mean the same thing on every component. An `md` control is MD3's 56px, and `xs` to `xl` give every control a ladder the specification does not.
- **Works with no setup.** There is no provider to install and no theme to fill in. Without an `MPTheme` a component follows the platform's brightness.
- **It coexists.** Nothing is app-level, so a component sits inside a `MaterialApp`, a `CupertinoApp` or a bare `WidgetsApp` and leaves the app's own theme alone.
- **Accessible without the checklist.** Real semantics, focus management and keyboard operation, inside the widgets.
- **Eighteen languages.** Every word a component says about itself, translated, as tables you register once.
- **Nothing you did not ask for.** No dependencies at all, no assets, no platform channels and no plugins. It is built on `package:flutter/widgets.dart` alone and imports neither Material nor Cupertino, so it is unaffected by those two moving out of the framework into `material_ui` and `cupertino_ui`.

## Install

```bash
flutter pub add material_plus_ui
```

Requires **Flutter 3.41 or newer** (Dart 3.11).

## Use

```dart
import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

MPButton(
  onPressed: save,
  child: const Text('Save'),
)
```

```dart
MPButton(
  variant: MPVariant.tonal,
  color: MPColor.secondary,
  size: MPSize.lg,
  startIcon: const Icon(myAddIcon),
  onPressed: newProject,
  child: const Text('New project'),
)
```

The package ships no icon font. `MPIcon` and every `startIcon`/`endIcon` slot take whatever your app already uses: `Icons` from Material, a `CupertinoIcons` glyph, or an icon package.

## Theming

```dart
MPTheme(
  sourceColor: const Color(0xFF7C3AED),
  shapes: MPShapes.rounded,
  child: const App(),
)
```

Every parameter left out is inherited from the theme above, so a nested `MPTheme(brightness: Brightness.dark, child: ...)` forces one section dark and keeps the brand colour. To disagree with one generated role, give the theme a whole scheme with that role replaced:

```dart
MPTheme(
  colors: MPColorScheme.fromSource(
    sourceColor: brand,
  ).copyWith(outline: const Color(0xFF6B7280)),
  child: child,
)
```

`MPTheme.of(context)` returns the resolved colours, type scale and shapes, for anything of your own that should match.

## Defaults and languages

```dart
import 'package:material_plus_ui/locales.dart';

void main() {
  registerMPMessages(<MPLocale>[ko]);
  runApp(
    const MPConfigProvider(
      size: MPSize.sm,
      density: -1,
      locale: 'ko',
      child: App(),
    ),
  );
}
```

A component's own parameter beats the set it is in, which beats the provider. With no locale anywhere, a component follows the app's `Localizations`, then English. `registerMPMessages(mpLocales)` takes all eighteen languages.

## Components

Every widget is exported under an `MP` prefix, the same name as its React twin. Every component has a page of its own with live previews and the full parameter table. The React package has four more. `MPFlex`, `MPPortal` and `MPVisuallyHidden` answer problems only the DOM has, and the Dart answer to each is a line of framework code rather than a widget. `MPContextMenu` is left out because no right-click gesture means the same thing on every platform Flutter runs on; open an `MPMenu` from `onLongPress` or `onSecondaryTap` instead.

<!-- components:start -->

### Charts

`MPAreaChart` · `MPBarChart` · `MPGaugeChart` · `MPHeatmapChart` · `MPLineChart` · `MPPieChart` · `MPScatterChart` · `MPSparkline` · `MPTimelineChart`

### Display

`MPAnchor` · `MPAppLogo` · `MPAvatar` · `MPBadge` · `MPBlockquote` · `MPBreadcrumb` · `MPChatBubble` · `MPChip` · `MPCodeBlock` · `MPDataList` · `MPDataTable` · `MPDivider` · `MPHighlight` · `MPIcon` · `MPImage` · `MPList` · `MPPagination` · `MPPill` · `MPShortcut` · `MPSpoiler` · `MPStatistic` · `MPStepper` · `MPTable` · `MPTextLink` · `MPTimeline` · `MPTreeView` · `MPTypography`

### Feedback

`MPAlert` · `MPConfirmProvider` · `MPDialog` · `MPEmpty` · `MPHoverCard` · `MPMeter` · `MPOverlay` · `MPPopconfirm` · `MPPopover` · `MPProgressBox` · `MPProgressCircular` · `MPProgressLinear` · `MPSkeleton` · `MPSnackbarProvider` · `MPTooltip` · `MPTour`

### Inputs

`MPButton` · `MPButtonGroup` · `MPCalendar` · `MPCheckbox` · `MPColorPicker` · `MPCombobox` · `MPCommandPalette` · `MPDatePicker` · `MPDateRangePicker` · `MPDateTimePicker` · `MPFieldset` · `MPFilePicker` · `MPFloatingActionButton` · `MPForm` · `MPIconButton` · `MPMenu` · `MPMenubar` · `MPNumberField` · `MPOtpField` · `MPRadioGroup` · `MPRating` · `MPSegmentedButton` · `MPSelect` · `MPSlider` · `MPSwitch` · `MPTextField` · `MPTimePicker` · `MPToggle` · `MPToggleGroup` · `MPTransfer` · `MPTreeSelect`

### Layout

`MPAccordion` · `MPAspectRatio` · `MPBottomNavigation` · `MPBox` · `MPCard` · `MPCarousel` · `MPCollapsible` · `MPContainer` · `MPDrawer` · `MPFloatingBottomNavigation` · `MPFooter` · `MPGrid` · `MPHeader` · `MPMockup` · `MPNavigationMenu` · `MPPageLayout` · `MPPanes` · `MPScrollArea` · `MPScrollZone` · `MPShow` · `MPSidebar` · `MPStack` · `MPTabs` · `MPToolbar`

### Transitions

`MPAnimateAppear` · `MPAnimateBlink` · `MPAnimateCounter` · `MPAnimateFade` · `MPAnimateFloat` · `MPAnimateGrow` · `MPAnimateHeadline` · `MPAnimateLighting` · `MPAnimateMarquee` · `MPAnimateReveal` · `MPAnimateRotate` · `MPAnimateScramble` · `MPAnimateShake` · `MPAnimateSlide` · `MPAnimateSplit` · `MPAnimateTyping` · `MPAnimateZoom`

<!-- components:end -->

## Changelog

[CHANGELOG.md](https://github.com/jooy2/material-plus-ui/blob/main/packages/flutter/CHANGELOG.md) holds this package's history, and [material-plus.cdget.com/changelog](https://material-plus.cdget.com/changelog) shows it beside the React package's. The two version independently, so a release on one side is not a release on the other.

## Development

```bash
flutter pub get
flutter test                  # widget tests
flutter analyze
dart run tool/generate.dart   # after adding a component or a demo
cd example && flutter run     # the gallery, on any device
```

The gallery under `example/` is also what the documentation site embeds behind every Flutter preview, and its files under `example/lib/demos/` are the exact Dart the site quotes, so a snippet in the docs is code the analyser has checked.

## License

MIT © [CDGet](https://cdget.com)
