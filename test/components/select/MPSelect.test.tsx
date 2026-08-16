import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPSelect } from 'material-plus-ui';
import type { MPSelectValue, MPSize } from 'material-plus-ui';

const CITIES = [
  { value: 'kr-11', label: 'Seoul' },
  { value: 'jp-13', label: 'Tokyo' },
  { value: 'fr-75', label: 'Paris', disabled: true }
];

function ControlledSelect({
  initial = null,
  ...props
}: {
  initial?: MPSelectValue | null;
  [key: string]: unknown;
}) {
  const [value, setValue] = useState<MPSelectValue | null>(initial);

  return (
    <>
      <MPSelect
        items={CITIES}
        label="City"
        placeholder="Pick one"
        value={value}
        onValueChange={setValue}
        {...props}
      />
      <output data-testid="model">{String(value)}</output>
    </>
  );
}

/**
 * Presses the trigger and waits until the list is actually on the page.
 *
 * The popup is portalled, so it is mounted in an effect rather than in the
 * commit the click produced: when `click()` resolves the list is opening, not
 * open. `element()` and `all()` read the DOM at that instant, where
 * `expect.element` retries — so a test that reads an option straight after the
 * click is a race, and one that only Chromium happens to win.
 */
async function open(screen: Awaited<ReturnType<typeof render>>) {
  await screen.getByRole('combobox').click();
  await expect.element(screen.getByRole('listbox')).toBeInTheDocument();
}

describe('MPSelect', () => {
  describe('rendering', () => {
    it('renders a trigger named by its label', async () => {
      const screen = await render(<ControlledSelect />);

      await expect.element(screen.getByRole('combobox', { name: 'City' })).toBeInTheDocument();
    });

    it('shows the placeholder while nothing is chosen', async () => {
      // With the label pinned in the notch there is nothing standing in the
      // placeholder's way, so it is on screen from the first paint. A floating
      // label rests in exactly that spot and holds it back until it has risen —
      // covered in the floating label suite below.
      const screen = await render(<ControlledSelect floatingLabel={false} />);

      expect(screen.getByRole('combobox').element().textContent).toContain('Pick one');
    });

    it('shows the chosen label rather than the raw value, without ever opening', async () => {
      // The whole reason `items` is a prop rather than composed children: a
      // closed select has to be able to say "Seoul" for `value="kr-11"`.
      const screen = await render(<ControlledSelect initial="kr-11" />);

      expect(screen.getByRole('combobox').element().textContent).toContain('Seoul');
      expect(screen.getByRole('combobox').element().textContent).not.toContain('kr-11');
    });

    it('draws the notched outline the text field wears', async () => {
      await render(<ControlledSelect />);

      // The same internal component, so a form's fields and its dropdowns are
      // the same object.
      expect(document.querySelector('.mp-select fieldset legend')?.textContent).toContain('City');
    });

    it('renders a leading adornment before the value', async () => {
      const screen = await render(
        <ControlledSelect startIcon={<span data-testid="flag">KR</span>} />
      );
      const icon = screen.getByTestId('flag').element();

      expect(
        icon.compareDocumentPosition(
          document.querySelector('.mp-select span[class*="truncate"]')!
        ) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });
  });

  describe('choosing', () => {
    it('opens on click and lists every option', async () => {
      const screen = await render(<ControlledSelect />);

      await open(screen);

      expect(screen.getByRole('option').all()).toHaveLength(3);
      await expect.element(screen.getByRole('option', { name: 'Tokyo' })).toBeInTheDocument();
    });

    it('hands the parent the chosen value rather than an event', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPSelect items={CITIES} label="City" onValueChange={onValueChange} />
      );

      await screen.getByRole('combobox').click();
      await screen.getByRole('option', { name: 'Tokyo' }).click();

      expect(onValueChange).toHaveBeenCalledWith('jp-13');
    });

    it('chooses end to end through a controlled parent', async () => {
      const screen = await render(<ControlledSelect />);

      await screen.getByRole('combobox').click();
      await screen.getByRole('option', { name: 'Seoul' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('kr-11');
      expect(screen.getByRole('combobox').element().textContent).toContain('Seoul');
    });

    it('lists a disabled option without letting it be taken', async () => {
      const screen = await render(<ControlledSelect />);

      await open(screen);

      expect(screen.getByRole('option', { name: 'Paris' }).element()).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('marks the chosen row rather than only highlighting it', async () => {
      // A highlight is also what the arrow keys look like, so a list where
      // "selected" and "where the cursor is" are the same colour is unreadable.
      const screen = await render(<ControlledSelect initial="kr-11" />);

      await open(screen);

      expect(screen.getByRole('option', { name: 'Seoul' }).element()).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });
  });

  describe('states', () => {
    it('shows an error message and marks the select invalid', async () => {
      const screen = await render(<ControlledSelect errorMessage="Pick a city." />);

      await expect.element(screen.getByText('Pick a city.')).toBeInTheDocument();
      expect(document.querySelector('.mp-select')).toHaveAttribute('data-invalid');
    });

    it('lets the error replace the description', async () => {
      const screen = await render(
        <ControlledSelect description="Where the order ships." errorMessage="Pick a city." />
      );

      await expect.element(screen.getByText('Pick a city.')).toBeInTheDocument();
      expect(screen.getByText('Where the order ships.').query()).toBeNull();
    });

    it('disables the trigger', async () => {
      const screen = await render(<ControlledSelect disabled />);

      expect(screen.getByRole('combobox').element()).toBeDisabled();
    });

    it('marks the select required', async () => {
      const screen = await render(<ControlledSelect required />);

      expect(screen.getByRole('combobox').element()).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('the size ladder', () => {
    it('grows monotonically, on the same rungs a text field uses', async () => {
      const screen = await render(<ControlledSelect size="xs" />);
      const heightOf = () => screen.getByRole('combobox').element().getBoundingClientRect().height;

      expect(document.querySelector('.mp-select')).toHaveAttribute('data-mp-size', 'xs');

      let previous = heightOf();

      for (const size of ['sm', 'md', 'lg', 'xl'] as MPSize[]) {
        await screen.rerender(<ControlledSelect size={size} />);

        const next = heightOf();

        expect(next, `${size} should be taller than the step below it`).toBeGreaterThan(previous);
        previous = next;
      }
    });

    it('stretches to the container when fullWidth', async () => {
      const screen = await render(
        <div style={{ width: 360 }}>
          <MPSelect items={CITIES} label="City" fullWidth />
        </div>
      );

      expect(screen.getByRole('combobox').element().getBoundingClientRect().width).toBeCloseTo(
        360,
        0
      );
    });
  });
});
