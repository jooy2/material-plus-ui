import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPImage } from 'material-plus-ui';

/**
 * Real files rather than a stubbed `Image`, because the thing worth asserting is
 * what the **browser** does — a cached image is `complete` before React attaches
 * anything, and a stub would be a test of the stub.
 *
 * A data URI is loaded from the cache the instant it is parsed, which is the
 * awkward case; a URL that cannot resolve is the failing one.
 */
const RED_DOT =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
const MISSING = '/there-is-no-file-here.png';

/** Waits for the component to settle on a state, without naming a frame. */
async function settled(container: Element, state: string) {
  for (let i = 0; i < 60; i++) {
    if (container.querySelector(`[data-mp-state="${state}"]`)) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  return false;
}

/**
 * A one-pixel picture this page has not loaded before.
 *
 * Unique per call, because a browser that already has the bytes may not fire
 * `load` again — which makes a shared fixture a test that passes or fails on
 * what ran before it.
 */
let dots = 0;

function freshDot(): string {
  dots += 1;

  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${dots}" height="1"><rect width="${dots}" height="1" fill="red"/></svg>`
  )}`;
}

describe('MPImage', () => {
  describe('when it arrives', () => {
    it('shows the picture', async () => {
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" />);

      expect(await settled(screen.container, 'loaded')).toBe(true);
      await expect.element(screen.getByRole('img', { name: 'A red dot' })).toBeInTheDocument();
    });

    it('settles even when the file was already in the cache', async () => {
      // The case the component exists for. An image that is `complete` before
      // React attaches has already fired `load`, so a component that only
      // listened would hold its placeholder over a picture that is fully drawn —
      // on every second page view, which is the view nobody tests.
      const first = await render(<MPImage src={RED_DOT} alt="A red dot" />);
      expect(await settled(first.container, 'loaded')).toBe(true);

      const second = await render(<MPImage src={RED_DOT} alt="A red dot again" />);

      expect(await settled(second.container, 'loaded')).toBe(true);
    });

    it('reports the state change once', async () => {
      const onStateChange = vi.fn();
      const screen = await render(
        <MPImage src={RED_DOT} alt="A red dot" onStateChange={onStateChange} />
      );

      await settled(screen.container, 'loaded');

      expect(onStateChange).toHaveBeenCalledWith('loaded');
      expect(onStateChange.mock.calls.filter(([s]) => s === 'loaded')).toHaveLength(1);
    });

    it("does not swallow a caller's own `onLoad`", async () => {
      // The component listens for `load` itself, so the question is whether the
      // caller's handler survives that. It does: both are called.
      //
      // A picture this page has not seen before, and that is not incidental —
      // `RED_DOT` has been loaded by the tests above, and a browser that already
      // has the bytes may not fire `load` again at all. Firefox does not, which
      // is the case the next test is about.
      const onLoad = vi.fn();
      const screen = await render(<MPImage src={freshDot()} alt="A dot" onLoad={onLoad} />);

      expect(await settled(screen.container, 'loaded')).toBe(true);
      expect(onLoad).toHaveBeenCalled();
    });

    /*
     * The next two are one test in two halves, and they have to be: a second
     * `render()` inside one test leaves the rest of the file rendering into
     * nothing. The first warms the browser's cache, the second reads it, and
     * they run in order because vitest runs a file in order.
     */
    const CACHED = freshDot();

    it('loads a picture for the first time', async () => {
      const screen = await render(<MPImage src={CACHED} alt="A dot" />);

      expect(await settled(screen.container, 'loaded')).toBe(true);
    });

    it('reports `loaded` for that same picture the second time', async () => {
      // The whole reason the component exists. A cached image is `complete`
      // before React attaches anything, so its `load` event has been and gone —
      // and Firefox does not fire it again. `onStateChange` is reported from the
      // `complete` check as well as from the event, so it is the signal that
      // arrives either way, and the one the prop documentation points at.
      const onStateChange = vi.fn();
      const screen = await render(
        <MPImage src={CACHED} alt="A dot" onStateChange={onStateChange} />
      );

      expect(await settled(screen.container, 'loaded')).toBe(true);
      expect(onStateChange).toHaveBeenCalledWith('loaded');
    });
  });

  describe('while it is on its way', () => {
    it('never shows the picture until it has arrived', async () => {
      // The invariant that holds whichever of the two unsettled states the box
      // happens to be in when this runs: the `<img>` is in the layout so the
      // browser fetches it, and it is transparent until there is something to
      // see. `display: none` would be a fetch some browsers skip.
      const screen = await render(<MPImage src={MISSING} alt="Something" />);
      const box = screen.container.querySelector('.mp-image') as HTMLElement;
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(box.getAttribute('data-mp-state')).not.toBe('loaded');
      expect(getComputedStyle(img).opacity).toBe('0');
      expect(getComputedStyle(img).display).not.toBe('none');
    });

    it('draws nothing at all when the placeholder is switched off', async () => {
      const screen = await render(<MPImage src={MISSING} alt="Something" placeholder={false} />);

      expect(screen.container.querySelector('.animate-pulse')).toBeNull();
    });

    it('takes a placeholder of its own', async () => {
      // No `src` at all would settle straight to `error`, so the loading state
      // is held by giving it a source the browser is still thinking about.
      const screen = await render(
        <MPImage
          src={`${MISSING}?slow=${Math.random()}`}
          alt="Something"
          placeholder={<span data-testid="mine">loading…</span>}
        />
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;

      expect(box.getAttribute('data-mp-state')).toBe('loading');
      await expect.element(screen.getByTestId('mine')).toBeInTheDocument();
    });
  });

  describe('when it fails', () => {
    it('falls back rather than leaving the browser to draw it', async () => {
      const screen = await render(<MPImage src={MISSING} alt="Something" />);

      expect(await settled(screen.container, 'error')).toBe(true);
      // The default fallback is a glyph on a neutral surface.
      expect(screen.container.querySelector('svg')).not.toBeNull();
    });

    it('takes a fallback of its own', async () => {
      const screen = await render(
        <MPImage src={MISSING} alt="Something" fallback={<span data-testid="mine">gone</span>} />
      );

      expect(await settled(screen.container, 'error')).toBe(true);
      await expect.element(screen.getByTestId('mine')).toBeInTheDocument();
    });

    it('is in `error` before it has been given a `src` at all', async () => {
      const screen = await render(<MPImage alt="Nothing yet" />);
      const box = screen.container.querySelector('.mp-image') as HTMLElement;

      expect(box.getAttribute('data-mp-state')).toBe('error');
    });

    it('reports the failure', async () => {
      const onStateChange = vi.fn();
      const screen = await render(
        <MPImage src={MISSING} alt="Something" onStateChange={onStateChange} />
      );

      await settled(screen.container, 'error');

      expect(onStateChange).toHaveBeenCalledWith('error');
    });
  });

  describe('a new `src`', () => {
    it('goes back to loading rather than showing the old picture', async () => {
      function Swapping() {
        const [src, setSrc] = useState(RED_DOT);

        return (
          <>
            <MPImage src={src} alt="A picture" />
            <button type="button" onClick={() => setSrc(MISSING)}>
              swap
            </button>
          </>
        );
      }

      const screen = await render(<Swapping />);
      expect(await settled(screen.container, 'loaded')).toBe(true);

      await screen.getByRole('button', { name: 'swap' }).click();

      // It left `loaded` immediately rather than holding the old picture under
      // the new source.
      expect(await settled(screen.container, 'error')).toBe(true);
    });
  });

  describe('the box', () => {
    it('reserves the room when it is given a ratio', async () => {
      const screen = await render(
        <div style={{ width: 320 }}>
          <MPImage src={MISSING} alt="Something" ratio="16 / 9" />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;

      // 320 / (16/9) = 180, before the picture has arrived at all.
      expect(Math.round(box.getBoundingClientRect().height)).toBe(180);
    });

    it('takes the fit it was given', async () => {
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" fit="contain" />);

      expect(screen.container.querySelector('img')?.className).toContain('object-contain');
    });
  });

  describe('preview', () => {
    it('is not a button unless it is asked for', async () => {
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" />);

      expect(screen.container.querySelector('button')).toBeNull();
    });

    it('becomes a button named after the picture', async () => {
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" preview />);

      await expect.element(screen.getByRole('button', { name: 'A red dot' })).toBeInTheDocument();
    });

    it('opens the picture over a scrim', async () => {
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" preview />);

      await settled(screen.container, 'loaded');
      await screen.getByRole('button', { name: 'A red dot' }).click();

      await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
      // Two now: the thumbnail and the full one.
      expect(document.querySelectorAll('img[alt="A red dot"]').length).toBeGreaterThan(1);
    });

    it('opens `previewSrc` when there is one', async () => {
      const screen = await render(
        <MPImage src={RED_DOT} alt="A red dot" preview previewSrc={MISSING} />
      );

      await settled(screen.container, 'loaded');
      await screen.getByRole('button', { name: 'A red dot' }).click();

      const full = [...document.querySelectorAll('[role="dialog"] img')] as HTMLImageElement[];
      expect(full[0].getAttribute('src')).toBe(MISSING);
    });

    it('refuses to open a picture that failed', async () => {
      // A scrim over a broken-image glyph is not worth the gesture.
      const screen = await render(<MPImage src={MISSING} alt="Something" preview />);

      expect(await settled(screen.container, 'error')).toBe(true);
      expect(
        (screen.getByRole('button', { name: 'Something' }).element() as HTMLButtonElement).disabled
      ).toBe(true);
    });

    it('takes a label of its own', async () => {
      const screen = await render(
        <MPImage src={RED_DOT} alt="A red dot" preview previewLabel="Open the full photo" />
      );

      await expect
        .element(screen.getByRole('button', { name: 'Open the full photo' }))
        .toBeInTheDocument();
    });
  });
});
