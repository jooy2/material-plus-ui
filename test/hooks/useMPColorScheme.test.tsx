import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { mpColorSchemeScript, useMPColorScheme } from 'material-plus-ui';
import type { MPColorScheme } from 'material-plus-ui';
import { resetScheme } from '../../src/internal/color-scheme';

/**
 * The choice lives in a module-level store, which is the point of it — one page,
 * one answer — and which means a suite has to put it back between tests or the
 * second one starts wherever the first one finished.
 */
const KEY = 'mp-color-scheme';

function Probe({ storageKey }: { storageKey?: string } = {}) {
  const { scheme, resolved, isSystem, setScheme, toggle } = useMPColorScheme(
    storageKey ? { storageKey } : undefined
  );

  return (
    <>
      <output data-testid="scheme">{scheme}</output>
      <output data-testid="resolved">{resolved}</output>
      <output data-testid="system">{String(isSystem)}</output>
      <button type="button" onClick={toggle}>
        toggle
      </button>
      {(['light', 'dark', 'system'] as MPColorScheme[]).map((value) => (
        <button key={value} type="button" onClick={() => setScheme(value)}>
          set {value}
        </button>
      ))}
    </>
  );
}

const attribute = () => document.documentElement.getAttribute('data-mp-scheme');
const systemIsDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-mp-scheme');
  resetScheme();
});

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-mp-scheme');
  resetScheme();
});

