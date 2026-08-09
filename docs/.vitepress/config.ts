import { existsSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSidebar } from 'vitepress-sidebar';
import packageJson from '../../package.json' with { type: 'json' };
import { defineConfig, HeadConfig, SiteData, TransformContext, UserConfig } from 'vitepress';
import { withI18n } from 'vitepress-i18n';
import ReactPlugin from '@vitejs/plugin-react';
import type { VitePressI18nOptions } from 'vitepress-i18n/types';
import type { VitePressSidebarOptions } from 'vitepress-sidebar/types';

const vitePressDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(vitePressDir, '../..');
const srcDir = resolve(rootDir, 'docs');

const defaultLocale: string = 'en';
const supportLocales: string[] = [defaultLocale, 'ko'];
const siteUrl = packageJson.homepage.replace(/\/+$/, '');
/**
 * The browsable repository URL, from the one npm accepts.
 *
 * `repository.url` has to be a git URL or npm rewrites it on publish and warns
 * every time — which means it carries a `git+` prefix and a `.git` suffix that
 * a browser has no use for. Both are stripped here rather than a second, plain
 * copy of the URL being kept in this file, because two spellings of one address
 * is exactly how an edit link ends up pointing somewhere that no longer exists.
 */
const repoUrl = packageJson.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
const editLinkPattern = `${repoUrl}/edit/main/docs/:path`;
const npmUrl = `https://www.npmjs.com/package/${packageJson.name}`;

/** A glob Vite can read on either platform — `resolve` gives Windows backslashes. */
const glob = (pattern: string) => resolve(rootDir, pattern).replaceAll('\\', '/');

/** `/` for whichever locale is the default, `/{lang}/` for every other one. */
const localeBase = (lang: string) => (lang === defaultLocale ? '/' : `/${lang}/`);

const commonSidebarConfig: VitePressSidebarOptions = {
  debugPrint: false,
  collapsed: false,
  capitalizeFirst: true,
  useTitleFromFileHeading: true,
  useTitleFromFrontmatter: true,
  useFolderTitleFromIndexFile: true,
  // Without this the components group stops linking to the index page that
  // lists them all.
  useFolderLinkFromIndexFile: true,
  frontmatterOrderDefaultValue: 9,
  sortMenusByFrontmatterOrder: true
};

/**
 * The sidebar groups the folder tree cannot name.
 *
 * The changelog is a loose page with no folder of its own, and the components
 * index cannot both be a heading and a row under it. Left to the generator the
 * changelog would sit at the root with no heading over it at all.
 */
const groupLabels: Record<string, { overview: string; more: string; design: string }> = {
  en: { overview: 'All components', more: 'Discover more', design: 'Design' },
  ko: { overview: '모든 컴포넌트', more: '더 알아보기', design: '디자인' }
};

const vitePressSidebarConfig = [
  ...supportLocales.map((lang) => {
    return {
      ...commonSidebarConfig,
      documentRootPath: `/docs/${lang}`,
      resolvePath: localeBase(lang),
      ...(defaultLocale === lang ? {} : { basePath: localeBase(lang) })
    };
  })
];

/** The same two destinations in every locale, prefixed with its base. */
const navFor = (lang: string, labels: [string, string, string]) => [
  { text: labels[0], link: `${localeBase(lang)}guide/getting-started` },
  { text: labels[1], link: `${localeBase(lang)}design/color` },
  { text: labels[2], link: `${localeBase(lang)}components/` }
];

const vitePressI18nConfig: VitePressI18nOptions = {
  locales: supportLocales,
  debugPrint: false,
  rootLocale: defaultLocale,
  searchProvider: 'local',
  description: {
    ko: 'Material Design 3를 구현한 React 컴포넌트 라이브러리입니다. 다른 머터리얼 라이브러리가 제공하지 않는 컴포넌트와, 제공하더라도 기능을 더 넓힌 컴포넌트를 모았습니다. Base UI와 Tailwind CSS v4 기반이고, 테마를 CSS 커스텀 프로퍼티로 다루기 때문에 이미 머터리얼을 쓰는 프로젝트와 공존할 수 있습니다. ESM 전용이며 타입 정의가 포함되어 있습니다.',
    en: 'A React component library implementing Material Design 3 — the components other Material libraries do not ship, and wider versions of the ones they do. Built on Base UI and Tailwind CSS v4, themed with CSS custom properties so it can coexist with an existing Material setup. ESM only, types included.'
  },
  themeConfig: {
    ko: { nav: navFor('ko', ['가이드', '디자인', '컴포넌트']) },
    en: { nav: navFor('en', ['Guide', 'Design', 'Components']) }
  }
};

