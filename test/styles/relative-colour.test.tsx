import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import source from '../../src/styles.css?raw';

/**
 * The colour roles, held to what they promise in the two places a browser
 * cannot check for itself.
 *
 * `src/styles.css` derives the roles with relative colour syntax and pulls the
 * accent and error roles back inside sRGB with the same syntax. It then writes
 * the whole default scheme out a second time, as plain colours, for the
 * browsers that have neither. None of the three engines this suite runs in
 * takes that second copy, so nothing here can watch it being used. What the
 * suite can do is hold the copy to the roles it stands in for, and hold the
 * roles to sRGB.
 *
 * Read as `?raw` with the comments taken out, like the breakpoint test, so the
 * prose around the blocks cannot be mistaken for the blocks.
 */
const declarations = source.replace(/\/\*[\s\S]*?\*\//g, '');

const FALLBACK = declarations.indexOf('@supports not (');

/** The index of the brace that closes the one opening at or after `from`. */
function closing(css: string, from: number): number {
  let depth = 0;

  for (let i = css.indexOf('{', from); i < css.length; i++) {
    if (css[i] === '{') {
      depth++;
    } else if (css[i] === '}' && --depth === 0) {
      return i;
    }
  }

  throw new Error('src/styles.css: a block never closes');
}

/** The CSS inside the braces that open at or after `from`. */
function braced(css: string, from: number): string {
  return css.slice(css.indexOf('{', from) + 1, closing(css, from));
}

/** The fallback block's condition, its body, and the sheet with the block cut out. */
function fallback(): { condition: string; body: string; rest: string } {
  if (FALLBACK === -1) {
    throw new Error('src/styles.css: no `@supports not (…)` block for the colour roles');
  }

  const header = declarations.slice(FALLBACK, declarations.indexOf('{', FALLBACK));

  return {
    condition: header.replace('@supports', '').replace(/\s+/g, ' ').trim(),
    body: braced(declarations, FALLBACK),
    rest: declarations.slice(0, FALLBACK) + declarations.slice(closing(declarations, FALLBACK) + 1)
  };
}

/** The body of the first rule in `css` whose selector list starts with `selector`. */
function rule(css: string, selector: string): string {
  const at = css.indexOf(selector);

  if (at === -1) {
    throw new Error(`src/styles.css: no \`${selector}\` rule in the fallback block`);
  }

  return braced(css, at);
}

/**
 * Every custom property a piece of CSS declares, value by name.
 *
 * Whitespace is collapsed and taken off the inside of every bracket, because the
 * formatter breaks a long value wherever it runs out of line and the values are
 * compared as text.
 */
function customProperties(css: string, prefix: string): Map<string, string> {
  const found = new Map<string, string>();
  const pattern = new RegExp(`(${prefix}[a-z0-9-]*)\\s*:`, 'g');
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(css))) {
    let depth = 0;
    let end = pattern.lastIndex;

    for (; end < css.length; end++) {
      if (css[end] === '(') {
        depth++;
      } else if (css[end] === ')') {
        depth--;
      } else if (css[end] === ';' && depth === 0) {
        break;
      }
    }

    found.set(
      match[1],
      css
        .slice(pattern.lastIndex, end)
        .replace(/\s+/g, ' ')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .trim()
    );
    pattern.lastIndex = end;
  }

  return found;
}

/** The roles as the rest of the sheet declares them, whose value contains `needle`. */
function rolesContaining(needle: string): string[] {
  return [...customProperties(fallback().rest, '--_mp-color-')]
    .filter(([, value]) => value.includes(needle))
    .map(([name]) => name);
}

/** A colour as the four bytes a canvas paints it with, so no engine's serialisation matters. */
function bytes(colour: string): number[] {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    throw new Error('No 2D canvas context');
  }

  canvas.width = 1;
  canvas.height = 1;
  context.fillStyle = colour;
  context.fillRect(0, 0, 1, 1);

  return Array.from(context.getImageData(0, 0, 1, 1).data);
}

