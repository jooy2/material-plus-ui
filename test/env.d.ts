/**
 * Vite serves a `?inline` import as the transformed stylesheet's text rather
 * than as a side effect that adds a `<style>` to the page. `test/` does not
 * pull in `vite/client`, so the one form the suite uses is declared here.
 */
declare module '*.css?inline' {
  const css: string;
  export default css;
}
