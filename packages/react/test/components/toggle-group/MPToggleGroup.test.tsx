import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { MPToggle, MPToggleGroup } from 'material-plus-ui';

/**
 * The component had no test directory at all.
 *
 * `MPToggle`'s suite renders one inside a group in passing, which covers the
 * corner-cutting and nothing else. What a *group* is — the set owning one value,
 * `multiple` deciding how many can be on, and Base UI's roving tab index making
 * eight toggles two key presses deep instead of eight — was unasserted.
 */
function Controlled({ initial = [], ...props }: { initial?: string[] } & Record<string, unknown>) {
  const [value, setValue] = useState<string[]>(initial);

  return (
    <>
      <MPToggleGroup value={value} onValueChange={setValue} {...props}>
        <MPToggle value="bold">Bold</MPToggle>
        <MPToggle value="italic">Italic</MPToggle>
        <MPToggle value="underline">Underline</MPToggle>
      </MPToggleGroup>
      <output data-testid="model">{value.join(',')}</output>
    </>
  );
}

describe('MPToggleGroup', () => {
  describe('the value', () => {
    it('belongs to the set rather than to any one toggle', async () => {
      const screen = await render(<Controlled initial={['italic']} />);

      await expect
        .element(screen.getByRole('button', { name: 'Italic' }))
        .toHaveAttribute('aria-pressed', 'true');
      await expect
        .element(screen.getByRole('button', { name: 'Bold' }))
        .toHaveAttribute('aria-pressed', 'false');
    });

    // `multiple` off is a one-of-a-set: turning one on turns the last one off.
    it('holds one at a time by default', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Bold' }).click();
      await screen.getByRole('button', { name: 'Italic' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('italic');
    });

    it('holds as many as it likes when told to', async () => {
      const screen = await render(<Controlled multiple />);

      await screen.getByRole('button', { name: 'Bold' }).click();
      await screen.getByRole('button', { name: 'Italic' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('bold,italic');
    });

    it('reports an array in both cases, so a caller has one shape to read', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPToggleGroup onValueChange={onValueChange}>
          <MPToggle value="bold">Bold</MPToggle>
        </MPToggleGroup>
      );

      await screen.getByRole('button', { name: 'Bold' }).click();

      expect(onValueChange).toHaveBeenCalledWith(['bold']);
    });

    it('starts where `defaultValue` says, for a set nobody drives', async () => {
      const screen = await render(
        <MPToggleGroup defaultValue={['italic']}>
          <MPToggle value="bold">Bold</MPToggle>
          <MPToggle value="italic">Italic</MPToggle>
        </MPToggleGroup>
      );

      await expect
        .element(screen.getByRole('button', { name: 'Italic' }))
        .toHaveAttribute('aria-pressed', 'true');
    });
  });

  /*
   * The half that is not the value: `variant`, `size`, `color` and `disabled`
   * are set once for the run. A run where the fourth toggle is a rung out is not
   * a run, and nothing about that failure is loud.
   */
  describe('what a member inherits', () => {
    it('hands its size and variant to every toggle', async () => {
      const screen = await render(<Controlled size="sm" variant="filled" />);

      for (const toggle of screen.getByRole('button').elements()) {
        expect(toggle).toHaveAttribute('data-mp-size', 'sm');
        expect(toggle).toHaveAttribute('data-mp-variant', 'filled');
      }
    });

    it('disables the whole run at once', async () => {
      const screen = await render(<Controlled disabled />);

      for (const toggle of screen.getByRole('button').elements()) {
        expect(toggle).toBeDisabled();
      }
    });

    it('lets a toggle disagree with the run', async () => {
      const screen = await render(
        <MPToggleGroup size="sm">
          <MPToggle value="bold">Bold</MPToggle>
          <MPToggle value="italic" size="xl">
            Italic
          </MPToggle>
        </MPToggleGroup>
      );

      expect(screen.getByRole('button', { name: 'Italic' }).element()).toHaveAttribute(
        'data-mp-size',
        'xl'
      );
    });
  });

  /*
   * Base UI owns this and it is the reason to reach for a group at all: one tab
   * stop for the whole set, with the arrow keys moving inside it. A toolbar of
   * eight toggles is two key presses deep rather than eight.
   */
  describe('the keyboard', () => {
    it('takes one tab stop for the whole run', async () => {
      const screen = await render(<Controlled />);
      const stops = screen
        .getByRole('button')
        .elements()
        .filter((toggle) => (toggle as HTMLElement).tabIndex === 0);

      expect(stops).toHaveLength(1);
    });

    it('moves between the toggles with the arrow keys', async () => {
      const screen = await render(<Controlled />);

      screen.getByRole('button', { name: 'Bold' }).element().focus();
      await userEvent.keyboard('{ArrowRight}');

      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Italic' }).element());
    });

    // One render to a test: two groups in one `it` leaves two toggles called
    // Underline in the document and every query becomes ambiguous.
    it('wraps from the last toggle back to the first', async () => {
      const screen = await render(<Controlled />);

      screen.getByRole('button', { name: 'Underline' }).element().focus();
      await userEvent.keyboard('{ArrowRight}');

      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Bold' }).element());
    });

    it('stops at the end when told not to wrap', async () => {
      const screen = await render(<Controlled loopFocus={false} />);
      const last = screen.getByRole('button', { name: 'Underline' }).element();

      last.focus();
      await userEvent.keyboard('{ArrowRight}');

      expect(document.activeElement).toBe(last);
    });
  });

  describe('the shape of the run', () => {
    // The same table `MPButtonGroup` cuts its corners from, so a run of toggles
    // and a run of buttons beside it are cut the same way.
    it('keeps the outer corners round and cuts the inner ones', async () => {
      const screen = await render(<Controlled />);
      const [first, middle, last] = screen
        .getByRole('button')
        .elements()
        .map((element) => getComputedStyle(element));

      expect(Number.parseFloat(first.borderTopLeftRadius)).toBeGreaterThan(
        Number.parseFloat(first.borderTopRightRadius)
      );
      expect(Number.parseFloat(middle.borderTopLeftRadius)).toBe(
        Number.parseFloat(middle.borderTopRightRadius)
      );
      expect(Number.parseFloat(last.borderTopRightRadius)).toBeGreaterThan(
        Number.parseFloat(last.borderTopLeftRadius)
      );
    });

    it('says which way it runs', async () => {
      const screen = await render(<Controlled orientation="vertical" />);

      expect(screen.container.querySelector('.mp-toggle-group')).toHaveAttribute(
        'data-mp-orientation',
        'vertical'
      );
    });
  });
});
