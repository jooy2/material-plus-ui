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

    it('actually resolves the height it holds its place at', async () => {
      /*
       * A regression test for a class name rather than for a component. The
       * height is an arbitrary `calc()` reading two custom properties, and
       * Tailwind normalising the operators in one it has to space itself puts a
       * space after the leading `--` too — which leaves the declaration invalid
       * and the column silently full-window. Nothing about the markup changes
       * when that happens, so only the computed value catches it.
       */
      const bare = await render(
        <MPPageLayout>
          <MPSidebar collapseBelow="none">Nav</MPSidebar>
        </MPPageLayout>
      );
      const tall = await render(
        <MPPageLayout header={<MPHeader brand="Acme" style={{ height: 80 }} />}>
          <MPSidebar collapseBelow="none">Nav</MPSidebar>
        </MPPageLayout>
      );

      const without = parseFloat(
        getComputedStyle(bare.container.querySelector('.mp-sidebar')!).height
      );
      const under = parseFloat(
        getComputedStyle(tall.container.querySelector('.mp-sidebar')!).height
      );

      expect(without).toBeGreaterThan(0);
      expect(without - under).toBeCloseTo(80, 0);
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

    /*
     * A focusable `separator` with no value is a control a reader can move and
     * cannot hear the result of, which is the one thing it is for. `MPPanes`
     * publishes all four on its own handles; this had none, on the same gesture.
     */
    it('publishes the numbers that make it a window splitter', async () => {
      const screen = await render(
        <MPSidebar collapseBelow="none" resizable minWidth={200} maxWidth={400} width={280}>
          Nav
        </MPSidebar>
      );
      const handle = screen.container.querySelector('.mp-sidebar__handle')!;

      expect(handle).toHaveAttribute('aria-valuemin', '200');
      expect(handle).toHaveAttribute('aria-valuemax', '400');
      expect(handle).toHaveAttribute('aria-valuenow', '280');
      // And the region the number is about.
      expect(handle.getAttribute('aria-controls')).toBe(
        screen.container.querySelector('.mp-sidebar__body')!.id
      );
    });

    it('keeps the value it reads back in step with the handle', async () => {
      const screen = await render(
        <MPSidebar collapseBelow="none" resizable minWidth={200} maxWidth={400} width={280}>
          Nav
        </MPSidebar>
      );
      const handle = screen.container.querySelector('.mp-sidebar__handle') as HTMLElement;

      handle.focus();
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

      expect(handle.getAttribute('aria-valuenow')).not.toBe('280');
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
      'mp-medium:hidden'
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
