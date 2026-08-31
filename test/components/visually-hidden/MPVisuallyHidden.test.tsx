import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPVisuallyHidden } from 'material-plus-ui';

describe('MPVisuallyHidden', () => {
  it('renders a `<span>` by default', async () => {
    const screen = await render(<MPVisuallyHidden>Close this dialog</MPVisuallyHidden>);

    expect(screen.container.querySelector('span')?.textContent).toBe('Close this dialog');
  });

  describe('is invisible', () => {
    it('takes no room in the layout', async () => {
      const screen = await render(
        <div data-testid="row" style={{ display: 'flex', width: 300 }}>
          <span data-testid="seen">Seen</span>
          <MPVisuallyHidden>
            An entire sentence that would be very wide if it were drawn at all
          </MPVisuallyHidden>
        </div>
      );

      const row = screen.getByTestId('row').element().getBoundingClientRect();
      const seen = screen.getByTestId('seen').element().getBoundingClientRect();

      // The row is only as tall as the visible word, so the hidden sentence has
      // not wrapped anything or pushed anything down.
      expect(Math.round(row.height)).toBe(Math.round(seen.height));
    });

    it('is one clipped pixel rather than a box the size of the words', async () => {
      const screen = await render(<MPVisuallyHidden>A long sentence here</MPVisuallyHidden>);
      const box = screen.container.querySelector('span') as HTMLElement;
      const rect = box.getBoundingClientRect();
      const style = getComputedStyle(box);

      expect(Math.round(rect.width)).toBe(1);
      expect(Math.round(rect.height)).toBe(1);
      expect(style.position).toBe('absolute');
      expect(style.overflow).toBe('hidden');
      // Not the three treatments that would take it off the accessibility tree
      // or leave a clickable ghost.
      expect(style.display).not.toBe('none');
      expect(style.visibility).not.toBe('hidden');
      expect(style.opacity).not.toBe('0');
    });
  });

  describe('is still present', () => {
    it('keeps its text where a screen reader can read it', async () => {
      const screen = await render(
        <button type="button">
          <span aria-hidden="true">×</span>
          <MPVisuallyHidden>Close this dialog</MPVisuallyHidden>
        </button>
      );

      // The button's accessible name comes from the hidden half.
      await expect
        .element(screen.getByRole('button', { name: 'Close this dialog' }))
        .toBeInTheDocument();
    });

    it('is not marked `hidden` or `aria-hidden`', async () => {
      const screen = await render(<MPVisuallyHidden>Sorted ascending</MPVisuallyHidden>);
      const box = screen.container.querySelector('span') as HTMLElement;

      expect(box.hidden).toBe(false);
      expect(box.getAttribute('aria-hidden')).toBeNull();
    });

    it('is read in the order it is written', async () => {
      // `position: absolute` takes it out of the layout and not out of the
      // document, which is why it goes where the sentence belongs.
      const screen = await render(
        <p>
          Sent <MPVisuallyHidden>on</MPVisuallyHidden> Tuesday
        </p>
      );

      expect(screen.container.querySelector('p')?.textContent).toBe('Sent on Tuesday');
    });
  });

  describe('the escape hatches', () => {
    it('renders something else when told to', async () => {
      const screen = await render(
        <MPVisuallyHidden render={<h2 />}>Section heading</MPVisuallyHidden>
      );

      await expect
        .element(screen.getByRole('heading', { level: 2, name: 'Section heading' }))
        .toBeInTheDocument();
      expect(Math.round(screen.container.querySelector('h2')!.getBoundingClientRect().width)).toBe(
        1
      );
    });

    it('takes a `className` beside its own', async () => {
      const screen = await render(<MPVisuallyHidden className="extra">Something</MPVisuallyHidden>);
      const box = screen.container.querySelector('span') as HTMLElement;

      expect(box).toHaveClass('extra');
      expect(box).toHaveClass('absolute');
    });

    it('passes the rest through, `aria-live` included', async () => {
      // Which is what makes it usable as the live region nine components in this
      // library already use it as.
      const screen = await render(
        <MPVisuallyHidden aria-live="polite" id="status">
          Page 2 of 9
        </MPVisuallyHidden>
      );
      const box = screen.container.querySelector('span') as HTMLElement;

      expect(box.getAttribute('aria-live')).toBe('polite');
      expect(box.id).toBe('status');
    });

    it('forwards a ref to the element', async () => {
      let node: HTMLSpanElement | null = null;

      await render(
        <MPVisuallyHidden
          ref={(element) => {
            node = element;
          }}
        >
          Something
        </MPVisuallyHidden>
      );

      expect(node).toBeInstanceOf(HTMLSpanElement);
    });
  });
});
