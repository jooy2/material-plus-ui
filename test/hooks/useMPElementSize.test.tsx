import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { useMPElementSize } from 'material-plus-ui';
import * as React from 'react';

/**
 * A real element in a real browser, resized for real.
 *
 * The hook's whole claim is about layout the browser performed — the border box
 * rather than the content box, and a re-render only when a rounded number
 * changed — so there is nothing here worth asserting against a mock.
 */
function Probe({ width, padded = false }: { width: number; padded?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const size = useMPElementSize(ref);
  const renders = React.useRef(0);

  renders.current += 1;

  return (
    <div>
      <div
        ref={ref}
        data-testid="box"
        style={{
          width,
          height: 40,
          boxSizing: 'border-box',
          padding: padded ? 16 : 0,
          border: padded ? '2px solid' : 'none'
        }}
      />
      <output data-testid="width">{size.width}</output>
      <output data-testid="height">{size.height}</output>
      <output data-testid="renders">{renders.current}</output>
    </div>
  );
}

const read = (screen: { getByTestId: (id: string) => { element: () => Element } }, id: string) =>
  Number(screen.getByTestId(id).element().textContent);

/**
 * The render count once the observer has stopped firing.
 *
 * A `ResizeObserver` may deliver more than once as a page settles, and how many
 * times is the engine's business — Firefox and WebKit deliver an extra callback
 * on some runners where Chromium does not. Reading the count before it has
 * settled is what made the assertion below depend on which browser ran it.
 */
async function settledRenders(screen: {
  getByTestId: (id: string) => { element: () => Element };
}): Promise<number> {
  let last = -1;
  let same = 0;

  while (same < 3) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    const now = read(screen, 'renders');

    same = now === last ? same + 1 : 0;
    last = now;
  }

  return last;
}

describe('useMPElementSize', () => {
  it('measures the element it was pointed at', async () => {
    const screen = await render(<Probe width={320} />);

    await expect.element(screen.getByTestId('width')).toHaveTextContent('320');
    expect(read(screen, 'height')).toBe(40);
  });

  it('follows a resize', async () => {
    const screen = await render(<Probe width={320} />);

    await expect.element(screen.getByTestId('width')).toHaveTextContent('320');

    await screen.rerender(<Probe width={200} />);

    await expect.element(screen.getByTestId('width')).toHaveTextContent('200');
  });

  it('reports the border box rather than the content box', async () => {
    // `contentRect` on the observer entry would answer 284 here — the width less
    // the padding and the border — and a caller comparing a measurement against
    // a breakpoint means the box the element occupies.
    const screen = await render(<Probe width={320} padded />);

    await expect.element(screen.getByTestId('width')).toHaveTextContent('320');
  });

  it('is zero before it has an element to measure', async () => {
    // A ref is filled in during the commit, so the first render has nothing.
    // Branch on a threshold rather than on the number, or a chart mounts twice.
    function First() {
      const ref = React.useRef<HTMLDivElement>(null);
      const size = useMPElementSize(ref);
      const firstAnswer = React.useRef(size.width);

      return (
        <div ref={ref} style={{ width: 200 }}>
          <output data-testid="first">{firstAnswer.current}</output>
        </div>
      );
    }

    const screen = await render(<First />);

    expect(screen.getByTestId('first').element().textContent).toBe('0');
  });

  it('does not re-render when the rounded size has not moved', async () => {
    const screen = await render(<Probe width={320} />);

    await expect.element(screen.getByTestId('width')).toHaveTextContent('320');

    const settled = await settledRenders(screen);
    const box = screen.getByTestId('box').element() as HTMLElement;

    /*
     * A real resize the observer will report, to a width that rounds to the one
     * already held. A hook that set state on every callback would re-render
     * here; this one compares the rounded numbers and returns the state it was
     * given, so React has nothing to do.
     *
     * The count is asserted not to move, rather than to move by exactly one.
     * How many renders a *rerender* costs is React's bookkeeping and it is not
     * one on every version — the claim being made here is only that the
     * observer firing is not itself a render.
     */
    box.style.width = '320.4px';

    expect(await settledRenders(screen)).toBe(settled);
    await expect.element(screen.getByTestId('width')).toHaveTextContent('320');
  });
});
