<script setup>
import { computed } from 'vue';
import { FRAMEWORKS } from '../../data/frameworks';

/**
 * A framework's own logo, drawn at text size and in its own colour.
 *
 * Here rather than in `data/frameworks.ts` because a data file holding raw path
 * data is a data file nobody can read. Adding a framework is an entry in that
 * file plus a branch here.
 *
 * Both marks are the products' own, used to name them. They take their colour
 * from `tint` rather than from the text around them, because here the mark is
 * what identifies the choice.
 */
const props = defineProps({
  framework: { type: String, required: true },
  size: { type: Number, default: 14 }
});

const tint = computed(
  () => FRAMEWORKS.find((item) => item.id === props.framework)?.tint ?? 'currentColor'
);
</script>

<template>
  <svg
    v-if="framework === 'react'"
    class="mp-framework-mark"
    viewBox="-11.5 -10.23 23 20.46"
    :width="size"
    :height="size"
    :style="{ color: tint }"
    aria-hidden="true"
  >
    <circle r="2.05" fill="currentColor" />
    <g fill="none" stroke="currentColor" stroke-width="1">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
  <svg
    v-else-if="framework === 'flutter'"
    class="mp-framework-mark"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    :style="{ color: tint }"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M14.314 0 2.3 12l3.7 3.7L21.684.013h-7.37Zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.42-6.47 6.42-6.458h-7.372Z"
    />
  </svg>
</template>
