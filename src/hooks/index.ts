/**
 * The machinery this library was already running, with a name a consumer can
 * import.
 *
 * Two kinds live here, and both are the same argument.
 *
 * The first existed in `internal/` before it existed here, and was exported
 * because an application that has told the library something — or that has to
 * answer a question the library has already answered for itself — should not
 * have to answer it a second time, in numbers or in detection code that can
 * drift away from what the components are using.
 *
 * The second is the general form of something the library does several times
 * over and could not export as it stood. `useMPWindowClass` watches four media
 * queries; `useMPMediaQuery` is one. `MPTabs` measures its own bar;
 * `useMPElementSize` is that measurement. `trigger="visible"` watches an
 * element cross the viewport; `useMPOnScreen` is the watching without the
 * animation. And `useMPDisclosure` is the six lines every page writes to open a
 * dialog, with the two details a version written in a hurry leaves out.
 *
 * `useMPLocale` and `useMPSnackbar` are not here. They belong to a provider and
 * live with it, the way a hook that reads a context should.
 *
 * `useMPColorScheme` is the one that is more than a rename: the stylesheet
 * had the switch and nothing to drive it with, so every application wrote the
 * same state, the same storage round trip and the same `<head>` script.
 */
export { useMPColorScheme, mpColorSchemeScript } from './useMPColorScheme';
export type {
  MPColorScheme,
  MPResolvedColorScheme,
  MPColorSchemeOptions,
  MPColorSchemeResult
} from './useMPColorScheme';
export { useMPWindowClass } from './useMPWindowClass';
export { useMPReducedMotion } from './useMPReducedMotion';
export { useMPShortcut, useMPPlatform } from './useMPShortcut';
export { useMPMediaQuery } from './useMPMediaQuery';
export { useMPElementSize } from './useMPElementSize';
export type { MPElementSize } from './useMPElementSize';
export { useMPOnScreen } from './useMPOnScreen';
export type { MPOnScreenOptions } from './useMPOnScreen';
export { useMPDisclosure } from './useMPDisclosure';
export type { MPDisclosure } from './useMPDisclosure';
export type { MPShortcutOptions, MPResolvedOS } from './useMPShortcut';
