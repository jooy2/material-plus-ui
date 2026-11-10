# Changelog

The Flutter package, `material_plus_ui`. The React package keeps its own history in [`packages/react/CHANGELOG.md`](https://github.com/jooy2/material-plus-ui/blob/main/packages/react/CHANGELOG.md), and the two version independently.

## vNext (2026--)

### Breaking changes

- **A field's `floatingLabel` is a `bool?` now.** It was a `bool` that defaulted to `true`, and it is `null` when left out so that `MPConfigProvider` can decide it. Passing a value works as it did. Code that reads the field off a widget, such as `field.floatingLabel`, reads `field.floatingLabel ?? true` instead. The widgets are `MPTextField`, `MPSelect`, `MPCombobox`, `MPNumberField`, `MPColorPicker`, `MPTreeSelect`, `MPDatePicker`, `MPDateRangePicker`, `MPDateTimePicker` and `MPTimePicker`.

### Added

- **`MPConfigProvider` takes `labels`, for the words the components say on their own behalf.** It is keyed by namespace and then by key, the shape `registerMPMessages` takes, and is a partial: `{'alert': {'dismiss': 'Hide'}}` renames one button for the whole subtree and leaves every other word as the locale has it. A component's own `labels` still wins, and nested providers merge a word at a time.
- **`MPConfigProvider` takes `floatingLabel` and `weekStartsOn`.** `floatingLabel: false` keeps the label of every field under it in the notch from the start, and `weekStartsOn` sets the first day of the week in `MPCalendar`, `MPDatePicker`, `MPDateRangePicker` and `MPDateTimePicker` instead of taking it from the date names. A component's own parameter still wins over both.

### Fixed

- **A field at the top of an `MPDialog` body shows its floated label whole when the body scrolls, and a button at its top or bottom shows its focus ring whole.** The scroll view clips at its edges once what it holds overflows, and its padding sat outside it, so it kept no room inside them. A label that has risen to the border sits half above its field, so the body cut off 6px of it, and it cut off a focus ring at its top, its bottom and its sides. The padding is inside the scroll view now, with room for both, and the gaps around the body give that room back, so nothing on the sheet moves. A ruled body scrolls up to the rule, as it does in React, instead of disappearing one padding short of it.
- **Two equal `MPConfigValue`s hash alike when their `breakpoints` are in another order.** `==` compared the boundaries by window class, and `hashCode` read them in order, so a value used as a key in a `Map` or a `Set` could miss its equal.

## 1.13.0 (2026-11-05)

This release comes out of running the package on iPhone, iOS Simulator and Android emulator screens in `examples/flutter`, an app now in the repository with every component in it. A menu row's `shortcut` is written in `MPShortcut`'s notation, the one change an app will notice without having met a bug. The rest are fixes from those screens: the system back closed the page under an `MPConfirmProvider` question rather than the question, popups ran off the edge of the screen, a calendar cut the name of its month short, components ran past the edge of a phone, and shortcuts, dates and times were reordered under a right-to-left page.

### Changed

- **A `shortcut` on a menu row is written in `MPShortcut`'s notation.** `MPMenuItem`, `MPMenuCheckboxItem` and `MPMenuRadioItem` printed the string as they were given it, so the `Mod+N` the documentation's menubar wrote, which `MPCommandPalette` already reads that way, came out as the letters `Mod+N`. It now reads `⌘N` on a Mac and `Ctrl+N` everywhere else, as text rather than key caps, and is read out by the names of its keys; a string with no key name in it, such as `⌘C`, is drawn as it is.

### Documentation

- **The Flutter snippets name their pictures by a full address.** They named them by the documentation site's own path, `/samples/...`, which only resolves on that site, so a snippet copied into an app on a phone or a desktop drew an empty box where the picture should be.

### Fixed

- **A progress ring shows whole in the leading slot of an `MPPill`.** The slot is a glyph's size, 20px on a medium pill, and the smallest `MPProgressCircular` is 24px across, so an upload pill overflowed its slot and the circle the slot is clipped to kept half a pixel of the ring. Anything larger than the slot is scaled down to it now, and a glyph that fits is drawn at its own size.
- **An `MPOtpField` fits a phone.** Its slots kept the width of their rung, so six medium slots, 328 wide, ran past the edge of a 360 phone with 24px margins, and a grouped code further still. The slots narrow to fit a row too small for them now, all by the same amount, and keep their height.
- **An `MPPagination` too wide for what holds it goes on to a second line.** Eleven cells, which a long list with its edges shown has, ran past the edge of a phone. The cells wrap now, every line centred, and an ellipsis takes the width of a cell rather than a line of its own.
- **A calendar shows the whole name of its month.** The header had the grid's width and no more, so `September`, `November` and `December` were cut short at the default size, and nearly every month at `xs` and `sm`, in `MPCalendar` and in the popups of the date pickers. A calendar now widens to its header where the header needs it, as the React popup does, by the room its longest month needs, so it keeps one width from month to month; the grid stays seven cells wide in the middle.
- **A popup opened beside the edge of the screen stays on it.** A popup only flipped to the other side of its anchor, so an `MPPopover`, `MPPopconfirm`, `MPTooltip`, `MPHoverCard` or menu centred on a button at the side of a phone ran off the screen and cut its first words off. One that would run off now slides back on to the screen, 8px from the edge, and its arrow moves the other way so it still points at the anchor. The slide is decided when the side is, so it does not move with a scroll.
- **A horizontal `MPNavigationMenu` wider than its room scrolls along.** Three items with panels ran past the edge of a phone. The bar scrolls sideways now, and an item the arrow keys reach is scrolled into view with its focus ring; the scroller reaches past the bar by the ring's width, so a ring at the edge is not cut off, and a bar that fits takes the room it took before.
- **A shortcut reads left to right under a right-to-left page.** `MPShortcut` laid its caps out the page's way, so `Ctrl+Shift+P` came out `P + Shift + Ctrl`, and a menu row's `⌘⇧P` came out `P⇧⌘`. Both run left to right now, as Arabic and Hebrew write a shortcut.
- **A date or a time a picker shows reads in its own language's direction.** Under a page laid out the other way it was reordered: a Korean `2026. 11. 5.` under an Arabic page read `.5 .11 .2026`, and `3:30 PM` read `PM 3:30`. The value in `MPDatePicker`, `MPTimePicker`, `MPDateTimePicker` and `MPDateRangePicker` is now drawn in the direction of its first letter, as HTML's `<bdi>` decides it, and placed where the page's text starts.
- **The system back closes an `MPConfirmProvider` question instead of the page under it.** A provider in `WidgetsApp.builder`, where its documentation puts it, sits above the navigator and in no route, so Android's back button popped the page the question was asked from and left the question on screen. The back now answers the question `false`, as Escape does, and a question that is not `dismissible` keeps the back from doing anything.

## 1.12.0 (2026-10-30)

The first release of Material Plus for Flutter: the components of the React package under the same names, the same parameter vocabulary and the same numbers, built on `package:flutter/widgets.dart` alone, with no dependencies.

### Added

- **The components of the React package**, under the same `MP` names and the same `size`, `color`, `variant`, `density` and `elevation` vocabulary: charts, display, feedback, inputs, layout, navigation and transitions. Four React components are not here because they answer problems only the DOM has or that no Flutter gesture means the same everywhere: `MPFlex`, `MPPortal`, `MPVisuallyHidden` and `MPContextMenu`. Each one's page names the Flutter equivalent.
- **`MPTheme`**, which derives every colour role from one source colour with the arithmetic of the React token sheet, so the same source colour gives the same hex values in both packages. It also carries MD3's type scale and the `material`, `rounded` and `sharp` corner presets, scopes to a subtree, and follows the platform's brightness when nothing pins it.
- **`MPConfigProvider` and `MPLocaleProvider`**, which set the defaults and the language for a subtree, as they do in the React package. With no locale anywhere, a component follows the app's `Localizations`.
- **Eighteen translations** under `package:material_plus_ui/locales.dart`, the same tables and keys as the React package, registered with `registerMPMessages`. The date pickers and the charts carry month and weekday names for the same eighteen languages and English, read off the Unicode CLDR data, with no `intl` dependency.
- **Selection handles and a text menu on every field that takes text**, drawn by the package because there is no Material to borrow them from: a long press on Android selects a word with handles in the theme's primary colour and a menu of cut, copy, paste, select all and share in the field's language, iOS shows its system menu, and a right click on a desktop opens the same menu. The OTP field, whose editor is hidden behind its boxes, has no handles; a long press or a right click there opens a menu with Paste in it.
