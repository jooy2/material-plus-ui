import * as React from 'react';
import { cssLength } from '../../internal/length';
import {
  FINISHES,
  HARDWARE,
  MockupCutout,
  RESOLUTIONS,
  defaultNotch,
  mockupChrome,
  mockupMetrics,
  resolveOs
} from '../../internal/mockup';
import type {
  MPMockupBezel,
  MPMockupDevice,
  MPMockupFinish,
  MPMockupHardware,
  MPMockupNotch,
  MPMockupOrientation,
  MPMockupOs,
  MPMockupResolution
} from '../../internal/mockup';
import { useMPSize } from '../../internal/config';
import type { MPSize } from '../../types';

export type {
  MPMockupBezel,
  MPMockupDevice,
  MPMockupFinish,
  MPMockupHardware,
  MPMockupNotch,
  MPMockupOrientation,
  MPMockupOs,
  MPMockupResolution
};

export interface MPMockupProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  /**
   * Which machine this is a picture of. The one prop with no default: a mockup
   * that has not said what it is a mockup of has not said anything.
   */
  device: MPMockupDevice;
  /**
   * The system whose chrome is drawn on the screen. A desktop runs `macos`,
   * `windows` or `linux`; a tablet runs `ipados` or `android`; a phone runs
   * `ios` or `android`.
   *
   * A value the device cannot run falls back to that device's own default
   * rather than being refused — `os="macos"` on a phone is a caller who changed
   * `device` and forgot this one.
   */
  os?: MPMockupOs;
  /**
   * What holds a desktop screen up: a stand under it, or a keyboard in front of
   * it. Ignored on a tablet and a phone, which hold themselves up.
   * @default 'monitor'
   */
  hardware?: MPMockupHardware;
  /**
   * How big the device is, on a five-step ladder of real resolutions per device
   * — a 320-wide phone up to a 430-wide one, a 1024-wide desktop up to a
   * 1920-wide one.
   *
   * As on `MPBox`, `size` here sets no height and no type scale. What it sets is
   * the **resolution of the screen**, which is the only thing about a device
   * there is to scale. `resolution` overrides it outright.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * The screen's logical resolution in CSS pixels, when none of the five steps
   * is the machine you mean.
   *
   * This is the viewport the content is laid out against, not the panel's
   * physical pixel count.
   */
  resolution?: MPMockupResolution;
  /**
   * Which way a handheld is held. Landscape turns the screen, the bezel and the
   * cut-out together. Ignored on a desktop, whose stand does not turn with it.
   * @default 'portrait'
   */
  orientation?: MPMockupOrientation;
  /**
   * How much hardware there is around the screen.
   *
   * `none` is not a thinner bezel — it is no hardware at all, leaving the screen
   * on its own with its corners cut, which is what a mockup that only wants the
   * viewport is asking for. `thick` is an older device: narrow sides, a
   * forehead and a chin.
   * @default 'standard'
   */
  bezel?: MPMockupBezel;
  /**
   * What the hardware is made of. Fixed colours rather than theme tokens — a
   * graphite phone stays graphite on a page switched to dark.
   * @default 'graphite'
   */
  finish?: MPMockupFinish;
  /**
   * The camera cut-out. Hardware rather than chrome, so it is drawn whether or
   * not `systemUi` is on. Defaults to what the device would have: a dynamic
   * island on an iOS phone, a punch hole on an Android one, nothing anywhere
   * else.
   */
  notch?: MPMockupNotch;
  /**
   * Draws the system's own bars — a status bar and a home indicator, a menu bar
   * and a dock, a taskbar.
   *
   * Each takes its own room rather than covering the content, so turning it off
   * gives the screen back to `children` rather than uncovering anything.
   * @default true
   */
  systemUi?: boolean;
  /**
   * The rendered width of the whole picture on the page. A number is pixels, a
   * string is any CSS length.
   *
   * Left out the mockup fills the width it is given. The device is always laid
   * out at its own resolution and then scaled once, so this changes how big the
   * picture is and never what the content inside it thinks the viewport is.
   */
  width?: number | string;
  /** The rendered height. Given on its own it decides the size and the width follows. */
  height?: number | string;
  /** What is on the screen. */
  children?: React.ReactNode;
}

/**
 * A picture of a device, with a real page inside it.
 *
 * ```tsx
 * <MPMockup device="mobile" width={280}>
 *   <YourScreen />
 * </MPMockup>
 * ```
 *
 * ## The screen is a real viewport
 *
 * `children` are laid out against the device's own resolution — 390 by 844 CSS
 * pixels for a phone at `md` — and the whole device is then scaled once to
 * whatever room it was given. So a layout inside it wraps where it would wrap
 * on the machine, not where it would wrap in the box the picture happens to fit
 * in.
 *
 * The one thing to know is that a media query still measures the **window**.
 * `@media (max-width: 600px)` inside a phone mockup on a laptop is false, and
 * always will be — nothing on the page can change what the window is. Content
 * that has to respond inside the frame should measure the frame, with a
 * container query.
 *
 * ## That scale is a transform, and it is the exception
 *
 * The rule everywhere else in this library is that a surface is not moved or
 * scaled. It is a rule about **controls**: a scaled button is a button whose
 * text was resampled at the moment it was pressed.
 *
 * Nothing here is pressed, and the scale never changes on an interaction — it
 * is set once from the room available and again only when that room changes. A
 * device drawn at a third of its size is a picture of a device, which is the
 * whole point, and no other mechanism lays a 390-pixel page out inside a
 * 130-pixel box.
 *
 * ## Hardware is a photograph, software is a page
 *
 * The finishes are fixed colours and do not follow the theme: a graphite phone
 * stays graphite on a page switched to dark, because a mockup whose aluminium
 * turned white would be a mockup of nothing.
 *
 * The chrome on the screen does follow it. A menu bar and a status bar are
 * drawn out of `surface` and `on-surface`, so the frame stays a frame around
 * *your* page rather than becoming a picture of somebody else's screenshot.
 */
