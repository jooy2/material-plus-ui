import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateLighting } from 'material-plus-ui';

describe('MPAnimateLighting', () => {
  /*
   * The light is behind the content, not on it.
   *
   * A pseudo-element at `z-index: -1` inside an isolated stacking context reads
   * as light escaping from under a sheet rather than as a border drawn around
   * one — which is what lets this go around a card or a button without touching
   * anything about how either is drawn.
   */
  it('draws the glow on a pseudo-element behind the content', async () => {
    const screen = await render(<MPAnimateLighting data-testid="glow">Live</MPAnimateLighting>);
    const element = screen.getByTestId('glow').element() as HTMLElement;
    const before = getComputedStyle(element, '::before');

    expect(element).toHaveClass('mp-anim-lighting');
    expect(getComputedStyle(element).isolation).toBe('isolate');
    expect(before.zIndex).toBe('-1');
    expect(before.animationName).toBe('mp-anim-lighting');
  });

  it('leaves the content untouched', async () => {
    // Nothing is overlaid and nothing is tinted: the root itself runs no
    // animation at all, only its pseudo-element does.
    const screen = await render(
      <MPAnimateLighting data-testid="glow">
        <span data-testid="content">Processing</span>
      </MPAnimateLighting>
    );
    const element = screen.getByTestId('glow').element() as HTMLElement;

    expect(getComputedStyle(element).animationName).toBe('none');
    expect(screen.getByTestId('content').element().textContent).toBe('Processing');
  });

  it('runs the revolution linearly, whatever else is asked for', async () => {
    // A loop with no beginning has nothing to decelerate into, so there is no
    // `easing` prop to get this wrong with.
    const screen = await render(<MPAnimateLighting data-testid="glow">Live</MPAnimateLighting>);
    const before = getComputedStyle(screen.getByTestId('glow').element(), '::before');

    expect(before.animationTimingFunction).toBe('linear');
    expect(before.animationIterationCount).toBe('infinite');
    expect(before.animationDuration).toBe('3s');
  });

  describe('color', () => {
    it('reads an accent family rather than a colour', async () => {
      const screen = await render(
        <MPAnimateLighting color="tertiary" data-testid="glow">
          Live
        </MPAnimateLighting>
      );
      const element = screen.getByTestId('glow').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-tertiary)');
    });
  });

  describe('size', () => {
    /*
     * The glow follows the wrapper's own corners, so the rung has to agree with
     * what is inside it — an `xl` card in an `md` Lighting shows light poking
     * out of four corners the card has already rounded away.
     */
    it('follows the corner ladder', async () => {
      const screen = await render(
        <MPAnimateLighting size="xl" data-testid="glow">
          Live
        </MPAnimateLighting>
      );
      const element = screen.getByTestId('glow').element() as HTMLElement;

      expect(element).toHaveClass('rounded-mp-xl');
      expect(element).toHaveAttribute('data-mp-size', 'xl');
    });
  });

  it('takes the shape of the light as slots', async () => {
    const screen = await render(
      <MPAnimateLighting spread={8} arc={120} blur={0} data-testid="glow">
        Live
      </MPAnimateLighting>
    );
    const element = screen.getByTestId('glow').element() as HTMLElement;

    expect(element.style.getPropertyValue('--_mp-anim-glow-width')).toBe('8px');
    expect(element.style.getPropertyValue('--_mp-anim-glow-arc')).toBe('120deg');
    expect(element.style.getPropertyValue('--_mp-anim-glow-blur')).toBe('0px');
  });

  it('runs the light the other way round', async () => {
    const screen = await render(
      <MPAnimateLighting reverse data-testid="glow">
        Live
      </MPAnimateLighting>
    );
    const before = getComputedStyle(screen.getByTestId('glow').element(), '::before');

    expect(before.animationDirection).toBe('reverse');
  });

  it('can be held still', async () => {
    const screen = await render(
      <MPAnimateLighting paused data-testid="glow">
        Live
      </MPAnimateLighting>
    );
    const element = screen.getByTestId('glow').element() as HTMLElement;

    expect(element).toHaveAttribute('data-mp-state', 'paused');
    expect(getComputedStyle(element, '::before').animationPlayState).toBe('paused');
  });
});
