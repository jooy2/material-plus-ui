/**
 * The parts a device mockup is drawn out of.
 *
 * `MPMockup` is one component with a lot of pictures in it: three devices, six
 * systems, four bezels, three finishes and four cut-outs. Kept in the component
 * that would be a thousand-line file whose interesting fifty lines — the scale,
 * the screen, the content — are buried in geometry.
 *
 * So the geometry lives here, as tables and small drawings, and the component
 * is left holding the decisions: what a caller asked for, what the device
 * implies when they did not, and how big it all comes out on the page.
 *
 * ## Why the numbers are in the screen's own pixels
 *
 * Every measurement below is in the device's logical resolution rather than in
 * page pixels, and that is what makes one scale at the end work: a bezel that
 * was 14 device pixels stays 14 device pixels whether the mockup is drawn at
 * full size or at a third of it, so the hardware never thickens as the picture
 * shrinks.
 *
 * ## What is not a token
 *
 * The finishes. A graphite phone stays graphite on a page switched to dark,
 * because the hardware is a photograph of an object rather than a surface of
 * this library's — a mockup whose aluminium turned white with the page would be
 * a mockup of nothing.
 */
import * as React from 'react';
import type { MPSize } from '../types';

/** Which machine the mockup is a picture of. */
export type MPMockupDevice = 'desktop' | 'tablet' | 'mobile';

/** The system whose chrome is drawn on the screen. */
export type MPMockupOs = 'macos' | 'windows' | 'linux' | 'ios' | 'ipados' | 'android';

/** What holds a desktop screen up. */
export type MPMockupHardware = 'monitor' | 'laptop';

/** The camera cut-out along the top edge of a handheld. */
export type MPMockupNotch = 'none' | 'notch' | 'dynamic-island' | 'punch-hole';

/**
 * How much hardware there is around the screen.
 *
 * `none` is not a thinner bezel — it is no hardware at all, leaving the screen
 * on its own with its corners cut, which is what a mockup that only wants the
 * viewport is asking for.
 */
export type MPMockupBezel = 'none' | 'thin' | 'standard' | 'thick';

/** What the hardware is made of. */
export type MPMockupFinish = 'graphite' | 'silver' | 'white';

/** Which way a handheld is held. */
export type MPMockupOrientation = 'portrait' | 'landscape';

/** A screen's logical size, in CSS pixels. */
export interface MPMockupResolution {
  width: number;
  height: number;
}

/** Which systems each device can be running. */
const SYSTEMS: Record<MPMockupDevice, readonly MPMockupOs[]> = {
  desktop: ['macos', 'windows', 'linux'],
  tablet: ['ipados', 'android'],
  mobile: ['ios', 'android']
};

/** What each device runs when nothing said. */
const DEFAULT_OS: Record<MPMockupDevice, MPMockupOs> = {
  desktop: 'macos',
  tablet: 'ipados',
  mobile: 'ios'
};

/**
 * The system to draw, with a mismatch corrected rather than refused.
 *
 * `os="macos"` on a phone is a caller who changed `device` and forgot the other
 * prop, and the useful answer is the phone's own system — not a desktop menu
 * bar across a 390-pixel screen.
 */
export function resolveOs(device: MPMockupDevice, os?: MPMockupOs): MPMockupOs {
  return os && SYSTEMS[device].includes(os) ? os : DEFAULT_OS[device];
}

/** The cut-out a device would have if nobody said otherwise. */
export function defaultNotch(device: MPMockupDevice, os: MPMockupOs): MPMockupNotch {
  if (device !== 'mobile') {
    return 'none';
  }

  return os === 'ios' ? 'dynamic-island' : 'punch-hole';
}

/**
 * Five real resolutions per device, which is what `size` picks between.
 *
 * Real ones rather than a smooth ladder, because the number that matters is the
 * one a media query fires at: a layout tested at 390 and at 430 has been tested
 * at the two widths most phones actually are, and a made-up 400 would be a
 * width nobody's device has.
 */
