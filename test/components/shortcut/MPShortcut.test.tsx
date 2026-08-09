import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPShortcut } from 'material-plus-ui';

/** The key caps, in order, as the text a sighted reader sees. */
function capsOf(element: Element): string[] {
  return Array.from(element.querySelectorAll('kbd')).map((key) => {
    const drawn = key.querySelector('[aria-hidden="true"]');

    return (drawn ?? key).textContent ?? '';
  });
}

describe('MPShortcut', () => {
  describe('the keys', () => {
    it('splits a string on plus', async () => {
      const screen = await render(
        <MPShortcut keys="Ctrl+Shift+P" os="windows" data-testid="shortcut" />
      );

      expect(capsOf(screen.getByTestId('shortcut').element())).toEqual(['Ctrl', 'Shift', 'P']);
    });

    it('takes the array form for a shortcut whose key is a plus', async () => {
      const screen = await render(
        <MPShortcut keys={['Ctrl', '+']} os="windows" data-testid="shortcut" />
      );

      expect(capsOf(screen.getByTestId('shortcut').element())).toEqual(['Ctrl', '+']);
    });

    it('capitalises a single letter, because that is what is on the key', async () => {
      const screen = await render(<MPShortcut keys="mod+k" os="windows" data-testid="shortcut" />);

      expect(capsOf(screen.getByTestId('shortcut').element())).toEqual(['Ctrl', 'K']);
    });

    it('leaves a word as it was written', async () => {
      const screen = await render(<MPShortcut keys="F5" os="windows" data-testid="shortcut" />);

      expect(capsOf(screen.getByTestId('shortcut').element())).toEqual(['F5']);
    });

    it('renders real kbd elements', async () => {
      const screen = await render(<MPShortcut keys="Ctrl+K" os="windows" data-testid="shortcut" />);

      expect(screen.getByTestId('shortcut').element().querySelectorAll('kbd')).toHaveLength(2);
    });
  });

  describe('Mod', () => {
    it('is Command on a Mac', async () => {
      // A shortcut written as `Ctrl+K` is wrong for every Mac reader.
      const screen = await render(<MPShortcut keys="Mod+K" os="mac" data-testid="shortcut" />);

      expect(capsOf(screen.getByTestId('shortcut').element())).toEqual(['⌘', 'K']);
    });

    it('is Control everywhere else', async () => {
      const screen = await render(<MPShortcut keys="Mod+K" os="linux" data-testid="shortcut" />);

      expect(capsOf(screen.getByTestId('shortcut').element())).toEqual(['Ctrl', 'K']);
    });

    it('answers to the names one key already has', async () => {
      const screen = await render(
        <MPShortcut keys="CmdOrCtrl+K" os="mac" data-testid="shortcut" />
      );

      expect(capsOf(screen.getByTestId('shortcut').element())).toEqual(['⌘', 'K']);
    });
  });

  describe('platform spelling', () => {
    it('draws the Mac glyphs', async () => {
      const screen = await render(
        <MPShortcut keys="Shift+Alt+Escape" os="mac" data-testid="shortcut" />
      );

      expect(capsOf(screen.getByTestId('shortcut').element())).toEqual(['⇧', '⌥', '⎋']);
    });

    it('spells them out on Windows', async () => {
      const screen = await render(
        <MPShortcut keys="Shift+Alt+Escape" os="windows" data-testid="shortcut" />
      );

      expect(capsOf(screen.getByTestId('shortcut').element())).toEqual(['Shift', 'Alt', 'Esc']);
    });

    it('names Meta per platform', async () => {
      const screen = await render(<MPShortcut keys="Meta" os="linux" data-testid="shortcut" />);

      expect(capsOf(screen.getByTestId('shortcut').element())).toEqual(['Super']);
    });

    it('draws arrows everywhere, because that is what is printed on the key', async () => {
      const screen = await render(
        <MPShortcut keys="Up+Down" os="windows" data-testid="shortcut" />
      );

      expect(capsOf(screen.getByTestId('shortcut').element())).toEqual(['↑', '↓']);
    });
  });

  describe('what a screen reader hears', () => {
    it('names a glyph key, because ⌘ is not a word', async () => {
      // Announced by its Unicode name it is "place of interest sign", which is
      // not a key anybody has on their keyboard.
      const screen = await render(<MPShortcut keys="Mod+K" os="mac" data-testid="shortcut" />);

      expect(screen.getByText('Command').element()).toHaveClass('[clip-path:inset(50%)]');
    });

    it('says nothing extra for a key already spelled as a word', async () => {
      const screen = await render(<MPShortcut keys="Ctrl" os="windows" data-testid="shortcut" />);

      expect(screen.getByTestId('shortcut').element().textContent).toBe('Ctrl');
    });

    it('hides the joiner from the accessible name', async () => {
      const screen = await render(<MPShortcut keys="Ctrl+K" os="windows" data-testid="shortcut" />);
      const joiner = screen.getByText('+').element();

      expect(joiner).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('separator', () => {
    it('joins with a plus off a Mac', async () => {
      const screen = await render(<MPShortcut keys="Ctrl+K" os="windows" data-testid="shortcut" />);

      expect(screen.getByTestId('shortcut').element().textContent).toBe('Ctrl+K');
    });

    it('writes a Mac shortcut as a run of symbols', async () => {
      // `⇧⌘P`, never `⇧+⌘+P`.
      const screen = await render(<MPShortcut keys="Mod+K" os="mac" data-testid="shortcut" />);

      expect(screen.getByTestId('shortcut').element().textContent).not.toContain('+');
    });

    it('takes a joiner of its own', async () => {
      const screen = await render(
        <MPShortcut keys="Ctrl+K" os="mac" separator=" then " data-testid="shortcut" />
      );

      expect(screen.getByTestId('shortcut').element().textContent).toContain('then');
    });
  });

  describe('passthrough', () => {
    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(
        <MPShortcut keys="Ctrl+K" className="my-own-class" data-testid="shortcut" />
      );
      const element = screen.getByTestId('shortcut').element();

      expect(element).toHaveClass('my-own-class');
      expect(element).toHaveClass('mp-shortcut');
    });

    it('publishes the size and variant on the root', async () => {
      const screen = await render(
        <MPShortcut keys="Ctrl+K" size="sm" variant="tonal" data-testid="shortcut" />
      );
      const element = screen.getByTestId('shortcut').element();

      expect(element).toHaveAttribute('data-mp-size', 'sm');
      expect(element).toHaveAttribute('data-mp-variant', 'tonal');
    });
  });
});
