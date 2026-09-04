import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { useMPOnScreen } from 'material-plus-ui';
import * as React from 'react';

/**
 * A real `IntersectionObserver` against the real viewport, which is what the
 * hook is: an element pushed below the fold is not intersecting, and one
 * scrolled to is.
 */
function Probe({ offset, once }: { offset: number; once?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const seen = useMPOnScreen(ref, { once, threshold: 0.2 });

  return (
    <div style={{ height: '300vh' }}>
      <div ref={ref} style={{ marginTop: offset, height: 80, background: 'currentColor' }} />
      <output data-testid="seen" style={{ position: 'fixed', top: 0, left: 0 }}>
        {String(seen)}
      </output>
    </div>
  );
}

const read = (screen: { getByTestId: (id: string) => { element: () => Element } }) =>
  screen.getByTestId('seen').element().textContent;

describe('useMPOnScreen', () => {
  it('reports an element that is on screen', async () => {
    const screen = await render(<Probe offset={0} />);

    await expect.element(screen.getByTestId('seen')).toHaveTextContent('true');
  });

  it('does not report one below the fold', async () => {
    const screen = await render(<Probe offset={2000} />);

    // The observer's first callback fires on its own, so a `false` here has to
    // survive it rather than merely precede it.
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    expect(read(screen)).toBe('false');
  });

  it('reports it once it is scrolled to', async () => {
    const screen = await render(<Probe offset={2000} />);

    window.scrollTo(0, 2000);

    await expect.element(screen.getByTestId('seen')).toHaveTextContent('true');

    window.scrollTo(0, 0);
  });

  it('stays true after it scrolls away, by default', async () => {
    // Most reasons to ask are one-way: something loads, or is marked read, and
    // does not unload when it scrolls off.
    const screen = await render(<Probe offset={2000} />);

    window.scrollTo(0, 2000);
    await expect.element(screen.getByTestId('seen')).toHaveTextContent('true');

    window.scrollTo(0, 0);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    expect(read(screen)).toBe('true');

    window.scrollTo(0, 0);
  });

  it('goes back to false with `once` off', async () => {
    const screen = await render(<Probe offset={2000} once={false} />);

    window.scrollTo(0, 2000);
    await expect.element(screen.getByTestId('seen')).toHaveTextContent('true');

    window.scrollTo(0, 0);
    await expect.element(screen.getByTestId('seen')).toHaveTextContent('false');
  });
});
