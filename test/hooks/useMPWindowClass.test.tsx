import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { useMPWindowClass } from 'material-plus-ui';
import type { MPWindowClass } from 'material-plus-ui';

/**
 * The window cannot be resized from inside the page, so the boundaries are
 * asserted through `matchMedia` rather than by dragging one. That is not the
 * weaker test it looks like — it *is* the claim: the hook says it reports
 * whichever class the stylesheet is in, and the queries are what the stylesheet
 * is made of.
 */
const MIN: Record<MPWindowClass, number> = {
  compact: 0,
  medium: 600,
  expanded: 840,
  large: 1200,
  'extra-large': 1600
};

const LADDER: MPWindowClass[] = ['compact', 'medium', 'expanded', 'large', 'extra-large'];

function Probe({ onServer }: { onServer?: MPWindowClass }) {
  return <output data-testid="class">{useMPWindowClass(onServer)}</output>;
}

function reported(screen: { getByTestId: (id: string) => { element: () => Element } }) {
  return screen.getByTestId('class').element().textContent as MPWindowClass;
}

const realMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = realMatchMedia;
});

describe('useMPWindowClass', () => {
  it('reports one of the five and nothing else', async () => {
    const screen = await render(<Probe />);

    expect(LADDER).toContain(reported(screen));
  });

  it('lands on the widest class this window is at least as wide as', async () => {
    // Both halves, which is what makes it a boundary test at whatever width the
    // suite happens to run at: the reported class matches, and the one above it
    // does not.
    const screen = await render(<Probe />);
    const size = reported(screen);
    const above = LADDER[LADDER.indexOf(size) + 1];

    expect(window.matchMedia(`(min-width: ${MIN[size]}px)`).matches).toBe(true);

    if (above) {
      expect(window.matchMedia(`(min-width: ${MIN[above]}px)`).matches).toBe(false);
    }
  });

  it('reads the query rather than `innerWidth`', async () => {
    // A classic scrollbar is counted by `innerWidth` and not by a media query,
    // so the two part company at exactly one width per boundary. The assertion
    // is that the hook is on the stylesheet's side of that.
    const screen = await render(<Probe />);

    expect(window.matchMedia(`(min-width: ${MIN[reported(screen)]}px)`).matches).toBe(true);
  });

  describe('where the window cannot be measured', () => {
    it('answers `expanded` by default', async () => {
      // The same branch a server takes. `queryLists` returns nothing without
      // `matchMedia` and caches nothing in that case, so taking it away is
      // enough to stand in for the environment that never had it.
      (window as { matchMedia?: unknown }).matchMedia = undefined;

      const screen = await render(<Probe />);

      expect(reported(screen)).toBe('expanded');
    });

    it('answers whatever the application said instead', async () => {
      // The argument exists because an application usually knows better than
      // the library which way its own first paint should guess.
      (window as { matchMedia?: unknown }).matchMedia = undefined;

      const screen = await render(<Probe onServer="compact" />);

      expect(reported(screen)).toBe('compact');
    });

    it('does not leak that guess into a window that can be measured', async () => {
      const screen = await render(<Probe onServer="compact" />);

      expect(window.matchMedia(`(min-width: ${MIN[reported(screen)]}px)`).matches).toBe(true);
    });
  });
});
