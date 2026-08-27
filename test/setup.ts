/**
 * Gives the component tests the stylesheet the components are actually styled
 * by.
 *
 * The library used to be built out of `@mui/material`, so Emotion injected every
 * rule at runtime and a test only had to render. Now the styling is Tailwind
 * utilities in a real stylesheet, and nothing puts that stylesheet on the page
 * unless a test asks for it — which would quietly turn every assertion about a
 * computed style into an assertion about the browser's defaults.
 *
 * `src/standalone.css` rather than `dist/styles.css` on purpose: importing the
 * source runs Tailwind through Vite's PostCSS on the spot, against the `.tsx` in
 * `src/`, so a class a component gained this second is present without a build
 * in between. (`test/styles/standalone.test.tsx` is the one file that does read
 * `dist/`, because what it is testing *is* the build output.)
 */
import '../src/standalone.css';

/**
 * And gives them the eighteen translations, which the library no longer carries
 * on its own.
 *
 * A table now reaches the library only when an application hands it over — see
 * `src/locales/index.ts` for why — so a suite that says nothing would find every
 * component speaking English and every localisation test asserting against a
 * language that was never registered. This is the one line an application
 * writes, written once here on behalf of all of them.
 *
 * The tests that are about the registry itself rather than about a translation
 * — the fallback for a language nobody registered, a table replacing another —
 * live in `test/components/locale/MPLocaleProvider.test.tsx` and pick tags this
 * line does not cover.
 */
import { registerMPMessages } from '../src';
import { LOCALES } from '../src/locales';

registerMPMessages(...LOCALES);
