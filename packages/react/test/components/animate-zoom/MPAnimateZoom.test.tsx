import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateZoom } from 'material-plus-ui';
import { transformOrigin } from '../../support/style';

describe('MPAnimateZoom', () => {
  it('shares the scale keyframe with a grow', async () => {
    // One keyframe for both: they are the same arithmetic at two strengths, and
    // a second identical `@keyframes` would be a second place to fix a bug.
    const screen = await render(<MPAnimateZoom data-testid="zoom">Landed</MPAnimateZoom>);
    const element = screen.getByTestId('zoom').element() as HTMLElement;

    expect(getComputedStyle(element).animationName).toBe('mp-anim-scale');
    expect(element).toHaveAttribute('data-mp-animation', 'zoom');
  });

  it('starts at less than half, where a grow starts near its final size', async () => {
    const screen = await render(<MPAnimateZoom data-testid="zoom">Landed</MPAnimateZoom>);
    const element = screen.getByTestId('zoom').element() as HTMLElement;

    expect(element.style.getPropertyValue('--_mp-anim-scale')).toBe('0.4');
  });

  it('can arrive oversized and settle back', async () => {
    const screen = await render(
      <MPAnimateZoom from={1.4} data-testid="zoom">
        Coming forward
      </MPAnimateZoom>
    );
    const element = screen.getByTestId('zoom').element() as HTMLElement;

    expect(element.style.getPropertyValue('--_mp-anim-scale')).toBe('1.4');
  });

  /*
   * The origin is written out rather than left to the sheet.
   *
   * A zoom is always about the middle — that is the whole of what separates it
   * from a grow — so a `transform-origin` inherited from a caller's own rule
   * must not be able to quietly turn one into the other.
   */
  it('is always about the middle', async () => {
    const screen = await render(<MPAnimateZoom data-testid="zoom">Landed</MPAnimateZoom>);
    const element = screen.getByTestId('zoom').element() as HTMLElement;

    expect(transformOrigin(element)).toBe('center center');
  });

  it('takes `medium4` arriving and `short4` leaving', async () => {
    const arriving = await render(<MPAnimateZoom data-testid="in">In</MPAnimateZoom>);

    expect(getComputedStyle(arriving.getByTestId('in').element()).animationDuration).toBe('0.4s');

    const leaving = await render(
      <MPAnimateZoom mode="out" data-testid="out">
        Out
      </MPAnimateZoom>
    );
    const element = leaving.getByTestId('out').element() as HTMLElement;

    expect(getComputedStyle(element).animationDuration).toBe('0.2s');
    expect(getComputedStyle(element).animationDirection).toBe('reverse');
  });

  it('holds full opacity when the fade is off', async () => {
    const screen = await render(
      <MPAnimateZoom fade={false} data-testid="zoom">
        Landed
      </MPAnimateZoom>
    );
    const element = screen.getByTestId('zoom').element() as HTMLElement;

    expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('1');
  });

  it('renders something other than a `div`', async () => {
    const screen = await render(
      <MPAnimateZoom render={<section />} data-testid="zoom">
        Landed
      </MPAnimateZoom>
    );

    expect(screen.getByTestId('zoom').element().tagName).toBe('SECTION');
  });
});
