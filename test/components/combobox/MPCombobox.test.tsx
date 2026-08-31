import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPCombobox } from 'material-plus-ui';
import type { MPComboboxValue } from 'material-plus-ui';

const FRUIT = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true }
];

function Single({
  initial = null,
  ...props
}: { initial?: MPComboboxValue | null } & Record<string, unknown>) {
  const [value, setValue] = useState<MPComboboxValue | null>(initial);

  return (
    <>
      <MPCombobox items={FRUIT} label="Fruit" value={value} onValueChange={setValue} {...props} />
      <output data-testid="model">{String(value)}</output>
    </>
  );
}

function Multi({
  initial = [],
  ...props
}: { initial?: MPComboboxValue[] } & Record<string, unknown>) {
  const [value, setValue] = useState<MPComboboxValue[]>(initial);

  return (
    <>
      <MPCombobox
        items={FRUIT}
        label="Fruit"
        multiple
        value={value}
        onValueChange={setValue}
        {...props}
      />
      <output data-testid="model">{value.join(',')}</output>
    </>
  );
}

describe('MPCombobox', () => {
  describe('rendering', () => {
    it('renders a combobox named by its label', async () => {
      const screen = await render(<Single />);

      await expect.element(screen.getByRole('combobox', { name: 'Fruit' })).toBeInTheDocument();
    });

    it('draws the notched outline the text field wears', async () => {
      // The same internal component, so a form's fields and its comboboxes are
      // the same object.
      await render(<Single />);

      expect(document.querySelector('.mp-combobox fieldset legend')?.textContent).toContain(
        'Fruit'
      );
    });

    it('shows the placeholder while nothing is chosen', async () => {
      // With the label pinned in the notch there is nothing standing in the
      // placeholder's way. A floating label rests in exactly that spot and holds
      // it back until it has risen — covered in the floating label suite below.
      const screen = await render(<Single placeholder="Search fruit" floatingLabel={false} />);

      expect(screen.getByRole('combobox').element()).toHaveAttribute('placeholder', 'Search fruit');
    });

    it('shows the chosen option’s label rather than its raw value', async () => {
      const screen = await render(<Single initial="apple" />);

      expect((screen.getByRole('combobox').element() as HTMLInputElement).value).toBe('Apple');
    });
  });

  describe('choosing', () => {
    it('names the chevron after the field it opens', async () => {
      // Base UI wires `aria-labelledby` on the trigger to the field's own label,
      // which outranks an `aria-label` — a button called "Fruit" beside a field
      // called "Fruit" is the button that opens that field.
      const screen = await render(<Single />);

      await expect.element(screen.getByRole('button', { name: 'Fruit' })).toBeInTheDocument();
    });

    it('falls back to openLabel when there is no field label', async () => {
      const screen = await render(<MPCombobox items={FRUIT} />);

      await expect.element(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    });

    it('opens from its chevron and lists every option', async () => {
      const screen = await render(<Single />);

      await screen.getByRole('button', { name: 'Fruit' }).click();

      await expect.element(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
      expect(screen.getByRole('option').all()).toHaveLength(3);
    });

    it('hands the parent the chosen value rather than an event', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPCombobox items={FRUIT} label="Fruit" onValueChange={onValueChange} />
      );

      await screen.getByRole('button', { name: 'Fruit' }).click();
      await screen.getByRole('option', { name: 'Banana' }).click();

      expect(onValueChange).toHaveBeenCalledWith('banana');
    });

    it('chooses end to end through a controlled parent', async () => {
      const screen = await render(<Single />);

      await screen.getByRole('button', { name: 'Fruit' }).click();
      await screen.getByRole('option', { name: 'Apple' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('apple');
    });

    it('lists a disabled option without letting it be taken', async () => {
      const screen = await render(<Single />);

      // Awaited rather than read straight off the click: the popup is portalled,
      // so it is mounted in an effect rather than in the commit the click
      // produced, and `element()` reads the DOM at the instant the click
      // resolves — a race only the fastest browser wins.
      await screen.getByRole('button', { name: 'Fruit' }).click();
      await expect.element(screen.getByRole('listbox')).toBeInTheDocument();

      expect(screen.getByRole('option', { name: 'Cherry' }).element()).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('washes the cursor over the chosen row rather than under it', async () => {
      // The same state layer `MPSelect`'s list wears, and for the same two
      // reasons: a background can only replace the chosen row's fill, and a
      // layer is a thing that can fade.
      const screen = await render(<Single initial="apple" />);

      await screen.getByRole('button', { name: 'Fruit' }).click();
      await expect.element(screen.getByRole('listbox')).toBeInTheDocument();

      const row = screen.getByRole('option', { name: 'Apple' }).element() as HTMLElement;
      const wash = row.querySelector('span[aria-hidden]') as HTMLElement;

      expect(row).toHaveAttribute('data-selected');
      expect(getComputedStyle(row).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(wash).transitionProperty).toBe('opacity');
    });
  });

  describe('filtering', () => {
    it('narrows the list to what was typed', async () => {
      const screen = await render(<Single />);

      await screen.getByRole('combobox').fill('ban');

      await expect.element(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Apple' }).query()).toBeNull();
    });

    it('reports the query as it is typed', async () => {
      const onInputValueChange = vi.fn();
      const screen = await render(<Single onInputValueChange={onInputValueChange} />);

      await screen.getByRole('combobox').fill('ban');

      expect(onInputValueChange).toHaveBeenCalledWith('ban');
    });
  });

  describe('a value the list does not have', () => {
    it('is offered as its own row rather than committed on blur', async () => {
      const screen = await render(<Single />);

      await screen.getByRole('combobox').fill('durian');

      await expect.element(screen.getByRole('option', { name: /durian/ })).toBeInTheDocument();
    });

    it('commits only when the row is taken', async () => {
      const screen = await render(<Single />);

      await screen.getByRole('combobox').fill('durian');
      expect(screen.getByTestId('model').element().textContent).toBe('null');

      await screen.getByRole('option', { name: /durian/ }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('durian');
    });

    it('takes a label of the caller’s own', async () => {
      const screen = await render(<Single customLabel={(query: string) => `Create ${query}`} />);

      await screen.getByRole('combobox').fill('durian');

      await expect
        .element(screen.getByRole('option', { name: 'Create durian' }))
        .toBeInTheDocument();
    });

    it('is not offered at all once allowCustom is off', async () => {
      const screen = await render(<Single allowCustom={false} emptyMessage="Nothing here" />);

      await screen.getByRole('combobox').fill('durian');

      await expect.element(screen.getByText('Nothing here')).toBeInTheDocument();
      expect(screen.getByRole('option').query()).toBeNull();
    });

    it('is not offered for something the list already has', async () => {
      const screen = await render(<Single />);

      await screen.getByRole('combobox').fill('Apple');

      expect(screen.getByRole('option').all()).toHaveLength(1);
    });
  });

  describe('multiple', () => {
    it('turns each chosen value into a chip and keeps filtering', async () => {
      const screen = await render(<Multi />);

      await screen.getByRole('button', { name: 'Fruit' }).click();
      await screen.getByRole('option', { name: 'Apple' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('apple');
      await expect
        .element(screen.getByRole('button', { name: 'Remove Apple' }))
        .toBeInTheDocument();
    });

    it('removes a value from its chip', async () => {
      const screen = await render(<Multi initial={['apple', 'banana']} />);

      await screen.getByRole('button', { name: 'Remove Apple' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('banana');
    });
  });

  describe('the floating label', () => {
    /** Where the label is, read off the attribute rather than off the geometry. */
    function shrunk() {
      return document.querySelector('label')!.hasAttribute('data-mp-shrunk');
    }

    it('rests the label on the input’s line while nothing is chosen or typed', async () => {
      await render(<Single />);

      expect(shrunk()).toBe(false);
    });

    it('lifts it on typed text as well as on a chosen row', async () => {
      // Typed text counts as content: the label cannot sit on top of what is
      // being typed under it.
      const screen = await render(<Single />);

      await screen.getByRole('combobox').fill('ban');

      expect(shrunk()).toBe(true);
    });

    it('starts up on a combobox that already has a value', async () => {
      await render(<Single initial="apple" />);

      expect(shrunk()).toBe(true);
    });

    it('keeps it up while there are chips in the field', async () => {
      await render(<Multi initial={['apple']} />);

      expect(shrunk()).toBe(true);
    });
  });

  describe('states', () => {
    it('shows an error message and marks the combobox invalid', async () => {
      const screen = await render(<Single errorMessage="Pick a fruit." />);

      await expect.element(screen.getByText('Pick a fruit.')).toBeInTheDocument();
      expect(document.querySelector('.mp-combobox')).toHaveAttribute('data-invalid');
    });

    it('lets the error replace the description', async () => {
      const screen = await render(
        <Single description="Whatever is in season." errorMessage="Pick a fruit." />
      );

      await expect.element(screen.getByText('Pick a fruit.')).toBeInTheDocument();
      expect(screen.getByText('Whatever is in season.').query()).toBeNull();
    });

    it('disables the input', async () => {
      const screen = await render(<Single disabled />);

      expect(screen.getByRole('combobox').element()).toBeDisabled();
    });

    it('offers a clear button only when it was asked for', async () => {
      const screen = await render(<Single initial="apple" />);

      expect(screen.getByRole('button', { name: 'Clear' }).query()).toBeNull();

      await screen.rerender(<Single initial="apple" clearable />);

      await expect.element(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });
  });

  /*
   * The events the input produces that the combobox does not report as a
   * choice — Escape that closes something above the field, a shortcut that
   * belongs to the page — with the list's own keys left where they were.
   */
  describe('the raw events', () => {
    it('reports a keystroke on the input', async () => {
      const onKeyDown = vi.fn();
      const screen = await render(<Single onKeyDown={onKeyDown} />);

      screen
        .getByRole('combobox')
        .element()
        .dispatchEvent(
          new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true, cancelable: true })
        );

      expect(onKeyDown).toHaveBeenCalledOnce();
      expect(onKeyDown.mock.calls[0][0].metaKey).toBe(true);
    });

    it('leaves the arrows that walk the list alone', async () => {
      const onKeyDown = vi.fn();
      const screen = await render(<Single onKeyDown={onKeyDown} />);
      const input = screen.getByRole('combobox').element() as HTMLElement;

      input.focus();
      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
      );

      expect(onKeyDown).toHaveBeenCalledOnce();
      await expect.element(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    });

    it('reports the focus the input takes', async () => {
      const onFocus = vi.fn();
      const screen = await render(<Single onFocus={onFocus} />);

      (screen.getByRole('combobox').element() as HTMLElement).focus();

      expect(onFocus).toHaveBeenCalledOnce();
    });
  });

  describe('the indicator column', () => {
    /*
     * The column is always drawn and only the mark inside it comes and goes: an
     * indicator that is not rendered takes its column with it, and every label
     * in the list shifts sideways as the selection moves down.
     */
    it('marks the chosen row with a tick', async () => {
      const screen = await render(<Single initial="apple" />);

      await screen.getByRole('combobox').click();

      const chosen = screen
        .getByRole('option')
        .all()
        .find((option) => option.element().getAttribute('data-selected') !== null);

      expect(chosen!.element().querySelector('svg')).not.toBeNull();
    });

    // The row that offers what was typed is marked with a plus rather than a
    // tick: it is something to add, not something already chosen.
    it('marks the add-this row with its own glyph', async () => {
      const screen = await render(<Single />);

      await screen.getByRole('combobox').fill('Damson');

      const add = screen.getByRole('option').all().at(-1)!;

      expect(add.element().textContent).toContain('Damson');
      expect(add.element().querySelector('svg')).not.toBeNull();
    });
  });
});
