import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPMockup } from 'material-plus-ui';

const box = () => document.querySelector('.mp-mockup') as HTMLElement;
const frame = () => document.querySelector('.mp-mockup__frame') as HTMLElement;
const body = () => document.querySelector('.mp-mockup__body') as HTMLElement;
const screenOf = () => document.querySelector('.mp-mockup__screen') as HTMLElement;
const content = () => document.querySelector('.mp-mockup__content') as HTMLElement;

/** The scale lands in an effect, so the frame is hidden for one frame. */
async function drawn(): Promise<void> {
  await vi.waitFor(() => expect(frame().style.visibility).not.toBe('hidden'));
}

describe('MPMockup', () => {
  it('lays the content out at the device’s own resolution', async () => {
    // The whole point: a layout inside wraps where it would wrap on the machine,
    // not where it would wrap in the box the picture happens to fit in.
    await render(
      <div style={{ width: 200 }}>
        <MPMockup device="mobile" systemUi={false}>
          <div data-testid="page" />
        </MPMockup>
      </div>
    );

    await drawn();

    expect(content().style.width).toBe('390px');
    expect(content().style.height).toBe('844px');
  });

  it('scales the whole device down to the room it was given', async () => {
    await render(
      <div style={{ width: 200 }}>
        <MPMockup device="mobile" />
      </div>
    );

    await drawn();

    expect(frame().style.transform).toMatch(/scale\(0\.\d+\)/);
    // The picture fits, which is what the scale was measured for.
    expect(box().getBoundingClientRect().width).toBeCloseTo(200, 0);
  });

  it('keeps the device’s proportions whatever it is scaled to', async () => {
    await render(
      <div style={{ width: 200 }}>
        <MPMockup device="mobile" />
      </div>
    );

    await drawn();

    const rect = box().getBoundingClientRect();
    const ratio = Number.parseFloat(frame().style.width) / Number.parseFloat(frame().style.height);

    expect(rect.width / rect.height).toBeCloseTo(ratio, 2);
  });

  it('picks a real resolution off the ladder, and takes one it is handed', async () => {
    const screen = await render(<MPMockup device="mobile" size="xs" systemUi={false} />);

    await drawn();

    expect(content().style.width).toBe('320px');

    await screen.rerender(
      <MPMockup device="mobile" resolution={{ width: 411, height: 731 }} systemUi={false} />
    );

    expect(content().style.width).toBe('411px');
  });

  it('turns the screen and the hardware together in landscape', async () => {
    const screen = await render(<MPMockup device="mobile" systemUi={false} />);

    await drawn();

    const portrait = body().getBoundingClientRect();

    expect(portrait.height).toBeGreaterThan(portrait.width);

    await screen.rerender(<MPMockup device="mobile" orientation="landscape" systemUi={false} />);

    await vi.waitFor(() => expect(content().style.width).toBe('844px'));

    const landscape = body().getBoundingClientRect();

    expect(landscape.width).toBeGreaterThan(landscape.height);
  });

  it('leaves a desktop alone when it is asked to turn', async () => {
    // A stand does not turn with the screen.
    const screen = await render(<MPMockup device="desktop" systemUi={false} />);

    await drawn();
    expect(content().style.width).toBe('1440px');

    await screen.rerender(<MPMockup device="desktop" orientation="landscape" systemUi={false} />);

    expect(content().style.width).toBe('1440px');
  });

  it('draws no hardware at all at `bezel="none"`', async () => {
    // Not a thinner bezel: the screen on its own, with its corners cut.
    const screen = await render(<MPMockup device="mobile" bezel="none" systemUi={false} />);

    await drawn();

    expect(getComputedStyle(body()).padding).toBe('0px');
    expect(body().getBoundingClientRect().width).toBeCloseTo(
      screenOf().getBoundingClientRect().width,
      0
    );

    await screen.rerender(<MPMockup device="mobile" bezel="standard" systemUi={false} />);

    expect(Number.parseFloat(getComputedStyle(body()).paddingTop)).toBeGreaterThan(0);
  });

  it('gives an older device a forehead and a chin', async () => {
    await render(<MPMockup device="mobile" bezel="thick" systemUi={false} />);

    await drawn();

    const style = getComputedStyle(body());

    expect(Number.parseFloat(style.paddingTop)).toBeGreaterThan(
      Number.parseFloat(style.paddingLeft)
    );
    expect(Number.parseFloat(style.paddingBottom)).toBeGreaterThan(
      Number.parseFloat(style.paddingTop)
    );
  });

  it('holds a desktop up on a stand, or on a keyboard', async () => {
    const screen = await render(<MPMockup device="desktop" systemUi={false} />);

    await drawn();

    expect(document.querySelector('.mp-mockup__neck')).not.toBeNull();
    expect(document.querySelector('.mp-mockup__base')).toBeNull();

    await screen.rerender(<MPMockup device="desktop" hardware="laptop" systemUi={false} />);

    expect(document.querySelector('.mp-mockup__base')).not.toBeNull();
    expect(document.querySelector('.mp-mockup__neck')).toBeNull();
  });

  it('holds a handheld up on nothing', async () => {
    await render(<MPMockup device="mobile" hardware="laptop" systemUi={false} />);

    await drawn();

    expect(document.querySelector('.mp-mockup__neck')).toBeNull();
    expect(document.querySelector('.mp-mockup__base')).toBeNull();
  });

  it('corrects a system the device cannot run rather than refusing it', async () => {
    // A caller who changed `device` and forgot this one gets the phone's own
    // system, not a desktop menu bar across a 390-pixel screen.
    await render(<MPMockup device="mobile" os="macos" />);

    expect(box()).toHaveAttribute('data-mp-os', 'ios');
  });

  it('takes room out of the screen for the system’s bars', async () => {
    // Each bar takes its own room rather than covering the content, so turning
    // them off gives the screen back rather than uncovering anything.
    const screen = await render(<MPMockup device="mobile" systemUi={false} />);

    await drawn();

    const whole = Number.parseFloat(content().style.height);

    await screen.rerender(<MPMockup device="mobile" systemUi />);

    expect(Number.parseFloat(content().style.height)).toBeLessThan(whole);
  });

  it('draws the cut-out the device would have, and the one it was told to', async () => {
    const screen = await render(<MPMockup device="mobile" os="ios" systemUi={false} />);

    await drawn();

    const cutout = () => screenOf().querySelector('span[aria-hidden="true"]');

    expect(cutout()).not.toBeNull();

    await screen.rerender(<MPMockup device="mobile" notch="none" systemUi={false} />);

    expect(cutout()).toBeNull();

    await screen.rerender(<MPMockup device="tablet" systemUi={false} />);

    // A tablet has none by default.
    expect(cutout()).toBeNull();
  });

  it('draws the cut-out whether or not the chrome is on', async () => {
    // It is hardware: a phone does not stop having a camera because the status
    // bar was turned off.
    await render(<MPMockup device="mobile" os="ios" systemUi={false} />);

    await drawn();

    expect(screenOf().querySelector('span[aria-hidden="true"]')).not.toBeNull();
  });

  it('keeps the hardware’s colour whatever the page is doing', async () => {
    // A graphite phone stays graphite: the hardware is a photograph of an
    // object rather than a surface of this library's.
    const screen = await render(<MPMockup device="mobile" />);

    await drawn();

    expect(box().style.getPropertyValue('--_mp-device')).toBe('#2f3033');

    await screen.rerender(<MPMockup device="mobile" finish="silver" />);

    expect(box().style.getPropertyValue('--_mp-device')).toBe('#d8d9dd');
  });

  it('takes a rendered width, and a height on its own', async () => {
    const screen = await render(<MPMockup device="mobile" width={240} />);

    await drawn();

    expect(box().getBoundingClientRect().width).toBeCloseTo(240, 0);

    await screen.rerender(<MPMockup device="mobile" height={300} />);

    await vi.waitFor(() => expect(box().getBoundingClientRect().height).toBeCloseTo(300, 0));
    // The width follows from the proportions rather than filling the row.
    expect(box().getBoundingClientRect().width).toBeLessThan(200);
  });
});
