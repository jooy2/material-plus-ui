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

    it('travels to a value it was not dragged to, and never while it is', async () => {
      // Two ways a slider moves, and only one of them wants a transition. A
      // keyboard step or a click on the track is a jump, and the handle should
      // go there rather than appear there. A drag is the handle being *held*,
      // and a transition would leave it trailing the pointer by its own
      // duration — the reader would be pushing a spring.
      const screen = await render(<ControlledSlider initial={40} />);
      const handle = screen.container.querySelector('.mp-slider__handle') as HTMLElement;
      const indicator = screen.container.querySelector('.mp-slider__track > *') as HTMLElement;
      const control = screen.container.querySelector('.mp-slider__control') as HTMLElement;

      // Both axes are named because Base UI places the parts with inline styles
      // and picks a different property per orientation.
      expect(getComputedStyle(handle).transitionProperty).toBe('inset-inline-start, bottom');
      expect(getComputedStyle(indicator).transitionProperty).toBe(
        'inset-inline-start, width, bottom, height'
      );
      // `short2`, not the library's usual `short4`: an arrow key held down
      // repeats faster than 200ms.
      expect(getComputedStyle(handle).transitionDuration).toBe('0.1s');

      // The jump half. An arrow key moves the value, and Base UI writes the new
      // position onto the handle's inline style in the same commit — so the
      // *declared* place changes at once and the *drawn* one lags behind it.
      // That gap is the transition, and whether it happened is what is asserted.
      //
      // Asked of the browser rather than measured, and that is the whole point.
      // Reading the handle's position straight after the key looks like it
      // answers the question and does not: the travel is 100ms wide, so a
      // runner that takes longer than that to return from the key press reads
      // the settled position and compares it against itself — `expected
      // 507.203125 to be less than 507.203125`, on the one machine in the
      // matrix slow enough to see it. A frame is not a property, which is the
      // lesson the rest of these motion tests already learned; here the
      // property is that a transition ran at all, and there is an event for it.
      const before = handle.getBoundingClientRect().x;
      let travelled = false;

      handle.addEventListener(
        'transitionrun',
        () => {
          travelled = true;
        },
        { once: true }
      );

      // The `role="slider"` element rather than the handle: Base UI puts a
      // visually hidden `<input type="range">` inside the thumb, and that is
      // what the keyboard talks to. Focusing the handle sends the key nowhere.
      await press(screen.getByRole('slider').element(), 'ArrowRight');

      // Which property it ran on is already pinned above, and the position it
      // settles at is the outcome the reader sees.
      await expect.poll(() => travelled).toBe(true);
      await expect.poll(() => handle.getBoundingClientRect().x).toBeGreaterThan(before);

      // `data-dragging` is set rather than a drag being synthesised, and that is
      // not laziness. A `pointerdown` built by hand carries a `pointerId` no
      // browser has an active pointer for, and Base UI's own slider calls
      // `setPointerCapture` with it before doing anything else — which throws
      // `NotFoundError` in Firefox and left an unhandled error in the run. It is
      // the same defect this library fixed in `MPPanes`, in code that is not
      // ours to fix.
      //
      // What is being tested is the CSS guard, and the attribute is the contract
      // it keys off. Base UI puts it on the control, the root and the thumb at
      // once — the indicator reads the control's through a named group, the
      // handle carries its own — so both are set here for the same reason.
      control.setAttribute('data-dragging', '');
      handle.setAttribute('data-dragging', '');

      expect(getComputedStyle(handle).transitionProperty).toBe('none');
      expect(getComputedStyle(indicator).transitionProperty).toBe('none');
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

  describe('the description', () => {
    /*
     * The thumb carries `role="slider"`, so it is the only element a description
     * means anything on. Drawn under the track and pointed at by nothing, it was
     * read only by somebody already walking the page in order — never at the
     * moment they are on the control it is about.
     */
    it('is wired to the thumb rather than only drawn under the track', async () => {
      const screen = await render(
        <MPSlider aria-label="Volume" description="Applies to this device only." />
      );
      const thumb = screen.getByRole('slider').element();
      const id = thumb.getAttribute('aria-describedby');

      expect(id).toBeTruthy();
      expect(document.getElementById(id!)!.textContent).toBe('Applies to this device only.');
    });

    it('leaves the thumb undescribed when there is nothing to say', async () => {
      const screen = await render(<MPSlider aria-label="Volume" />);

      expect(screen.getByRole('slider').element()).not.toHaveAttribute('aria-describedby');
    });
  });
});
