import { userEvent } from 'vitest/browser';

/**
 * Moves the mouse off whatever it happens to be sitting on.
 *
 * The pointer is one thing the whole browser shares, and — like the focus that
 * `fileParallelism: false` exists for — it does not reset between test files.
 * A file that clicks something leaves the cursor parked at that element's
 * centre, and the next file renders its own markup underneath it: a `click()` on
 * a 52×32 switch parks the pointer at roughly (26, 12), and a link rendered at
 * the origin of the next file is about 33×16 starting at (0, 1.6). The pointer
 * is inside it, and the engines disagree about whether that counts — Firefox
 * re-resolves `:hover` for the new layout at the cursor's last position, so a
 * `:hover` rule fires in a test that never touched the mouse.
 *
 * Which is only visible in an assertion about a *resting* style whose property
 * a `hover:` variant also writes. Call this first in one of those, so the test
 * is about the rule rather than about what the previous file left behind.
 *
 * The perch is a real element because there is no "move the mouse to a
 * coordinate" in the browser API — hovering something 8px wide, pinned where
 * nothing else is, and taken away afterwards, is the same thing said in the
 * vocabulary that exists. It is pinned *inside* the viewport rather than at a
 * corner of it: the tester runs in an iframe that is taller than the page can
 * show, so `bottom: 0` is a place Playwright refuses to hover and (200, 150) is
 * a place it will, far enough from the origin that a component rendered there is
 * nowhere near it.
 */
export async function parkPointer(): Promise<void> {
  const perch = document.createElement('div');

  perch.style.cssText = 'position:fixed;left:200px;top:150px;width:8px;height:8px';
  document.body.append(perch);

  try {
    await userEvent.hover(perch);
  } finally {
    perch.remove();
  }
}
