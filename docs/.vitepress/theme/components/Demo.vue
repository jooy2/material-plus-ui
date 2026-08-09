<script>
/*
 * Module scope, deliberately: a `<script setup>` body runs once per component
 * instance, and a component page carries a dozen <Demo>s. Everything shared by
 * all of them lives here instead.
 */

// Lazy on purpose: the map is built at compile time, but nothing is fetched
// until a demo is actually mounted, and nothing is pulled into the SSR build.
const demos = import.meta.glob('../../demos/**/*.tsx');

let runtime = null;

/** React, its DOM renderer and the preview's scheme wrapper, fetched once and
    shared. */
function reactRuntime() {
  runtime ??= Promise.all([
    import('react'),
    import('react-dom/client'),
    import('../react/DemoRoot')
  ]);

  return runtime;
}

/*
 * Started here rather than in a preview's `onMounted`. Together these are the
 * largest thing the page downloads, nothing can render until they arrive, and a
 * dynamic import inside a lifecycle hook only begins once hydration is done —
 * so the browser would sit idle through hydration and then go to the network.
 * Evaluating this module is the earliest moment the fetch can start, and it
 * costs nothing on a page that turns out to have no previews, since the same
 * promise is what every preview then awaits.
 */
if (!import.meta.env.SSR) {
  reactRuntime();
}

/**
 * How far outside the viewport a preview counts as worth mounting, in px.
 * Wide enough that scrolling reaches a mounted preview rather than an empty box.
 */
const MOUNT_MARGIN = 300;
</script>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';
import { basePath, localeOf, t } from '../../data/i18n';

/**
 * A live preview of a React component inside a Vue page.
 *
 * VitePress compiles Markdown to Vue, so `<MPTextField />` cannot be written
 * directly. The bridge is the usual one: Vue owns a plain `<div>`, and React
 * takes it over with `createRoot()` once the page is in the browser.
 *
 * `src` names a file under `.vitepress/demos` without its extension, so
 * `<Demo src="text-field/password" />` renders `demos/text-field/password.tsx`.
 * The same path goes into the `<<<` snippet in the Markdown next to it, which
 * is how the code shown under a preview is guaranteed to be the code that ran.
 */
const props = defineProps({
  /** Demo module path, relative to `.vitepress/demos`, without `.tsx`. */
  src: { type: String, required: true },
  /** `center` for a single control that would look lost against a left edge. */
  align: { type: String, default: 'start' },
  /** Drops the frame — for previews that bring their own. */
  plain: { type: Boolean, default: false },
  /**
   * Height the mount point holds, in px or as a CSS length.
   *
   * The box is empty until React is in the browser, so without this the page
   * reflows under the reader the moment a preview arrives. It stays applied
   * after mounting too: a reserve that is dropped once the content is there
   * moves the page a second time, which is the same jump twice.
   */
  minHeight: { type: [Number, String], default: 56 }
});

// `lang` says which language the page is; `localeIndex` says where it lives in
// the URL. They are different questions and only one of them is the default.
const { isDark, lang, localeIndex } = useData();
const locale = localeOf(lang.value);
const base = basePath(localeIndex.value);

const host = ref(null);
const open = ref(false);
let root = null;
let observer = null;
let loaded = null;

/*
 * Which theme this one preview is in, and it is a *deviation* rather than a
 * value: `null` means "whatever the page is", so an untouched preview follows
 * the site switch and a reader flipping it takes every preview with them. Only
 * once someone asks for the other one does this preview pin itself.
 */
const override = ref(null);
const pageTheme = computed(() => (isDark.value ? 'dark' : 'light'));
const theme = computed(() => override.value ?? pageTheme.value);

function flip() {
  const next = theme.value === 'dark' ? 'light' : 'dark';

  // Landing back on the page's own theme drops the override instead of pinning
  // it, so the preview rejoins the site switch rather than quietly ignoring it.
  override.value = next === pageTheme.value ? null : next;
}

/**
 * Draws the demo in the current theme.
 *
 * Unlike a library that themes in CSS, Material UI carries its palette in a
 * React context — so a theme change is a re-render here rather than an
 * attribute on a wrapper, and this is called again whenever `theme` moves.
 */
