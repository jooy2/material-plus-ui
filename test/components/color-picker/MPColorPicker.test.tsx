import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPColorPicker } from 'material-plus-ui';

function Controlled({ initial = '#ff0000', ...props }: Record<string, unknown>) {
  const [value, setValue] = useState(initial as string);

  return (
    <>
      <MPColorPicker label="Tag colour" value={value} onValueChange={setValue} {...props} />
      <output data-testid="model">{value}</output>
    </>
  );
}

describe('MPColorPicker', () => {
  describe('the trigger', () => {
    it('renders a button named by the label in the notch', async () => {
      const screen = await render(<Controlled />);

      await expect.element(screen.getByRole('button', { name: 'Tag colour' })).toBeInTheDocument();
    });

    it('draws the notched outline the text field wears', async () => {
      await render(<Controlled />);

      expect(document.querySelector('.mp-color-picker fieldset legend')?.textContent).toContain(
        'Tag colour'
      );
    });

    it('shows the value written in the format it was asked for', async () => {
      const screen = await render(<Controlled initial="#ff0000" format="rgb" />);

      expect(screen.getByRole('button', { name: 'Tag colour' }).element().textContent).toContain(
        'rgb(255, 0, 0)'
      );
    });

    it('says so when there is no colour at all', async () => {
      // With the label pinned in the notch there is nothing standing in the
      // empty state's way. A floating label rests in exactly that spot and holds
      // it back until it has risen — covered in the floating label suite below.
      const screen = await render(<Controlled initial="" floatingLabel={false} />);

      expect(screen.getByRole('button', { name: 'Tag colour' }).element().textContent).toContain(
        'No colour'
      );
    });
  });

  describe('the floating label', () => {
    /** Where the label is, read off the attribute rather than off the geometry. */
    function shrunk() {
      return document.querySelector('label')!.hasAttribute('data-mp-shrunk');
    }

    /** The swatch, which is drawn only while there is a colour to draw. */
    function swatch() {
      return document.querySelector('.mp-color-picker button [style*="background"]');
    }

    it('rests the label on the trigger’s line while there is no colour', async () => {
      await render(<Controlled initial="" />);

      expect(shrunk()).toBe(false);
    });

    it('takes the swatch down with the resting label', async () => {
      // The swatch is the value drawn rather than an affordance: with nothing
      // chosen it is an empty ring, so it gives its place up to the label. It is
      // the one leading mark in the library that does.
      await render(<Controlled initial="" />);

      expect(swatch()).toBeNull();
    });

    it('brings both back once there is a colour', async () => {
      await render(<Controlled initial="#ff0000" />);

      expect(shrunk()).toBe(true);
      expect(swatch()).not.toBeNull();
    });

    it('is pinned in the notch by floatingLabel={false}, swatch and all', async () => {
      await render(<Controlled initial="" floatingLabel={false} />);

      expect(shrunk()).toBe(true);
      expect(swatch()).not.toBeNull();
    });
  });

  describe('the panel', () => {
    it('is not on the page until the trigger is pressed', async () => {
      const screen = await render(<Controlled />);

      expect(screen.getByRole('slider', { name: 'Hue' }).query()).toBeNull();
    });

    it('opens with a square and a hue rail', async () => {
      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Tag colour' }).click();

      await expect
        .element(screen.getByRole('slider', { name: 'Saturation and brightness' }))
        .toBeInTheDocument();
      await expect.element(screen.getByRole('slider', { name: 'Hue' })).toBeInTheDocument();
    });

    it('draws no opacity rail unless alpha is on', async () => {
      const screen = await render(<Controlled inline />);

      await expect.element(screen.getByRole('slider', { name: 'Hue' })).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: 'Opacity' }).query()).toBeNull();
    });

    it('draws one once it is', async () => {
      const screen = await render(<Controlled inline alpha />);

      await expect.element(screen.getByRole('slider', { name: 'Opacity' })).toBeInTheDocument();
    });

    it('is drawn in the page with no trigger at all when inline', async () => {
      const screen = await render(<Controlled inline />);

      expect(screen.getByRole('button', { name: 'Tag colour' }).query()).toBeNull();
      await expect.element(screen.getByRole('slider', { name: 'Hue' })).toBeInTheDocument();
    });

    it('takes accessible names of the caller’s own', async () => {
      const screen = await render(<Controlled inline labels={{ hue: '색조' }} />);

      await expect.element(screen.getByRole('slider', { name: '색조' })).toBeInTheDocument();
    });
  });

  describe('changing the colour', () => {
    it('moves the hue with the arrow keys and hands back a new value', async () => {
      const onValueChange = vi.fn();
      const screen = await render(<Controlled inline onValueChange={onValueChange} />);

      await screen.getByRole('slider', { name: 'Hue' }).click();
      await screen
        .getByRole('slider', { name: 'Hue' })
        .element()
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

      expect(onValueChange).toHaveBeenCalled();
      expect(onValueChange.mock.calls[0][0]).not.toBe('#ff0000');
    });

    it('keeps the hue when the colour is dragged to black', async () => {
      // The whole reason the model is HSV and never leaves it: through RGB every
      // shade of black is the same colour, and the rail would snap to red.
      const screen = await render(<Controlled initial="#0000ff" inline />);
      const hue = screen.getByRole('slider', { name: 'Hue' }).element();
      const before = hue.getAttribute('aria-valuenow');

      const area = screen.getByRole('slider', { name: 'Saturation and brightness' }).element();

      // Shift steps by ten, so eleven presses take the brightness from 100 to 0.
      // Awaited one at a time on purpose: React batches, and a synchronous loop
      // would have every handler read the same stale state and apply one step.
      for (let step = 0; step < 11; step += 1) {
        area.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown', shiftKey: true, bubbles: true })
        );
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      expect(screen.getByTestId('model').element().textContent).toBe('#000000');
      expect(hue.getAttribute('aria-valuenow')).toBe(before);
    });

    it('takes a colour from a swatch', async () => {
      const screen = await render(<Controlled inline swatches={['#ff0000', '#00ff00']} />);

      await screen.getByRole('button', { name: '#00ff00' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('#00ff00');
    });

    it('marks the swatch that is currently chosen', async () => {
      const screen = await render(
        <Controlled initial="#00ff00" inline swatches={['#ff0000', '#00ff00']} />
      );

      expect(screen.getByRole('button', { name: '#00ff00' }).element()).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(screen.getByRole('button', { name: '#ff0000' }).element()).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });

    it('fades the tick between swatches rather than jumping it', async () => {
      // Choosing a swatch does not change the swatch, so the mark moving is the
      // whole of the feedback. It is drawn on every swatch and transparent on
      // all but the chosen one — a mark that is not in the DOM has nothing to
      // fade from, and there is nothing to hide either way, since a swatch is
      // named by its colour rather than by its state.
      const screen = await render(
        <Controlled initial="#00ff00" inline swatches={['#ff0000', '#00ff00']} />
      );
      const tick = (name: string) =>
        getComputedStyle(
          screen.getByRole('button', { name }).element().querySelector('span[aria-hidden]')!
        );

      expect(tick('#00ff00').opacity).toBe('1');
      expect(tick('#ff0000').opacity).toBe('0');
      expect(tick('#ff0000').transitionProperty).toBe('opacity');

      await screen.getByRole('button', { name: '#ff0000' }).click();

      await expect.poll(() => tick('#ff0000').opacity).toBe('1');
      await expect.poll(() => tick('#00ff00').opacity).toBe('0');
    });

    it('accepts a value typed into the field', async () => {
      const screen = await render(<Controlled inline />);

      await screen.getByRole('textbox', { name: 'Colour value' }).fill('#00ff00');

      expect(screen.getByTestId('model').element().textContent).toBe('#00ff00');
    });

    it('leaves the panel where it was for text that is not a colour', async () => {
      const screen = await render(<Controlled inline />);
      const hue = screen.getByRole('slider', { name: 'Hue' }).element();
      const before = hue.getAttribute('aria-valuenow');

      await screen.getByRole('textbox', { name: 'Colour value' }).fill('not a colour');

      expect(hue.getAttribute('aria-valuenow')).toBe(before);
    });
  });

  describe('the value that comes back out', () => {
    it('is hex by default', async () => {
      const screen = await render(<Controlled inline swatches={['#123456']} />);

      await screen.getByRole('button', { name: '#123456' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('#123456');
    });

    it('is written in whichever notation was asked for', async () => {
      const screen = await render(<Controlled inline format="hsl" swatches={['#ff0000']} />);

      await screen.getByRole('button', { name: '#ff0000' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('hsl(0, 100%, 50%)');
    });

    it('drops the fourth channel for a caller who never turned alpha on', async () => {
      const screen = await render(<Controlled inline format="rgb" swatches={['#ff0000']} />);

      await screen.getByRole('button', { name: '#ff0000' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('rgb(255, 0, 0)');
    });
  });

  describe('states', () => {
    it('shows an error message and marks the picker invalid', async () => {
      const screen = await render(<Controlled errorMessage="Pick a colour." />);

      await expect.element(screen.getByText('Pick a colour.')).toBeInTheDocument();
      expect(document.querySelector('.mp-color-picker')).toHaveAttribute('data-invalid');
    });

    it('disables the trigger', async () => {
      const screen = await render(<Controlled disabled />);

      expect(screen.getByRole('button', { name: 'Tag colour' }).element()).toBeDisabled();
    });

    it('takes no input at all while it is read-only', async () => {
      const screen = await render(<Controlled inline readOnly />);

      expect(screen.getByRole('slider', { name: 'Hue' }).element()).toHaveAttribute(
        'aria-disabled',
        'true'
      );
      expect(screen.getByRole('textbox', { name: 'Colour value' }).element()).toHaveAttribute(
        'readonly'
      );
    });

    it('empties the control from its clear button', async () => {
      const screen = await render(<Controlled clearable />);

      await screen.getByRole('button', { name: 'Clear' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('');
    });

    it('submits under the name it was given', async () => {
      await render(<Controlled name="tag" initial="#ff0000" />);

      const hidden = document.querySelector('input[name="tag"]') as HTMLInputElement;

      expect(hidden.value).toBe('#ff0000');
    });
  });
});
