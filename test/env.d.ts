/**
 * Vite serves a `?inline` import as the transformed stylesheet's text rather
 * than as a side effect that adds a `<style>` to the page. `test/` does not pull
 * in `vite/client`, so the three forms the suite uses are declared here.
 */
declare module '*.css?inline' {
  const css: string;
  export default css;
}

/**
 * And `?raw` as the file on disk, untouched.
 *
 * `?inline` is the *compiled* sheet — Tailwind has run, so `@variant mp-medium`
 * has already become a width and the `@theme` block has been pruned to what the
 * scan used. A test that is about what `src/styles.css` declares rather than
 * about what it compiles to has to read the source.
 */
declare module '*.css?raw' {
  const css: string;
  export default css;
}

/** A plain stylesheet import, for its side effect. See `test/setup.ts`. */
declare module '*.css' {}
