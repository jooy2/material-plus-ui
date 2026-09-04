import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { MPTreeItem, MPTreeView } from 'material-plus-ui';

const tree = () => document.querySelector('[role="tree"]') as HTMLElement;
const rows = () => Array.from(document.querySelectorAll('[role="treeitem"]')) as HTMLElement[];
const row = (value: string) =>
  document.querySelector(`[data-mp-value="${value}"]`) as HTMLElement | null;

const Files = (props: Record<string, unknown>) => (
  <MPTreeView label="Files" {...props}>
    <MPTreeItem value="src" label="src">
      <MPTreeItem value="index" label="index.ts" />
      <MPTreeItem value="components" label="components">
        <MPTreeItem value="button" label="Button.tsx" />
      </MPTreeItem>
    </MPTreeItem>
    <MPTreeItem value="readme" label="README.md" />
  </MPTreeView>
);

/** A branch mounts and unmounts across a transition, so its rows are waited for. */
const settled = (value: string, there: boolean) =>
  vi.waitFor(() => expect(row(value) !== null).toBe(there));

describe('MPTreeView', () => {
  it('is a named tree of treeitems and groups', async () => {
    // Most of the component: the library has no tree primitive, and the roles,
    // the single tab stop and the arrow keys are what a tree owes.
    const screen = await render(<Files defaultExpanded={['src']} />);

    await expect.element(screen.getByRole('tree', { name: 'Files' })).toBeInTheDocument();
    expect(row('src')).toHaveAttribute('aria-expanded', 'true');
    expect(row('index')).not.toHaveAttribute('aria-expanded');
    expect(row('index')!.closest('[role="group"]')).not.toBeNull();
  });

  it('draws a shut branch not at all', async () => {
    await render(<Files />);

    expect(row('index')).toBeNull();
    expect(rows()).toHaveLength(2);
  });

  it('has exactly one tab stop', async () => {
    // A tree is one widget. Everything inside it is reached with the arrow keys.
    await render(<Files defaultExpanded={['src']} />);

    await vi.waitFor(() =>
      expect(rows().filter((element) => element.tabIndex === 0)).toHaveLength(1)
    );
    expect(rows()[0].tabIndex).toBe(0);
  });

  it('opens and shuts a branch when the row is pressed', async () => {
    const screen = await render(<Files />);

    await screen.getByText('src').click();
    await settled('index', true);

    await screen.getByText('src').click();
    await settled('index', false);
  });

  it('chooses a row as well as opening it', async () => {
    // Which is what pressing a folder with a pointer does.
    const screen = await render(<Files />);

    await screen.getByText('src').click();

    expect(row('src')).toHaveAttribute('aria-selected', 'true');
  });

  it('opens a branch from the arrow without choosing the row', async () => {
    // The difference between pointing at a folder and opening one, and the only
    // reason the arrow is a target of its own.
    await render(<Files />);

    const arrow = row('src')!.querySelector('.mp-tree__arrow') as HTMLElement;

    await userEvent.click(arrow);
    await settled('index', true);

    expect(row('src')).not.toHaveAttribute('aria-selected');
  });

  it('walks the visible rows with the arrow keys', async () => {
    await render(<Files defaultExpanded={['src']} />);

    row('src')!.focus();

    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(row('index'));

    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(row('components'));

    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(row('index'));

    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(row('readme'));

    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(row('src'));
  });

  it('opens with Right and steps into the branch on the next press', async () => {
    await render(<Files />);

    row('src')!.focus();

    await userEvent.keyboard('{ArrowRight}');
    await settled('index', true);
    // Opened, and the focus has not moved: the reader is still on the folder.
    expect(document.activeElement).toBe(row('src'));

    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(row('index'));
  });

  it('shuts with Left, and steps out of a leaf', async () => {
    await render(<Files defaultExpanded={['src']} />);

    row('index')!.focus();

    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(row('src'));

    await userEvent.keyboard('{ArrowLeft}');
    await settled('index', false);
  });

  it('leaves a shutting branch out of the order the arrows walk', async () => {
    // A branch has to stay in the document while it collapses, and for that
    // moment the row *below* the folder would otherwise be whatever was in it.
    await render(<Files defaultExpanded={['src']} />);

    row('src')!.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await userEvent.keyboard('{ArrowDown}');

    expect(document.activeElement).toBe(row('readme'));
  });

  it('presses the row with Enter and with Space', async () => {
    const screen = await render(<Files />);

    row('readme')!.focus();
    await userEvent.keyboard('{Enter}');

    expect(row('readme')).toHaveAttribute('aria-selected', 'true');

    await screen.rerender(<Files />);
    row('readme')!.focus();
    await userEvent.keyboard(' ');

    expect(row('readme')).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps one row chosen, and toggles when more than one may be', async () => {
    const screen = await render(<Files defaultSelected={['readme']} />);

    await screen.getByText('README.md').click();

    // Single select never empties: "nothing chosen" is a state a caller cannot
    // get back to by pointing at a row.
    expect(row('readme')).toHaveAttribute('aria-selected', 'true');

    await screen.rerender(<Files multiple defaultSelected={['readme']} />);
    await screen.getByText('README.md').click();

    expect(row('readme')).not.toHaveAttribute('aria-selected');
    expect(tree()).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('says what it is told when it is controlled', async () => {
    const onExpandedChange = vi.fn();
    const screen = await render(<Files expanded={[]} onExpandedChange={onExpandedChange} />);

    await screen.getByText('src').click();

    expect(onExpandedChange).toHaveBeenCalledWith(['src']);
    // Still shut, because nothing told it otherwise.
    expect(row('index')).toBeNull();
  });

  it('draws an arrow on a branch that has no children yet', async () => {
    // The one that is fetched the first time it is opened.
    await render(
      <MPTreeView label="Files">
        <MPTreeItem value="lazy" label="Remote" expandable />
      </MPTreeView>
    );

    expect(row('lazy')).toHaveAttribute('aria-expanded', 'false');
  });

  it('stops a disabled row answering, and leaves its branch alone', async () => {
    const screen = await render(
      <MPTreeView label="Files" defaultExpanded={['src']}>
        <MPTreeItem value="src" label="src" disabled>
          <MPTreeItem value="index" label="index.ts" />
        </MPTreeItem>
      </MPTreeView>
    );

    await screen.getByText('src').click();

    expect(row('src')).toHaveAttribute('aria-disabled', 'true');
    expect(row('src')).not.toHaveAttribute('aria-selected');
    // Its branch, already open, keeps working.
    expect(row('index')).not.toBeNull();
  });

  it('renders a row as a link when it is given somewhere to go', async () => {
    const screen = await render(
      <MPTreeView label="Files" defaultSelected={['readme']}>
        <MPTreeItem value="readme" label="README.md" href="/readme" />
      </MPTreeView>
    );

    const link = screen.container.querySelector('a')!;

    expect(link).toHaveAttribute('href', '/readme');
    expect(link).toHaveAttribute('aria-current', 'page');
    // Inside the tab stop, not a second one.
    expect(link.tabIndex).toBe(-1);
  });

  it('keeps an action out of the pressable area', async () => {
    // A row that both opens and holds a menu button has two things to press.
    const onAction = vi.fn();
    const screen = await render(
      <MPTreeView label="Files">
        <MPTreeItem
          value="readme"
          label="README.md"
          action={
            <button type="button" onClick={onAction}>
              More
            </button>
          }
        />
      </MPTreeView>
    );

    await screen.getByRole('button', { name: 'More' }).click();

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(row('readme')).not.toHaveAttribute('aria-selected');
  });

  it('sets each level in by one indent', async () => {
    await render(<Files defaultExpanded={['src', 'components']} />);

    await settled('button', true);

    const left = (value: string) =>
      row(value)!.querySelector('.mp-tree__row')!.getBoundingClientRect().left;

    expect(left('index')).toBeGreaterThan(left('src'));
    expect(left('button')).toBeGreaterThan(left('index'));
  });

  it('draws the rails only when it is asked to', async () => {
    const screen = await render(<Files defaultExpanded={['src']} lines="none" />);

    const rail = () => getComputedStyle(row('index')!, '::before').borderLeftWidth;

    expect(rail()).not.toBe('1px');

    await screen.rerender(<Files defaultExpanded={['src']} lines="simple" />);

    expect(rail()).toBe('1px');
  });

  it('stops a folder rail at the last row it points at', async () => {
    // The whole difference between the two drawings: a `simple` rail says the
    // level continues, and a `folder` one says where it ends.
    const screen = await render(<Files defaultExpanded={['src']} lines="simple" />);

    // `components` is the last row in its group, so under `simple` its rail runs
    // the whole height of the row and under `folder` it stops halfway down it.
    const railHeight = () =>
      Number.parseFloat(getComputedStyle(row('components')!, '::before').height);
    const rowHeight = () => row('components')!.querySelector('.mp-tree__row')!.clientHeight;

    expect(railHeight()).toBeCloseTo(rowHeight(), 0);

    await screen.rerender(<Files defaultExpanded={['src']} lines="folder" />);

    expect(railHeight()).toBeCloseTo(rowHeight() / 2, 0);
    // And the elbow, which is the other half of the folder drawing.
    expect(getComputedStyle(row('components')!, '::after').borderTopWidth).toBe('1px');
  });

  it('tightens the rows with `density` and leaves the type alone', async () => {
    const screen = await render(<Files />);

    const height = () => row('readme')!.querySelector('.mp-tree__row')!.clientHeight;
    const type = () => getComputedStyle(row('readme')!.querySelector('.mp-tree__row')!).fontSize;

    const loose = height();
    const scale = type();

    await screen.rerender(<Files density={-2} />);

    expect(height()).toBeLessThan(loose);
    expect(type()).toBe(scale);
  });
});
