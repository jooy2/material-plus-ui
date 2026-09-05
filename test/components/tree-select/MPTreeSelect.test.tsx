import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { MPTreeSelect } from 'material-plus-ui';
import type { MPTreeSelectItem } from 'material-plus-ui';

const ITEMS: MPTreeSelectItem[] = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      { value: 'france', label: 'France' },
      { value: 'spain', label: 'Spain' }
    ]
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [
      {
        value: 'korea',
        label: 'Korea',
        children: [{ value: 'seoul', label: 'Seoul' }]
      },
      { value: 'japan', label: 'Japan', disabled: true }
    ]
  }
];

/** What `render` hands back, so the helpers below can take it by name. */
type Screen = Awaited<ReturnType<typeof render>>;

const trigger = () => document.querySelector('button') as HTMLElement;
/*
 * The rows are read out of `document` rather than out of the render's own
 * container: the popup is a portal into `document.body`, so nothing inside it
 * is a descendant of the tree the test rendered.
 */
const row = (value: string) =>
  document.querySelector(`[data-mp-value="${value}"]`) as HTMLElement | null;
const rows = () =>
  Array.from(document.querySelectorAll('[role="treeitem"]')).map(
    (element) => (element as HTMLElement).dataset.mpValue
  );

async function open(screen: Screen) {
  await screen.getByRole('button', { name: 'Region' }).click();
  await vi.waitFor(() => expect(row('europe')).not.toBeNull());
}

/**
 * The row for one value, pressed on the line a reader would press.
 *
 * Not the `<li>` itself: a `treeitem` contains the whole branch under it, so
 * once it is open its middle belongs to one of its own children. And not
 * `getByText`, because the trigger writes the chosen label too — a tree holding
 * "France" behind a field reading "France" is two matches for one query.
 */
async function choose(value: string) {
  await userEvent.click(row(value)?.firstElementChild as HTMLElement);
}

/** Typing into the filter, which is a controlled input and needs a real fill. */
async function search(screen: Screen, text: string) {
  await userEvent.fill(screen.getByRole('textbox').element() as HTMLElement, text);
}

