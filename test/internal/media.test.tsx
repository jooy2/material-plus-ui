import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateTyping } from 'material-plus-ui';

/**
 * One `MediaQueryList` per query, however many components ask.
 *
 * The stores read the list in `getSnapshot`, which React calls on every render
 * of every subscriber; asked fresh each time, a page of animated text built a
 * reduced-motion list per component per render.
 */
describe('asking a media query', () => {
  it('builds at most one list for a query, however many components read it', async () => {
    const built = vi.spyOn(window, 'matchMedia');

    await render(
      <>
        {Array.from({ length: 12 }, (_, index) => (
          <MPAnimateTyping key={index} text={`line ${index}`} />
        ))}
      </>
    );

    const reduced = built.mock.calls.filter(([query]) => query.includes('prefers-reduced-motion'));

    expect(reduced.length).toBeLessThanOrEqual(1);
    built.mockRestore();
  });
});
