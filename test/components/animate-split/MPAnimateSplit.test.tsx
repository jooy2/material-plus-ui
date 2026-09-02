import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateSplit } from 'material-plus-ui';

const pieces = (element: Element) => [...element.querySelectorAll('.mp-anim')] as HTMLElement[];

describe('MPAnimateSplit', () => {
  it('cuts a line into words and gives each one its own delay', async () => {
    const screen = await render(
      <MPAnimateSplit stagger={40} data-testid="split">
        One two three
      </MPAnimateSplit>
    );
    const element = screen.getByTestId('split').element() as HTMLElement;
    const words = pieces(element);

    expect(words.map((word) => word.textContent)).toEqual(['One ', 'two ', 'three']);
    expect(words.map((word) => getComputedStyle(word).animationDelay)).toEqual([
      '0s',
      '0.04s',
      '0.08s'
    ]);
  });

  /*
   * The failure this exists to prevent, and the one nobody testing in English
   * would ever see: a word boundary is not a space east of Myanmar, so
   * `split(' ')` hands back the whole sentence as one piece and the effect
   * silently does nothing.
   */
  it('finds the words in a language that does not write spaces', async () => {
    const screen = await render(
      <MPAnimateSplit locale="ja" data-testid="split">
        今日は良い天気です
      </MPAnimateSplit>
    );

    expect(pieces(screen.getByTestId('split').element()).length).toBeGreaterThan(1);
  });

  it('cuts by grapheme rather than by code point', async () => {
    const screen = await render(
      <MPAnimateSplit by="character" data-testid="split">
        a👩‍👩‍👧b
      </MPAnimateSplit>
    );
    const characters = pieces(screen.getByTestId('split').element());

    // Seven code points for the family, and one character.
    expect(characters.map((piece) => piece.textContent)).toEqual(['a', '👩‍👩‍👧', 'b']);
  });

  it('keeps characters inside their words, so a line cannot wrap mid-word', async () => {
    const screen = await render(
      <MPAnimateSplit by="character" data-testid="split">
        One two
      </MPAnimateSplit>
    );
    const element = screen.getByTestId('split').element() as HTMLElement;
    const animated = element.querySelector('[aria-hidden="true"]') as HTMLElement;
    const words = [...animated.children] as HTMLElement[];

    expect(words).toHaveLength(2);
    expect(words[0]!.textContent).toBe('One ');
    // The word is the thing that does not break; a loose inline-block character
    // is a break opportunity.
    expect(getComputedStyle(words[0]!).display).toBe('inline-block');
  });

  it('makes every piece an inline-block, or none of them would move at all', async () => {
    const screen = await render(<MPAnimateSplit data-testid="split">One two</MPAnimateSplit>);

    for (const piece of pieces(screen.getByTestId('split').element())) {
      // A transform does nothing to a non-replaced inline box.
      expect(getComputedStyle(piece).display).toBe('inline-block');
    }
  });

  it('gives a screen reader the sentence rather than a list of letters', async () => {
    const screen = await render(
      <MPAnimateSplit by="character" data-testid="split">
        Hello
      </MPAnimateSplit>
    );
    const element = screen.getByTestId('split').element() as HTMLElement;
    const [hidden, visible] = [...element.children] as HTMLElement[];

    expect(hidden!.textContent).toBe('Hello');
    expect(visible!).toHaveAttribute('aria-hidden', 'true');
  });

  it('runs the line from the end when reversed, each piece still forwards', async () => {
    const screen = await render(
      <MPAnimateSplit stagger={40} reverse data-testid="split">
        One two three
      </MPAnimateSplit>
    );
    const words = pieces(screen.getByTestId('split').element());

    expect(words.map((word) => getComputedStyle(word).animationDelay)).toEqual([
      '0.08s',
      '0.04s',
      '0s'
    ]);
    expect(getComputedStyle(words[0]!).animationDirection).toBe('normal');
  });

  it('takes the text as a prop as well as as children', async () => {
    const screen = await render(<MPAnimateSplit text="One two" data-testid="split" />);

    expect(pieces(screen.getByTestId('split').element())).toHaveLength(2);
  });

  it('joins back to the string it was given, spaces and all', async () => {
    const screen = await render(<MPAnimateSplit data-testid="split">One two three</MPAnimateSplit>);
    const animated = screen
      .getByTestId('split')
      .element()
      .querySelector('[aria-hidden="true"]') as HTMLElement;

    expect(animated.textContent).toBe('One two three');
  });

  it('hands each piece to the scrollport on `timeline="view"`', async () => {
    const screen = await render(
      <MPAnimateSplit timeline="view" data-testid="split">
        One two
      </MPAnimateSplit>
    );
    const [first] = pieces(screen.getByTestId('split').element());

    expect(first!.style.getPropertyValue('--_mp-anim-timeline')).toBe('view()');
  });
});
