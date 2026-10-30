/**
 * Every Flutter props table, gathered from `props-flutter/*.ts`.
 *
 * One file per component page rather than one file for the site, because the
 * components are being ported one page at a time and a single file would be a
 * merge conflict per port. Each file exports `default { MPFoo: PropRow[] }`;
 * this reads them all at build time and flattens them into the same shape as
 * `propTables` in `props.ts`.
 *
 * `shared.ts` is the helpers those files are written with, not a page, so it is
 * left out of the glob.
 *
 * Read by `theme/components/PropsTable.vue` only. `import.meta.glob` is Vite's,
 * so nothing that runs outside Vite (`config.ts` among them) can import this.
 */

import type { PropRow } from './props';

const pages = import.meta.glob<Record<string, PropRow[]>>(
  ['./props-flutter/*.ts', '!./props-flutter/shared.ts'],
  { eager: true, import: 'default' }
);

function gather(): Record<string, PropRow[]> {
  const tables: Record<string, PropRow[]> = {};

  // Sorted so that which file wins a clash does not depend on the glob's order.
  for (const path of Object.keys(pages).sort()) {
    for (const [component, rows] of Object.entries(pages[path] ?? {})) {
      if (tables[component]) {
        console.warn(
          `[material-plus-ui docs] ${component} has a Flutter props table twice; ${path} wins`
        );
      }

      tables[component] = rows;
    }
  }

  return tables;
}

export const flutterPropTables: Record<string, PropRow[]> = gather();
