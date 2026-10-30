import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPNumberField } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

function ControlledNumberField({
  initial = 1,
  ...props
}: {
  initial?: number | null;
  [key: string]: unknown;
}) {
  const [value, setValue] = useState<number | null>(initial);

  return (
    <>
      <MPNumberField label="Quantity" value={value} onValueChange={setValue} {...props} />
      <output data-testid="model">{String(value)}</output>
    </>
  );
}

describe('MPNumberField', () => {
  describe('rendering', () => {
    it('is a text box named by its label, described as a number field', async () => {
      const screen = await render(<MPNumberField label="Quantity" defaultValue={3} />);
      const element = screen.getByRole('textbox', { name: 'Quantity' }).element();

      // `type="text"` with `inputmode="numeric"` rather than
      // `<input type="number">`. That is Base UI's call and it is the right one:
      // the native number input silently accepts text in some browsers, cannot
      // be formatted, and reports `''` for anything it fails to parse. The role
      // description is what tells a screen reader it is still a number.
      expect(element).toHaveAttribute('type', 'text');
      expect(element).toHaveAttribute('inputmode', 'numeric');
      expect(element).toHaveAttribute('aria-roledescription');
      expect(element).toBeEnabled();
      expect((element as HTMLInputElement).value).toBe('3');
    });

    it('draws the notched outline the text field wears', async () => {
      await render(<MPNumberField label="Quantity" />);

      expect(document.querySelector('.mp-number-field fieldset legend')?.textContent).toContain(
        'Quantity'
      );
    });

    it('names both steppers', async () => {
      const screen = await render(<MPNumberField label="Quantity" defaultValue={1} />);

      await expect.element(screen.getByRole('button', { name: 'Increase' })).toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: 'Decrease' })).toBeInTheDocument();
    });

    it('takes its own names for them', async () => {
      const screen = await render(
        <MPNumberField label="수량" incrementLabel="하나 늘리기" decrementLabel="하나 줄이기" />
      );

      await expect.element(screen.getByRole('button', { name: '하나 늘리기' })).toBeInTheDocument();
    });

    it('renders a placeholder and a leading adornment', async () => {
      const screen = await render(
        <MPNumberField label="Price" placeholder="0.00" startIcon={<span>$</span>} />
      );

      expect(screen.getByRole('textbox').element()).toHaveAttribute('placeholder', '0.00');
      await expect.element(screen.getByText('$', { exact: true })).toBeInTheDocument();
    });
  });

  describe('stepping', () => {
    it('hands the parent a number rather than an event', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPNumberField label="Quantity" defaultValue={1} onValueChange={onValueChange} />
      );

      await screen.getByRole('button', { name: 'Increase' }).click();

      expect(onValueChange).toHaveBeenCalledWith(2);
    });

    it('steps end to end through a controlled parent', async () => {
      const screen = await render(<ControlledNumberField initial={1} />);

      await screen.getByRole('button', { name: 'Increase' }).click();
      expect(screen.getByTestId('model').element().textContent).toBe('2');

      await screen.getByRole('button', { name: 'Decrease' }).click();
      expect(screen.getByTestId('model').element().textContent).toBe('1');
    });

    it('steps by the step it is given', async () => {
      const screen = await render(<ControlledNumberField initial={0} step={5} />);

      await screen.getByRole('button', { name: 'Increase' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('5');
    });

    it('stops at the ends of the range', async () => {
      const screen = await render(<ControlledNumberField initial={1} min={1} max={2} />);

      await screen.getByRole('button', { name: 'Increase' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('2');
      // And says so, rather than only refusing: a stepper that has run out of
      // room is disabled, which is a thing a reader can see before they press it.
      expect(screen.getByRole('button', { name: 'Increase' }).element()).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Decrease' }).element()).toBeEnabled();
    });

    it('reports the settled value separately from every change', async () => {
      const onValueCommitted = vi.fn();
      const screen = await render(
        <MPNumberField label="Quantity" defaultValue={1} onValueCommitted={onValueCommitted} />
      );

      await screen.getByRole('button', { name: 'Increase' }).click();

      expect(onValueCommitted).toHaveBeenCalledWith(2);
    });
  });

  describe('typing', () => {
    it('takes a typed number', async () => {
      const screen = await render(<ControlledNumberField initial={null} />);

      await screen.getByRole('textbox').fill('42');
      (screen.getByRole('textbox').element() as HTMLInputElement).blur();

      expect(screen.getByTestId('model').element().textContent).toBe('42');
    });

    it('writes the number the way it is asked to and still reports a plain one', async () => {
      const screen = await render(
        <MPNumberField
          label="Price"
          defaultValue={1240}
          format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        />
      );

      expect((screen.getByRole('textbox').element() as HTMLInputElement).value).toContain('1,240');

      // The value a form submits is the plain number, not the string the reader
      // is looking at — which is the whole reason `format` is a prop rather than
      // something a caller does to `value` on the way in.
      const hidden = document.querySelector(
        '.mp-number-field input[type="number"]'
      ) as HTMLInputElement;

      expect(hidden.value).toBe('1240');
    });
  });

  describe('the steppers', () => {
    it('puts both at the trailing edge by default', async () => {
      const screen = await render(<MPNumberField label="Quantity" defaultValue={1} />);
      const input = screen.getByRole('textbox').element();
      const decrease = screen.getByRole('button', { name: 'Decrease' }).element();

      expect(
        input.compareDocumentPosition(decrease) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('puts one either side of the number when split', async () => {
      const screen = await render(
        <MPNumberField label="Quantity" defaultValue={1} steppers="split" />
      );
      const input = screen.getByRole('textbox').element();
      const decrease = screen.getByRole('button', { name: 'Decrease' }).element();
      const increase = screen.getByRole('button', { name: 'Increase' }).element();

      expect(
        decrease.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      expect(
        input.compareDocumentPosition(increase) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('drops them entirely when asked, and stays a number field', async () => {
      const screen = await render(
        <MPNumberField label="Quantity" defaultValue={1} steppers="none" />
      );

      expect(screen.getByRole('button').all()).toHaveLength(0);
      await expect.element(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('drops them when the field is read-only', async () => {
      // A read-only field keeps its value and loses the buttons: leaving them
      // there disabled is two ways of saying the same thing, and the disabled one
      // looks broken.
      const screen = await render(<MPNumberField label="Quantity" defaultValue={1} readOnly />);

      expect(screen.getByRole('button').all()).toHaveLength(0);
      expect(screen.getByRole('textbox').element()).toHaveAttribute('readonly');
    });
  });

  describe('the floating label', () => {
    /** Where the label is, read off the attribute rather than off the geometry. */
    function shrunk() {
      return document.querySelector('label')!.hasAttribute('data-mp-shrunk');
    }

    it('rests the label on the field’s line while it holds no number', async () => {
      await render(<MPNumberField label="Quantity" />);

      expect(shrunk()).toBe(false);
    });

    it('starts up on a field that already holds one', async () => {
      await render(<MPNumberField label="Quantity" defaultValue={3} />);

      expect(shrunk()).toBe(true);
    });

    it('lifts it on the first digit typed into an empty field', async () => {
      const screen = await render(<MPNumberField label="Quantity" />);

      await screen.getByRole('textbox').fill('7');

      expect(shrunk()).toBe(true);
    });

    it('is pinned in the notch by split steppers', async () => {
      // The minus sits exactly where the resting label would, which is the same
      // rule a start adornment follows.
      await render(<MPNumberField label="Quantity" steppers="split" />);

      expect(shrunk()).toBe(true);
    });

    it('is pinned in the notch by floatingLabel={false}', async () => {
      await render(<MPNumberField label="Quantity" floatingLabel={false} />);

      expect(shrunk()).toBe(true);
    });
  });

  describe('states', () => {
    it('shows an error message and marks the field invalid', async () => {
      const screen = await render(
        <MPNumberField label="Quantity" errorMessage="At least one, please." />
      );

      await expect.element(screen.getByText('At least one, please.')).toBeInTheDocument();
      expect(document.querySelector('.mp-number-field')).toHaveAttribute('data-invalid');
    });

    it('lets the error replace the description', async () => {
      const screen = await render(
        <MPNumberField
          label="Quantity"
          description="Up to 20 per order."
          errorMessage="At least one, please."
        />
      );

      await expect.element(screen.getByText('At least one, please.')).toBeInTheDocument();
      expect(screen.getByText('Up to 20 per order.').query()).toBeNull();
    });

    it('disables the control and both steppers', async () => {
      const screen = await render(<MPNumberField label="Quantity" defaultValue={1} disabled />);

      expect(screen.getByRole('textbox').element()).toBeDisabled();
      expect(screen.getByRole('button').all()).toHaveLength(0);
    });
  });

  describe('the size ladder', () => {
    it('grows monotonically, on the same rungs a text field uses', async () => {
      const screen = await render(<MPNumberField label="Quantity" size="xs" />);
      const heightOf = () =>
        document.querySelector('.mp-number-field .relative > div')!.getBoundingClientRect().height;

      expect(document.querySelector('.mp-number-field')).toHaveAttribute('data-mp-size', 'xs');

      let previous = heightOf();

      for (const size of ['sm', 'md', 'lg', 'xl'] as MPSize[]) {
        await screen.rerender(<MPNumberField label="Quantity" size={size} />);

        const next = heightOf();

        expect(next, `${size} should be taller than the step below it`).toBeGreaterThan(previous);
        previous = next;
      }
    });
  });

  /*
   * The events the field does not already report as a number.
   *
   * The one worth asserting is `onBlur`, because the field's own commit hangs
   * off the same event: a handler that replaced Base UI's rather than joining
   * it would take `onValueCommitted` away, and nothing else here would notice.
   */
  describe('the raw events', () => {
    it('reports a keystroke on the input', async () => {
      const onKeyDown = vi.fn();
      const screen = await render(
        <MPNumberField label="Quantity" defaultValue={1} onKeyDown={onKeyDown} />
      );

      screen
        .getByRole('textbox')
        .element()
        .dispatchEvent(
          new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true, cancelable: true })
        );

      expect(onKeyDown).toHaveBeenCalledOnce();
      expect(onKeyDown.mock.calls[0][0].metaKey).toBe(true);
    });

    it('reports a blur without taking the commit off it', async () => {
      const onBlur = vi.fn();
      const onValueCommitted = vi.fn();
      const screen = await render(
        <MPNumberField label="Quantity" onBlur={onBlur} onValueCommitted={onValueCommitted} />
      );

      await screen.getByRole('textbox').fill('42');
      (screen.getByRole('textbox').element() as HTMLInputElement).blur();

      expect(onBlur).toHaveBeenCalledOnce();
      expect(onValueCommitted).toHaveBeenCalledWith(42);
    });
  });

  describe('passthrough', () => {
    it('keeps caller-supplied class names and styles alongside its own', async () => {
      await render(
        <MPNumberField label="Quantity" className="my-own-class" style={{ width: '20rem' }} />
      );
      const root = document.querySelector('.mp-number-field') as HTMLElement;

      expect(root).toHaveClass('my-own-class');
      expect(root).toHaveClass('mp-number-field');
      expect(root.style.width).toBe('20rem');
    });
  });
});
