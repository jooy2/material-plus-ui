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
/**
 * A source the dev server holds rather than answers, served by the
 * `mp-pending-image` plugin in `vitest.config.ts`.
 *
 * `loading` is the only state a test cannot reach by waiting, and a 404 does not
 * hold it: the server answers a missing file at once, so the box has settled to
 * `error` before the assertion looks — on a CI runner, at least, which is where
 * this was read as `error` where `loading` was expected.
 */
const PENDING = '/__pending-image.png';

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

/**
 * A picture of a given size that this page has not loaded before, so a test can
 * read a non-square file's proportion without a network.
 */
let pictures = 0;

function picture(width: number, height: number): string {
  pictures += 1;

  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" data-n="${pictures}"><rect width="${width}" height="${height}" fill="teal"/></svg>`
  )}`;
}

/**
 * `scale` with both factors written out. A browser serialises a uniform
 * `scale: -1 -1` back as `-1`, which is the same mirror.
 */
function scaleOf(element: HTMLElement): string {
  const [x, y = x] = element.style.scale.split(' ');

  return x ? `${x} ${y}` : '';
}

/** The two rectangles a turned picture is judged by, rounded to the pixel. */
function rounded(element: Element) {
  const { left, top, width, height } = element.getBoundingClientRect();

  return {
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(width),
    height: Math.round(height)
  };
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
      const screen = await render(<MPImage src={PENDING} alt="Something" placeholder={false} />);

      expect(screen.container.querySelector('.animate-pulse')).toBeNull();
    });

    it('takes a placeholder of its own', async () => {
      const screen = await render(
        <MPImage
          src={PENDING}
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

    it('takes `scale-down`, which never enlarges a small file', async () => {
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" fit="scale-down" />);
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(img.className).toContain('object-scale-down');
      expect(getComputedStyle(img).objectFit).toBe('scale-down');
    });

    it("keeps both dimensions on the `<img>`, where they reserve the file's proportion", async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={PENDING} alt="A picture" width={1200} height={800} />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(img.getAttribute('width')).toBe('1200');
      expect(img.getAttribute('height')).toBe('800');
      expect(box.style.width).toBe('');
      expect(box.style.height).toBe('');
      expect(rounded(img).height).toBe(200);
    });
  });

  describe('a box with no reserved size', () => {
    it('ends where the picture ends', async () => {
      // An inline `<img>` would leave the room a line keeps for descenders
      // under it, which a page without a reset shows as a strip.
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={picture(30, 20)} alt="A picture" letterbox="rebeccapurple" />
          <MPImage src={picture(30, 20)} alt="Narrowed" width={120} />
        </div>
      );
      const img = (alt: string) =>
        screen.container.querySelector(`img[alt="${alt}"]`) as HTMLImageElement;

      await expect.poll(() => rounded(img('A picture')).height).toBe(200);
      await expect.poll(() => rounded(img('Narrowed')).height).toBe(80);
      expect(rounded(img('A picture').parentElement as HTMLElement)).toEqual(
        rounded(img('A picture'))
      );
      expect(rounded(img('Narrowed').parentElement as HTMLElement)).toEqual(
        rounded(img('Narrowed'))
      );
    });
  });

  describe('a lone width or height', () => {
    it('makes a box that tall, as wide as its container', async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={PENDING} alt="A picture" height={120} />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;

      expect(box.style.height).toBe('120px');
      expect(screen.container.querySelector('img')?.hasAttribute('height')).toBe(false);
      expect(rounded(box).width).toBe(300);
      expect(rounded(box).height).toBe(120);
    });

    it('reads a string of digits as pixels and passes any other length through', async () => {
      const screen = await render(
        <>
          <MPImage src={PENDING} alt="digits" height="96" />
          <MPImage src={PENDING} alt="length" height="6rem" />
          <MPImage src={PENDING} alt="share" width="50%" />
        </>
      );
      const box = (alt: string) =>
        screen.container.querySelector(`img[alt="${alt}"]`)?.parentElement as HTMLElement;

      expect(box('digits').style.height).toBe('96px');
      expect(box('length').style.height).toBe('6rem');
      expect(box('share').style.width).toBe('50%');
    });

    it('takes the width from a ratio beside a lone height', async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={PENDING} alt="A picture" height={100} ratio={2} />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;

      expect(box.style.width).toBe('auto');
      expect(box.style.maxWidth).toBe('100%');
      expect(rounded(box).width).toBe(200);
      expect(rounded(box).height).toBe(100);
    });

    it('makes a box that wide, no wider than its container', async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={PENDING} alt="narrow" width={120} ratio={1} />
          <MPImage src={PENDING} alt="wide" width={500} ratio={1} />
        </div>
      );
      const box = (alt: string) =>
        screen.container.querySelector(`img[alt="${alt}"]`)?.parentElement as HTMLElement;

      expect(box('narrow').style.maxWidth).toBe('100%');
      expect(rounded(box('narrow')).width).toBe(120);
      expect(rounded(box('narrow')).height).toBe(120);
      expect(rounded(box('wide')).width).toBe(300);
    });

    it('lets the picture decide the height beside a lone width', async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={picture(40, 30)} alt="A picture" width={160} />
        </div>
      );
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(await settled(screen.container, 'loaded')).toBe(true);
      expect(rounded(img).width).toBe(160);
      expect(rounded(img).height).toBe(120);
    });

    it('shrinks the preview button to a narrowed box', async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={RED_DOT} alt="by width" width={120} ratio={1} preview />
          <MPImage src={RED_DOT} alt="by height" height={100} ratio={2} preview />
          <MPImage src={RED_DOT} alt="turned" height={100} ratio={2} rotate={90} preview />
        </div>
      );

      expect(rounded(screen.getByRole('button', { name: 'by width' }).element()).width).toBe(120);
      expect(rounded(screen.getByRole('button', { name: 'by height' }).element()).width).toBe(200);
      expect(rounded(screen.getByRole('button', { name: 'turned' }).element()).width).toBe(200);
    });

    it('keeps the height it was given while the picture is on its side', async () => {
      // The file's proportion would recompute the width, so it is not written.
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={picture(30, 20)} alt="A picture" height={80} rotate={90} />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(await settled(screen.container, 'loaded')).toBe(true);
      expect(box.style.aspectRatio).toBe('');
      expect(rounded(box).width).toBe(300);
      expect(rounded(box).height).toBe(80);
      expect(rounded(img)).toEqual(rounded(box));
    });

    it("writes the file's proportion beside a lone width while the picture is on its side", async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={picture(30, 20)} alt="A picture" width={100} rotate={270} />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;

      expect(await settled(screen.container, 'loaded')).toBe(true);
      await expect.poll(() => rounded(box).height).toBe(150);
      expect(rounded(box).width).toBe(100);
    });
  });

  describe('rotate', () => {
    it('writes nothing new by default', async () => {
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" />);
      const box = screen.container.querySelector('.mp-image') as HTMLElement;
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(img.style.rotate).toBe('');
      expect(img.style.position).toBe('');
      expect(box.style.containerType).toBe('');
      expect(box.querySelectorAll('img')).toHaveLength(1);
    });

    it('turns with the `rotate` property and leaves `transform` free', async () => {
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" rotate={180} />);
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(img.style.rotate).toBe('180deg');
      expect(img.style.transform).toBe('');
    });

    it('keeps a half turn in the flow', async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={picture(30, 20)} alt="A picture" rotate={180} />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(await settled(screen.container, 'loaded')).toBe(true);
      expect(getComputedStyle(img).position).toBe('static');
      expect(box.style.containerType).toBe('');
      expect(rounded(img).height).toBe(200);
    });

    it('rounds any other number to the nearest quarter', async () => {
      const screen = await render(
        <>
          <MPImage src={RED_DOT} alt="minus" rotate={-90 as never} />
          <MPImage src={RED_DOT} alt="over" rotate={450 as never} />
          <MPImage src={RED_DOT} alt="near" rotate={100 as never} />
          <MPImage src={RED_DOT} alt="nothing" rotate={Number.NaN as never} />
        </>
      );
      const turn = (alt: string) =>
        (screen.container.querySelector(`img[alt="${alt}"]`) as HTMLImageElement).style.rotate;

      expect(turn('minus')).toBe('270deg');
      expect(turn('over')).toBe('90deg');
      expect(turn('near')).toBe('90deg');
      expect(turn('nothing')).toBe('');
    });

    it('lays a quarter turn out at the swapped size and turns it into place', async () => {
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" rotate={90} />);
      const box = screen.container.querySelector('.mp-image') as HTMLElement;
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(img.style.rotate).toBe('90deg');
      expect(img.style.position).toBe('absolute');
      expect(img.style.top).toBe('50%');
      expect(img.style.left).toBe('50%');
      expect(img.style.width).toBe('100cqh');
      expect(img.style.height).toBe('100cqw');
      expect(img.style.maxWidth).toBe('none');
      expect(img.style.translate).toBe('-50% -50%');
      expect(img.style.transform).toBe('');
      expect(box.style.containerType).toBe('size');
    });

    it('reserves the turned proportion of a declared size', async () => {
      // 1200 × 800 on its side is 2 wide by 3 tall, before anything has loaded.
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={PENDING} alt="A picture" width={1200} height={800} rotate={90} />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;

      expect(Math.round(box.getBoundingClientRect().height)).toBe(450);
    });

    it('keeps an explicit ratio, which is the shape of the layout', async () => {
      const screen = await render(
        <div style={{ width: 320 }}>
          <MPImage
            src={PENDING}
            alt="A picture"
            ratio="16 / 9"
            width={1200}
            height={800}
            rotate={270}
          />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;

      expect(Math.round(box.getBoundingClientRect().height)).toBe(180);
    });

    it('reads the proportion from the file when nothing was declared', async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={picture(30, 20)} alt="A picture" rotate={90} />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(await settled(screen.container, 'loaded')).toBe(true);
      await expect.poll(() => Math.round(box.getBoundingClientRect().height)).toBe(450);
      // The turned picture covers its box exactly.
      expect(rounded(img)).toEqual(rounded(box));
    });

    it('reads it from a file the browser already had', async () => {
      // The `complete` check has to carry the size too, or a cached picture on
      // its side would have no height.
      const src = picture(40, 20);
      const first = await render(<MPImage src={src} alt="warm" />);
      expect(await settled(first.container, 'loaded')).toBe(true);

      const screen = await render(
        <div style={{ width: 200 }}>
          <MPImage src={src} alt="A picture" rotate={270} />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;

      await expect.poll(() => Math.round(box.getBoundingClientRect().height)).toBe(400);
    });

    it('opens the preview turned, in a box of the turned shape', async () => {
      const screen = await render(
        <MPImage src={picture(60, 40)} alt="A turned picture" rotate={90} preview />
      );

      expect(await settled(screen.container, 'loaded')).toBe(true);
      await screen.getByRole('button', { name: 'A turned picture' }).click();
      await expect.element(screen.getByRole('dialog')).toBeInTheDocument();

      const full = document.querySelector('[role="dialog"] img') as HTMLImageElement;
      const frame = full.parentElement as HTMLElement;

      expect(full.style.rotate).toBe('90deg');
      expect(frame.style.containerType).toBe('size');
      // No larger than the file: 40 wide and 60 tall once turned.
      await expect.poll(() => rounded(frame).width).toBe(40);
      expect(rounded(frame).height).toBe(60);
      expect(rounded(full)).toEqual(rounded(frame));
    });
  });

  describe('flip', () => {
    it('writes no `scale` by default', async () => {
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" />);

      expect((screen.container.querySelector('img') as HTMLImageElement).style.scale).toBe('');
    });

    it('mirrors along the axis it names', async () => {
      const screen = await render(
        <>
          <MPImage src={RED_DOT} alt="none" flip="none" />
          <MPImage src={RED_DOT} alt="horizontal" flip="horizontal" />
          <MPImage src={RED_DOT} alt="vertical" flip="vertical" />
          <MPImage src={RED_DOT} alt="both" flip="both" />
        </>
      );
      const mirror = (alt: string) =>
        scaleOf(screen.container.querySelector(`img[alt="${alt}"]`) as HTMLImageElement);

      expect(mirror('none')).toBe('');
      expect(mirror('horizontal')).toBe('-1 1');
      expect(mirror('vertical')).toBe('1 -1');
      expect(mirror('both')).toBe('-1 -1');
    });

    it('swaps the two factors on a quarter turn, so the mirror stays on the screen axis', async () => {
      // Scale is applied before the turn, so on its side the element's x axis is
      // the screen's y axis.
      const screen = await render(
        <>
          <MPImage src={RED_DOT} alt="quarter" flip="horizontal" rotate={90} />
          <MPImage src={RED_DOT} alt="three quarters" flip="vertical" rotate={270} />
          <MPImage src={RED_DOT} alt="half" flip="horizontal" rotate={180} />
        </>
      );
      const img = (alt: string) =>
        screen.container.querySelector(`img[alt="${alt}"]`) as HTMLImageElement;

      expect(scaleOf(img('quarter'))).toBe('1 -1');
      expect(scaleOf(img('three quarters'))).toBe('-1 1');
      expect(scaleOf(img('half'))).toBe('-1 1');
      expect(img('quarter').style.rotate).toBe('90deg');
      expect(img('quarter').style.transform).toBe('');
    });

    it('opens the preview mirrored', async () => {
      const screen = await render(
        <MPImage src={RED_DOT} alt="A mirrored dot" flip="horizontal" rotate={90} preview />
      );

      expect(await settled(screen.container, 'loaded')).toBe(true);
      await screen.getByRole('button', { name: 'A mirrored dot' }).click();
      await expect.element(screen.getByRole('dialog')).toBeInTheDocument();

      const full = document.querySelector('[role="dialog"] img') as HTMLImageElement;

      expect(scaleOf(full)).toBe('1 -1');
      expect(full.style.rotate).toBe('90deg');
    });

    it('mirrors an unturned preview in place', async () => {
      const screen = await render(
        <MPImage src={picture(40, 30)} alt="A flipped dot" flip="vertical" preview />
      );

      expect(await settled(screen.container, 'loaded')).toBe(true);
      await screen.getByRole('button', { name: 'A flipped dot' }).click();
      await expect.element(screen.getByRole('dialog')).toBeInTheDocument();

      const full = document.querySelector('[role="dialog"] img') as HTMLImageElement;

      expect(scaleOf(full)).toBe('1 -1');
      expect(full.parentElement?.getAttribute('role')).toBe('dialog');
    });
  });

  describe('position', () => {
    /** The `object-position` each of several pictures was drawn with, by `alt`. */
    async function positions(pictures: React.ReactElement[]) {
      const screen = await render(<>{pictures}</>);

      return (alt: string) =>
        (screen.container.querySelector(`img[alt="${alt}"]`) as HTMLImageElement).style
          .objectPosition;
    }

    it('writes nothing for the centre', async () => {
      const at = await positions([
        <MPImage key="1" src={RED_DOT} alt="default" />,
        <MPImage key="2" src={RED_DOT} alt="centre" position="center" rotate={90} flip="both" />
      ]);

      expect(at('default')).toBe('');
      expect(at('centre')).toBe('');
    });

    it('writes a side, a corner or a pair as percentages', async () => {
      const at = await positions([
        <MPImage key="1" src={RED_DOT} alt="top" position="top" />,
        <MPImage key="2" src={RED_DOT} alt="right" position="right" />,
        <MPImage key="3" src={RED_DOT} alt="top left" position="top left" />,
        <MPImage key="4" src={RED_DOT} alt="bottom right" position="bottom right" />,
        <MPImage key="5" src={RED_DOT} alt="pair" position="30% 20%" />
      ]);

      expect(at('top')).toBe('50% 0%');
      expect(at('right')).toBe('100% 50%');
      expect(at('top left')).toBe('0% 0%');
      expect(at('bottom right')).toBe('100% 100%');
      expect(at('pair')).toBe('30% 20%');
    });

    it('keeps what is shown at the top of a turned picture', async () => {
      // `object-position` works before the turn, so the top of the screen is the
      // element's bottom after a half turn and its left edge after a quarter.
      const at = await positions([
        <MPImage key="1" src={RED_DOT} alt="half" position="top" rotate={180} />,
        <MPImage key="2" src={RED_DOT} alt="quarter" position="top" rotate={90} />,
        <MPImage key="3" src={RED_DOT} alt="three quarters" position="30% 20%" rotate={270} />
      ]);

      expect(at('half')).toBe('50% 100%');
      expect(at('quarter')).toBe('0% 50%');
      expect(at('three quarters')).toBe('80% 30%');
    });

    it('undoes a mirror before the turn', async () => {
      const at = await positions([
        <MPImage key="1" src={RED_DOT} alt="mirrored" position="left" flip="horizontal" />,
        <MPImage key="2" src={RED_DOT} alt="upside down" position="top" flip="vertical" />,
        <MPImage
          key="3"
          src={RED_DOT}
          alt="both"
          position="30% 20%"
          flip="horizontal"
          rotate={90}
        />
      ]);

      expect(at('mirrored')).toBe('100% 50%');
      expect(at('upside down')).toBe('50% 100%');
      // Mirrored to 70% 20%, then the quarter turn undone.
      expect(at('both')).toBe('20% 30%');
    });

    it('passes a value it cannot read straight through', async () => {
      const at = await positions([
        <MPImage
          key="1"
          src={RED_DOT}
          alt="lengths"
          position={'10px 20px' as never}
          rotate={180}
        />,
        <MPImage key="2" src={RED_DOT} alt="mixed" position={'left 10px' as never} />
      ]);

      expect(at('lengths')).toBe('10px 20px');
      expect(at('mixed')).toBe('left 10px');
    });

    it('reads a keyword beside a percentage', async () => {
      const at = await positions([
        <MPImage key="1" src={RED_DOT} alt="left then down" position={'left 30%' as never} />,
        <MPImage key="2" src={RED_DOT} alt="across then top" position={'30% top' as never} />
      ]);

      expect(at('left then down')).toBe('0% 30%');
      expect(at('across then top')).toBe('30% 0%');
    });
  });

  describe('letterbox', () => {
    it('draws nothing extra by default', async () => {
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" fit="contain" />);
      const box = screen.container.querySelector('.mp-image') as HTMLElement;

      expect(box.style.background).toBe('');
      expect(box.querySelectorAll('img')).toHaveLength(1);
    });

    it('paints any other string behind the picture', async () => {
      const screen = await render(
        <MPImage src={RED_DOT} alt="A red dot" fit="contain" letterbox="rebeccapurple" />
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;

      expect(getComputedStyle(box).backgroundColor).toBe('rgb(102, 51, 153)');
      expect(box.querySelectorAll('img')).toHaveLength(1);
    });

    it('draws one hidden, blurred copy of the picture behind it', async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage
            src={RED_DOT}
            srcSet={`${RED_DOT} 1x`}
            sizes="300px"
            loading="lazy"
            alt="A red dot"
            ratio={2}
            fit="contain"
            letterbox="blur"
          />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;
      const [copy, img] = [...box.querySelectorAll('img')];

      expect(box.querySelectorAll('img')).toHaveLength(2);
      expect(copy.getAttribute('alt')).toBe('');
      expect(copy.getAttribute('aria-hidden')).toBe('true');
      expect(copy.getAttribute('draggable')).toBe('false');
      expect(getComputedStyle(copy).pointerEvents).toBe('none');
      expect(getComputedStyle(copy).userSelect).toBe('none');
      expect(getComputedStyle(copy).objectFit).toBe('cover');
      expect(copy.style.filter).toBe('blur(24px)');
      expect(copy.getAttribute('src')).toBe(img.getAttribute('src'));
      expect(copy.getAttribute('srcset')).toBe(img.getAttribute('srcset'));
      expect(copy.getAttribute('sizes')).toBe('300px');
      expect(copy.getAttribute('loading')).toBe('lazy');
      // The picture is positioned, so the copy before it does not paint over it.
      expect(img.style.position).toBe('relative');
      // Only the picture is announced.
      await expect.element(screen.getByRole('img', { name: 'A red dot' })).toBeInTheDocument();
      expect(screen.container.querySelectorAll('img:not([aria-hidden])')).toHaveLength(1);
    });

    it('grows the copy past the box by two blur radii, for the box to clip', async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={RED_DOT} alt="A red dot" ratio={2} fit="contain" letterbox="blur" />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;
      const copy = box.querySelector('img') as HTMLImageElement;
      const outer = rounded(box);

      expect(rounded(copy)).toEqual({
        left: outer.left - 48,
        top: outer.top - 48,
        width: outer.width + 96,
        height: outer.height + 96
      });
      expect(getComputedStyle(box).overflow).toBe('hidden');
    });

    it('turns, mirrors and places the copy the way the picture is', async () => {
      const screen = await render(
        <MPImage
          src={RED_DOT}
          alt="A red dot"
          fit="scale-down"
          letterbox="blur"
          rotate={90}
          flip="horizontal"
          position="top"
        />
      );
      const [copy, img] = [...screen.container.querySelectorAll('img')];

      expect(copy.style.rotate).toBe(img.style.rotate);
      expect(scaleOf(copy)).toBe(scaleOf(img));
      expect(copy.style.objectPosition).toBe(img.style.objectPosition);
      expect(copy.style.width).toBe('calc(100cqh + 96px)');
      expect(copy.style.height).toBe('calc(100cqw + 96px)');
      expect(img.style.position).toBe('absolute');
    });

    it('fades the copy in with the picture', async () => {
      const screen = await render(
        <MPImage src={PENDING} alt="Something" fit="none" letterbox="blur" />
      );
      const [copy, img] = [...screen.container.querySelectorAll('img')];

      expect(getComputedStyle(copy).opacity).toBe('0');
      expect(copy.className).toContain('transition-opacity');
      expect(img.className).toContain('transition-opacity');
    });

    it('draws no copy for a fit that leaves no room', async () => {
      const screen = await render(
        <>
          <MPImage src={RED_DOT} alt="cover" fit="cover" letterbox="blur" />
          <MPImage src={RED_DOT} alt="fill" fit="fill" letterbox="blur" />
        </>
      );

      expect(screen.container.querySelectorAll('img')).toHaveLength(2);
      expect(screen.container.querySelectorAll('img[aria-hidden]')).toHaveLength(0);
    });

    it('fetches the file once for the picture and its copy', async () => {
      const src = `/docs/public/samples/marks/kite-wind.webp?letterbox=${Date.now()}`;

      // The buffer holds 250 entries, and loading the suite has filled it.
      performance.clearResourceTimings();

      const screen = await render(
        <MPImage src={src} alt="A kite" ratio={2} fit="contain" letterbox="blur" />
      );

      expect(await settled(screen.container, 'loaded')).toBe(true);

      const url = new URL(src, location.href).href;

      await expect.poll(() => performance.getEntriesByName(url).length).toBeGreaterThan(0);
      expect(performance.getEntriesByName(url)).toHaveLength(1);
    });
  });

  describe('a picture as the placeholder', () => {
    /** The stand-in, which is the hidden `<img>` that is not the letterbox's. */
    function standInOf(container: Element) {
      return container.querySelector('img[aria-hidden="true"]') as HTMLImageElement | null;
    }

    it('is drawn instead of the shimmer while the file is on its way', async () => {
      const screen = await render(
        <MPImage src={PENDING} alt="Something" ratio={2} placeholder={{ src: RED_DOT }} />
      );
      const standIn = standInOf(screen.container);

      expect(screen.container.querySelector('.animate-pulse')).toBeNull();
      expect(standIn?.getAttribute('src')).toBe(RED_DOT);
      expect(standIn?.getAttribute('alt')).toBe('');
      expect(standIn?.getAttribute('draggable')).toBe('false');
      expect(getComputedStyle(standIn as HTMLImageElement).pointerEvents).toBe('none');
      expect(getComputedStyle(standIn as HTMLImageElement).opacity).toBe('1');
      expect(standIn?.style.filter).toBe('');
      // Under the picture, which is positioned so the stand-in does not paint over it.
      expect(standIn?.nextElementSibling?.getAttribute('alt')).toBe('Something');
      expect((standIn?.nextElementSibling as HTMLElement).style.position).toBe('relative');
    });

    it('fills the box when it is not blurred', async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage src={PENDING} alt="Something" ratio={2} placeholder={{ src: RED_DOT }} />
        </div>
      );
      const box = screen.container.querySelector('.mp-image') as HTMLElement;

      expect(rounded(standInOf(box) as HTMLImageElement)).toEqual(rounded(box));
    });

    it('is blurred, and grown by two radii for the box to clip', async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPImage
            src={PENDING}
            alt="default radius"
            ratio={2}
            placeholder={{ src: RED_DOT, blur: true }}
          />
          <MPImage
            src={PENDING}
            alt="own radius"
            ratio={2}
            placeholder={{ src: RED_DOT, blur: 8 }}
          />
        </div>
      );
      const [first, second] = [...screen.container.querySelectorAll('.mp-image')] as HTMLElement[];
      const outer = rounded(second);

      expect(standInOf(first)?.style.filter).toBe('blur(20px)');
      expect(standInOf(second)?.style.filter).toBe('blur(8px)');
      expect(rounded(standInOf(second) as HTMLImageElement)).toEqual({
        left: outer.left - 16,
        top: outer.top - 16,
        width: outer.width + 32,
        height: outer.height + 32
      });
    });

    it('is fitted, turned, mirrored and placed the way the picture is', async () => {
      const screen = await render(
        <MPImage
          src={PENDING}
          alt="Something"
          ratio={1}
          fit="contain"
          rotate={270}
          flip="vertical"
          position="bottom right"
          placeholder={{ src: RED_DOT, blur: 10 }}
        />
      );
      const standIn = standInOf(screen.container) as HTMLImageElement;
      const img = screen.container.querySelector('img[alt="Something"]') as HTMLImageElement;

      expect(standIn.className).toContain('object-contain');
      expect(standIn.style.rotate).toBe('270deg');
      expect(scaleOf(standIn)).toBe(scaleOf(img));
      expect(standIn.style.objectPosition).toBe(img.style.objectPosition);
      expect(standIn.style.width).toBe('calc(100cqh + 40px)');
      expect(standIn.style.height).toBe('calc(100cqw + 40px)');
    });

    it('draws a Blob through an object URL, and revokes it on unmount', async () => {
      const revoke = vi.spyOn(URL, 'revokeObjectURL');
      const blob = new Blob(
        [
          '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="2"><rect width="4" height="2" fill="navy"/></svg>'
        ],
        { type: 'image/svg+xml' }
      );
      const screen = await render(
        <MPImage src={PENDING} alt="Something" ratio={2} placeholder={{ src: blob }} />
      );

      await expect
        .poll(() => standInOf(screen.container)?.getAttribute('src') ?? '')
        .toMatch(/^blob:/);

      const url = standInOf(screen.container)?.getAttribute('src');

      await screen.unmount();

      expect(revoke).toHaveBeenCalledWith(url);
      revoke.mockRestore();
    });

    it("never draws the previous Blob's URL for a new Blob", async () => {
      const revoke = vi.spyOn(URL, 'revokeObjectURL');
      const svg = (fill: string) =>
        new Blob(
          [
            `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="2"><rect width="4" height="2" fill="${fill}"/></svg>`
          ],
          { type: 'image/svg+xml' }
        );
      const first = svg('navy');
      const second = svg('teal');
      const screen = await render(
        <MPImage src={PENDING} alt="Something" ratio={2} placeholder={{ src: first }} />
      );

      await expect
        .poll(() => standInOf(screen.container)?.getAttribute('src') ?? '')
        .toMatch(/^blob:/);

      const before = standInOf(screen.container)?.getAttribute('src');

      await screen.rerender(
        <MPImage src={PENDING} alt="Something" ratio={2} placeholder={{ src: second }} />
      );

      await expect
        .poll(() => standInOf(screen.container)?.getAttribute('src') ?? '')
        .not.toBe(before);
      expect(standInOf(screen.container)?.getAttribute('src') ?? '').toMatch(/^blob:/);
      expect(revoke).toHaveBeenCalledWith(before);
      revoke.mockRestore();
    });

    it('is hidden only after the picture has faded in over it', async () => {
      const screen = await render(
        <MPImage src={picture(8, 4)} alt="Something" ratio={2} placeholder={{ src: RED_DOT }} />
      );

      expect(await settled(screen.container, 'loaded')).toBe(true);

      const standIn = standInOf(screen.container) as HTMLImageElement;

      expect(standIn.style.opacity).toBe('0');
      // No fade of its own: a step, delayed by the picture's fade.
      expect(standIn.style.transition).toBe(
        'opacity 0ms linear var(--mp-sys-motion-duration-short4)'
      );
      await expect.poll(() => getComputedStyle(standIn).opacity).toBe('0');
    });

    it('is removed when the file fails', async () => {
      const screen = await render(
        <MPImage src={MISSING} alt="Something" ratio={2} placeholder={{ src: RED_DOT }} />
      );

      expect(await settled(screen.container, 'error')).toBe(true);
      expect(standInOf(screen.container)).toBeNull();
    });
  });

  describe('when it loads', () => {
    it('passes the native loading attributes through', async () => {
      const screen = await render(
        <MPImage
          src={RED_DOT}
          alt="A red dot"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      );
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(img.getAttribute('loading')).toBe('lazy');
      expect(img.getAttribute('decoding')).toBe('async');
      // Attribute names are not case-sensitive in HTML, and the DOM reports them in lowercase.
      expect(img.getAttribute('fetchpriority')).toBe('low');
    });

    it('sets no loading attributes by default', async () => {
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" />);
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(img.hasAttribute('loading')).toBe(false);
      expect(img.hasAttribute('fetchpriority')).toBe(false);
    });

    it('loads a `priority` picture eagerly and first', async () => {
      const error = vi.spyOn(console, 'error');
      const screen = await render(<MPImage src={RED_DOT} alt="A red dot" priority />);
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(img.getAttribute('loading')).toBe('eager');
      expect(img.getAttribute('fetchpriority')).toBe('high');
      // Spelled the way this React knows it, so it says nothing about it.
      expect(error.mock.calls.flat().join(' ')).not.toMatch(/fetchpriority/i);
      error.mockRestore();
    });

    it('lets an attribute the caller writes out win over `priority`', async () => {
      const screen = await render(
        <MPImage src={RED_DOT} alt="A red dot" priority loading="lazy" fetchPriority="auto" />
      );
      const img = screen.container.querySelector('img') as HTMLImageElement;

      expect(img.getAttribute('loading')).toBe('lazy');
      expect(img.getAttribute('fetchpriority')).toBe('auto');
    });

    it('gives the letterbox copy the same urgency as the picture', async () => {
      const screen = await render(
        <MPImage src={RED_DOT} alt="A red dot" fit="contain" letterbox="blur" priority />
      );
      const copy = screen.container.querySelector('img[aria-hidden="true"]') as HTMLImageElement;

      expect(copy.getAttribute('loading')).toBe('eager');
      expect(copy.getAttribute('fetchpriority')).toBe('high');
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

    /*
     * The pictures these open are larger than a pixel. The button is as wide as
     * the picture it holds, and a one-pixel button is not one a pointer can be
     * relied on to press.
     */
    it('opens the picture over a scrim', async () => {
      const screen = await render(<MPImage src={picture(40, 30)} alt="A picture" preview />);

      await settled(screen.container, 'loaded');
      await screen.getByRole('button', { name: 'A picture' }).click();

      await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
      // Two now: the thumbnail and the full one.
      expect(document.querySelectorAll('img[alt="A picture"]').length).toBeGreaterThan(1);
    });

    it('opens `previewSrc` when there is one', async () => {
      const screen = await render(
        <MPImage src={picture(40, 30)} alt="A picture" preview previewSrc={MISSING} />
      );

      await settled(screen.container, 'loaded');
      await screen.getByRole('button', { name: 'A picture' }).click();

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
