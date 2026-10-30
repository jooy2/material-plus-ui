import type * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  MPBlockquote,
  MPCheckbox,
  MPRadio,
  MPRadioGroup,
  MPSelect,
  MPSwitch
} from 'material-plus-ui';

/**
 * What a block of text still wears when the page under it has no reset.
 *
 * `native-lists.test.tsx`'s argument, for the other elements a browser gives a
 * margin to. A `<p>` arrives with a block margin of one em, and a `<blockquote>`
 * or a `<figure>` with `1em 40px`. Base UI's `Field.Description` is a `<p>`, so
 * every line of supporting text sat an em below its control and an em above
 * the next one; a quote sat forty pixels in from its own rule. The documentation
 * site's scoped reset hid all of it.
 *
 * Measured against a bare element rendered in the same page. The block margin is
 * compared in ems, because the browser's is one em of whatever size the element
 * is set in, and the inline margin in pixels, because the browser's is a fixed
 * 40px.
 */

const TAGS = ['p', 'blockquote', 'figure'] as const;

interface Native {
  block: number;
  inline: number;
}

const emsOf = (styles: CSSStyleDeclaration, length: string) =>
  Number.parseFloat(length) / Number.parseFloat(styles.fontSize);

function nativeOf(tag: (typeof TAGS)[number]): Native {
  const element = document.createElement(tag);

  element.textContent = 'Native';
  document.body.append(element);

  const styles = getComputedStyle(element);
  const native = {
    block: emsOf(styles, styles.marginBlockStart),
    inline: Number.parseFloat(styles.marginInlineStart)
  };

  element.remove();

  return native;
}

/** Every paragraph, quote and figure on the page still carrying the browser's margin. */
function leftovers(): string[] {
  const natives = Object.fromEntries(TAGS.map((tag) => [tag, nativeOf(tag)])) as Record<
    (typeof TAGS)[number],
    Native
  >;
  const found: string[] = [];

  for (const element of document.body.querySelectorAll<HTMLElement>(TAGS.join(', '))) {
    const tag = element.tagName.toLowerCase() as (typeof TAGS)[number];
    const native = natives[tag];
    const styles = getComputedStyle(element);
    const own = [...element.classList].find((name) => name.startsWith('mp-'));
    const name = own ? `${tag}.${own}` : tag;

    if (
      native.block > 0 &&
      (Math.abs(emsOf(styles, styles.marginBlockStart) - native.block) < 0.01 ||
        Math.abs(emsOf(styles, styles.marginBlockEnd) - native.block) < 0.01)
    ) {
      found.push(`${name}: margin-block`);
    }

    if (native.inline > 0 && Number.parseFloat(styles.marginInlineStart) === native.inline) {
      found.push(`${name}: margin-inline`);
    }
  }

  return found;
}

describe('a block of text inside a component', () => {
  const cases: [string, React.ReactElement][] = [
    ['an MPBlockquote', <MPBlockquote key="quote">Said a thing</MPBlockquote>],
    [
      'an MPBlockquote with an attribution',
      <MPBlockquote key="figure" author="Ada" source="Notes">
        Said a thing
      </MPBlockquote>
    ],
    [
      'an MPBlockquote at every size',
      <div key="sizes">
        <MPBlockquote size="xs">Small</MPBlockquote>
        <MPBlockquote size="xl" author="Ada">
          Large
        </MPBlockquote>
      </div>
    ],
    [
      "an MPCheckbox's description",
      <MPCheckbox key="checkbox" label="Updates" description="Once a week." />
    ],
    ["an MPSwitch's description", <MPSwitch key="switch" label="Sync" description="Over Wi-Fi." />],
    [
      "an MPSelect's description",
      <MPSelect
        key="select"
        label="City"
        description="Where it ships."
        items={[{ value: 'seoul', label: 'Seoul' }]}
      />
    ],
    [
      "an MPRadioGroup's description and an MPRadio's",
      <MPRadioGroup key="radio" label="Delivery" description="Pick one." defaultValue="standard">
        <MPRadio value="standard" label="Standard" description="Three days." />
        <MPRadio value="express" label="Express" description="Next day." />
      </MPRadioGroup>
    ]
  ];

  it.each(cases)('keeps nothing the browser gave it in %s', async (_name, node) => {
    await render(node);

    expect(leftovers()).toEqual([]);
  });

  it('still lets a margin passed in `className` apply to an MPBlockquote', async () => {
    // The zero is on the component's own element, so a caller's spacing must not
    // be what loses to it. `mt-2` rather than anything larger because the test
    // page's stylesheet is generated from the library's own classes, and this is
    // one it already has.
    const screen = await render(
      <MPBlockquote className="mt-2" data-testid="quote" author="Ada">
        Said a thing
      </MPBlockquote>
    );

    expect(getComputedStyle(screen.getByTestId('quote').element()).marginTop).toBe('8px');
  });
});
