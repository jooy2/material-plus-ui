import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
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
 *
 * `examples/` has no `index.md` on purpose, so it cannot take its heading from a
 * page either: `/examples/` is not a page, it is four of them — one screen each
 * — and an index that only listed the four would be a row of links standing
 * where the heading already is. Left to the generator its label would also be
 * the English word capitalised, over Korean pages.
 */
const groupLabels: Record<
  string,
  { overview: string; examples: string; more: string; design: string }
> = {
  en: {
    overview: 'All components',
    examples: 'Examples',
    more: 'Discover more',
    design: 'Design'
  },
  ko: {
    overview: '모든 컴포넌트',
    examples: '예제',
    more: '더 알아보기',
    design: '디자인'
  }
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

/** The same four destinations in every locale, prefixed with its base. */
const navFor = (lang: string, labels: [string, string, string, string]) => [
  { text: labels[0], link: `${localeBase(lang)}guide/getting-started` },
  // The design section's own first page, which is the overview of the rest of
  // it rather than one topic out of four.
  { text: labels[1], link: `${localeBase(lang)}design/design-language` },
  { text: labels[2], link: `${localeBase(lang)}components/` },
  // `/examples/` is a group heading rather than a page, so the nav points at the
  // one page inside it that shows everything at once.
  { text: labels[3], link: `${localeBase(lang)}examples/overview` }
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
    ko: { nav: navFor('ko', ['가이드', '디자인', '컴포넌트', '예제']) },
    en: { nav: navFor('en', ['Guide', 'Design', 'Components', 'Examples']) }
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
 *
 * A page that declares a `description` of its own is taken at its word first.
 * VitePress has already used that for the `<meta>` by the time anything here
 * runs, so it is only reached by `llms.txt` — and a page bothers to declare one
 * precisely when its own first paragraph is the wrong sentence. The changelog
 * is the whole of that category: its first paragraph is the newest release.
 */
function summaryOf(filePath: string): string | undefined {
  const file = resolve(srcDir, filePath);

  if (!existsSync(file)) {
    return undefined;
  }

  const source = readFileSync(file, 'utf8');
  const declared = source
    .match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
    .match(/^description:\s*(.+)$/m)?.[1]
    // Quoted or not: YAML does not need them here, and a later edit that adds a
    // colon to the sentence will.
    .trim()
    .replace(/^(['"])(.*)\1$/, '$2');

  if (declared) {
    return clamp(plainText(declared));
  }

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
    image: `${siteUrl}/logo-large.png`,
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
    /*
     * Two icons, both with their real size declared.
     *
     * The `.ico` is 16×16 and nothing more, which is the one size a browser can
     * always fall back to and the wrong one for a tab on a hidpi screen or for
     * a bookmark tile. Declaring that size honestly is what lets the browser
     * reach past it to the 72×72 PNG when it wants something bigger; a bare
     * `sizes="any"` on the `.ico` would tell it the opposite.
     */
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: '16x16' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png', sizes: '72x72' }],
    // The half of the metadata that is the same on every page. The other half —
    // the canonical URL, the title, the description, the locale alternates — is
    // per page and lives in `transformHead`.
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Material Plus' }],
    /*
     * The share card is the mark itself, so the card is the small square kind.
     * `summary_large_image` would letterbox a 256×256 logo into a 2:1 banner
     * with two wide bars of nothing beside it — that layout wants artwork drawn
     * for it, not a mark stretched to fit. The dimensions are declared so a
     * crawler can lay the card out before the image has finished downloading.
     */
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { property: 'og:image', content: `${siteUrl}/logo-large.png` }],
    ['meta', { property: 'og:image:type', content: 'image/png' }],
    ['meta', { property: 'og:image:width', content: '256' }],
    ['meta', { property: 'og:image:height', content: '256' }],
    ['meta', { property: 'og:image:alt', content: 'Material Plus' }],
    ['meta', { name: 'twitter:image', content: `${siteUrl}/logo-large.png` }],
    ['meta', { name: 'twitter:image:alt', content: 'Material Plus' }]
  ],
  sitemap: {
    hostname: packageJson.homepage
  },
  /**
   * `robots.txt` and `llms.txt`, written rather than committed.
   *
   * `robots.txt` exists to name the sitemap, and the sitemap's own URL is
   * already derived from `package.json`. A copy of that host sitting in
   * `public/` would be one more place to forget when the site moves — and a
   * robots file pointing at a sitemap that is not there is worse than no robots
   * file. `llms.txt` is generated for a longer version of the same reason; the
   * section at the foot of this file has it.
   */
  async buildEnd({ outDir }) {
    await writeFile(
      resolve(outDir, 'robots.txt'),
      `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    );
    await writeLlmsTxt(outDir);
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
        { find: /^material-plus-ui$/, replacement: resolve(rootDir, 'src/index.ts') },
        // The translations, which the package exports separately and no
        // component imports — see `src/locales/index.ts`. Anchored for the same
        // reason as above, and pointed at the source for the same reason.
        {
          find: /^material-plus-ui\/locales$/,
          replacement: resolve(rootDir, 'src/locales/index.ts')
        }
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
        '@base-ui/react/accordion',
        '@base-ui/react/collapsible',
        '@base-ui/react/combobox',
        '@base-ui/react/context-menu',
        '@base-ui/react/dialog',
        '@base-ui/react/field',
        '@base-ui/react/menu',
        '@base-ui/react/otp-field',
        '@base-ui/react/popover',
        '@base-ui/react/progress',
        '@base-ui/react/toast',
        '@base-ui/react/tooltip',
        '@base-ui/react/use-render',
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
     * The navigation bar mark, beside the site title rather than instead of it.
     *
     * Rendered by the default theme as an `<img>` at `--vp-nav-logo-height`,
     * 24px — so the 72×72 file is a 3× source and stays sharp on any screen it
     * lands on. It is an `<img>` and not an inline SVG, which is why there is
     * no dark variant: `currentColor` cannot reach inside one, and the mark
     * reads on both themes on its own.
     */
    logo: '/logo.png',
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
 * None of the three moves below can be stated by the folder tree:
 *
 * - **The index page becomes an entry rather than the heading's link.** Left to
 *   the generator, `/components/` is only reachable by clicking the word
 *   "Components" above the menu, which does not look like a link and is easy to
 *   miss. It becomes a row of its own and the heading above it stops being
 *   clickable.
 * - **Examples moves inside Components, above the categories.** Its pages keep
 *   their own top-level URLs (`/examples/*`) but read as the way into the
 *   component documentation: whole screens first, then the parts they are built
 *   from. A group nested in the menu and not in the filesystem is exactly the
 *   case a generated sidebar has no way to state. It is also the one subgroup
 *   that is *not* flattened or re-sorted — its four pages are screens rather
 *   than components, and the order they are read in is the order they are
 *   written in.
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
  const examples = items.find(startsWith('examples/'));
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

    components.items = [
      ...([overview].filter(Boolean) as T[]),
      ...(examples ? [examples as T] : []),
      ...loose,
      ...groups
    ];
  }

  // The folder is `examples/` in every locale, so — like `design/` above — the
  // generator can only ever capitalise it into the English word.
  if (examples) {
    examples.text = labels.examples;
  }

  // A loose page has no group of its own, so it is given one — the place
  // anything that is neither a guide nor a component ends up.
  const more = changelog ? ({ text: labels.more, items: [changelog] } as unknown as T) : undefined;

  const moved = new Set([guide, design, components, examples, changelog].filter(Boolean));

  return [
    ...([guide, design, components, more].filter(Boolean) as T[]),
    ...items.filter((item) => !moved.has(item))
  ];
}

const config = withSidebar(withI18n(vitePressConfig, vitePressI18nConfig), vitePressSidebarConfig);

/**
 * The site's `head`, un-copied out of every locale.
 *
 * `vitepress-i18n` appends the whole site `head` to each locale's own, and
 * VitePress then merges site and locale heads back together — but its merge
 * only deduplicates `meta`, matching on the tag's first attribute. A `meta`
 * therefore survives the round trip once and a `link` survives it twice, which
 * is two `rel="icon"` tags on every page of the site.
 *
 * Nothing in `head` above is per locale, so the copies are what goes rather
 * than the merge being worked around. Anything a locale genuinely added for
 * itself is left where it is.
 */
const siteHeadTags = new Set((vitePressConfig.head ?? []).map((tag) => JSON.stringify(tag)));

for (const locale of Object.values(config.locales ?? {})) {
  if (!locale?.head) {
    continue;
  }

  locale.head = locale.head.filter((tag) => !siteHeadTags.has(JSON.stringify(tag)));

  if (locale.head.length === 0) {
    delete locale.head;
  }
}

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

/* ---------------------------------------------------------------------------
 * llms.txt
 *
 * The site's table of contents, written for a language model rather than for a
 * reader: one Markdown file per locale — `/llms.txt` and `/ko/llms.txt` — that
 * names every page, links it, and gives the one sentence saying what it is
 * about. A model asked about this library reads that instead of guessing, and
 * guessing is what produces a prop this package does not have.
 *
 * It is generated from the arranged sidebar, which is the only structure here
 * that already knows the reading order, the titles and the links at once — and
 * it is generated for the reason the changelog page is: a hand-kept list of
 * sixty pages goes wrong the first week nobody remembers to touch it, and goes
 * wrong in the way that is hardest to notice, a component whose page still
 * loads under a name it no longer has.
 *
 * Ref: https://llmstxt.org
 * ------------------------------------------------------------------------- */

/**
 * What is worth knowing before opening any of the pages, per locale.
 *
 * The blockquote under the title is the site's own description, so this is the
 * next thing down: how the package is installed and set up, which is what a
 * model is asked for before it is asked for a component. Every claim here is
 * one the Getting started page makes at length.
 */
const llmsPreamble: Record<string, string[]> = {
  en: [
    'Install with `npm install material-plus-ui`. ESM only, TypeScript declarations included.',
    'Peer dependencies: `@base-ui/react` 1, and `react` with `react-dom` 18 or 19. `lucide-react` ships inside the package.',
    'Setup is one stylesheet import — `material-plus-ui/styles.css`, or `material-plus-ui/tailwind.css` in a project already running Tailwind CSS v4 — and there is no provider to wrap the tree in.',
    "Every component is a named export from the package root and carries an `MP` prefix: `import { MPTextField } from 'material-plus-ui'`.",
    'Theming is plain CSS custom properties. `--mp-source-color` derives every colour role; `data-mp-scheme` selects light or dark and `data-mp-shape` moves the corner scale.',
    "Each component page below carries that component's full props table, so it is the page to read before writing a prop name."
  ],
  ko: [
    '설치는 `npm install material-plus-ui`. ESM 전용이며 타입 선언이 함께 들어 있습니다.',
    '피어 의존성은 `@base-ui/react` 1과 `react`·`react-dom` 18 또는 19입니다. `lucide-react`는 패키지에 포함되어 있습니다.',
    '설정은 스타일시트 한 줄이 전부입니다 — `material-plus-ui/styles.css`, 이미 Tailwind CSS v4를 쓰는 프로젝트라면 `material-plus-ui/tailwind.css`. 트리를 감싸는 프로바이더는 없습니다.',
    "모든 컴포넌트는 패키지 루트에서 `MP` 접두사가 붙은 이름으로 내보냅니다: `import { MPTextField } from 'material-plus-ui'`.",
    '테마는 CSS 커스텀 프로퍼티입니다. `--mp-source-color` 하나로 모든 색 역할이 파생되고, `data-mp-scheme`가 라이트/다크를, `data-mp-shape`가 모서리 스케일을 바꿉니다.',
    '아래 각 컴포넌트 문서에는 그 컴포넌트의 전체 props 표가 있습니다. prop 이름을 쓰기 전에 읽어야 할 페이지입니다.'
  ]
};

/** The notes on the links that are not pages of this site. */
const llmsLinkNotes: Record<string, { locale: string; repo: string; npm: string }> = {
  en: {
    locale: 'The same documentation in another language.',
    repo: 'The source of every component, its tests, and the issue tracker.',
    npm: 'The published package.'
  },
  ko: {
    locale: '같은 문서의 다른 언어판입니다.',
    repo: '모든 컴포넌트의 소스와 테스트, 이슈 트래커입니다.',
    npm: '배포된 패키지입니다.'
  }
};

/** How each locale names itself — the label a link to it should carry. */
const localeNames: Record<string, string> = {
  en: 'English',
  ko: '한국어'
};

/** The arranged top-level groups for a locale, whichever shape they came in. */
function sidebarFor(lang: string): GeneratedSidebarItem[] {
  const group = sidebar?.[localeBase(lang)];

  if (!group) {
    return [];
  }

  return Array.isArray(group) ? group : (group.items ?? []);
}

/**
 * `components/` → `en/components/index.md` — `pathOf` read the other way.
 *
 * Sidebar links are relative to their group's base, which is `localeBase(lang)`
 * itself, so the locale folder is prepended rather than stripped.
 */
function sourceOf(link: string, lang: string): string {
  return `${lang}/${link.endsWith('/') || link === '' ? `${link}index.md` : `${link}.md`}`;
}

/** One row: the page's own title, its absolute URL, and its own summary. */
function llmsRow(item: GeneratedSidebarItem, lang: string): string | undefined {
  if (!item.link) {
    return undefined;
  }

  // The same sentence `transformPageData` puts in the page's `<meta>`. A page
  // that has none — nothing but a title and a table — is still worth listing.
  const summary = summaryOf(sourceOf(item.link, lang));

  return `- [${item.text}](${siteUrl}${localeBase(lang)}${item.link})${summary ? `: ${summary}` : ''}`;
}

/**
 * A sidebar group as one `##` section, and its subgroups as sections of their
 * own beneath it.
 *
 * The format's sections are flat, so `Components` and its four categories
 * cannot nest — but the category is worth keeping, because "what does this
 * library have for inputs" is a real question and the answer to it is a
 * heading. So a subgroup takes its parent's name as a prefix.
 */
function llmsSection(group: GeneratedSidebarItem, lang: string, title: string): string[] {
  const items = group.items ?? [];
  const pages = items.filter((item) => item.link && !item.items?.length);
  const subgroups = items.filter((item) => item.items?.length);
  const rows = pages.map((page) => llmsRow(page, lang)).filter(Boolean) as string[];

  return [
    ...(rows.length ? [`## ${title}`, '', ...rows, ''] : []),
    ...subgroups.flatMap((subgroup) => llmsSection(subgroup, lang, `${title}: ${subgroup.text}`))
  ];
}

/** One locale's whole file. */
function llmsTxt(lang: string): string {
  const preamble = llmsPreamble[lang] ?? llmsPreamble[defaultLocale];
  const notes = llmsLinkNotes[lang] ?? llmsLinkNotes[defaultLocale];
  const description = vitePressI18nConfig.description?.[lang] ?? packageJson.description;
  const groups = sidebarFor(lang);

  /*
   * `Optional` is the one heading the format gives a meaning to: everything
   * under it may be skipped when there is not enough context for all of it. The
   * changelog is exactly that — long, and not what anyone came here to read —
   * so the group holding it is folded in rather than given a section, together
   * with the links that leave the site. The word stays English in every locale
   * because it is read by the consumer, not by a person.
   */
  const optional = groups.find(startsWith('changelog'));

  return [
    `# ${vitePressConfig.title}`,
    '',
    `> ${description}`,
    '',
    ...preamble.map((line) => `- ${line}`),
    '',
    ...groups
      .filter((group) => group !== optional)
      .flatMap((group) => llmsSection(group, lang, group.text ?? '')),
    '## Optional',
    '',
    ...((optional?.items ?? []).map((item) => llmsRow(item, lang)).filter(Boolean) as string[]),
    ...supportLocales
      .filter((other) => other !== lang)
      .map(
        (other) =>
          `- [${localeNames[other] ?? other}](${siteUrl}${localeBase(other)}llms.txt): ${notes.locale}`
      ),
    `- [GitHub](${repoUrl}): ${notes.repo}`,
    `- [npm](${npmUrl}): ${notes.npm}`,
    ''
  ].join('\n');
}

/** `/llms.txt` for the default locale, `/{lang}/llms.txt` for every other one. */
async function writeLlmsTxt(outDir: string): Promise<void> {
  await Promise.all(
    supportLocales.map(async (lang) => {
      // `localeBase` leads with a slash, which `resolve` would read as a path of
      // its own and answer with `/llms.txt` on the filesystem.
      const file = resolve(outDir, `${localeBase(lang).slice(1)}llms.txt`);

      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, llmsTxt(lang), 'utf8');
    })
  );
}

export default defineConfig(config);
