import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateReveal } from 'material-plus-ui';

describe('MPAnimateReveal', () => {
  it('runs the reveal keyframe on the element itself', async () => {
    const screen = await render(<MPAnimateReveal data-testid="reveal">Title</MPAnimateReveal>);
    const element = screen.getByTestId('reveal').element() as HTMLElement;
    const styles = getComputedStyle(element);

    expect(styles.animationName).toBe('mp-anim-reveal');
    expect(styles.animationFillMode).toBe('both');
  });

  /*
   * The claim the component is for: an entrance that leaves the box exactly
   * where it is. Everything else in the set either scales its content or
   * travels it, and for a title, a rule or a chart's plot area the position is
   * part of what is being said.
   */
  it('leaves the element where it is and the colour where it is', async () => {
    const screen = await render(
      <MPAnimateReveal trigger="manual" data-testid="reveal">
        Title
      </MPAnimateReveal>
    );
    const element = screen.getByTestId('reveal').element() as HTMLElement;
    const styles = getComputedStyle(element);

    // Held on its own first frame, which is where a wipe is at its most
    // clipped. Nothing has been translated, scaled or faded even there.
    expect(styles.animationPlayState).toBe('paused');
    expect(styles.translate).toBe('none');
    expect(styles.scale).toBe('none');
    expect(styles.opacity).toBe('1');
    // The one thing that *is* different on the first frame. Read loosely
    // because the engines re-serialise an `inset()` differently — Chromium
    // drops a fourth value equal to the second and writes `0` as `0px` — and
    // the claim is that the box is clipped, not how the string came back.
    expect(styles.clipPath).toContain('100%');
  });

  describe('from', () => {
    /*
     * The edge the wipe opens at, not the direction it travels. A caller is
     * pointing at a place, which is the same choice `MPAnimateSlide` makes.
     */
    const SIDES = [
      ['left', 'inset(0 100% 0 0)'],
      ['right', 'inset(0 0 0 100%)'],
      ['top', 'inset(0 0 100% 0)'],
      ['bottom', 'inset(100% 0 0 0)']
    ] as const;

    /*
     * The slot rather than the computed value, because a computed `inset()` is
     * re-serialised by the engine — Chromium writes `0` as `0px` and drops a
     * fourth value equal to the second, and the three engines need not agree
     * about either. What the component is responsible for is the value it
     * writes; that the keyframe reads it is asserted once, above.
     */
    for (const [side, clip] of SIDES) {
      it(`opens at the ${side}`, async () => {
        const screen = await render(
          <MPAnimateReveal from={side} data-testid="reveal">
            Title
          </MPAnimateReveal>
        );
        const element = screen.getByTestId('reveal').element() as HTMLElement;

        expect(element.style.getPropertyValue('--_mp-anim-clip')).toBe(clip);
      });
    }

    it('opens at the left when nobody said', async () => {
      const screen = await render(<MPAnimateReveal data-testid="reveal">Title</MPAnimateReveal>);
      const element = screen.getByTestId('reveal').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-clip')).toBe('inset(0 100% 0 0)');
    });

    it('is a real clip at the top of the wipe, whichever edge it opens at', async () => {
      const screen = await render(
        <MPAnimateReveal from="bottom" trigger="manual" data-testid="reveal">
          Title
        </MPAnimateReveal>
      );
      const element = screen.getByTestId('reveal').element() as HTMLElement;

      expect(getComputedStyle(element).clipPath).toContain('100%');
    });
  });

  describe('fade', () => {
    it('does not fade, because a reveal is not a fade', async () => {
      const screen = await render(<MPAnimateReveal data-testid="reveal">Title</MPAnimateReveal>);
      const element = screen.getByTestId('reveal').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('1');
    });

    it('will, for a caller who asked for both', async () => {
      const screen = await render(
        <MPAnimateReveal fade data-testid="reveal">
          Title
        </MPAnimateReveal>
      );
      const element = screen.getByTestId('reveal').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('0');
    });
  });

  describe('mode', () => {
    it('covers again by reversing the wipe rather than by a keyframe of its own', async () => {
      const screen = await render(
        <MPAnimateReveal mode="out" data-testid="reveal">
          Title
        </MPAnimateReveal>
      );
      const styles = getComputedStyle(screen.getByTestId('reveal').element() as HTMLElement);

      expect(styles.animationName).toBe('mp-anim-reveal');
      expect(styles.animationDirection).toBe('reverse');
      // MD3's asymmetry, the same one every other effect here carries.
      expect(styles.animationDuration).toBe('0.2s');
    });
  });

  it('takes the effect’s Material duration token when nobody said', async () => {
    const screen = await render(<MPAnimateReveal data-testid="reveal">Title</MPAnimateReveal>);
    const element = screen.getByTestId('reveal').element() as HTMLElement;

    expect(element.style.getPropertyValue('--_mp-anim-duration')).toBe(
      'var(--mp-sys-motion-duration-medium4)'
    );
  });

  it('adds no element to the layout, which is the argument against a wrapper', async () => {
    const screen = await render(
      <MPAnimateReveal data-testid="reveal">
        <span data-testid="inner">Title</span>
      </MPAnimateReveal>
    );
    const element = screen.getByTestId('reveal').element() as HTMLElement;
    const inner = screen.getByTestId('inner').element() as HTMLElement;

    expect(inner.parentElement).toBe(element);
  });

  it('renders something other than a `div`', async () => {
    const screen = await render(
      <MPAnimateReveal render={<h2 />} data-testid="reveal">
        Title
      </MPAnimateReveal>
    );

    expect(screen.getByTestId('reveal').element().tagName).toBe('H2');
  });

  it('keeps the caller’s own class and style', async () => {
    const screen = await render(
      <MPAnimateReveal className="custom" style={{ color: 'rgb(1, 2, 3)' }} data-testid="reveal">
        Title
      </MPAnimateReveal>
    );
    const element = screen.getByTestId('reveal').element() as HTMLElement;

    expect(element).toHaveClass('custom');
    expect(element).toHaveClass('mp-anim');
    expect(element.style.color).toBe('rgb(1, 2, 3)');
  });
});
