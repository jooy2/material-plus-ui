import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPScrollZone } from 'material-plus-ui';

/** Wide enough that four of them cannot fit in the box below. */
const Item = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 200, height: 60 }}>{children}</div>
);

const Strip = (props: Record<string, unknown>) => (
  <div style={{ width: 300 }}>
    <MPScrollZone {...props}>
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
      <Item>Four</Item>
    </MPScrollZone>
  </div>
);

const scroller = () => document.querySelector('.mp-scroll-zone__scroller') as HTMLElement;
const track = () => document.querySelector('.mp-scroll-zone__track') as HTMLElement;
const buttons = () => document.querySelectorAll('.mp-scroll-zone button');

/**
 * The buttons appear only once the overflow has been measured, and that happens
 * in an effect and again on every `ResizeObserver` callback. Every assertion
 * about one waits rather than reading the DOM the first render produced.
 */
async function settled(): Promise<void> {
  await vi.waitFor(() => expect(buttons().length).toBeGreaterThan(0));
}

describe('MPScrollZone', () => {
  it('lays the children out along one line and scrolls that way', async () => {
    await render(<Strip />);

    expect(getComputedStyle(track()).gridAutoFlow).toBe('column');
    expect(scroller().scrollWidth).toBeGreaterThan(scroller().clientWidth);
  });

  it('stacks them into `lines` rows before starting a new column', async () => {
    await render(<Strip lines={2} />);

    // Two rows named in the template is the whole of what `lines` does, and it
    // is the thing a flex row cannot say — a wrapping row wraps at the box's
    // edge, and the box here is the one the strip is longer than.
    expect(getComputedStyle(track()).gridTemplateRows.split(' ')).toHaveLength(2);
  });

  it('draws no buttons while everything fits', async () => {
    await render(
      <MPScrollZone>
        <Item>Only</Item>
      </MPScrollZone>
    );

    // A row that does not overflow is not a scroller, and a control that cannot
    // do anything is worse than no control.
    await vi.waitFor(() => expect(buttons()).toHaveLength(0));
  });

  it('draws both once it does, with the one at the end `disabled`', async () => {
    const screen = await render(<Strip />);

    await settled();

    expect(buttons()).toHaveLength(2);
    // The lane an inline button sits in is paid for either way, so the one with
    // nowhere to go stays in it rather than leaving stray padding behind.
    expect(screen.getByRole('button', { name: 'Scroll back' }).element()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Scroll forward' }).element()).not.toBeDisabled();
  });

  it('draws them from the first paint when told to `always`', async () => {
    await render(
      <MPScrollZone buttons="always">
        <Item>Only</Item>
      </MPScrollZone>
    );

    // What a strip whose content arrives from a fetch wants: the buttons are not
    // appearing under the pointer half a second in.
    expect(buttons()).toHaveLength(2);
  });

  it('draws none at all when asked for none', async () => {
    await render(<Strip buttons="none" />);

    await vi.waitFor(() => expect(scroller().scrollWidth).toBeGreaterThan(300));
    expect(buttons()).toHaveLength(0);
  });

  it('removes an overlay button with nowhere to go rather than disabling it', async () => {
    const screen = await render(<Strip buttonPlacement="overlay" />);

    await settled();

    // An overlay button takes no room, so its absence costs nothing — which is
    // the opposite trade from the inline one above.
    expect(screen.getByRole('button', { name: 'Scroll forward' }).element()).toBeInTheDocument();
    expect(document.querySelector('[aria-label="Scroll back"]')).toBeNull();
  });

  it('moves to the next child when the forward button is pressed', async () => {
    const screen = await render(<Strip />);

    await settled();
    await screen.getByRole('button', { name: 'Scroll forward' }).click();

    // 208 is where the second child starts: 200 of item and the 8 of `gap`.
    // Measured rather than assumed — the children of a scroll zone are whatever
    // the caller put there, so no two of them are necessarily the same width.
    await vi.waitFor(() => expect(scroller().scrollLeft).toBe(208));
  });

  it('moves `step` children at a time', async () => {
    const screen = await render(<Strip step={2} />);

    await settled();
    await screen.getByRole('button', { name: 'Scroll forward' }).click();

    await vi.waitFor(() => expect(scroller().scrollLeft).toBe(416));
  });

  it('moves by everything in view in `page` mode', async () => {
    const screen = await render(<Strip mode="page" />);

    await settled();
    await screen.getByRole('button', { name: 'Scroll forward' }).click();

    // The box is 300 wide minus the two button lanes, so a page is whatever the
    // scroller's own width is rather than the component's.
    const page = scroller().clientWidth;

    await vi.waitFor(() => expect(scroller().scrollLeft).toBe(page));
  });

  it('runs down the page when it is vertical', async () => {
    await render(
      <MPScrollZone orientation="vertical" style={{ height: 120 }}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </MPScrollZone>
    );

    // A vertical strip only scrolls if something bounds it, and the thing a
    // caller sizes is the component rather than the box inside it.
    expect(getComputedStyle(track()).gridAutoFlow).toBe('row');
    await vi.waitFor(() =>
      expect(scroller().scrollHeight).toBeGreaterThan(scroller().clientHeight)
    );
  });

  it('is a focusable group with a name', async () => {
    const screen = await render(<Strip label="Categories" />);

    // A tab stop or a reader with no pointer cannot move the strip at all, and a
    // tab stop that announces nothing is worse than one that says what it is.
    await expect.element(screen.getByRole('group', { name: 'Categories' })).toBeInTheDocument();
    expect(scroller().tabIndex).toBe(0);
  });

  it('names itself when the caller did not', async () => {
    const screen = await render(<Strip />);

    await expect
      .element(screen.getByRole('group', { name: 'Scrollable content' }))
      .toBeInTheDocument();
  });

  it('hides the browser’s own scrollbar unless it is asked for', async () => {
    const screen = await render(<Strip />);

    expect(getComputedStyle(scroller()).scrollbarWidth).toBe('none');

    await screen.rerender(<Strip scrollbar />);

    expect(getComputedStyle(scroller()).scrollbarWidth).not.toBe('none');
  });

  it('snaps the children to the leading edge when asked', async () => {
    await render(<Strip snap />);

    expect(getComputedStyle(scroller()).scrollSnapType).toContain('mandatory');
    expect(getComputedStyle(track().children[0]).scrollSnapAlign).toBe('start');
  });

  it('lets a mouse drag the strip along', async () => {
    await render(<Strip />);

    await settled();

    const el = scroller();
    const from = el.getBoundingClientRect();
    const at = (x: number) =>
      new PointerEvent('pointermove', {
        pointerId: 1,
        clientX: x,
        clientY: from.top + 30,
        bubbles: true
      });

    el.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        button: 0,
        pointerType: 'mouse',
        clientX: from.left + 200,
        clientY: from.top + 30,
        bubbles: true
      })
    );
    // Two moves, because nothing is taken at the press itself: the first one
    // crosses the threshold that separates a drag from a click, and only after
    // that does the strip start following the pointer.
    el.dispatchEvent(at(from.left + 190));
    el.dispatchEvent(at(from.left + 120));

    expect(el.scrollLeft).toBe(80);
    expect(el.dataset.dragging).toBe('true');

    el.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }));

    expect(el.dataset.dragging).toBeUndefined();
  });

  it('leaves a press that never moved alone', async () => {
    // A press on this strip is far more often a click on a card inside it, so a
    // short one has to stay a click — able to select text and focus what it hit.
    const onClick = vi.fn();
    const screen = await render(
      <div style={{ width: 300 }}>
        <MPScrollZone>
          <button type="button" onClick={onClick} style={{ width: 200 }}>
            Card
          </button>
          <Item>Two</Item>
          <Item>Three</Item>
        </MPScrollZone>
      </div>
    );

    await settled();
    await screen.getByRole('button', { name: 'Card' }).click();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(scroller().scrollLeft).toBe(0);
  });

  it('travels for as long as a button is held', async () => {
    const screen = await render(<Strip mode="hold" speed={2000} />);

    await settled();

    const forward = screen.getByRole('button', { name: 'Scroll forward' }).element();

    forward.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, button: 0, bubbles: true })
    );

    // Long enough that the release is a hold rather than the tap below.
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(scroller().scrollLeft).toBeGreaterThan(0);

    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }));

    const stopped = scroller().scrollLeft;

    // The frame loop is torn down by the release rather than left running: what
    // it travelled up to the release is all it ever travels.
    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(scroller().scrollLeft).toBe(stopped);
  });

  it('answers a press too short to be a hold with one item', async () => {
    // A button that is dead to a quick tap is a broken button, and a tap that
    // scrolled three pixels is worse than one that did nothing.
    const screen = await render(<Strip mode="hold" speed={20} />);

    await settled();

    const forward = screen.getByRole('button', { name: 'Scroll forward' }).element();

    forward.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, button: 0, bubbles: true })
    );
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }));

    await vi.waitFor(() => expect(scroller().scrollLeft).toBeGreaterThanOrEqual(208));
  });

  it('leaves the wheel to the page unless it is asked for', async () => {
    await render(<Strip />);

    await settled();

    const stopped = scroller().dispatchEvent(
      new WheelEvent('wheel', { deltaY: 120, cancelable: true, bubbles: true })
    );

    // `dispatchEvent` returns false only when something called `preventDefault`,
    // which is the whole of the gesture: a wheel taken from the page is the
    // page's, and a reader who meant to scroll past the shelf is held by it.
    expect(stopped).toBe(true);
    expect(scroller().scrollLeft).toBe(0);
  });

  it('turns the wheel onto its own axis when it is', async () => {
    await render(<Strip wheel />);

    await settled();

    const stopped = scroller().dispatchEvent(
      new WheelEvent('wheel', { deltaY: 120, cancelable: true, bubbles: true })
    );

    expect(stopped).toBe(false);
    expect(scroller().scrollLeft).toBe(120);
  });

  it('gives the wheel back at the end of the strip', async () => {
    await render(<Strip wheel />);

    await settled();

    scroller().scrollLeft = scroller().scrollWidth;

    const stopped = scroller().dispatchEvent(
      new WheelEvent('wheel', { deltaY: 120, cancelable: true, bubbles: true })
    );

    // So a strip with nothing left ahead of it is something to scroll past
    // rather than something to be caught in.
    expect(stopped).toBe(true);
  });
});
