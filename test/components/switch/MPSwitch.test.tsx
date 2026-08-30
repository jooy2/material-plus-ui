import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPSwitch } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/** Lets the thumb finish travelling before anything is measured. */
function settled() {
  const declared = getComputedStyle(document.documentElement).getPropertyValue(
    '--mp-sys-motion-duration-short4'
  );
  const ms = Number.parseFloat(declared) * (declared.trim().endsWith('ms') ? 1 : 1000);

  return new Promise((resolve) => setTimeout(resolve, (Number.isFinite(ms) ? ms : 200) + 60));
}

function ControlledSwitch({
  initial = false,
  ...props
}: {
  initial?: boolean;
  [key: string]: unknown;
}) {
  const [checked, setChecked] = useState(initial);

  return <MPSwitch checked={checked} onCheckedChange={setChecked} label="Wi-Fi" {...props} />;
}

describe('MPSwitch', () => {
  describe('rendering', () => {
    it('is announced as a switch named by its label', async () => {
      const screen = await render(<MPSwitch label="Wi-Fi" />);
      const element = screen.getByRole('switch', { name: 'Wi-Fi' }).element();

      // `role="switch"` and not `checkbox`: the difference is temporal rather
      // than visual, and this is where a screen reader is told which one it is.
      expect(element).toHaveAttribute('aria-checked', 'false');
      expect(element).toBeEnabled();
    });

    it('associates the label with the control', async () => {
      const screen = await render(<MPSwitch label="Wi-Fi" name="wifi" />);
      const label = document.querySelector('label')!;

      expect(screen.getByRole('switch').element().getAttribute('aria-labelledby')).toBe(label.id);
      expect(document.getElementById(label.getAttribute('for')!)).not.toBeNull();
    });

    it('puts the label after the track by default and before it on request', async () => {
      const screen = await render(<MPSwitch label="Wi-Fi" />);
      const order = () =>
        document
          .querySelector('.mp-switch__track')!
          .compareDocumentPosition(document.querySelector('label')!) &
        Node.DOCUMENT_POSITION_FOLLOWING;

      expect(order()).toBeTruthy();

      await screen.rerender(<MPSwitch label="Wi-Fi" labelPlacement="start" />);

      expect(order()).toBeFalsy();
    });

    it('draws the glyphs only when asked', async () => {
      const screen = await render(<MPSwitch label="Wi-Fi" />);

      expect(document.querySelectorAll('.mp-switch__thumb .mp-icon')).toHaveLength(0);

      await screen.rerender(<MPSwitch label="Wi-Fi" icons />);

      // Both are in the DOM and CSS hides one: an uncontrolled switch keeps its
      // state in the DOM, so a prop-driven choice would go stale on first click.
      expect(document.querySelectorAll('.mp-switch__thumb .mp-icon')).toHaveLength(2);
    });

    it('shows exactly one glyph, in either state', async () => {
      /*
       * Read as opacity rather than as geometry. Both glyphs are laid out, one
       * on top of the other in the middle of the thumb, because the pair
       * cross-fades — and for the length of that fade both of them are drawn.
       * Which one is *shown* is which one is opaque once it has settled.
       *
       * The thumb's own children rather than the `.mp-icon` inside them: the
       * opacity is on the wrapper, which is what a cross-fade needs so that the
       * two can be stacked.
       */
      const screen = await render(<ControlledSwitch icons />);
      const opaque = () =>
        [...document.querySelectorAll('.mp-switch__thumb > span')].filter(
          (glyph) => getComputedStyle(glyph).opacity === '1'
        ).length;

      // The state layer is the third of the thumb's children and is transparent
      // until the switch is hovered, so a settled thumb has exactly one.
      expect(opaque()).toBe(1);

      await screen.getByRole('switch').click();
      await settled();

      expect(opaque()).toBe(1);
    });
  });

  describe('flipping', () => {
    it('hands the parent a boolean rather than an event', async () => {
      const onCheckedChange = vi.fn();
      const screen = await render(<MPSwitch label="Wi-Fi" onCheckedChange={onCheckedChange} />);

      await screen.getByRole('switch').click();

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('flips end to end through a controlled parent', async () => {
      const screen = await render(<ControlledSwitch />);
      const control = () => screen.getByRole('switch').element();

      await screen.getByRole('switch').click();
      expect(control()).toHaveAttribute('aria-checked', 'true');

      await screen.getByRole('switch').click();
      expect(control()).toHaveAttribute('aria-checked', 'false');
    });

    it('flips from the label', async () => {
      const screen = await render(<ControlledSwitch />);

      await screen.getByText('Wi-Fi').click();

      expect(screen.getByRole('switch').element()).toHaveAttribute('aria-checked', 'true');
    });

    it('moves the thumb across the track and grows it', async () => {
      // The whole control, in one assertion: MD3 says "off" with a small thumb
      // adrift in a wide groove and "on" with a larger one at the far end.
      const screen = await render(<ControlledSwitch />);
      const thumb = () => document.querySelector('.mp-switch__thumb')!.getBoundingClientRect();

      const before = thumb();

      await screen.getByRole('switch').click();
      await settled();

      const after = thumb();

      expect(after.left).toBeGreaterThan(before.left);
      expect(after.width).toBeGreaterThan(before.width);
    });
  });

  describe('states', () => {
    it('shows an error message and marks the switch invalid', async () => {
      const screen = await render(<MPSwitch label="Wi-Fi" errorMessage="Turn this on first." />);

      await expect.element(screen.getByText('Turn this on first.')).toBeInTheDocument();
      expect(document.querySelector('.mp-switch')).toHaveAttribute('data-invalid');
    });

    it('shows a description until an error replaces it', async () => {
      const screen = await render(<MPSwitch label="Wi-Fi" description="Uses more battery." />);

      await expect.element(screen.getByText('Uses more battery.')).toBeInTheDocument();

      await screen.rerender(
        <MPSwitch label="Wi-Fi" description="Uses more battery." errorMessage="Not available." />
      );

      expect(screen.getByText('Uses more battery.').query()).toBeNull();
    });

    it('disables the control', async () => {
      const screen = await render(<MPSwitch label="Wi-Fi" disabled />);

      expect(screen.getByRole('switch').element()).toBeDisabled();
    });

    it('stays focusable and unchangeable when read-only', async () => {
      const onCheckedChange = vi.fn();
      const screen = await render(
        <MPSwitch label="Wi-Fi" readOnly onCheckedChange={onCheckedChange} />
      );
      const element = screen.getByRole('switch').element() as HTMLElement;

      element.focus();
      expect(document.activeElement).toBe(element);

      await screen.getByRole('switch').click();

      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('the size ladder', () => {
    it('grows the track monotonically', async () => {
      const screen = await render(<MPSwitch label="Wi-Fi" size="xs" />);
      const trackWidth = () =>
        document.querySelector('.mp-switch__track')!.getBoundingClientRect().width;

      expect(document.querySelector('.mp-switch')).toHaveAttribute('data-mp-size', 'xs');

      let previous = trackWidth();

      for (const size of ['sm', 'md', 'lg', 'xl'] as MPSize[]) {
        await screen.rerender(<MPSwitch label="Wi-Fi" size={size} />);

        const next = trackWidth();

        expect(next, `${size} should be wider than the step below it`).toBeGreaterThan(previous);
        previous = next;
      }
    });

    it('draws Material’s own 52×32 track at md', async () => {
      // The edge is an inset ring rather than a border precisely so that these
      // two numbers do not change when the switch is turned on.
      await render(<MPSwitch label="Wi-Fi" size="md" />);
      const box = document.querySelector('.mp-switch__track')!.getBoundingClientRect();

      expect(box.width).toBeCloseTo(52, 0);
      expect(box.height).toBeCloseTo(32, 0);
    });

    it('keeps the track the same size once it is on', async () => {
      const screen = await render(<ControlledSwitch />);
      const track = () => document.querySelector('.mp-switch__track')!.getBoundingClientRect();

      const before = track();

      await screen.getByRole('switch').click();
      await settled();

      expect(track().width).toBeCloseTo(before.width, 1);
      expect(track().height).toBeCloseTo(before.height, 1);
    });
  });

  describe('passthrough', () => {
    it('keeps caller-supplied class names and styles alongside its own', async () => {
      await render(
        <MPSwitch label="Wi-Fi" className="my-own-class" style={{ marginTop: '8px' }} />
      );
      const root = document.querySelector('.mp-switch') as HTMLElement;

      expect(root).toHaveClass('my-own-class');
      expect(root).toHaveClass('mp-switch');
      expect(root.style.marginTop).toBe('8px');
      expect(root.style.getPropertyValue('--_mp-accent')).not.toBe('');
    });
  });
});
