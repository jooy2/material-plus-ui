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
export function MPLocaleProvider({ locale, children }: MPLocaleProviderProps) {
  return <MPLocaleContext.Provider value={locale}>{children}</MPLocaleContext.Provider>;
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
