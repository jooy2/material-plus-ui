import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateTyping } from 'material-plus-ui';

describe('MPAnimateTyping', () => {
  /*
   * The whole string is in the document from the first frame.
   *
   * A clipped copy for a screen reader, which reads it once and is not made to
   * sit through the performance, and a visible copy that is `aria-hidden` and
   * animates. So the effect costs a reader who cannot see it nothing.
   */
  it('gives a screen reader the whole string immediately', async () => {
    const screen = await render(
      <MPAnimateTyping text="Everything, all at once" speed={1} data-testid="typing" />
    );
    const element = screen.getByTestId('typing').element() as HTMLElement;
    const announced = element.children[0] as HTMLElement;

    expect(announced.textContent).toBe('Everything, all at once');
    expect(announced.hasAttribute('aria-hidden')).toBe(false);
    expect(element.children[1]).toHaveAttribute('aria-hidden', 'true');
  });

  it('types the visible copy one character at a time', async () => {
    const screen = await render(<MPAnimateTyping text="Hello" speed={200} data-testid="typing" />);
    const visible = screen.getByTestId('typing').element().children[1] as HTMLElement;

    await expect.poll(() => visible.textContent).toContain('Hello');
  });

  /*
   * A code point is not a character.
   *
   * `👩‍👩‍👧` is seven of them and `한` typed on a Korean keyboard can be three, so
   * a typewriter that advanced by code points would spend four frames
   * assembling an emoji out of parts that mean nothing on their own.
   */
  it('advances by grapheme rather than by code point', async () => {
    const screen = await render(
      <MPAnimateTyping text="👩‍👩‍👧!" speed={200} caret={false} data-testid="typing" />
    );
    const visible = screen.getByTestId('typing').element().children[1] as HTMLElement;

    // Two graphemes, so the finished string is the family and the mark — never
    // a half-assembled family.
    await expect.poll(() => visible.textContent).toBe('👩‍👩‍👧!');
  });

  it('only types text, and takes an element’s text without its markup', async () => {
    const screen = await render(
      <MPAnimateTyping speed={200} data-testid="typing">
        {'Plain '}
        <strong>and bold</strong>
      </MPAnimateTyping>
    );
    const element = screen.getByTestId('typing').element() as HTMLElement;

    // There is no honest way to reveal half of a `<strong>`, so the markup is
    // dropped and only its text is typed.
    expect(element.querySelector('strong')).toBeNull();
    expect(element.children[0].textContent).toBe('Plain ');
  });

  describe('caret', () => {
    it('blinks after the text by default', async () => {
      const screen = await render(<MPAnimateTyping text="Hello" data-testid="typing" />);
      const caret = screen.getByTestId('typing').element().querySelector('.mp-typing-caret');

      expect(caret).not.toBeNull();
      expect(caret!.textContent).toBe('|');
      // `step-end` rather than a fade: a caret that eases looks like a caret
      // being rendered slowly.
      expect(getComputedStyle(caret!).animationTimingFunction).toBe('steps(1)');
    });

    it('can be turned off or redrawn', async () => {
      const off = await render(<MPAnimateTyping text="Hello" caret={false} data-testid="off" />);

      expect(off.getByTestId('off').element().querySelector('.mp-typing-caret')).toBeNull();

      const other = await render(
        <MPAnimateTyping text="Hello" caretChar="▌" data-testid="other" />
      );

      expect(
        other.getByTestId('other').element().querySelector('.mp-typing-caret')!.textContent
      ).toBe('▌');
    });
  });

  it('waits empty rather than finished until it is triggered', async () => {
    // A typewriter that showed its whole string until it scrolled into view and
    // then blanked would be worse than no effect at all.
    const screen = await render(
      <MPAnimateTyping text="Hello" trigger="manual" caret={false} data-testid="typing" />
    );
    const element = screen.getByTestId('typing').element() as HTMLElement;

    expect(element).toHaveAttribute('data-mp-state', 'paused');
    expect((element.children[1] as HTMLElement).textContent).toBe('');
    // The announced copy is unaffected: the text is there for a screen reader
    // whether or not it has been drawn.
    expect((element.children[0] as HTMLElement).textContent).toBe('Hello');
  });

  it('honours a `duration` as the time for the whole string', async () => {
    const screen = await render(
      <MPAnimateTyping text="Hello" duration={100} caret={false} data-testid="typing" />
    );
    const visible = screen.getByTestId('typing').element().children[1] as HTMLElement;

    await expect.poll(() => visible.textContent).toBe('Hello');
  });
});
