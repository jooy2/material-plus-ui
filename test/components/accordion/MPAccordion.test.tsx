import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAccordion, MPAccordionItem, MPButton } from 'material-plus-ui';

/** Three sections, so the "only one at a time" rule has something to enforce. */
function ThreeSections(props: React.ComponentProps<typeof MPAccordion>) {
  return (
    <MPAccordion {...props}>
      <MPAccordionItem value="a" title="Delivery">
        Three to five working days.
      </MPAccordionItem>
      <MPAccordionItem value="b" title="Returns">
        Thirty days, postage paid.
      </MPAccordionItem>
      <MPAccordionItem value="c" title="Warranty">
        Two years on parts.
      </MPAccordionItem>
    </MPAccordion>
  );
}

describe('MPAccordion', () => {
  describe('rendering', () => {
    it('renders a trigger per section', async () => {
      const screen = await render(<ThreeSections />);

      expect(screen.container.querySelectorAll('.mp-accordion__item')).toHaveLength(3);
      await expect.element(screen.getByRole('button', { name: /Delivery/ })).toBeInTheDocument();
    });

    it('publishes the rung and the variant it was drawn at', async () => {
      const screen = await render(<ThreeSections size="xs" variant="tonal" />);
      const root = screen.container.querySelector('.mp-accordion');

      expect(root).toHaveAttribute('data-mp-size', 'xs');
      expect(root).toHaveAttribute('data-mp-variant', 'tonal');
    });

    it('hands every section the rung the stack was given', async () => {
      // The rung lives on the stack, not on the section: three chances per item
      // to get one wrong is how an accordion ends up with one section a size
      // bigger than the rest.
      const screen = await render(<ThreeSections size="xs" />);

      for (const trigger of screen.container.querySelectorAll('.mp-accordion__item button')) {
        expect(trigger.className).toContain('px-2.5');
      }
    });
  });

  describe('folding', () => {
    it('opens a section when its trigger is pressed', async () => {
      const screen = await render(<ThreeSections />);

      expect(screen.container.textContent).not.toContain('Thirty days');

      await screen.getByRole('button', { name: /Returns/ }).click();

      await expect.element(screen.getByText('Thirty days, postage paid.')).toBeInTheDocument();
    });

    it('closes the last one as the next opens', async () => {
      const screen = await render(<ThreeSections defaultValue={['a']} />);
      const [delivery, returns] = [
        ...screen.container.querySelectorAll('.mp-accordion__item button')
      ];

      expect(delivery).toHaveAttribute('aria-expanded', 'true');

      await screen.getByRole('button', { name: /Returns/ }).click();

      // `aria-expanded` rather than the text: the closing panel is still in the
      // DOM while its height travels back to zero, which is the animation
      // working rather than the section staying open.
      expect(returns).toHaveAttribute('aria-expanded', 'true');
      expect(delivery).toHaveAttribute('aria-expanded', 'false');
    });

    it('keeps both open when told it may', async () => {
      const screen = await render(<ThreeSections multiple defaultValue={['a']} />);

      await screen.getByRole('button', { name: /Returns/ }).click();

      await expect.element(screen.getByText('Thirty days, postage paid.')).toBeInTheDocument();
      expect(screen.container.textContent).toContain('Three to five working days.');
    });

    it('reports the whole open set, not the section that changed', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <ThreeSections multiple defaultValue={['a']} onValueChange={onValueChange} />
      );

      await screen.getByRole('button', { name: /Returns/ }).click();

      expect(onValueChange).toHaveBeenCalledWith(['a', 'b']);
    });

    it('opens whatever a controlled caller says is open', async () => {
      const screen = await render(<ThreeSections value={['c']} />);

      await expect.element(screen.getByText('Two years on parts.')).toBeInTheDocument();
    });

    it('disables every section at once from the stack', async () => {
      const screen = await render(<ThreeSections disabled />);

      for (const trigger of screen.container.querySelectorAll('.mp-accordion__item button')) {
        expect(trigger).toBeDisabled();
      }
    });

    it('disables one section without touching the rest', async () => {
      const screen = await render(
        <MPAccordion>
          <MPAccordionItem value="a" title="Delivery" disabled>
            Body
          </MPAccordionItem>
          <MPAccordionItem value="b" title="Returns">
            Thirty days, postage paid.
          </MPAccordionItem>
        </MPAccordion>
      );

      const [first, second] = [...screen.container.querySelectorAll('.mp-accordion__item button')];

      expect(first).toBeDisabled();
      expect(second).not.toBeDisabled();
    });
  });

  describe('the header', () => {
    it('keeps `action` outside the trigger, so both can be pressed', async () => {
      const onEdit = vi.fn();
      const screen = await render(
        <MPAccordion>
          <MPAccordionItem
            value="a"
            title="Address"
            action={
              <MPButton variant="text" onClick={onEdit}>
                Edit
              </MPButton>
            }
          >
            Body
          </MPAccordionItem>
        </MPAccordion>
      );
      const trigger = screen.container.querySelector('.mp-accordion__item button')!;

      expect(trigger.textContent).not.toContain('Edit');

      await screen.getByRole('button', { name: 'Edit' }).click();

      expect(onEdit).toHaveBeenCalled();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('renders the subtitle under the heading', async () => {
      const screen = await render(
        <MPAccordion>
          <MPAccordionItem value="a" title="Address" subtitle="Seoul">
            Body
          </MPAccordionItem>
        </MPAccordion>
      );

      await expect.element(screen.getByText('Seoul')).toBeInTheDocument();
    });
  });

  describe('dividers', () => {
    it('rules the sections by default and squares off the sheet', async () => {
      const screen = await render(<ThreeSections />);
      const root = screen.container.querySelector('.mp-accordion')!;

      expect(root.className).toContain('overflow-hidden');
      expect(root.className).not.toContain('p-1');
    });

    it('turns the sections into tiles when the rules are dropped', async () => {
      const screen = await render(<ThreeSections dividers={false} />);
      const root = screen.container.querySelector('.mp-accordion')!;
      const trigger = screen.container.querySelector('.mp-accordion__item button')!;

      expect(root.className).toContain('p-1');
      expect(trigger.className).toContain('rounded-mp-sm');
    });
  });
});
