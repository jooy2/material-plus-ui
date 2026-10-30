<script setup>
import { computed, onMounted, ref } from 'vue';
import { useData } from 'vitepress';
import FrameworkMark from './FrameworkMark.vue';
import { framework, setFramework } from '../../data/framework';
import { DEFAULT_FRAMEWORK, FRAMEWORKS } from '../../data/frameworks';
import { localeOf, t } from '../../data/i18n';

/**
 * The framework switch, at the top of the sidebar.
 *
 * It sits above the menu rather than in the navbar because it is not
 * navigation: it does not take the reader anywhere, it changes what the page
 * they are already on says. The sidebar is where the rest of that scoping
 * lives, and on a phone the drawer carries it along.
 *
 * A segmented control rather than a `<select>`. There are exactly two options,
 * both always worth showing, and the choice colours every page on the site; a
 * control that hides one of its two states behind a click is the wrong shape
 * for that.
 *
 * Built from real radio inputs, hidden and labelled. That buys the arrow keys,
 * the group semantics and the focus behaviour for free, where a row of
 * `<button>`s would need a roving tabindex written by hand.
 */
const { lang } = useData();
const locale = computed(() => localeOf(lang.value));

/*
 * Which option the radios say is chosen, deliberately one tick behind the page.
 *
 * The pre-rendered HTML has the default checked, because that is all a build
 * can know. `syncFramework()` runs in `enhanceApp`, before hydration, so a
 * first render that read `framework` would already hold the stored choice and
 * disagree with the server's DOM. Hydration patches handlers and `value` and
 * leaves `checked` as the server wrote it, so a reader who picked Flutter would
 * come back to a page in Flutter with React ticked.
 *
 * Rendering the default first and correcting it in `onMounted` makes the
 * correction an ordinary update, which Vue does apply. What the eye reads in
 * the meantime is drawn from `html[data-fw]`, which the head script sets before
 * the first paint, so the highlight is right immediately either way.
 */
const hydrated = ref(false);

onMounted(() => {
  hydrated.value = true;
});

const checked = computed(() => (hydrated.value ? framework.value : DEFAULT_FRAMEWORK));
</script>

<template>
  <div class="mp-framework">
    <p id="mp-framework-label" class="mp-framework-title">{{ t(locale, 'frameworkLabel') }}</p>
    <div class="mp-framework-track" role="radiogroup" aria-labelledby="mp-framework-label">
      <label
        v-for="item in FRAMEWORKS"
        :key="item.id"
        class="mp-framework-option"
        :data-fw="item.id"
      >
        <input
          type="radio"
          name="mp-framework"
          :value="item.id"
          :checked="checked === item.id"
          @change="setFramework(item.id)"
        />
        <FrameworkMark :framework="item.id" />
        <span>{{ item.label }}</span>
      </label>
    </div>
  </div>
</template>
