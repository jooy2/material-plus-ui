<script setup>
import DefaultTheme from 'vitepress/theme';
import { onContentUpdated } from 'vitepress';
import { nextTick, watch } from 'vue';
import FrameworkSelect from './FrameworkSelect.vue';
import { framework } from '../../data/framework';

/**
 * The default layout with the framework switch above the sidebar menu, and an
 * outline that only lists the headings of the selected framework.
 */
const { Layout } = DefaultTheme;

/* ---------------------------------------------------------------------------
 * The outline, filtered to the selected framework
 *
 * A heading inside a `::: fw` block is hidden with its block, but VitePress
 * builds "On this page" from the Markdown rather than from the DOM. Without
 * this a reader on Flutter is offered a link to `render`, which is React-only,
 * and following it scrolls to nothing.
 *
 * Done here rather than by teaching the outline about frameworks because the
 * outline is the default theme's, and this is a handful of lines against a fork
 * of it. The anchors are the join: an outline link's `href` is the id of the
 * heading it points at, and the heading knows which block it is in.
 * ------------------------------------------------------------------------- */

function syncOutline() {
  const doc = document.querySelector('.vp-doc');

  if (!doc) {
    return;
  }

  for (const link of document.querySelectorAll('.outline-link')) {
    const id = decodeURIComponent(link.getAttribute('href')?.slice(1) ?? '');
    const heading = id ? doc.querySelector(`[id="${CSS.escape(id)}"]`) : null;
    const block = heading?.closest('.mp-fw');
    const hidden = Boolean(block) && !block.dataset.fw.split(' ').includes(framework.value);

    (link.closest('li') ?? link).classList.toggle('mp-fw-hidden', hidden);
  }
}

// `onContentUpdated` is the hook the outline itself is built on, so it fires on
// the first render and on every navigation, and `nextTick` puts this after the
// outline has been rebuilt rather than in the middle of it.
onContentUpdated(() => nextTick(syncOutline));

// And again when the reader switches framework, which changes which half of the
// page is shown without changing the page.
watch(framework, () => nextTick(syncOutline));
</script>

<template>
  <Layout>
    <template #sidebar-nav-before>
      <FrameworkSelect />
    </template>
  </Layout>
</template>
