import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  MPCommandPalette,
  MPDialog,
  MPDrawer,
  MPSelect,
  type MPCommand,
  type MPSelectOption
} from 'material-plus-ui';

const OPTIONS: MPSelectOption[] = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' }
];

const ITEMS: MPCommand[] = [{ value: 'open', label: 'Open file' }];

/**
 * The parts a `className` cannot reach, and the assertion that each one can now
 * be reached.
 *
 * Every case here renders at the end of `<body>` — outside the element
 * `className` lands on — or is drawn from data rather than written by the
 * caller. Both are ways of being unreachable that a page only discovers after
 * it has tried, so each is checked against the document rather than against the
 * render container.
 */
describe('classNames', () => {
  it('reaches a select’s popup and its options', async () => {
    const screen = await render(
      <MPSelect label="Count" items={OPTIONS} classNames={{ popup: 'my-popup', item: 'my-item' }} />
    );

    // The popup is portalled and mounts in an effect rather than in the commit
    // the click produced, so the list has to be waited for rather than read.
    await screen.getByRole('combobox').click();
    await expect.element(screen.getByRole('listbox')).toBeInTheDocument();

    expect(document.querySelector('.mp-select__popup')).toHaveClass('my-popup');
    expect(document.querySelectorAll('.mp-select__item.my-item')).toHaveLength(OPTIONS.length);
  });

  it('reaches a dialog’s backdrop, which is a sibling of the sheet', async () => {
    await render(
      <MPDialog open title="Delete" classNames={{ backdrop: 'my-scrim' }}>
        Body
      </MPDialog>
    );

    expect(document.querySelector('.my-scrim')).not.toBeNull();
  });

  it('reaches a modal drawer’s backdrop', async () => {
    await render(
      <MPDrawer open mode="modal" classNames={{ backdrop: 'my-scrim' }}>
        Body
      </MPDrawer>
    );

    expect(document.querySelector('.my-scrim')).not.toBeNull();
  });

  it('reaches every part of a command palette', async () => {
    await render(
      <MPCommandPalette
        open
        items={ITEMS}
        classNames={{ backdrop: 'my-scrim', input: 'my-input', list: 'my-list', row: 'my-row' }}
      />
    );

    expect(document.querySelector('.my-scrim')).not.toBeNull();
    expect(document.querySelector('.mp-command-palette__input')).toHaveClass('my-input');
    expect(document.querySelector('.mp-command-palette__list')).toHaveClass('my-list');
    expect(document.querySelector('.mp-command-palette__row')).toHaveClass('my-row');
  });

  it('merges rather than replacing what the component wrote', async () => {
    // The same rule `className` follows on the root. A slot that replaced the
    // component's classes would take its layout with them.
    await render(
      <MPDialog open title="Delete" classNames={{ backdrop: 'my-scrim' }}>
        Body
      </MPDialog>
    );
    const backdrop = document.querySelector('.my-scrim')!;

    expect(backdrop).toHaveClass('fixed');
    expect(backdrop).toHaveClass('inset-0');
  });
});
