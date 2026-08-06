/**
 * Puts the repository's own `CHANGELOG.md` on the docs site.
 *
 * There is one changelog and it lives at the root, where a reader browsing the
 * repository and every npm tool already expects to find it. Keeping a second
 * copy under `docs/` would be two files that say the same thing until the day
 * one of them does not, so the docs' copy is generated instead — written before
 * VitePress starts and ignored by git.
 *
 * The only thing added is the frontmatter: the sidebar reads `title` for the
 * label and `order` for where it sits, and the source file cannot carry either
 * without npm and GitHub rendering it as a stray table at the top.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** One entry per locale served by the docs. Keep in step with `supportLocales`. */
const titles = {
  en: 'Changelog',
  ko: '변경 기록'
};

const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');

for (const [locale, title] of Object.entries(titles)) {
  const target = resolve(root, 'docs', locale, 'changelog.md');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(
    target,
    `---\ntitle: ${title}\norder: 1\neditLink: false\n---\n\n${changelog}`,
    'utf8'
  );
}
