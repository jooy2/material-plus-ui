import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPTransfer } from 'material-plus-ui';

const ITEMS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Role' },
  { value: 'joined', label: 'Joined', disabled: true }
];

describe('MPTransfer', () => {
  describe('the two lists', () => {
    it('draws everything not chosen on one side and everything chosen on the other', async () => {
      const screen = await render(<MPTransfer items={ITEMS} defaultValue={['email']} />);
      const [source, target] = [...screen.container.querySelectorAll('.mp-transfer__list')];

      expect(source.textContent).toContain('Name');
      expect(source.textContent).not.toContain('Email');
      expect(target.textContent).toContain('Email');
    });

    it('names each list, and says it in the language it was told to', async () => {
      const english = await render(<MPTransfer items={ITEMS} />);

      expect(english.container.textContent).toContain('Available');
      expect(english.container.textContent).toContain('Selected');

      const korean = await render(<MPTransfer items={ITEMS} locale="ko" />);

      expect(korean.container.textContent).toContain('선택 가능');
      expect(korean.container.textContent).toContain('선택함');
    });

    it('takes headings of its own', async () => {
      const screen = await render(
        <MPTransfer items={ITEMS} sourceLabel="All columns" targetLabel="In the report" />
      );

      expect(screen.container.textContent).toContain('All columns');
      expect(screen.container.textContent).toContain('In the report');
    });

    it('says so when a list has nothing in it', async () => {
      const screen = await render(<MPTransfer items={ITEMS} />);
      const [, target] = [...screen.container.querySelectorAll('.mp-transfer__list')];

      expect(target.textContent).toContain('Nothing here');
    });
  });

  describe('ticking is not choosing', () => {
    it('reports nothing when a row is ticked', async () => {
      const onValueChange = vi.fn();
      const screen = await render(<MPTransfer items={ITEMS} onValueChange={onValueChange} />);

      await screen.getByRole('checkbox', { name: 'Name' }).click();

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('reports on the arrow, with the value in the order `items` gave', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPTransfer items={ITEMS} defaultValue={['role']} onValueChange={onValueChange} />
      );

      await screen.getByRole('checkbox', { name: 'Name' }).click();
      await screen.getByRole('button', { name: 'Move to selected' }).click();

      // `name` before `role`, which is the order of `items` rather than the
      // order the two arrived in.
      expect(onValueChange).toHaveBeenCalledWith(['name', 'role']);
    });

    it('brings a row back, and lands it where it started', async () => {
      const screen = await render(<MPTransfer items={ITEMS} defaultValue={['email']} />);

      await screen.getByRole('checkbox', { name: 'Email' }).click();
      await screen.getByRole('button', { name: 'Move to available' }).click();

      const [source] = [...screen.container.querySelectorAll('.mp-transfer__list')];

      expect([...source.querySelectorAll('label')].map((row) => row.textContent)).toEqual([
        'Name',
        'Email',
        'Role',
        'Joined'
      ]);
    });

    it('drops the ticks on what moved and keeps the rest', async () => {
      const screen = await render(<MPTransfer items={ITEMS} />);

      await screen.getByRole('checkbox', { name: 'Name' }).click();
      await screen.getByRole('checkbox', { name: 'Email' }).click();
      await screen.getByRole('button', { name: 'Move to selected' }).click();

      // Both moved, so neither is still waiting to be sent anywhere.
      await expect.element(screen.getByRole('checkbox', { name: 'Name' })).not.toBeChecked();
      await expect.element(screen.getByRole('checkbox', { name: 'Email' })).not.toBeChecked();
    });

    it('settles the rows that crossed, and only those', async () => {
      // A row that moved simply existed in the next frame, which on two lists
      // of near-identical lines is the change hardest to see. The class marks
      // the ones that landed — and no others, because putting it on a row that
      // is already drawn would start the animation there too and replay the
      // whole panel.
      const screen = await render(<MPTransfer items={ITEMS} defaultValue={['joined']} />);

      await screen.getByRole('checkbox', { name: 'Name' }).click();
      await screen.getByRole('button', { name: 'Move to selected' }).click();

      const [source, target] = [...screen.container.querySelectorAll('.mp-transfer__list')];

      expect(source.querySelectorAll('.mp-row-arrive')).toHaveLength(0);

      const settling = [...target.querySelectorAll('.mp-row-arrive')];

      expect(settling).toHaveLength(1);
      expect(settling[0].textContent).toContain('Name');
      expect(getComputedStyle(settling[0]).animationName).toBe('mp-row-arrive');
    });

    it('marks nothing while the two lists are only being read', async () => {
      const screen = await render(<MPTransfer items={ITEMS} defaultValue={['joined']} />);

      expect(screen.container.querySelectorAll('.mp-row-arrive')).toHaveLength(0);
    });
  });

  describe('the arrows', () => {
    it('are dead until something on their own side is ticked', async () => {
      const screen = await render(<MPTransfer items={ITEMS} defaultValue={['email']} />);

      await expect.element(screen.getByRole('button', { name: 'Move to selected' })).toBeDisabled();

      await screen.getByRole('checkbox', { name: 'Name' }).click();

      await expect
        .element(screen.getByRole('button', { name: 'Move to selected' }))
        .not.toBeDisabled();
      // Nothing on the trailing side is ticked, so that one is still dead.
      await expect
        .element(screen.getByRole('button', { name: 'Move to available' }))
        .toBeDisabled();
    });

    it('leaves a row that cannot move where it is', async () => {
      const screen = await render(<MPTransfer items={ITEMS} />);

      await expect.element(screen.getByRole('checkbox', { name: 'Joined' })).toBeDisabled();
    });
  });

  describe('the heading strip', () => {
    it('makes the list’s own name the select-all’s label', async () => {
      const screen = await render(<MPTransfer items={ITEMS} />);

      await expect.element(screen.getByRole('checkbox', { name: 'Available' })).toBeInTheDocument();
    });

    it('takes the whole column, skipping the rows that cannot move', async () => {
      const screen = await render(<MPTransfer items={ITEMS} />);

      await screen.getByRole('checkbox', { name: 'Available' }).click();

      await expect.element(screen.getByRole('checkbox', { name: 'Name' })).toBeChecked();
      await expect.element(screen.getByRole('checkbox', { name: 'Role' })).toBeChecked();
      await expect.element(screen.getByRole('checkbox', { name: 'Joined' })).not.toBeChecked();
    });

    it('counts what is ticked against what is on that side', async () => {
      const screen = await render(<MPTransfer items={ITEMS} />);
      const [heading] = [...screen.container.querySelectorAll('.mp-transfer__heading')];

      expect(heading.textContent).toContain('0/4');

      await screen.getByRole('checkbox', { name: 'Name' }).click();

      expect(heading.textContent).toContain('1/4');
    });
  });

  describe('searchable', () => {
    it('draws no filter unless it is asked for', async () => {
      const screen = await render(<MPTransfer items={ITEMS} />);

      expect(screen.container.querySelectorAll('input[type="text"]')).toHaveLength(0);
    });

    it('narrows one list without touching the other', async () => {
      const screen = await render(
        <MPTransfer items={ITEMS} searchable defaultValue={['email', 'role']} />
      );

      await screen.getByRole('textbox', { name: 'Search' }).first().fill('na');

      const [source, target] = [...screen.container.querySelectorAll('.mp-transfer__list')];

      expect(source.textContent).toContain('Name');
      expect(source.textContent).not.toContain('Joined');
      expect(target.textContent).toContain('Email');
      expect(target.textContent).toContain('Role');
    });

    it('moves only what the filter is still showing', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPTransfer items={ITEMS} searchable onValueChange={onValueChange} />
      );

      await screen.getByRole('checkbox', { name: 'Name' }).click();
      await screen.getByRole('checkbox', { name: 'Role' }).click();
      await screen.getByRole('textbox', { name: 'Search' }).first().fill('role');
      await screen.getByRole('button', { name: 'Move to selected' }).click();

      // `name` was ticked but hidden, so it was never part of this press.
      expect(onValueChange).toHaveBeenCalledWith(['role']);
    });
  });

  describe('controlled', () => {
    it('shows the value it was given and nothing else', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPTransfer items={ITEMS} value={['role']} onValueChange={onValueChange} />
      );

      await screen.getByRole('checkbox', { name: 'Name' }).click();
      await screen.getByRole('button', { name: 'Move to selected' }).click();

      expect(onValueChange).toHaveBeenCalledWith(['name', 'role']);

      const [, target] = [...screen.container.querySelectorAll('.mp-transfer__list')];

      expect(target.textContent).not.toContain('Name');
    });
  });

  it('stops everything at once when it is disabled', async () => {
    const screen = await render(<MPTransfer items={ITEMS} disabled defaultValue={['email']} />);

    for (const box of screen.container.querySelectorAll('input[type="checkbox"]')) {
      expect(box).toBeDisabled();
    }

    await expect.element(screen.getByRole('button', { name: 'Move to selected' })).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Move to available' })).toBeDisabled();
  });

  describe('when the list underneath changes', () => {
    /*
     * A tick belongs to a row, so a row that leaves takes its tick with it. The
     * set was only ever added to, which is invisible — a tick with no row draws
     * nothing — right up until the same value comes back and arrives already
     * ticked, which is a selection the reader did not make.
     */
    it('drops the ticks of rows that are no longer in the list', async () => {
      const all = [
        { value: 'a', label: 'Ada' },
        { value: 'b', label: 'Bea' }
      ];
      const screen = await render(<MPTransfer items={all} />);

      await screen.getByRole('checkbox', { name: 'Ada' }).click();
      expect(screen.getByRole('checkbox', { name: 'Ada' }).element()).toBeChecked();

      // Ada leaves, then comes back.
      await screen.rerender(<MPTransfer items={[{ value: 'b', label: 'Bea' }]} />);
      await screen.rerender(<MPTransfer items={all} />);

      expect(screen.getByRole('checkbox', { name: 'Ada' }).element()).not.toBeChecked();
    });

    it('leaves the ticks of rows that stayed', async () => {
      const all = [
        { value: 'a', label: 'Ada' },
        { value: 'b', label: 'Bea' }
      ];
      const screen = await render(<MPTransfer items={all} />);

      await screen.getByRole('checkbox', { name: 'Ada' }).click();
      await screen.rerender(<MPTransfer items={[...all, { value: 'c', label: 'Cy' }]} />);

      expect(screen.getByRole('checkbox', { name: 'Ada' }).element()).toBeChecked();
    });
  });

  /*
   * The arrow keeps the focus and the only thing that changes is which of two
   * columns of near-identical rows a row is in — so without an announcement the
   * press was silent, on the component whose whole subject is which side a row
   * is on.
   */
  describe('saying what the press did', () => {
    const live = () =>
      document.querySelector('.mp-transfer [aria-live="polite"]') as HTMLElement | null;

    const PEOPLE = [
      { value: 'a', label: 'Ada' },
      { value: 'b', label: 'Bea' },
      { value: 'c', label: 'Cy' }
    ];

    it('says nothing before anything has moved', async () => {
      await render(<MPTransfer items={PEOPLE} locale="en-US" />);

      expect(live()).not.toBeNull();
      expect(live()?.textContent).toBe('');
    });

    it('says how many crossed and which list they landed in', async () => {
      const screen = await render(<MPTransfer items={PEOPLE} locale="en-US" />);

      await screen.getByRole('checkbox', { name: 'Ada' }).click();
      await screen.getByRole('checkbox', { name: 'Cy' }).click();
      await screen.getByRole('button', { name: 'Move to selected' }).click();

      await vi.waitFor(() => expect(live()?.textContent).toBe('Moved to Selected: 2'));
    });

    it("takes the caller's own heading when it is one it can read", async () => {
      const screen = await render(
        <MPTransfer items={PEOPLE} locale="en-US" targetLabel="On the channel" />
      );

      await screen.getByRole('checkbox', { name: 'Ada' }).click();
      await screen.getByRole('button', { name: 'Move to selected' }).click();

      await vi.waitFor(() => expect(live()?.textContent).toBe('Moved to On the channel: 1'));
    });

    it('falls back to the locale when the heading is markup', async () => {
      // There is no honest way to read a heading out of an element, and a
      // sentence with a hole where the list's name goes is worse than one naming
      // the list by what the library calls it.
      const screen = await render(
        <MPTransfer items={PEOPLE} locale="en-US" targetLabel={<em>On the channel</em>} />
      );

      await screen.getByRole('checkbox', { name: 'Ada' }).click();
      await screen.getByRole('button', { name: 'Move to selected' }).click();

      await vi.waitFor(() => expect(live()?.textContent).toBe('Moved to Selected: 1'));
    });

    /*
     * A live region reports what is added to it, and the same press twice over
     * produces the same sentence. Without the tick React would leave the DOM
     * alone and the second press would say nothing at all.
     */
    it('is heard again when the same press is repeated', async () => {
      const screen = await render(<MPTransfer items={PEOPLE} locale="en-US" />);

      await screen.getByRole('checkbox', { name: 'Ada' }).click();
      await screen.getByRole('button', { name: 'Move to selected' }).click();

      await vi.waitFor(() => expect(live()?.textContent).toBe('Moved to Selected: 1'));

      const first = live()?.firstElementChild;

      await screen.getByRole('checkbox', { name: 'Bea' }).click();
      await screen.getByRole('button', { name: 'Move to selected' }).click();

      await vi.waitFor(() => expect(live()?.firstElementChild).not.toBe(first));
      expect(live()?.textContent).toBe('Moved to Selected: 1');
    });

    it('says nothing on a press that moved nothing', async () => {
      const screen = await render(<MPTransfer items={PEOPLE} locale="en-US" />);

      // Nothing is ticked, so the arrow is disabled and there is nothing to say.
      expect(screen.getByRole('button', { name: 'Move to selected' }).element()).toBeDisabled();
      expect(live()?.textContent).toBe('');
    });
  });

  /*
   * Without this the two panels are one undifferentiated run of checkboxes. A
   * reader moving by form control hears the row's label and nothing saying which
   * side of the transfer it is on, which on a component whose whole subject is
   * *which side a row is on* is the one thing they needed.
   */
  describe('telling the two lists apart', () => {
    it('makes each list a group named after its own heading', async () => {
      const screen = await render(
        <MPTransfer
          items={[
            { value: 'a', label: 'Ada' },
            { value: 'b', label: 'Bea' }
          ]}
          value={['b']}
          sourceLabel="Everyone"
          targetLabel="On the channel"
        />
      );

      const source = screen.getByRole('group', { name: 'Everyone' }).element();
      const target = screen.getByRole('group', { name: 'On the channel' }).element();

      expect(source.textContent).toContain('Ada');
      expect(source.textContent).not.toContain('Bea');
      expect(target.textContent).toContain('Bea');
    });

    it('names the groups off the locale when the caller named nothing', async () => {
      const screen = await render(
        <MPTransfer items={[{ value: 'a', label: 'Ada' }]} locale="en-US" />
      );

      await expect.element(screen.getByRole('group', { name: 'Available' })).toBeInTheDocument();
      await expect.element(screen.getByRole('group', { name: 'Selected' })).toBeInTheDocument();
    });
  });
});
