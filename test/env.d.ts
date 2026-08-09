/**
 * Vite serves a `?inline` import as the transformed stylesheet's text rather
 * than as a side effect that adds a `<style>` to the page. `test/` does not pull
 * in `vite/client`, so the two forms the suite uses are declared here.
 */
declare module '*.css?inline' {
  const css: string;
  export default css;
}

/** A plain stylesheet import, for its side effect. See `test/setup.ts`. */
declare module '*.css' {}
