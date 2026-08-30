import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPRadio, MPRadioGroup } from 'material-plus-ui';

/** Three options and somewhere to keep the answer. */
function ControlledGroup({ initial = '', ...props }: { initial?: string; [key: string]: unknown }) {
  const [value, setValue] = useState(initial);

  return (
    <>
      <MPRadioGroup label="Delivery" value={value} onValueChange={setValue} {...props}>
        <MPRadio value="standard" label="Standard" />
        <MPRadio value="express" label="Express" />
        <MPRadio value="pickup" label="Pick up" />
      </MPRadioGroup>
      <output data-testid="model">{value}</output>
    </>
  );
}

describe('MPRadioGroup', () => {
  describe('rendering', () => {
    it('is announced as a radio group named by its label', async () => {
      const screen = await render(
        <MPRadioGroup label="Delivery">
          <MPRadio value="standard" label="Standard" />
        </MPRadioGroup>
      );

      await expect
        .element(screen.getByRole('radiogroup', { name: 'Delivery' }))
        .toBeInTheDocument();
    });

    it('renders one radio per option, each named by its own label', async () => {
      const screen = await render(<ControlledGroup />);

      expect(screen.getByRole('radio').all()).toHaveLength(3);
      await expect.element(screen.getByRole('radio', { name: 'Express' })).toBeInTheDocument();
    });

    it('keeps the label outside the group', async () => {
      // Anything inside `role="radiogroup"` that is not a radio is content a
      // screen reader has to walk past to reach the next option.
      const screen = await render(<ControlledGroup />);
      const group = screen.getByRole('radiogroup').element();

      expect(group.textContent).not.toContain('Delivery');
    });

    it('stacks vertically by default and can run across', async () => {
      const screen = await render(<ControlledGroup />);
      const root = () => document.querySelector('.mp-radio-group')!;

      expect(root()).toHaveAttribute('data-mp-orientation', 'vertical');

      await screen.rerender(<ControlledGroup orientation="horizontal" />);

      expect(root()).toHaveAttribute('data-mp-orientation', 'horizontal');
      expect(getComputedStyle(screen.getByRole('radiogroup').element()).flexDirection).toBe('row');
    });
  });

  describe('choosing', () => {
    it('hands the parent the chosen value rather than an event', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPRadioGroup label="Delivery" onValueChange={onValueChange}>
          <MPRadio value="express" label="Express" />
        </MPRadioGroup>
      );

      await screen.getByRole('radio', { name: 'Express' }).click();

      expect(onValueChange).toHaveBeenCalledWith('express');
    });

    it('moves the choice end to end through a controlled parent', async () => {
      const screen = await render(<ControlledGroup initial="standard" />);

      await screen.getByRole('radio', { name: 'Express' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('express');
      expect(screen.getByRole('radio', { name: 'Express' }).element()).toHaveAttribute(
        'aria-checked',
        'true'
      );
      expect(screen.getByRole('radio', { name: 'Standard' }).element()).toHaveAttribute(
        'aria-checked',
        'false'
      );
    });

    it('chooses from the label', async () => {
      const screen = await render(<ControlledGroup />);

      await screen.getByText('Pick up').click();

      expect(screen.getByTestId('model').element().textContent).toBe('pickup');
    });

    it('takes one tab stop for the whole set', async () => {
      // The ARIA pattern the group exists to implement: the set is one stop and
      // the arrow keys move inside it, rather than three stops in a row.
      const screen = await render(<ControlledGroup initial="express" />);
      const stops = screen
        .getByRole('radio')
        .all()
        .map((radio) => (radio.element() as HTMLElement).tabIndex);

      expect(stops.filter((index) => index === 0)).toHaveLength(1);
    });

    it('grows the dot in and lets it play back out', async () => {
      // Scoped to one radio: an unchosen one has no indicator at all, so a
      // query across the set would answer with somebody else's state layer.
      //
      // Asserted as the transition plus the delayed unmount rather than as a
      // sampled frame — see the checkbox suite for why a starting style is not
      // a thing to read back.
      const screen = await render(<ControlledGroup initial="express" />);
      const dot = () =>
        screen
          .getByRole('radio', { name: 'Express' })
          .element()
          .querySelector('span:not([aria-hidden])');

      expect(getComputedStyle(dot()!).transitionProperty).toBe('opacity, scale');
      expect(getComputedStyle(dot()!).transitionDuration).toBe('0.2s');

      await screen.getByText('Standard').click();

      expect(dot()).not.toBeNull();
      await expect.poll(dot).toBeNull();
    });
  });

  describe('states', () => {
    it('shows an error message and marks the group invalid', async () => {
      const screen = await render(<ControlledGroup errorMessage="Choose one." />);

      await expect.element(screen.getByText('Choose one.')).toBeInTheDocument();
      expect(document.querySelector('.mp-radio-group')).toHaveAttribute('data-invalid');
    });

    it('lets the error replace the description', async () => {
      const screen = await render(
        <ControlledGroup description="Arrives in 3 days." errorMessage="Choose one." />
      );

      await expect.element(screen.getByText('Choose one.')).toBeInTheDocument();
      expect(screen.getByText('Arrives in 3 days.').query()).toBeNull();
    });

    it('disables every option at once', async () => {
      const screen = await render(<ControlledGroup disabled />);

      for (const radio of screen.getByRole('radio').all()) {
        expect(radio.element()).toBeDisabled();
      }
    });

    it('disables one option without touching the rest', async () => {
      const screen = await render(
        <MPRadioGroup label="Delivery">
          <MPRadio value="standard" label="Standard" />
          <MPRadio value="express" label="Express" disabled />
        </MPRadioGroup>
      );

      expect(screen.getByRole('radio', { name: 'Standard' }).element()).toBeEnabled();
      expect(screen.getByRole('radio', { name: 'Express' }).element()).toBeDisabled();
    });

    it('shows the choice without letting it change when read-only', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPRadioGroup
          label="Delivery"
          defaultValue="standard"
          readOnly
          onValueChange={onValueChange}
        >
          <MPRadio value="standard" label="Standard" />
          <MPRadio value="express" label="Express" />
        </MPRadioGroup>
      );

      await screen.getByRole('radio', { name: 'Express' }).click();

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole('radio', { name: 'Standard' }).element()).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });
  });

  describe('the size ladder', () => {
    it('sets the size once for every option in the set', async () => {
      const screen = await render(<ControlledGroup size="xs" />);
      const dotWidth = () =>
        document.querySelector('.mp-radio__dot')!.getBoundingClientRect().width;

      expect(document.querySelector('.mp-radio-group')).toHaveAttribute('data-mp-size', 'xs');

      const small = dotWidth();

      await screen.rerender(<ControlledGroup size="xl" />);

      expect(dotWidth()).toBeGreaterThan(small);
    });

    it('keeps the ring inside the circle', async () => {
      await render(<ControlledGroup size="md" />);

      expect(document.querySelector('.mp-radio__dot')!.getBoundingClientRect().width).toBeCloseTo(
        20,
        0
      );
    });
  });

  describe('passthrough', () => {
    it('keeps caller-supplied class names and styles alongside its own', async () => {
      await render(
        <MPRadioGroup label="Delivery" className="my-own-group" style={{ marginTop: '8px' }}>
          <MPRadio value="standard" label="Standard" className="my-own-option" />
        </MPRadioGroup>
      );
      const group = document.querySelector('.mp-radio-group') as HTMLElement;
      const option = document.querySelector('.mp-radio') as HTMLElement;

      expect(group).toHaveClass('my-own-group');
      expect(group.style.marginTop).toBe('8px');
      expect(group.style.getPropertyValue('--_mp-accent')).not.toBe('');
      // The option takes its own, and the group's does not leak onto it.
      expect(option).toHaveClass('my-own-option');
      expect(option).not.toHaveClass('my-own-group');
    });
  });
});
