import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPSkeleton } from 'material-plus-ui';

describe('MPSkeleton', () => {
  describe('shape', () => {
    it('is a run of text by default', async () => {
      const screen = await render(<MPSkeleton data-testid="skeleton" />);
      const element = screen.getByTestId('skeleton').element();

      expect(element).toHaveClass('h-4');
      expect(element).toHaveClass('w-full');
    });

    it('draws a block', async () => {
      const screen = await render(<MPSkeleton shape="rect" data-testid="skeleton" />);
      const element = screen.getByTestId('skeleton').element();

      expect(element).toHaveClass('rounded-mp-md');
      expect(element).toHaveClass('h-20');
    });

    it('draws a circle the size of an avatar at the same rung', async () => {
      const screen = await render(<MPSkeleton shape="circle" data-testid="skeleton" />);
      const element = screen.getByTestId('skeleton').element();

      expect(element).toHaveClass('rounded-mp-full');
      expect(element).toHaveClass('size-14');
    });

    it('drops the default block height once one is given', async () => {
      const screen = await render(<MPSkeleton shape="rect" height={300} data-testid="skeleton" />);
      const element = screen.getByTestId('skeleton').element() as HTMLElement;

      expect(element).not.toHaveClass('h-20');
      expect(element.style.height).toBe('300px');
    });
  });

  describe('lines', () => {
    it('stacks bars rather than striping one box', async () => {
      const screen = await render(<MPSkeleton lines={3} data-testid="skeleton" />);
      const element = screen.getByTestId('skeleton').element();

      expect(element.children).toHaveLength(3);
      // The root holds only the stacking, so it drops the fill itself.
      expect(element).not.toHaveClass('bg-(--_mp-placeholder)');
    });

    it('draws the last line short, the way a paragraph ends', async () => {
      const screen = await render(<MPSkeleton lines={3} data-testid="skeleton" />);
      const bars = screen.getByTestId('skeleton').element().children;

      expect(bars[0]).toHaveClass('w-full');
      expect(bars[2]).toHaveClass('w-3/5');
    });

    it('stays one bar at a count of one', async () => {
      const screen = await render(<MPSkeleton lines={1} data-testid="skeleton" />);
      const element = screen.getByTestId('skeleton').element();

      expect(element.children).toHaveLength(0);
      expect(element).toHaveClass('bg-(--_mp-placeholder)');
    });
  });

  describe('colour', () => {
    it('is an empty container unless a family is asked for', async () => {
      const screen = await render(<MPSkeleton data-testid="skeleton" />);
      const element = screen.getByTestId('skeleton').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-placeholder')).toBe(
        'var(--_mp-color-surface-container-highest)'
      );
    });

    it('takes the family’s container tone when asked', async () => {
      const screen = await render(<MPSkeleton color="tertiary" data-testid="skeleton" />);
      const element = screen.getByTestId('skeleton').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-placeholder')).toBe(
        'var(--_mp-color-tertiary-container)'
      );
    });
  });

  describe('animated', () => {
    it('pulses by default', async () => {
      const screen = await render(<MPSkeleton data-testid="skeleton" />);

      expect(screen.getByTestId('skeleton').element()).toHaveClass('animate-pulse');
    });

    it('goes still when asked', async () => {
      const screen = await render(<MPSkeleton animated={false} data-testid="skeleton" />);

      expect(screen.getByTestId('skeleton').element()).not.toHaveClass('animate-pulse');
    });
  });

  describe('label', () => {
    it('is scenery with nothing to say by default', async () => {
      // A dozen boxes each announcing themselves is worse than silence.
      const screen = await render(<MPSkeleton data-testid="skeleton" />);
      const element = screen.getByTestId('skeleton').element();

      expect(element).toHaveAttribute('aria-hidden', 'true');
      expect(element).not.toHaveAttribute('role');
    });

    it('reports the wait when it is the one that speaks for the region', async () => {
      const screen = await render(<MPSkeleton label="Loading results" />);
      const element = screen.getByRole('status', { name: 'Loading results' }).element();

      expect(element).toHaveAttribute('aria-busy', 'true');
      expect(element).not.toHaveAttribute('aria-hidden');
    });
  });

  describe('sizing', () => {
    it('takes a numeric width as pixels', async () => {
      const screen = await render(<MPSkeleton width={240} data-testid="skeleton" />);

      expect((screen.getByTestId('skeleton').element() as HTMLElement).style.width).toBe('240px');
    });

    it('takes any CSS length', async () => {
      const screen = await render(<MPSkeleton width="50%" data-testid="skeleton" />);

      expect((screen.getByTestId('skeleton').element() as HTMLElement).style.width).toBe('50%');
    });

    it('leaves a stack of lines to the type scale rather than squeezing it', async () => {
      // On a stack the root is the column that holds the bars, and each bar is
      // already the height of the type it stands in for — so a `height` here
      // would clamp the column, and the column hides what overflows it.
      const screen = await render(<MPSkeleton lines={3} height={20} data-testid="skeleton" />);
      const element = screen.getByTestId('skeleton').element() as HTMLElement;

      expect(element.style.height).toBe('');
      expect(element.children).toHaveLength(3);
      expect(element.getBoundingClientRect().height).toBeGreaterThan(20);
    });

    it('still takes a height on a single shape', async () => {
      const screen = await render(<MPSkeleton shape="rect" height={120} data-testid="skeleton" />);

      expect((screen.getByTestId('skeleton').element() as HTMLElement).style.height).toBe('120px');
    });
  });

  describe('render', () => {
    it('renders something other than a div', async () => {
      const screen = await render(<MPSkeleton render={<li />} data-testid="skeleton" />);

      expect(screen.getByTestId('skeleton').element().tagName).toBe('LI');
    });
  });
});
