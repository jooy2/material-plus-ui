import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateFade } from 'material-plus-ui';

describe('MPAnimateFade', () => {
  it('runs the fade keyframe on the element itself', async () => {
    const screen = await render(<MPAnimateFade data-testid="fade">Arriving</MPAnimateFade>);
    const element = screen.getByTestId('fade').element() as HTMLElement;
    const styles = getComputedStyle(element);

    expect(styles.animationName).toBe('mp-anim-fade');
    // `both`, which is what lets an untriggered animation sit paused on its own
    // first frame instead of being fully drawn until it starts.
    expect(styles.animationFillMode).toBe('both');
  });

  describe('duration', () => {
    /*
     * The Material token, not a number.
     *
     * Both resolve to 300ms today. Only one of them moves when a page retunes
     * `--mp-sys-motion-duration-medium2`, which is the whole reason the default
     * is written as a `var()` rather than as the value it happens to carry.
     */
    it('takes the effect’s Material duration token when nobody said', async () => {
      const screen = await render(<MPAnimateFade data-testid="fade">Arriving</MPAnimateFade>);
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-duration')).toBe(
        'var(--mp-sys-motion-duration-medium2)'
      );
      expect(getComputedStyle(element).animationDuration).toBe('0.3s');
    });

    it('is quicker leaving than arriving', async () => {
      // MD3's asymmetry: an entrance is being introduced, an exit has already
      // said what it had to say.
      const screen = await render(
        <MPAnimateFade mode="out" data-testid="fade">
          Leaving
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationDuration).toBe('0.2s');
    });

    it('lets a number win', async () => {
      const screen = await render(
        <MPAnimateFade duration={1200} data-testid="fade">
          Slow
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationDuration).toBe('1.2s');
    });
  });

  describe('easing', () => {
    it('decelerates into place by default', async () => {
      const screen = await render(<MPAnimateFade data-testid="fade">Arriving</MPAnimateFade>);
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationTimingFunction).toBe(
        'cubic-bezier(0.05, 0.7, 0.1, 1)'
      );
    });

    it('takes a Material curve by name', async () => {
      const screen = await render(
        <MPAnimateFade easing="linear" data-testid="fade">
          Arriving
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationTimingFunction).toBe('cubic-bezier(0, 0, 1, 1)');
    });
  });

  describe('mode', () => {
    /*
     * One keyframe, run the other way.
     *
     * A second `@keyframes` for the exit would be a second place to fix a bug,
     * and it would also lose the easing: CSS mirrors the timing function along
     * with the frames, so a reversed decelerate *is* the accelerate MD3 asks an
     * exit to use.
     */
    it('leaves by reversing the entrance rather than by a keyframe of its own', async () => {
      const screen = await render(
        <MPAnimateFade mode="out" data-testid="fade">
          Leaving
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;
      const styles = getComputedStyle(element);

      expect(styles.animationName).toBe('mp-anim-fade');
      expect(styles.animationDirection).toBe('reverse');
    });
  });

  describe('from', () => {
    it('starts from nothing', async () => {
      const screen = await render(<MPAnimateFade data-testid="fade">Arriving</MPAnimateFade>);
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('0');
    });

    it('can be floored, for content that should never be completely gone', async () => {
      const screen = await render(
        <MPAnimateFade from={0.3} data-testid="fade">
          Arriving
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('0.3');
    });
  });

  describe('trigger', () => {
    it('runs on mount', async () => {
      const screen = await render(<MPAnimateFade data-testid="fade">Arriving</MPAnimateFade>);
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element).toHaveAttribute('data-mp-state', 'running');
      expect(getComputedStyle(element).animationPlayState).toBe('running');
    });

    /*
     * Waiting is a paused animation rather than a second class.
     *
     * With `fill-mode: both` a paused animation shows exactly its own first
     * frame, so an element that has not been triggered yet already looks the
     * way it will when it starts. Two classes would be two states to keep in
     * step, and the moment they drifted a `visible` fade would be fully drawn
     * until it scrolled into view and then blink out to begin.
     */
    it('waits paused on its own first frame under manual control', async () => {
      const screen = await render(
        <MPAnimateFade trigger="manual" data-testid="fade">
          Waiting
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element).toHaveAttribute('data-mp-state', 'paused');
      expect(getComputedStyle(element).animationPlayState).toBe('paused');
    });

    it('runs when `play` goes up', async () => {
      const screen = await render(
        <MPAnimateFade trigger="manual" play data-testid="fade">
          Playing
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      await expect.element(screen.getByTestId('fade')).toHaveAttribute('data-mp-state', 'running');
      expect(getComputedStyle(element).animationPlayState).toBe('running');
    });
  });

  describe('paused', () => {
    it('holds the animation where it is without unwinding it', async () => {
      const screen = await render(
        <MPAnimateFade paused data-testid="fade">
          Held
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationPlayState).toBe('paused');
      expect(getComputedStyle(element).animationName).toBe('mp-anim-fade');
    });
  });

  describe('repeat', () => {
    it('runs once', async () => {
      const screen = await render(<MPAnimateFade data-testid="fade">Once</MPAnimateFade>);
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationIterationCount).toBe('1');
    });

    it('writes `infinite` as the word CSS wants', async () => {
      const screen = await render(
        <MPAnimateFade repeat="infinite" alternate data-testid="fade">
          Forever
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;
      const styles = getComputedStyle(element);

      expect(styles.animationIterationCount).toBe('infinite');
      expect(styles.animationDirection).toBe('alternate');
    });
  });

  /*
   * `stagger` is the same effect written onto the children instead of onto the
   * box. These are about which element carries what, because that is the part
   * an implementation gets wrong: a box that goes on fading over eight fading
   * children shows the content at one opacity multiplied by the other.
   */
  describe('stagger', () => {
    function Set(props: React.ComponentProps<typeof MPAnimateFade>) {
      return (
        <MPAnimateFade data-testid="fade" {...props}>
          <p data-testid="one">One</p>
          <p data-testid="two">Two</p>
          <p data-testid="three">Three</p>
        </MPAnimateFade>
      );
    }

    it('leaves the box with no animation of its own', async () => {
      const screen = await render(<Set stagger={60} />);
      const box = screen.getByTestId('fade').element() as HTMLElement;

      expect(box).not.toHaveClass('mp-anim');
      expect(getComputedStyle(box).animationName).toBe('none');
      // And no slots either, other than the one the children inherit.
      expect(box.style.getPropertyValue('--_mp-anim-duration')).toBe('');
    });

    it('runs the effect on each child, held back by its position', async () => {
      const screen = await render(<Set stagger={60} />);
      const children = ['one', 'two', 'three'].map(
        (id) => screen.getByTestId(id).element() as HTMLElement
      );

      for (const child of children) {
        expect(getComputedStyle(child).animationName).toBe('mp-anim-fade');
      }

      expect(children.map((child) => getComputedStyle(child).animationDelay)).toEqual([
        '0s',
        '0.06s',
        '0.12s'
      ]);
    });

    it('holds the whole set with one play state, by inheritance', async () => {
      const screen = await render(<Set stagger={60} paused />);
      const child = screen.getByTestId('two').element() as HTMLElement;

      expect(getComputedStyle(child).animationPlayState).toBe('paused');
    });

    it('counts from the end when reversed, without playing anything backwards', async () => {
      const screen = await render(<Set stagger={60} reverse />);
      const children = ['one', 'two', 'three'].map(
        (id) => screen.getByTestId(id).element() as HTMLElement
      );

      expect(children.map((child) => getComputedStyle(child).animationDelay)).toEqual([
        '0.12s',
        '0.06s',
        '0s'
      ]);
      // Only the order. Each child still arrives rather than leaving.
      expect(getComputedStyle(children[0]!).animationDirection).toBe('normal');
    });

    it('steps the duration through the set, from the token nobody set', async () => {
      const screen = await render(<Set stagger={60} durationStep={100} />);
      const children = ['one', 'two', 'three'].map(
        (id) => screen.getByTestId(id).element() as HTMLElement
      );

      // The base is `medium2`, which is 300ms.
      expect(children.map((child) => getComputedStyle(child).animationDuration)).toEqual([
        '0.3s',
        '0.4s',
        '0.5s'
      ]);
    });

    it('clamps a negative step at zero rather than dropping the declaration', async () => {
      const screen = await render(<Set stagger={60} durationStep={-200} />);
      const children = ['one', 'two', 'three'].map(
        (id) => screen.getByTestId(id).element() as HTMLElement
      );

      // A third child at −400ms would be an invalid duration, and an invalid
      // declaration is dropped — the child would run at the stylesheet's own
      // `medium4` default, which is longer than any of the other two.
      expect(children.map((child) => getComputedStyle(child).animationDuration)).toEqual([
        '0.3s',
        '0.1s',
        '0s'
      ]);
    });

    it('keeps a child’s own class and style', async () => {
      const screen = await render(
        <MPAnimateFade stagger={60} data-testid="fade">
          <p data-testid="one" className="mine" style={{ color: 'rgb(1, 2, 3)' }}>
            One
          </p>
        </MPAnimateFade>
      );
      const child = screen.getByTestId('one').element() as HTMLElement;

      expect(child).toHaveClass('mine');
      expect(child).toHaveClass('mp-anim');
      expect(child.style.color).toBe('rgb(1, 2, 3)');
    });

    it('wraps a bare string, which has no element to write onto', async () => {
      const screen = await render(
        <MPAnimateFade stagger={60} data-testid="fade">
          Bare
        </MPAnimateFade>
      );
      const box = screen.getByTestId('fade').element() as HTMLElement;
      const wrapper = box.firstElementChild as HTMLElement;

      expect(wrapper.tagName).toBe('SPAN');
      expect(wrapper).toHaveClass('mp-anim');
      expect(wrapper.textContent).toBe('Bare');
    });

    it('animates the box again at a stagger of nought', async () => {
      const screen = await render(<Set />);
      const box = screen.getByTestId('fade').element() as HTMLElement;
      const child = screen.getByTestId('one').element() as HTMLElement;

      expect(getComputedStyle(box).animationName).toBe('mp-anim-fade');
      expect(getComputedStyle(child).animationName).toBe('none');
    });
  });

  /*
   * `timeline="view"` hands the animation to the reader's scrolling.
   *
   * The slots are what is asserted rather than a scrolled position: whether
   * Chromium has run a frame of a `view()` timeline yet is a race, and what the
   * component is responsible for is the two declarations and the play state.
   * The stylesheet's `@supports` is what turns them into an animation.
   */
  describe('timeline', () => {
    it('says nothing at all on the default, so a page is not full of `auto`', async () => {
      const screen = await render(<MPAnimateFade data-testid="fade">Arriving</MPAnimateFade>);
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-timeline')).toBe('');
      expect(element.style.getPropertyValue('--_mp-anim-range')).toBe('');
    });

    it('hands the animation to the scrollport on `view`', async () => {
      const screen = await render(
        <MPAnimateFade timeline="view" data-testid="fade">
          Arriving
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-timeline')).toBe('view()');
      // From the leading edge appearing to a little under halfway across, so it
      // has finished by the time it is somewhere a reader would be looking.
      expect(element.style.getPropertyValue('--_mp-anim-range')).toBe('entry 0% cover 45%');
    });

    it('takes a range of its own', async () => {
      const screen = await render(
        <MPAnimateFade timeline="view" range="cover 20% cover 80%" data-testid="fade">
          Arriving
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-range')).toBe('cover 20% cover 80%');
    });

    /*
     * The trigger apparatus is about a clock this animation no longer has. A
     * `manual` trigger with nothing pressing go leaves an element paused on its
     * own first frame for ever — which for a scroll-driven animation is not
     * waiting, it is blank.
     */
    it('is held running whatever the trigger says', async () => {
      const screen = await render(
        <MPAnimateFade timeline="view" trigger="manual" data-testid="fade">
          Arriving
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element).toHaveAttribute('data-mp-state', 'running');
      expect(getComputedStyle(element).animationPlayState).toBe('running');
    });

    it('still stops for a caller who asked it to', async () => {
      const screen = await render(
        <MPAnimateFade timeline="view" paused data-testid="fade">
          Held
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationPlayState).toBe('paused');
    });

    it('puts the timeline on each child of a staggered set', async () => {
      const screen = await render(
        <MPAnimateFade stagger={60} timeline="view" data-testid="fade">
          <p data-testid="one">One</p>
          <p data-testid="two">Two</p>
        </MPAnimateFade>
      );
      const two = screen.getByTestId('two').element() as HTMLElement;

      // Which is the right answer rather than a side effect: each child then has
      // its own travel through the scrollport, and the position does the
      // sequencing the delay used to.
      expect(two.style.getPropertyValue('--_mp-anim-timeline')).toBe('view()');
    });
  });

  it('keeps the caller’s own class and style', async () => {
    const screen = await render(
      <MPAnimateFade className="custom" style={{ color: 'rgb(1, 2, 3)' }} data-testid="fade">
        Arriving
      </MPAnimateFade>
    );
    const element = screen.getByTestId('fade').element() as HTMLElement;

    expect(element).toHaveClass('custom');
    expect(element).toHaveClass('mp-anim');
    expect(element.style.color).toBe('rgb(1, 2, 3)');
  });

  it('renders something other than a `div`', async () => {
    const screen = await render(
      <MPAnimateFade render={<section />} data-testid="fade">
        Arriving
      </MPAnimateFade>
    );

    expect(screen.getByTestId('fade').element().tagName).toBe('SECTION');
  });
});
