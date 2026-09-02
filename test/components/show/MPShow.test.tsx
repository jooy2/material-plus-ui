import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPShow } from 'material-plus-ui';

/**
 * Which window class the suite is in, and why every assertion below is written
 * against one.
 *
 * The tests run at 1280×900 — see `vitest.config.ts` — which is MD3's `large`.
 * So `large` is the class that is on screen, `expanded` and below are under it,
 * and `extra-large` is above it, and each case names the boundary it is on the
 * far side of rather than a pixel width.
 */
const display = (element: Element) => getComputedStyle(element).display;

describe('MPShow', () => {
  it('shows what is at or above `from`', async () => {
    const screen = await render(<MPShow from="expanded">Wide</MPShow>);

    expect(display(screen.container.querySelector('.mp-show')!)).toBe('contents');
  });

  it('hides what is below `from`', async () => {
    const screen = await render(<MPShow from="extra-large">Wider still</MPShow>);

    expect(display(screen.container.querySelector('.mp-show')!)).toBe('none');
  });

  it('hides what is at or above `until`', async () => {
    const screen = await render(<MPShow until="large">Narrow</MPShow>);

    expect(display(screen.container.querySelector('.mp-show')!)).toBe('none');
  });

  it('shows what is below `until`', async () => {
    const screen = await render(<MPShow until="extra-large">Not the widest</MPShow>);

    expect(display(screen.container.querySelector('.mp-show')!)).toBe('contents');
  });

  it('covers every width exactly once across a `from`/`until` pair', async () => {
    // The shape the component exists for: two arrangements over one boundary,
    // one of them on screen at every width and never both.
    const screen = await render(
      <div>
        <MPShow until="large" className="narrow">
          Compact arrangement
        </MPShow>
        <MPShow from="large" className="wide">
          Expanded arrangement
        </MPShow>
      </div>
    );

    expect(display(screen.container.querySelector('.narrow')!)).toBe('none');
    expect(display(screen.container.querySelector('.wide')!)).toBe('contents');
  });

  describe('only', () => {
    it('shows the class it names', async () => {
      const screen = await render(<MPShow only="large">Large</MPShow>);

      expect(display(screen.container.querySelector('.mp-show')!)).toBe('contents');
    });

    it('hides every class under it', async () => {
      const screen = await render(<MPShow only="extra-large">Extra large</MPShow>);

      expect(display(screen.container.querySelector('.mp-show')!)).toBe('none');
    });

    it('hides every class over it', async () => {
      // The half a single class name cannot say on its own: `only="medium"` has
      // to stop at `expanded`, not run on to the top of the ladder.
      const screen = await render(<MPShow only="medium">Medium</MPShow>);

      expect(display(screen.container.querySelector('.mp-show')!)).toBe('none');
    });

    it('runs to the top of the ladder when it names the top of it', async () => {
      const screen = await render(<MPShow only="extra-large" className="top" from="compact" />);

      // Nothing is above `extra-large`, so there is no upper bound to write and
      // the only class on it is the lower one this `from` overrode away.
      expect(screen.container.querySelector('.top')!.className).toBe('mp-show top');
    });

    it('lets `from` and `until` override their own half', async () => {
      const screen = await render(
        <MPShow only="medium" until="extra-large">
          Medium up to the widest
        </MPShow>
      );

      expect(display(screen.container.querySelector('.mp-show')!)).toBe('contents');
    });
  });

  describe('the wrapper', () => {
    it('takes no part in the layout it is shown in', async () => {
      // `display: contents` rather than a block, so the children are the flex
      // items. A wrapper that became one would put both of them in a single
      // column and the caller could not see why.
      const screen = await render(
        <div style={{ display: 'flex', width: 400 }}>
          <MPShow from="compact">
            {/* `flex-basis: 0`, so the two share the row exactly rather than
                sharing what is left after their words. */}
            <div className="first" style={{ flex: '1 1 0' }}>
              First
            </div>
          </MPShow>
          <div className="second" style={{ flex: '1 1 0' }}>
            Second
          </div>
        </div>
      );

      expect(
        Number.parseFloat(getComputedStyle(screen.container.querySelector('.first')!).width)
      ).toBeCloseTo(200, 0);
    });

    it('gives up its display to a class of the caller’s own', async () => {
      // `:where()` is zero specificity, so this does not need `!important` or a
      // second element to win.
      const screen = await render(<MPShow className="flex">Boxed</MPShow>);

      expect(display(screen.container.querySelector('.mp-show')!)).toBe('flex');
    });

    it('still hides while the caller has given it a display', async () => {
      const screen = await render(
        <MPShow from="extra-large" className="flex">
          Boxed and away
        </MPShow>
      );

      expect(display(screen.container.querySelector('.mp-show')!)).toBe('none');
    });

    it('renders something other than a `<div>` when asked', async () => {
      const screen = await render(
        <ul>
          <MPShow from="compact" render={<li />}>
            Item
          </MPShow>
        </ul>
      );

      expect(screen.container.querySelector('.mp-show')!.tagName).toBe('LI');
    });
  });
});
