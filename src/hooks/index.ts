/**
 * The machinery this library was already running, with a name a consumer can
 * import.
 *
 * Every hook here existed in `internal/` before it existed here, and each was
 * exported for the same reason: an application that has told the library
 * something — or that has to answer a question the library has already answered
 * for itself — should not have to answer it a second time, in numbers or in
 * detection code that can drift away from what the components are using.
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
export type { MPShortcutOptions, MPResolvedOS } from './useMPShortcut';