export const RESOLUTIONS: Record<MPMockupDevice, Record<MPSize, MPMockupResolution>> = {
  mobile: {
    xs: { width: 320, height: 568 },
    sm: { width: 360, height: 780 },
    md: { width: 390, height: 844 },
    lg: { width: 414, height: 896 },
    xl: { width: 430, height: 932 }
  },
  tablet: {
    xs: { width: 744, height: 1133 },
    sm: { width: 810, height: 1080 },
    md: { width: 820, height: 1180 },
    lg: { width: 1024, height: 1366 },
    xl: { width: 1032, height: 1376 }
  },
  desktop: {
    xs: { width: 1024, height: 640 },
    sm: { width: 1280, height: 800 },
    md: { width: 1440, height: 900 },
    lg: { width: 1680, height: 1050 },
    xl: { width: 1920, height: 1200 }
  }
};

/** How much hardware sits on each side of the screen, in screen pixels. */
interface Shell {
  side: number;
  top: number;
  bottom: number;
  /** The outer corner. The screen's own is this minus `side`. */
  radius: number;
}

/**
 * The hardware, per device and per bezel.
 *
 * `thick` is an older machine rather than a thicker version of the same one: a
 * forehead and a chin above and below a screen with narrow sides, and a much
 * squarer corner, because that is what a device with a bezel that size was.
 */
const SHELLS: Record<MPMockupDevice, Record<'thin' | 'standard' | 'thick', Shell>> = {
  mobile: {
    thin: { side: 10, top: 10, bottom: 10, radius: 46 },
    standard: { side: 14, top: 14, bottom: 14, radius: 52 },
    thick: { side: 12, top: 62, bottom: 82, radius: 26 }
  },
  tablet: {
    thin: { side: 14, top: 14, bottom: 14, radius: 28 },
    standard: { side: 22, top: 22, bottom: 22, radius: 36 },
    thick: { side: 20, top: 58, bottom: 58, radius: 22 }
  },
  desktop: {
    thin: { side: 10, top: 10, bottom: 10, radius: 12 },
    standard: { side: 14, top: 14, bottom: 52, radius: 16 },
    thick: { side: 20, top: 20, bottom: 72, radius: 10 }
  }
};

/** The corner a screen keeps when there is no hardware around it. */
const BARE_RADIUS: Record<MPMockupDevice, number> = { mobile: 44, tablet: 26, desktop: 8 };

/** What the stand under a desktop is made of, in screen pixels. */
interface Stand {
  neckWidth: number;
  neckHeight: number;
  footWidth: number;
  footHeight: number;
}

/**
 * Everything the component needs to draw one device, resolved.
 *
 * One object rather than eight return values, because the frame's size is the
 * sum of the rest and a caller that recomputed it would be a second place for
 * the arithmetic to be wrong.
 */
export interface MPMockupMetrics {
  screen: MPMockupResolution;
  /** The device itself: the screen plus its hardware. */
  body: MPMockupResolution;
  /** The whole picture: the body plus whatever holds it up. */
  frame: MPMockupResolution;
  shell: Shell;
  screenRadius: number;
  stand: Stand | null;
  /** The wedge a laptop sits on, drawn as a trapezium. */
  laptop: { width: number; height: number; lipWidth: number } | null;
}

export function mockupMetrics(options: {
  device: MPMockupDevice;
  bezel: MPMockupBezel;
  hardware: MPMockupHardware;
  orientation: MPMockupOrientation;
  resolution: MPMockupResolution;
}): MPMockupMetrics {
  const { device, bezel, hardware, orientation, resolution } = options;

  /*
   * The turn happens here and nowhere else.
   *
   * A landscape handheld is the same device with its screen the other way
   * round, so swapping the two numbers once — before anything is measured
   * against them — is what keeps the bezel, the cut-out and the chrome all
   * turning together. Rotating the drawn result instead would turn the words in
   * the status bar on their side.
   */
  const turned = device !== 'desktop' && orientation === 'landscape';
  const screen = turned
    ? { width: resolution.height, height: resolution.width }
    : { width: resolution.width, height: resolution.height };

  if (bezel === 'none') {
    return {
      screen,
      body: screen,
      frame: screen,
      shell: { side: 0, top: 0, bottom: 0, radius: BARE_RADIUS[device] },
      screenRadius: BARE_RADIUS[device],
      stand: null,
      laptop: null
    };
  }

  const shell = SHELLS[device][bezel];
  const body = {
    width: screen.width + shell.side * 2,
    height: screen.height + shell.top + shell.bottom
  };

  if (device !== 'desktop') {
    return {
      screen,
      body,
      frame: body,
      shell,
      // A screen's corner is the outer corner less the hardware between them.
      // Kept at a floor rather than allowed to go negative, which a `thick`
      // device's narrow sides would otherwise do.
      screenRadius: Math.max(2, shell.radius - shell.side),
      stand: null,
      laptop: null
    };
  }

  if (hardware === 'laptop') {
    // A wedge in front rather than a neck under: the screen sits on the back
    // edge of a keyboard, and the lip is the notch a lid is opened by.
    const laptop = {
      width: Math.round(body.width * 1.14),
      height: Math.round(body.height * 0.028) + 12,
      lipWidth: Math.round(body.width * 0.12)
    };

    return {
      screen,
      body,
      frame: { width: laptop.width, height: body.height + laptop.height },
      shell,
      screenRadius: Math.max(2, shell.radius - shell.side),
      stand: null,
      laptop
    };
  }

  const stand: Stand = {
    neckWidth: Math.round(body.width * 0.16),
    neckHeight: Math.round(body.height * 0.11),
    footWidth: Math.round(body.width * 0.42),
    footHeight: Math.max(8, Math.round(body.height * 0.018))
  };

  return {
    screen,
    body,
    frame: {
      width: Math.max(body.width, stand.footWidth),
      height: body.height + stand.neckHeight + stand.footHeight
    },
    shell,
    screenRadius: Math.max(2, shell.radius - shell.side),
    stand,
    laptop: null
  };
}

