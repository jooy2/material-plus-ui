import type * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButton, MPCheckbox, MPChip, MPDialog, MPTable } from 'material-plus-ui';

/**
 * The shape presets, measured rather than read.
 *
 * `data-mp-shape` sets four custom properties and nothing else, which makes it
 * look like the kind of change that cannot break. It can, and in a way no
 * assertion on the stylesheet text would catch: the utilities read
 * `--radius-mp-*`, and that alias is declared twice — once by `@theme`, which
 * emits it on `:root`, and once on `*`. Only the second re-resolves per element.
 * If the `*` declaration were ever dropped as a duplicate, the preset would
 * still be in the CSS and every corner would still come out at the root's value.
 *
 * So these read `getComputedStyle`, and they do it on a subtree rather than on
 * the document, because a preset that only worked on `<html>` is a preset that
 * has quietly frozen at the root.
 */

/** The corner the browser actually painted, in pixels. */
function radiusOf(element: Element): number {
  return Number.parseFloat(getComputedStyle(element).borderTopLeftRadius);
}

const ROWS = [{ name: 'Ada' }];
const HEADERS = [{ key: 'name', label: 'Name', render: (row: { name: string }) => row.name }];

describe('data-mp-shape', () => {
  it('leaves the specification corners in place when nothing is set', async () => {
    const screen = await render(
      <div>
        <MPChip>Filter</MPChip>
        <MPTable headers={HEADERS} items={ROWS} />
        <MPButton>Save</MPButton>
        <MPCheckbox label="Agree" />
      </div>
    );

    // MD3's own: a chip is a tile, a sheet is a sheet, a button is a pill, and
    // the tick is half the smallest corner.
    expect(radiusOf(screen.container.querySelector('.mp-chip')!)).toBe(8);
    expect(radiusOf(screen.container.querySelector('.mp-table')!)).toBe(12);
    expect(radiusOf(screen.container.querySelector('.mp-button')!)).toBeGreaterThan(1000);
    expect(radiusOf(screen.container.querySelector('.mp-checkbox__tick')!)).toBe(2);
  });

  it('rounds the rungs that have somewhere to move, and leaves the pill alone', async () => {
    const screen = await render(
      <div data-mp-shape="rounded">
        <MPChip>Filter</MPChip>
        <MPTable headers={HEADERS} items={ROWS} />
        <MPButton>Save</MPButton>
        <MPCheckbox label="Agree" />
      </div>
    );

    expect(radiusOf(screen.container.querySelector('.mp-chip')!)).toBe(12);
    expect(radiusOf(screen.container.querySelector('.mp-table')!)).toBe(20);
    // Already a pill at the default, so there is no rounder to go.
    expect(radiusOf(screen.container.querySelector('.mp-button')!)).toBeGreaterThan(1000);
    // The tick derives its corner instead of reading a token, and still follows.
    expect(radiusOf(screen.container.querySelector('.mp-checkbox__tick')!)).toBe(4);
  });

  it('squares the pill too, which is the one direction it can travel', async () => {
    const screen = await render(
      <div data-mp-shape="sharp">
        <MPChip>Filter</MPChip>
        <MPTable headers={HEADERS} items={ROWS} />
        <MPButton>Save</MPButton>
        <MPCheckbox label="Agree" />
      </div>
    );

    for (const selector of ['.mp-chip', '.mp-table', '.mp-button', '.mp-checkbox__tick']) {
      expect(radiusOf(screen.container.querySelector(selector)!), selector).toBe(0);
    }
  });

  it('reaches a dialog, which renders outside the subtree it was written in', async () => {
    // The one shaped component the attribute cannot reach by inheritance: Base UI
    // puts the popup in a portal at the end of `<body>`, so a preset on a section
    // around the trigger is not an ancestor of the thing being shaped. The
    // assertion is therefore on the document, which is where a consumer will
    // realistically set it — and it is here to record that the subtree form does
    // *not* carry into a portal.
    document.documentElement.setAttribute('data-mp-shape', 'rounded');

    try {
      const screen = await render(
        <MPDialog open title="Delete" onOpenChange={() => {}}>
          Body
        </MPDialog>
      );

      expect(radiusOf(document.querySelector('.mp-dialog')!)).toBe(32);

      screen.unmount();
    } finally {
      document.documentElement.removeAttribute('data-mp-shape');
    }
  });

  it('sets a corner per element, so two subtrees can disagree', async () => {
    const screen = await render(
      <div>
        <div data-mp-shape="rounded">
          <MPChip>Rounded</MPChip>
        </div>
        <div data-mp-shape="sharp">
          <MPChip>Sharp</MPChip>
        </div>
        <MPChip>Default</MPChip>
      </div>
    );

    const [rounded, sharp, plain] = [...screen.container.querySelectorAll('.mp-chip')];

    expect(radiusOf(rounded)).toBe(12);
    expect(radiusOf(sharp)).toBe(0);
    expect(radiusOf(plain)).toBe(8);
  });

  it('loses to a token the consumer sets themselves', async () => {
    // The presets sit in `@layer theme`, so an application that wants its own
    // number beats them without having to care about import order.
    const screen = await render(
      <div
        data-mp-shape="rounded"
        style={{ '--mp-sys-shape-corner-small': '3px' } as React.CSSProperties}
      >
        <MPChip>Filter</MPChip>
      </div>
    );

    expect(radiusOf(screen.container.querySelector('.mp-chip')!)).toBe(3);
  });
});
