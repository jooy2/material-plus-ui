import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { render } from 'vitest-browser-react';
import { MPCheckbox, MPFieldset, MPTextField } from 'material-plus-ui';

function Street() {
  const [value, setValue] = useState('');

  return <MPTextField name="street" label="Street" value={value} onChange={setValue} />;
}

describe('MPFieldset', () => {
  describe('the group', () => {
    it('is a real `<fieldset>`, which is what makes `disabled` reach inside', async () => {
      const screen = await render(
        <MPFieldset legend="Billing address">
          <Street />
        </MPFieldset>
      );

      expect(screen.container.querySelector('.mp-fieldset')!.tagName).toBe('FIELDSET');
    });

    it('names every control inside it', async () => {
      const screen = await render(
        <MPFieldset legend="Billing address">
          <Street />
        </MPFieldset>
      );

      await expect
        .element(screen.getByRole('group', { name: 'Billing address' }))
        .toBeInTheDocument();
    });

    it('draws a description under the legend', async () => {
      const screen = await render(
        <MPFieldset legend="Billing address" description="Where the invoice goes">
          <Street />
        </MPFieldset>
      );

      await expect.element(screen.getByText('Where the invoice goes')).toBeInTheDocument();
    });

    it('draws no legend block at all when there is nothing to put in one', async () => {
      const screen = await render(
        <MPFieldset>
          <Street />
        </MPFieldset>
      );

      expect(screen.container.querySelector('.mp-fieldset__legend')).toBeNull();
    });

    it('gives up the browser’s own border, padding and margin', async () => {
      const screen = await render(
        <MPFieldset legend="Billing address">
          <Street />
        </MPFieldset>
      );
      const group = screen.container.querySelector('.mp-fieldset')!;
      const style = getComputedStyle(group);

      expect(style.borderTopWidth).toBe('0px');
      expect(style.paddingTop).toBe('0px');
      expect(style.marginInlineStart).toBe('0px');
    });

    it('stacks its controls on the ladder', async () => {
      const screen = await render(
        <MPFieldset legend="Billing address" size="xs">
          <Street />
        </MPFieldset>
      );

      expect(screen.container.querySelector('.mp-fieldset')!.className).toContain('gap-1.5');
    });
  });

  describe('disabled', () => {
    it('reaches every control inside, including ones it never heard of', async () => {
      const screen = await render(
        <MPFieldset legend="Billing address" disabled>
          <Street />
          <MPCheckbox label="Same as delivery" />
        </MPFieldset>
      );

      await expect.element(screen.getByRole('textbox', { name: 'Street' })).toBeDisabled();
      await expect
        .element(screen.getByRole('checkbox', { name: 'Same as delivery' }))
        .toBeDisabled();
    });

    it('leaves them alone otherwise', async () => {
      const screen = await render(
        <MPFieldset legend="Billing address">
          <Street />
        </MPFieldset>
      );

      await expect.element(screen.getByRole('textbox', { name: 'Street' })).not.toBeDisabled();
    });
  });

  it('draws no surface of its own', async () => {
    // A group of fields is a grouping and not a sheet, and a fieldset that
    // painted one would be a second sheet inside the card it is in.
    const screen = await render(
      <MPFieldset legend="Billing address">
        <Street />
      </MPFieldset>
    );
    const style = getComputedStyle(screen.container.querySelector('.mp-fieldset')!);

    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(style.boxShadow).toBe('none');
  });
});
