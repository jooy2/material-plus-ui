/**
 * The body of a GitHub release, cut out of the package's `CHANGELOG.md`.
 *
 *   node .github/scripts/release-notes.mjs v1.9.0 > notes.md
 *
 * A tag names the package as well as the version, by the prefixes in
 * `PACKAGES`: this repository holds one package, so `v1.9.0` is its 1.9.0. The
 * version's own section is the body, whole, from the line under its heading to
 * the next `## `, with a pointer to the full history under it. A release is
 * refused rather than written from a section that is not ready: one still
 * called `vNext`, one with no date, or one that is empty.
 *
 * GitHub cuts a release body off at 125,000 characters, and a cut body ends in
 * the middle of an entry. So when the section will not fit, the body is the
 * summary the section opens with — everything before its first `### ` — and
 * the pointer says where the rest is.
 */
import { readFileSync } from 'node:fs';
import { dirname, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Every package released from this repository, by the prefix of its tags.
 * `dir` holds the package's manifest and its `CHANGELOG.md`.
 */
const PACKAGES = {
  v: { dir: '.', manifest: 'package.json' }
};
/** Where the docs site shows the changelog, under `homepage`; `null` for none. */
const DOCS_CHANGELOG_PATH = '/changelog';
const LIMIT = 125000;
const VERSION = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const tag = process.argv[2] ?? '';
const prefix = Object.keys(PACKAGES).find(
  (key) => tag.startsWith(key) && VERSION.test(tag.slice(key.length))
);

if (prefix === undefined) {
  const examples = Object.keys(PACKAGES).map((key) => `${key}1.2.0`);

  throw new Error(`release-notes: "${tag}" is not a tag such as ${examples.join(' or ')}`);
}

const version = tag.slice(prefix.length);
const { dir, manifest } = PACKAGES[prefix];
const changelogPath = posix.join(dir, 'CHANGELOG.md');

/**
 * The package's `homepage` and `repository`. A `pubspec.yaml` is read line by
 * line rather than parsed: both are plain top-level strings there.
 */
const linksOf = (file) => {
  const text = readFileSync(resolve(root, dir, file), 'utf8');

  if (file.endsWith('.json')) {
    const pkg = JSON.parse(text);

    return {
      homepage: pkg.homepage,
      repository: typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url
    };
  }

  const field = (name) => text.match(new RegExp(`^${name}:\\s*['"]?([^'"\\s]+)`, 'm'))?.[1];

  return { homepage: field('homepage'), repository: field('repository') };
};

const lines = readFileSync(resolve(root, changelogPath), 'utf8').split('\n');
const escaped = version.replace(/[.+-]/g, (char) => `\\${char}`);
const start = lines.findIndex((line) => new RegExp(`^## ${escaped}( |$)`).test(line));

if (start === -1) {
  throw new Error(`release-notes: ${changelogPath} has no "## ${version}" section`);
}

if (!/^## \S+ \(\d{4}-\d{2}-\d{2}\)$/.test(lines[start])) {
  throw new Error(
    `release-notes: "${lines[start]}" is not dated as "## ${version} (YYYY-MM-DD)" — cut the release first`
  );
}

const next = lines.findIndex((line, index) => index > start && /^## /.test(line));
const section = lines
  .slice(start + 1, next === -1 ? undefined : next)
  .join('\n')
  .trim();

if (section === '') {
  throw new Error(`release-notes: the ${version} section of ${changelogPath} is empty`);
}

const { homepage, repository } = linksOf(manifest);
const repositoryUrl = repository?.replace(/^git\+/, '').replace(/\.git$/, '');
const where = [
  homepage && DOCS_CHANGELOG_PATH
    ? `[the changelog on the docs site](${homepage.replace(/\/$/, '')}${DOCS_CHANGELOG_PATH})`
    : null,
  repositoryUrl
    ? `[\`${changelogPath}\` at this tag](${repositoryUrl}/blob/${tag}/${changelogPath})`
    : null
].filter(Boolean);
const pointer =
  where.length > 0 ? `Every release of this package is in ${where.join(' and in ')}.` : '';
const whole = pointer ? `${section}\n\n---\n\n${pointer}\n` : `${section}\n`;

if (whole.length <= LIMIT) {
  process.stdout.write(whole);
} else {
  // Only prose that comes before the first heading is a summary; a section
  // that opens straight on `### Added` has none, and its first list is not one.
  const summary = section.startsWith('### ') ? '' : section.split(/\n(?=### )/)[0].trim();
  const cut = `The list of changes is too long for a release page; ${
    where.length > 0 ? `read it in ${where.join(' or in ')}` : `read it in \`${changelogPath}\``
  }.`;

  process.stdout.write(summary ? `${summary}\n\n---\n\n${cut}\n` : `${cut}\n`);
}
