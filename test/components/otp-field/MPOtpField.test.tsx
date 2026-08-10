import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPOtpField } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/**
 * Every slot, in document order.
 *
 * Scoped to the group Base UI puts round the row: there is a seventh input
 * outside it, visually hidden, which is the one that carries the whole code into
 * a form submission.
 */
function slots() {
  return [...document.querySelectorAll('.mp-otp-field [role="group"] input')] as HTMLInputElement[];
}

function ControlledOtp(props: Record<string, unknown>) {
  const [code, setCode] = useState('');

  return (
    <>
      <MPOtpField label="Code" value={code} onValueChange={setCode} {...props} />
      <output data-testid="model">{code}</output>
    </>
  );
}

describe('MPOtpField', () => {
  describe('rendering', () => {
    it('draws six slots by default', async () => {
      await render(<MPOtpField label="Code" />);

      expect(slots()).toHaveLength(6);
    });

    it('draws as many slots as it was asked for', async () => {
      await render(<MPOtpField label="Code" length={4} />);

      expect(slots()).toHaveLength(4);
    });

    it('clamps the length to something worth splitting', async () => {
      // One box is an `MPTextField`, and past twelve the row stops fitting a
      // phone.
      const screen = await render(<MPOtpField label="Code" length={1} />);

      expect(slots()).toHaveLength(2);

      await screen.rerender(<MPOtpField label="Code" length={40} />);

      expect(slots()).toHaveLength(12);
    });

    it('puts the label above the row rather than in a notch', async () => {
      // A notched label belongs to one outlined box; a code is six of them, and
      // cutting the notch into the first would name the first digit.
      const screen = await render(<MPOtpField label="Verification code" />);

      await expect.element(screen.getByText('Verification code')).toBeInTheDocument();
      expect(document.querySelector('.mp-otp-field fieldset')).toBeNull();
    });

    it('draws a separator every groupSize slots and no more', async () => {
      await render(<MPOtpField label="Code" length={6} groupSize={3} separator="—" />);

      const separators = [
        ...document.querySelectorAll('.mp-otp-field [role="group"] [aria-hidden="true"]')
      ];

      expect(separators).toHaveLength(1);
      expect(separators[0].textContent).toBe('—');
    });
  });

  describe('typing', () => {
    it('reports the value as it is typed', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPOtpField label="Code" length={4} onValueChange={onValueChange} />
      );

      await screen.getByRole('textbox').first().fill('12');

      expect(onValueChange).toHaveBeenCalledWith('12');
    });

    it('drives a controlled parent end to end', async () => {
      const screen = await render(<ControlledOtp length={4} />);

      await screen.getByRole('textbox').first().fill('1234');

      expect(screen.getByTestId('model').element().textContent).toBe('1234');
    });

    it('fires once the last slot is filled', async () => {
      const onComplete = vi.fn();
      const screen = await render(<MPOtpField label="Code" length={4} onComplete={onComplete} />);

      await screen.getByRole('textbox').first().fill('123');
      expect(onComplete).not.toHaveBeenCalled();

      await screen.getByRole('textbox').first().fill('1234');
      expect(onComplete).toHaveBeenCalledWith('1234');
    });

    it('drops characters the charset rejects', async () => {
      const onValueInvalid = vi.fn();
      const screen = await render(
        <ControlledOtp length={4} charset="numeric" onValueInvalid={onValueInvalid} />
      );

      await screen.getByRole('textbox').first().fill('12ab');

      expect(screen.getByTestId('model').element().textContent).toBe('12');
      expect(onValueInvalid).toHaveBeenCalled();
    });

    it('accepts letters once the charset allows them', async () => {
      const screen = await render(<ControlledOtp length={4} charset="alphanumeric" />);

      await screen.getByRole('textbox').first().fill('a1b2');

      expect(screen.getByTestId('model').element().textContent).toBe('a1b2');
    });
  });

  describe('states', () => {
    it('shows an error message and marks the field invalid', async () => {
      const screen = await render(<MPOtpField label="Code" errorMessage="That code expired." />);

      await expect.element(screen.getByText('That code expired.')).toBeInTheDocument();
      expect(document.querySelector('.mp-otp-field')).toHaveAttribute('data-invalid');
    });

    it('lets the error replace the description', async () => {
      const screen = await render(
        <MPOtpField label="Code" description="Six digits." errorMessage="That code expired." />
      );

      await expect.element(screen.getByText('That code expired.')).toBeInTheDocument();
      expect(screen.getByText('Six digits.').query()).toBeNull();
    });

    it('disables every slot', async () => {
      await render(<MPOtpField label="Code" length={4} disabled />);

      expect(slots().every((slot) => slot.disabled)).toBe(true);
    });

    it('masks the characters when asked', async () => {
      await render(<MPOtpField label="Code" mask />);

      expect(slots()[0].type).toBe('password');
    });
  });

  describe('the size ladder', () => {
    it('grows monotonically, on the control heights a field is drawn at', async () => {
      const screen = await render(<MPOtpField label="Code" size="xs" />);
      const heightOf = () => slots()[0].getBoundingClientRect().height;

      expect(document.querySelector('.mp-otp-field')).toHaveAttribute('data-mp-size', 'xs');

      let previous = heightOf();

      for (const size of ['sm', 'md', 'lg', 'xl'] as MPSize[]) {
        await screen.rerender(<MPOtpField label="Code" size={size} />);

        const next = heightOf();

        expect(next, `${size} should be taller than the step below it`).toBeGreaterThan(previous);
        previous = next;
      }
    });

    it('draws a slot narrower than it is tall', async () => {
      // What makes a row read as places for one character each rather than as a
      // row of tiny fields.
      await render(<MPOtpField label="Code" />);

      const box = slots()[0].getBoundingClientRect();

      expect(box.width).toBeLessThan(box.height);
    });
  });
});
