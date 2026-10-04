import * as React from 'react';
import { MPLocaleContext, useMPLocale } from '../../internal/locale';

export interface MPLocaleProviderProps {
  /**
   * A BCP 47 tag — `ko`, `ja`, `pt-BR`, `zh-Hant`.
   *
   * It reaches two different systems and they degrade differently, which is
   * worth knowing before choosing one:
   *
   * - **`Intl` formats the dates and the numbers**, and speaks every language
   *   the platform does. A tag with no entry in this library's own table still
   *   gets month names, weekday names, AM/PM and the right date order.
   * - **This library's table supplies the words `Intl` has no opinion about** —
   *   "Previous month", "Today", "Hour". Those fall back to English for a tag it
   *   does not carry, and a `labels` prop on the component fills the gap.
   *
   * Left `undefined` the platform's own default is used for the first and
   * English for the second, which is exactly what a component with no provider
   * over it does.
   */
  locale?: string;
  /**
   * The tag dates and numbers are written in on the server, and while the page
   * hydrates, when `locale` is left `undefined`. Once the page has hydrated, the
   * reader's own default takes over.
   *
   * For a server-rendered page that wants to follow the reader's browser but
   * cannot tell their language on the server. Without it the server writes in
   * its own machine's locale, the browser's first render writes in the reader's,
   * and React discards the server's markup over the difference. With it the two
   * agree, and the formatted values are rewritten once after hydration instead.
   *
   * Ignored when `locale` is set, which already agrees on both sides.
   */
  serverLocale?: string;
  children?: React.ReactNode;
}

/**
 * The language the components speak, set once for everything under it.
 *
 * Wrap the application. Every component in this library that writes a word or
 * formats a date takes a `locale` prop of its own, and this is where that prop
 * gets its default — so a form of four pickers is one decision rather than four.
 *
 * ```tsx
 * <MPLocaleProvider locale="ko">
 *   <App />
 * </MPLocaleProvider>
 * ```
 *
 * ## Why it is not a whole theme object
 *
 * Everything else a provider might carry here is already a CSS custom property:
 * the colour roles, the type scale, the corners, the motion durations. Those
 * reach a component through the cascade, which means a section of a page can
 * differ from the rest of it without a second provider and without a re-render.
 * A locale cannot travel that way — it decides which *string* is rendered, not
 * how one is painted — so it is the one thing left that needs context, and this
 * provider carries that and nothing else.
 *
 * ## Nesting
 *
 * Providers nest, and the nearest one wins. A page in Korean with one section
 * showing a Japanese listing's dates is two providers, and the inner one does
 * not have to restate anything: there is only the one value.
 */
/** Nothing ever changes, so there is nothing to listen to. */
const subscribe = () => () => {};
/** In a browser past hydration: the platform's own locale. */
const platform = () => undefined;

export function MPLocaleProvider({ locale, serverLocale, children }: MPLocaleProviderProps) {
  /*
   * `useSyncExternalStore` because it is the one API with a server snapshot,
   * and React reads that snapshot on the server and again in the browser while
   * it hydrates — so both renders format in `serverLocale`, and the render after
   * hydration formats in the reader's. A component mounted later, on the client
   * alone, reads the reader's from the start.
   */
  const unset = React.useSyncExternalStore(subscribe, platform, () => serverLocale);

  return <MPLocaleContext.Provider value={locale ?? unset}>{children}</MPLocaleContext.Provider>;
}

/**
 * The locale in force at this point in the tree.
 *
 * Exported because an application that has told this library its language should
 * not have to tell itself the same thing twice — the same tag is what its own
 * `Intl.NumberFormat` calls want. Passing an argument makes it the
 * prop-beats-provider resolution the components themselves use, which is what a
 * wrapper component around one of them wants.
 */
export { useMPLocale };
