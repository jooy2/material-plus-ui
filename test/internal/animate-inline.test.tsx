import { afterEach, describe, expect, it } from 'vitest';
import {
  MPAnimateHeadline,
  MPAnimateScramble,
  MPAnimateSplit,
  MPAnimateTyping
} from 'material-plus-ui';
import { cleanupHydrated, hydrateFromServer } from '../support/hydrate';

/**
 * The text animators inside a paragraph, which is where a rotating word or a
 * typed phrase usually goes.
 *
 * Their root is a `<div>`, and an HTML parser reading `<p>…<div>` closes the
 * paragraph at the `<div>` — so the tree the browser built from the server's
 * markup is not the tree React rendered, and hydration fails over it. `render`
 * is the way to say the root is a `<span>`.
 */
describe('a text animator rendered inside a paragraph', () => {
  afterEach(cleanupHydrated);

  it.each([
    [
      'MPAnimateHeadline',
      <MPAnimateHeadline key="h" render={<span />}>
        <span>a library</span>
        <span>a system</span>
      </MPAnimateHeadline>
    ],
    ['MPAnimateTyping', <MPAnimateTyping key="t" render={<span />} text="typed" />],
    [
      'MPAnimateScramble',
      <MPAnimateScramble key="s" render={<span />}>
        scrambled
      </MPAnimateScramble>
    ],
    [
      'MPAnimateSplit',
      <MPAnimateSplit key="p" render={<span />}>
        split apart
      </MPAnimateSplit>
    ]
  ])('hydrates as a %s with a `<span>` root', async (_, animator) => {
    const { container, errors, html } = await hydrateFromServer(<p>We build {animator}</p>);

    expect(html).not.toContain('<div');
    expect(errors).toEqual([]);
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });
});
