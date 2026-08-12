import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPDatePicker, MPLocaleProvider } from 'material-plus-ui';

/**
 * Every test names a locale and a month.
 *
 * The picker asks `Intl` for its month names, its weekday initials and the order
 * of its two header buttons, so a test that said nothing would assert against
 * whatever language the machine running it happens to be set to. `en-US` and
 * July 2026 are the fixed point everything below is written against — except the
 * localisation tests, which are the ones that change it on purpose.
 */
const JULY = new Date(2026, 6, 1);

function Controlled({
  initial = null,
  ...props
}: Record<string, unknown> & { initial?: Date | null }) {
  const [value, setValue] = useState<Date | null>(initial);

  return (
    <>
      <MPDatePicker
        label="Due date"
        locale="en-US"
        defaultMonth={JULY}
        value={value}
        onValueChange={setValue}
        {...props}
      />
      <output data-testid="model">{value ? value.toISOString() : 'none'}</output>
    </>
  );
}

describe('MPDatePicker', () => {
  describe('the trigger', () => {
    it('is a button named by the label in the notch', async () => {
      const screen = await render(<Controlled />);

      await expect.element(screen.getByRole('button', { name: 'Due date' })).toBeInTheDocument();
    });

    it('wears the notched outline a text field wears', async () => {
      // The same internal component, so a form's date fields and its text fields
      // are the same object.
      const screen = await render(<Controlled />);

      expect(
        screen.container.querySelector('.mp-date-picker fieldset legend')?.textContent
      ).toContain('Due date');
    });

    it('shows the placeholder while nothing is chosen', async () => {
      const screen = await render(<Controlled placeholder="Pick a day" />);

      expect(screen.getByRole('button', { name: 'Due date' }).element().textContent).toContain(
        'Pick a day'
      );
    });

    it('writes the chosen day the way the locale writes it', async () => {
      const screen = await render(<Controlled initial={new Date(2026, 6, 15)} />);

      expect(screen.getByRole('button', { name: 'Due date' }).element().textContent).toContain(
        'Jul 15, 2026'
      );
    });

    it('takes any Intl format', async () => {
      const screen = await render(
        <Controlled initial={new Date(2026, 6, 15)} format={{ dateStyle: 'full' }} />
      );

      expect(screen.getByRole('button', { name: 'Due date' }).element().textContent).toContain(
        'Wednesday, July 15, 2026'
      );
    });

    it('cannot be typed into', async () => {
      // Deliberately a button rather than a text input: parsing a date out of
      // free text is locale-dependent in a way that cannot be done honestly
      // without a date library.
      const screen = await render(<Controlled />);

      expect(screen.getByRole('button', { name: 'Due date' }).element().tagName).toBe('BUTTON');
      expect(screen.container.querySelector('.mp-date-picker input[type="text"]')).toBeNull();
    });
  });

  describe('choosing a day', () => {
    it('opens the calendar on the month it was told to', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Due date' }).click();

      await expect
        .element(screen.getByRole('button', { name: 'Choose a month' }))
        .toHaveTextContent('July');
      await expect
        .element(screen.getByRole('button', { name: 'Choose a year' }))
        .toHaveTextContent('2026');
    });

    it('names every cell as a whole date rather than as a bare number', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Due date' }).click();

      await expect
        .element(screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }))
        .toBeInTheDocument();
    });

    it('hands the parent a Date rather than an event', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPDatePicker
          label="Due date"
          locale="en-US"
          defaultMonth={JULY}
          onValueChange={onValueChange}
        />
      );

      await screen.getByRole('button', { name: 'Due date' }).click();
      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();

      const [chosen] = onValueChange.mock.calls[0];

      expect(chosen).toBeInstanceOf(Date);
      expect(chosen.getFullYear()).toBe(2026);
      expect(chosen.getMonth()).toBe(6);
      expect(chosen.getDate()).toBe(15);
    });

    it('chooses end to end through a controlled parent, and closes', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Due date' }).click();
      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();

      expect(screen.getByRole('button', { name: 'Due date' }).element().textContent).toContain(
        'Jul 15, 2026'
      );
      await expect
        .element(screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }))
        .not.toBeInTheDocument();
    });

    it('stays open when told to', async () => {
      const screen = await render(<Controlled closeOnSelect={false} />);

      await screen.getByRole('button', { name: 'Due date' }).click();
      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();

      await expect
        .element(screen.getByRole('gridcell', { name: 'Thursday, July 16, 2026' }))
        .toBeInTheDocument();
    });

    it('keeps the time of day the value already carried', async () => {
      // A picker bound to a field that also carries a time should not silently
      // reset it to midnight every time the day is corrected.
      const onValueChange = vi.fn();
      const screen = await render(
        <MPDatePicker
          label="Due date"
          locale="en-US"
          defaultMonth={JULY}
          value={new Date(2026, 6, 10, 14, 30)}
          onValueChange={onValueChange}
        />
      );

      await screen.getByRole('button', { name: 'Due date' }).click();
      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();

      const [chosen] = onValueChange.mock.calls[0];

      expect(chosen.getHours()).toBe(14);
      expect(chosen.getMinutes()).toBe(30);
    });
  });

  describe('reaching another month', () => {
    it('steps a month at a time', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Due date' }).click();
      await screen.getByRole('button', { name: 'Next month' }).click();

      await expect
        .element(screen.getByRole('button', { name: 'Choose a month' }))
        .toHaveTextContent('August');
    });

    it('opens a grid of months, so any month of the year is two clicks', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Due date' }).click();
      await screen.getByRole('button', { name: 'Choose a month' }).click();
      await screen.getByRole('gridcell', { name: 'November 2026' }).click();

      await expect
        .element(screen.getByRole('button', { name: 'Choose a month' }))
        .toHaveTextContent('November');
    });

    it('opens a grid of years, so any year at all is three', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Due date' }).click();
      await screen.getByRole('button', { name: 'Choose a year' }).click();
      await screen.getByRole('gridcell', { name: '2020' }).click();

      await expect
        .element(screen.getByRole('button', { name: 'Choose a year' }))
        .toHaveTextContent('2020');
    });
  });

  describe('what cannot be chosen', () => {
    it('blocks the days before minDate without removing them', async () => {
      // Marked rather than dropped: a grid with holes in it is a grid a reader
      // arrowing across a month falls into.
      const screen = await render(<Controlled minDate={new Date(2026, 6, 10)} />);

      await screen.getByRole('button', { name: 'Due date' }).click();

      expect(
        screen.getByRole('gridcell', { name: 'Wednesday, July 8, 2026' }).element()
      ).toHaveAttribute('aria-disabled', 'true');
      expect(
        screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).element()
      ).not.toHaveAttribute('aria-disabled');
    });

    it('blocks the days a rule says are unavailable', async () => {
      const screen = await render(
        <Controlled shouldDisableDate={(date: Date) => date.getDay() === 0} />
      );

      await screen.getByRole('button', { name: 'Due date' }).click();

      expect(
        screen.getByRole('gridcell', { name: 'Sunday, July 12, 2026' }).element()
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not open at all while read only', async () => {
      const screen = await render(<Controlled readOnly initial={new Date(2026, 6, 15)} />);

      await screen.getByRole('button', { name: 'Due date' }).click();

      expect(screen.getByRole('button', { name: 'Choose a month' }).query()).toBeNull();
      // The value is still on screen, and the trigger is still in the tab order.
      expect(screen.getByRole('button', { name: 'Due date' }).element()).not.toHaveAttribute(
        'disabled'
      );
    });
  });

  describe('the footer', () => {
    it('offers today, and lands on it', async () => {
      const screen = await render(<Controlled />);
      const now = new Date();

      await screen.getByRole('button', { name: 'Due date' }).click();
      await screen.getByRole('button', { name: 'Today' }).click();

      expect(screen.getByTestId('model').element().textContent).not.toBe('none');
      expect(new Date(screen.getByTestId('model').element().textContent ?? '').getDate()).toBe(
        now.getDate()
      );
    });

    it('greys today out when today is out of bounds', async () => {
      const screen = await render(<Controlled maxDate={new Date(2020, 0, 1)} />);

      await screen.getByRole('button', { name: 'Due date' }).click();

      expect(screen.getByRole('button', { name: 'Today' }).element()).toHaveAttribute('disabled');
    });
  });

  describe('clearing', () => {
    it('offers no × until there is something to clear', async () => {
      const screen = await render(<Controlled clearable />);

      expect(screen.getByRole('button', { name: 'Clear' }).query()).toBeNull();
    });

    it('empties the picker', async () => {
      const screen = await render(<Controlled clearable initial={new Date(2026, 6, 15)} />);

      await screen.getByRole('button', { name: 'Clear' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('none');
    });
  });

  describe('submitting', () => {
    it('writes the local day rather than a UTC instant', async () => {
      // `toISOString()` on a Date standing for 15 July in Seoul gives the 14th,
      // and a form field that quietly reports the day before the one on screen
      // is the single most expensive bug a date picker can ship.
      const screen = await render(<Controlled name="due" initial={new Date(2026, 6, 15)} />);
      const hidden = screen.container.querySelector('input[type="hidden"][name="due"]');

      expect(hidden).toHaveValue('2026-07-15');
    });

    it('submits an empty string when there is nothing chosen', async () => {
      const screen = await render(<Controlled name="due" />);

      expect(screen.container.querySelector('input[type="hidden"][name="due"]')).toHaveValue('');
    });
  });

  describe('localisation', () => {
    it('takes its month names and its header order from Intl', async () => {
      const screen = await render(
        <MPDatePicker label="마감일" locale="ko" defaultMonth={JULY} defaultOpen />
      );

      await expect
        .element(screen.getByRole('button', { name: '월 선택' }))
        .toHaveTextContent('7월');
      await expect.element(screen.getByRole('button', { name: '오늘' })).toBeInTheDocument();
    });

    it('follows a provider when it has no locale of its own', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ja">
          <MPDatePicker label="期限" defaultMonth={JULY} defaultOpen />
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: '今日' })).toBeInTheDocument();
    });

    it('lets a caller override one word without losing the rest of the translation', async () => {
      const screen = await render(
        <MPDatePicker
          label="마감일"
          locale="ko"
          defaultMonth={JULY}
          defaultOpen
          labels={{ today: '오늘 날짜' }}
        />
      );

      await expect.element(screen.getByRole('button', { name: '오늘 날짜' })).toBeInTheDocument();
      // Untouched, and still Korean rather than back to English.
      await expect.element(screen.getByRole('button', { name: '월 선택' })).toBeInTheDocument();
    });

    it('falls back to English words for a language it has no table for', async () => {
      // `Intl` still speaks it — only the handful of words the platform has no
      // opinion about come from this library.
      const screen = await render(
        <MPDatePicker label="Termin" locale="sv" defaultMonth={JULY} defaultOpen />
      );

      await expect.element(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: 'Choose a month' }))
        .toHaveTextContent('juli');
    });
  });

  describe('the keyboard', () => {
    it('moves one day at a time and pulls the month along at the edge', async () => {
      const screen = await render(<Controlled initial={new Date(2026, 6, 1)} />);

      await screen.getByRole('button', { name: 'Due date' }).click();

      const cell = screen
        .getByRole('gridcell', { name: 'Wednesday, July 1, 2026' })
        .element() as HTMLElement;

      cell.focus();
      cell.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
      );

      await expect
        .element(screen.getByRole('button', { name: 'Choose a month' }))
        .toHaveTextContent('June');
    });
  });
});