/**
 * The three finishes, as fixed colours.
 *
 * Not tokens, and not derived from the source colour: a graphite phone stays
 * graphite on a page switched to dark, because the hardware is a photograph of
 * an object rather than a surface of this library's. A mockup whose aluminium
 * turned white with the page would be a mockup of nothing.
 *
 * Two slots each — the face and the edge — because the hardware is drawn as a
 * flat face with a hairline of a darker shade inside it, which is what reads as
 * an edge rather than as a border.
 */
export const FINISHES: Record<MPMockupFinish, React.CSSProperties> = {
  graphite: { '--_mp-device': '#2f3033', '--_mp-device-edge': '#131416' } as React.CSSProperties,
  silver: { '--_mp-device': '#d8d9dd', '--_mp-device-edge': '#a3a5aa' } as React.CSSProperties,
  white: { '--_mp-device': '#f3f3f5', '--_mp-device-edge': '#c8c9ce' } as React.CSSProperties
};

/** What every piece of hardware is painted with. */
export const HARDWARE = 'bg-(--_mp-device) ring-1 ring-(--_mp-device-edge) ring-inset';

/**
 * The camera cut-out, drawn into the top edge of the screen.
 *
 * Hardware rather than chrome, so it is drawn whether or not `systemUi` is on —
 * a phone does not stop having a camera because the status bar was turned off.
 * It sits over the screen rather than taking room from it, which is what the
 * real thing does: the content runs underneath and the system inset keeps the
 * words clear of it.
 */
export function MockupCutout({ notch, width }: { notch: MPMockupNotch; width: number }) {
  if (notch === 'none') {
    return null;
  }

  if (notch === 'punch-hole') {
    const size = Math.round(width * 0.032);

    return (
      <span
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
        style={{ top: size * 0.8, width: size, height: size }}
      />
    );
  }

  if (notch === 'dynamic-island') {
    const height = Math.round(width * 0.09);

    return (
      <span
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
        style={{ top: height * 0.35, width: Math.round(width * 0.31), height }}
      />
    );
  }

  // The older notch: a tab hanging off the top edge, square across the top and
  // rounded only where it meets the screen.
  const height = Math.round(width * 0.075);

  return (
    <span
      aria-hidden="true"
      className="absolute top-0 left-1/2 -translate-x-1/2 bg-black"
      style={{
        width: Math.round(width * 0.52),
        height,
        borderBottomLeftRadius: height * 0.6,
        borderBottomRightRadius: height * 0.6
      }}
    />
  );
}

/** A rounded block standing in for a word, an icon or a window. */
function Tile({ width, height, round }: { width: number; height: number; round?: boolean }) {
  return (
    <span
      className="bg-mp-on-surface/38 shrink-0"
      style={{ width, height, borderRadius: round ? '9999px' : height * 0.3 }}
    />
  );
}