/* ---------------------------------------------------------------------------
 * Search engines
 *
 * Two things a documentation site gets wrong by default, and both of them are
 * per page rather than per site:
 *
 * - **Every page ships the same description.** VitePress falls back to the
 *   site's own whenever a page declares none, so every page carries one
 *   sentence between them and not one of them says what it is about. There is
 *   already a better sentence on nearly every page — the lede under the title,
 *   which is written to be exactly this — so it is read out of the source.
 * - **Nothing says the two locales are the same page.** Without `hreflang` a
 *   crawler has no reason to connect `/components/inputs/text-field` to its
 *   Korean counterpart, and treats them as two documents competing for one
 *   query.
 * ------------------------------------------------------------------------- */

/**
 * The BCP-47 tag the site itself declares for a locale — `en` → `en-US`.
 *
 * Read back off the resolved config rather than written out again, because
 * VitePress's own sitemap already emits `hreflang` from exactly these values.
 * Two spellings of the same locale across the two files is the one thing a
 * crawler reads as a contradiction.
 */
function langTagOf(siteData: SiteData, lang: string): string {
  return siteData.locales[lang === defaultLocale ? 'root' : lang]?.lang ?? lang;
}

/** `en/components/inputs/text-field.md` → `/components/inputs/text-field`. */
function pathOf(filePath: string): string {
  const [lang, ...rest] = filePath.split('/');
  const page = rest
    .join('/')
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '');

  return `${localeBase(lang)}${page}`;
}

/** Everything below the locale folder — the part two locales have in common. */
function pageOf(filePath: string): string {
  return filePath.split('/').slice(1).join('/');
}

/** Inline Markdown and HTML dropped: a `<meta>` carries text and nothing else. */
function plainText(source: string): string {
  return source
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cut at a word boundary, to about what a result page will show whole. */
function clamp(text: string, limit = 160): string {
  if (text.length <= limit) {
    return text;
  }

  const cut = text.slice(0, limit);

  return `${cut.slice(0, cut.lastIndexOf(' ')).trimEnd()}…`;
}

/**
 * A page's own one-line summary.
 *
 * The lede is what a component page opens with, and it already says what the
 * component is and what it is for. The pages that have none — the guide — open
 * with the same thing written as prose, so their first paragraph stands in.
 */
function summaryOf(filePath: string): string | undefined {
  const file = resolve(srcDir, filePath);

  if (!existsSync(file)) {
    return undefined;
  }

  const source = readFileSync(file, 'utf8');
  const lede = source.match(/<p class="mp-lede">([\s\S]*?)<\/p>/);

  if (lede) {
    return clamp(plainText(lede[1]));
  }

  // Frontmatter off, then the first block that is prose: not the title, not a
  // fenced example, not one of the Vue components a page is built out of.
  for (const block of source.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').split(/\n\s*\n/)) {
    const trimmed = block.trim();

    if (!trimmed || /^[#<`:|>-]/.test(trimmed)) {
      continue;
    }

    const text = plainText(trimmed);

    if (text) {
      return clamp(text);
    }
  }

  return undefined;
}

/** The locales that actually have this page — a mirror is not a guarantee. */
function localesWith(filePath: string): string[] {
  const page = pageOf(filePath);

  return supportLocales.filter((lang) => existsSync(resolve(srcDir, lang, page)));
}

/** What the package is, for the one page in each locale that is about it. */
function structuredData(description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'Material Plus',
    description,
    url,
    codeRepository: repoUrl,
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'React',
    license: 'https://opensource.org/licenses/MIT',
    author: { '@type': 'Organization', name: 'CDGet', url: 'https://cdget.com' },
    sameAs: [repoUrl, npmUrl]
  };
}

/**
 * The half of the metadata that is different on every page.
 *
 * Only runs at build time — `transformPageData` is what the dev server sees —
 * so the tags below are checked by reading a built page, not the preview.
 */
function transformHead({ pageData, siteData, title, description }: TransformContext): HeadConfig[] {
  const { filePath } = pageData;

  // A dynamic route, or the built-in 404: no source file, so no canonical URL
  // and nothing to point an alternate at.
  if (!filePath) {
    return [];
  }

  const lang = filePath.split('/')[0];
  const url = `${siteUrl}${pathOf(filePath)}`;
  const translations = localesWith(filePath);

  // Open Graph writes a BCP-47 tag with an underscore in it, and nothing else.
  const ogLocale = (of: string) => langTagOf(siteData, of).replace('-', '_');

  const head: HeadConfig[] = [
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:locale', content: ogLocale(lang) }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }]
  ];

  for (const other of translations) {
    head.push([
      'link',
      {
        rel: 'alternate',
        hreflang: langTagOf(siteData, other),
        href: `${siteUrl}${pathOf(`${other}/${pageOf(filePath)}`)}`
      }
    ]);

    if (other !== lang) {
      head.push(['meta', { property: 'og:locale:alternate', content: ogLocale(other) }]);
    }
  }

  // Which one a crawler should serve to a reader it cannot place. The default
  // locale is the one that is served from `/`.
  if (translations.includes(defaultLocale)) {
    head.push([
      'link',
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: `${siteUrl}${pathOf(`${defaultLocale}/${pageOf(filePath)}`)}`
      }
    ]);
  }

  if (pageData.frontmatter.layout === 'home') {
    head.push([
      'script',
      { type: 'application/ld+json' },
      JSON.stringify(structuredData(description, url))
    ]);
  }

  return head;
}

