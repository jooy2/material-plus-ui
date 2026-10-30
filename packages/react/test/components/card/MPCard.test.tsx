import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButton, MPCard } from 'material-plus-ui';

describe('MPCard', () => {
  describe('the sections', () => {
    it('renders the heading, the body and the footer', async () => {
      const screen = await render(
        <MPCard title="Totals" subtitle="This month" footer={<MPButton>Export</MPButton>}>
          Forty-two orders.
        </MPCard>
      );

      await expect.element(screen.getByText('Totals')).toBeInTheDocument();
      await expect.element(screen.getByText('This month')).toBeInTheDocument();
      await expect.element(screen.getByText('Forty-two orders.')).toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    it('draws no header at all when there is nothing to put in one', async () => {
      const screen = await render(<MPCard>Just a body.</MPCard>);

      expect(screen.container.querySelector('.mp-card__title')).toBeNull();
    });

    it('keeps a heading element the caller passed', async () => {
      // A card that should appear in the document outline needs a real heading,
      // and it has to keep the card's typography rather than the browser's.
      const screen = await render(<MPCard title={<h3>Totals</h3>}>Body</MPCard>);

      await expect.element(screen.getByRole('heading', { name: 'Totals' })).toBeInTheDocument();
    });

    it('puts the header action on the title row', async () => {
      const screen = await render(
        <MPCard title="Totals" headerAction={<MPButton variant="text">More</MPButton>}>
          Body
        </MPCard>
      );
      const header = screen.container.querySelector('.mp-card__header')!;

      expect(header.textContent).toContain('Totals');
      expect(header.textContent).toContain('More');
    });
  });

  describe('media', () => {
    it('draws it above everything, outside the padded sections', async () => {
      const screen = await render(
        <MPCard title="Cover" media={<img src="/logo.png" alt="" />}>
          Body
        </MPCard>
      );
      const media = screen.container.querySelector('.mp-card__media')!;

      expect(media).not.toBeNull();
      expect(media.className).not.toContain('px-4');
      // The card clips, so its own corners crop the picture.
      expect(screen.container.querySelector('.mp-card')!.className).toContain('overflow-hidden');
    });

    it('does not clip a card that has no picture to crop', async () => {
      // `overflow: hidden` would otherwise shave the focus ring off a control
      // sitting against the sheet's edge, for no gain.
      const screen = await render(<MPCard title="Totals">Body</MPCard>);

      expect(screen.container.querySelector('.mp-card')!.className).not.toContain(
        'overflow-hidden'
      );
    });
  });

  describe('dividers', () => {
    it('separates the sections with space by default', async () => {
      const screen = await render(
        <MPCard title="Totals" footer={<MPButton>Export</MPButton>}>
          Body
        </MPCard>
      );

      expect(screen.container.querySelectorAll('.mp-card .border-t')).toHaveLength(0);
    });

    it('rules between the sections, but not above the first', async () => {
      const screen = await render(
        <MPCard title="Totals" dividers footer={<MPButton>Export</MPButton>}>
          Body
        </MPCard>
      );

      // Three sections, two rules.
      expect(screen.container.querySelectorAll('.mp-card .border-t')).toHaveLength(2);
    });

    it('moves the padding onto the sections so a rule can reach both edges', async () => {
      const screen = await render(
        <MPCard title="Totals" dividers>
          Body
        </MPCard>
      );
      const header = screen.container.querySelector('.mp-card__header')!;

      expect(header.className).toContain('px-4');
      expect(header.className).toContain('py-4');
    });
  });

  describe('the box underneath', () => {
    it('passes every box prop straight through', async () => {
      const screen = await render(
        <MPCard title="Totals" size="lg" variant="elevated">
          Body
        </MPCard>
      );
      const root = screen.container.querySelector('.mp-card')!;

      expect(root.className).toContain('mp-box');
      expect(root).toHaveAttribute('data-mp-size', 'lg');
      expect(root).toHaveAttribute('data-mp-variant', 'elevated');
    });

    it('renders a different element when told to', async () => {
      const screen = await render(
        <MPCard render={<article />} title="Totals">
          Body
        </MPCard>
      );

      expect(screen.container.querySelector('.mp-card')!.tagName).toBe('ARTICLE');
    });
  });
});
