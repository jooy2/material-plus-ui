import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPCalendar, MPLocaleProvider } from 'material-plus-ui';

/**
 * Every test names a locale and a month, for the reason `MPDatePicker`'s do: the
 * grid asks `Intl` for its month names, its weekday initials and the order of
 * its two header buttons, so a test that said nothing would assert against
 * whatever language the machine happens to be set to.
 */
const JULY = new Date(2026, 6, 1);

/**
 * The value as the reader sees it, not as UTC does.
 *
 * A calendar day is local by definition — see `internal/date.ts` — so an ISO
 * string would assert against whichever side of midnight the machine running
 * the test happens to sit on, and 15 July in Seoul is the 14th in `toISOString`.
 */
function local(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function Controlled({
  initial = null,
  ...props
}: Record<string, unknown> & { initial?: Date | null }) {
  const [value, setValue] = useState<Date | null>(initial);

  return (
    <>
      <MPCalendar
        locale="en-US"
        defaultMonth={JULY}
        value={value}
        onValueChange={setValue}
        {...props}
      />
      <output data-testid="model">
        {value ? `${local(value)} ${value.getHours()}:${value.getMinutes()}` : 'none'}
      </output>
    </>
  );
}

describe('MPCalendar', () => {
  describe('standing on the page', () => {
    it('draws the grid with no trigger in front of it', async () => {
      const screen = await render(<Controlled />);

      // The whole point of the component: no button to press first.
      await expect.element(screen.getByRole('grid')).toBeInTheDocument();
      expect(screen.container.querySelector('.mp-date-picker')).toBeNull();
    });

    it('opens on the month it was given', async () => {
      const screen = await render(<Controlled />);

      expect(
        screen.getByRole('button', { name: 'Choose a month' }).element().textContent
      ).toContain('July');
      expect(screen.getByRole('button', { name: 'Choose a year' }).element().textContent).toContain(
        '2026'
      );
    });

    it('opens on the month of its value ahead of `defaultMonth`', async () => {
      const screen = await render(<Controlled initial={new Date(2026, 10, 3)} />);

      expect(
        screen.getByRole('button', { name: 'Choose a month' }).element().textContent
      ).toContain('November');
    });

    it('paints no surface by default, so it can be dropped into one', async () => {
      const screen = await render(<Controlled />);
      const root = screen.container.querySelector('.mp-calendar-root');

      expect(root?.className).toContain('bg-transparent');
      // No padding either — a bare grid has to line up with whatever it was put
      // beside.
      expect(root?.className).not.toContain('p-2.5');
    });

    it('paints one when asked, and takes the popup ladder for its room', async () => {
      const screen = await render(<Controlled variant="outlined" />);
      const root = screen.container.querySelector('.mp-calendar-root');

      expect(root?.className).toContain('border-mp-outline-variant');
      expect(root?.className).toContain('p-2.5');
    });

    it('declares the accent slots the cells read', async () => {
      // The bug this catches: the grid paints its chosen day with
      // `bg-(--_mp-accent)`, and inside a picker it is the shell that declares
      // that property. Standing alone there is no shell, so a calendar that did
      // not declare them itself drew the selected cell in `transparent`.
      const screen = await render(<Controlled color="tertiary" initial={new Date(2026, 6, 15)} />);
      const root = screen.container.querySelector('.mp-calendar-root') as HTMLElement;

      expect(root.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-tertiary)');

      const chosen = screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).element();
      const painted = getComputedStyle(chosen).backgroundColor;

      expect(painted).not.toBe('rgba(0, 0, 0, 0)');
      expect(painted).not.toBe('transparent');
    });

    it('lets an inline `style` of its own through', async () => {
      const screen = await render(<Controlled style={{ opacity: 0.5 }} />);
      const root = screen.container.querySelector('.mp-calendar-root') as HTMLElement;

      expect(root.style.opacity).toBe('0.5');
      // And the slots survive beside it.
      expect(root.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-primary)');
    });

    it('does not take the focus on mount', async () => {
      const screen = await render(<Controlled />);

      expect(screen.container.contains(document.activeElement)).toBe(false);
    });
  });

  describe('choosing', () => {
    it('reports the day that was pressed', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();

      expect(screen.getByTestId('model').element().textContent).toContain('2026-07-15');
    });

    it('works uncontrolled', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPCalendar locale="en-US" defaultMonth={JULY} onValueChange={onValueChange} />
      );

      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect((onValueChange.mock.calls[0][0] as Date).getDate()).toBe(15);
      // And it holds the choice itself — the cell is now the selected one.
      await expect
        .element(screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }))
        .toHaveAttribute('aria-selected', 'true');
    });

    it('keeps the time of day the value already carried', async () => {
      const screen = await render(<Controlled initial={new Date(2026, 6, 2, 14, 30)} />);

      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('2026-07-15 14:30');
    });

    it('does not unchoose the day when it is pressed again', async () => {
      // There is no × on a calendar, and a control that emptied itself on a
      // second press would lose a value to a double-click.
      const screen = await render(<Controlled initial={new Date(2026, 6, 15)} />);

      await screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).click();

      expect(screen.getByTestId('model').element().textContent).toContain('2026-07-15');
    });
  });

  describe('the month on screen', () => {
    it('stays where the reader left it', async () => {
      // The difference from `MPDatePicker`, which puts the calendar back on the
      // chosen day every time its popup opens. A calendar that is always on
      // screen has no such moment.
      const screen = await render(<Controlled initial={new Date(2026, 6, 15)} />);

      await screen.getByRole('button', { name: 'Next month' }).click();

      expect(
        screen.getByRole('button', { name: 'Choose a month' }).element().textContent
      ).toContain('August');
    });

    it('reports each step through `onMonthChange`', async () => {
      const onMonthChange = vi.fn();
      const screen = await render(<Controlled onMonthChange={onMonthChange} />);

      await screen.getByRole('button', { name: 'Next month' }).click();

      expect(onMonthChange).toHaveBeenCalledTimes(1);
      expect((onMonthChange.mock.calls[0][0] as Date).getMonth()).toBe(7);
    });

    it('can be driven from outside', async () => {
      const screen = await render(<Controlled month={new Date(2026, 1, 1)} />);
      const heading = screen.getByRole('button', { name: 'Choose a month' });

      expect(heading.element().textContent).toContain('February');

      // Controlled: the header does not move on its own.
      await screen.getByRole('button', { name: 'Next month' }).click();
      expect(heading.element().textContent).toContain('February');
    });
  });

  describe('precision', () => {
    it('answers with the 1st of a month, and never draws a day grid', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPCalendar
          locale="en-US"
          defaultMonth={JULY}
          precision="month"
          onValueChange={onValueChange}
        />
      );

      expect(screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).query()).toBeNull();

      await screen.getByRole('gridcell', { name: 'September 2026' }).click();

      const picked = onValueChange.mock.calls[0][0] as Date;
      expect(picked.getMonth()).toBe(8);
      expect(picked.getDate()).toBe(1);
    });

    it('answers with 1 January for a year', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPCalendar
          locale="en-US"
          defaultMonth={JULY}
          precision="year"
          onValueChange={onValueChange}
        />
      );

      await screen.getByRole('gridcell', { name: '2020' }).click();

      const picked = onValueChange.mock.calls[0][0] as Date;
      expect(picked.getFullYear()).toBe(2020);
      expect(picked.getMonth()).toBe(0);
      expect(picked.getDate()).toBe(1);
    });
  });

  describe('bounds', () => {
    it('blocks a day outside min and max without removing it', async () => {
      const screen = await render(
        <Controlled minDate={new Date(2026, 6, 10)} maxDate={new Date(2026, 6, 20)} />
      );

      expect(
        screen.getByRole('gridcell', { name: 'Wednesday, July 8, 2026' }).element()
      ).toHaveAttribute('aria-disabled', 'true');
      expect(
        screen.getByRole('gridcell', { name: 'Wednesday, July 15, 2026' }).element()
      ).not.toHaveAttribute('aria-disabled');
    });

    it('consults `shouldDisableDate` for days', async () => {
      const screen = await render(
        <Controlled shouldDisableDate={(date: Date) => date.getDay() === 0} />
      );

      expect(
        screen.getByRole('gridcell', { name: 'Sunday, July 12, 2026' }).element()
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('never consults it on a month calendar', async () => {
      const shouldDisableDate = vi.fn(() => true);
      const screen = await render(
        <MPCalendar
          locale="en-US"
          defaultMonth={JULY}
          precision="month"
          shouldDisableDate={shouldDisableDate}
        />
      );

      await expect.element(screen.getByRole('gridcell', { name: 'July 2026' })).toBeInTheDocument();
      expect(shouldDisableDate).not.toHaveBeenCalled();
    });
  });

  describe('localisation', () => {
    it('takes the language from an `MPLocaleProvider`', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ko">
          <MPCalendar defaultMonth={JULY} />
        </MPLocaleProvider>
      );

      expect(screen.getByRole('button', { name: '월 선택' }).element().textContent).toContain(
        '7월'
      );
    });

    it('lets its own `locale` beat the provider', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ko">
          <MPCalendar locale="en-US" defaultMonth={JULY} />
        </MPLocaleProvider>
      );

      expect(
        screen.getByRole('button', { name: 'Choose a month' }).element().textContent
      ).toContain('July');
    });

    it('takes a `labels` override over the translation', async () => {
      const screen = await render(<Controlled labels={{ nextMonth: 'Forward' }} />);

      await expect.element(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument();
    });
  });

  describe('in a form', () => {
    it('submits the chosen day as `YYYY-MM-DD` under `name`', async () => {
      const screen = await render(<Controlled name="due" initial={new Date(2026, 6, 15)} />);
      const input = screen.container.querySelector('input[name="due"]') as HTMLInputElement;

      expect(input.value).toBe('2026-07-15');
    });

    it('trims what it submits to the precision that was asked for', async () => {
      const screen = await render(
        <MPCalendar
          locale="en-US"
          name="term"
          precision="year"
          defaultValue={new Date(2026, 6, 15)}
        />
      );
      const input = screen.container.querySelector('input[name="term"]') as HTMLInputElement;

      expect(input.value).toBe('2026');
    });

    it('submits an empty string while nothing is chosen', async () => {
      const screen = await render(<Controlled name="due" />);
      const input = screen.container.querySelector('input[name="due"]') as HTMLInputElement;

      expect(input.value).toBe('');
    });

    it('renders no hidden input at all without a `name`', async () => {
      const screen = await render(<Controlled />);

      expect(screen.container.querySelector('input[type="hidden"]')).toBeNull();
    });
  });
});
