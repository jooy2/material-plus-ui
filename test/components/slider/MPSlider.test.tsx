import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { MPSlider } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

function ControlledSlider({
  initial = 40,
  ...props
}: {
  initial?: number;
  [key: string]: unknown;
}) {
  const [value, setValue] = useState<number | number[]>(initial);

  return (
    <>
      <MPSlider label="Volume" value={value} onValueChange={setValue} {...props} />
      <output data-testid="model">{String(value)}</output>
    </>
  );
}

/**
 * Presses a key on the handle the way a reader with no pointer would.
 *
 * Driven through the browser rather than by dispatching a `KeyboardEvent`: a
 * synthetic event reaches React's handler whatever the element's state, so a
 * hand-dispatched key would move a *disabled* slider and the test asserting it
 * does not would pass by accident.
 */
async function press(element: Element, key: string) {
  (element as HTMLElement).focus();
  await userEvent.keyboard(`{${key}}`);
}

describe('MPSlider', () => {
  describe('rendering', () => {
    it('is announced as a slider with its range and value', async () => {
      const screen = await render(<MPSlider label="Volume" defaultValue={40} />);
      const element = screen.getByRole('slider', { name: 'Volume' }).element();

      // The thumb is a real `<input type="range">`, so the range is the native
      // `min`/`max` rather than the ARIA pair — which is the better version of
      // both: an assistive technology reads the same numbers a form does.
      expect(element).toHaveAttribute('aria-valuenow', '40');
      expect(element).toHaveAttribute('min', '0');
      expect(element).toHaveAttribute('max', '100');
    });

    it('takes an accessible name with no visible label', async () => {
      const screen = await render(<MPSlider aria-label="Volume" defaultValue={40} />);

      await expect.element(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
    });

    it('takes its own range', async () => {
      const screen = await render(
        <MPSlider label="Year" min={2000} max={2030} defaultValue={2020} />
      );
      const element = screen.getByRole('slider').element();

      expect(element).toHaveAttribute('min', '2000');
      expect(element).toHaveAttribute('max', '2030');
    });

    it('grows one handle per value, which is what makes it a range', async () => {
      // There is no `range` prop: the shape of the value already says which one
      // this is.
      const screen = await render(<MPSlider label="Price" defaultValue={[20, 80]} />);

      expect(screen.getByRole('slider').all()).toHaveLength(2);
    });

    it('shows the value only when asked', async () => {
      const screen = await render(<MPSlider label="Volume" defaultValue={40} />);

      expect(screen.getByText('40', { exact: true }).query()).toBeNull();

      await screen.rerender(<MPSlider label="Volume" defaultValue={40} showValue />);

      await expect.element(screen.getByText('40', { exact: true })).toBeInTheDocument();
    });

    it('writes the readout the way it is asked to', async () => {
      const screen = await render(
        <MPSlider
          label="Budget"
          defaultValue={40}
          showValue
          format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        />
      );

      await expect.element(screen.getByText('$40', { exact: true })).toBeInTheDocument();
    });

    it('renders a description under the track', async () => {
      const screen = await render(
        <MPSlider label="Volume" defaultValue={40} description="Applies to alerts too." />
      );

      await expect.element(screen.getByText('Applies to alerts too.')).toBeInTheDocument();
    });
  });

  describe('moving', () => {
    it('steps with the arrow keys', async () => {
      const screen = await render(<ControlledSlider initial={40} />);

      await press(screen.getByRole('slider').element(), 'ArrowRight');

      expect(screen.getByTestId('model').element().textContent).toBe('41');
    });

    it('steps by the step it is given', async () => {
      const screen = await render(<ControlledSlider initial={40} step={5} />);

      await press(screen.getByRole('slider').element(), 'ArrowRight');

      expect(screen.getByTestId('model').element().textContent).toBe('45');
    });

    it('stops at the ends of the range', async () => {
      const screen = await render(<ControlledSlider initial={100} />);

      await press(screen.getByRole('slider').element(), 'ArrowRight');

      expect(screen.getByTestId('model').element().textContent).toBe('100');
    });

    it('reports the move as it happens and again once it settles', async () => {
      const onValueChange = vi.fn();
      const onValueCommitted = vi.fn();
      const screen = await render(
        <MPSlider
          label="Volume"
          defaultValue={40}
          onValueChange={onValueChange}
          onValueCommitted={onValueCommitted}
        />
      );

      await press(screen.getByRole('slider').element(), 'ArrowRight');

      expect(onValueChange).toHaveBeenCalledWith(41);
      // The keyboard commits on every press: there is no drag to end.
      expect(onValueCommitted).toHaveBeenCalledWith(41);
    });
  });

  describe('states', () => {
    it('disables the control', async () => {
      const screen = await render(<MPSlider label="Volume" defaultValue={40} disabled />);

      expect(screen.getByRole('slider').element()).toBeDisabled();
    });

    it('does not move when disabled', async () => {
      const screen = await render(<ControlledSlider initial={40} disabled />);

      await press(screen.getByRole('slider').element(), 'ArrowRight');

      expect(screen.getByTestId('model').element().textContent).toBe('40');
    });
  });

  describe('the size ladder', () => {
    it('grows the handle monotonically', async () => {
      const screen = await render(<MPSlider label="Volume" defaultValue={40} size="xs" />);
      const handleWidth = () =>
        document.querySelector('.mp-slider__handle')!.getBoundingClientRect().width;

      expect(document.querySelector('.mp-slider')).toHaveAttribute('data-mp-size', 'xs');

      let previous = handleWidth();

      for (const size of ['sm', 'md', 'lg', 'xl'] as MPSize[]) {
        await screen.rerender(<MPSlider label="Volume" defaultValue={40} size={size} />);

        const next = handleWidth();

        expect(next, `${size} should be bigger than the step below it`).toBeGreaterThan(previous);
        previous = next;
      }
    });

    it('keeps the pressable strip much taller than the rail', async () => {
      // Base UI moves the value to wherever the control is pressed, so the strip
      // has to be as tall as a finger rather than as tall as a 4px rail.
      await render(<MPSlider label="Volume" defaultValue={40} size="md" />);

      const strip = document.querySelector('.mp-slider__control')!.getBoundingClientRect();
      const rail = document.querySelector('.mp-slider__track')!.getBoundingClientRect();

      expect(strip.height).toBeGreaterThanOrEqual(32);
      expect(strip.height).toBeGreaterThan(rail.height * 4);
    });
  });
});
