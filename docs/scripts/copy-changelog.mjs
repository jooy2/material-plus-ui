/**
 * Puts both packages' `CHANGELOG.md` on the docs site, as one page with the
 * framework switch on it.
 *
 * Each package keeps its changelog beside its manifest, where npm, pub.dev and a
 * reader browsing the repository all expect to find it. Keeping a second copy
 * under `docs/` would be two files that say the same thing until the day one of
 * them does not, so the docs' copy is generated instead — written before
 * VitePress starts and ignored by git.
 *
 * The two histories go in `::: fw` blocks rather than on two pages, which is
 * what every other page on this site does with a difference between the
 * frameworks: the switch is instant, both halves are in the search index, and a
 * reader who chose Flutter finds the Flutter history under the same link.
 * `theme/components/Layout.vue` drops an outline entry whose heading is inside a
 * hidden block, so the contents list shows one package's versions rather than
 * two interleaved sets of them.
 *
 * **React's half is written first, and that is not a preference.** Anchors are
 * made unique in the order they are rendered, so a second `### Added` becomes
 * `#added-1`. Putting Flutter first would renumber every anchor in the React
 * history, and those are the links that have been handed out.
 *
 * Each file's own `#` heading goes, and so does anything between it and the
 * first release, because the page has a heading and a lede of its own. The
 * frontmatter is added: the sidebar reads `title` for the label and `order` for
 * where it sits, and a source file cannot carry either without npm and GitHub
 * rendering it as a stray table at the top.
 *
 * `description` is there for the same reason but answers to a different reader.
 * It is the one page on the site whose opening paragraph would not be about the
 * page, so both the `<meta>` and the site's `llms.txt` would otherwise describe
 * the changelog as the contents of its top entry.
 *
 * ## Why each history is `v-pre`
 *
 * Because a changelog for a React library writes JSX, and JSX writes `{{`. An
 * entry explaining `direction={{ compact: 'column' }}` is a page VitePress
 * cannot build at all: Vue reads a mustache as an interpolation wherever it
 * finds one — inside an inline code span included — and tries to compile the
 * object literal as an expression. The build fails with a parse error naming a
 * generated file, which is a confusing place to be sent.
 *
 * Escaping the braces is not open to us: the changelog has to keep rendering on
 * npm and GitHub, which know nothing about Vue, so the source file has to hold
 * the real syntax. So the copy is wrapped instead. Nothing in a history is a
 * component and nothing in it is meant to be interpolated, and `v-pre` says
 * exactly that, once, rather than being remembered every time an entry quotes a
 * prop. The Flutter history gets it too, so the two halves follow one rule.
 *
 * The `fw` block is opened with four colons and `v-pre` with three, because a
 * container closes at the first fence at least as long as its own: two
 * three-colon fences would close the outer block at the inner one's end.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(docsDir, '..');

/** One entry per locale served by the docs. Keep in step with `supportLocales`. */
const locales = {
  en: {
    title: 'Changelog',
    description: 'Every release of Material Plus, newest first — what was added, and what changed.',
    lede: 'The React and the Flutter package version independently, so a release of one is not a release of the other and the numbers will not always agree. Pick a framework in the sidebar to read its history.'
  },
  ko: {
    title: '변경 기록',
    description: 'Material Plus의 모든 릴리스를 최신순으로. 무엇이 추가되고 무엇이 바뀌었는지.',
    lede: 'React 패키지와 Flutter 패키지는 버전을 따로 올립니다. 한쪽의 릴리스가 다른 쪽의 릴리스는 아니어서 번호가 늘 같지는 않습니다. 사이드바에서 프레임워크를 고르면 그쪽 기록이 보입니다.'
  }
};

/** A package's releases, from its first `##` heading to the end of the file. */
function historyOf(path) {
  const lines = readFileSync(resolve(repoRoot, path), 'utf8').split('\n');
  const first = lines.findIndex((line) => line.startsWith('## '));

  return lines
    .slice(first === -1 ? lines.length : first)
    .join('\n')
    .trim();
}

const histories = [
  ['react', historyOf('packages/react/CHANGELOG.md')],
  ['flutter', historyOf('packages/flutter/CHANGELOG.md')]
];

const blocks = histories
  .map(([framework, history]) => `:::: fw ${framework}\n\n::: v-pre\n${history}\n:::\n\n::::`)
  .join('\n\n');

for (const [locale, { title, description, lede }] of Object.entries(locales)) {
  const target = resolve(docsDir, locale, 'changelog.md');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(
    target,
    `---\ntitle: ${title}\ndescription: ${description}\norder: 1\neditLink: false\n---\n\n` +
      `# ${title}\n\n${lede}\n\n${blocks}\n`,
    'utf8'
  );
}