// Ref: https://vitepress.dev/reference/site-config
const vitePressConfig: UserConfig = {
  title: 'Material Plus',
  lastUpdated: true,
  outDir: '../docs-dist',
  cleanUrls: true,
  metaChunk: true,
  /**
   * The default locale is served from `/`, not from `/{lang}/`.
   *
   * This has to agree with two other things or every sidebar link 404s:
   * `vitepress-i18n` puts the root locale in `locales.root` (no path prefix),
   * and `vitepress-sidebar` is told to resolve its links against `/`. The
   * rewrite is what actually moves `docs/{defaultLocale}/**` there. Every other
   * locale keeps its folder as its prefix — `docs/ko/guide/x.md` at
   * `/ko/guide/x`. Switching `defaultLocale` swings all three together.
   */
  rewrites: {
    [`${defaultLocale}/:rest*`]: ':rest*'
  },
  head: [
    // Material's baseline primary, as a literal: a `<meta>` cannot read a theme
    // object, and this is the one place in the site that has to repeat one.
    ['meta', { name: 'theme-color', content: '#1976d2' }],
    // The half of the metadata that is the same on every page. The other half —
    // the canonical URL, the title, the description, the locale alternates — is
    // per page and lives in `transformHead`.
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Material Plus' }],
    ['meta', { name: 'twitter:card', content: 'summary' }]
    /*
     * No `og:image`, no `twitter:image` and no favicon yet — there is no mark to
     * point them at, and a card tag naming a file that 404s is worse than no
     * card tag at all. Once a logo lands in `docs/public/`, add:
     *
     *   ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/logo-32.png' }],
     *   ['meta', { property: 'og:image', content: `${siteUrl}/256x256.png` }],
     *   ['meta', { property: 'og:image:alt', content: 'Material Plus' }],
     *   ['meta', { name: 'twitter:image', content: `${siteUrl}/256x256.png` }]
     *
     * `summary` above rather than `summary_large_image` assumes a square mark;
     * change it if the artwork turns out to be wide.
     */
  ],
  sitemap: {
    hostname: packageJson.homepage
  },
  /**
   * `robots.txt`, written rather than committed.
   *
   * It exists to name the sitemap, and the sitemap's own URL is already derived
   * from `package.json`. A copy of that host sitting in `public/` would be one
   * more place to forget when the site moves — and a robots file pointing at a
   * sitemap that is not there is worse than no robots file.
   */
  async buildEnd({ outDir }) {
    await writeFile(
      resolve(outDir, 'robots.txt'),
      `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    );
  },
  /**
   * A description that is about this page rather than about the library.
   *
   * Runs in the dev server as well as in the build, which is what makes it the
   * right place for the description — `transformHead` would have to repeat the
   * fallback chain VitePress already applies to `pageData.description`, and
   * would only be right in a production build.
   */
  transformPageData(pageData) {
    if (!pageData.description && pageData.filePath) {
      pageData.description = summaryOf(pageData.filePath) ?? '';
    }
  },
  transformHead,
  /**
   * The docs render the real components, and the components are React. Every
   * live preview is a React island mounted by `theme/components/Demo.vue`, so
   * the site's Vite pipeline needs three things Vue alone does not give it: the
   * React plugin for the `.tsx` demos, an alias so those demos can
   * `import { MPTextField } from 'material-plus-ui'` exactly as a consumer would,
   * and the repository's PostCSS config so Tailwind compiles the classes the
   * library ships.
   */
  vite: {
    // Cast because VitePress 1.x ships its own copy of Vite: its `Plugin` type
    // is a different instance of the same shape from the one the React plugin
    // is built against, so the two are structurally identical and nominally
    // incompatible. Drops when VitePress and the repo share one Vite.
    plugins: [ReactPlugin() as never],
    resolve: {
      alias: [
        // Anchored, so `material-plus-ui/styles.css` is not rewritten into the
        // barrel too. Pointing at the source rather than `dist/` is what lets a
        // component edit show up in the docs without a rebuild.
        { find: /^material-plus-ui$/, replacement: resolve(rootDir, 'src/index.ts') }
      ]
    },
    css: {
      // VitePress's Vite root is `docs/`; the Tailwind plugin lives in the
      // repository root's `postcss.config.mjs`.
      postcss: rootDir
    },
    optimizeDeps: {
      // Every one of these is only ever reached through a dynamic import inside
      // a demo, so Vite would otherwise discover them mid-session and force a
      // reload. `react/jsx-dev-runtime` is what the demos' JSX compiles to.
      include: [
        'react',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@base-ui/react/field',
        'lucide-react'
      ]
    },
    server: {
      warmup: {
        // The library is behind a dynamic import too, so the dev server would
        // not transform a single file of it until the first preview asks.
        clientFiles: [glob('src/**/*.{ts,tsx}')]
      }
    }
  },
  themeConfig: {
    /**
     * `h2` and `h3`, nested.
     *
     * A component page is one `h2` — Examples — with a dozen `h3`s under it,
     * one per prop. At the default depth the outline lists four words for a
     * page that is many screens long, and the thing a reader came for, the prop
     * they are looking up, is never in it.
     *
     * Only `level` is set: `vitepress-i18n` puts the localised `label` on each
     * locale's own `themeConfig`, and its merge is deep, so the two survive
     * together.
     */
    outline: { level: [2, 3] },
    editLink: {
      pattern: editLinkPattern
    },
    socialLinks: [
      { icon: 'npm', link: npmUrl },
      { icon: 'github', link: repoUrl }
    ],
    footer: {
      message: 'Released under the MIT License',
      copyright: '© <a href="https://cdget.com">CDGet</a>'
    }
  }
};

/* ---------------------------------------------------------------------------
 * Sidebar post-processing
 *
 * `vitepress-sidebar` derives the menu from the folder tree, which gets two
 * things wrong for this site — and neither can be fixed by moving files around
 * without also changing a URL. So the generated tree is reshaped here instead,
 * once, for every locale.
 * ------------------------------------------------------------------------- */

interface GeneratedSidebarItem {
  text?: string;
  link?: string;
  items?: GeneratedSidebarItem[];
  collapsed?: boolean;
}

/**
 * `useFolderLinkFromIndexFile` points a folder at `components/index.md`, which
 * VitePress resolves to `/components/index` — a URL that only works because the
 * SPA router is forgiving about it. The canonical one, and the only one a
 * static host serves directly, is `/components/`.
 *
 * `collapsed` goes at the same time: VitePress draws the expand/collapse caret
 * for any item where `collapsed != null`, so the only way to have permanently
 * open groups with no toggle is for the key to be absent entirely.
 */
function cleanUpItems<T extends GeneratedSidebarItem>(items: T[]): T[] {
  return items.map((item) => {
    const cleaned = {
      ...item,
      ...(item.link ? { link: item.link.replace(/(^|\/)index\.md$/, '$1') } : {}),
      ...(item.items ? { items: cleanUpItems(item.items) } : {})
    };

    delete cleaned.collapsed;

    return cleaned;
  });
}

/** The first link anywhere in a subtree — how a group is identified below. */
function firstLink(item: GeneratedSidebarItem): string | undefined {
  return item.link ?? item.items?.map(firstLink).find(Boolean);
}

const startsWith = (prefix: string) => (item: GeneratedSidebarItem) =>
  firstLink(item)?.startsWith(prefix) ?? false;

/** Every page in a subtree, with the folder headings above them dropped. */
function flattenItems<T extends GeneratedSidebarItem>(items: T[]): T[] {
  return items.flatMap((item) => (item.items?.length ? flattenItems(item.items as T[]) : [item]));
}

/** By label, so a flat list of components can be scanned for a name. */
function byText(a: GeneratedSidebarItem, b: GeneratedSidebarItem): number {
  return (a.text ?? '').localeCompare(b.text ?? '');
}

/**
 * Guide, Components, Discover more — with the component groups kept as headings
 * inside Components.
 *
 * Neither of the two moves below can be stated by the folder tree:
 *
 * - **The index page becomes an entry rather than the heading's link.** Left to
 *   the generator, `/components/` is only reachable by clicking the word
 *   "Components" above the menu, which does not look like a link and is easy to
 *   miss. It becomes a row of its own and the heading above it stops being
 *   clickable.
 * - **The component groups stay, but their contents are flattened.** The groups
 *   are what say that a text field is an input and an icon is display; what is
 *   flattened is only what is *inside* a group, so that a page does not sit one
 *   level deeper than its group the day a folder gains a subfolder.
 */
function arrangeSidebar<T extends GeneratedSidebarItem>(items: T[], lang: string): T[] {
  const labels = groupLabels[lang] ?? groupLabels[defaultLocale];

  const guide = items.find(startsWith('guide/'));
  const design = items.find(startsWith('design/'));
  const components = items.find(startsWith('components/'));
  const changelog = items.find(startsWith('changelog'));

  // The folder is `design/` in every locale, so the generator can only ever
  // capitalise it into the English word. The label is named here instead, the
  // same way the two groups below are.
  if (design) {
    design.text = labels.design;
  }

  if (components) {
    // A child with children of its own is a group folder; a child with only a
    // link is a page sitting loose in `components/`, which stays where it is.
    const children = components.items ?? [];
    const groups = children.filter((item) => item.items?.length) as T[];
    const loose = children.filter((item) => !item.items?.length) as T[];

    for (const group of groups) {
      group.items = flattenItems(group.items ?? []).sort(byText);
    }
    groups.sort(byText);

    const overview = components.link
      ? ({ text: labels.overview, link: components.link } as unknown as T)
      : undefined;
    delete components.link;

    components.items = [...([overview].filter(Boolean) as T[]), ...loose, ...groups];
  }

  // A loose page has no group of its own, so it is given one — the place
  // anything that is neither a guide nor a component ends up.
  const more = changelog ? ({ text: labels.more, items: [changelog] } as unknown as T) : undefined;

  const moved = new Set([guide, design, components, changelog].filter(Boolean));

  return [
    ...([guide, design, components, more].filter(Boolean) as T[]),
    ...items.filter((item) => !moved.has(item))
  ];
}

const config = withSidebar(withI18n(vitePressConfig, vitePressI18nConfig), vitePressSidebarConfig);

const sidebar = config.themeConfig?.sidebar as
  Record<string, { items?: GeneratedSidebarItem[] } | GeneratedSidebarItem[]> | undefined;

if (sidebar) {
  for (const [path, group] of Object.entries(sidebar)) {
    // `/` is the default locale and `/{lang}/` is every other one — the same
    // mapping `localeBase` makes, read back the other way.
    const lang = path === '/' ? defaultLocale : path.replaceAll('/', '');

    if (Array.isArray(group)) {
      sidebar[path] = arrangeSidebar(cleanUpItems(group), lang);
    } else if (group?.items) {
      group.items = arrangeSidebar(cleanUpItems(group.items), lang);
    }
  }
}

export default defineConfig(config);
