import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPCarousel } from 'material-plus-ui';

/**
 * Three slides, as an array rather than as a component.
 *
 * `React.Children.toArray` flattens an array child, so this is three slides;
 * wrapping them in a component of their own would be *one*, which is the right
 * answer — a top-level child is a slide, whatever it happens to render.
 */
const SLIDES = ['First', 'Second', 'Third'].map((text) => (
  <div key={text} style={{ height: 80 }}>
    {text}
  </div>
));

describe('MPCarousel', () => {
  describe('rendering', () => {
    it('wraps every top-level child in a slide', async () => {
      const screen = await render(<MPCarousel>{SLIDES}</MPCarousel>);

      expect(screen.container.querySelectorAll('[aria-roledescription="slide"]')).toHaveLength(3);
    });

    it('drops the nulls a conditional slide leaves behind', async () => {
      const screen = await render(
        <MPCarousel>
          <div>First</div>
          {false}
          {null}
          <div>Second</div>
        </MPCarousel>
      );

      expect(screen.container.querySelectorAll('[aria-roledescription="slide"]')).toHaveLength(2);
    });

    it('names itself as a carousel', async () => {
      const screen = await render(<MPCarousel label="Product photographs">{SLIDES}</MPCarousel>);
      const root = screen.container.querySelector('.mp-carousel')!;

      expect(root).toHaveAttribute('role', 'region');
      expect(root).toHaveAttribute('aria-roledescription', 'carousel');
      expect(root).toHaveAttribute('aria-label', 'Product photographs');
    });

    it('names each slide, and lets the caller write the sentence', async () => {
      const screen = await render(
        <MPCarousel slideLabel={(index, count) => `${index}번째 / 전체 ${count}`}>
          {SLIDES}
        </MPCarousel>
      );

      expect(screen.container.querySelector('[aria-roledescription="slide"]')).toHaveAttribute(
        'aria-label',
        '1번째 / 전체 3'
      );
    });

    it('publishes the rung and the variant it was drawn at', async () => {
      const screen = await render(
        <MPCarousel size="lg" variant="text">
          {SLIDES}
        </MPCarousel>
      );
      const root = screen.container.querySelector('.mp-carousel');

      expect(root).toHaveAttribute('data-mp-size', 'lg');
      expect(root).toHaveAttribute('data-mp-variant', 'text');
    });
  });

  describe('the furniture', () => {
    it('draws arrows and marks by default', async () => {
      const screen = await render(<MPCarousel>{SLIDES}</MPCarousel>);

      await expect.element(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
      expect(screen.container.querySelectorAll('[aria-current]')).toHaveLength(1);
    });

    it('drops them when asked', async () => {
      const screen = await render(
        <MPCarousel arrows={false} indicators={false}>
          {SLIDES}
        </MPCarousel>
      );

      expect(screen.container.querySelectorAll('button')).toHaveLength(0);
    });

    it('draws neither for a single slide, because there is nowhere to go', async () => {
      const screen = await render(
        <MPCarousel>
          <div>Only</div>
        </MPCarousel>
      );

      expect(screen.container.querySelectorAll('button')).toHaveLength(0);
    });
  });

  describe('moving', () => {
    it('advances when the next arrow is pressed', async () => {
      const onValueChange = vi.fn();
      const screen = await render(<MPCarousel onValueChange={onValueChange}>{SLIDES}</MPCarousel>);

      await screen.getByRole('button', { name: 'Next slide' }).click();

      expect(onValueChange).toHaveBeenCalledWith(1);
    });

    it('wraps from the last slide back to the first', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPCarousel value={2} onValueChange={onValueChange}>
          {SLIDES}
        </MPCarousel>
      );

      await screen.getByRole('button', { name: 'Next slide' }).click();

      expect(onValueChange).toHaveBeenCalledWith(0);
    });

    it('goes inert at the ends instead when it does not loop', async () => {
      const screen = await render(<MPCarousel loop={false}>{SLIDES}</MPCarousel>);

      await expect.element(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
      await expect.element(screen.getByRole('button', { name: 'Next slide' })).not.toBeDisabled();
    });

    it('jumps to the slide whose mark was pressed', async () => {
      const onValueChange = vi.fn();
      const screen = await render(<MPCarousel onValueChange={onValueChange}>{SLIDES}</MPCarousel>);

      await screen.getByRole('button', { name: 'Slide 3 of 3' }).click();

      expect(onValueChange).toHaveBeenCalledWith(2);
    });

    it('marks the current slide, and only that one', async () => {
      const screen = await render(<MPCarousel value={1}>{SLIDES}</MPCarousel>);
      const marks = [...screen.container.querySelectorAll('[aria-current]')];

      expect(marks).toHaveLength(1);
      expect(marks[0]).toHaveAttribute('aria-label', 'Slide 2 of 3');
    });
  });

  describe('the live region', () => {
    it('says where the reader is while nothing is moving on its own', async () => {
      const screen = await render(<MPCarousel>{SLIDES}</MPCarousel>);
      const region = screen.container.querySelector('[aria-live]')!;

      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region.textContent).toBe('Slide 1 of 3');
    });

    it('goes quiet while the carousel advances by itself', async () => {
      // A live region that says a new slide's name every five seconds is what
      // makes a screen reader unusable on a page that has one.
      const screen = await render(<MPCarousel autoPlay>{SLIDES}</MPCarousel>);

      expect(screen.container.querySelector('[aria-live]')).toHaveAttribute('aria-live', 'off');
    });

    /*
     * The timer used to be torn down and rebuilt on every render, because `go`
     * depended on `index` and on `onValueChange` — and a caller passing an
     * inline arrow, which is nearly all of them, made `go` a new function every
     * time. On a page whose parent re-renders more often than `interval`, the
     * wait never reached its end and the carousel never advanced at all.
     */
    /*
     * The timer used to be torn down and rebuilt on every render, because `go`
     * depended on `index` and on `onValueChange` — and an inline arrow, which is
     * what nearly every caller passes, made `go` a new function each time. On a
     * page re-rendering more often than `interval`, the wait never reached its
     * end and the carousel never advanced at all.
     *
     * The handler is deliberately inline here, because that is the shape of the
     * bug. `hover` on the spacer first because the pointer is left over the
     * carousel by the tests above, and a hovered carousel is a paused one.
     */
    it('keeps advancing across a parent’s re-renders', async () => {
      const moved = vi.fn();
      const strip = (
        <>
          <div data-testid="spacer" style={{ height: 20 }} />
          <MPCarousel autoPlay interval={30} onValueChange={(next) => moved(next)}>
            {SLIDES}
          </MPCarousel>
        </>
      );
      const screen = await render(strip);

      await screen.getByTestId('spacer').hover();

      for (let round = 0; round < 12; round += 1) {
        await screen.rerender(
          <>
            <div data-testid="spacer" style={{ height: 20 }} />
            <MPCarousel autoPlay interval={30} onValueChange={(next) => moved(next)}>
              {SLIDES}
            </MPCarousel>
          </>
        );
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      /*
       * Read here rather than after a settling wait, and that is the whole
       * assertion: a timer rebuilt on every render still fires once the renders
       * stop, so waiting for quiet would pass on the broken version too. What
       * has to be true is that it advanced *while* the page was busy.
       */
      expect(moved).toHaveBeenCalled();
    });
  });

  describe('the strip', () => {
    it('is focusable, so the arrow keys reach it', async () => {
      const screen = await render(<MPCarousel>{SLIDES}</MPCarousel>);

      expect(
        screen.container.querySelector('[role="group"][aria-label="Carousel"]')
      ).toHaveAttribute('tabindex', '0');
    });

    it('never hides an off-screen slide from the accessibility tree', async () => {
      // The strip is scrollable, so everything in it is genuinely reachable —
      // and an `aria-hidden` subtree that is still in the tab order is the exact
      // shape of the bug where a keyboard reader lands somewhere their screen
      // reader refuses to describe.
      const screen = await render(<MPCarousel>{SLIDES}</MPCarousel>);

      expect(
        screen.container.querySelectorAll('[aria-roledescription="slide"][aria-hidden]')
      ).toHaveLength(0);
    });
  });
});
