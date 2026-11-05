/**
 * Copies the documentation's sample pictures into `public/`, because the demos
 * address them as `/samples/...` from the root of the site they run on.
 */
import { cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const from = fileURLToPath(new URL('../../../docs/public/samples', import.meta.url));
const to = fileURLToPath(new URL('../public/samples', import.meta.url));

rmSync(to, { force: true, recursive: true });
cpSync(from, to, { recursive: true });
