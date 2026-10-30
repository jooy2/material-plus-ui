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

/**
 * How far outside it a Flutter frame is kept alive, in px.
 *
 * Far wider than `MOUNT_MARGIN`, and a second threshold rather than the same
 * one, because a frame torn down the moment it left the mount zone would be
 * rebuilt every time the reader scrolled back a screen. A React preview has no
 * equivalent: it is a handful of DOM nodes and it is never unmounted, whereas
 * each Flutter frame is a whole engine.
 */
const KEEP_MARGIN = 1200;

/**
 * The gallery's padding above and below a demo, together, in px.
 *
 * `MPCanvas.padding` in `packages/flutter/example/lib/canvas.dart` draws it
 * inside the frame, 32 above and 24 below, so a frame waiting for its own
 * height holds the reserve plus this. Change the two together.
 */
const CANVAS_PADDING_Y = 32 + 24;

/**
 * Whether the Flutter gallery has been built into `public/flutter`.
 *
 * One request for the whole session. Without the build every frame would show
 * the site's own 404 page, which looks like a broken preview rather than a step
 * that has not been run. `version.json` is written by `flutter build web` and is
 * the smallest file in the output.
 */
let flutterProbe = null;

function flutterBuilt(url) {
  flutterProbe ??= fetch(url, { method: 'HEAD' })
    .then((response) => response.ok)
    .catch(() => false);

  return flutterProbe;
}

/**
 * The channel the embedded gallery and this component talk over. Must match
 * `_channel` in `packages/flutter/example/lib/host_bridge_web.dart`.
 */
const CHANNEL = 'mp-demo';
</script>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData, withBase } from 'vitepress';
import { basePath, localeOf, t, tf } from '../../data/i18n';
import { framework } from '../../data/framework';
import { DEFAULT_FRAMEWORK, FRAMEWORKS } from '../../data/frameworks';
import FrameworkMark from './FrameworkMark.vue';

/**
 * A live preview of a Material Plus component, in whichever framework the
 * reader picked.
 *
 * **React** is rendered in the page. VitePress compiles Markdown to Vue, so
 * `<MPTextField />` cannot be written directly; the bridge is the usual one —
 * Vue owns a plain `<div>`, and React takes it over with `createRoot()` once the
 * page is in the browser.
 *
 * **Flutter** is rendered in an `<iframe>` by the gallery app under
 * `packages/flutter/example`, built into `public/flutter` by
 * `scripts/build-flutter-demos.mjs`. It has to be a frame rather than a canvas
 * in the page: a Flutter web app owns a whole engine, a document and an event
 * loop.
 *
 * `src` names a file under `.vitepress/demos` without its extension, so
 * `<Demo src="text-field/password" />` renders `demos/text-field/password.tsx`
 * and asks the gallery for the demo registered under the same key. The same
 * path goes into the `<<<` snippet in the Markdown next to it, which is how the
 * code shown under a preview is guaranteed to be the code that ran. A demo the
 * gallery does not have yet says so inside its frame.
 */
const props = defineProps({
  /** Demo module path, relative to `.vitepress/demos`, without `.tsx`. */
  src: { type: String, required: true },
  /** `center` for a single control that would look lost against a left edge. */
  align: { type: String, default: 'start' },
  /** Drops the frame — for previews that bring their own. */
  plain: { type: Boolean, default: false },
  /**
   * Whether this preview has a Flutter counterpart in the gallery.
   *
   * Left out, it is `true` for a framed preview and `false` for a `plain` one.
   * The plain previews are the site's own compositions (the component gallery,
   * the home page preview, the colour palette): they are about the site rather
   * than about one component, and they stay in React whichever framework is
   * selected. Pass it to say otherwise in either direction.
   */
  flutter: { type: Boolean, default: null },
  /**
   * Height the mount point holds, in px or as a CSS length.
   *
   * The box is empty until React is in the browser, so without this the page
   * reflows under the reader the moment a preview arrives. It stays applied
   * after mounting too: a reserve that is dropped once the content is there
   * moves the page a second time, which is the same jump twice.
   *
   * The Flutter frame holds it the same way, with the gallery's padding added,
   * as its least height. An `<iframe>` has no content of ours to measure, so its
   * height is whatever the gallery reports, but never less than this.
   */
  minHeight: { type: [Number, String], default: 56 }
});

// `lang` says which language the page is; `localeIndex` says where it lives in
// the URL. They are different questions and only one of them is the default.
const { isDark, lang, localeIndex } = useData();
const locale = localeOf(lang.value);
const base = basePath(localeIndex.value);

const shell = ref(null);
const host = ref(null);
const frame = ref(null);
const open = ref(false);
let root = null;
let loaded = null;
let observers = [];

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

/* ---------------------------------------------------------------------------
 * Which framework this preview is showing
 * ------------------------------------------------------------------------- */

/** Whether this preview has a Flutter half at all. */
const hasFlutter = computed(() => props.flutter ?? !props.plain);

