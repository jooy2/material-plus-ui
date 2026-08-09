import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPDivider } from 'material-plus-ui';

describe('MPDivider', () => {
  describe('rendering', () => {
    it('is a separator', async () => {
      const screen = await render(<MPDivider />);

      expect(screen.getByRole('separator').query()).not.toBeNull();
    });

    it('is horizontal by default', async () => {
      const screen = await render(<MPDivider />);

      expect(screen.getByRole('separator').element()).toHaveAttribute(
        'aria-orientation',
        'horizontal'
      );
    });

    it('announces a vertical orientation', async () => {
      const screen = await render(<MPDivider orientation="vertical" />);

      expect(screen.getByRole('separator').element()).toHaveAttribute(
        'aria-orientation',
        'vertical'
      );
    });

    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(<MPDivider className="my-own-class" />);
      const element = screen.getByRole('separator').element();

      expect(element).toHaveClass('my-own-class');
      expect(element).toHaveClass('mp-divider');
    });

    it('forwards a ref', async () => {
      let node: HTMLDivElement | null = null;

      await render(
        <MPDivider
          ref={(element) => {
            node = element;
          }}
        />
      );

      expect(node).not.toBeNull();
    });

    it('publishes the size on the root', async () => {
      const screen = await render(<MPDivider size="xl" />);

      expect(screen.getByRole('separator').element()).toHaveAttribute('data-mp-size', 'xl');
    });
  });

  describe('the rule', () => {
    it('draws a hairline with no box of its own', async () => {
      const screen = await render(<MPDivider />);
      const element = screen.getByRole('separator').element();

      // The line is one border edge, so a divider never adds a pixel of layout
      // beyond the rule itself.
      expect(element).toHaveClass('h-0');
      expect(element).toHaveClass('border-t');
    });

    it('reads outline-variant unless an accent is asked for', async () => {
      const screen = await render(<MPDivider />);
      const element = screen.getByRole('separator').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-line')).toBe('var(--_mp-color-outline-variant)');
    });

    it('tints the rule when an accent family is asked for', async () => {
      const screen = await render(<MPDivider color="error" />);
      const element = screen.getByRole('separator').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-line')).toBe('var(--_mp-color-error)');
    });

    it('takes a numeric thickness as pixels', async () => {
      const screen = await render(<MPDivider thickness={3} />);
      const element = screen.getByRole('separator').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-rule')).toBe('3px');
    });

    it('takes any CSS length as a thickness', async () => {
      const screen = await render(<MPDivider thickness="0.125rem" />);
      const element = screen.getByRole('separator').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-rule')).toBe('0.125rem');
    });
  });

  describe('length', () => {
    it('fills its container when none is given', async () => {
      const screen = await render(<MPDivider />);

      expect(screen.getByRole('separator').element()).toHaveClass('w-full');
    });

    it('writes a numeric length as a width when horizontal', async () => {
      const screen = await render(<MPDivider length={200} />);
      const element = screen.getByRole('separator').element() as HTMLElement;

      expect(element.style.width).toBe('200px');
      expect(element.style.height).toBe('');
    });

    it('writes it as a height when vertical', async () => {
      const screen = await render(<MPDivider orientation="vertical" length="4rem" />);
      const element = screen.getByRole('separator').element() as HTMLElement;

      expect(element.style.height).toBe('4rem');
      expect(element.style.width).toBe('');
    });

    it('stretches a vertical divider to its row when no length is given', async () => {
      const screen = await render(<MPDivider orientation="vertical" />);

      expect(screen.getByRole('separator').element()).toHaveClass('self-stretch');
    });
  });

  describe('a labelled divider', () => {
    it('shows the label', async () => {
      const screen = await render(<MPDivider>OR</MPDivider>);

      expect(screen.getByRole('separator').element().textContent).toBe('OR');
    });

    it('copies a string label into the accessible name', async () => {
      // `separator` is not a name-from-content role, so without this the label
      // would be read as loose text somewhere near a bare "separator".
      const screen = await render(<MPDivider>OR</MPDivider>);

      expect(screen.getByRole('separator', { name: 'OR' }).query()).not.toBeNull();
    });

    it('leaves a rich label unnamed', async () => {
      // Only the caller knows which part of it is the name.
      const screen = await render(
        <MPDivider>
          <span>OR</span>
        </MPDivider>
      );

      expect(screen.getByRole('separator').element()).not.toHaveAttribute('aria-label');
    });

    it('draws the rule on both sides of the label', async () => {
      const screen = await render(<MPDivider>OR</MPDivider>);
      const stubs = screen
        .getByRole('separator')
        .element()
        .querySelectorAll('[aria-hidden="true"]');

      expect(stubs).toHaveLength(2);
    });

    it('leaves a short stub on the near side when the label is off-centre', async () => {
      const screen = await render(<MPDivider textAlign="start">OR</MPDivider>);
      const stubs = screen
        .getByRole('separator')
        .element()
        .querySelectorAll('[aria-hidden="true"]');

      expect(stubs[0]).toHaveClass('w-4');
      expect(stubs[1]).toHaveClass('flex-1');
    });

    it('splits the rule in half when the label is centred', async () => {
      const screen = await render(<MPDivider>OR</MPDivider>);
      const stubs = screen
        .getByRole('separator')
        .element()
        .querySelectorAll('[aria-hidden="true"]');

      expect(stubs[0]).toHaveClass('flex-1');
      expect(stubs[1]).toHaveClass('flex-1');
    });

    it('turns the label with a vertical rule', async () => {
      const screen = await render(<MPDivider orientation="vertical">OR</MPDivider>);
      const label = screen.getByText('OR').element();

      expect(getComputedStyle(label).writingMode).toBe('vertical-rl');
    });
  });
});
