import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPLocaleProvider, MPTimePicker } from 'material-plus-ui';

/**
 * A fixed day for the clock to write onto.
 *
 * The value is a `Date`, so a time always lands on some day; pinning it is what
 * keeps a test run at 23:59 from asserting against tomorrow.
 */
const DAY = new Date(2026, 6, 15);

function Controlled({
  initial = null,
  ...props
}: Record<string, unknown> & { initial?: Date | null }) {
  const [value, setValue] = useState<Date | null>(initial);

  return (
    <>
      <MPTimePicker
        label="Starts at"
        locale="en-US"
        hour12={false}
        referenceDate={DAY}
        value={value}
        onValueChange={setValue}
        {...props}
      />
      <output data-testid="model">
        {value ? `${value.getHours()}:${value.getMinutes()}` : 'none'}
      </output>
    </>
  );
}

describe('MPTimePicker', () => {
  describe('the trigger', () => {
    it('is a button named by the label in the notch', async () => {
      const screen = await render(<Controlled />);

      await expect.element(screen.getByRole('button', { name: 'Starts at' })).toBeInTheDocument();
    });

    it('opens on a press even with no glyph holding the label up', async () => {
      /*
       * `startIcon={null}` is the one configuration where the label rests on the
       * trigger's own line, so it is the only one where the label *moves* when
       * the trigger is pressed. It used to move under the pointer: the press
       * went down on the trigger and up on the label, and a press whose two ends
       * disagree is delivered to their common ancestor rather than to either.
       */
      const screen = await render(<Controlled startIcon={null} />);

      await screen.getByRole('button', { name: 'Starts at' }).click();

      await expect.element(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
    });

    it('writes the chosen time the way the locale writes it', async () => {
      const screen = await render(<Controlled initial={new Date(2026, 6, 15, 9, 5)} />);

      expect(screen.getByRole('button', { name: 'Starts at' }).element().textContent).toContain(
        '09:05'
      );
    });
  });

  describe('the columns', () => {
    it('are named, because they are otherwise unlabelled lists of numbers', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Starts at' }).click();

      await expect.element(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
      await expect.element(screen.getByRole('listbox', { name: 'Minute' })).toBeInTheDocument();
    });

    it('leave the seconds out unless asked', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Starts at' }).click();

      expect(screen.getByRole('listbox', { name: 'Second' }).query()).toBeNull();
    });

    it('add the seconds when asked', async () => {
      const screen = await render(<Controlled showSeconds />);

      await screen.getByRole('button', { name: 'Starts at' }).click();

      await expect.element(screen.getByRole('listbox', { name: 'Second' })).toBeInTheDocument();
    });

    it('grow an AM/PM column on a 12-hour dial', async () => {
      const screen = await render(<Controlled hour12 />);

      await screen.getByRole('button', { name: 'Starts at' }).click();

      await expect.element(screen.getByRole('listbox', { name: 'AM/PM' })).toBeInTheDocument();
    });

    it('step as far apart as they were told to', async () => {
      const screen = await render(<Controlled minuteStep={15} />);

      await screen.getByRole('button', { name: 'Starts at' }).click();

      expect(
        screen.getByRole('listbox', { name: 'Minute' }).getByRole('option').all()
      ).toHaveLength(4);
    });

    /*
     * A step is the divisor that decides how many rows there are, so the values
     * that are not a count have to be turned into one before `Array.from` sees
     * them: `Math.ceil(60 / 0)` is `Infinity`, which it rejects outright.
     */
    it('survive a step of nought rather than throwing on it', async () => {
      const screen = await render(<Controlled minuteStep={0} />);

      await screen.getByRole('button', { name: 'Starts at' }).click();

      expect(
        screen.getByRole('listbox', { name: 'Minute' }).getByRole('option').all()
      ).toHaveLength(60);
    });

    it('survive a negative step rather than drawing an empty column', async () => {
      const screen = await render(<Controlled minuteStep={-5} />);

      await screen.getByRole('button', { name: 'Starts at' }).click();

      expect(
        screen.getByRole('listbox', { name: 'Minute' }).getByRole('option').all()
      ).toHaveLength(60);
    });

    it('round a fractional step rather than printing one into the clock', async () => {
      const screen = await render(<Controlled minuteStep={2.5} />);

      await screen.getByRole('button', { name: 'Starts at' }).click();

      const rows = screen.getByRole('listbox', { name: 'Minute' }).getByRole('option').all();

      expect(rows).toHaveLength(20);
      expect(rows[1].element().textContent).toBe('03');
    });

    // A step wider than the column leaves the one row it can offer, rather than
    // none at all.
    it('hold a step larger than the column to the column', async () => {
      const screen = await render(<Controlled hourStep={99} />);

      await screen.getByRole('button', { name: 'Starts at' }).click();

      expect(screen.getByRole('listbox', { name: 'Hour' }).getByRole('option').all()).toHaveLength(
        1
      );
    });
  });

  /*
   * A `role="listbox"` is a promise about behaviour rather than a label. Without
   * the arrow keys and a roving tab stop it is twenty-four plus sixty ordinary
   * buttons wearing the word.
   */
  describe('the columns as a keyboard reader meets them', () => {
    async function openColumn(screen: Awaited<ReturnType<typeof render>>) {
      await screen.getByRole('button', { name: 'Starts at' }).click();

      return screen.getByRole('listbox', { name: 'Minute' }).element() as HTMLElement;
    }

    it('takes one tab stop for the whole column', async () => {
      const screen = await render(<Controlled />);
      const column = await openColumn(screen);
      const stops = [...column.children].filter((row) => (row as HTMLElement).tabIndex === 0);

      expect(stops).toHaveLength(1);
    });

    it('puts that tab stop on the chosen row', async () => {
      const screen = await render(<Controlled initial={new Date(2026, 6, 15, 9, 30)} />);
      const column = await openColumn(screen);

      expect((column.children[30] as HTMLElement).tabIndex).toBe(0);
    });

    it('moves down and up the column with the arrow keys', async () => {
      const screen = await render(<Controlled />);
      const column = await openColumn(screen);

      (column.children[0] as HTMLElement).focus();
      column.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(document.activeElement).toBe(column.children[1]);

      column.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      expect(document.activeElement).toBe(column.children[0]);
    });

    it('goes to the ends with Home and End', async () => {
      const screen = await render(<Controlled />);
      const column = await openColumn(screen);

      (column.children[0] as HTMLElement).focus();
      column.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      expect(document.activeElement).toBe(column.children[59]);

      column.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      expect(document.activeElement).toBe(column.children[0]);
    });

    // Held rather than stopped at a boundary: a column has two ends and running
    // off one should stay put, not wrap into the other.
    it('stops at the ends rather than wrapping', async () => {
      const screen = await render(<Controlled />);
      const column = await openColumn(screen);

      (column.children[0] as HTMLElement).focus();
      column.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));

      expect(document.activeElement).toBe(column.children[0]);
    });

    it('leaves the keys it does not answer to alone', async () => {
      const screen = await render(<Controlled />);
      const column = await openColumn(screen);
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true
      });

      (column.children[0] as HTMLElement).focus();
      column.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });

    it('glides the column to a row an arrow key walked off the end to', async () => {
      // A reader holding ArrowDown through sixty minutes was reading a column
      // that teleported every few rows, with nothing saying which way it had
      // gone. The stylesheet is what answers that, so this asserts the column
      // declares it rather than sampling a scroll offset mid-animation -- a
      // smooth scroll finishes on the browser's own clock, and a test that
      // raced it would be a test of the machine it ran on.
      const screen = await render(<Controlled />);
      const column = await openColumn(screen);

      expect(getComputedStyle(column).scrollBehavior).toBe('smooth');
    });

    it('lands the first reveal rather than travelling to it', async () => {
      // Opening the picker scrolls every column to the chosen time at once,
      // and three lists easing into place inside a popup that is itself fading
      // in is three things moving where one arrived. `'instant'` overrides the
      // stylesheet, so the column is already where it belongs on the frame it
      // is first drawn.
      const screen = await render(<Controlled initial={new Date(2026, 6, 15, 9, 55)} />);
      const column = await openColumn(screen);

      expect(column.scrollTop).toBeGreaterThan(0);
    });
  });

  describe('choosing a time', () => {
    it('hands the parent a Date on the reference day', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPTimePicker
          label="Starts at"
          locale="en-US"
          hour12={false}
          referenceDate={DAY}
          onValueChange={onValueChange}
        />
      );

      await screen.getByRole('button', { name: 'Starts at' }).click();
      await screen
        .getByRole('listbox', { name: 'Hour' })
        .getByRole('option', { name: '09' })
        .click();

      const [chosen] = onValueChange.mock.calls[0];

      expect(chosen).toBeInstanceOf(Date);
      expect(chosen.getHours()).toBe(9);
      expect(chosen.getDate()).toBe(15);
    });

    it('takes two answers without closing in between', async () => {
      // A time is two answers, so closing after the first would make choosing
      // 9:30 a matter of opening the popup twice.
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Starts at' }).click();
      await screen
        .getByRole('listbox', { name: 'Hour' })
        .getByRole('option', { name: '09' })
        .click();
      await screen
        .getByRole('listbox', { name: 'Minute' })
        .getByRole('option', { name: '30' })
        .click();

      expect(screen.getByTestId('model').element().textContent).toBe('9:30');
    });

    it('closes on Done, which is what the popup staying open needs', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Starts at' }).click();
      await screen.getByRole('button', { name: 'Done' }).click();

      // Awaited rather than read: the popup fades, so it is still in the DOM for
      // the length of the transition after it has been told to go.
      await expect.element(screen.getByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();
    });

    it('marks the chosen row rather than only highlighting it', async () => {
      const screen = await render(<Controlled initial={new Date(2026, 6, 15, 9, 30)} />);

      await screen.getByRole('button', { name: 'Starts at' }).click();

      expect(
        screen.getByRole('listbox', { name: 'Hour' }).getByRole('option', { name: '09' }).element()
      ).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('the bounds', () => {
    /*
     * The detail that separates a working time picker from a frustrating one.
     * A bound is checked against the *span* a row stands for, not against one
     * instant inside it — so an hour that contains an allowed minute stays
     * available, and it is the minute column that greys out.
     */
    it('keeps the hour that contains the minimum available', async () => {
      const screen = await render(
        <Controlled initial={new Date(2026, 6, 15, 9, 0)} minTime={new Date(2026, 6, 15, 9, 30)} />
      );

      await screen.getByRole('button', { name: 'Starts at' }).click();

      expect(
        screen.getByRole('listbox', { name: 'Hour' }).getByRole('option', { name: '09' }).element()
      ).not.toHaveAttribute('aria-disabled');
    });

    it('greys out the minutes before it instead', async () => {
      const screen = await render(
        <Controlled initial={new Date(2026, 6, 15, 9, 0)} minTime={new Date(2026, 6, 15, 9, 30)} />
      );

      await screen.getByRole('button', { name: 'Starts at' }).click();

      const minutes = screen.getByRole('listbox', { name: 'Minute' });

      expect(minutes.getByRole('option', { name: '00' }).element()).toHaveAttribute(
        'aria-disabled',
        'true'
      );
      expect(minutes.getByRole('option', { name: '30' }).element()).not.toHaveAttribute(
        'aria-disabled'
      );
    });

    it('blocks the hours before the minimum outright', async () => {
      const screen = await render(
        <Controlled initial={new Date(2026, 6, 15, 9, 0)} minTime={new Date(2026, 6, 15, 9, 30)} />
      );

      await screen.getByRole('button', { name: 'Starts at' }).click();

      expect(
        screen.getByRole('listbox', { name: 'Hour' }).getByRole('option', { name: '08' }).element()
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('takes a rule of its own, per column', async () => {
      const screen = await render(
        <Controlled shouldDisableTime={(value: Date) => value.getHours() >= 12} />
      );

      await screen.getByRole('button', { name: 'Starts at' }).click();

      expect(
        screen.getByRole('listbox', { name: 'Hour' }).getByRole('option', { name: '13' }).element()
      ).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('submitting', () => {
    it('writes the shape a native time input submits', async () => {
      const screen = await render(
        <Controlled name="starts" initial={new Date(2026, 6, 15, 9, 5)} />
      );

      expect(screen.container.querySelector('input[type="hidden"][name="starts"]')).toHaveValue(
        '09:05'
      );
    });

    it('adds the seconds when the seconds are shown', async () => {
      const screen = await render(
        <Controlled name="starts" showSeconds initial={new Date(2026, 6, 15, 9, 5, 7)} />
      );

      expect(screen.container.querySelector('input[type="hidden"][name="starts"]')).toHaveValue(
        '09:05:07'
      );
    });
  });

  describe('localisation', () => {
    it('names the columns in the locale it was given', async () => {
      const screen = await render(
        <MPTimePicker label="시작" locale="ko" hour12={false} referenceDate={DAY} defaultOpen />
      );

      await expect.element(screen.getByRole('listbox', { name: '시' })).toBeInTheDocument();
      await expect.element(screen.getByRole('listbox', { name: '분' })).toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: '완료' })).toBeInTheDocument();
    });

    it('follows a provider when it has no locale of its own', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ja">
          <MPTimePicker label="開始" hour12={false} referenceDate={DAY} defaultOpen />
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: '完了' })).toBeInTheDocument();
    });

    it('reads the dial off the locale when nobody said which', async () => {
      // `en-US` is a 12-hour locale, so the AM/PM column arrives without being
      // asked for.
      const screen = await render(
        <MPTimePicker label="Starts at" locale="en-US" referenceDate={DAY} defaultOpen />
      );

      await expect.element(screen.getByRole('listbox', { name: 'AM/PM' })).toBeInTheDocument();
    });

    it('and drops it for a 24-hour one', async () => {
      // `de-DE` runs on a 24-hour clock, so there is no half of the day to name.
      // Korean is *not* the counterexample it looks like: `ko` is an h12 locale,
      // which is why the picker draws 오전/오후 for it.
      const screen = await render(
        <MPTimePicker label="Beginn" locale="de-DE" referenceDate={DAY} defaultOpen />
      );

      await expect.element(screen.getByRole('listbox', { name: 'Stunde' })).toBeInTheDocument();
      expect(screen.getByRole('listbox', { name: 'AM/PM' }).query()).toBeNull();
    });
  });
});
