import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPToolbar } from 'material-plus-ui';

const bar = () => document.querySelector('.mp-toolbar') as HTMLElement;
const slot = (name: 'start' | 'main' | 'end') =>
  document.querySelector(`.mp-toolbar__${name}`) as HTMLElement | null;

describe('MPToolbar', () => {
  it('pins the two ends and gives the middle what is left', async () => {
    // The arrangement every toolbar has ever had, laid out here rather than left
    // to a caller and the spacer `<div>` they have to remember.
    await render(
      <MPToolbar start={<span>Logo</span>} end={<button type="button">Save</button>}>
        <span>Middle</span>
      </MPToolbar>
    );

    const box = bar().getBoundingClientRect();
    const style = getComputedStyle(bar());
    // The hairline as well as the padding: the bar is `box-border`, so an
    // `outlined` one and a `filled` one are the same width from the outside.
    const inset = (side: 'Left' | 'Right') =>
      Number.parseFloat(style[`padding${side}`]) + Number.parseFloat(style[`border${side}Width`]);

    expect(slot('start')!.getBoundingClientRect().left).toBeCloseTo(box.left + inset('Left'), 0);
    expect(slot('end')!.getBoundingClientRect().right).toBeCloseTo(box.right - inset('Right'), 0);
  });

  it('keeps the ends at their ends with nothing in the middle', async () => {
    // The middle is `flex-1` even when empty, or `start` and `end` collapse
    // together in the centre of the bar.
    await render(<MPToolbar start={<span>Logo</span>} end={<span>Save</span>} />);

    expect(slot('main')!.getBoundingClientRect().width).toBeGreaterThan(100);
  });

  it('draws no wrapper for a slot that was given nothing', async () => {
    await render(<MPToolbar>Middle</MPToolbar>);

    expect(slot('start')).toBeNull();
    expect(slot('end')).toBeNull();
    expect(slot('main')).not.toBeNull();
  });

  it('is as tall as what is in it', async () => {
    // No height of its own: a toolbar is the controls in it plus its padding.
    await render(
      <MPToolbar>
        <div style={{ height: 80 }}>Tall</div>
      </MPToolbar>
    );

    const style = getComputedStyle(bar());
    const around =
      (Number.parseFloat(style.paddingTop) + Number.parseFloat(style.borderTopWidth)) * 2;

    expect(bar().getBoundingClientRect().height).toBeCloseTo(80 + around, 0);
  });

  it('tightens the padding with `density` and moves no type', async () => {
    const screen = await render(<MPToolbar>Middle</MPToolbar>);
    const type = getComputedStyle(bar()).fontSize;
    const loose = Number.parseFloat(getComputedStyle(bar()).paddingTop);

    await screen.rerender(<MPToolbar density={-2}>Middle</MPToolbar>);

    expect(Number.parseFloat(getComputedStyle(bar()).paddingTop)).toBeLessThan(loose);
    expect(getComputedStyle(bar()).fontSize).toBe(type);
  });

  it('claims no `toolbar` role', async () => {
    // That role is a promise about keyboard behaviour — one tab stop for the bar,
    // arrow keys between its controls — and claiming it without implementing it
    // is worse for a keyboard reader than claiming nothing.
    await render(<MPToolbar>Middle</MPToolbar>);

    expect(bar()).not.toHaveAttribute('role');
  });

  it('renders as whatever it was told to, which is how a header becomes one', async () => {
    const screen = await render(<MPToolbar render={<header />}>Middle</MPToolbar>);

    await expect.element(screen.getByRole('banner')).toBeInTheDocument();
    expect(bar().tagName).toBe('HEADER');
  });

  it('is flat until it is asked not to be, even when it is pinned', async () => {
    // A shadow under a header says "there is content beneath this", which is only
    // true once the page has been scrolled.
    const screen = await render(<MPToolbar position="sticky">Middle</MPToolbar>);

    expect(getComputedStyle(bar()).boxShadow).not.toMatch(/rgba\(0, 0, 0, 0\.\d/);

    await screen.rerender(
      <MPToolbar position="sticky" elevation={2}>
        Middle
      </MPToolbar>
    );

    expect(getComputedStyle(bar()).boxShadow).toMatch(/rgba\(0, 0, 0, 0\.\d/);
  });

  it('sits where `position` says', async () => {
    const screen = await render(<MPToolbar>Middle</MPToolbar>);

    expect(getComputedStyle(bar()).position).toBe('static');

    await screen.rerender(<MPToolbar position="sticky">Middle</MPToolbar>);

    expect(getComputedStyle(bar()).position).toBe('sticky');

    await screen.rerender(<MPToolbar position="fixed">Middle</MPToolbar>);

    expect(getComputedStyle(bar()).position).toBe('fixed');
  });

  it('drops its corners once it is pinned', async () => {
    // A pinned bar spans an edge of the window, and a rounded corner against the
    // edge of the screen is a gap with nothing behind it.
    const screen = await render(<MPToolbar>Middle</MPToolbar>);

    expect(Number.parseFloat(getComputedStyle(bar()).borderTopLeftRadius)).toBeGreaterThan(0);

    await screen.rerender(<MPToolbar position="sticky">Middle</MPToolbar>);

    expect(Number.parseFloat(getComputedStyle(bar()).borderTopLeftRadius)).toBe(0);
  });

  it('turns the hairline to face the content', async () => {
    const screen = await render(
      <MPToolbar variant="text" divider>
        Middle
      </MPToolbar>
    );

    expect(getComputedStyle(bar()).borderBottomWidth).toBe('1px');
    expect(getComputedStyle(bar()).borderTopWidth).toBe('0px');

    await screen.rerender(
      <MPToolbar variant="text" divider side="bottom">
        Middle
      </MPToolbar>
    );

    expect(getComputedStyle(bar()).borderTopWidth).toBe('1px');
    expect(getComputedStyle(bar()).borderBottomWidth).toBe('0px');
  });

  it('stays neutral whatever weight it paints', async () => {
    // A toolbar holds other people's controls, and those arrive with colours of
    // their own — so even `filled` is a container surface rather than an accent.
    await render(<MPToolbar variant="filled">Middle</MPToolbar>);

    expect(bar().className).not.toContain('_mp-accent');
  });
});
