import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPHeader, MPPageLayout } from 'material-plus-ui';

describe('MPHeader', () => {
  describe('the landmark', () => {
    it('is a `<header>`, which is what makes it the banner', async () => {
      const screen = await render(<MPHeader brand="Acme" />);

      expect(screen.container.querySelector('.mp-header')!.tagName).toBe('HEADER');
    });

    it('takes a name, for the page that has two of them', async () => {
      const screen = await render(<MPHeader label="Site" brand="Acme" />);

      await expect.element(screen.getByRole('banner', { name: 'Site' })).toBeInTheDocument();
    });

    it('renders something else when told to', async () => {
      const screen = await render(<MPHeader render={<div />} brand="Acme" />);

      expect(screen.container.querySelector('.mp-header')!.tagName).toBe('DIV');
    });
  });

  describe('the three slots', () => {
    it('draws no wrapper at all for a slot that was left empty', async () => {
      const screen = await render(<MPHeader brand="Acme" />);

      expect(screen.container.querySelector('.mp-header__brand')).not.toBeNull();
      expect(screen.container.querySelector('.mp-header__middle')).toBeNull();
      expect(screen.container.querySelector('.mp-header__actions')).toBeNull();
    });

    it('keeps them in reading order: brand, middle, actions', async () => {
      const screen = await render(
        <MPHeader brand="Acme" actions={<button type="button">Sign in</button>}>
          <nav>Docs</nav>
        </MPHeader>
      );
      const slots = [...screen.container.querySelectorAll('[class*="mp-header__"]')];

      expect(slots.map((slot) => slot.textContent)).toEqual(['Acme', 'Docs', 'Sign in']);
    });

    it('sets the brand in the headline role, and leaves the middle alone', async () => {
      // The middle is as likely to be a row of links as a headline, so a type
      // scale imposed on it would be one every link had to undo.
      const screen = await render(
        <MPHeader brand="Acme">
          <nav>Docs</nav>
        </MPHeader>
      );

      expect(screen.container.querySelector('.mp-header__brand')!.className).toContain(
        'text-mp-title-large'
      );
      expect(screen.container.querySelector('.mp-header__middle')!.className).not.toContain(
        'text-mp-'
      );
    });
  });

  describe('align', () => {
    it('packs the middle against the brand by default', async () => {
      const screen = await render(<MPHeader brand="Acme">Docs</MPHeader>);

      expect(screen.container.querySelector('.mp-header__brand')!.className).toContain('shrink-0');
      expect(screen.container.querySelector('.mp-header__middle')!.className).toContain(
        'justify-start'
      );
    });

    it('gives both ends equal shares so the middle lands on the bar’s own midline', async () => {
      const screen = await render(
        <MPHeader align="center" brand="Acme" actions={<button type="button">In</button>}>
          Docs
        </MPHeader>
      );
      const brand = screen.container.querySelector('.mp-header__brand')!;
      const actions = screen.container.querySelector('.mp-header__actions')!;

      expect(brand.className).toContain('flex-1');
      expect(actions.className).toContain('flex-1');
    });

    it('still takes the empty end’s share when only one end is filled', async () => {
      // Otherwise the middle is centred on the space left over, which moves
      // whenever the brand changes length.
      const screen = await render(
        <MPHeader align="center" brand="Acme">
          Docs
        </MPHeader>
      );
      const ends = [...screen.container.querySelectorAll('[aria-hidden="true"]')];

      expect(ends).toHaveLength(1);
      expect(ends[0]!.className).toContain('flex-1');
    });
  });

  describe('the surface', () => {
    it('is MD3’s scrolled app bar by default, with no rule under it', async () => {
      const screen = await render(<MPHeader brand="Acme" />);
      const bar = screen.container.querySelector('.mp-header')!;

      expect(bar).toHaveAttribute('data-mp-variant', 'tonal');
      expect(bar.className).toContain('bg-mp-surface-container');
      expect(bar.className).not.toContain('border-b');
    });

    it('draws the hairline on exactly one edge when outlined', async () => {
      // A container's outline goes all the way round; a bar has one edge with
      // anything on the other side of it.
      const screen = await render(<MPHeader variant="outlined" brand="Acme" />);
      const bar = screen.container.querySelector('.mp-header')!;

      expect(bar.className).toContain('border-b');
      expect(bar.className).not.toContain('border-t');
      expect(bar.className).toContain('bg-mp-surface');
    });

    it('paints nothing at all when told to', async () => {
      const screen = await render(<MPHeader variant="text" brand="Acme" />);

      expect(screen.container.querySelector('.mp-header')!.className).toContain('bg-transparent');
    });
  });

  describe('position', () => {
    it('holds itself against the top of the window by default', async () => {
      const screen = await render(<MPHeader brand="Acme" />);

      expect(screen.container.querySelector('.mp-header')!.className).toContain('sticky');
    });

    it('lets the bar scroll away when it is static', async () => {
      const screen = await render(<MPHeader position="static" brand="Acme" />);
      const bar = screen.container.querySelector('.mp-header')!;

      expect(bar.className).not.toContain('sticky');
      expect(bar.className).not.toContain('fixed');
    });
  });

  describe('inside an MPPageLayout', () => {
    it('reserves nothing for a sticky bar, but says how far down a column starts', async () => {
      const screen = await render(
        <MPPageLayout header={<MPHeader brand="Acme" style={{ height: 56 }} />}>Body</MPPageLayout>
      );
      const root = screen.container.querySelector('.mp-page-layout') as HTMLElement;

      // Still in the flow — nothing to reserve — but permanently across the top.
      expect(root.style.getPropertyValue('--_mp-layout-header-inset')).toBe('0px');
      expect(root.style.getPropertyValue('--_mp-layout-header')).toBe('56px');
    });

    it('reserves the height of a fixed bar, which is out of the flow', async () => {
      const screen = await render(
        <MPPageLayout header={<MPHeader position="fixed" brand="Acme" style={{ height: 64 }} />}>
          Body
        </MPPageLayout>
      );
      const root = screen.container.querySelector('.mp-page-layout') as HTMLElement;

      expect(root.style.getPropertyValue('--_mp-layout-header-inset')).toBe('64px');
      expect(root.style.getPropertyValue('--_mp-layout-header')).toBe('64px');
    });

    it('takes nothing off a column the bar never covered', async () => {
      const screen = await render(
        <MPPageLayout
          headerSpan="content"
          header={<MPHeader brand="Acme" style={{ height: 56 }} />}
        >
          Body
        </MPPageLayout>
      );
      const root = screen.container.querySelector('.mp-page-layout') as HTMLElement;

      expect(root.style.getPropertyValue('--_mp-layout-header')).toBe('0px');
    });

    it('is a bar on its own, with nothing to register against', async () => {
      const screen = await render(<MPHeader brand="Acme" />);

      await expect.element(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});