export const MPMockup = React.forwardRef<HTMLDivElement, MPMockupProps>(function MPMockup(
  {
    device,
    os: osProp,
    hardware = 'monitor',
    size: sizeProp,
    resolution,
    orientation = 'portrait',
    bezel = 'standard',
    finish = 'graphite',
    notch: notchProp,
    systemUi = true,
    width,
    height,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const os = resolveOs(device, osProp);
  const notch = notchProp ?? defaultNotch(device, os);

  const metrics = mockupMetrics({
    device,
    bezel,
    hardware,
    orientation,
    resolution: resolution ?? RESOLUTIONS[device][size]
  });

  const { screen, body, frame, shell, screenRadius, stand, laptop } = metrics;
  const chrome = systemUi ? mockupChrome({ os, width: screen.width, notch }) : null;

  const boxRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState<number | null>(null);

  /*
   * How far the device has to shrink to fit the room it was given.
   *
   * Measured rather than computed, because the ratio is between a length only
   * the layout knows — how wide the box came out — and a length only this
   * component knows. Both axes are compared and the smaller wins, so a mockup
   * given a fixed height does not overflow the width it was not scaled against.
   */
  React.useEffect(() => {
    const box = boxRef.current;

    if (!box || typeof ResizeObserver === 'undefined') {
      return;
    }

    const measure = () => {
      const rect = box.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      setScale(Math.min(rect.width / frame.width, rect.height / frame.height));
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(box);

    return () => observer.disconnect();
  }, [frame.width, frame.height]);

  const setBoxRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      boxRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  return (
    <div
      ref={setBoxRef}
      data-mp-size={size}
      data-mp-device={device}
      data-mp-os={os}
      className={['mp-mockup relative', className ?? ''].filter(Boolean).join(' ')}
      style={{
        ...FINISHES[finish],
        width: cssLength(width) ?? (height === undefined ? '100%' : 'auto'),
        height: cssLength(height),
        // Outside the scale on purpose: the box keeps the device's proportions
        // whatever it is scaled to, so a mockup in a flex row takes the room a
        // device that shape would take rather than the room the unscaled one
        // would.
        aspectRatio: `${frame.width} / ${frame.height}`,
        ...style
      }}
      {...props}
    >
      <div
        className="mp-mockup__frame absolute top-1/2 left-1/2 flex flex-col items-center"
        style={{
          width: frame.width,
          height: frame.height,
          transform: `translate(-50%, -50%) scale(${scale ?? 1})`,
          transformOrigin: 'center',
          // Hidden until the first measurement has landed, or the device is
          // drawn at full size for one frame and then snaps.
          visibility: scale === null ? 'hidden' : undefined
        }}
      >
        <div
          className={`mp-mockup__body relative shrink-0 ${HARDWARE}`}
          style={{
            width: body.width,
            height: body.height,
            borderRadius: shell.radius,
            padding: `${shell.top}px ${shell.side}px ${shell.bottom}px`
          }}
        >
          <div
            className="mp-mockup__screen bg-mp-surface text-mp-on-surface relative flex size-full flex-col overflow-hidden"
            style={{ borderRadius: screenRadius }}
          >
            {chrome?.top}

            {/* The content, in a box of exactly what the system left it. A
                `flex-1` would be the same height until the day something inside
                asked for more, and then the page would grow the screen. */}
            <div
              className="mp-mockup__content relative min-h-0 overflow-hidden"
              style={{
                width: screen.width,
                height: screen.height - (chrome?.insetTop ?? 0) - (chrome?.insetBottom ?? 0)
              }}
            >
              {children}
            </div>

            {chrome?.bottom}

            <MockupCutout notch={notch} width={screen.width} />
          </div>
        </div>

        {stand ? (
          <React.Fragment>
            <div
              className={`mp-mockup__neck shrink-0 ${HARDWARE}`}
              style={{ width: stand.neckWidth, height: stand.neckHeight }}
            />
            <div
              className={`mp-mockup__foot shrink-0 ${HARDWARE}`}
              style={{
                width: stand.footWidth,
                height: stand.footHeight,
                borderRadius: stand.footHeight
              }}
            />
          </React.Fragment>
        ) : null}

        {laptop ? (
          <div
            className={`mp-mockup__base relative shrink-0 ${HARDWARE}`}
            style={{
              width: laptop.width,
              height: laptop.height,
              // A trapezium: the keyboard is wider at the front than where the
              // screen meets it, which is what makes it read as lying flat.
              clipPath: `polygon(2% 0, 98% 0, 100% 100%, 0 100%)`,
              borderRadius: `0 0 ${laptop.height * 0.5}px ${laptop.height * 0.5}px`
            }}
          >
            {/* The lip a lid is opened by. */}
            <span
              className="bg-(--_mp-device-edge) absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
              style={{ width: laptop.lipWidth, height: laptop.height * 0.28 }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
});