function paint() {
  if (!root || !loaded) {
    return;
  }

  const { React, DemoRoot, demo } = loaded;

  root.render(
    React.createElement(
      DemoRoot,
      { mode: theme.value },
      // Demos are written in English and reused by every locale — they are code
      // samples. The few that carry docs chrome of their own take the locale
      // and localise themselves.
      React.createElement(demo.default, { locale, base })
    )
  );
}

async function mount() {
  const key = `../../demos/${props.src}.tsx`;
  const load = demos[key];

  if (!load) {
    console.warn(`[material-plus-ui docs] no demo at ${key}`);
    return;
  }

  // The demo's own chunk is fetched alongside React rather than after it: it
  // pulls in the components it renders, which is the other half of the payload.
  const [[React, { createRoot }, { default: DemoRoot }], demo] = await Promise.all([
    reactRuntime(),
    load()
  ]);

  // Navigating away during the await leaves nothing to mount into.
  if (!host.value) {
    return;
  }

  loaded = { React, DemoRoot, demo };
  root = createRoot(host.value);
  paint();
}

/** Whether the mount point is on screen, or close enough to count. */
function isNear() {
  const { top, bottom } = host.value.getBoundingClientRect();

  return top < window.innerHeight + MOUNT_MARGIN && bottom > -MOUNT_MARGIN;
}

watch(theme, paint);

onMounted(() => {
  /*
   * A component page holds a dozen previews and mounting them all at once means
   * the preview being read waits its turn behind chunks for previews far below
   * the fold. Only what is on screen mounts.
   *
   * What is already visible is measured rather than observed: an
   * IntersectionObserver reports its first entry in a later task, and the
   * preview at the top of the page — the one the reader is waiting for — is
   * exactly what that task would delay.
   */
  if (typeof IntersectionObserver === 'undefined' || isNear()) {
    mount();
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }

      observer.disconnect();
      observer = null;
      mount();
    },
    { rootMargin: `${MOUNT_MARGIN}px 0px` }
  );

  observer.observe(host.value);
});

onBeforeUnmount(() => {
  const mounted = root;
  root = null;
  loaded = null;

  observer?.disconnect();
  observer = null;

  // React refuses to unmount a root synchronously while it is rendering, and
  // client-side navigation tears the page down from inside Vue's own update.
  if (mounted) {
    setTimeout(() => mounted.unmount(), 0);
  }
});
</script>

<template>
  <div class="mp-demo" :class="{ 'mp-demo--plain': plain }">
    <div class="mp-demo-canvas" :data-align="align" :data-theme="theme">
      <button
        v-if="!plain"
        type="button"
        class="mp-demo-theme"
        :title="t(locale, theme === 'dark' ? 'viewLight' : 'viewDark')"
        :aria-label="t(locale, theme === 'dark' ? 'viewLight' : 'viewDark')"
        @click="flip"
      >
        <svg
          v-if="theme === 'dark'"
          viewBox="0 0 16 16"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="3" />
          <path
            d="M8 1.4v1.3M8 13.3v1.3M1.4 8h1.3M13.3 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M12.6 3.4l-.9.9M4.3 11.7l-.9.9"
          />
        </svg>
        <svg
          v-else
          viewBox="0 0 16 16"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M13.4 10.1A5.7 5.7 0 0 1 5.9 2.6a5.7 5.7 0 1 0 7.5 7.5Z" />
        </svg>
      </button>
      <div
        ref="host"
        class="mp-scope mp-demo-mount"
        :style="{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }"
      />
    </div>
    <div v-if="$slots.default" class="mp-demo-source">
      <button
        type="button"
        class="mp-demo-toggle"
        :aria-expanded="open ? 'true' : 'false'"
        @click="open = !open"
      >
        <span class="mp-demo-toggle-icon" :class="{ 'is-open': open }" aria-hidden="true">›</span>
        {{ open ? t(locale, 'hideCode') : t(locale, 'showCode') }}
      </button>
      <div v-show="open" class="mp-demo-code">
        <slot />
      </div>
    </div>
  </div>
</template>
