import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { useMPDisclosure } from 'material-plus-ui';
import * as React from 'react';

/**
 * The two things a version written in a hurry leaves out, and the reason the
 * library ships one at all: the callbacks are stable, and asking for what is
 * already true is not a state change.
 */
function Probe({ defaultOpen }: { defaultOpen?: boolean }) {
  const disclosure = useMPDisclosure(defaultOpen);
  const renders = React.useRef(0);
  const first = React.useRef(disclosure);

  renders.current += 1;

  return (
    <div>
      <output data-testid="open">{String(disclosure.open)}</output>
      <output data-testid="renders">{renders.current}</output>
      <output data-testid="stable">
        {String(
          first.current.onOpen === disclosure.onOpen &&
            first.current.onClose === disclosure.onClose &&
            first.current.onToggle === disclosure.onToggle &&
            first.current.setOpen === disclosure.setOpen
        )}
      </output>
      <button type="button" onClick={disclosure.onOpen}>
        Open
      </button>
      <button type="button" onClick={disclosure.onClose}>
        Close
      </button>
      <button type="button" onClick={disclosure.onToggle}>
        Toggle
      </button>
    </div>
  );
}

const read = (screen: { getByTestId: (id: string) => { element: () => Element } }, id: string) =>
  screen.getByTestId(id).element().textContent;

describe('useMPDisclosure', () => {
  it('starts closed', async () => {
    const screen = await render(<Probe />);

    expect(read(screen, 'open')).toBe('false');
  });

  it('starts open when told to', async () => {
    const screen = await render(<Probe defaultOpen />);

    expect(read(screen, 'open')).toBe('true');
  });

  it('opens, closes and toggles', async () => {
    const screen = await render(<Probe />);

    await screen.getByRole('button', { name: 'Open' }).click();
    expect(read(screen, 'open')).toBe('true');

    await screen.getByRole('button', { name: 'Close' }).click();
    expect(read(screen, 'open')).toBe('false');

    await screen.getByRole('button', { name: 'Toggle' }).click();
    expect(read(screen, 'open')).toBe('true');

    await screen.getByRole('button', { name: 'Toggle' }).click();
    expect(read(screen, 'open')).toBe('false');
  });

  it('hands back the same four functions for the life of the component', async () => {
    // An inline `onClick={() => setOpen(true)}` is a new function every render,
    // which re-renders a memoised trigger and defeats the `React.memo` a page
    // put there on purpose.
    const screen = await render(<Probe />);

    await screen.getByRole('button', { name: 'Open' }).click();
    await screen.getByRole('button', { name: 'Close' }).click();

    expect(read(screen, 'stable')).toBe('true');
  });

  it('does not re-render for a state it is already in', async () => {
    // A close handler is often wired to three things at once — a button, an
    // `onOpenChange`, and an Escape the component also handles.
    const screen = await render(<Probe />);
    const before = read(screen, 'renders');

    await screen.getByRole('button', { name: 'Close' }).click();
    await screen.getByRole('button', { name: 'Close' }).click();

    expect(read(screen, 'renders')).toBe(before);
  });
});
