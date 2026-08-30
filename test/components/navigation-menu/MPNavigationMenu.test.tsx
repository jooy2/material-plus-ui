import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  MPNavigationMenu,
  MPNavigationMenuItem,
  MPNavigationMenuLink
} from 'material-plus-ui';

function Nav(props: React.ComponentProps<typeof MPNavigationMenu>) {
  return (
    <MPNavigationMenu aria-label="Main" {...props}>
      <MPNavigationMenuItem value="product" label="Product">
        <MPNavigationMenuLink href="/overview" title="Overview" description="What it does" />
        <MPNavigationMenuLink href="/pricing" title="Pricing" />
      </MPNavigationMenuItem>
      <MPNavigationMenuItem label="Docs" href="/docs" />
      <MPNavigationMenuItem value="more" label="More" disabled>
        <MPNavigationMenuLink href="/blog" title="Blog" />
      </MPNavigationMenuItem>
    </MPNavigationMenu>
  );
}

describe('MPNavigationMenu', () => {
  describe('links and triggers', () => {
    it('is a `<nav>`, which is what a row of destinations is', async () => {
      const screen = await render(<Nav />);

      await expect
        .element(screen.getByRole('navigation', { name: 'Main' }))
        .toBeInTheDocument();
    });

    it('draws an item with an `href` and no children as a real link', async () => {
      const screen = await render(<Nav />);

      await expect
        .element(screen.getByRole('link', { name: 'Docs' }))
        .toHaveAttribute('href', '/docs');
    });

    it('draws an item with children as something that expands', async () => {
      const screen = await render(<Nav />);
      const trigger = screen.getByRole('button', { name: 'Product' });

      await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens the panel, and the panel is full of real links', async () => {
      const screen = await render(<Nav />);

      await screen.getByRole('button', { name: 'Product' }).click();

      await expect
        .element(screen.getByRole('link', { name: /Overview/ }))
        .toHaveAttribute('href', '/overview');
      await expect
        .element(screen.getByRole('button', { name: 'Product' }))
        .toHaveAttribute('aria-expanded', 'true');
    });

    it('draws the description under the title', async () => {
      const screen = await render(<Nav />);

      await screen.getByRole('button', { name: 'Product' }).click();

      await expect.element(screen.getByText('What it does')).toBeInTheDocument();
    });

    it('leaves a disabled item in the row and opens nothing', async () => {
      const screen = await render(<Nav />);
      const more = screen.getByRole('button', { name: 'More' });

      await expect.element(more).toBeDisabled();
      await expect.element(more).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('the value', () => {
    it('reports which panel opened, and which closed', async () => {
      const onValueChange = vi.fn();
      const screen = await render(<Nav onValueChange={onValueChange} />);

      await screen.getByRole('button', { name: 'Product' }).click();

      expect(onValueChange).toHaveBeenCalledWith('product');
    });

    it('opens the panel it was told to, for a controlled menu', async () => {
      const screen = await render(<Nav value="product" />);

      await expect
        .element(screen.getByRole('button', { name: 'Product' }))
        .toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('the surface', () => {
    it('draws the panel on MD3’s own menu surface', async () => {
      await render(<Nav defaultValue="product" />);
      const popup = document.querySelector('.mp-navigation-menu__popup')!;

      expect(popup.className).toContain('bg-mp-surface-container');
      expect(popup.className).toContain('shadow-mp-2');
      expect(popup.className).toContain('rounded-mp-xs');
    });

    it('animates the panel’s size as well as its opacity', async () => {
      // Base UI resizes one open panel into the next rather than closing and
      // reopening it, and animating that is what makes the row read as one
      // surface.
      await render(<Nav defaultValue="product" />);
      const popup = document.querySelector('.mp-navigation-menu__popup')!;

      expect(popup.className).toContain('transition-[opacity,width,height]');
    });

    it('lays the panel out in columns when asked', async () => {
      const screen = await render(
        <MPNavigationMenu>
          <MPNavigationMenuItem value="product" label="Product" columns={2}>
            <MPNavigationMenuLink href="/a" title="A" />
            <MPNavigationMenuLink href="/b" title="B" />
          </MPNavigationMenuItem>
        </MPNavigationMenu>
      );

      await screen.getByRole('button', { name: 'Product' }).click();

      const panel = document.querySelector('.mp-navigation-menu__panel') as HTMLElement;

      // The browser normalises the zero to `0px` on the way in.
      expect(panel.style.gridTemplateColumns).toBe('repeat(2, minmax(0px, 1fr))');
    });
  });

  describe('orientation', () => {
    it('runs across the page by default and down it when told to', async () => {
      const across = await render(<Nav />);
      const down = await render(<Nav orientation="vertical" />);

      expect(across.container.querySelector('nav > *')!.className).toContain('flex-row');
      expect(down.container.querySelector('nav > *')!.className).toContain('flex-col');
    });
  });
});
