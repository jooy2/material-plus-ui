import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { translation } from '../../support/style';
import { MPAnimateFloat } from 'material-plus-ui';

describe('MPAnimateFloat', () => {
  it('runs its own keyframe, which is not one of the shared entrances', async () => {
    const screen = await render(<MPAnimateFloat data-testid="float">Adrift</MPAnimateFloat>);
    const element = screen.getByTestId('float').element() as HTMLElement;
    const styles = getComputedStyle(element);

    expect(styles.animationName).toBe('mp-anim-float');
    expect(element).toHaveAttribute('data-mp-animation', 'float');
  });

  it('drifts for ever, because a drift has no destination to arrive at', async () => {
    const screen = await render(<MPAnimateFloat data-testid="float">Adrift</MPAnimateFloat>);
    const styles = getComputedStyle(screen.getByTestId('float').element() as HTMLElement);

    expect(styles.animationIterationCount).toBe('infinite');
    // Six seconds, and not a Material token: the motion ladder runs to a second
    // and is for things that arrive.
    expect(styles.animationDuration).toBe('6s');
  });

  it('comes back through nothing, so an interrupted drift leaves nothing displaced', async () => {
    const screen = await render(
      <MPAnimateFloat trigger="manual" data-testid="float">
        Adrift
      </MPAnimateFloat>
    );
    const element = screen.getByTestId('float').element() as HTMLElement;

    // Held on its own first frame, which the keyframe puts at the origin.
    expect(getComputedStyle(element).animationPlayState).toBe('paused');
    expect(translation(element)).toEqual({ x: 0, y: 0 });
  });

  it('takes its travel as pixels or as a length', async () => {
    const pixels = await render(
      <MPAnimateFloat distance={20} sway={8} data-testid="float">
        Adrift
      </MPAnimateFloat>
    );
    const element = pixels.getByTestId('float').element() as HTMLElement;

    expect(element.style.getPropertyValue('--_mp-anim-y')).toBe('20px');
    expect(element.style.getPropertyValue('--_mp-anim-x')).toBe('8px');

    const length = await render(
      <MPAnimateFloat distance="2rem" data-testid="float2">
        Adrift
      </MPAnimateFloat>
    );

    expect(
      (length.getByTestId('float2').element() as HTMLElement).style.getPropertyValue('--_mp-anim-y')
    ).toBe('2rem');
  });

  it('does not lean unless it was asked to', async () => {
    const screen = await render(<MPAnimateFloat data-testid="float">Adrift</MPAnimateFloat>);
    const element = screen.getByTestId('float').element() as HTMLElement;

    expect(element.style.getPropertyValue('--_mp-anim-angle')).toBe('0deg');
  });

  it('spreads across the children when asked, like the rest of them', async () => {
    const screen = await render(
      <MPAnimateFloat stagger={200} data-testid="float">
        <span data-testid="one">One</span>
        <span data-testid="two">Two</span>
      </MPAnimateFloat>
    );
    const box = screen.getByTestId('float').element() as HTMLElement;
    const two = screen.getByTestId('two').element() as HTMLElement;

    expect(getComputedStyle(box).animationName).toBe('none');
    expect(getComputedStyle(two).animationName).toBe('mp-anim-float');
    expect(getComputedStyle(two).animationDelay).toBe('0.2s');
  });
});
