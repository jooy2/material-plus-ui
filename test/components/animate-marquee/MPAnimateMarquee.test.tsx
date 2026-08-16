import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateMarquee } from 'material-plus-ui';

describe('MPAnimateMarquee', () => {
  /*
   * Two copies, each travelling exactly its own length plus the gap.
   *
   * When the first copy has left, the second is standing precisely where it
   * began — so there is no seam and no frame where the strip is empty, and none
   * of it depends on measuring anything: a percentage `translate` resolves
   * against the element's own box.
   */
  it('lays the content down twice', async () => {
    const screen = await render(
      <MPAnimateMarquee data-testid="marquee">
        <span>Logo</span>
      </MPAnimateMarquee>
    );
    const element = screen.getByTestId('marquee').element() as HTMLElement;

    expect(element.children).toHaveLength(2);
    expect(element.children[0]).toHaveClass('mp-marquee-track');
    expect(getComputedStyle(element.children[0]).animationName).toBe('mp-anim-marquee-x');
  });

  it('reads out only the first copy', async () => {
    // Otherwise a screen reader announces everything on the strip as many times
    // as it was laid down.
    const screen = await render(
      <MPAnimateMarquee copies={3} data-testid="marquee">
        <span>Logo</span>
      </MPAnimateMarquee>
    );
    const element = screen.getByTestId('marquee').element() as HTMLElement;

    expect(element.children).toHaveLength(3);
    expect(element.children[0].hasAttribute('aria-hidden')).toBe(false);
    expect(element.children[1]).toHaveAttribute('aria-hidden', 'true');
    expect(element.children[2]).toHaveAttribute('aria-hidden', 'true');
  });

  describe('speed', () => {
    /*
     * A speed, not a duration.
     *
     * A duration would mean a strip of four logos and a strip of forty crossing
     * the same box in the same time, with the long one becoming a blur.
     */
    it('turns the measured length into a duration', async () => {
      const screen = await render(
        <MPAnimateMarquee speed={100} gap={0} data-testid="marquee">
          <div style={{ width: 500 }}>Wide</div>
        </MPAnimateMarquee>
      );
      const element = screen.getByTestId('marquee').element() as HTMLElement;

      // 500px at 100px/s is five seconds. The measurement lands in an effect,
      // so wait for the slot rather than reading the first render.
      await expect.poll(() => element.style.getPropertyValue('--_mp-anim-duration')).toBe('5000ms');
    });

    it('lets an explicit duration win over the measurement', async () => {
      const screen = await render(
        <MPAnimateMarquee duration={2000} data-testid="marquee">
          <div style={{ width: 500 }}>Wide</div>
        </MPAnimateMarquee>
      );
      const element = screen.getByTestId('marquee').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-duration')).toBe('2000ms');
    });
  });

  it('runs down the page when it is vertical', async () => {
    const screen = await render(
      <MPAnimateMarquee orientation="vertical" data-testid="marquee">
        <span>Item</span>
      </MPAnimateMarquee>
    );
    const element = screen.getByTestId('marquee').element() as HTMLElement;

    expect(element).toHaveClass('mp-marquee-vertical');
    expect(getComputedStyle(element.children[0]).animationName).toBe('mp-anim-marquee-y');
  });

  it('runs the other way round', async () => {
    const screen = await render(
      <MPAnimateMarquee reverse data-testid="marquee">
        <span>Item</span>
      </MPAnimateMarquee>
    );
    const element = screen.getByTestId('marquee').element() as HTMLElement;

    expect(getComputedStyle(element.children[0]).animationDirection).toBe('reverse');
  });

  describe('pauseOnHover', () => {
    it('is on by default', async () => {
      // Not decoration: content moving past a pointer cannot be clicked
      // reliably, and a link in a marquee that never stops is unfollowable.
      const screen = await render(
        <MPAnimateMarquee data-testid="marquee">
          <a href="#somewhere">A link</a>
        </MPAnimateMarquee>
      );

      expect(screen.getByTestId('marquee').element()).toHaveAttribute('data-mp-pause-on-hover');
    });

    it('can be turned off', async () => {
      const screen = await render(
        <MPAnimateMarquee pauseOnHover={false} data-testid="marquee">
          <span>Item</span>
        </MPAnimateMarquee>
      );

      expect(screen.getByTestId('marquee').element()).not.toHaveAttribute('data-mp-pause-on-hover');
    });
  });

  it('runs linearly, because a loop has no ends to ease into', async () => {
    const screen = await render(
      <MPAnimateMarquee data-testid="marquee">
        <span>Item</span>
      </MPAnimateMarquee>
    );
    const element = screen.getByTestId('marquee').element() as HTMLElement;

    expect(getComputedStyle(element.children[0]).animationTimingFunction).toBe('linear');
  });
});
