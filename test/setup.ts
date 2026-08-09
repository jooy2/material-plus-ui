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