/** A row of them, in the widths a row of menu names actually has. */
function Tiles({
  widths,
  height,
  gap,
  round
}: {
  widths: readonly number[];
  height: number;
  gap: number;
  round?: boolean;
}) {
  return (
    <span className="flex items-center" style={{ gap }}>
      {widths.map((width, index) => (
        <Tile key={index} width={width} height={height} round={round} />
      ))}
    </span>
  );
}

/** The three glyphs at the end of a handheld's status bar. */
function StatusGlyphs({ height }: { height: number }) {
  const bar = Math.max(1, Math.round(height * 0.18));

  return (
    <span className="flex items-end" style={{ gap: height * 0.4 }}>
      {/* Signal: four bars climbing. Drawn rather than taken from the icon set,
          because the set is an outline family and this is four rectangles. */}
      <span className="flex items-end" style={{ gap: bar * 0.6 }}>
        {[0.4, 0.6, 0.8, 1].map((share) => (
          <span
            key={share}
            className="bg-mp-on-surface rounded-[1px]"
            style={{ width: bar, height: height * share }}
          />
        ))}
      </span>

      {/* Wi-Fi: three arcs, as a quarter-circle border on nested boxes. */}
      <span className="relative" style={{ width: height * 1.2, height }}>
        {[1, 0.62, 0.26].map((share, index) => (
          <span
            key={share}
            className="border-mp-on-surface absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full border-t"
            style={{
              width: height * 1.2 * share,
              height: height * share,
              borderWidth: index === 2 ? height * 0.3 : bar
            }}
          />
        ))}
      </span>

      {/* Battery: a body, a nub and a fill. */}
      <span className="flex items-center" style={{ gap: bar * 0.8 }}>
        <span
          className="border-mp-on-surface/60 relative rounded-[2px] border"
          style={{ width: height * 1.9, height, padding: bar * 0.6 }}
        >
          <span className="bg-mp-on-surface block h-full rounded-[1px]" style={{ width: '68%' }} />
        </span>
        <span
          className="bg-mp-on-surface/60 rounded-r-[1px]"
          style={{ width: bar, height: height * 0.4 }}
        />
      </span>
    </span>
  );
}

/** Android's three navigation glyphs: back, home, recents. */
function NavGlyphs({ size }: { size: number }) {
  return (
    <span className="flex items-center" style={{ gap: size * 1.6 }}>
      <span
        className="border-mp-on-surface rotate-45 border-b-2 border-l-2"
        style={{ width: size * 0.6, height: size * 0.6 }}
      />
      <span
        className="border-mp-on-surface rounded-full border-2"
        style={{ width: size * 0.75, height: size * 0.75 }}
      />
      <span
        className="border-mp-on-surface rounded-[2px] border-2"
        style={{ width: size * 0.7, height: size * 0.7 }}
      />
    </span>
  );
}

/** What one system puts above and below the content. */
export interface MPMockupChrome {
  top: React.ReactNode;
  bottom: React.ReactNode;
  /** How much room each takes out of the screen, in screen pixels. */
  insetTop: number;
  insetBottom: number;
}

/**
 * A system's own bars.
 *
 * Each takes its own room out of the screen rather than covering the content,
 * so turning `systemUi` off gives the screen back to `children` rather than
 * uncovering something that was hidden underneath.
 *
 * The bars are drawn out of this library's own roles — `surface`, `on-surface`
 * — rather than out of each system's real colours, and that is the line this
 * component keeps: the *hardware* is a photograph and has fixed colours, the
 * *software* on the screen is a page and follows the page. A macOS menu bar
 * that stayed light on a dark mockup would be a picture of somebody else's
 * screenshot rather than a frame around yours.
 */
