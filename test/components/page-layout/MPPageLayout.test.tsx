import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPPageLayout } from 'material-plus-ui';

describe('MPPageLayout', () => {
  describe('the landmarks', () => {
    it('puts the children in a `<main>` the skip link can reach', async () => {
      const screen = await render(<MPPageLayout>The article.</MPPageLayout>);
      const main = screen.container.querySelector('main')!;

      expect(main.id).toBe('main');
      expect(main.textContent).toContain('The article.');
    });

    it('renames the `<main>` when the page already has that id', async () => {
      const screen = await render(<MPPageLayout mainId="content">Body</MPPageLayout>);

      expect(screen.container.querySelector('main')!.id).toBe('content');
      expect(screen.container.querySelector('a')!.getAttribute('href')).toBe('#content');
    });

    it('passes anything else through to the `<main>`', async () => {
      const screen = await render(
        <MPPageLayout mainProps={{ 'aria-label': 'Report', className: 'prose' }}>Body</MPPageLayout>
      );
      const main = screen.container.querySelector('main')!;

      expect(main).toHaveAttribute('aria-label', 'Report');
      expect(main.className).toContain('prose');
    });
  });

  describe('the skip link', () => {
    it('is the first thing in the document', async () => {
      // A skip link that is not first is a link the reader reaches after the
      // navigation it exists to skip.
      const screen = await render(<MPPageLayout header={<header>Bar</header>}>Body</MPPageLayout>);
      const root = screen.container.querySelector('.mp-page-layout')!;

      expect(root.firstElementChild!.tagName).toBe('A');
      expect(root.firstElementChild!.textContent).toBe('Skip to content');
    });

    it('says it in the language the layout was told to speak', async () => {
      const screen = await render(<MPPageLayout locale="ko">Body</MPPageLayout>);

      await expect.element(screen.getByRole('link')).toHaveTextContent('본문으로 건너뛰기');
    });

    it('takes a word of its own', async () => {
      const screen = await render(<MPPageLayout skipLabel="Jump to the report">Body</MPPageLayout>);

      await expect.element(screen.getByRole('link')).toHaveTextContent('Jump to the report');
    });

    it('can be turned off', async () => {
      const screen = await render(<MPPageLayout skipLink={false}>Body</MPPageLayout>);

      expect(screen.container.querySelector('.mp-page-layout__skip')).toBeNull();
    });

    /*
     * Following a fragment link moves the focus only if the target can hold it.
     * On an element that cannot, the browser sets a "sequential focus starting
     * point" instead — which several screen readers ignore, leaving the reader's
     * cursor back in the navigation they just asked to be past.
     */
    it('leaves the `<main>` able to take the focus it sends there', async () => {
      const screen = await render(<MPPageLayout>Body</MPPageLayout>);
      const main = screen.container.querySelector('main')!;

      expect(main).toHaveAttribute('tabindex', '-1');

      main.focus();
      expect(document.activeElement).toBe(main);
    });

    // Not by Tab, though: `<main>` is a landmark rather than a stop on the way
    // through the page.
    it('keeps it out of the tab order', async () => {
      const screen = await render(<MPPageLayout>Body</MPPageLayout>);

      expect((screen.container.querySelector('main') as HTMLElement).tabIndex).toBe(-1);
    });

    it('lets a caller say otherwise', async () => {
      const screen = await render(<MPPageLayout mainProps={{ tabIndex: 0 }}>Body</MPPageLayout>);

      expect((screen.container.querySelector('main') as HTMLElement).tabIndex).toBe(0);
    });
  });

  describe('the slots', () => {
    it('draws nothing at all for a slot that was left empty', async () => {
      const screen = await render(<MPPageLayout>Body</MPPageLayout>);

      expect(screen.container.querySelector('header')).toBeNull();
      expect(screen.container.querySelector('footer')).toBeNull();
      expect(screen.container.querySelector('aside')).toBeNull();
    });

    it('spans the header across the sidebars by default', async () => {
      const screen = await render(
        <MPPageLayout header={<header>Bar</header>} sidebar={<aside>Nav</aside>}>
          Body
        </MPPageLayout>
      );
      const header = screen.container.querySelector('header')!;
      const aside = screen.container.querySelector('aside')!;

      // The bar is a child of the layout itself; the column is one level in.
      expect(header.parentElement!.className).toContain('mp-page-layout');
      expect(aside.parentElement!.className).not.toContain('mp-page-layout');
    });

    it('puts the header between the sidebars when it spans the content', async () => {
      const screen = await render(
        <MPPageLayout
          headerSpan="content"
          header={<header>Bar</header>}
          sidebar={<aside>Nav</aside>}
        >
          Body
        </MPPageLayout>
      );
      const header = screen.container.querySelector('header')!;

      // Same wrapper as the `<main>`, which is what "beside the sidebars" means.
      expect(header.nextElementSibling!.tagName).toBe('MAIN');
    });

    it('keeps the two sidebars in reading order around the content', async () => {
      const screen = await render(
        <MPPageLayout sidebar={<aside>Nav</aside>} endSidebar={<aside>Contents</aside>}>
          Body
        </MPPageLayout>
      );
      const asides = [...screen.container.querySelectorAll('aside')];

      expect(asides).toHaveLength(2);
      expect(asides[0]!.textContent).toBe('Nav');
      expect(asides[1]!.textContent).toBe('Contents');
    });
  });

  describe('what scrolls', () => {
    it('lets the document scroll by default', async () => {
      const screen = await render(<MPPageLayout>Body</MPPageLayout>);
      const root = screen.container.querySelector('.mp-page-layout')!;

      expect(root).toHaveAttribute('data-mp-scroll', 'page');
      expect(root.className).toContain('min-h-dvh');
      expect(root.className).not.toContain('overflow-hidden');
    });

    it('pins the layout down and hands the scrolling to the content', async () => {
      const screen = await render(<MPPageLayout scroll="content">Body</MPPageLayout>);
      const root = screen.container.querySelector('.mp-page-layout')!;

      expect(root.className).toContain('h-dvh');
      expect(root.className).toContain('overflow-hidden');
      expect(screen.container.querySelector('main')!.className).toContain('overflow-y-auto');
    });

    it('takes a height of its own, as a floor or as an exact height', async () => {
      const page = await render(<MPPageLayout height={480}>Body</MPPageLayout>);

      expect(page.container.querySelector('.mp-page-layout')!.getAttribute('style')).toContain(
        'min-height: 480px'
      );

      const workspace = await render(
        <MPPageLayout height="30rem" scroll="content">
          Body
        </MPPageLayout>
      );

      expect(workspace.container.querySelector('.mp-page-layout')!.getAttribute('style')).toContain(
        'height: 30rem'
      );
    });
  });

  describe('what the bars take out of the window', () => {
    it('starts both slots at nothing, so a column with no bar above it starts at the top', async () => {
      const screen = await render(<MPPageLayout>Body</MPPageLayout>);
      const root = screen.container.querySelector('.mp-page-layout') as HTMLElement;

      expect(root.style.getPropertyValue('--_mp-layout-header')).toBe('0px');
      expect(root.style.getPropertyValue('--_mp-layout-header-inset')).toBe('0px');
      expect(root.style.getPropertyValue('--_mp-layout-footer')).toBe('0px');
      expect(root.style.getPropertyValue('--_mp-layout-footer-inset')).toBe('0px');
    });

    it('leaves a slot alone until something in it registers', async () => {
      // A plain `<header>` handed to the slot is drawn and nothing more. What
      // measures itself is an `MPHeader`, which is where that behaviour is
      // tested — the layout only holds the numbers a bar reports.
      const screen = await render(
        <MPPageLayout header={<header style={{ position: 'fixed', height: 64 }}>Bar</header>}>
          Body
        </MPPageLayout>
      );
      const root = screen.container.querySelector('.mp-page-layout') as HTMLElement;

      expect(root.style.getPropertyValue('--_mp-layout-header-inset')).toBe('0px');
    });
  });
});
