import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateHeadline } from 'material-plus-ui';

describe('MPAnimateHeadline', () => {
  /*
   * Every line is in the same grid cell.
   *
   * Which is what keeps the box as tall as the longest of them from the first
   * frame: a reel that resized as it turned would move everything below it four
   * times a sentence. The lines that are not showing keep their space with
   * `visibility` rather than being taken out of the layout.
   */
  it('stacks every line in one cell', async () => {
    const screen = await render(
      <MPAnimateHeadline data-testid="headline">
        <span>Short</span>
        <span>A considerably longer line than the other one</span>
      </MPAnimateHeadline>
    );
    const element = screen.getByTestId('headline').element() as HTMLElement;

    expect(getComputedStyle(element).display).toBe('grid');
    expect(element.children).toHaveLength(2);
    expect(getComputedStyle(element.children[0]).gridArea).toBe('1 / 1');
    expect(getComputedStyle(element.children[1]).visibility).toBe('hidden');
  });

  it('shows the first line and hides the rest', async () => {
    const screen = await render(
      <MPAnimateHeadline data-testid="headline">
        <span>One</span>
        <span>Two</span>
      </MPAnimateHeadline>
    );
    const element = screen.getByTestId('headline').element() as HTMLElement;

    expect(element.children[0]).toHaveAttribute('data-mp-state', 'active');
    expect(getComputedStyle(element.children[0]).animationName).toBe('mp-anim-headline-in');
    expect(element.children[1]).not.toHaveAttribute('data-mp-state');
  });

  describe('the two halves of the emphasized curve', () => {
    /*
     * The one place in the library where both halves are written out.
     *
     * Everywhere else an exit is a reversed entrance, which mirrors the curve
     * for free. Here the two are genuinely two animations on two elements at
     * the same moment, so the arriving line decelerates and the leaving one
     * accelerates.
     */
    it('decelerates the line arriving', async () => {
      const screen = await render(
        <MPAnimateHeadline data-testid="headline">
          <span>One</span>
          <span>Two</span>
        </MPAnimateHeadline>
      );
      const element = screen.getByTestId('headline').element() as HTMLElement;

      expect(getComputedStyle(element.children[0]).animationTimingFunction).toBe(
        'cubic-bezier(0.05, 0.7, 0.1, 1)'
      );
    });

    it('accelerates the line leaving', async () => {
      const screen = await render(
        <MPAnimateHeadline index={1} data-testid="headline">
          <span>One</span>
          <span>Two</span>
        </MPAnimateHeadline>
      );
      const element = screen.getByTestId('headline').element() as HTMLElement;

      // Advancing puts the previous line into its leaving state, which lands in
      // an effect rather than in the first render.
      screen.rerender(
        <MPAnimateHeadline index={0} data-testid="headline">
          <span>One</span>
          <span>Two</span>
        </MPAnimateHeadline>
      );

      await expect.poll(() => element.children[1].getAttribute('data-mp-state')).toBe('leaving');
      expect(getComputedStyle(element.children[1]).animationTimingFunction).toBe(
        'cubic-bezier(0.3, 0, 0.8, 0.15)'
      );
    });
  });

  describe('index', () => {
    it('is driven by the caller when one is given', async () => {
      const screen = await render(
        <MPAnimateHeadline index={1} data-testid="headline">
          <span>One</span>
          <span>Two</span>
          <span>Three</span>
        </MPAnimateHeadline>
      );
      const element = screen.getByTestId('headline').element() as HTMLElement;

      expect(element.children[1]).toHaveAttribute('data-mp-state', 'active');
    });

    /*
     * A controlled reel is somebody else's timer, and a second one running
     * underneath it would fight for the same state.
     */
    it('does not turn on its own once it is controlled', async () => {
      const onIndexChange = vi.fn();
      const screen = await render(
        <MPAnimateHeadline
          index={0}
          interval={60}
          onIndexChange={onIndexChange}
          data-testid="headline"
        >
          <span>One</span>
          <span>Two</span>
        </MPAnimateHeadline>
      );
      const element = screen.getByTestId('headline').element() as HTMLElement;

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(onIndexChange).not.toHaveBeenCalled();
      expect(element.children[0]).toHaveAttribute('data-mp-state', 'active');
    });

    it('turns on its own when it is not', async () => {
      const screen = await render(
        <MPAnimateHeadline interval={60} duration={40} data-testid="headline">
          <span>One</span>
          <span>Two</span>
        </MPAnimateHeadline>
      );
      const element = screen.getByTestId('headline').element() as HTMLElement;

      await expect.poll(() => element.children[1].getAttribute('data-mp-state')).toBe('active');
    });
  });

  describe('loop', () => {
    it('stops on the last line when it is off', async () => {
      const screen = await render(
        <MPAnimateHeadline loop={false} interval={40} duration={30} data-testid="headline">
          <span>One</span>
          <span>Two</span>
        </MPAnimateHeadline>
      );
      const element = screen.getByTestId('headline').element() as HTMLElement;

      await expect.poll(() => element.children[1].getAttribute('data-mp-state')).toBe('active');

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(element.children[1]).toHaveAttribute('data-mp-state', 'active');
    });
  });

  it('takes `long2` for the swap', async () => {
    const screen = await render(
      <MPAnimateHeadline data-testid="headline">
        <span>One</span>
        <span>Two</span>
      </MPAnimateHeadline>
    );
    const element = screen.getByTestId('headline').element() as HTMLElement;

    expect(getComputedStyle(element.children[0]).animationDuration).toBe('0.5s');
  });

  it('wraps a bare string, which has no element to write onto', async () => {
    const screen = await render(
      <MPAnimateHeadline data-testid="headline">
        {'One'}
        {'Two'}
      </MPAnimateHeadline>
    );
    const element = screen.getByTestId('headline').element() as HTMLElement;

    expect(element.children[0].tagName).toBe('SPAN');
    expect(element.children[0]).toHaveClass('mp-headline-item');
  });
});
