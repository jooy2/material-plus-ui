import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAppLogo } from 'material-plus-ui';

const root = () => document.querySelector('.mp-app-logo') as HTMLElement;
const mark = () => document.querySelector('.mp-app-logo__mark') as HTMLElement;

const Glyph = () => (
  <svg viewBox="0 0 24 24" data-testid="glyph">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

describe('MPAppLogo', () => {
  it('is a logo with nothing but a name', async () => {
    // The point of the component: a product that has not drawn a logo yet still
    // has one, and swapping it for the real file later is one prop.
    const screen = await render(<MPAppLogo name="Acme" />);

    await expect.element(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('falls back to the initials once there is a tile to put them on', async () => {
    // A tile has no room for a word, so the name becomes the first letter of its
    // first word and the first of its last.
    const screen = await render(<MPAppLogo name="Acme Supply Co" shape="app" />);

    expect(mark().textContent).toBe('AC');

    // One word gives one letter, because a Korean, Japanese or Chinese name is a
    // single token and two of its characters at 32px is a smudge.
    await screen.rerender(<MPAppLogo name="애크미" shape="app" />);

    expect(mark().textContent).toBe('애');
  });

  it('takes written-out initials over the derived ones', async () => {
    await render(<MPAppLogo name="Acme Supply Co" initials="ASC" shape="app" />);

    expect(mark().textContent).toBe('ASC');
  });

  it('lets markup beat an image, and an image beat the letters', async () => {
    const screen = await render(
      <MPAppLogo name="Acme" src="/logo.png" shape="app">
        <Glyph />
      </MPAppLogo>
    );

    await expect.element(screen.getByTestId('glyph')).toBeInTheDocument();
    expect(root().querySelector('img')).toBeNull();

    await screen.rerender(<MPAppLogo name="Acme" src="/logo.png" shape="app" />);

    expect(root().querySelector('img')).not.toBeNull();
    expect(screen.container.textContent).not.toContain('AC');
  });

  it('draws no tile on `bare`, and a square one on `app`', async () => {
    const screen = await render(
      <MPAppLogo name="Acme" shape="bare">
        <Glyph />
      </MPAppLogo>
    );

    expect(getComputedStyle(mark()).backgroundColor).toBe('rgba(0, 0, 0, 0)');

    await screen.rerender(
      <MPAppLogo name="Acme" shape="app">
        <Glyph />
      </MPAppLogo>
    );

    const box = mark().getBoundingClientRect();

    expect(getComputedStyle(mark()).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    // A tile is square. `bare` keeps whatever width the artwork's proportions
    // come to, which is the whole difference between the two.
    expect(box.width).toBe(box.height);
  });

  it('rounds the tile all the way on `circle`', async () => {
    const screen = await render(
      <MPAppLogo name="Acme" shape="circle">
        <Glyph />
      </MPAppLogo>
    );
    const round = Number.parseFloat(getComputedStyle(mark()).borderTopLeftRadius);

    await screen.rerender(
      <MPAppLogo name="Acme" shape="app">
        <Glyph />
      </MPAppLogo>
    );

    expect(Number.parseFloat(getComputedStyle(mark()).borderTopLeftRadius)).toBeLessThan(round);
  });

  it('insets the artwork from the tile’s edge unless told not to', async () => {
    const screen = await render(<MPAppLogo name="Acme" shape="app" src="/logo.png" />);
    const image = () => root().querySelector('img')!;

    expect(image().className).toContain('h-[72%]');

    await screen.rerender(<MPAppLogo name="Acme" shape="app" src="/logo.png" padded={false} />);

    expect(image().className).toContain('h-full');
  });

  it('takes its height from the control ladder', async () => {
    // So a logo and the button beside it in a header line up.
    const screen = await render(
      <MPAppLogo name="Acme" shape="app" size="xl">
        <Glyph />
      </MPAppLogo>
    );
    const tall = mark().getBoundingClientRect().height;

    await screen.rerender(
      <MPAppLogo name="Acme" shape="app" size="xs">
        <Glyph />
      </MPAppLogo>
    );

    expect(mark().getBoundingClientRect().height).toBeLessThan(tall);
  });

  it('takes an exact height over the ladder', async () => {
    // A brand's artwork is drawn at a height somebody chose, and rounding it to
    // the nearest rung is how a logo ends up half a pixel off the type beside it.
    await render(
      <MPAppLogo name="Acme" shape="app" height={37}>
        <Glyph />
      </MPAppLogo>
    );

    const box = mark().getBoundingClientRect();

    expect(box.height).toBe(37);
    expect(box.width).toBe(37);
  });

  it('draws the name beside the mark when asked, and only then', async () => {
    const screen = await render(
      <MPAppLogo name="Acme" shape="app">
        <Glyph />
      </MPAppLogo>
    );

    expect(root().querySelector('.mp-app-logo__name')).toBeNull();

    await screen.rerender(
      <MPAppLogo name="Acme" shape="app" showName>
        <Glyph />
      </MPAppLogo>
    );

    expect(root().querySelector('.mp-app-logo__name')!.textContent).toBe('Acme');
  });

  it('ignores `showName` when the name is already the whole logo', async () => {
    // A bare logotype with the name drawn beside it is the name twice.
    const screen = await render(<MPAppLogo name="Acme" showName />);

    expect(root().querySelector('.mp-app-logo__name')).toBeNull();
    expect(screen.container.textContent).toBe('Acme');
  });

  it('says the name exactly once, whatever the mark turned out to be', async () => {
    // A glyph says nothing, so a clipped copy of the name carries it and the
    // mark is hidden from the tree.
    const glyph = await render(
      <MPAppLogo name="Acme" shape="app">
        <Glyph />
      </MPAppLogo>
    );

    expect(mark()).toHaveAttribute('aria-hidden', 'true');
    await expect.element(glyph.getByText('Acme')).toBeInTheDocument();

    // An image can carry it as `alt`, so there is no clipped copy at all.
    await glyph.rerender(<MPAppLogo name="Acme" shape="app" src="/logo.png" />);

    expect(mark()).not.toHaveAttribute('aria-hidden');
    expect(root().querySelector('img')).toHaveAttribute('alt', 'Acme');

    // And once the words are drawn, the image is decoration rather than a second
    // reading of the same thing.
    await glyph.rerender(<MPAppLogo name="Acme" shape="app" src="/logo.png" showName />);

    expect(root().querySelector('img')).toHaveAttribute('alt', '');
    expect(mark()).toHaveAttribute('aria-hidden', 'true');
  });

  it('takes `alt` over the name for what the artwork says', async () => {
    await render(<MPAppLogo name="Acme" alt="Acme, home" src="/logo.png" />);

    expect(root().querySelector('img')).toHaveAttribute('alt', 'Acme, home');
  });

  it('becomes a link when it is given somewhere to go', async () => {
    // A logo in a header is nearly always the way back to the front page.
    const screen = await render(<MPAppLogo name="Acme" href="/" />);

    await expect.element(screen.getByRole('link', { name: 'Acme' })).toBeInTheDocument();
    expect(root().tagName).toBe('A');
  });

  it('is a plain span with nowhere to go', async () => {
    await render(<MPAppLogo name="Acme" />);

    expect(root().tagName).toBe('SPAN');
  });

  it('renders as whatever it was told to', async () => {
    // `render={<h1 />}` for the one page where the product's name is the page's
    // own heading.
    const screen = await render(<MPAppLogo name="Acme" render={<h1 />} />);

    await expect.element(screen.getByRole('heading', { name: 'Acme' })).toBeInTheDocument();
  });
});
