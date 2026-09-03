import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPFooter, MPPageLayout } from 'material-plus-ui';

describe('MPFooter', () => {
  describe('the landmark', () => {
    it('is a `<footer>`, which is what makes it contentinfo', async () => {
      const screen = await render(<MPFooter>© 2026 Acme</MPFooter>);

      expect(screen.container.querySelector('.mp-footer')!.tagName).toBe('FOOTER');
    });

    it('takes a name, for the page that has two of them', async () => {
      const screen = await render(<MPFooter label="Site">© 2026 Acme</MPFooter>);

      await expect.element(screen.getByRole('contentinfo', { name: 'Site' })).toBeInTheDocument();
    });

    it('renders something else when told to', async () => {
      const screen = await render(<MPFooter render={<div />}>Fine print</MPFooter>);

      expect(screen.container.querySelector('.mp-footer')!.tagName).toBe('DIV');
    });
  });

  describe('the sheet', () => {
    it('marks the end of the document with a rule by default', async () => {
      // A footer has content above it and nothing below, so the hairline is the
      // whole of what says the document ended.
      const screen = await render(<MPFooter>Fine print</MPFooter>);
      const sheet = screen.container.querySelector('.mp-footer')!;

      expect(sheet).toHaveAttribute('data-mp-variant', 'outlined');
      expect(sheet.className).toContain('border-t');
      expect(sheet.className).not.toContain('border-b');
    });

    it('drops the rule for any other weight, which says it by tone instead', async () => {
      const screen = await render(<MPFooter variant="tonal">Fine print</MPFooter>);
      const sheet = screen.container.querySelector('.mp-footer')!;

      expect(sheet.className).toContain('bg-mp-surface-container');
      expect(sheet.className).not.toContain('border-t');
    });

    it('pads both axes, unlike a header, which sets its own height', async () => {
      const screen = await render(<MPFooter>Fine print</MPFooter>);
      const inner = screen.container.querySelector('.mp-footer__inner')!;

      expect(inner.className).toContain('px-4');
      expect(inner.className).toContain('py-4');
    });

    it('gives up the padding when told to', async () => {
      const screen = await render(<MPFooter padded={false}>Fine print</MPFooter>);
      const inner = screen.container.querySelector('.mp-footer__inner')!;

      expect(inner.className).not.toContain('px-4');
      expect(inner.className).not.toContain('py-4');
    });

    it('holds the content to a measure while the sheet still spans the window', async () => {
      // `md` is 840dp, which is where MD3's expanded window starts — the same
      // edge `MPContainer` holds to, so a bar and the page under it line up.
      const screen = await render(<MPFooter maxWidth="md">Fine print</MPFooter>);

      expect(screen.container.querySelector('.mp-footer')!.className).toContain('w-full');
      expect(getComputedStyle(screen.container.querySelector('.mp-footer__inner')!).maxWidth).toBe(
        '840px'
      );
    });
  });

  describe('position', () => {
    it('is at the end of the document, not held in reach', async () => {
      const screen = await render(<MPFooter>Fine print</MPFooter>);
      const sheet = screen.container.querySelector('.mp-footer')!;

      expect(sheet.className).not.toContain('sticky');
      expect(sheet.className).not.toContain('fixed');
    });

    it('can be held against the bottom of the window', async () => {
      const screen = await render(<MPFooter position="sticky">Save</MPFooter>);

      expect(screen.container.querySelector('.mp-footer')!.className).toContain('sticky bottom-0');
    });
  });

  describe('inside an MPPageLayout', () => {
    it('reserves the height a fixed sheet takes out of the flow', async () => {
      const screen = await render(
        <MPPageLayout footer={<MPFooter position="fixed" style={{ height: 48 }} />}>
          Body
        </MPPageLayout>
      );
      const root = screen.container.querySelector('.mp-page-layout') as HTMLElement;

      expect(root.style.getPropertyValue('--_mp-layout-footer-inset')).toBe('48px');
      expect(root.style.getPropertyValue('--_mp-layout-footer')).toBe('48px');
    });

    it('reserves nothing for the sheet that simply ends the document', async () => {
      const screen = await render(
        <MPPageLayout footer={<MPFooter style={{ height: 48 }} />}>Body</MPPageLayout>
      );
      const root = screen.container.querySelector('.mp-page-layout') as HTMLElement;

      expect(root.style.getPropertyValue('--_mp-layout-footer-inset')).toBe('0px');
      expect(root.style.getPropertyValue('--_mp-layout-footer')).toBe('0px');
    });
  });
});
