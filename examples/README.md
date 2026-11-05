# Examples

Two small apps built with Material Plus, for trying the libraries the way a consumer uses them. `packages/flutter/example` and the demos in `docs/` show one component at a time; these put components together on real screens, on the platforms the documentation site cannot show.

Each app has two halves:

- **Screens of a real app**: figures and charts, an inbox, orders in a table, a form in steps, overlays and settings. Tests drive these the way a person does.
- **Every component demo**: the same files the documentation shows, so a component can be looked at on a device on its own.

None of this is published to npm or pub.dev.

## Flutter: `examples/flutter`

iOS, iPadOS and Android. It needs Flutter and either Xcode or the Android SDK.

```bash
cd examples/flutter
flutter pub get
flutter devices
flutter run -d <device>
```

Five destinations are in the bottom bar on a phone and in a sidebar on a tablet. **More** leads to the overlays, the media screen and **Components**, which holds every demo. The theme, the direction, the density, the language of the library's own words, the source colour and the text size are on the same screen.

The app is a `WidgetsApp`, with no `MaterialApp` and no `Scaffold`, so it does for itself what a `Scaffold` would: the screens end where the keyboard begins, and a snackbar raised from a screen with the bottom bar sits above the bar.

The iOS project's deployment target is 15.0, because Xcode 27 refuses the 13.0 that `flutter create` still writes.

### Tests

On the host, which is what CI runs:

```bash
flutter test
```

`test/app_test.dart` runs the flows in `integration_test/flows.dart` at the size of a phone and of a tablet. `test/demos_test.dart` lays out every demo at three screen widths and fails on any overflow, any exception, and any picture named by a path a phone cannot load.

On a simulator or an emulator, which is what shows how the device's own renderer draws them:

```bash
flutter drive --driver test_driver/integration_test.dart --target integration_test/app_test.dart --keep-app-running -d <device>
```

```bash
flutter drive --driver test_driver/integration_test.dart --target integration_test/demos_test.dart --keep-app-running -d <device>
```

Both save a screenshot of every step inside the app, and `--keep-app-running` keeps the app so they can be copied off:

```bash
tool/pull_screenshots.sh ios <simulator id> <folder>
```

```bash
tool/pull_screenshots.sh android <emulator serial> <folder>
```

A simulator or an emulator can run without a window, so a run takes no focus from the desktop: `xcrun simctl boot <simulator id>` boots one without opening the Simulator app, and `emulator -avd <name> -no-window -no-audio` starts an Android one.

On a real iPhone, run in profile mode, which draws what a user's phone draws. The project holds no signing team: Flutter picks the one in your keychain, or `FLUTTER_XCODE_DEVELOPMENT_TEAM=<team id>` names it. Keep the phone unlocked, and allow the Local Network prompt on the first run:

```bash
flutter drive --driver test_driver/integration_test.dart --target integration_test/app_test.dart --keep-app-running --profile -d <device>
```

```bash
tool/pull_screenshots.sh ios-device <device id> <folder>
```

`--dart-define=MP_THEME=dark` runs the demos in the dark theme, `--dart-define=MP_DEMOS=button,text-field` runs some of the components, `--dart-define=MP_SETTLE_MS=2000` gives each demo longer to settle, which a picture off a slow network needs, and `--dart-define=MP_OFFLINE=true` stops a picture the network turned away from counting as a failure.

## Electron: `examples/electron`

The React package in a window with the sandbox on, context isolation on, a Content Security Policy, and an `mp://` scheme of its own rather than `file://`. It installs `material-plus-ui` from `packages/react`, so build that first:

```bash
cd packages/react
npm install
npm run build
```

```bash
cd examples/electron
npm install
npm run dev
```

The sidebar holds the documentation's whole-screen examples, an inbox, the overlays, a screen of what only a desktop app does (files from the disk, highlighted code, the clipboard), **Components**, which holds every demo, and the settings.

### Tests

```bash
npm test
```

`test/app.spec.ts` drives the built app through Playwright and fails on any console error or warning, and `test/demos.spec.ts` opens every demo. Setting `MP_SHOTS=1` saves a screenshot of each one under `shots/`.

The tests never show the window. `test/support.ts` starts the app with `MP_HIDDEN` set, under which the window is created with `show: false` and never shown, the page keeps drawing with background throttling off, and on macOS the app is an accessory, with no Dock icon, so it never comes to the front. A test checks that the window stayed hidden and unfocused. Linux still needs a display for Electron to start, which CI gives it with `xvfb-run`.