/*
 * The framework this preview draws, which is the default for one tick after
 * hydration, the same detour `FrameworkSelect.vue` takes. The pre-rendered HTML
 * holds the default's half, and `syncFramework()` has put the stored choice in
 * `framework` before hydration starts, so a first render that read it would
 * disagree with the server's DOM for every reader who picked Flutter. Rendering
 * the default first and switching in `onMounted` makes the switch an ordinary
 * update, and it lands before `sync()` has mounted anything.
 */
const hydrated = ref(false);
const shown = computed(() => (hydrated.value ? framework.value : DEFAULT_FRAMEWORK));

const embedded = computed(() => hasFlutter.value && shown.value === 'flutter');

const frameworkLabel = computed(
  () => FRAMEWORKS.find((item) => item.id === shown.value)?.label ?? shown.value
);

/**
 * Whether this preview says which framework drew it.
 *
 * On every framed preview that has both, and on no other. A reader ten screens
 * down has long since scrolled past the switch, and "which one am I looking at"
 * is a question a preview should answer about itself.
 *
 * The badge carries every framework's mark and name, and `html[data-fw]`
 * displays one of them, as it does a `::: fw` block. That is right before
 * hydration too: the head script sets the attribute before the first paint,
 * where a badge drawn from `shown` would say React to a Flutter reader until
 * the bundle arrived.
 */
const marked = computed(() => hasFlutter.value && !props.plain);

/* ---------------------------------------------------------------------------
 * Visibility
 *
 * Two thresholds, watched separately: `near` is close enough to be worth
 * building, `keep` is close enough to be worth holding on to. See the constants
 * above for why a Flutter frame needs the second one.
 * ------------------------------------------------------------------------- */

const near = ref(false);
const keep = ref(false);

function watchMargin(margin, target) {
  if (typeof IntersectionObserver === 'undefined') {
    target.value = true;
    sync();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      target.value = entries.some((entry) => entry.isIntersecting);
      sync();
    },
    { rootMargin: `${margin}px 0px` }
  );

  // The outer element rather than the React mount point: on Flutter the mount
  // point is `display: none`, and a box with no layout never intersects
  // anything.
  observer.observe(shell.value);
  observers.push(observer);
}

/* ---------------------------------------------------------------------------
 * React
 * ------------------------------------------------------------------------- */

/**
 * Draws the demo in the current theme and the page's language.
 *
 * The scheme is a `data-mp-scheme` attribute on the wrapper `DemoRoot` renders,
 * so a theme change is a re-render with a new `mode`, and this is called again
 * whenever `theme` moves. The language is the page's `lang`, the same tag the
 * Flutter frame is given.
 */
function paint() {
  if (!root || !loaded) {
    return;
  }

  const { React, DemoRoot, demo } = loaded;

  root.render(
    React.createElement(
      DemoRoot,
      { mode: theme.value, locale: lang.value },
      // Demos are written in English and reused by every locale, since they are
      // code samples; only the words and numbers the library supplies follow
      // the page. The few that carry docs chrome of their own take the locale
      // and localise themselves.
      React.createElement(demo.default, { locale, base })
    )
  );
}

async function mountReact() {
  if (root) {
    return;
  }

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

  // Navigating away during the await leaves nothing to mount into, and a second
  // call that raced this one has already mounted.
  if (!host.value || root) {
    return;
  }

  loaded = { React, DemoRoot, demo };
  root = createRoot(host.value);
  paint();
}

/* ---------------------------------------------------------------------------
 * Flutter
 * ------------------------------------------------------------------------- */

/** `null` until the probe answers, so nothing is drawn on a guess. */
const built = ref(null);
/** Live once the frame has been near enough; cleared when it drifts far away. */
const frameLive = ref(false);
/** What the gallery reported it needs, in px. */
const frameHeight = ref(null);
/**
 * The theme the frame was booted in, taken once and not followed.
 *
 * Setting `src` navigates the `<iframe>`, and navigating it builds a whole
 * Flutter engine again, so the theme in the URL can only be the one the gallery
 * starts in. Everything after that is `pushTheme`. A frame that was given up
 * and is being built again starts in whatever the theme is by then, which is
 * why this is cleared along with the rest of the frame's state.
 */
const frameTheme = ref(null);

/*
 * `index.html` by name rather than the folder: the dev server does not map a
 * folder under `public/` to its `index.html`, and `/flutter/` there is the
 * site's own 404 page. A static host serves both the same.
 */
const frameSrc = computed(
  () =>
    `${withBase('/flutter/index.html')}?demo=${encodeURIComponent(props.src)}` +
    `&theme=${frameTheme.value ?? theme.value}&align=${encodeURIComponent(props.align)}` +
    // The page's language, which the gallery hands to an `MPLocaleProvider`, so
    // a Korean page shows a Korean calendar. Without it the gallery's own locale
    // is the `WidgetsApp` default, which is English whatever the reader's is.
    `&locale=${encodeURIComponent(lang.value)}`
);

/** `minHeight` as a CSS length. */
const reserve = computed(() =>
  typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight
);

const frameStyle = computed(() => {
  const least = `calc(${reserve.value} + ${CANVAS_PADDING_Y}px)`;

  return {
    height: frameHeight.value ? `${frameHeight.value}px` : least,
    minHeight: least
  };
});

