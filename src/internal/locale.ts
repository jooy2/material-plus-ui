/**
 * Which language the components speak, and where that answer comes from.
 *
 * Two sources, in this order, and the order is the whole design:
 *
 * 1. **The component's own `locale` prop.** One control in a different language
 *    from the page around it is a real thing — an admin editing a Japanese
 *    listing from a Korean dashboard — and a component library that cannot draw
 *    it has decided the page's language on the caller's behalf.
 * 2. **`MPLocaleProvider`, above it in the tree.** Which is what an application
 *    actually has: one language, set once, at the root.
 *
 * There is deliberately no third source. `navigator.language` is *not* consulted
 * as a fallback, and that is not an oversight — see the note on
 * `resolveNamespace` in `internal/i18n.ts`. The runtime's own locale differs
 * between the server that renders the markup and the browser that hydrates it,
 * so reading it would put a hydration mismatch in the one part of the page a
 * reader is looking at. `undefined` therefore means "the platform's default",
 * which `Intl` resolves consistently in both places.
 */
import * as React from 'react';
import { resolveNamespace, type MPMessages, type MPNamespace } from './i18n';

/**
 * `undefined` rather than `'en'`, and the distinction matters.
 *
 * With no provider the pickers hand `undefined` to `Intl`, which formats dates
 * in whatever the platform is set to — so a page that never mentions a locale
 * still writes dates the way its reader expects. It is only the words in the
 * table that fall back to English, because those are the ones the platform has
 * no opinion about.
 */
export const MPLocaleContext = React.createContext<string | undefined>(undefined);

/** The locale in force here: the prop if there is one, otherwise the provider's. */
export function useMPLocale(locale?: string): string | undefined {
  const inherited = React.useContext(MPLocaleContext);

  return locale ?? inherited;
}

/**
 * A namespace's strings with a caller's overrides on top.
 *
 * The overrides win over the translation, which wins over English. That order is
 * what makes an unsupported language a partial answer rather than a dead end: a
 * caller supplies the handful of words they care about and everything else is
 * still translated, or still English, rather than blank.
 *
 * The namespace is passed as the object from `internal/messages/`, not as its
 * name: it carries English with it, which is what lets a component that says one
 * word leave the other twelve namespaces out of the bundle entirely. The objects
 * are module constants, so the identity `useMemo` compares is stable.
 */
export function useMPMessages<Name extends keyof MPMessages>(
  namespace: MPNamespace<Name>,
  locale: string | undefined,
  overrides?: Partial<MPMessages[Name]>
): MPMessages[Name] {
  return React.useMemo(() => {
    const messages = resolveNamespace(namespace, locale);

    return overrides ? { ...messages, ...overrides } : messages;
  }, [namespace, locale, overrides]);
}
