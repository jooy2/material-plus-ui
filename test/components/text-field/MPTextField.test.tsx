import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPIcon, MPTextField, ICONS } from 'material-plus';

/**
 * Types into the element the way the browser does, rather than the way React
 * does.
 *
 * React keeps a tracker of the last value it wrote to a control and skips its
 * `onChange` when a plain `element.value = …` matches it. Going through the
 * prototype's own setter bypasses the tracker, which is what makes the
 * following `input` event look like a real keystroke — and the only way to
 * drive a field through a composition, since no synthetic helper can.
 */
function typeNatively(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;

  Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Lets React flush the state an event just queued before the next one lands. */
function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * A field whose parent rejects everything outside ASCII.
 *
 * This is the shape of parent that breaks a naively controlled input: every
 * keystroke of a Korean syllable is handed back as `''`, so re-rendering from
 * `value` mid-composition would wipe the syllable being built.
 */
function AsciiOnlyField() {
  const [value, setValue] = useState('');

  return (
    <>
      <MPTextField
        label="Name"
        value={value}
        onChange={(next) => setValue(next.replace(/[^\x20-\x7E]/g, ''))}
      />
      <output data-testid="model">{value}</output>
    </>
  );
}

/** A field that simply holds what it is given. */
function ControlledField({ initial = '', ...props }: { initial?: string; [key: string]: unknown }) {
  const [value, setValue] = useState(initial);

  return <MPTextField value={value} onChange={setValue} {...props} />;
}

describe('MPTextField', () => {
  describe('rendering', () => {
    it('renders a native input by default', async () => {
      const screen = await render(<MPTextField value="" label="Email" />);
      const element = screen.getByRole('textbox', { name: 'Email' }).element();

      expect(element.tagName).toBe('INPUT');
      expect(element).toHaveAttribute('type', 'text');
      expect(element).toBeEnabled();
    });

    it('associates the label with the control', async () => {
      const screen = await render(<MPTextField value="" label="Email" name="email" />);
      const input = screen.getByRole('textbox', { name: 'Email' }).element();

      expect(document.querySelector('label')?.getAttribute('for')).toBe(input.id);
      expect(input.id).not.toBe('');
    });

    it('gives two unnamed fields different ids', async () => {
      const screen = await render(
        <>
          <MPTextField value="" label="First" />
          <MPTextField value="" label="Second" />
        </>
      );

      const first = screen.getByRole('textbox', { name: 'First' }).element();
      const second = screen.getByRole('textbox', { name: 'Second' }).element();

      expect(first.id).not.toBe(second.id);
    });

    it('takes an explicit id when given one', async () => {
      const screen = await render(<MPTextField value="" label="Email" id="my-own-id" />);

      expect(screen.getByRole('textbox', { name: 'Email' }).element().id).toBe('my-own-id');
    });

    it('renders without a label', async () => {
      const screen = await render(<MPTextField value="" placeholder="Search" />);

      await expect.element(screen.getByPlaceholder('Search')).toBeInTheDocument();
      expect(document.querySelector('label')).toBeNull();
    });

    it('shows the value it is given', async () => {
      const screen = await render(<MPTextField value="hello" label="Email" />);

      expect((screen.getByRole('textbox').element() as HTMLInputElement).value).toBe('hello');
    });

    it('reflects a changed value on re-render', async () => {
      const screen = await render(<MPTextField value="before" label="Email" />);

      await screen.rerender(<MPTextField value="after" label="Email" />);

      expect((screen.getByRole('textbox').element() as HTMLInputElement).value).toBe('after');
    });

    it('passes name, autoComplete and maxLength to the control', async () => {
      const screen = await render(
        <MPTextField value="" name="email" autoComplete="email" maxLength={5} />
      );
      const element = screen.getByRole('textbox').element();

      expect(element).toHaveAttribute('name', 'email');
      expect(element).toHaveAttribute('autocomplete', 'email');
      expect(element).toHaveAttribute('maxlength', '5');
    });

    it('renders a leading adornment', async () => {
      await render(
        <MPTextField value="" label="Search" startIcon={<MPIcon icon={ICONS.search} size={18} />} />
      );

      expect(document.querySelector('.MuiInputAdornment-positionStart')).not.toBeNull();
    });

    it('draws at the small size, and at the medium size when large', async () => {
      const screen = await render(<MPTextField value="" label="Email" />);
      const root = () => screen.getByRole('textbox').element().closest('.MuiInputBase-root');

      // MUI's own marker for which of its two control heights is in use. It
      // sits on the root rather than on the control inside it.
      expect(root()).toHaveClass('MuiInputBase-sizeSmall');

      await screen.rerender(<MPTextField value="" label="Email" large />);

      expect(root()).not.toHaveClass('MuiInputBase-sizeSmall');
    });
  });

  describe('changing', () => {
    it('hands the parent the text rather than an event', async () => {
      const onChange = vi.fn();
      const screen = await render(<MPTextField value="" onChange={onChange} label="Email" />);

      await screen.getByRole('textbox').fill('abc');

      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.lastCall?.[0]).toBe('abc');
    });

    it('calls onFormReset before every change', async () => {
      const calls: string[] = [];
      const screen = await render(
        <MPTextField
          value=""
          label="Email"
          onFormReset={() => calls.push('reset')}
          onChange={() => calls.push('change')}
        />
      );

      await screen.getByRole('textbox').fill('a');

      expect(calls[0]).toBe('reset');
      expect(calls).toContain('change');
    });

    it('types end to end through a controlled parent', async () => {
      const screen = await render(<ControlledField label="Email" />);

      await screen.getByRole('textbox').fill('hello');

      expect((screen.getByRole('textbox').element() as HTMLInputElement).value).toBe('hello');
    });
  });

  describe('composition', () => {
    it('shows what was typed while an IME is composing, not what the parent kept', async () => {
      const screen = await render(<AsciiOnlyField />);
      const input = screen.getByRole('textbox', { name: 'Name' }).element() as HTMLInputElement;

      input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      await tick();

      typeNatively(input, 'ㅎ');
      input.dispatchEvent(new CompositionEvent('compositionupdate', { bubbles: true, data: 'ㅎ' }));
      await tick();

      // The parent threw the character away; the field is still showing it.
      expect(input.value).toBe('ㅎ');
      expect(screen.getByTestId('model').element().textContent).toBe('');
    });

    it('reports every keystroke of a composition to the parent', async () => {
      const onChange = vi.fn();
      const screen = await render(<MPTextField value="" label="Name" onChange={onChange} />);
      const input = screen.getByRole('textbox').element() as HTMLInputElement;

      input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      await tick();

      typeNatively(input, 'ㅎ');
      await tick();

      expect(onChange).toHaveBeenCalledWith('ㅎ');
    });

    it('hands the parent the committed text when the composition ends', async () => {
      const onChange = vi.fn();
      const screen = await render(<MPTextField value="" label="Name" onChange={onChange} />);
      const input = screen.getByRole('textbox').element() as HTMLInputElement;

      input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      await tick();

      typeNatively(input, '한');
      input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '한' }));
      await tick();

      expect(onChange).toHaveBeenLastCalledWith('한');
    });

    it('is controlled again once the composition ends', async () => {
      const screen = await render(<AsciiOnlyField />);
      const input = screen.getByRole('textbox', { name: 'Name' }).element() as HTMLInputElement;

      input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      await tick();

      typeNatively(input, '한');
      input.dispatchEvent(new CompositionEvent('compositionupdate', { bubbles: true, data: '한' }));
      await tick();

      expect(input.value).toBe('한');

      input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '한' }));
      await tick();

      // The parent rejects it, and now that the composition is over the parent
      // is what decides again.
      expect(input.value).toBe('');
      expect(screen.getByTestId('model').element().textContent).toBe('');
    });

    it('takes a value the parent changed on its own after a composition', async () => {
      const screen = await render(<MPTextField value="a" label="Name" />);
      const input = screen.getByRole('textbox').element() as HTMLInputElement;

      input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      await tick();
      input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: 'a' }));
      await tick();

      await screen.rerender(<MPTextField value="server value" label="Name" />);

      expect(input.value).toBe('server value');
    });
  });

  describe('password', () => {
    it('masks the value and offers a reveal toggle', async () => {
      const screen = await render(<MPTextField value="hunter2" type="password" label="Password" />);

      expect(screen.getByLabelText('Password', { exact: true }).element()).toHaveAttribute(
        'type',
        'password'
      );
      await expect
        .element(screen.getByRole('button', { name: 'display the password' }))
        .toBeInTheDocument();
    });

    it('reveals and re-masks the value', async () => {
      const screen = await render(<MPTextField value="hunter2" type="password" label="Password" />);
      const input = screen.getByLabelText('Password', { exact: true }).element();

      await screen.getByRole('button', { name: 'display the password' }).click();

      expect(input).toHaveAttribute('type', 'text');

      await screen.getByRole('button', { name: 'hide the password' }).click();

      expect(input).toHaveAttribute('type', 'password');
    });

    it('leaves the caret where it was when the toggle is pressed', async () => {
      const screen = await render(<MPTextField value="hunter2" type="password" label="Password" />);
      const input = screen
        .getByLabelText('Password', { exact: true })
        .element() as HTMLInputElement;

      input.focus();
      input.setSelectionRange(3, 3);

      await screen.getByRole('button', { name: 'display the password' }).click();

      expect(document.activeElement).toBe(input);
    });

    it('has no toggle on a field that is not a password', async () => {
      const screen = await render(<MPTextField value="" label="Email" type="email" />);

      expect(screen.getByRole('button').query()).toBeNull();
    });

    it('disables the toggle along with the field', async () => {
      const screen = await render(
        <MPTextField value="hunter2" type="password" label="Password" disabled />
      );

      expect(screen.getByRole('button', { name: 'display the password' }).element()).toBeDisabled();
    });
  });

  describe('multiline', () => {
    it('renders a textarea when rows is set', async () => {
      const screen = await render(<MPTextField value="" label="Bio" rows={4} />);
      const element = screen.getByRole('textbox', { name: 'Bio' }).element();

      expect(element.tagName).toBe('TEXTAREA');
      expect(element).toHaveAttribute('rows', '4');
    });

    it('is not resizable unless asked', async () => {
      const screen = await render(<MPTextField value="" label="Bio" rows={3} />);
      const element = screen.getByRole('textbox').element();

      expect(getComputedStyle(element).resize).not.toBe('vertical');
    });

    it('resizes vertically when asked', async () => {
      const screen = await render(<MPTextField value="" label="Bio" rows={3} resizable />);

      expect(getComputedStyle(screen.getByRole('textbox').element()).resize).toBe('vertical');
    });
  });

  describe('the Enter key', () => {
    it('calls onSubmit and swallows the key on a single-line field', async () => {
      const onSubmit = vi.fn();
      const screen = await render(<MPTextField value="" label="Email" onSubmit={onSubmit} />);
      const input = screen.getByRole('textbox').element();

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      input.dispatchEvent(event);
      await tick();

      expect(onSubmit).toHaveBeenCalledOnce();
      // Swallowed, so a surrounding form is not also submitted natively.
      expect(event.defaultPrevented).toBe(true);
    });

    it('lets Enter through on a multiline field', async () => {
      const onSubmit = vi.fn();
      const screen = await render(
        <MPTextField value="" label="Bio" rows={3} onSubmit={onSubmit} />
      );

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      screen.getByRole('textbox').element().dispatchEvent(event);
      await tick();

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(event.defaultPrevented).toBe(false);
    });

    it('swallows Enter on a multiline field when disableEnterKey is set', async () => {
      const screen = await render(<MPTextField value="" label="Bio" rows={3} disableEnterKey />);

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      screen.getByRole('textbox').element().dispatchEvent(event);
      await tick();

      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('states', () => {
    it('shows an error message and marks the field invalid', async () => {
      const screen = await render(
        <MPTextField value="" label="Email" errorMessage="Not a valid address." />
      );

      await expect.element(screen.getByText('Not a valid address.')).toBeInTheDocument();
      // The whole control turns over, not only the message underneath it.
      expect(document.querySelector('.Mui-error')).not.toBeNull();
    });

    it('shows no helper text without an error', async () => {
      await render(<MPTextField value="" label="Email" />);

      expect(document.querySelector('.MuiFormHelperText-root')).toBeNull();
      expect(document.querySelector('.Mui-error')).toBeNull();
    });

    it('disables the control', async () => {
      const screen = await render(<MPTextField value="" label="Email" disabled />);

      expect(screen.getByRole('textbox').element()).toBeDisabled();
    });

    it('stays focusable and readable when read-only', async () => {
      const screen = await render(<MPTextField value="locked" label="Email" readOnly />);
      const element = screen.getByRole('textbox').element();

      expect(element).toHaveAttribute('readonly');
      expect(element).toBeEnabled();
    });

    it('marks the field required', async () => {
      const screen = await render(<MPTextField value="" label="Email" required />);

      expect(screen.getByRole('textbox').element()).toBeRequired();
    });

    it('stretches to the container when fullWidth', async () => {
      const screen = await render(<MPTextField value="" label="Email" fullWidth />);
      const root = screen.getByRole('textbox').element().closest('.MuiFormControl-root');

      expect(root).toHaveClass('MuiFormControl-fullWidth');
    });
  });

  describe('refs', () => {
    it('forwards a ref to the control', async () => {
      let node: HTMLInputElement | HTMLTextAreaElement | null = null;

      await render(
        <MPTextField
          value=""
          label="Email"
          ref={(element) => {
            node = element;
          }}
        />
      );

      expect(node).not.toBeNull();
      expect(node!.tagName).toBe('INPUT');
    });
  });
});
