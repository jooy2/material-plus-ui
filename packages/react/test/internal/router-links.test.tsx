import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  MPBreadcrumb,
  MPBreadcrumbItem,
  MPButton,
  MPMenu,
  MPMenuItem,
  MPNavigationMenu,
  MPNavigationMenuItem,
  MPPagination,
  MPTreeItem,
  MPTreeView
} from 'material-plus-ui';

/**
 * A stand-in for a router's `Link`: an `<a>` that says it was drawn by the
 * router. Next.js's own takes the same `href`, and draws the same element.
 */
const RouterLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<'a'>>(
  function RouterLink(props, ref) {
    return <a ref={ref} data-router="" {...props} />;
  }
);

/**
 * A link to a page of the same site, drawn as a plain `<a>`, is a full page
 * load under App Router — no client-side navigation and no prefetch. Each of
 * these takes `render` so the router can draw the link instead, with the URL
 * still written once, on the component.
 */
describe('a link a router draws', () => {
  it('in a breadcrumb', async () => {
    const screen = await render(
      <MPBreadcrumb>
        <MPBreadcrumbItem href="/docs" render={<RouterLink />}>
          Docs
        </MPBreadcrumbItem>
        <MPBreadcrumbItem>Here</MPBreadcrumbItem>
      </MPBreadcrumb>
    );

    expect(screen.container.querySelector('a[href="/docs"]')!.hasAttribute('data-router')).toBe(
      true
    );
  });

  it('in a pagination row, for every page', async () => {
    const screen = await render(
      <MPPagination
        count={5}
        defaultPage={2}
        getPageHref={(page) => `/p/${page}`}
        renderLink={<RouterLink />}
      />
    );
    const links = [...screen.container.querySelectorAll('a[href^="/p/"]')];

    expect(links.length).toBeGreaterThan(2);
    expect(links.every((link) => link.hasAttribute('data-router'))).toBe(true);
    expect(screen.container.querySelector('a[rel="next"]')!.getAttribute('href')).toBe('/p/3');
  });

  it('in a tree', async () => {
    const screen = await render(
      <MPTreeView label="Pages">
        <MPTreeItem value="a" label="Guide" href="/guide" render={<RouterLink />} />
      </MPTreeView>
    );

    expect(screen.container.querySelector('a[href="/guide"]')!.hasAttribute('data-router')).toBe(
      true
    );
  });

  it('in a navigation menu', async () => {
    const screen = await render(
      <MPNavigationMenu aria-label="Main">
        <MPNavigationMenuItem label="Docs" href="/docs" render={<RouterLink />} />
      </MPNavigationMenu>
    );

    expect(screen.container.querySelector('a[href="/docs"]')!.hasAttribute('data-router')).toBe(
      true
    );
  });

  it('in a menu', async () => {
    const screen = await render(
      <MPMenu trigger={<MPButton>Go</MPButton>}>
        <MPMenuItem href="/settings" render={<RouterLink />}>
          Settings
        </MPMenuItem>
      </MPMenu>
    );

    await screen.getByRole('button', { name: 'Go' }).click();

    await expect
      .element(screen.getByRole('menuitem', { name: 'Settings' }))
      .toHaveAttribute('data-router');
  });
});
