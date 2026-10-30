import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPDateTimePicker } from 'material-plus-ui';

const JULY = new Date(2026, 6, 1);

function Controlled({
  initial = null,
  ...props
}: Record<string, unknown> & { initial?: Date | null }) {
  const [value, setValue] = useState<Date | null>(initial);

  return (
    <>
      <MPDateTimePicker
        label="Starts"
        locale="en-US"
        hour12={false}
        defaultMonth={JULY}
        value={value}
        onValueChange={setValue}
        {...props}
      />
      <output data-testid="model">
        {value
          ? `${value.getMonth() + 1}/${value.getDate()} ${value.getHours()}:${value.getMinutes()}`
          : 'none'}
      </output>
    </>
  );
}

describe('MPDateTimePicker', () => {
  describe('the popup', () => {
    it('holds a calendar and a clock side by side', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Starts' }).click();

      await expect
        .element(screen.getByRole('button', { name: 'Choose a month' }))
        .toBeInTheDocument();
      await expect.element(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
    });

    it('draws both panels at the same height, so the popup is one rectangle', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Starts' }).click();

      const grid = document.querySelector('.mp-date-time-picker__popup [role="grid"]');
      const column = document.querySelector('.mp-date-time-picker__popup [role="listbox"]');

      expect(grid).not.toBeNull();
      expect(column).not.toBeNull();
      expect(Math.round(grid!.getBoundingClientRect().height)).toBe(
        Math.round(column!.getBoundingClientRect().height)
      );
    });
  });

  describe('choosing a moment', () => {
    it('does not close on the day, because a moment is two answers', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Starts' }).click();
      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();

      await expect.element(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
    });

    it('takes a day and then a time', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Starts' }).click();
      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();
      await screen
        .getByRole('listbox', { name: 'Hour' })
        .getByRole('option', { name: '14' })
        .click();
      await screen
        .getByRole('listbox', { name: 'Minute' })
        .getByRole('option', { name: '30' })
        .click();

      expect(screen.getByTestId('model').element().textContent).toBe('7/15 14:30');
    });

    it('keeps the clock when the day is corrected afterwards', async () => {
      // Nobody reads a popup in the order it was written, so choosing a moment
      // must not be an ordered task.
      const screen = await render(<Controlled initial={new Date(2026, 6, 10, 14, 30)} />);

      await screen.getByRole('button', { name: 'Starts' }).click();
      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('7/15 14:30');
    });

    it('closes on Done', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Starts' }).click();
      await screen.getByRole('button', { name: 'Done' }).click();

      await expect.element(screen.getByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();
    });
  });

  describe('the bounds, at full precision', () => {
    /*
     * The difference from `MPDatePicker`, and the reason this component reads
     * `minDate` differently: a minimum of 09:30 on the 15th leaves the 15th
     * selectable in the calendar and greys out the morning in the clock. A
     * day-granular check cannot express that.
     */
    it('leaves the day the minimum falls on selectable', async () => {
      const screen = await render(<Controlled minDate={new Date(2026, 6, 15, 9, 30)} />);

      await screen.getByRole('button', { name: 'Starts' }).click();

      expect(
        screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).element()
      ).not.toHaveAttribute('aria-disabled');
      expect(
        screen.getByRole('gridcell', { name: 'Tuesday, July 14, 2026' }).element()
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('greys out the hours before it on that day', async () => {
      const screen = await render(
        <Controlled initial={new Date(2026, 6, 15, 12, 0)} minDate={new Date(2026, 6, 15, 9, 30)} />
      );

      await screen.getByRole('button', { name: 'Starts' }).click();

      const hours = screen.getByRole('listbox', { name: 'Hour' });

      expect(hours.getByRole('option', { name: '08' }).element()).toHaveAttribute(
        'aria-disabled',
        'true'
      );
      // The hour that *contains* the minimum stays available.
      expect(hours.getByRole('option', { name: '09' }).element()).not.toHaveAttribute(
        'aria-disabled'
      );
    });
  });

  describe('submitting', () => {
    it('writes the shape a native datetime-local input submits, in local time', async () => {
      const screen = await render(
        <Controlled name="starts" initial={new Date(2026, 6, 15, 9, 5)} />
      );

      expect(screen.container.querySelector('input[type="hidden"][name="starts"]')).toHaveValue(
        '2026-07-15T09:05'
      );
    });
  });

  describe('the trigger', () => {
    it('writes the whole moment, and agrees with the dial it was given', async () => {
      const screen = await render(<Controlled initial={new Date(2026, 6, 15, 14, 5)} />);
      const text = screen.getByRole('button', { name: 'Starts' }).element().textContent ?? '';

      expect(text).toContain('Jul 15, 2026');
      expect(text).toContain('14:05');
      expect(text).not.toContain('PM');
    });

    it('wears the calendar glyph alone, because a control cannot say two things at once', async () => {
      const screen = await render(<Controlled />);

      expect(
        screen.container.querySelectorAll('.mp-date-time-picker button[aria-haspopup] svg')
      ).toHaveLength(1);
    });

    it('empties on the ×', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPDateTimePicker
          label="Starts"
          locale="en-US"
          defaultValue={new Date(2026, 6, 15, 9, 5)}
          clearable
          onValueChange={onValueChange}
        />
      );

      await screen.getByRole('button', { name: 'Clear' }).click();

      expect(onValueChange).toHaveBeenCalledWith(null);
    });
  });
});
