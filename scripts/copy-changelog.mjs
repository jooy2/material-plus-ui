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
 *
 * `description` is there for the same reason but answers to a different reader.
 * It is the one page on the site whose opening paragraph is not about the page
 * — it is about whichever release happens to be newest — so both the `<meta>`
 * and the site's `llms.txt` would otherwise describe the changelog as the
 * contents of its top entry.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** One entry per locale served by the docs. Keep in step with `supportLocales`. */
const locales = {
  en: {
    title: 'Changelog',
    description: 'Every release of Material Plus, newest first — what was added, and what changed.'
  },
  ko: {
    title: '변경 기록',
    description: 'Material Plus의 모든 릴리스를 최신순으로. 무엇이 추가되고 무엇이 바뀌었는지.'
  }
};

const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');

for (const [locale, { title, description }] of Object.entries(locales)) {
  const target = resolve(root, 'docs', locale, 'changelog.md');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(
    target,
    `---\ntitle: ${title}\ndescription: ${description}\norder: 1\neditLink: false\n---\n\n${changelog}`,
    'utf8'
  );
}
