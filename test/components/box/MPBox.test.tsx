import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPBox } from 'material-plus-ui';

describe('MPBox', () => {
  it('renders what it was handed', async () => {
    const screen = await render(<MPBox>Grouped.</MPBox>);

    await expect.element(screen.getByText('Grouped.')).toBeInTheDocument();
  });

  it('publishes the rung and the variant it was drawn at', async () => {
    const screen = await render(
      <MPBox size="xl" variant="elevated">
        Body
      </MPBox>
    );
    const root = screen.container.querySelector('.mp-box');

    expect(root).toHaveAttribute('data-mp-size', 'xl');
    expect(root).toHaveAttribute('data-mp-variant', 'elevated');
  });

  it('takes its padding off the sheet ladder', async () => {
    const screen = await render(<MPBox size="xs">Body</MPBox>);

    expect(screen.container.querySelector('.mp-box')!.className).toContain('p-2.5');
  });

  it('drops the padding for full-bleed content', async () => {
    const screen = await render(<MPBox padded={false}>Body</MPBox>);
    const root = screen.container.querySelector('.mp-box')!;

    expect(root.className).not.toContain('p-4');
  });

  it('keeps the corner off the size ladder', async () => {
    // A radius here is a statement about what kind of object this is, not a size
    // to taste: a sheet is `corner-medium` at every rung.
    const screen = await render(
      <div>
        <MPBox size="xs" className="first">
          A
        </MPBox>
        <MPBox size="xl" className="last">
          B
        </MPBox>
      </div>
    );
    const radius = (selector: string) =>
      getComputedStyle(screen.container.querySelector(selector)!).borderTopLeftRadius;

    expect(radius('.first')).toBe(radius('.last'));
    expect(radius('.first')).toBe('12px');
  });

  it('stays neutral on every variant', async () => {
    // A container holding somebody else's content is never dyed, so no rung of
    // the ladder resolves to the accent.
    const screen = await render(
      <div>
        {(['filled', 'tonal', 'elevated', 'outlined', 'text'] as const).map((variant) => (
          <MPBox key={variant} variant={variant} className={`box-${variant}`}>
            {variant}
          </MPBox>
        ))}
      </div>
    );
    const accent = getComputedStyle(screen.container).getPropertyValue('--_mp-color-primary');

    for (const variant of ['filled', 'tonal', 'elevated', 'outlined', 'text']) {
      const box = screen.container.querySelector(`.box-${variant}`)!;

      expect(getComputedStyle(box).backgroundColor, variant).not.toBe(accent);
    }
  });

  it('renders a different element when told to', async () => {
    const screen = await render(<MPBox render={<section />}>Body</MPBox>);

    expect(screen.container.querySelector('.mp-box')!.tagName).toBe('SECTION');
  });

  it('passes through the attributes a div takes', async () => {
    const screen = await render(
      <MPBox id="panel" aria-label="Summary">
        Body
      </MPBox>
    );
    const root = screen.container.querySelector('.mp-box')!;

    expect(root).toHaveAttribute('id', 'panel');
    expect(root).toHaveAttribute('aria-label', 'Summary');
  });
  describe('elevation', () => {
    it('casts a shadow and moves the tone with it', async () => {
      // The pairing is the whole reason the prop can exist: a raised box that
      // kept `filled`'s tone would be a surface MD3 has no name for.
      const screen = await render(<MPBox variant="filled">Body</MPBox>);
      const flat = getComputedStyle(screen.container.querySelector('.mp-box')!);
      const flatTone = flat.backgroundColor;

      expect(flat.boxShadow).toBe('none');

      await screen.rerender(
        <MPBox variant="filled" elevation={2}>
          Body
        </MPBox>
      );
      const raised = getComputedStyle(screen.container.querySelector('.mp-box')!);

      expect(raised.boxShadow).not.toBe('none');
      expect(raised.backgroundColor).not.toBe(flatTone);
    });

    it('is what `variant="elevated"` already says, at 1', async () => {
      const screen = await render(<MPBox variant="elevated">Body</MPBox>);
      const named = getComputedStyle(screen.container.querySelector('.mp-box')!);
      const shadow = named.boxShadow;
      const tone = named.backgroundColor;

      await screen.rerender(<MPBox elevation={1}>Body</MPBox>);
      const numbered = getComputedStyle(screen.container.querySelector('.mp-box')!);

      expect(numbered.boxShadow).toBe(shadow);
      expect(numbered.backgroundColor).toBe(tone);
    });

    it('rises through all five levels rather than stopping at three', async () => {
      // Levels 4 and 5 are drawn by nothing in the library on its own. A caller
      // who can name a level has to find it defined.
      const screen = await render(<MPBox elevation={0}>Body</MPBox>);
      const shadows: string[] = [];

      for (const level of [0, 1, 2, 3, 4, 5] as const) {
        await screen.rerender(<MPBox elevation={level}>Body</MPBox>);
        shadows.push(getComputedStyle(screen.container.querySelector('.mp-box')!).boxShadow);
      }

      // Level 0 is `shadow-none`, which Tailwind computes as a stack of fully
      // transparent shadows rather than the keyword — so the assertion is that
      // nothing is *drawn*, not that the property is unset.
      expect(shadows[0]).not.toMatch(/rgba\(0, 0, 0, 0\.\d/);
      expect(new Set(shadows).size).toBe(6);
    });

    it('keeps an outlined box outlined', async () => {
      // The hairline is the one thing a level does not describe.
      const screen = await render(
        <MPBox variant="outlined" elevation={3}>
          Body
        </MPBox>
      );
      const style = getComputedStyle(screen.container.querySelector('.mp-box')!);

      expect(style.borderTopWidth).toBe('1px');
      expect(style.boxShadow).not.toBe('none');
    });
  });
});
