/**
 * Which framework the reader is here for, as one value the whole site shares.
 *
 * `localStorage` is where the choice lives. Beyond that it is kept in two places
 * on purpose, and they are not redundant:
 *
 * - `document.documentElement.dataset.fw` is what displays a page. Every
 *   `::: fw` block is in the DOM and CSS hides the ones that are not wanted, so
 *   switching is one attribute write with no re-render. In a built site the
 *   inline script in `<head>` sets it before the first paint, so nothing flashes
 *   and hydration has nothing to disagree about.
 * - The `ref` here is for the parts that are components rather than content:
 *   the switch itself, and `Demo.vue`, which has to decide whether to mount a
 *   React root or a Flutter frame rather than draw both and hide one.
 *
 * `setFramework` writes all three, attribute, ref and storage, so nothing else
 * has to remember the order.
 */

import { readonly, ref } from 'vue';
import {
  DEFAULT_FRAMEWORK,
  FRAMEWORK_IDS,
  FRAMEWORK_STORAGE_KEY,
  type Framework
} from './frameworks';

const current = ref<Framework>(DEFAULT_FRAMEWORK);

/**
 * The current framework. Read-only: it is written through `setFramework`, which
 * is what keeps `<html data-fw>` and the ref from drifting apart.
 *
 * On the server this is always the default, which is also what the pre-rendered
 * HTML is styled as. `syncFramework` corrects it in the browser.
 */
export const framework = readonly(current);

function isKnown(value: unknown): value is Framework {
  return typeof value === 'string' && FRAMEWORK_IDS.includes(value);
}

export function setFramework(next: Framework): void {
  if (!isKnown(next) || next === current.value) {
    return;
  }

  current.value = next;

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.fw = next;
  }

  try {
    localStorage.setItem(FRAMEWORK_STORAGE_KEY, next);
  } catch {
    // Private mode, or storage that is full. The choice still applies to this
    // page; it just does not survive a reload.
  }
}

/**
 * Reads the stored choice into the ref, and writes it back onto `<html>`.
 *
 * Called once, from the theme's `enhanceApp`. It reads storage rather than the
 * attribute, which looks like the long way round since the head script has
 * usually set the attribute from that same storage already. It is not: the dev
 * server applies the site's `head` config from the client after the app boots,
 * so there the inline script runs after this does. Reading the attribute would
 * pick up the default, and the ref and the page would spend the session
 * disagreeing about which framework the reader chose.
 *
 * Writing the attribute here is what makes the two agree either way.
 */
export function syncFramework(): void {
  if (typeof document === 'undefined') {
    return;
  }

  let stored: string | null = null;

  try {
    stored = localStorage.getItem(FRAMEWORK_STORAGE_KEY);
  } catch {
    // Private mode. The attribute is the next best guess.
  }

  const applied = isKnown(stored)
    ? stored
    : isKnown(document.documentElement.dataset.fw)
      ? document.documentElement.dataset.fw
      : DEFAULT_FRAMEWORK;

  current.value = applied;
  document.documentElement.dataset.fw = applied;
}
