import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPCombobox, MPTransfer } from 'material-plus-ui';
import { occurrenceKeys } from '../../src/internal/occurrence';

/**
 * A row keeps its element while a filter hides the rows before it.
 *
 * Keyed `${index}:${value}`, every row after the first one a filter dropped
 * changed its key, so typing a letter into a long list unmounted and remounted
 * every row below it — and lost whatever state it held.
 */
describe('a filtered list', () => {
  it('keeps the rows the filter left', async () => {
    const screen = await render(
      <MPTransfer
        searchable
        items={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Bravo' },
          { value: 'c', label: 'Charlie' }
        ]}
      />
    );
    const before = screen.getByText('Charlie').element();

    await screen.getByRole('textbox').first().fill('char');

    expect(screen.getByText('Charlie').element()).toBe(before);
  });

  it('keeps a combobox option while the options before it are filtered away', async () => {
    const screen = await render(
      <MPCombobox
        label="Fruit"
        items={[
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
          { value: 'cherry', label: 'Cherry' }
        ]}
      />
    );

    await screen.getByRole('combobox').click();

    const before = screen.getByRole('option', { name: 'Cherry' }).element();

    await screen.getByRole('combobox').fill('che');

    expect(screen.getByRole('option', { name: 'Cherry' }).element()).toBe(before);
  });
});

describe('occurrenceKeys', () => {
  it("tells a repeated value apart, and no value can spell another's key", () => {
    const entries = [{ v: 'a' }, { v: 'a' }, { v: '1:a' }, { v: 'b' }];
    const keys = occurrenceKeys(entries, (entry) => entry.v);

    expect([...keys.values()]).toEqual(['0:a', '1:a', '0:1:a', '0:b']);
    expect(new Set(keys.values()).size).toBe(entries.length);
  });
});
