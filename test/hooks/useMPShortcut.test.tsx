import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPShortcut, useMPPlatform, useMPShortcut } from 'material-plus-ui';
import type { MPShortcutOptions } from 'material-plus-ui';

/**
 * The keystrokes are dispatched on `window` rather than typed through the
 * driver, because what is being tested is the *binding* — which element the
 * listener sits on and which events it accepts — and a real key press would add
 * the browser's own handling of `Mod+K` on top of it.
 */
function press(key: string, modifiers: Partial<KeyboardEventInit> = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...modifiers }));
}

/** The modifier that stands for `Mod` on the machine running this. */
function mod(): Partial<KeyboardEventInit> {
  return navigator.platform.toLowerCase().includes('mac') ||
    /mac|iphone|ipad/i.test(navigator.userAgent)
    ? { metaKey: true }
    : { ctrlKey: true };
}

function Bound({
  keys = 'Mod+K',
  onFire,
  ...options
}: { keys?: string | string[]; onFire: (event: KeyboardEvent) => void } & MPShortcutOptions) {
  useMPShortcut(keys, onFire, options);

  return <div data-testid="bound" />;
}

describe('useMPShortcut', () => {
  it('runs the handler when the combination arrives', async () => {
    const onFire = vi.fn();
    await render(<Bound onFire={onFire} />);

    press('k', mod());

    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it('ignores the same key without the modifier', async () => {
    const onFire = vi.fn();
    await render(<Bound onFire={onFire} />);

    press('k');

    expect(onFire).not.toHaveBeenCalled();
  });

  it('ignores the combination with an extra modifier held', async () => {
    // Matched in both directions, because a shortcut that fired with more
    // modifiers down would be taking a combination the page gave to something
    // else.
    const onFire = vi.fn();
    await render(<Bound onFire={onFire} />);

    press('k', { ...mod(), shiftKey: true });

    expect(onFire).not.toHaveBeenCalled();
  });

  it('takes the array spelling too', async () => {
    const onFire = vi.fn();
    await render(<Bound keys={['Mod', 'K']} onFire={onFire} />);

    press('k', mod());

    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it('spells `Mod` the same way `MPShortcut` draws it', async () => {
    // The claim the whole shared matcher exists for: a page cannot end up
    // drawing one key cap and listening for another.
    const onFire = vi.fn();
    const screen = await render(
      <>
        <MPShortcut keys="Mod+K" />
        <Bound onFire={onFire} />
      </>
    );
    const drawn = screen.container.textContent ?? '';

    press('k', mod());

    expect(onFire).toHaveBeenCalledTimes(1);
    expect(drawn).toContain(mod().metaKey ? '⌘' : 'Ctrl');
  });

  describe('preventDefault', () => {
    it('claims the keystroke by default', async () => {
      await render(<Bound onFire={() => {}} />);

      const event = new KeyboardEvent('keydown', { key: 'k', cancelable: true, ...mod() });
      window.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it('leaves it alone when told to', async () => {
      await render(<Bound onFire={() => {}} preventDefault={false} />);

      const event = new KeyboardEvent('keydown', { key: 'k', cancelable: true, ...mod() });
      window.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('enabled', () => {
    it('does not listen while it is off', async () => {
      const onFire = vi.fn();
      await render(<Bound onFire={onFire} enabled={false} />);

      press('k', mod());

      expect(onFire).not.toHaveBeenCalled();
    });

    it('starts listening when it comes back on', async () => {
      const onFire = vi.fn();

      function Toggle() {
        const [on, setOn] = useState(false);

        useMPShortcut('Mod+K', onFire, { enabled: on });

        return (
          <button type="button" onClick={() => setOn(true)}>
            arm
          </button>
        );
      }

      const screen = await render(<Toggle />);

      press('k', mod());
      expect(onFire).not.toHaveBeenCalled();

      await screen.getByRole('button', { name: 'arm' }).click();
      press('k', mod());

      expect(onFire).toHaveBeenCalledTimes(1);
    });
  });

  describe('ignoreInputs', () => {
    it('fires inside a field by default', async () => {
      // `Mod+K` typed into a search box still means "open the palette".
      const onFire = vi.fn();
      const screen = await render(
        <>
          <input aria-label="Search" />
          <Bound onFire={onFire} />
        </>
      );

      screen
        .getByRole('textbox', { name: 'Search' })
        .element()
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true, ...mod() }));

      expect(onFire).toHaveBeenCalledTimes(1);
    });

    it('holds off inside a field when asked', async () => {
      // The case it exists for: a bare `/` that would otherwise be taken out of
      // the middle of somebody's sentence.
      const onFire = vi.fn();
      const screen = await render(
        <>
          <input aria-label="Search" />
          <Bound keys="/" onFire={onFire} ignoreInputs />
        </>
      );

      screen
        .getByRole('textbox', { name: 'Search' })
        .element()
        .dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }));

      expect(onFire).not.toHaveBeenCalled();

      // And still fires when the focus is anywhere else.
      press('/');
      expect(onFire).toHaveBeenCalledTimes(1);
    });

    it('holds off in a `contenteditable` too', async () => {
      const onFire = vi.fn();
      const screen = await render(
        <>
          <div contentEditable data-testid="editor" suppressContentEditableWarning />
          <Bound keys="/" onFire={onFire} ignoreInputs />
        </>
      );

      screen
        .getByTestId('editor')
        .element()
        .dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }));

      expect(onFire).not.toHaveBeenCalled();
    });
  });

  it('keeps listening across renders without rebinding', async () => {
    // The handler is read from a ref at the moment the key arrives, so an inline
    // arrow does not tear the listener down and put it back on every render.
    const seen: number[] = [];

    function Counting() {
      const [count, setCount] = useState(0);

      useMPShortcut('Mod+K', () => seen.push(count));

      return (
        <button type="button" onClick={() => setCount((n) => n + 1)}>
          bump
        </button>
      );
    }

    const screen = await render(<Counting />);

    press('k', mod());
    await screen.getByRole('button', { name: 'bump' }).click();
    press('k', mod());

    expect(seen).toEqual([0, 1]);
  });

  it('stops listening once it unmounts', async () => {
    const onFire = vi.fn();

    function Host() {
      const [alive, setAlive] = useState(true);

      return (
        <>
          {alive ? <Bound onFire={onFire} /> : null}
          <button type="button" onClick={() => setAlive(false)}>
            drop
          </button>
        </>
      );
    }

    const screen = await render(<Host />);

    await screen.getByRole('button', { name: 'drop' }).click();
    press('k', mod());

    expect(onFire).not.toHaveBeenCalled();
  });

  it('binds to an element when given one', async () => {
    const onFire = vi.fn();

    function Scoped() {
      const [node, setNode] = useState<HTMLElement | null>(null);

      useMPShortcut('Mod+K', onFire, { target: node });

      return <div ref={setNode} data-testid="panel" tabIndex={-1} />;
    }

    const screen = await render(<Scoped />);

    press('k', mod());
    expect(onFire).not.toHaveBeenCalled();

    screen
      .getByTestId('panel')
      .element()
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ...mod() }));

    expect(onFire).toHaveBeenCalledTimes(1);
  });
});

describe('useMPPlatform', () => {
  it('answers one of the three', async () => {
    function Probe() {
      return <output data-testid="os">{useMPPlatform()}</output>;
    }

    const screen = await render(<Probe />);

    expect(['mac', 'windows', 'linux']).toContain(screen.getByTestId('os').element().textContent);
  });

  it('agrees with the key cap `MPShortcut` draws', async () => {
    function Probe() {
      return (
        <>
          <output data-testid="os">{useMPPlatform()}</output>
          <MPShortcut keys="Mod+K" />
        </>
      );
    }

    const screen = await render(<Probe />);
    const os = screen.getByTestId('os').element().textContent;
    const drawn = screen.container.textContent ?? '';

    expect(drawn).toContain(os === 'mac' ? '⌘' : 'Ctrl');
  });
});