function hex(colour: string): string {
  return `#${bytes(colour)
    .slice(0, 3)
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** The background an element resolves once `style` is on it. */
function paint(host: Element, style: string): string {
  const element = document.createElement('div');

  element.setAttribute('style', style);
  host.appendChild(element);

  const colour = getComputedStyle(element).backgroundColor;

  element.remove();

  return colour;
}

describe('the colour roles', () => {
  it('are drawn from the fallback block only by a browser that cannot compute them', () => {
    // A condition that passed here would put the default scheme over every
    // `--mp-source-color` a consumer sets, in the browsers that do support it.
    expect(CSS.supports(fallback().condition)).toBe(false);
  });

  it('give every role that needs relative colour syntax a fallback, behind the same two overrides', () => {
    const derived = rolesContaining('from ');
    const written = customProperties(rule(fallback().body, '*'), '--_mp-color-');

    // Twenty-four derived from the source colour, and the four error roles,
    // which are only brought inside sRGB.
    expect(derived).toHaveLength(28);
    expect([...written.keys()].sort()).toEqual([...derived].sort());

    for (const [name, value] of written) {
      const role = name.replace('--_mp-color-', '');

      expect(value, name).toBe(
        `var(--mp-sys-color-${role}, var(--md-sys-color-${role}, var(--_mp-fallback-${role})))`
      );
    }
  });

  it('write the dark scheme the same for the media query as for the attribute', () => {
    const body = fallback().body;
    const media = customProperties(rule(body, ':root:not('), '--_mp-fallback-');
    const attribute = customProperties(rule(body, "[data-mp-scheme='dark']"), '--_mp-fallback-');

    expect(media.size).toBe(28);
    expect([...media]).toEqual([...attribute]);
  });

  it('write the default scheme as the colours the roles draw, in both schemes', async () => {
    const body = fallback().body;
    const schemes = {
      light: customProperties(rule(body, ':root,'), '--_mp-fallback-'),
      dark: customProperties(rule(body, "[data-mp-scheme='dark']"), '--_mp-fallback-')
    };

    for (const [scheme, literals] of Object.entries(schemes)) {
      const screen = await render(<div data-testid={scheme} data-mp-scheme={scheme} />);
      const host = screen.getByTestId(scheme).element();

      expect(literals.size, scheme).toBe(28);

      for (const [name, literal] of literals) {
        const drawn = paint(host, `background-color: var(${name.replace('fallback', 'color')})`);

        // Four steps of slack: the engines round the gamut step a little
        // differently, and the literal is one engine's answer in eight bits.
        bytes(drawn).forEach((channel, i) => {
          expect(
            Math.abs(channel - bytes(literal)[i]),
            `${scheme} ${name} is ${literal}, the roles draw ${hex(drawn)}`
          ).toBeLessThanOrEqual(4);
        });
      }
    }
  });

  it('keep the accent and error roles inside sRGB, whatever the source colour', async () => {
    const limited = rolesContaining('srgb-linear');

    expect(limited).toHaveLength(17);

    // The default, MD3's baseline, and the most saturated colours sRGB has at
    // three hues, which are the sources that fall furthest outside it.
    const screen = await render(<div data-testid="gamut" />);
    const host = screen.getByTestId('gamut').element() as HTMLElement;

    for (const sourceColor of ['#00639b', '#6750a4', '#0000ff', '#ff0000', '#00ff00']) {
      for (const scheme of ['light', 'dark']) {
        host.setAttribute('data-mp-scheme', scheme);
        host.style.setProperty('--mp-source-color', sourceColor);

        for (const name of limited) {
          const drawn = paint(host, `background-color: var(${name})`);
          const channels = /^color\(srgb-linear ([^)]+)\)$/.exec(drawn)?.[1];

          expect(channels, `${sourceColor} ${scheme} ${name} is ${drawn}`).toBeDefined();

          for (const channel of channels!.split(' ').slice(0, 3).map(Number)) {
            expect(channel, `${sourceColor} ${scheme} ${name}`).toBeGreaterThanOrEqual(-0.001);
            expect(channel, `${sourceColor} ${scheme} ${name}`).toBeLessThanOrEqual(1.001);
          }
        }
      }
    }
  });

  it('draw the `on-` roles of the light scheme in white, as MD3 does', async () => {
    const screen = await render(<div data-testid="white" data-mp-scheme="light" />);
    const host = screen.getByTestId('white').element();

    for (const role of ['on-primary', 'on-secondary', 'on-tertiary', 'on-error']) {
      bytes(paint(host, `background-color: var(--_mp-color-${role})`))
        .slice(0, 3)
        .forEach((channel) => expect(channel, role).toBeGreaterThanOrEqual(254));
    }
  });
});
