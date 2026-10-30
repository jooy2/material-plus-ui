# Changelog

The Flutter package, `material_plus_ui`. The React package keeps its own history in [`packages/react/CHANGELOG.md`](https://github.com/jooy2/material-plus-ui/blob/main/packages/react/CHANGELOG.md), and the two version independently.

## vNext (2026--)

## 1.12.0 (2026-10-30)

The first release of Material Plus for Flutter: the components of the React package under the same names, the same parameter vocabulary and the same numbers, built on `package:flutter/widgets.dart` alone, with no dependencies.

### Added

- **The components of the React package**, under the same `MP` names and the same `size`, `color`, `variant`, `density` and `elevation` vocabulary: charts, display, feedback, inputs, layout, navigation and transitions. Four React components are not here because they answer problems only the DOM has or that no Flutter gesture means the same everywhere: `MPFlex`, `MPPortal`, `MPVisuallyHidden` and `MPContextMenu`. Each one's page names the Flutter equivalent.
- **`MPTheme`**, which derives every colour role from one source colour with the arithmetic of the React token sheet, so the same source colour gives the same hex values in both packages. It also carries MD3's type scale and the `material`, `rounded` and `sharp` corner presets, scopes to a subtree, and follows the platform's brightness when nothing pins it.
- **`MPConfigProvider` and `MPLocaleProvider`**, which set the defaults and the language for a subtree, as they do in the React package. With no locale anywhere, a component follows the app's `Localizations`.
- **Eighteen translations** under `package:material_plus_ui/locales.dart`, the same tables and keys as the React package, registered with `registerMPMessages`. The date pickers and the charts carry month and weekday names for the same eighteen languages and English, read off the Unicode CLDR data, with no `intl` dependency.
- **Selection handles and a text menu on every field that takes text**, drawn by the package because there is no Material to borrow them from: a long press on Android selects a word with handles in the theme's primary colour and a menu of cut, copy, paste, select all and share in the field's language, iOS shows its system menu, and a right click on a desktop opens the same menu. The OTP field, whose editor is hidden behind its boxes, has no handles; a long press or a right click there opens a menu with Paste in it.
