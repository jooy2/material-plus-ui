import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPPane, MPPanes } from 'material-plus-ui';

/**
 * A split at a known size, so a fraction can be checked as a number of pixels.
 *
 * The component measures itself once on mount to turn a `'240px'` default into a
 * fraction, so every assertion here needs a container with a real width — which
 * is the whole reason these tests run in a browser rather than in a DOM
 * emulator.
 */
function Split({
  width = 400,
  height = 200,
  ...props
}: { width?: number; height?: number } & React.ComponentProps<typeof MPPanes>) {
  return (
    <div style={{ width, height }}>
      <MPPanes {...props} />
    </div>
  );
}

const widthOf = (element: Element) => element.getBoundingClientRect().width;

describe('MPPanes', () => {
  describe('the split', () => {
    it('gives every pane an even share when nobody asked for one', async () => {
      const screen = await render(
        <Split>
          <MPPane data-testid="a">A</MPPane>
          <MPPane data-testid="b">B</MPPane>
        </Split>
      );

      const a = widthOf(screen.getByTestId('a').element());
      const b = widthOf(screen.getByTestId('b').element());

      expect(Math.round(a)).toBe(Math.round(b));
      // 400 less the one 8px handle, halved.
      expect(Math.round(a)).toBe(196);
    });

    it('turns an absolute default into a share of what is there', async () => {
      const screen = await render(
        <Split>
          <MPPane defaultSize="100px" data-testid="a">
            A
          </MPPane>
          <MPPane data-testid="b">B</MPPane>
        </Split>
      );

      expect(Math.round(widthOf(screen.getByTestId('a').element()))).toBe(100);
      expect(Math.round(widthOf(screen.getByTestId('b').element()))).toBe(292);
    });

    it('reads a bare number as a percentage', async () => {
      const screen = await render(
        <Split>
          <MPPane defaultSize={25} data-testid="a">
            A
          </MPPane>
          <MPPane data-testid="b">B</MPPane>
        </Split>
      );

      expect(Math.round(widthOf(screen.getByTestId('a').element()))).toBe(98);
    });

    it('interleaves one handle fewer than there are panes', async () => {
      const screen = await render(
        <Split>
          <MPPane>A</MPPane>
          <MPPane>B</MPPane>
          <MPPane>C</MPPane>
        </Split>
      );

      expect(screen.getByRole('separator').all()).toHaveLength(2);
    });
  });

  describe('the handle', () => {
    it('is a window splitter that says where it currently sits', async () => {
      const screen = await render(
        <Split>
          <MPPane defaultSize={25}>A</MPPane>
          <MPPane>B</MPPane>
        </Split>
      );
      const handle = screen.getByRole('separator').element();

      expect(handle).toHaveAttribute('aria-orientation', 'vertical');
      expect(handle).toHaveAttribute('aria-valuemin', '0');
      expect(handle).toHaveAttribute('aria-valuemax', '100');
      expect(handle).toHaveAttribute('aria-valuenow', '25');
    });

    it('turns the other way round when the panes are stacked', async () => {
      const screen = await render(
        <Split orientation="vertical">
          <MPPane>A</MPPane>
          <MPPane>B</MPPane>
        </Split>
      );

      expect(screen.getByRole('separator').element()).toHaveAttribute(
        'aria-orientation',
        'horizontal'
      );
    });

    it('moves on an arrow key, which is a whole gesture on its own', async () => {
      const onResizeEnd = vi.fn();
      const screen = await render(
        <Split onResizeEnd={onResizeEnd}>
          <MPPane data-testid="a">A</MPPane>
          <MPPane>B</MPPane>
        </Split>
      );
      const before = widthOf(screen.getByTestId('a').element());

      await press(screen.getByRole('separator').element(), 'ArrowRight');

      expect(Math.round(widthOf(screen.getByTestId('a').element()) - before)).toBe(16);
      // There is no "let go" to wait for, so the settled callback fires with it.
      expect(onResizeEnd).toHaveBeenCalledTimes(1);
    });

    it('will not cross the floor a pane was given', async () => {
      const screen = await render(
        <Split>
          <MPPane data-testid="a" minSize="150px">
            A
          </MPPane>
          <MPPane>B</MPPane>
        </Split>
      );
      const handle = screen.getByRole('separator').element();

      for (let count = 0; count < 6; count += 1) {
        await press(handle, 'ArrowLeft');
      }

      expect(Math.round(widthOf(screen.getByTestId('a').element()))).toBe(150);
    });

    it('goes to the ends of its travel on Home and End', async () => {
      // Without them the only way to reach a bound is to hold an arrow key down
      // and watch — for a floor four hundred pixels away, twenty-five presses.
      const screen = await render(
        <Split>
          <MPPane data-testid="a" minSize="120px" maxSize="320px">
            A
          </MPPane>
          <MPPane>B</MPPane>
        </Split>
      );
      const handle = screen.getByRole('separator').element();

      await press(handle, 'Home');
      expect(Math.round(widthOf(screen.getByTestId('a').element()))).toBe(120);

      await press(handle, 'End');
      expect(Math.round(widthOf(screen.getByTestId('a').element()))).toBe(320);
    });

    it('names the pane its value is about', async () => {
      // `aria-valuenow` is that pane's share, so without this a screen reader
      // reads a percentage with nothing to attach it to.
      const screen = await render(
        <Split>
          <MPPane data-testid="a">A</MPPane>
          <MPPane>B</MPPane>
        </Split>
      );
      const controls = screen.getByRole('separator').element().getAttribute('aria-controls')!;

      expect(screen.getByTestId('a').element().id).toBe(controls);
    });

    it('leaves the tab order and stops responding when it is not resizable', async () => {
      const screen = await render(
        <Split resizable={false}>
          <MPPane data-testid="a">A</MPPane>
          <MPPane>B</MPPane>
        </Split>
      );
      const handle = screen.getByRole('separator').element();
      const before = widthOf(screen.getByTestId('a').element());

      expect(handle).toHaveAttribute('tabindex', '-1');
      expect(handle).toHaveAttribute('aria-disabled', 'true');

      handle.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
      );

      expect(widthOf(screen.getByTestId('a').element())).toBe(before);
    });
  });

  describe('the page’s own selection', () => {
    it('is handed back when a split disappears mid-drag', async () => {
      /*
       * A drag takes the document's text selection away so that dragging a
       * handle does not select the page it passes over. That is not this
       * component's property to keep: a split unmounted mid-drag — a route
       * change, a closed panel — never reaches the end of the gesture, and
       * without a cleanup the whole page stays unselectable with nothing left on
       * screen to suggest why.
       */
      const before = document.body.style.userSelect;
      const screen = await render(
        <Split>
          <MPPane data-testid="a">A</MPPane>
          <MPPane>B</MPPane>
        </Split>
      );
      const handle = screen.getByRole('separator').element();

      handle.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          button: 0,
          pointerId: 1,
          clientX: 200,
          clientY: 100
        })
      );

      expect(document.body.style.userSelect).toBe('none');

      screen.unmount();

      expect(document.body.style.userSelect).toBe(before);
    });
  });

  describe('what a pane draws', () => {
    it('is nothing: a split is layout, so a pane has no surface of its own', async () => {
      const screen = await render(
        <Split>
          <MPPane data-testid="a">A</MPPane>
          <MPPane>B</MPPane>
        </Split>
      );
      const styles = getComputedStyle(screen.getByTestId('a').element());

      expect(styles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
      expect(styles.borderTopWidth).toBe('0px');
    });
  });
});

/**
 * One key press on the handle, and a frame for React to paint the result.
 *
 * Dispatched rather than typed through the driver, because the driver would have
 * to focus the handle first — and a *press* is what puts the focus ring on it,
 * which is the one thing the component goes out of its way to avoid doing on a
 * pointer press. The handler under test reads only `event.key`.
 */
async function press(handle: Element, key: string) {
  handle.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
}