function onMessage(event) {
  if (
    event.origin !== window.location.origin ||
    event.source !== frame.value?.contentWindow ||
    event.data?.channel !== CHANNEL
  ) {
    return;
  }

  if (event.data.type === 'size' && typeof event.data.height === 'number') {
    frameHeight.value = Math.ceil(event.data.height);
  }
}

/** Theme changes go over the channel rather than through `src`: reloading the
    frame would rebuild the engine to change the colours. */
function pushTheme() {
  frame.value?.contentWindow?.postMessage(
    { channel: CHANNEL, type: 'theme', theme: theme.value },
    window.location.origin
  );
}

/* ---------------------------------------------------------------------------
 * Wiring
 * ------------------------------------------------------------------------- */

/**
 * Brings the preview into line with where it is and what it should be.
 *
 * Called rather than watched, from the three places that can change the answer:
 * mounting, an observer crossing a threshold, and the framework switch. A
 * watcher would be the obvious shape and is the wrong one, because the first
 * call has to happen inside `onMounted`, after the page has laid out and the box
 * has a position to measure.
 */
async function sync() {
  if (!embedded.value) {
    // The switch took the frame with it, so whichever theme it booted in is no
    // longer anybody's: the next one is built in the theme of the moment.
    frameTheme.value = null;

    if (near.value) {
      mountReact();
    }
    return;
  }

  if (near.value) {
    built.value ??= await flutterBuilt(withBase('/flutter/version.json'));
    frameTheme.value ??= theme.value;
    frameLive.value = true;
  } else if (!keep.value) {
    // Out of sight by a long way: give the engine back.
    frameLive.value = false;
    frameHeight.value = null;
    frameTheme.value = null;
  }
}

// The reader switching framework mid-page: the preview they are looking at has
// to change over without waiting to be scrolled past.
watch(embedded, sync);

watch(theme, () => {
  paint();
  pushTheme();
});

onMounted(() => {
  // First, so that the `sync()` below already answers for the stored choice.
  hydrated.value = true;

  window.addEventListener('message', onMessage);

  /*
   * A component page holds a dozen previews, and mounting them all at once
   * means the preview being read waits its turn behind chunks for previews far
   * below the fold. Only what is on screen mounts.
   *
   * What is already visible is measured rather than observed: an
   * IntersectionObserver reports its first entry in a later task, and the
   * preview at the top of the page — the one the reader is waiting for — is
   * exactly what that task would delay.
   */
  const { top, bottom } = shell.value.getBoundingClientRect();

  if (top < window.innerHeight + MOUNT_MARGIN && bottom > -MOUNT_MARGIN) {
    near.value = true;
    keep.value = true;
  }

  watchMargin(MOUNT_MARGIN, near);
  watchMargin(KEEP_MARGIN, keep);

  sync();
});

onBeforeUnmount(() => {
  const mounted = root;
  root = null;
  loaded = null;

  window.removeEventListener('message', onMessage);
  observers.forEach((observer) => observer.disconnect());
  observers = [];

  // React refuses to unmount a root synchronously while it is rendering, and
  // client-side navigation tears the page down from inside Vue's own update.
  if (mounted) {
    setTimeout(() => mounted.unmount(), 0);
  }
});
</script>

<template>
  <div ref="shell" class="mp-demo" :class="{ 'mp-demo--plain': plain }">
    <div
      class="mp-demo-canvas"
      :class="{ 'mp-demo-canvas--embedded': embedded }"
      :data-align="align"
      :data-theme="theme"
    >
      <div
        v-if="marked"
        class="mp-demo-badge"
        :title="tf(locale, 'renderedWith', { framework: frameworkLabel })"
      >
        <span v-for="item in FRAMEWORKS" :key="item.id" class="mp-fw" :data-fw="item.id">
          <FrameworkMark :framework="item.id" :size="12" />
          <span>{{ item.label }}</span>
        </span>
      </div>
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
      <!--
        `vp-raw` is what keeps VitePress's router out of a running component.

        The router claims every same-page `<a href="#…">` click in the document,
        cancels it and scrolls the *window* to where it thinks the target is.
        Inside a preview that is always wrong: a demo's links belong to the
        component, and the one in `anchor/hero` points at headings in a panel of
        its own, so the page jumped and the panel stayed where it was. `vp-raw`
        is the marker the router checks before it touches anything, and a live
        preview is exactly the subtree it means.
      -->
      <div
        v-show="!embedded"
        ref="host"
        class="vp-raw mp-scope mp-demo-mount"
        :style="{ minHeight: reserve }"
      />
      <template v-if="embedded">
        <p v-if="built === false" class="mp-fw-missing mp-demo-unbuilt">
          {{ tf(locale, 'demoMissing', { framework: frameworkLabel }) }}
        </p>
        <iframe
          v-else-if="frameLive"
          ref="frame"
          class="mp-demo-frame"
          :src="frameSrc"
          :style="frameStyle"
          :title="tf(locale, 'demoTitle', { framework: frameworkLabel, demo: src })"
          @load="pushTheme"
        />
        <div v-else class="mp-demo-frame" :style="frameStyle" />
      </template>
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
