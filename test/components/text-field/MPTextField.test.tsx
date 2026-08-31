import { useState, type FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { MPIcon, MPTextField, ICONS } from 'material-plus-ui';

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
 * Waits out the longest transition a component runs.
 *
 * Read from the token rather than hardcoded, so shortening the duration does not
 * quietly turn this into a race. `getComputedStyle` on a transitioning colour
 * returns an interpolated `oklab()` with no hue component, which is what makes
 * this necessary at all.
 */
function settled() {
  const declared = getComputedStyle(document.documentElement).getPropertyValue(
    '--mp-sys-motion-duration-short4'
  );
  const ms = Number.parseFloat(declared) * (declared.trim().endsWith('ms') ? 1 : 1000);

  return new Promise((resolve) => setTimeout(resolve, (Number.isFinite(ms) ? ms : 200) + 60));
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

    it('gives two fields of the same name different ids', async () => {
      /*
       * A form array — a row of contacts, each with `name="email"` — used to
       * hand every field the same id, because the id was derived from the name.
       * A `<label for>` resolves to the first match in the document, so every
       * label pointed at the first row and clicking the others focused nothing.
       */
      const screen = await render(
        <>
          <MPTextField value="" label="First" name="email" />
          <MPTextField value="" label="Second" name="email" />
        </>
      );

      const first = screen.getByRole('textbox', { name: 'First' }).element();
      const second = screen.getByRole('textbox', { name: 'Second' }).element();

      expect(first.id).not.toBe(second.id);
      expect(document.querySelectorAll(`[id="${CSS.escape(first.id)}"]`)).toHaveLength(1);
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
      const screen = await render(
        <MPTextField value="" label="Search" startIcon={<MPIcon icon={ICONS.search} size={18} />} />
      );

      // The glyph sits before the control in the DOM, which is what puts it
      // before the text visually — there is no adornment wrapper class to look
      // for, only the order.
      const field = document.querySelector('.mp-text-field')!;
      const icon = field.querySelector('.mp-icon')!;

      expect(icon).not.toBeNull();
      expect(
        icon.compareDocumentPosition(screen.getByRole('textbox').element()) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('draws at Material\u2019s own size by default', async () => {
      const screen = await render(<MPTextField value="" label="Email" />);
      const root = () => screen.getByRole('textbox').element().closest('.mp-text-field');

      // Which rung of the ladder is in use, published on the root so a consumer
      // can style against it as well.
      expect(root()).toHaveAttribute('data-mp-size', 'md');

      await screen.rerender(<MPTextField value="" label="Email" size="xs" />);

      expect(root()).toHaveAttribute('data-mp-size', 'xs');
    });

    it('grows monotonically across the size ladder', async () => {
      // The heights are made of a type scale plus padding rather than set
      // outright, so this is the assertion that catches a row of the table being
      // edited into the wrong order.
      const screen = await render(<MPTextField value="" label="Email" size="xs" />);
      const heightOf = () =>
        screen.getByRole('textbox').element().closest('.mp-text-field')!.getBoundingClientRect()
          .height;

      let previous = heightOf();

      for (const size of ['sm', 'md', 'lg', 'xl'] as const) {
        await screen.rerender(<MPTextField value="" label="Email" size={size} />);

        const next = heightOf();

        expect(next, `${size} should be taller than the step below it`).toBeGreaterThan(previous);
        previous = next;
      }
    });
  });

  describe('the floating label', () => {
    /**
     * Where the label currently is, read off the attribute the component
     * publishes rather than off the geometry.
     *
     * The two states differ by a `top` that is a percentage and a `font-size`
     * that comes from a token, both of which are mid-interpolation for the two
     * hundred milliseconds after every change — so a test that measured them
     * would be timing the transition rather than asking the question.
     */
    function shrunk() {
      return document.querySelector('label')!.hasAttribute('data-mp-shrunk');
    }

    /** Whether the outline's notch is cut, which has to agree with the label. */
    function notched() {
      const legend = document.querySelector('.mp-text-field legend')!;

      return getComputedStyle(legend).maxWidth !== '0px';
    }

    it('rests the label on the field’s line while it is empty and unfocused', async () => {
      await render(<MPTextField value="" label="Email" />);

      expect(shrunk()).toBe(false);
      expect(notched()).toBe(false);
    });

    it('lifts it on focus and puts it back down on blur', async () => {
      const screen = await render(
        <>
          <MPTextField value="" label="Email" />
          <button type="button">Elsewhere</button>
        </>
      );

      await screen.getByRole('textbox').click();

      expect(shrunk()).toBe(true);
      expect(notched()).toBe(true);

      await screen.getByRole('button', { name: 'Elsewhere' }).click();

      expect(shrunk()).toBe(false);
    });

    it('keeps it up once there is text, focused or not', async () => {
      const screen = await render(<MPTextField value="a" label="Email" />);

      expect(shrunk()).toBe(true);

      await screen.rerender(<MPTextField value="" label="Email" />);

      expect(shrunk()).toBe(false);
    });

    it('stays up while the password toggle has the focus', async () => {
      // The toggle is a second focusable inside the same shell. Tabbing onto it
      // is not leaving the field, and a label that dropped and lifted again in
      // one frame would say it was.
      const screen = await render(<MPTextField value="" type="password" label="Password" />);

      // A `type="password"` input has no `textbox` role, so it is taken
      // directly. The toggle is then focused rather than clicked: a click on it
      // cancels its own `mousedown` to keep the caret where it was, so it never
      // moves the focus at all and would not exercise the handover.
      document.querySelector('input')!.focus();
      await tick();

      expect(shrunk()).toBe(true);

      (screen.getByRole('button', { name: 'Show the password' }).element() as HTMLElement).focus();
      await tick();

      expect(shrunk()).toBe(true);
    });

    it('withholds the placeholder until the label is out of its way', async () => {
      const screen = await render(<MPTextField value="" label="Email" placeholder="you@example" />);

      expect(screen.getByRole('textbox').element()).not.toHaveAttribute('placeholder');

      await screen.getByRole('textbox').click();

      expect(screen.getByRole('textbox').element()).toHaveAttribute('placeholder', 'you@example');
    });

    it('shows the placeholder straight away when there is no label to rest', async () => {
      const screen = await render(<MPTextField value="" placeholder="Search" />);

      expect(screen.getByRole('textbox').element()).toHaveAttribute('placeholder', 'Search');
    });

    it('is pinned in the notch by a start adornment', async () => {
      // The glyph is already standing where a resting label would be, and the
      // two cannot share the spot.
      await render(
        <MPTextField value="" label="Search" startIcon={<MPIcon icon={ICONS.search} size={18} />} />
      );

      expect(shrunk()).toBe(true);
      expect(notched()).toBe(true);
    });

    it('is pinned in the notch by floatingLabel={false}', async () => {
      await render(<MPTextField value="" label="Email" floatingLabel={false} />);

      expect(shrunk()).toBe(true);
      expect(notched()).toBe(true);
    });

    it('does not let a click on the resting label swallow the caret', async () => {
      // Resting, the label lies over the text the caret goes into. A `<label
      // for>` would only focus the control, which puts the caret at the end of
      // the text rather than under the pointer, so the clicks have to fall
      // through to the input instead.
      await render(<MPTextField value="" label="Email" />);

      expect(getComputedStyle(document.querySelector('label')!).pointerEvents).toBe('none');
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

    /*
     * The other engine ordering, and the reason `handleCompositionEnd` calls
     * `onChange` at all.
     *
     * Browsers disagree about whether `input` fires before or after
     * `compositionend`. Chrome and Firefox send it first, which the test above
     * covers. WebKit has sent them the other way round, and on that path the
     * `compositionend` handler is the *only* announcement the parent gets — a
     * field that only listened to `input` would drop the committed syllable
     * entirely.
     */
    it('hands over the committed text when the commit arrives before the input', async () => {
      const onChange = vi.fn();
      const screen = await render(<MPTextField value="" label="Name" onChange={onChange} />);
      const input = screen.getByRole('textbox').element() as HTMLInputElement;

      input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      await tick();

      // The commit first, with the element already holding the syllable.
      input.value = '한';
      input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '한' }));
      await tick();

      expect(onChange).toHaveBeenCalledWith('한');
    });

    // The stale form-level error has to be cleared on this path too, or an IME
    // user keeps an error the ASCII typist beside them does not.
    it('clears a form-level error on the commit as well as on a keystroke', async () => {
      const onFormReset = vi.fn();
      const screen = await render(
        <MPTextField value="" label="Name" onChange={() => {}} onFormReset={onFormReset} />
      );
      const input = screen.getByRole('textbox').element() as HTMLInputElement;

      input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      await tick();

      input.value = '한';
      input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '한' }));
      await tick();

      expect(onFormReset).toHaveBeenCalled();
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
        .element(screen.getByRole('button', { name: 'Show the password' }))
        .toBeInTheDocument();
    });

    it('reveals and re-masks the value', async () => {
      const screen = await render(<MPTextField value="hunter2" type="password" label="Password" />);
      const input = screen.getByLabelText('Password', { exact: true }).element();

      await screen.getByRole('button', { name: 'Show the password' }).click();

      expect(input).toHaveAttribute('type', 'text');

      await screen.getByRole('button', { name: 'Hide the password' }).click();

      expect(input).toHaveAttribute('type', 'password');
    });

    it('leaves the caret where it was when the toggle is pressed', async () => {
      const screen = await render(<MPTextField value="hunter2" type="password" label="Password" />);
      const input = screen
        .getByLabelText('Password', { exact: true })
        .element() as HTMLInputElement;

      input.focus();
      input.setSelectionRange(3, 3);

      await screen.getByRole('button', { name: 'Show the password' }).click();

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

      expect(screen.getByRole('button', { name: 'Show the password' }).element()).toBeDisabled();
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

    it('leaves the key alone on a single-line field with no onSubmit', async () => {
      // The whole of the bug this used to be: a field with nothing to submit to
      // still ate the key, so every `<form onSubmit>` it was dropped into
      // stopped submitting and said nothing about it.
      const screen = await render(<MPTextField value="" label="Email" />);

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      screen.getByRole('textbox').element().dispatchEvent(event);
      await tick();

      expect(event.defaultPrevented).toBe(false);
    });

    it('submits the form around it natively', async () => {
      const onFormSubmit = vi.fn((event: FormEvent) => event.preventDefault());
      const screen = await render(
        <form onSubmit={onFormSubmit}>
          <MPTextField value="" label="Email" />
          <button type="submit">Go</button>
        </form>
      );

      await screen.getByRole('textbox').fill('a');
      await userEvent.keyboard('{Enter}');

      expect(onFormSubmit).toHaveBeenCalledOnce();
    });

    it('does not submit that form twice when it has an onSubmit of its own', async () => {
      const onFormSubmit = vi.fn((event: FormEvent) => event.preventDefault());
      const onSubmit = vi.fn();
      const screen = await render(
        <form onSubmit={onFormSubmit}>
          <MPTextField value="" label="Email" onSubmit={onSubmit} />
          <button type="submit">Go</button>
        </form>
      );

      await screen.getByRole('textbox').fill('a');
      await userEvent.keyboard('{Enter}');

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onFormSubmit).not.toHaveBeenCalled();
    });

    it('swallows the key on a single-line field when disableEnterKey is set', async () => {
      const onFormSubmit = vi.fn((event: FormEvent) => event.preventDefault());
      const screen = await render(
        <form onSubmit={onFormSubmit}>
          <MPTextField value="" label="Email" disableEnterKey />
          <button type="submit">Go</button>
        </form>
      );

      await screen.getByRole('textbox').fill('a');
      await userEvent.keyboard('{Enter}');

      expect(onFormSubmit).not.toHaveBeenCalled();
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

    /*
     * The Enter that commits a Korean syllable is the IME's, not the form's.
     * Both spellings are exercised because engines disagree about which one they
     * report: `isComposing` is the standard flag, `keyCode === 229` is what
     * older WebKit sends on the same keystroke.
     */
    it('ignores the Enter that commits a composition', async () => {
      const onSubmit = vi.fn();
      const screen = await render(<MPTextField value="한" label="Name" onSubmit={onSubmit} />);
      const input = screen.getByRole('textbox').element();

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        isComposing: true,
        bubbles: true,
        cancelable: true
      });
      input.dispatchEvent(event);
      await tick();

      expect(onSubmit).not.toHaveBeenCalled();
      // Not swallowed either: the browser is using this keystroke to commit the
      // syllable, and taking it away would break the composition.
      expect(event.defaultPrevented).toBe(false);
    });

    it('ignores the Enter an older engine reports as key code 229', async () => {
      const onSubmit = vi.fn();
      const screen = await render(<MPTextField value="한" label="Name" onSubmit={onSubmit} />);
      const input = screen.getByRole('textbox').element();

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: 229,
        bubbles: true,
        cancelable: true
      });
      input.dispatchEvent(event);
      await tick();

      expect(onSubmit).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('submits on the Enter that follows a committed composition', async () => {
      const onSubmit = vi.fn();
      const screen = await render(<MPTextField value="한글" label="Name" onSubmit={onSubmit} />);
      const input = screen.getByRole('textbox').element();

      input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '글' }));
      await tick();

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      input.dispatchEvent(event);
      await tick();

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('type="search"', () => {
    it('renders a search input', async () => {
      const screen = await render(<MPTextField value="" label="Find" type="search" />);

      expect(screen.getByRole('searchbox').element()).toHaveAttribute('type', 'search');
    });

    it('hides the browser’s own clear button', async () => {
      // WebKit's × sits outside the adornment row, is not in the tab order, and
      // empties a controlled value without telling React.
      const screen = await render(<MPTextField value="" label="Find" type="search" />);

      expect(screen.getByRole('searchbox').element().className).toContain(
        '[&::-webkit-search-cancel-button]:hidden'
      );
    });

    it('leaves that rule off every other type', async () => {
      const screen = await render(<MPTextField value="" label="Name" />);

      expect(screen.getByRole('textbox').element().className).not.toContain('search-cancel-button');
    });
  });

  describe('states', () => {
    it('shows an error message and marks the field invalid', async () => {
      const screen = await render(
        <MPTextField value="" label="Email" errorMessage="Not a valid address." />
      );

      await expect.element(screen.getByText('Not a valid address.')).toBeInTheDocument();
      // The whole control turns over, not only the message underneath it. The
      // state lives on the root as a data attribute, which is what the outline
      // and the label are styled from.
      expect(document.querySelector('.mp-text-field')).toHaveAttribute('data-invalid');
    });

    it('shows no helper text without an error', async () => {
      await render(<MPTextField value="" label="Email" />);

      expect(document.querySelector('.mp-text-field')).not.toHaveAttribute('data-invalid');
      expect(document.querySelector('.mp-text-field__support')).toBeNull();
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
      const root = () => screen.getByRole('textbox').element().closest('.mp-text-field')!;

      // Asserted on the resolved width rather than on a class, so it holds
      // whichever utility ends up expressing it.
      expect(getComputedStyle(root()).display).toBe('block');

      await screen.rerender(<MPTextField value="" label="Email" />);

      expect(getComputedStyle(root()).display).toBe('inline-block');
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

  /**
   * The theming chain, asserted through a rendered field rather than on the
   * stylesheet.
   *
   * Both bugs these cover failed *silently*: the field rendered, the tests
   * passed, and the colour was simply the default one. The cause each time was a
   * `var()` frozen at `:root` — first for the derived roles, then again for the
   * `--color-mp-*` names Tailwind emits from `@theme` — and the only way to
   * catch it is to resolve a colour on an element that is not the root.
   */
  describe('theming', () => {
    /** The hue of whatever colour an element actually resolved. */
    function hueOf(element: Element, property: 'color' | 'borderColor') {
      const resolved = getComputedStyle(element)[property];
      const hue = /oklch\([^)]*\s([\d.]+)\)/.exec(resolved)?.[1];

      expect(hue, `expected an oklch colour, got ${resolved}`).toBeDefined();

      return Number(hue);
    }

    const TEAL_HUE = 199.391;

    it('derives every role from one source colour', async () => {
      await render(<MPTextField value="" label="Email" />);

      // Asserted as a relationship rather than against the default's own hue:
      // what matters is that the label and the outline came out of the *same*
      // seed, which stays true when the default colour is changed. A magic
      // number here would only ever fail for that reason.
      const label = hueOf(document.querySelector('label')!, 'color');
      const outline = hueOf(document.querySelector('fieldset')!, 'borderColor');

      expect(label).toBeCloseTo(outline, 1);
    });

    it('follows a source colour set on an ancestor, not only on the root', async () => {
      await render(
        <div style={{ '--mp-source-color': '#00696d' } as React.CSSProperties}>
          <MPTextField value="" label="Email" />
        </div>
      );

      expect(hueOf(document.querySelector('label')!, 'color')).toBeCloseTo(TEAL_HUE, 1);
      expect(hueOf(document.querySelector('fieldset')!, 'borderColor')).toBeCloseTo(TEAL_HUE, 1);
    });

    it("picks up the page's own MD3 tokens", async () => {
      await render(
        <div style={{ '--md-sys-color-outline': 'rgb(1, 2, 3)' } as React.CSSProperties}>
          <MPTextField value="" label="Email" />
        </div>
      );

      // Taken as given, not derived — so it does not come back as an oklch().
      expect(getComputedStyle(document.querySelector('fieldset')!).borderColor).toBe(
        'rgb(1, 2, 3)'
      );
    });

    it('lets an explicit role beat both', async () => {
      await render(
        <div
          style={
            {
              '--mp-source-color': '#00696d',
              '--md-sys-color-outline': 'rgb(1, 2, 3)',
              '--mp-sys-color-outline': 'rgb(4, 5, 6)'
            } as React.CSSProperties
          }
        >
          <MPTextField value="" label="Email" />
        </div>
      );

      expect(getComputedStyle(document.querySelector('fieldset')!).borderColor).toBe(
        'rgb(4, 5, 6)'
      );
    });

    it('reassigns tones for the dark scheme on a subtree', async () => {
      const screen = await render(
        <div data-mp-scheme="dark">
          <MPTextField value="" label="Email" />
        </div>
      );

      // Same hue, and a lighter tone: the dark scheme is the same tonal palette
      // read further up, not a second set of colours.
      const dark = getComputedStyle(document.querySelector('label')!).color;
      const darkHue = hueOf(document.querySelector('label')!, 'color');

      await screen.rerender(
        <div data-mp-scheme="light">
          <MPTextField value="" label="Email" />
        </div>
      );

      // The label's colour is transitioned, and a colour mid-transition comes
      // back as an interpolated `oklab()` with no hue component at all. So the
      // read waits for it to settle rather than racing it.
      await settled();

      const light = getComputedStyle(document.querySelector('label')!).color;
      const lightnessOf = (value: string) => Number(/okl(?:ch|ab)\(([\d.]+)/.exec(value)![1]);

      expect(lightnessOf(dark)).toBeGreaterThan(lightnessOf(light));
      // The hue does not move with the scheme — only the tone does.
      expect(hueOf(document.querySelector('label')!, 'color')).toBeCloseTo(darkHue, 1);
    });
  });

  describe('the reveal toggle', () => {
    /*
     * A focus indicator that is only a change of colour is one a reader who
     * cannot tell those two colours apart does not have — and the two here are
     * `on-surface-variant` and `primary`, which under a monochrome theme are the
     * same ink. Every other icon button in the library draws the ring.
     */
    it('draws the library’s focus ring rather than only changing colour', async () => {
      const screen = await render(<MPTextField value="" label="Password" type="password" />);
      const toggle = screen.getByRole('button', { name: 'Show the password' }).element();

      // Tabbed to rather than focused by script: the ring is `focus-visible`,
      // and that is exactly the distinction the pseudo-class is drawing.
      screen.getByRole('textbox').element().focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(toggle);

      const ring = getComputedStyle(toggle);

      expect(ring.outlineStyle).not.toBe('none');
      expect(Number.parseFloat(ring.outlineWidth)).toBeGreaterThan(0);
    });
  });

  /*
   * The events the field does not already report as something else.
   *
   * `onChange` is the text and `onSubmit` is the plain Enter; these are the
   * keystroke itself, the focus, and the pointer — and they are on the control
   * rather than on the row, which is the half worth pinning here.
   */
  describe('the raw events', () => {
    /** One key, with whatever modifiers, dispatched the way a browser would. */
    function press(element: Element, key: string, modifiers: KeyboardEventInit = {}) {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ...modifiers
      });

      element.dispatchEvent(event);

      return event;
    }

    it('reports a keystroke, modifiers and all', async () => {
      const onKeyDown = vi.fn();
      const screen = await render(<MPTextField value="" label="Message" onKeyDown={onKeyDown} />);

      press(screen.getByRole('textbox').element(), 'Enter', { ctrlKey: true });
      await tick();

      expect(onKeyDown).toHaveBeenCalledOnce();
      expect(onKeyDown.mock.calls[0][0].key).toBe('Enter');
      expect(onKeyDown.mock.calls[0][0].ctrlKey).toBe(true);
    });

    it('lets a caller take the keystroke away from the field', async () => {
      // Ctrl+Enter sends the message; the field must not also report the plain
      // submission it would otherwise have seen on the same key.
      const onSubmit = vi.fn();
      const screen = await render(
        <MPTextField
          value=""
          label="Message"
          onSubmit={onSubmit}
          onKeyDown={(event) => {
            if (event.ctrlKey) {
              event.preventDefault();
            }
          }}
        />
      );

      press(screen.getByRole('textbox').element(), 'Enter', { ctrlKey: true });
      await tick();

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('still reports the Enter the caller left alone', async () => {
      const onSubmit = vi.fn();
      const onKeyDown = vi.fn();
      const screen = await render(
        <MPTextField value="" label="Message" onSubmit={onSubmit} onKeyDown={onKeyDown} />
      );

      press(screen.getByRole('textbox').element(), 'Enter');
      await tick();

      expect(onKeyDown).toHaveBeenCalledOnce();
      expect(onSubmit).toHaveBeenCalledOnce();
    });

    it('reports the focus the control takes, and the one it loses', async () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      const screen = await render(
        <MPTextField value="" label="Email" onFocus={onFocus} onBlur={onBlur} />
      );
      const input = screen.getByRole('textbox').element() as HTMLInputElement;

      input.focus();
      await tick();
      input.blur();
      await tick();

      expect(onFocus).toHaveBeenCalledOnce();
      expect(onBlur).toHaveBeenCalledOnce();
    });

    it('does not report the focus the reveal toggle takes', async () => {
      // On the control rather than on the row: the toggle is a button of its
      // own beside the input, and the focus it takes is not the field's.
      const onFocus = vi.fn();
      const screen = await render(
        <MPTextField value="hunter2" type="password" label="Password" onFocus={onFocus} />
      );

      (screen.getByRole('button', { name: 'Show the password' }).element() as HTMLElement).focus();
      await tick();

      expect(onFocus).not.toHaveBeenCalled();
    });

    it('reports the pointer, right-click included', async () => {
      const onClick = vi.fn();
      const onDoubleClick = vi.fn();
      const onContextMenu = vi.fn();
      const screen = await render(
        <MPTextField
          value=""
          label="Email"
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
        />
      );
      const input = screen.getByRole('textbox').element();

      input.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      input.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
      input.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
      await tick();

      expect(onClick).toHaveBeenCalledOnce();
      expect(onDoubleClick).toHaveBeenCalledOnce();
      expect(onContextMenu).toHaveBeenCalledOnce();
    });

    it('leaves the composition alone', async () => {
      // The Enter that commits a syllable is still the input method's. A caller
      // hears the keystroke — it is theirs to interpret — but the field does not
      // turn it into a submission.
      const onSubmit = vi.fn();
      const onKeyDown = vi.fn();
      const screen = await render(
        <MPTextField value="한" label="Name" onSubmit={onSubmit} onKeyDown={onKeyDown} />
      );

      press(screen.getByRole('textbox').element(), 'Enter', { isComposing: true });
      await tick();

      expect(onKeyDown).toHaveBeenCalledOnce();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('passthrough', () => {
    it('keeps caller-supplied class names and styles alongside its own', async () => {
      await render(
        <MPTextField value="" label="Email" className="my-own-class" style={{ width: '20rem' }} />
      );
      const root = document.querySelector('.mp-text-field') as HTMLElement;

      expect(root).toHaveClass('my-own-class');
      expect(root).toHaveClass('mp-text-field');
      expect(root.style.width).toBe('20rem');
    });
  });
});
