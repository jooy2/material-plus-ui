import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { useMPMediaQuery } from 'material-plus-ui';

/**
 * The queries are asserted through `matchMedia` rather than by resizing the
 * window, which cannot be resized from inside the page — and which is not the
 * weaker test it looks like, because `matchMedia` *is* what the hook claims to
 * report.
 */
const realMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = realMatchMedia;
});

function Probe({ query, onServer }: { query: string; onServer?: boolean }) {
  return <output data-testid="answer">{String(useMPMediaQuery(query, onServer))}</output>;
}

const read = (screen: { getByTestId: (id: string) => { element: () => Element } }) =>
  screen.getByTestId('answer').element().textContent;

describe('useMPMediaQuery', () => {
  it('reports what the browser says about a query', async () => {
    const screen = await render(<Probe query="(min-width: 1px)" />);

    expect(read(screen)).toBe('true');
  });

  it('reports false for one that does not match', async () => {
    const screen = await render(<Probe query="(min-width: 99999px)" />);

    expect(read(screen)).toBe('false');
  });

  it('follows the query when it changes', async () => {
    // A real `MediaQueryList` cannot be made to change from in here, so the
    // change is delivered the way the browser delivers it: through the listener
    // the hook registered.
    const listeners = new Set<() => void>();
    let matches = false;

    window.matchMedia = ((query: string) =>
      ({
        media: query,
        get matches() {
          return matches;
        },
        addEventListener: (_: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_: string, listener: () => void) => listeners.delete(listener)
      }) as unknown as MediaQueryList) as typeof window.matchMedia;

    const screen = await render(<Probe query="(pointer: coarse)" />);

    expect(read(screen)).toBe('false');

    matches = true;
    for (const listener of listeners) {
      listener();
    }

    await expect.element(screen.getByTestId('answer')).toHaveTextContent('true');
  });

  it('answers the caller’s own value where there is nothing to ask', async () => {
    // A browser with no `matchMedia` has no way to be asked, and a guess of the
    // library's is worse than the caller's.
    window.matchMedia = undefined as unknown as typeof window.matchMedia;

    const screen = await render(<Probe query="(pointer: coarse)" onServer />);

    expect(read(screen)).toBe('true');
  });

  it('defaults that answer to false rather than to matching', async () => {
    // A default of "matches" would have every server-rendered page claiming
    // every preference at once.
    window.matchMedia = undefined as unknown as typeof window.matchMedia;

    const screen = await render(<Probe query="(pointer: coarse)" />);

    expect(read(screen)).toBe('false');
  });

  it('unsubscribes when the component goes', async () => {
    const listeners = new Set<() => void>();

    window.matchMedia = ((query: string) =>
      ({
        media: query,
        matches: false,
        addEventListener: (_: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_: string, listener: () => void) => listeners.delete(listener)
      }) as unknown as MediaQueryList) as typeof window.matchMedia;

    const screen = await render(<Probe query="(pointer: fine)" />);

    expect(listeners.size).toBe(1);

    await screen.rerender(<div />);

    expect(listeners.size).toBe(0);
  });
});
