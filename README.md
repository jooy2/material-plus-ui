<img src="docs/public/logo-large.png" alt="Material Plus" width="96" height="96">

# Material Plus

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jooy2/material-plus-ui/blob/main/LICENSE) [![npm latest package](https://img.shields.io/npm/v/material-plus-ui/latest.svg)](https://www.npmjs.com/package/material-plus-ui) [![npm downloads](https://img.shields.io/npm/dm/material-plus-ui.svg)](https://www.npmjs.com/package/material-plus-ui) [![pub package](https://img.shields.io/pub/v/material_plus_ui.svg)](https://pub.dev/packages/material_plus_ui)

Live previews and full props for every component, in both frameworks, are at [material-plus.cdget.com](https://material-plus.cdget.com). This README is the map; each package has a quick start of its own.

![Material Plus components arranged around the Material Plus mark: a search field, a settings card, radio buttons and checkboxes, buttons and chips, a segmented button and pagination, an alert, a slider, a progress bar and a meter, an avatar stack, a badge and a rating](.github/showcase.png)

---

> **Material Plus is Material Design 3, written from the specification and extended past it, in two libraries.** Over 120 components in **React** and in **Flutter**, under the same names, the same prop vocabulary and the same numbers.
>
> It follows the specification directly rather than wrapping somebody's implementation of it, so its colour roles, type scale and shapes are the ones MD3 names. Then it goes on past where the specification stops: a size ladder on every control, density on every container, and the components the specification never named at all, such as charts, a data table, a command palette, a tour and a transfer list.

## Highlights

- **Themed from one colour.** Material generates a whole scheme from a source colour, and so does this, with the same arithmetic in both packages: the same source colour gives the same hex values in React and in Flutter.
- **Learn it once, use it on both.** An `md` control is 56px in either framework, `primary` is the same role, and one documentation page covers the two.
- **Five props, not fifty.** `size`, `color`, `variant`, `density` and `elevation` mean the same thing on every component, so the tenth component costs nothing to learn after the first.
- **It coexists.** Nothing here is page-level or app-level. The React package adds no reset and reads the `--md-sys-color-*` tokens a page already has; the Flutter package needs no provider and sits inside a `MaterialApp`, a `CupertinoApp` or a bare `WidgetsApp`.
- **Accessible without the checklist.** Roles, labels, keyboard operation and focus management live inside the components.
- **Eighteen languages.** Every word a component says about itself is translated, and a translation is a table you register once.
- **Nothing you did not ask for.** The npm package is ESM and tree-shakeable. The pub package has no dependencies at all and imports neither Material nor Cupertino.

## Packages

| Package                                | Registry                                                                | Requires                          | Quick start                          |
| -------------------------------------- | ----------------------------------------------------------------------- | --------------------------------- | ------------------------------------ |
| [`packages/react`](packages/react)     | [npm: `material-plus-ui`](https://www.npmjs.com/package/material-plus-ui) | React 18 or 19, Node.js 22 or later | [README](packages/react/README.md)   |
| [`packages/flutter`](packages/flutter) | [pub.dev: `material_plus_ui`](https://pub.dev/packages/material_plus_ui)  | Flutter 3.41 or newer (Dart 3.11) | [README](packages/flutter/README.md) |

The two **version independently** and keep separate changelogs: [`packages/react/CHANGELOG.md`](packages/react/CHANGELOG.md) is the React package's and [`packages/flutter/CHANGELOG.md`](packages/flutter/CHANGELOG.md) the Flutter one's. A release on one side is not a release on the other, so the numbers will not always agree.

## Install

### React

```bash
npm install material-plus-ui
```

```css
/* your app's CSS entry point */
@import 'material-plus-ui/styles.css';
```

```tsx
import { MPButton, MPTextField } from 'material-plus-ui';

<MPTextField label="Email" type="email" />
<MPButton type="submit">Sign in</MPButton>
<MPButton variant="outlined">Cancel</MPButton>
```

`@base-ui/react`, `react` and `react-dom` are peer dependencies. The stylesheet is finished CSS: Tailwind CSS v4 builds this package and does not have to be installed in yours, though there is a second entry point for a project that already runs it. [**The React quick start**](packages/react/README.md) has the rest.

### Flutter

```bash
flutter pub add material_plus_ui
```

```dart
import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

MPButton(
  onPressed: save,
  child: const Text('Save'),
)
```

Nothing else to install: no dependencies, no assets, no platform channels and no provider. It is built on `package:flutter/widgets.dart` alone, so it drops into any Flutter app without bringing a second implementation of Material in behind it, and it is unaffected by Material and Cupertino moving out of the framework into `material_ui` and `cupertino_ui`. [**The Flutter quick start**](packages/flutter/README.md) has the rest.

## Theming

One colour, in either framework:

```css
:root {
  --mp-source-color: #7c3aed;
}
```

```dart
MPTheme(
  sourceColor: const Color(0xFF7C3AED),
  child: const App(),
)
```

Dark mode follows the platform in both. React drives it with `data-mp-scheme="dark"` or `.dark` on any element, Flutter with `MPTheme(brightness: Brightness.dark, ...)` on any subtree. To disagree with one generated role, set that role: `--mp-sys-color-outline` in CSS, `MPColorScheme.fromSource(...).copyWith(outline: ...)` in Dart.

## Documentation

| Page                                                                                 | What you will find                                                                   |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| [**Getting started**](https://material-plus.cdget.com/guide/getting-started)         | Install and setup, end to end, in either framework.                                  |
| [**All components**](https://material-plus.cdget.com/components/)                    | Every component, one page each: live previews and the full props table.              |
| [**Material Plus and `material_ui`**](https://material-plus.cdget.com/guide/flutter-material-ui) | What the Flutter package adds to Flutter's own Material library, and when to use which. |
| [**A2UI catalog**](https://material-plus.cdget.com/guide/a2ui)                       | Rendering an agent's interface with the React package.                               |
| [**Prop conventions**](https://material-plus.cdget.com/design/prop-conventions)      | The shared vocabulary every component draws from.                                    |
| [**Colour**](https://material-plus.cdget.com/design/color)                           | The roles, how they are derived from the source colour, and how to theme them.       |
| [**Changelog**](https://material-plus.cdget.com/changelog)                           | What changed in each release of either package.                                      |

Also available in Korean / 한국어 문서: **[material-plus.cdget.com/ko/](https://material-plus.cdget.com/ko/)**

## Components

Every component is exported under an `MP` prefix, in both packages. The props are the same props under Dart's names, and each component's page says exactly what differs.

A **†** marks a component that is React-only. `MPFlex`, `MPPortal` and `MPVisuallyHidden` answer problems only the DOM has, and the Flutter answer is a line of framework code rather than a widget. `MPContextMenu` is React-only for a reason of its own: no right-click gesture means the same thing on every platform Flutter runs on, so a Flutter app opens an `MPMenu` from `onLongPress` or `onSecondaryTap` itself. Each page names the Flutter equivalent.

<!-- components:start -->

### Charts

`MPAreaChart` · `MPBarChart` · `MPGaugeChart` · `MPHeatmapChart` · `MPLineChart` · `MPPieChart` · `MPScatterChart` · `MPSparkline` · `MPTimelineChart`

### Display

`MPAnchor` · `MPAppLogo` · `MPAvatar` · `MPBadge` · `MPBlockquote` · `MPBreadcrumb` · `MPChatBubble` · `MPChip` · `MPCodeBlock` · `MPDataList` · `MPDataTable` · `MPDivider` · `MPHighlight` · `MPIcon` · `MPImage` · `MPList` · `MPPagination` · `MPPill` · `MPShortcut` · `MPSpoiler` · `MPStatistic` · `MPStepper` · `MPTable` · `MPTextLink` · `MPTimeline` · `MPTreeView` · `MPTypography` · `MPVisuallyHidden`†

### Feedback

`MPAlert` · `MPConfirmProvider` · `MPDialog` · `MPEmpty` · `MPHoverCard` · `MPMeter` · `MPOverlay` · `MPPopconfirm` · `MPPopover` · `MPProgressBox` · `MPProgressCircular` · `MPProgressLinear` · `MPSkeleton` · `MPSnackbarProvider` · `MPTooltip` · `MPTour`

### Inputs

`MPButton` · `MPButtonGroup` · `MPCalendar` · `MPCheckbox` · `MPColorPicker` · `MPCombobox` · `MPCommandPalette` · `MPContextMenu`† · `MPDatePicker` · `MPDateRangePicker` · `MPDateTimePicker` · `MPFieldset` · `MPFilePicker` · `MPFloatingActionButton` · `MPForm` · `MPIconButton` · `MPMenu` · `MPMenubar` · `MPNumberField` · `MPOtpField` · `MPRadioGroup` · `MPRating` · `MPSegmentedButton` · `MPSelect` · `MPSlider` · `MPSwitch` · `MPTextField` · `MPTimePicker` · `MPToggle` · `MPToggleGroup` · `MPTransfer` · `MPTreeSelect`

### Layout

`MPAccordion` · `MPAspectRatio` · `MPBottomNavigation` · `MPBox` · `MPCard` · `MPCarousel` · `MPCollapsible` · `MPContainer` · `MPDrawer` · `MPFlex`† · `MPFloatingBottomNavigation` · `MPFooter` · `MPGrid` · `MPHeader` · `MPMockup` · `MPNavigationMenu` · `MPPageLayout` · `MPPanes` · `MPPortal`† · `MPScrollArea` · `MPScrollZone` · `MPShow` · `MPSidebar` · `MPStack` · `MPTabs` · `MPToolbar`

### Transitions

`MPAnimateAppear` · `MPAnimateBlink` · `MPAnimateCounter` · `MPAnimateFade` · `MPAnimateFloat` · `MPAnimateGrow` · `MPAnimateHeadline` · `MPAnimateLighting` · `MPAnimateMarquee` · `MPAnimateReveal` · `MPAnimateRotate` · `MPAnimateScramble` · `MPAnimateShake` · `MPAnimateSlide` · `MPAnimateSplit` · `MPAnimateTyping` · `MPAnimateZoom`

<!-- components:end -->

## Setting defaults

`size`, `color`, `density` and the language can be decided once for an application rather than at every call site. Optional: the library is finished without it.

```tsx
import { MPConfigProvider } from 'material-plus-ui';

<MPConfigProvider size="sm" density={-1} locale="ko">
  <App />
</MPConfigProvider>;
```

```dart
MPConfigProvider(
  size: MPSize.sm,
  density: -1,
  locale: 'ko',
  child: const App(),
)
```

A component's own prop beats the set it is in, which beats the provider. [The guide](https://material-plus.cdget.com/guide/config) has the long version.

## Hooks

React-only, and the machinery the library already ran on rather than anything new. `useMPColorScheme`, `useMPDisclosure`, `useMPElementSize`, `useMPMediaQuery`, `useMPOnScreen`, `useMPReducedMotion`, `useMPShortcut` and `useMPWindowClass` are imported from the barrel or from `material-plus-ui/hooks`. Flutter answers the same questions with framework calls (`MediaQuery`, `MPTheme`, `MPConfigProvider`), and each hook's page names the Dart equivalent.

## Development

One design system, three things built out of it. Each is entered and run on its own; there is no install at the repository root and no root `package.json`.

```bash
cd packages/react
npm install           # also builds, via `prepare`
npm test              # Vitest, in a real browser
npm run typecheck
npm run lint
```

```bash
cd packages/flutter
flutter pub get
flutter test          # widget tests
flutter analyze
cd example && flutter run   # the gallery, on any device
```

```bash
cd docs
npm install
npm run flutter:demos # compiles the gallery into public/flutter (needs the Flutter SDK)
npm run dev           # VitePress: the develop-and-look loop for both packages
npm run build
```

The site renders the React components from `packages/react/src` and embeds the Flutter gallery as a frame per preview, so `npm run dev` shows both. An edit to a React component shows up immediately; the Flutter side is rebuilt with `npm run flutter:demos -- --force`.

## Contributing

Anyone can contribute to the project by reporting new issues or submitting a pull request. [CONTRIBUTING.md](CONTRIBUTING.md) has the rest: where things live, and how a change to a component is expected to arrive. Participation is subject to the [Code of Conduct](CODE_OF_CONDUCT.md).

To report a security issue, follow the process in [SECURITY.md](SECURITY.md) instead of opening a public issue.

For anything else, reach the maintainers at [cdget.com/contact](https://cdget.com/contact).

## Sponsor

Material Plus is free to use and maintained in the open. If it saves you time, you can support the work at [cdget.com/donate](https://cdget.com/donate) or through the Sponsor button on GitHub.

## License

[MIT](LICENSE) © [CDGet](https://cdget.com)
