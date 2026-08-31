import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateFade, useMPReducedMotion } from 'material-plus-ui';

const REDUCE = '(prefers-reduced-motion: reduce)';

function Probe() {
  return <output data-testid="motion">{String(useMPReducedMotion())}</output>;
}

describe('useMPReducedMotion', () => {
  it('answers what the media query answers', async () => {
    const screen = await render(<Probe />);

    expect(screen.getByTestId('motion').element().textContent).toBe(
      String(window.matchMedia(REDUCE).matches)
    );
  });

  it('answers the same thing the components are already acting on', async () => {
    // The reason it is exported at all: an application's own motion and the
    // library's should not be able to disagree about the reader's preference.
    const screen = await render(
      <>
        <Probe />
        <MPAnimateFade>
          <span>faded</span>
        </MPAnimateFade>
      </>
    );

    const still = screen.getByTestId('motion').element().textContent === 'true';
    // `data-mp-animation` rather than a class, for the reason `internal/animate.ts`
    // gives: a test that asserts on a class name breaks when the class changes.
    const animated = screen.container.querySelector('[data-mp-animation="fade"]');

    expect(animated).not.toBeNull();
    expect(still).toBe(window.matchMedia(REDUCE).matches);
    // A reader who asked for less motion is handed the end state rather than a
    // running animation, and the hook reports the same preference the component
    // just acted on.
    expect(getComputedStyle(animated as Element).animationName === 'none').toBe(still);
  });

  it('is a boolean and never a query object', async () => {
    const screen = await render(<Probe />);

    expect(['true', 'false']).toContain(screen.getByTestId('motion').element().textContent);
  });
});