describe('useMPColorScheme', () => {
  describe('with nothing chosen', () => {
    it('follows the system', async () => {
      const screen = await render(<Probe />);

      expect(screen.getByTestId('scheme').element().textContent).toBe('system');
      expect(screen.getByTestId('system').element().textContent).toBe('true');
      expect(screen.getByTestId('resolved').element().textContent).toBe(
        systemIsDark() ? 'dark' : 'light'
      );
    });

    it('writes no attribute, so the media query keeps its say', async () => {
      await render(<Probe />);

      expect(attribute()).toBeNull();
    });
  });

  describe('choosing', () => {
    it('writes the attribute the stylesheet reads', async () => {
      const screen = await render(<Probe />);

      await screen.getByRole('button', { name: 'set dark' }).click();

      expect(attribute()).toBe('dark');
      expect(screen.getByTestId('resolved').element().textContent).toBe('dark');
    });

    it('remembers it', async () => {
      const screen = await render(<Probe />);

      await screen.getByRole('button', { name: 'set dark' }).click();

      expect(localStorage.getItem(KEY)).toBe('dark');
    });

    it('gives the choice back on `system`, attribute and all', async () => {
      const screen = await render(<Probe />);

      await screen.getByRole('button', { name: 'set dark' }).click();
      await screen.getByRole('button', { name: 'set system' }).click();

      // Removed rather than written as the word `system`, which would match
      // neither branch of the stylesheet.
      expect(attribute()).toBeNull();
      expect(localStorage.getItem(KEY)).toBeNull();
      expect(screen.getByTestId('scheme').element().textContent).toBe('system');
    });
  });

  describe('toggle', () => {
    it('goes to the other one', async () => {
      const screen = await render(<Probe />);

      await screen.getByRole('button', { name: 'set light' }).click();
      await screen.getByRole('button', { name: 'toggle' }).click();

      expect(screen.getByTestId('scheme').element().textContent).toBe('dark');
    });

    it('leaves `system` for the opposite of what is on the screen', async () => {
      // A reader pressing one button never means "give me the scheme I am
      // already looking at".
      const screen = await render(<Probe />);
      const before = screen.getByTestId('resolved').element().textContent;

      await screen.getByRole('button', { name: 'toggle' }).click();

      expect(screen.getByTestId('resolved').element().textContent).not.toBe(before);
      expect(screen.getByTestId('scheme').element().textContent).toBe(
        before === 'dark' ? 'light' : 'dark'
      );
    });
  });

  describe('one page, one answer', () => {
    it('keeps two callers on the same scheme', async () => {
      // Two components holding `useState` would each show what they last set and
      // neither would hear about the other.
      const screen = await render(
        <>
          <div data-testid="a">
            <Probe />
          </div>
          <div data-testid="b">
            <Probe />
          </div>
        </>
      );

      const buttons = screen.container.querySelectorAll('button');
      // The first `set dark` belongs to the first probe.
      ([...buttons].find((b) => b.textContent === 'set dark') as HTMLButtonElement).click();

      await expect.element(screen.getByTestId('b').getByTestId('scheme')).toHaveTextContent('dark');
    });
  });

  describe('on arrival', () => {
    it('adopts an attribute the page already carries', async () => {
      // A page that ran the inline script, or rendered the attribute from a
      // cookie on the server, is already painting a scheme. That is the true
      // one, and a hook reporting storage instead would disagree with the screen.
      document.documentElement.setAttribute('data-mp-scheme', 'dark');

      const screen = await render(<Probe />);

      expect(screen.getByTestId('scheme').element().textContent).toBe('dark');
    });

    it('reads a remembered choice when there is no attribute', async () => {
      localStorage.setItem(KEY, 'dark');

      const screen = await render(<Probe />);

      expect(screen.getByTestId('scheme').element().textContent).toBe('dark');
    });

    it('ignores a stored value that is not one of the three', async () => {
      localStorage.setItem(KEY, 'aubergine');

      const screen = await render(<Probe />);

      expect(screen.getByTestId('scheme').element().textContent).toBe('system');
    });

    it('takes a storage key of its own', async () => {
      localStorage.setItem('other-app', 'dark');

      const screen = await render(<Probe storageKey="other-app" />);

      expect(screen.getByTestId('scheme').element().textContent).toBe('dark');
    });
  });

  describe('mpColorSchemeScript', () => {
    it('applies a remembered scheme before anything renders', async () => {
      localStorage.setItem(KEY, 'dark');

      // Exactly what a `<head>` would run.
      eval(mpColorSchemeScript());

      expect(attribute()).toBe('dark');
    });

    it('does nothing when nothing was remembered', async () => {
      // Leaving the media query to answer, which it does before the first paint
      // anyway.
      eval(mpColorSchemeScript());

      expect(attribute()).toBeNull();
    });

    it('does nothing for a value that is not a scheme', async () => {
      localStorage.setItem(KEY, 'system');

      eval(mpColorSchemeScript());

      expect(attribute()).toBeNull();
    });

    it('reads the key it was given', async () => {
      localStorage.setItem('other-app', 'light');

      eval(mpColorSchemeScript({ storageKey: 'other-app' }));

      expect(attribute()).toBe('light');
    });

    it('cannot be ended early by a quote in the key', async () => {
      const script = mpColorSchemeScript({ storageKey: '</script>"x' });

      expect(script).not.toContain('</script>"x');
      expect(script).toContain(JSON.stringify('</script>"x'));
      // And it still runs.
      expect(() => eval(script)).not.toThrow();
    });

    it('agrees with the hook, so the page does not correct itself', async () => {
      localStorage.setItem(KEY, 'dark');
      eval(mpColorSchemeScript());

      const screen = await render(<Probe />);

      expect(attribute()).toBe('dark');
      expect(screen.getByTestId('scheme').element().textContent).toBe('dark');
    });
  });

  describe('when storage is unavailable', () => {
    it('still toggles for the visit', async () => {
      const real = Object.getOwnPropertyDescriptor(window, 'localStorage');
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new Error('blocked');
        }
      });

      try {
        const screen = await render(<Probe />);

        await screen.getByRole('button', { name: 'set dark' }).click();

        expect(attribute()).toBe('dark');
        expect(screen.getByTestId('scheme').element().textContent).toBe('dark');
      } finally {
        if (real) {
          Object.defineProperty(window, 'localStorage', real);
        }
      }
    });
  });
});
