import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPStep, MPStepper } from 'material-plus-ui';

function Three(props: Record<string, unknown> = {}) {
  return (
    <MPStepper {...props}>
      <MPStep label="Account">
        <span data-testid="panel">Account panel</span>
      </MPStep>
      <MPStep label="Payment">
        <span data-testid="panel">Payment panel</span>
      </MPStep>
      <MPStep label="Done">
        <span data-testid="panel">Done panel</span>
      </MPStep>
    </MPStepper>
  );
}

function Driven({ initial = 0, ...props }: { initial?: number } & Record<string, unknown>) {
  const [step, setStep] = useState(initial);

  return (
    <>
      <Three active={step} onActiveChange={setStep} {...props} />
      <output data-testid="active">{step}</output>
      <button type="button" onClick={() => setStep((n) => n + 1)}>
        next
      </button>
    </>
  );
}

describe('MPStepper', () => {
  describe('the rail', () => {
    it('is a list, whether or not the steps are pressable', async () => {
      const screen = await render(<Three />);

      await expect.element(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.container.querySelectorAll('li')).toHaveLength(3);
    });

    it('numbers the steps as it walks them', async () => {
      const screen = await render(<Three />);
      const bullets = [...screen.container.querySelectorAll('.mp-stepper__step span[aria-hidden]')];

      // The first is the connector on step one; the numbers are the ones with
      // text in them.
      const numbered = bullets.filter((b) => /^[123]$/.test(b.textContent ?? ''));
      expect(numbered.map((b) => b.textContent)).toEqual(['1', '2', '3']);
    });

    it('marks the active step with `aria-current`', async () => {
      const screen = await render(<Three active={1} />);
      const items = [...screen.container.querySelectorAll('li')];

      expect(items.map((li) => li.getAttribute('aria-current'))).toEqual([null, 'step', null]);
    });

    it('draws a tick on a completed step instead of its number', async () => {
      const screen = await render(<Three active={2} />);
      const first = screen.container.querySelector('li') as HTMLElement;

      expect(first.textContent).not.toContain('1');
      expect(first.querySelector('svg')).not.toBeNull();
    });

    it('draws no connector after the last step', async () => {
      // Its line would run off the end of the sequence into nothing.
      const screen = await render(<Three />);
      const items = [...screen.container.querySelectorAll('li')];
      const lines = items.map((li) => li.querySelectorAll('span.absolute').length);

      expect(lines[2]).toBe(0);
      expect(lines[0]).toBeGreaterThan(0);
    });
  });

  describe('the panel', () => {
    it('draws only the active step', async () => {
      const screen = await render(<Three active={1} />);

      expect(screen.container.querySelectorAll('[data-testid="panel"]')).toHaveLength(1);
      expect(screen.getByTestId('panel').element().textContent).toBe('Payment panel');
    });

    it('follows the active step', async () => {
      const screen = await render(<Driven />);

      expect(screen.getByTestId('panel').element().textContent).toBe('Account panel');

      await screen.getByRole('button', { name: 'next' }).click();

      expect(screen.getByTestId('panel').element().textContent).toBe('Payment panel');
    });

    it('renders nothing at all when the step has no content', async () => {
      const screen = await render(
        <MPStepper>
          <MPStep label="One" />
          <MPStep label="Two" />
        </MPStepper>
      );

      expect(screen.container.querySelector('.mp-stepper__panel')).toBeNull();
    });
  });

  describe('pressing', () => {
    it('does not make the steps pressable without a handler', async () => {
      // A stepper nobody is driving is a progress indicator: it says where the
      // reader is and offers no way to move.
      const screen = await render(<Three active={1} />);

      expect(screen.container.querySelectorAll('li')).toHaveLength(3);
      expect(screen.container.querySelectorAll('button')).toHaveLength(0);
    });

    it('makes reached steps pressable once there is a handler', async () => {
      const onActiveChange = vi.fn();
      const screen = await render(<Three active={1} onActiveChange={onActiveChange} />);

      await screen.getByRole('button', { name: /Account/ }).click();

      expect(onActiveChange).toHaveBeenCalledWith(0);
    });

    it('works uncontrolled', async () => {
      const screen = await render(<Three defaultActive={1} onActiveChange={() => {}} />);

      await screen.getByRole('button', { name: /Account/ }).click();

      expect(screen.getByTestId('panel').element().textContent).toBe('Account panel');
    });
  });

  describe('reachability', () => {
    it('refuses a step ahead of the one the reader has reached', async () => {
      const onActiveChange = vi.fn();
      const screen = await render(<Three active={0} onActiveChange={onActiveChange} />);

      // Step three is not a button at all, and says why rather than vanishing.
      expect(screen.getByRole('button', { name: /Done/ }).query()).toBeNull();
      expect(
        screen.container.querySelectorAll('li')[2].querySelector('[aria-disabled="true"]')
      ).not.toBeNull();
    });

    it('always allows going back', async () => {
      const screen = await render(<Driven initial={0} />);

      await screen.getByRole('button', { name: 'next' }).click();
      await screen.getByRole('button', { name: 'next' }).click();
      expect(screen.getByTestId('active').element().textContent).toBe('2');

      await screen.getByRole('button', { name: /Account/ }).click();

      expect(screen.getByTestId('active').element().textContent).toBe('0');
    });

    it('lets the reader return to the furthest step they had reached', async () => {
      // The reason `furthest` is not the same as `active`: going back must not
      // take away the step they had already got to.
      const screen = await render(<Driven initial={0} />);

      await screen.getByRole('button', { name: 'next' }).click();
      await screen.getByRole('button', { name: 'next' }).click();
      await screen.getByRole('button', { name: /Account/ }).click();

      await screen.getByRole('button', { name: /Done/ }).click();

      expect(screen.getByTestId('active').element().textContent).toBe('2');
    });

    it('reaches anything at all when `linear` is off', async () => {
      const onActiveChange = vi.fn();
      const screen = await render(
        <Three active={0} linear={false} onActiveChange={onActiveChange} />
      );

      await screen.getByRole('button', { name: /Done/ }).click();

      expect(onActiveChange).toHaveBeenCalledWith(2);
    });

    it('refuses a disabled step even when it is reachable', async () => {
      const onActiveChange = vi.fn();
      const screen = await render(
        <MPStepper active={1} linear={false} onActiveChange={onActiveChange}>
          <MPStep label="One" />
          <MPStep label="Two" />
          <MPStep label="Three" disabled />
        </MPStepper>
      );

      expect(screen.getByRole('button', { name: /Three/ }).query()).toBeNull();
    });
  });

  describe('a failed step', () => {
    it('keeps its place and swaps the accent family', async () => {
      // A sequence with a hole in it is one the reader cannot count.
      const screen = await render(
        <MPStepper active={1}>
          <MPStep label="One" />
          <MPStep label="Two" error />
          <MPStep label="Three" />
        </MPStepper>
      );
      const items = [...screen.container.querySelectorAll('li')];

      expect(items).toHaveLength(3);
      expect((items[1] as HTMLElement).style.getPropertyValue('--_mp-accent')).toBe(
        'var(--_mp-color-error)'
      );
    });
  });

  describe('what it shares with MPTimeline', () => {
    it('draws its bullet from the same table', async () => {
      // Not a claim about a class name so much as about there being one table:
      // the current bullet is filled with the accent and haloed, in both.
      const screen = await render(<Three active={1} />);
      const current = screen.container.querySelectorAll('li')[1];
      const bullet = current.querySelector('span[aria-hidden]:not(.absolute)') as HTMLElement;

      expect(bullet.className).toContain('bg-(--_mp-accent)');
    });
  });

  it('takes the accent and the size from the configuration', async () => {
    const screen = await render(<Three />);
    const root = screen.container.querySelector('.mp-stepper') as HTMLElement;

    expect(root.getAttribute('data-mp-size')).toBe('md');
    expect(root.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-primary)');
  });
});
