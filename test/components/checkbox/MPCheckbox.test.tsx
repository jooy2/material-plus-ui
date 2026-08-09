import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPCheckbox } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/** A box that holds what it is given. */
function ControlledCheckbox({
  initial = false,
  ...props
}: {
  initial?: boolean;
  [key: string]: unknown;
}) {
  const [checked, setChecked] = useState(initial);

  return <MPCheckbox checked={checked} onCheckedChange={setChecked} label="Agree" {...props} />;
}

describe('MPCheckbox', () => {
  describe('rendering', () => {
    it('is announced as a checkbox with its label as the name', async () => {
      const screen = await render(<MPCheckbox label="Remember me" />);
      const element = screen.getByRole('checkbox', { name: 'Remember me' }).element();

      expect(element).toBeEnabled();
      expect(element).toHaveAttribute('aria-checked', 'false');
    });

    it('associates the label with the control', async () => {
      const screen = await render(<MPCheckbox label="Remember me" name="remember" />);
      const label = document.querySelector('label')!;
      const control = screen.getByRole('checkbox').element();

      // Two halves, and Base UI wires both. What you see and press is a span with
      // `role="checkbox"`, named by the label through `aria-labelledby`; the
      // label's own `for` points at the hidden input that carries the value into
      // a form, which is what makes clicking the words tick the box.
      expect(control.getAttribute('aria-labelledby')).toBe(label.id);
      expect(document.getElementById(label.getAttribute('for')!)).not.toBeNull();
    });

    it('puts an explicit id on the form control', async () => {
      await render(<MPCheckbox label="Remember me" id="my-own-id" />);

      expect((document.getElementById('my-own-id') as HTMLInputElement | null)?.type).toBe(
        'checkbox'
      );
    });

    it('gives two unnamed boxes different ids', async () => {
      const screen = await render(
        <>
          <MPCheckbox label="First" />
          <MPCheckbox label="Second" />
        </>
      );

      expect(screen.getByRole('checkbox', { name: 'First' }).element().id).not.toBe(
        screen.getByRole('checkbox', { name: 'Second' }).element().id
      );
    });

    it('renders without a label', async () => {
      const screen = await render(<MPCheckbox aria-label="Bare" />);

      expect(document.querySelector('label')).toBeNull();
      await expect.element(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('submits a name and a value', async () => {
      await render(<MPCheckbox label="Agree" name="agree" value="yes" defaultChecked />);
      const input = document.querySelector('input[type="checkbox"]') as HTMLInputElement;

      expect(input).not.toBeNull();
      expect(input.name).toBe('agree');
      expect(input.value).toBe('yes');
    });
  });

  describe('ticking', () => {
    it('hands the parent a boolean rather than an event', async () => {
      const onCheckedChange = vi.fn();
      const screen = await render(<MPCheckbox label="Agree" onCheckedChange={onCheckedChange} />);

      await screen.getByRole('checkbox').click();

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('ticks and unticks end to end through a controlled parent', async () => {
      const screen = await render(<ControlledCheckbox />);
      const box = () => screen.getByRole('checkbox').element();

      await screen.getByRole('checkbox').click();
      expect(box()).toHaveAttribute('aria-checked', 'true');

      await screen.getByRole('checkbox').click();
      expect(box()).toHaveAttribute('aria-checked', 'false');
    });

    it('ticks from the label', async () => {
      const screen = await render(<ControlledCheckbox />);

      await screen.getByText('Agree').click();

      expect(screen.getByRole('checkbox').element()).toHaveAttribute('aria-checked', 'true');
    });

    it('starts ticked when asked, without being controlled', async () => {
      const screen = await render(<MPCheckbox label="Agree" defaultChecked />);

      expect(screen.getByRole('checkbox').element()).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('the third state', () => {
    it('announces itself as mixed', async () => {
      const screen = await render(<MPCheckbox label="All" indeterminate />);

      expect(screen.getByRole('checkbox').element()).toHaveAttribute('aria-checked', 'mixed');
    });

    it('draws a different mark from a ticked box', async () => {
      // Asserted as "not the same drawing" rather than against a particular
      // path: which glyph a dash *is* belongs to the icon set, and the thing
      // that would actually be a bug is the two states looking identical.
      await render(
        <>
          <MPCheckbox label="Ticked" defaultChecked />
          <MPCheckbox label="Mixed" indeterminate />
        </>
      );

      const [ticked, mixed] = [...document.querySelectorAll('.mp-checkbox__tick svg')].map(
        (mark) => mark.innerHTML
      );

      expect(mixed).not.toBe('');
      expect(mixed).not.toBe(ticked);
    });
  });

  describe('states', () => {
    it('shows an error message and marks the checkbox invalid', async () => {
      const screen = await render(<MPCheckbox label="Agree" errorMessage="You have to agree." />);

      await expect.element(screen.getByText('You have to agree.')).toBeInTheDocument();
      expect(document.querySelector('.mp-checkbox')).toHaveAttribute('data-invalid');
    });

    it('lets the error replace the description rather than stack under it', async () => {
      const screen = await render(
        <MPCheckbox label="Agree" description="Required to continue." errorMessage="Not yet." />
      );

      await expect.element(screen.getByText('Not yet.')).toBeInTheDocument();
      expect(screen.getByText('Required to continue.').query()).toBeNull();
    });

    it('shows the description when there is no error', async () => {
      const screen = await render(<MPCheckbox label="Agree" description="Required to continue." />);

      await expect.element(screen.getByText('Required to continue.')).toBeInTheDocument();
    });

    it('disables the control', async () => {
      const screen = await render(<MPCheckbox label="Agree" disabled />);

      expect(screen.getByRole('checkbox').element()).toBeDisabled();
    });

    it('stays focusable and unchangeable when read-only', async () => {
      const onCheckedChange = vi.fn();
      const screen = await render(
        <MPCheckbox label="Agree" readOnly onCheckedChange={onCheckedChange} />
      );
      const element = screen.getByRole('checkbox').element() as HTMLElement;

      element.focus();
      expect(document.activeElement).toBe(element);

      await screen.getByRole('checkbox').click();

      expect(onCheckedChange).not.toHaveBeenCalled();
      expect(element).toHaveAttribute('aria-checked', 'false');
    });

    it('marks the checkbox required', async () => {
      const screen = await render(<MPCheckbox label="Agree" required />);

      expect(screen.getByRole('checkbox').element()).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('the size ladder', () => {
    it('publishes the rung in use and grows the tick with it', async () => {
      const screen = await render(<MPCheckbox label="Agree" size="xs" />);
      const root = () => document.querySelector('.mp-checkbox')!;
      const tickWidth = () =>
        document.querySelector('.mp-checkbox__tick')!.getBoundingClientRect().width;

      expect(root()).toHaveAttribute('data-mp-size', 'xs');

      let previous = tickWidth();

      for (const size of ['sm', 'md', 'lg', 'xl'] as MPSize[]) {
        await screen.rerender(<MPCheckbox label="Agree" size={size} />);

        const next = tickWidth();

        expect(next, `${size} should be bigger than the step below it`).toBeGreaterThan(previous);
        previous = next;
      }
    });

    it('keeps the border inside the box', async () => {
      // With no page reset the library ships, a 2px border on an 18px box is
      // added *outside* it unless the tick says `box-border` — and every rung of
      // the ladder comes out four pixels wide.
      await render(<MPCheckbox label="Agree" size="md" />);

      expect(
        document.querySelector('.mp-checkbox__tick')!.getBoundingClientRect().width
      ).toBeCloseTo(18, 0);
    });
  });
});
