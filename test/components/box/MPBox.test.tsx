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
});
