import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPFlex } from 'material-plus-ui';

/**
 * The layout is resolved by the browser rather than by the component, so every
 * assertion here is a computed style: what the element ends up laid out as, not
 * what class it was given.
 *
 * The viewport is 1280 wide — `large` on Material's ladder — which is what makes
 * the responsive cases readable: a value named at `compact` and not since is the
 * one still in force up here, and that fallback is the whole of what the four
 * ladder steps in `styles.css` do.
 */
const styleOf = (screen: { getByTestId: (id: string) => { element: () => Element } }) =>
  getComputedStyle(screen.getByTestId('flex').element());

describe('MPFlex', () => {
  it('is a flex row that draws nothing', async () => {
    const screen = await render(<MPFlex data-testid="flex">One</MPFlex>);
    const style = styleOf(screen);

    expect(style.display).toBe('flex');
    expect(style.flexDirection).toBe('row');
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(style.padding).toBe('0px');
  });

  it('takes each axis as a bare value', async () => {
    const screen = await render(
      <MPFlex
        data-testid="flex"
        direction="column"
        wrap
        justify="space-between"
        align="center"
        gap={16}
      >
        One
      </MPFlex>
    );
    const style = styleOf(screen);

    expect(style.flexDirection).toBe('column');
    expect(style.flexWrap).toBe('wrap');
    expect(style.justifyContent).toBe('space-between');
    expect(style.alignItems).toBe('center');
    expect(style.gap).toBe('16px');
  });

  it('sends `start` and `end` to CSS as the flex spelling', async () => {
    // The bare words are the library's, and they are the ones `MPAlign` uses.
    const screen = await render(
      <MPFlex data-testid="flex" justify="end" align="start">
        One
      </MPFlex>
    );
    const style = styleOf(screen);

    expect(style.justifyContent).toBe('flex-end');
    expect(style.alignItems).toBe('flex-start');
  });

  it('reads a length as pixels and a string as itself', async () => {
    const screen = await render(
      <MPFlex data-testid="flex" gap="2rem">
        One
      </MPFlex>
    );

    expect(styleOf(screen).gap).toBe('32px');
  });

  it('changes direction at a window size class', async () => {
    // The reason the component exists: a column on a phone and a row from 600dp
    // up, without the boundary being written out again in Tailwind's numbers.
    const screen = await render(
      <MPFlex data-testid="flex" direction={{ compact: 'column', medium: 'row' }}>
        One
      </MPFlex>
    );

    // The viewport is `large`, which is above `medium` and has no entry of its
    // own — so this is the fallback ladder answering, not the slot.
    expect(styleOf(screen).flexDirection).toBe('row');
  });

  it('keeps a class named only at compact in force further up', async () => {
    const screen = await render(
      <MPFlex data-testid="flex" direction={{ compact: 'column' }}>
        One
      </MPFlex>
    );

    expect(styleOf(screen).flexDirection).toBe('column');
  });

  it('does not let a nested flex inherit the outer one’s classes', async () => {
    // Custom properties inherit, so an inner flex that named only `compact`
    // would otherwise resolve the outer `large` above 1200 — a row told `row`
    // that comes out a column on a laptop.
    const screen = await render(
      <MPFlex direction={{ compact: 'row', large: 'column' }}>
        <MPFlex data-testid="flex" direction="row">
          One
        </MPFlex>
      </MPFlex>
    );

    expect(styleOf(screen).flexDirection).toBe('row');
  });

  it('lays out inline when told to', async () => {
    const screen = await render(
      <MPFlex data-testid="flex" inline>
        One
      </MPFlex>
    );

    expect(styleOf(screen).display).toBe('inline-flex');
  });

  it('renders a different element, and keeps the caller’s class', async () => {
    const screen = await render(
      <MPFlex data-testid="flex" render={<nav />} className="my-own">
        One
      </MPFlex>
    );
    const element = screen.getByTestId('flex').element();

    expect(element.tagName).toBe('NAV');
    expect(element).toHaveClass('my-own');
    expect(element).toHaveClass('mp-flex');
  });
});