describe('MPTreeSelect', () => {
  it('opens a tree behind a field', async () => {
    // The gap between MPSelect and MPTreeView: a flat list behind a field, and a
    // hierarchy with no field.
    const screen = await render(
      <MPTreeSelect label="Region" items={ITEMS} defaultExpanded={['europe']} />
    );

    expect(row('europe')).toBeNull();

    await open(screen);

    expect(document.querySelector('[role="tree"]')).not.toBeNull();
    expect(row('france')).not.toBeNull();
  });

  it('will not choose a branch unless it is allowed to', async () => {
    // The branches are the taxonomy and the leaves are the answers. A "Europe"
    // chosen alongside "France" is usually a data model nobody meant.
    const onValueChange = vi.fn();
    const screen = await render(
      <MPTreeSelect label="Region" items={ITEMS} onValueChange={onValueChange} />
    );

    await open(screen);
    await choose('europe');

    // It opened rather than answering, and the popup stayed up: a heading is
    // not an answer, so there is nothing to report and nothing to close on.
    await vi.waitFor(() => expect(row('france')).not.toBeNull());
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('leaves what is held alone when a heading is pressed', async () => {
    // The tree reports a press in single-value mode as the whole new selection,
    // so a heading that went through the same path as a leaf would arrive as an
    // empty one — and clear the field on the way past.
    const onValueChange = vi.fn();
    const screen = await render(
      <MPTreeSelect
        label="Region"
        items={ITEMS}
        defaultValue="france"
        defaultExpanded={['europe']}
        onValueChange={onValueChange}
      />
    );

    await open(screen);
    await choose('asia');

    await vi.waitFor(() => expect(row('korea')).not.toBeNull());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger().textContent).toContain('France');
  });

  it('opens a branch that cannot be chosen', async () => {
    // A taxonomy whose branches do not open is a list with extra steps, which is
    // what a tree was chosen over. So a heading is not a disabled row.
    const screen = await render(<MPTreeSelect label="Region" items={ITEMS} />);

    await open(screen);

    expect(row('france')).toBeNull();

    await choose('europe');

    await vi.waitFor(() => expect(row('france')).not.toBeNull());

    await choose('europe');

    await vi.waitFor(() => expect(row('france')).toBeNull());
  });

  it('chooses a branch once it is told branches count', async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <MPTreeSelect label="Region" items={ITEMS} selectableBranches onValueChange={onValueChange} />
    );

    await open(screen);
    await choose('europe');

    expect(onValueChange).toHaveBeenCalledWith(['europe']);
  });

  it('lets one item overrule the rule either way', async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <MPTreeSelect
        label="Region"
        items={[{ ...ITEMS[0], selectable: true }, ITEMS[1]]}
        onValueChange={onValueChange}
      />
    );

    await open(screen);
    await choose('europe');

    expect(onValueChange).toHaveBeenCalledWith(['europe']);
  });

  it('holds a leaf and writes it in the trigger', async () => {
    const screen = await render(
      <MPTreeSelect label="Region" items={ITEMS} defaultExpanded={['europe']} />
    );

    await open(screen);
    await choose('france');

    expect(trigger().textContent).toContain('France');
  });

  it('closes on a choice, and stays open when more than one may be held', async () => {
    const screen = await render(
      <MPTreeSelect label="Region" items={ITEMS} defaultExpanded={['europe']} />
    );

    await open(screen);
    await choose('france');

    await vi.waitFor(() => expect(row('europe')).toBeNull());

    await screen.rerender(
      <MPTreeSelect label="Region" items={ITEMS} multiple defaultExpanded={['europe']} />
    );

    await open(screen);
    await choose('france');

    expect(row('europe')).not.toBeNull();
  });

  it('keeps only the last choice unless it may hold more than one', async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <MPTreeSelect
        label="Region"
        items={ITEMS}
        multiple
        defaultExpanded={['europe']}
        onValueChange={onValueChange}
      />
    );

    await open(screen);
    await choose('france');
    await choose('spain');

    expect(onValueChange).toHaveBeenLastCalledWith(['france', 'spain']);
    expect(trigger().textContent).toContain('France');
    expect(trigger().textContent).toContain('Spain');
  });

  it('refuses a disabled node', async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <MPTreeSelect
        label="Region"
        items={ITEMS}
        defaultExpanded={['asia']}
        onValueChange={onValueChange}
      />
    );

    await open(screen);
    await choose('japan');

    expect(onValueChange).not.toHaveBeenCalledWith(['japan']);
  });

  it('keeps the ancestors of a match', async () => {
    // Filtered to bare matches a tree is a list, and a list of leaves is exactly
    // what a tree was chosen over: "Seoul" under nothing does not say which one.
    const screen = await render(<MPTreeSelect label="Region" items={ITEMS} searchable />);

    await open(screen);
    await search(screen, 'seoul');

    await vi.waitFor(() => expect(rows()).toEqual(['asia', 'korea', 'seoul']));
  });

  it('opens every branch a search kept', async () => {
    // A match folded inside a shut parent is a match the reader was not shown.
    const screen = await render(<MPTreeSelect label="Region" items={ITEMS} searchable />);

    await open(screen);

    expect(row('korea')).toBeNull();

    await search(screen, 'seoul');

    await vi.waitFor(() => expect(row('seoul')).not.toBeNull());
  });

  it('keeps everything under a branch that matched', async () => {
    // Having found the branch the reader asked for, hiding what is in it is the
    // opposite of helpful.
    const screen = await render(<MPTreeSelect label="Region" items={ITEMS} searchable />);

    await open(screen);
    await search(screen, 'europe');

    await vi.waitFor(() => expect(rows()).toEqual(['europe', 'france', 'spain']));
  });

  it('says so when a search matched nothing', async () => {
    const screen = await render(<MPTreeSelect label="Region" items={ITEMS} searchable />);

    await open(screen);
    await search(screen, 'atlantis');

    await vi.waitFor(() => expect(document.querySelector('.mp-tree-select__empty')).not.toBeNull());
    expect(document.querySelector('[role="tree"]')).toBeNull();
  });

  it('forgets the search when it closes', async () => {
    const screen = await render(<MPTreeSelect label="Region" items={ITEMS} searchable />);

    await open(screen);
    await search(screen, 'seoul');
    await userEvent.keyboard('{Escape}');

    await vi.waitFor(() => expect(row('europe')).toBeNull());
    await open(screen);

    expect(screen.getByRole('textbox').element()).toHaveValue('');
    expect(rows()).toEqual(['europe', 'asia']);
  });

  it('names the filter with the word that is already written down', async () => {
    // `MPTransfer` has the same field doing the same job. `MPCommandPalette`'s
    // string is a sentence about a palette — "Type a command or search…" — and a
    // filter over a taxonomy is not one.
    const screen = await render(<MPTreeSelect label="Region" items={ITEMS} searchable />);

    await open(screen);

    expect(screen.getByRole('textbox').element()).toHaveAttribute('placeholder', 'Search');
  });

  it('offers no search field unless it is asked for', async () => {
    const screen = await render(<MPTreeSelect label="Region" items={ITEMS} />);

    await open(screen);

    expect(document.querySelector('.mp-tree-select__search')).toBeNull();
  });

  it('empties when the × is pressed', async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <MPTreeSelect
        label="Region"
        items={ITEMS}
        clearable
        defaultValue="france"
        onValueChange={onValueChange}
      />
    );

    await screen.getByRole('button', { name: 'Clear' }).click();

    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it('submits one hidden input per value', async () => {
    const screen = await render(
      <MPTreeSelect
        label="Region"
        items={ITEMS}
        name="region"
        multiple
        defaultValue={['france', 'spain']}
      />
    );

    const hidden = screen.container.querySelectorAll('input[type="hidden"]');

    expect(Array.from(hidden).map((input) => (input as HTMLInputElement).value)).toEqual([
      'france',
      'spain'
    ]);
  });

  it('does not open while it is read-only', async () => {
    // What a read-only picker holds is something to read.
    await render(<MPTreeSelect label="Region" items={ITEMS} readOnly defaultValue="france" />);

    await userEvent.click(trigger());

    expect(row('europe')).toBeNull();
    expect(trigger().textContent).toContain('France');
  });

  it('writes what is held however the caller says', async () => {
    await render(
      <MPTreeSelect
        label="Region"
        items={ITEMS}
        multiple
        defaultValue={['france', 'spain']}
        format={(chosen) => `${chosen.length} chosen`}
      />
    );

    expect(trigger().textContent).toContain('2 chosen');
  });
});
