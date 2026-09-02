import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateCounter } from 'material-plus-ui';

describe('MPAnimateCounter', () => {
  it('animates a registered custom property rather than driving its own clock', async () => {
    const screen = await render(<MPAnimateCounter value={1234} data-testid="count" />);
    const element = screen.getByTestId('count').element() as HTMLElement;

    expect(getComputedStyle(element).animationName).toBe('mp-anim-count');
    expect(element.style.getPropertyValue('--_mp-anim-from')).toBe('0');
    expect(element.style.getPropertyValue('--_mp-anim-to')).toBe('1234');
  });

  it('arrives at the value', async () => {
    const screen = await render(<MPAnimateCounter value={42} duration={80} data-testid="count" />);

    await vi.waitFor(() =>
      expect(screen.getByTestId('count').element().textContent).toContain('42')
    );
  });

  /*
   * The rule for anything driven rather than declared: before it is triggered it
   * has to look like its own first frame. The first implementation of a counter
   * that shows the answer while it waits to be scrolled to has answered the
   * question it was about to ask.
   */
  it('shows `from` while it is waiting, not the answer', async () => {
    const screen = await render(
      <MPAnimateCounter value={1000} from={10} trigger="manual" data-testid="count" />
    );
    const element = screen.getByTestId('count').element() as HTMLElement;
    const visible = element.querySelector('[aria-hidden="true"]') as HTMLElement;

    expect(getComputedStyle(element).animationPlayState).toBe('paused');
    expect(visible.textContent).toBe('10');
  });

  it('gives a screen reader the number rather than the performance', async () => {
    const screen = await render(<MPAnimateCounter value={1234} data-testid="count" />);
    const element = screen.getByTestId('count').element() as HTMLElement;
    const [hidden, visible] = [...element.children] as HTMLElement[];

    // The final value, once, out of a clipped box. A live count would be
    // announced sixty times a second.
    expect(hidden!.textContent).toBe('1,234');
    expect(visible!).toHaveAttribute('aria-hidden', 'true');
  });

  it('formats with `Intl`, so the pieces are in the order the language puts them', async () => {
    const screen = await render(
      <MPAnimateCounter
        value={1234.5}
        locale="de-DE"
        options={{ style: 'currency', currency: 'EUR' }}
        data-testid="count"
      />
    );
    const hidden = screen.getByTestId('count').element().firstElementChild as HTMLElement;

    // A `prefix`/`suffix` pair can only write one of `$1,234.50` and
    // `1.234,50 €`, and this is the other one.
    expect(hidden.textContent).toContain('€');
    expect(hidden.textContent).toContain('1.234,50');
  });

  it('takes a formatter of its own for the numbers `Intl` has no option for', async () => {
    const screen = await render(
      <MPAnimateCounter
        value={7}
        trigger="manual"
        from={7}
        format={(n) => `${n} of 10`}
        data-testid="count"
      />
    );
    const hidden = screen.getByTestId('count').element().firstElementChild as HTMLElement;

    expect(hidden.textContent).toBe('7 of 10');
  });

  it('sets the digits on one width, so the tile does not shiver as it counts', async () => {
    const screen = await render(<MPAnimateCounter value={1234} data-testid="count" />);
    const visible = screen
      .getByTestId('count')
      .element()
      .querySelector('[aria-hidden="true"]') as HTMLElement;

    expect(getComputedStyle(visible).fontVariantNumeric).toContain('tabular-nums');
  });
});
