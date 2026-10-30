import { afterEach, describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  MPCheckbox,
  MPNumberField,
  MPRadio,
  MPRadioGroup,
  MPSwitch,
  MPTextField
} from 'material-plus-ui';
import { cleanupHydrated, hydrateFromServer } from '../support/hydrate';

/**
 * A field's label points at its control in the markup a server sends, not only
 * once the page has hydrated.
 *
 * The label named the caller's `id` while Base UI drew the control with a
 * generated one until a layout effect swapped it in — so the server's
 * `<label for>` named an element that did not exist, the label named nothing
 * for a reader who arrived before the script, and every field rendered again
 * to repair it.
 */
function labelled(root: ParentNode, text: string) {
  const label = [...root.querySelectorAll('label')].find((one) => one.textContent?.includes(text))!;

  return root.querySelector(`[id="${label.htmlFor}"]`);
}

const FIELDS = [
  ['MPTextField', <MPTextField key="t" label="Email" value="" onChange={() => {}} />, 'Email'],
  ['MPNumberField', <MPNumberField key="n" label="Quantity" locale="en-US" />, 'Quantity'],
  ['MPCheckbox', <MPCheckbox key="c" label="Agree" />, 'Agree'],
  ['MPSwitch', <MPSwitch key="s" label="Wi-Fi" />, 'Wi-Fi'],
  [
    'MPRadioGroup',
    <MPRadioGroup key="r" label="Size">
      <MPRadio value="s" label="Small" />
    </MPRadioGroup>,
    'Small'
  ]
] as const;

describe('a field label', () => {
  afterEach(cleanupHydrated);

  it.each(FIELDS)("names %s's control in the server's markup", (_, field, text) => {
    const sketch = document.createElement('div');

    sketch.innerHTML = renderToString(field);

    expect(labelled(sketch, text)).not.toBeNull();
  });

  it.each(FIELDS)("still names %s's control after hydration", async (_, field, text) => {
    const { container, errors } = await hydrateFromServer(field);

    expect(errors).toEqual([]);
    expect(labelled(container, text)).not.toBeNull();
  });

  it('follows an `id` the caller gave, once hydrated', async () => {
    const { container } = await hydrateFromServer(
      <MPTextField id="email" label="Email" value="" onChange={() => {}} />
    );

    expect(labelled(container, 'Email')!.id).toBe('email');
  });
});