export function mockupChrome(options: {
  os: MPMockupOs;
  width: number;
  notch: MPMockupNotch;
}): MPMockupChrome {
  const { os, width, notch } = options;
  const unit = Math.max(10, Math.round(width * 0.035));
  const glyph = Math.round(unit * 0.36);
  const pad = Math.round(unit * 0.5);

  const bar = 'text-mp-on-surface pointer-events-none flex shrink-0 items-center';

  if (os === 'ios' || os === 'ipados' || os === 'android') {
    // A cut-out pushes the status bar's own content down and out from under it;
    // with none, the bar is only as tall as what is in it.
    const height = notch === 'none' ? Math.round(unit * 1.3) : Math.round(unit * 2.2);
    const indicator = Math.round(unit * 1.4);

    const top = (
      <span
        className={`${bar} justify-between`}
        style={{
          height,
          paddingInline: pad * 2,
          paddingTop: notch === 'none' ? 0 : Math.round(unit * 0.6)
        }}
      >
        <Tile width={Math.round(unit * 1.4)} height={glyph} />
        <StatusGlyphs height={glyph} />
      </span>
    );

    if (os === 'android') {
      return {
        top,
        bottom: (
          <span className={`${bar} justify-center`} style={{ height: Math.round(unit * 1.8) }}>
            <NavGlyphs size={glyph * 1.6} />
          </span>
        ),
        insetTop: height,
        insetBottom: Math.round(unit * 1.8)
      };
    }

    return {
      top,
      bottom: (
        <span className={`${bar} justify-center`} style={{ height: indicator }}>
          <span
            className="bg-mp-on-surface/60 rounded-full"
            style={{ width: Math.round(width * 0.36), height: Math.max(3, glyph * 0.28) }}
          />
        </span>
      ),
      insetTop: height,
      insetBottom: indicator
    };
  }

  if (os === 'macos') {
    const menuHeight = Math.round(unit * 0.95);
    const dockHeight = Math.round(unit * 2.1);
    const dockTile = Math.round(unit * 1.3);

    return {
      top: (
        <span
          className={`${bar} bg-mp-surface-container/80 justify-between`}
          style={{ height: menuHeight, paddingInline: pad * 1.5, gap: pad * 2 }}
        >
          <span className="flex items-center" style={{ gap: pad }}>
            {/* The three lights, in their own fixed colours: they are the one
                piece of chrome that is a shape rather than a surface, and a red
                that followed the page would stop being the close button. */}
            <span className="flex items-center" style={{ gap: pad * 0.7 }}>
              {['#ff5f57', '#febc2e', '#28c840'].map((colour) => (
                <span
                  key={colour}
                  className="rounded-full"
                  style={{ width: glyph, height: glyph, background: colour }}
                />
              ))}
            </span>
            <Tiles widths={[glyph * 3, glyph * 2, glyph * 2.4]} height={glyph} gap={pad} />
          </span>
          <Tiles widths={[glyph * 1.6, glyph * 3]} height={glyph} gap={pad} />
        </span>
      ),
      bottom: (
        <span className={`${bar} justify-center`} style={{ height: dockHeight }}>
          <span
            className="bg-mp-surface-container-high/80 flex items-center rounded-[18%]"
            style={{ gap: pad, padding: pad }}
          >
            {[0, 1, 2, 3, 4].map((index) => (
              <Tile key={index} width={dockTile} height={dockTile} />
            ))}
          </span>
        </span>
      ),
      insetTop: menuHeight,
      insetBottom: dockHeight
    };
  }

  // Windows and Linux: one bar, and they differ in where its contents sit.
  const barHeight = Math.round(unit * 1.5);
  const tile = Math.round(unit * 0.95);

  if (os === 'windows') {
    return {
      top: null,
      bottom: (
        <span
          className={`${bar} bg-mp-surface-container/85 justify-center`}
          style={{ height: barHeight, gap: pad * 1.5 }}
        >
          {/* The start button, drawn as the four panes it has been for thirty
              years, and a row of pinned windows beside it. */}
          <span
            className="grid shrink-0"
            style={{ width: tile, height: tile, gap: tile * 0.14, gridTemplateColumns: '1fr 1fr' }}
          >
            {[0, 1, 2, 3].map((index) => (
              <span key={index} className="bg-mp-on-surface/60 rounded-[1px]" />
            ))}
          </span>
          <Tiles widths={[tile, tile, tile, tile]} height={tile} gap={pad} />
        </span>
      ),
      insetTop: 0,
      insetBottom: barHeight
    };
  }

  return {
    top: (
      <span
        className={`${bar} bg-mp-surface-container/85 justify-between`}
        style={{ height: barHeight, paddingInline: pad * 2 }}
      >
        <Tiles widths={[glyph * 3, glyph * 2]} height={glyph} gap={pad} />
        <Tile width={glyph * 3.4} height={glyph} />
        <Tiles widths={[glyph * 1.6, glyph * 1.6, glyph * 2.4]} height={glyph} gap={pad} />
      </span>
    ),
    bottom: null,
    insetTop: barHeight,
    insetBottom: 0
  };
}
