/**
 * `markdown-it-container` ships no types, and there is no `@types` package for
 * it. One line is cheaper than a wrapper, and the only thing `config.ts` does
 * with it is hand it to `md.use()`.
 */
declare module 'markdown-it-container';
