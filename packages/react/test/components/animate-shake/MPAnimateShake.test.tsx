import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { translation } from '../../support/style';
import { MPAnimateShake } from 'material-plus-ui';

describe('MPAnimateShake', () => {
  it('runs its own keyframe, which is not one of the shared entrances', async () => {
    const screen = await render(<MPAnimateShake data-testid="shake">Wrong</MPAnimateShake>);
    const element = screen.getByTestId('shake').element() as HTMLElement;

    expect(getComputedStyle(element).animationName).toBe('mp-anim-shake');
    expect(element).toHaveAttribute('data-mp-animation', 'shake');
  });

  /*
   * The rule that keeps it from becoming decoration. A shake that runs when the
   * page loads is decoration, and readers learn to ignore moving decoration —
   * which costs the effect the meaning it is here for.
   */
  it('does nothing on mount, because nothing has been refused yet', async () => {
    const screen = await render(<MPAnimateShake data-testid="shake">Wrong</MPAnimateShake>);
    const element = screen.getByTestId('shake').element() as HTMLElement;

    expect(element).toHaveAttribute('data-mp-state', 'paused');
    expect(getComputedStyle(element).animationPlayState).toBe('paused');
  });

  it('answers when `play` goes up', async () => {
    const screen = await render(
      <MPAnimateShake play data-testid="shake">
        Wrong
      </MPAnimateShake>
    );

    await expect.element(screen.getByTestId('shake')).toHaveAttribute('data-mp-state', 'running');
  });

  it('says it once', async () => {
    const screen = await render(
      <MPAnimateShake play data-testid="shake">
        Wrong
      </MPAnimateShake>
    );
    const styles = getComputedStyle(screen.getByTestId('shake').element() as HTMLElement);

    expect(styles.animationIterationCount).toBe('1');
    expect(styles.animationDuration).toBe('0.4s');
  });

  it('starts and ends at home, so an interrupted shake leaves nothing displaced', async () => {
    const screen = await render(<MPAnimateShake data-testid="shake">Wrong</MPAnimateShake>);
    const element = screen.getByTestId('shake').element() as HTMLElement;

    // Paused on its own first frame, which the keyframe puts at the origin —
    // and `fill-mode: both` holds the last frame, which is the same place.
    expect(translation(element)).toEqual({ x: 0, y: 0 });
  });

  it('takes its travel as pixels or as a length', async () => {
    const screen = await render(
      <MPAnimateShake distance={12} data-testid="shake">
        Wrong
      </MPAnimateShake>
    );
    const element = screen.getByTestId('shake').element() as HTMLElement;

    expect(element.style.getPropertyValue('--_mp-anim-x')).toBe('12px');
  });
});
