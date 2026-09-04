import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPScrollArea } from 'material-plus-ui';
import { parkPointer } from '../../support/pointer';

const Tall = () => <div style={{ height: 1200 }}>Long</div>;
// Over on both axes, so both bars have something to report.
const Both = () => <div style={{ width: 1200, height: 1200 }}>Wide and long</div>;

const bars = () => document.querySelectorAll('.mp-scroll-area__bar');

/**
 * Base UI measures the overflow in an effect and renders no scrollbar until it
 * has, so every assertion about a bar has to wait for that pass rather than
 * reading the DOM the render produced.
 *
 * That is the component's own behaviour and worth knowing: a box whose content
 * does not overflow has no bar in the DOM at all, which is why `persistent` is
 * about opacity and not about mounting.
 */
async function settled(): Promise<void> {
  await vi.waitFor(() => expect(bars().length).toBeGreaterThan(0));
}

describe('MPScrollArea', () => {
  it('draws a vertical bar and nothing else by default', async () => {
    await render(
      <MPScrollArea maxHeight={200}>
        <Tall />
      </MPScrollArea>
    );

    await settled();

    expect(bars()).toHaveLength(1);
    expect(bars()[0]).toHaveAttribute('data-orientation', 'vertical');
  });

  it('draws both when told to, and the corner between them', async () => {
    await render(
      // A width of its own: the viewport is 1280 wide in this suite, so content
      // 1200 across would fit and there would be nothing to scroll sideways.
      <MPScrollArea maxHeight={200} axis="both" style={{ width: 300 }}>
        <Both />
      </MPScrollArea>
    );

    await vi.waitFor(() => expect(bars()).toHaveLength(2));

    expect(document.querySelector('.mp-scroll-area__corner')).not.toBeNull();
  });

  it('draws no corner on one axis', async () => {
    // A square in the corner of a box that scrolls one way is a grey square
    // with nothing to explain it.
    await render(
      <MPScrollArea maxHeight={200}>
        <Tall />
      </MPScrollArea>
    );

    await settled();

    expect(document.querySelector('.mp-scroll-area__corner')).toBeNull();
  });

  it('is a real scroll container', async () => {
    // The native bar is hidden rather than the scrolling being reimplemented,
    // which is what keeps the wheel, the keyboard and scroll anchoring working.
    const screen = await render(
      <MPScrollArea maxHeight={200}>
        <Tall />
      </MPScrollArea>
    );
    const viewport = screen.container.querySelector('.mp-scroll-area__viewport')!;

    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);

    viewport.scrollTop = 100;

    expect(viewport.scrollTop).toBe(100);
  });

  it('bounds the box with `maxHeight`', async () => {
    const screen = await render(
      <MPScrollArea maxHeight={200} data-testid="area">
        <Tall />
      </MPScrollArea>
    );

    expect(screen.getByTestId('area').element().getBoundingClientRect().height).toBe(200);
  });

  it('takes a fixed height, and reads a string as a length', async () => {
    const screen = await render(
      <MPScrollArea height="10rem" data-testid="area">
        <Tall />
      </MPScrollArea>
    );

    expect(screen.getByTestId('area').element().getBoundingClientRect().height).toBe(160);
  });

  it('holds the bar open when asked, and hides it otherwise', async () => {
    // The bar is drawn while hovered, so this one is rendered clear of where
    // the pointer is parked — `parkPointer` leaves the cursor at (200, 150) and
    // a box under it would keep its bar open whatever the prop said.
    await parkPointer();

    const screen = await render(
      <div style={{ marginTop: 400 }}>
        <MPScrollArea maxHeight={200} persistent>
          <Tall />
        </MPScrollArea>
      </div>
    );

    await settled();

    expect(getComputedStyle(bars()[0]).opacity).toBe('1');

    await screen.rerender(
      <div style={{ marginTop: 400 }}>
        <MPScrollArea maxHeight={200}>
          <Tall />
        </MPScrollArea>
      </div>
    );

    // The bar fades rather than disappearing, so the resting value is what is
    // asserted rather than the one the frame after the rerender happens to hold.
    await vi.waitFor(() => expect(getComputedStyle(bars()[0]).opacity).toBe('0'));
  });

  it('takes the thickness from `size`', async () => {
    const screen = await render(
      <MPScrollArea maxHeight={200} size="xl">
        <Tall />
      </MPScrollArea>
    );
    await settled();
    const wide = bars()[0].getBoundingClientRect().width;

    await screen.rerender(
      <MPScrollArea maxHeight={200} size="xs">
        <Tall />
      </MPScrollArea>
    );

    expect(bars()[0].getBoundingClientRect().width).toBeLessThan(wide);
  });

  it('does not take room from the layout', async () => {
    // The bar overlays the content, which is what makes this swappable for the
    // browser's own on a page that has already been designed.
    const screen = await render(
      <MPScrollArea maxHeight={200} data-testid="area" style={{ width: 300 }}>
        <div data-testid="content" style={{ height: 1200 }}>
          Long
        </div>
      </MPScrollArea>
    );

    expect(screen.getByTestId('content').element().getBoundingClientRect().width).toBe(300);
  });
});
