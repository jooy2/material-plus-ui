import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPChip } from 'material-plus-ui';

describe('MPChip', () => {
  describe('rendering', () => {
    it('shows its label', async () => {
      const screen = await render(<MPChip>Draft</MPChip>);

      expect(screen.getByText('Draft').query()).not.toBeNull();
    });

    it('is a span, not a button, when there is nothing to press', async () => {
      const screen = await render(<MPChip data-testid="chip">Draft</MPChip>);
      const element = screen.getByTestId('chip').element();

      expect(element.tagName).toBe('SPAN');
      expect(screen.getByRole('button').query()).toBeNull();
    });

    it('is outlined by default, which is Material’s chip', async () => {
      const screen = await render(<MPChip data-testid="chip">Draft</MPChip>);

      expect(screen.getByTestId('chip').element()).toHaveAttribute('data-mp-variant', 'outlined');
    });

    it('is never a pill', async () => {
      // MD3 shapes a chip at `corner-small` while every button is
      // `corner-full`, and that difference is what keeps a filter bar from
      // reading as a row of buttons.
      const screen = await render(<MPChip data-testid="chip">Draft</MPChip>);
      const element = screen.getByTestId('chip').element();

      expect(element).toHaveClass('rounded-mp-sm');
      expect(element).not.toHaveClass('rounded-mp-full');
    });

    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(
        <MPChip className="my-own-class" data-testid="chip">
          Draft
        </MPChip>
      );
      const element = screen.getByTestId('chip').element();

      expect(element).toHaveClass('my-own-class');
      expect(element).toHaveClass('mp-chip');
    });

    it('forwards a ref to the shell', async () => {
      let node: HTMLSpanElement | null = null;

      await render(
        <MPChip
          ref={(element) => {
            node = element;
          }}
        >
          Draft
        </MPChip>
      );

      expect(node).not.toBeNull();
      expect(node!.tagName).toBe('SPAN');
    });
  });

  describe('pressable', () => {
    it('becomes a real button when given an onClick', async () => {
      // An inert span carrying a click handler is invisible to a keyboard.
      const screen = await render(<MPChip onClick={() => {}}>Draft</MPChip>);

      expect(screen.getByRole('button', { name: 'Draft' }).query()).not.toBeNull();
    });

    it('fires on click', async () => {
      const onClick = vi.fn();
      const screen = await render(<MPChip onClick={onClick}>Draft</MPChip>);

      await screen.getByRole('button', { name: 'Draft' }).click();

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('reports its selected state', async () => {
      const screen = await render(
        <MPChip onClick={() => {}} selected>
          Draft
        </MPChip>
      );

      expect(screen.getByRole('button', { name: 'Draft' }).element()).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });

    it('says nothing about a state an action chip does not have', async () => {
      // Passing `selected` — either way round — is what says a chip is a toggle.
      // An action announced as "not pressed" is a screen reader describing a
      // state the chip does not have.
      const screen = await render(<MPChip onClick={() => {}}>Export</MPChip>);

      expect(screen.getByRole('button', { name: 'Export' }).element()).not.toHaveAttribute(
        'aria-pressed'
      );
    });

    it('is a toggle that is off when selected is false', async () => {
      const screen = await render(
        <MPChip onClick={() => {}} selected={false}>
          Draft
        </MPChip>
      );

      expect(screen.getByRole('button', { name: 'Draft' }).element()).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });

    it('fills with the container tone when selected', async () => {
      const screen = await render(
        <MPChip selected data-testid="chip">
          Draft
        </MPChip>
      );
      const element = screen.getByTestId('chip').element();

      expect(element).toHaveClass('bg-(--_mp-accent-container)');
      expect(element).toHaveAttribute('data-selected', 'true');
    });

    it('stays inert while disabled', async () => {
      const onClick = vi.fn();
      const screen = await render(
        <MPChip onClick={onClick} disabled data-testid="chip">
          Draft
        </MPChip>
      );

      expect(screen.getByRole('button').query()).toBeNull();
      expect(screen.getByTestId('chip').element()).toHaveAttribute('aria-disabled', 'true');
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    it('draws no affordance unless a handler is given', async () => {
      const screen = await render(<MPChip>Draft</MPChip>);

      expect(screen.getByRole('button', { name: 'Remove' }).query()).toBeNull();
    });

    it('adds a second, separate button', async () => {
      // A `<button>` inside a `<button>` is markup the browser un-nests, so the
      // shell stays a span and both affordances are siblings.
      const screen = await render(
        <MPChip onClick={() => {}} onDelete={() => {}}>
          Draft
        </MPChip>
      );
      const label = screen.getByRole('button', { name: 'Draft' }).element();
      const remove = screen.getByRole('button', { name: 'Remove' }).element();

      expect(label.contains(remove)).toBe(false);
      expect(remove.contains(label)).toBe(false);
    });

    it('fires on click', async () => {
      const onDelete = vi.fn();
      const screen = await render(<MPChip onDelete={onDelete}>Draft</MPChip>);

      await screen.getByRole('button', { name: 'Remove' }).click();

      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('takes a name of its own', async () => {
      const screen = await render(
        <MPChip onDelete={() => {}} deleteLabel="필터 제거">
          초안
        </MPChip>
      );

      expect(screen.getByRole('button', { name: '필터 제거' }).query()).not.toBeNull();
    });

    it('is disabled with the chip', async () => {
      const screen = await render(
        <MPChip onDelete={() => {}} disabled>
          Draft
        </MPChip>
      );

      expect(screen.getByRole('button', { name: 'Remove' }).element()).toBeDisabled();
    });
  });

  describe('slots', () => {
    it('draws a start icon before the label', async () => {
      const screen = await render(
        <MPChip startIcon={<span data-testid="glyph">•</span>}>Draft</MPChip>
      );

      expect(screen.getByTestId('glyph').query()).not.toBeNull();
    });

    it('sets a count on its own plate', async () => {
      const screen = await render(<MPChip count={12}>Errors</MPChip>);

      expect(screen.getByText('12').query()).not.toBeNull();
    });

    it('draws no plate for an absent count', async () => {
      const screen = await render(
        <MPChip count={false} data-testid="chip">
          Errors
        </MPChip>
      );

      expect(screen.getByTestId('chip').element().textContent).toBe('Errors');
    });
  });

  describe('disabled', () => {
    it('drops the accent for the specification’s treatment', async () => {
      // Content at 38%, a container at 12%, both of `on-surface`.
      const screen = await render(
        <MPChip variant="filled" disabled data-testid="chip">
          Draft
        </MPChip>
      );
      const element = screen.getByTestId('chip').element();

      expect(element).toHaveClass('text-mp-on-surface/38');
      expect(element).toHaveClass('bg-mp-on-surface/12');
      expect(element).not.toHaveClass('bg-(--_mp-accent)');
    });
  });
});
