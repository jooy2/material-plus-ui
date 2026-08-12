import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPDateRangePicker } from 'material-plus-ui';
import type { MPDateRange } from 'material-plus-ui';

const JULY = new Date(2026, 6, 1);
const EMPTY: MPDateRange = { start: null, end: null };

/** `YYYY-MM-DD`, so a range reads as one line in an assertion. */
function write(range: MPDateRange) {
  const day = (date: Date | null) =>
    date ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` : '·';

  return `${day(range.start)}…${day(range.end)}`;
}

function Controlled({
  initial = EMPTY,
  ...props
}: Record<string, unknown> & { initial?: MPDateRange }) {
  const [value, setValue] = useState<MPDateRange>(initial);

  return (
    <>
      <MPDateRangePicker
        label="Stay"
        locale="en-US"
        defaultMonth={JULY}
        value={value}
        onValueChange={setValue}
        {...props}
      />
      <output data-testid="model">{write(value)}</output>
    </>
  );
}

describe('MPDateRangePicker', () => {
  describe('the trigger', () => {
    it('is a button named by the label in the notch', async () => {
      const screen = await render(<Controlled />);

      await expect.element(screen.getByRole('button', { name: 'Stay' })).toBeInTheDocument();
    });

    it('shows a placeholder per end, because either may be missing', async () => {
      const screen = await render(
        <Controlled startPlaceholder="Check in" endPlaceholder="Check out" />
      );
      const text = screen.getByRole('button', { name: 'Stay' }).element().textContent ?? '';

      expect(text).toContain('Check in');
      expect(text).toContain('Check out');
    });

    it('writes both ends once they are chosen', async () => {
      const screen = await render(
        <Controlled initial={{ start: new Date(2026, 6, 10), end: new Date(2026, 6, 15) }} />
      );
      const text = screen.getByRole('button', { name: 'Stay' }).element().textContent ?? '';

      expect(text).toContain('Jul 10, 2026');
      expect(text).toContain('Jul 15, 2026');
    });
  });

  describe('the two panels', () => {
    it('shows two months, because a range that crosses one is the ordinary case', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Stay' }).click();

      const headings = screen.getByRole('button', { name: 'Choose a month' }).all();

      expect(headings).toHaveLength(2);
      await expect.element(headings[0]).toHaveTextContent('July');
      await expect.element(headings[1]).toHaveTextContent('August');
    });

    it('drops to one when asked', async () => {
      const screen = await render(<Controlled monthCount={1} />);

      await screen.getByRole('button', { name: 'Stay' }).click();

      expect(screen.getByRole('button', { name: 'Choose a month' }).all()).toHaveLength(1);
    });

    it('moves as a pair: the two panels are one calendar in two halves', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Stay' }).click();
      await screen.getByRole('button', { name: 'Next month' }).click();

      const headings = screen.getByRole('button', { name: 'Choose a month' }).all();

      await expect.element(headings[0]).toHaveTextContent('August');
      await expect.element(headings[1]).toHaveTextContent('September');
    });

    it('draws no leading or trailing days, so no date appears in both panels', async () => {
      // With both panels showing six full weeks, the 1st of August would be a
      // trailing day of July *and* the first day of August — two cells with one
      // name in one popup.
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Stay' }).click();

      expect(screen.getByRole('gridcell', { name: 'Saturday, August 1, 2026' }).all()).toHaveLength(
        1
      );
    });
  });

  describe('choosing a range', () => {
    it('takes two clicks, and reports half a range as half a range', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Stay' }).click();
      await screen.getByRole('gridcell', { name: 'Friday, July 10, 2026' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('2026-7-10…·');

      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('2026-7-10…2026-7-15');
    });

    it('reads a backwards pair as the same range typed the other way round', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Stay' }).click();
      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();
      await screen.getByRole('gridcell', { name: 'Friday, July 10, 2026' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('2026-7-10…2026-7-15');
    });

    it('always hands back an object, never null', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPDateRangePicker
          label="Stay"
          locale="en-US"
          defaultMonth={JULY}
          defaultValue={{ start: new Date(2026, 6, 10), end: new Date(2026, 6, 15) }}
          clearable
          onValueChange={onValueChange}
        />
      );

      await screen.getByRole('button', { name: 'Clear' }).click();

      expect(onValueChange).toHaveBeenCalledWith({ start: null, end: null });
    });

    it('closes once both ends are in', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Stay' }).click();
      await screen.getByRole('gridcell', { name: 'Friday, July 10, 2026' }).click();
      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();

      await expect
        .element(screen.getByRole('button', { name: 'Choose a month' }).first())
        .not.toBeInTheDocument();
    });

    it('marks the band between the two ends', async () => {
      const screen = await render(
        <Controlled initial={{ start: new Date(2026, 6, 10), end: new Date(2026, 6, 15) }} />
      );

      await screen.getByRole('button', { name: 'Stay' }).click();

      // Between the ends but not an end itself: banded, not chosen.
      const middle = screen.getByRole('gridcell', { name: 'Monday, July 13, 2026' }).element();

      expect(middle).toHaveAttribute('aria-selected', 'false');
      expect(middle.className).toContain('rounded-none');
    });
  });

  describe('the footer', () => {
    it('says which end the next click fills', async () => {
      // The trigger says the same thing with its two halves, but the trigger is
      // behind the popup while the popup is up.
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Stay' }).click();

      await expect.element(screen.getByText('Start')).toBeInTheDocument();

      await screen.getByRole('gridcell', { name: 'Friday, July 10, 2026' }).click();

      await expect.element(screen.getByText('End')).toBeInTheDocument();
    });
  });

  describe('presets', () => {
    it('applies a named range in one click', async () => {
      const screen = await render(
        <Controlled
          presets={[
            {
              label: 'That week',
              value: () => ({ start: new Date(2026, 6, 6), end: new Date(2026, 6, 12) })
            }
          ]}
        />
      );

      await screen.getByRole('button', { name: 'Stay' }).click();
      await screen.getByRole('button', { name: 'That week' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('2026-7-6…2026-7-12');
    });
  });

  describe('submitting', () => {
    it('writes the two ends under one name, so FormData.getAll returns the pair', async () => {
      const screen = await render(
        <Controlled
          name="stay"
          initial={{ start: new Date(2026, 6, 10), end: new Date(2026, 6, 15) }}
        />
      );
      const hidden = [
        ...screen.container.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="stay"]')
      ];

      expect(hidden.map((input) => input.value)).toEqual(['2026-07-10', '2026-07-15']);
    });
  });
});
