import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { MPAnimateCounter, MPLocaleProvider } from 'material-plus-ui';

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

  it('lands the counting copy on the value, not only the copy a screen reader gets', async () => {
    const screen = await render(<MPAnimateCounter value={42} duration={80} data-testid="count" />);
    const visible = screen
      .getByTestId('count')
      .element()
      .querySelector('[aria-hidden="true"]') as HTMLElement;

    await vi.waitFor(() => expect(visible.textContent).toBe('42'));
  });

  /*
   * `prefers-reduced-motion` switches the keyframes off in the stylesheet, which
   * leaves the registered property on its initial `0`. Reading that back drew a
   * zero in place of the statistic for exactly the readers who asked for less
   * motion. `animation: none` on the element is the same state without having
   * to emulate the media query.
   */
  it('shows the value when there is no animation to read', async () => {
    const screen = await render(
      <MPAnimateCounter value={1234} style={{ animation: 'none' }} data-testid="count" />
    );
    const visible = screen
      .getByTestId('count')
      .element()
      .querySelector('[aria-hidden="true"]') as HTMLElement;

    await vi.waitFor(() => expect(visible.textContent).toBe('1,234'));
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

  it("writes the number in the provider's language", async () => {
    const screen = await render(
      <MPLocaleProvider locale="de-DE">
        <MPAnimateCounter value={1234567} data-testid="count" />
      </MPLocaleProvider>
    );
    const hidden = screen.getByTestId('count').element().firstElementChild as HTMLElement;

    expect(hidden.textContent).toBe('1.234.567');
  });

  it('stops reading frames while it is held', async () => {
    // A counter waiting for its trigger shows `from` and nothing moves, so a
    // frame loop reading the same number back would be work for nothing — for
    // as long as the page stays open.
    const frames = vi.spyOn(window, 'requestAnimationFrame');

    await render(<MPAnimateCounter value={1234} trigger="manual" play={false} />);
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(frames.mock.calls.length).toBeLessThanOrEqual(2);
    frames.mockRestore();
  });

  it('counts again on a replay', async () => {
    const screen = await render(
      <div>
        <MPAnimateCounter value={42} duration={1000} trigger="hover" data-testid="count" />
        <span data-testid="away">away</span>
      </div>
    );
    const element = screen.getByTestId('count').element() as HTMLElement;
    const visible = element.querySelector('[aria-hidden="true"]') as HTMLElement;

    await userEvent.hover(element);
    await vi.waitFor(() => expect(visible.textContent).toBe('42'), { timeout: 3000 });

    // Every number written from here on, rather than whichever one a poll
    // happens to catch. The counter reads the animation rather than driving
    // it, so a count shorter than the gap between two frames on a busy machine
    // is already over at the first read and writes only its end. A second of
    // counting leaves room for frames in between.
    const written: number[] = [];
    const watcher = new MutationObserver(() => written.push(Number(visible.textContent)));

    watcher.observe(visible, { childList: true, characterData: true, subtree: true });

    await userEvent.hover(screen.getByTestId('away').element());
    await userEvent.hover(element);
    await vi.waitFor(() => expect(written.some((value) => value < 42)).toBe(true), {
      timeout: 3000
    });
    await vi.waitFor(() => expect(visible.textContent).toBe('42'), { timeout: 3000 });
    watcher.disconnect();
  });
});
