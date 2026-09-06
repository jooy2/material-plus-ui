import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPTextField } from 'material-plus-ui';

/**
 * The notched outline, on its own.
 *
 * Six controls wear it — the text field, the select, the number field, the
 * combobox, the colour picker and the four pickers — and none of them owns it,
 * so what it draws is asserted here rather than through whichever of them
 * happened to be convenient. `MPTextField` is the shell with the least around
 * it, which is why it is the one every case below renders.
 */

/** The row the outline is absolutely positioned into, and its own box. */
function boxes(container: Element) {
  const outline = container.querySelector('fieldset')!;

  return {
    outline: outline.getBoundingClientRect(),
    row: outline.parentElement!.getBoundingClientRect()
  };
}

describe('the field outline', () => {
  describe('the notch space', () => {
    /*
     * A browser paints a fieldset's block-start border through the middle of its
     * legend, so the shell pulls the box up by five pixels to land that line on
     * the control's own top edge. With no label there is no legend and nothing
     * to make room for, and the offset was drawing a 37px ring around a 32px
     * field — 2.5px above the centre of the row it was in, which is how it was
     * reported: a search box that does not quite line up with the icons beside
     * it.
     */
    it('is not reserved on a field with no label', async () => {
      const screen = await render(<MPTextField size="xs" value="" />);
      const { outline, row } = boxes(screen.container);

      expect(outline.top).toBeCloseTo(row.top, 1);
      expect(outline.height).toBeCloseTo(row.height, 1);
    });

    it('is reserved on a field that has one', async () => {
      const screen = await render(<MPTextField size="xs" value="" label="Email" />);
      const { outline, row } = boxes(screen.container);

      expect(outline.top).toBeCloseTo(row.top - 5, 1);
    });
  });

  describe('where the notch is cut', () => {
    /*
     * A legend is placed within the border it interrupts by its fieldset's
     * `text-align`, and the label is placed by `start-*`. With no alignment of
     * its own the outline took the page's, so inside a centred card the gap
     * opened in the middle of the top border with the label still at the inline
     * start — 165px apart on a 345px card.
     */
    it('is at the inline start, whatever the page is aligned to', async () => {
      const screen = await render(
        <div style={{ textAlign: 'center', width: 360 }}>
          <MPTextField value="a" label="Email" fullWidth />
        </div>
      );
      const outline = screen.container.querySelector('fieldset')!.getBoundingClientRect();
      const notch = screen.container.querySelector('legend')!.getBoundingClientRect();
      const label = screen.container.querySelector('label')!.getBoundingClientRect();

      expect(notch.left - outline.left).toBeLessThan(16);
      expect(Math.abs(notch.left - label.left)).toBeLessThan(8);
    });
  });
});
