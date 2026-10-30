import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateGrow } from 'material-plus-ui';
import { transformOrigin } from '../../support/style';

describe('MPAnimateGrow', () => {
  it('runs the scale keyframe', async () => {
    const screen = await render(<MPAnimateGrow data-testid="grow">Unfolding</MPAnimateGrow>);
    const element = screen.getByTestId('grow').element() as HTMLElement;

    expect(getComputedStyle(element).animationName).toBe('mp-anim-scale');
    expect(element).toHaveAttribute('data-mp-animation', 'grow');
  });

  it('takes `medium4` arriving and `short4` leaving', async () => {
    const arriving = await render(<MPAnimateGrow data-testid="in">In</MPAnimateGrow>);

    expect(getComputedStyle(arriving.getByTestId('in').element()).animationDuration).toBe('0.4s');

    const leaving = await render(
      <MPAnimateGrow mode="out" data-testid="out">
        Out
      </MPAnimateGrow>
    );

    expect(getComputedStyle(leaving.getByTestId('out').element()).animationDuration).toBe('0.2s');
  });

  describe('from', () => {
    it('starts close to its final size', async () => {
      // Close, so the content inside is legible for most of the animation.
      // That is the whole difference between a grow and a zoom.
      const screen = await render(<MPAnimateGrow data-testid="grow">Unfolding</MPAnimateGrow>);
      const element = screen.getByTestId('grow').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-scale')).toBe('0.8');
    });

    it('can settle down onto the page from above `1`', async () => {
      const screen = await render(
        <MPAnimateGrow from={1.15} data-testid="grow">
          Settling
        </MPAnimateGrow>
      );
      const element = screen.getByTestId('grow').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-scale')).toBe('1.15');
    });
  });

  describe('origin', () => {
    /*
     * `transform-origin` governs the standalone `scale` property too.
     *
     * Which is what lets the effect stay off the `transform` shorthand
     * entirely, so a caller's own transform on the same element survives it.
     */
    it('anchors the unfold to a point', async () => {
      const screen = await render(
        <MPAnimateGrow origin="top left" data-testid="grow">
          Out of a corner
        </MPAnimateGrow>
      );
      const element = screen.getByTestId('grow').element() as HTMLElement;

      // Read back in the browser's own normalised spelling, which reorders the
      // pair — and, in Firefox, also names the depth. See `transformOrigin`.
      expect(transformOrigin(element)).toBe('left top');
    });

    it('is the middle by default', async () => {
      const screen = await render(<MPAnimateGrow data-testid="grow">Unfolding</MPAnimateGrow>);
      const element = screen.getByTestId('grow').element() as HTMLElement;

      expect(transformOrigin(element)).toBe('center center');
    });

    it('lets a caller’s own `style` win over it', async () => {
      const screen = await render(
        <MPAnimateGrow origin="top" style={{ transformOrigin: 'bottom' }} data-testid="grow">
          Unfolding
        </MPAnimateGrow>
      );
      const element = screen.getByTestId('grow').element() as HTMLElement;

      expect(transformOrigin(element)).toBe('center bottom');
    });
  });

  describe('fade', () => {
    it('fades in as it grows', async () => {
      const screen = await render(<MPAnimateGrow data-testid="grow">Unfolding</MPAnimateGrow>);
      const element = screen.getByTestId('grow').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('0');
    });

    it('holds full opacity for something only changing size', async () => {
      const screen = await render(
        <MPAnimateGrow fade={false} data-testid="grow">
          Resizing
        </MPAnimateGrow>
      );
      const element = screen.getByTestId('grow').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('1');
    });
  });

  it('renders something other than a `div`', async () => {
    const screen = await render(
      <MPAnimateGrow render={<section />} data-testid="grow">
        Unfolding
      </MPAnimateGrow>
    );

    expect(screen.getByTestId('grow').element().tagName).toBe('SECTION');
  });
});
