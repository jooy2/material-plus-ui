import { describe, expect, it } from 'vitest';
import { matchesShortcut, tokenizeShortcut } from '../../src/internal/keys';

/**
 * The half of the shortcut vocabulary that is *read* rather than drawn.
 *
 * `MPShortcut` writes a shortcut down and `MPCommandPalette` matches one against
 * a real keyboard event, and both files already said the two had to be spelled
 * the same way — then answered separately, and disagreed. What is asserted here
 * is the reading half, against the same tokenizer the drawing half uses.
 */
function press(key: string, modifiers: Partial<KeyboardEventInit> = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, ...modifiers });
}

describe('tokenizeShortcut', () => {
  it('splits a string on the plus between the keys', () => {
    expect(tokenizeShortcut('Mod+Shift+P')).toEqual(['Mod', 'Shift', 'P']);
  });

  // `'Ctrl++'` splits into `['Ctrl', '', '']`, which is why the array form is
  // the documented way to name a shortcut whose key *is* a plus.
  it('drops what a doubled plus leaves behind', () => {
    expect(tokenizeShortcut('Ctrl++')).toEqual(['Ctrl']);
    expect(tokenizeShortcut(['Ctrl', '+'])).toEqual(['Ctrl', '+']);
  });

  it('trims each key', () => {
    expect(tokenizeShortcut('Mod + K')).toEqual(['Mod', 'K']);
  });
});

describe('matchesShortcut', () => {
  it('reads Mod as Command on a Mac and Control everywhere else', () => {
    expect(matchesShortcut(press('k', { metaKey: true }), 'Mod+K', 'mac')).toBe(true);
    expect(matchesShortcut(press('k', { ctrlKey: true }), 'Mod+K', 'mac')).toBe(false);

    expect(matchesShortcut(press('k', { ctrlKey: true }), 'Mod+K', 'windows')).toBe(true);
    expect(matchesShortcut(press('k', { metaKey: true }), 'Mod+K', 'windows')).toBe(false);
  });

  it('is case-insensitive about the key', () => {
    expect(matchesShortcut(press('K', { ctrlKey: true }), 'mod+k', 'linux')).toBe(true);
  });

  /*
   * Both directions, which is the part a naive check gets wrong: a shortcut that
   * fired with extra modifiers held would take a combination the page had given
   * to something else.
   */
  it('refuses a modifier the shortcut did not ask for', () => {
    expect(matchesShortcut(press('k', { ctrlKey: true, shiftKey: true }), 'Mod+K', 'linux')).toBe(
      false
    );
    expect(matchesShortcut(press('k', { ctrlKey: true, altKey: true }), 'Mod+K', 'linux')).toBe(
      false
    );
  });

  it('requires a modifier the shortcut did ask for', () => {
    expect(matchesShortcut(press('k'), 'Mod+K', 'linux')).toBe(false);
    expect(matchesShortcut(press('k', { ctrlKey: true }), 'Mod+Shift+K', 'linux')).toBe(false);
    expect(
      matchesShortcut(press('k', { ctrlKey: true, shiftKey: true }), 'Mod+Shift+K', 'linux')
    ).toBe(true);
  });

  /*
   * `Mod` names a key rather than being a fifth modifier, so `Ctrl+K` and
   * `Mod+K` are the same combination on Windows and have to match the same
   * event. Tested as a modifier of its own they contradicted each other, and
   * `Ctrl+K` matched nowhere except a Mac.
   */
  it('takes Ctrl and Meta as themselves, on every platform', () => {
    expect(matchesShortcut(press('k', { ctrlKey: true }), 'Ctrl+K', 'mac')).toBe(true);
    expect(matchesShortcut(press('k', { ctrlKey: true }), 'Ctrl+K', 'windows')).toBe(true);
    expect(matchesShortcut(press('k', { ctrlKey: true }), 'Ctrl+K', 'linux')).toBe(true);

    expect(matchesShortcut(press('k', { metaKey: true }), 'Ctrl+K', 'mac')).toBe(false);
    expect(matchesShortcut(press('k', { metaKey: true }), 'Meta+K', 'windows')).toBe(true);
  });

  it('reads Mod and the key it stands for as the same combination', () => {
    const windowsPress = press('k', { ctrlKey: true });

    expect(matchesShortcut(windowsPress, 'Mod+K', 'windows')).toBe(true);
    expect(matchesShortcut(windowsPress, 'Ctrl+K', 'windows')).toBe(true);

    const macPress = press('k', { metaKey: true });

    expect(matchesShortcut(macPress, 'Mod+K', 'mac')).toBe(true);
    expect(matchesShortcut(macPress, 'Meta+K', 'mac')).toBe(true);
  });

  it('takes the array form the way the label does', () => {
    expect(matchesShortcut(press('+', { ctrlKey: true }), ['Ctrl', '+'], 'linux')).toBe(true);
  });

  it('matches a bare key with nothing held', () => {
    expect(matchesShortcut(press('/'), '/', 'linux')).toBe(true);
    expect(matchesShortcut(press('/', { ctrlKey: true }), '/', 'linux')).toBe(false);
  });

  it('answers false for a shortcut that names no key at all', () => {
    expect(matchesShortcut(press('k'), '', 'linux')).toBe(false);
  });
});
