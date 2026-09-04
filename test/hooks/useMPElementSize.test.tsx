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
    const settled = read(screen, 'renders');

    // The same width said again. A hook that set state on every observer
    // callback would re-render here.
    await screen.rerender(<Probe width={320} />);

    expect(read(screen, 'renders')).toBe(settled + 1);
  });
});
