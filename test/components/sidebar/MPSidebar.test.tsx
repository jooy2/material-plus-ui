import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPHeader, MPPageLayout, MPSidebar, MPSidebarTrigger } from 'material-plus-ui';

/**
 * The window the tests run in is a browser window of unknown width, so
 * "collapsed" and "not collapsed" are asked for rather than assumed:
 * `collapseBelow="none"` can never collapse and `collapseBelow="extra-large"`
 * always does, whatever the runner's window happens to be.
 */
describe('MPSidebar', () => {
  describe('as a column', () => {
    it('is an `<aside>`, which is the complementary landmark', async () => {
      const screen = await render(<MPSidebar collapseBelow="none">Nav</MPSidebar>);

      expect(screen.container.querySelector('.mp-sidebar')!.tagName).toBe('ASIDE');
    });

    it('names itself, because two unnamed ones are two regions called the same thing', async () => {
      const screen = await render(<MPSidebar collapseBelow="none">Nav</MPSidebar>);

      await expect
        .element(screen.getByRole('complementary', { name: 'Sidebar' }))
        .toBeInTheDocument();
    });

    it('takes a name of its own, and says it in the language it was told to', async () => {
      const named = await render(
        <MPSidebar collapseBelow="none" label="Sections">
          Nav
        </MPSidebar>
      );

      await expect
        .element(named.getByRole('complementary', { name: 'Sections' }))
        .toBeInTheDocument();

      const korean = await render(
        <MPSidebar collapseBelow="none" locale="ko">
          Nav
        </MPSidebar>
      );

      await expect
        .element(korean.getByRole('complementary', { name: '사이드바' }))
        .toBeInTheDocument();
    });

    it('draws the hairline on the edge that faces the content', async () => {
      const start = await render(<MPSidebar collapseBelow="none">Nav</MPSidebar>);
      const end = await render(
        <MPSidebar collapseBelow="none" side="end">
          Contents
        </MPSidebar>
      );

      expect(start.container.querySelector('.mp-sidebar')!.className).toContain('border-e');
      expect(end.container.querySelector('.mp-sidebar')!.className).toContain('border-s');
    });

    it('takes its width from the ladder, and hands it over as a custom property', async () => {
      const screen = await render(<MPSidebar collapseBelow="none">Nav</MPSidebar>);
      const column = screen.container.querySelector('.mp-sidebar') as HTMLElement;

      // MD3's own 360dp navigation drawer, which is `MPDrawer`'s `md` too.
      expect(column.style.getPropertyValue('--_mp-sidebar-width')).toBe('22.5rem');
    });

    it('takes a width of its own, as a number of pixels or a length', async () => {
      const pixels = await render(
        <MPSidebar collapseBelow="none" width={200}>
          Nav
        </MPSidebar>
      );
      const length = await render(
        <MPSidebar collapseBelow="none" width="14rem">
          Nav
        </MPSidebar>
      );

      expect(
        (pixels.container.querySelector('.mp-sidebar') as HTMLElement).style.getPropertyValue(
          '--_mp-sidebar-width'
        )
      ).toBe('200px');
      expect(
        (length.container.querySelector('.mp-sidebar') as HTMLElement).style.getPropertyValue(
          '--_mp-sidebar-width'
        )
      ).toBe('14rem');
    });

    it('holds its place under whatever the header took, by default', async () => {
      const screen = await render(<MPSidebar collapseBelow="none">Nav</MPSidebar>);

      expect(screen.container.querySelector('.mp-sidebar')!.className).toContain('sticky');
    });

    it('scrolls with the page when told to', async () => {
      const screen = await render(
        <MPSidebar collapseBelow="none" sticky={false}>
          Nav
        </MPSidebar>
      );

      expect(screen.container.querySelector('.mp-sidebar')!.className).not.toContain('sticky');
    });
  });

  describe('resizable', () => {
    it('offers no handle by default', async () => {
      const screen = await render(<MPSidebar collapseBelow="none">Nav</MPSidebar>);

      expect(screen.container.querySelector('.mp-sidebar__handle')).toBeNull();
    });

    it('puts a named separator on the inner edge', async () => {
      const screen = await render(
        <MPSidebar collapseBelow="none" resizable>
          Nav
        </MPSidebar>
      );
      const handle = screen.container.querySelector('.mp-sidebar__handle')!;

      expect(handle).toHaveAttribute('role', 'separator');
      expect(handle).toHaveAttribute('aria-label', 'Resize sidebar');
      expect(handle).toHaveAttribute('tabindex', '0');
    });
  });

  describe('as a drawer', () => {
    it('becomes one once the window is below the class it collapses at', async () => {
      const screen = await render(
        <MPSidebar collapseBelow="extra-large" defaultOpen title="Sections">
          Nav
        </MPSidebar>
      );

      // The column is gone, and what is on the page is a dialog.
      expect(screen.container.querySelector('.mp-sidebar')).toBeNull();
      await expect.element(screen.getByRole('dialog', { name: 'Sections' })).toBeInTheDocument();
    });

    it('is named even when the column it was did not need to be', async () => {
      // A dialog with no heading has no accessible name, and this one has
      // covered the page.
      const screen = await render(
        <MPSidebar collapseBelow="extra-large" defaultOpen>
          Nav
        </MPSidebar>
      );

      await expect.element(screen.getByRole('dialog', { name: 'Sidebar' })).toBeInTheDocument();
    });

    it('stays out of the document until it is opened', async () => {
      const screen = await render(<MPSidebar collapseBelow="extra-large">Nav</MPSidebar>);

      expect(screen.container.querySelector('.mp-sidebar')).toBeNull();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  });
});

describe('MPSidebarTrigger', () => {
  it('renders nothing at all outside a layout, where it would have nothing to open', async () => {
    const screen = await render(<MPSidebarTrigger />);

    expect(screen.container.querySelector('button')).toBeNull();
  });

  it('is hidden from the breakpoint up rather than removed', async () => {
    // A trigger whose presence depended on `matchMedia` would be missing from
    // the markup a server sends and would pop into the header on every phone.
    const screen = await render(
      <MPPageLayout collapseBelow="medium" header={<MPHeader brand={<MPSidebarTrigger />} />}>
        Body
      </MPPageLayout>
    );

    expect(screen.container.querySelector('.mp-sidebar-trigger')!.className).toContain(
      'min-[600px]:hidden'
    );
  });

  it('opens the layout’s sidebar, and says which way it will go', async () => {
    const screen = await render(
      <MPPageLayout
        collapseBelow="extra-large"
        header={<MPHeader brand={<MPSidebarTrigger />} />}
        sidebar={<MPSidebar title="Sections">Nav</MPSidebar>}
      >
        Body
      </MPPageLayout>
    );

    const trigger = screen.getByRole('button', { name: 'Open sidebar' });
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();

    await expect.element(screen.getByRole('dialog', { name: 'Sections' })).toBeInTheDocument();

    // Queried off the DOM rather than by role: the drawer is modal, so
    // everything behind it — the header the trigger is in — is inert and off
    // the accessibility tree while it is open.
    const button = screen.container.querySelector('.mp-sidebar-trigger')!;

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-label', 'Close sidebar');
  });
});
