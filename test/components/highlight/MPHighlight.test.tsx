import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPHighlight } from 'material-plus-ui';

/** Every `<mark>` inside the component, in document order. */
function marks() {
  return [...document.querySelectorAll('.mp-highlight mark')].map((mark) => mark.textContent);
}

describe('MPHighlight', () => {
  describe('marking', () => {
    it('wraps every match in a real <mark>', async () => {
      await render(<MPHighlight query="cat">the cat sat on the cat</MPHighlight>);

      expect(marks()).toEqual(['cat', 'cat']);
    });

    it('leaves the text alone when the query is empty', async () => {
      const screen = await render(<MPHighlight query="">nothing to find</MPHighlight>);

      expect(marks()).toEqual([]);
      await expect.element(screen.getByText('nothing to find')).toBeInTheDocument();
    });

    it('keeps the surrounding text intact', async () => {
      await render(<MPHighlight query="cat">the cat sat</MPHighlight>);

      expect(document.querySelector('.mp-highlight')?.textContent).toBe('the cat sat');
    });

    it('tries the longest term first, so an array cannot mark half a word', async () => {
      // Alternation in a regular expression is first-match-wins, so without the
      // sort `data` would match and leave `base` outside the mark.
      await render(<MPHighlight query={['data', 'database']}>one database</MPHighlight>);

      expect(marks()).toEqual(['database']);
    });

    it('re-marks when the query changes', async () => {
      const screen = await render(<MPHighlight query="cat">the cat sat</MPHighlight>);

      await screen.rerender(<MPHighlight query="sat">the cat sat</MPHighlight>);

      expect(marks()).toEqual(['sat']);
    });
  });

  describe('how the matching is done', () => {
    it('ignores case by default', async () => {
      await render(<MPHighlight query="cat">Cat CAT cat</MPHighlight>);

      expect(marks()).toEqual(['Cat', 'CAT', 'cat']);
    });

    it('respects case when asked to', async () => {
      await render(
        <MPHighlight query="cat" caseSensitive>
          Cat CAT cat
        </MPHighlight>
      );

      expect(marks()).toEqual(['cat']);
    });

    it('marks a word inside another one unless wholeWord is on', async () => {
      await render(<MPHighlight query="cat">concatenate</MPHighlight>);

      expect(marks()).toEqual(['cat']);
    });

    it('requires a whole word when wholeWord is on', async () => {
      await render(
        <MPHighlight query="cat" wholeWord>
          concatenate a cat
        </MPHighlight>
      );

      expect(marks()).toEqual(['cat']);
    });

    it('takes a regular expression as written', async () => {
      await render(<MPHighlight query={/\d+/}>build 42 of 7</MPHighlight>);

      expect(marks()).toEqual(['42', '7']);
    });
  });

  describe('walking the tree', () => {
    it('marks text inside an element and keeps the element', async () => {
      // The whole reason `children` is a node rather than a string: the first
      // search result with a `<strong>` in it would otherwise be unmarkable.
      await render(
        <MPHighlight query="cat">
          the <strong>cat</strong> sat
        </MPHighlight>
      );

      expect(document.querySelector('.mp-highlight strong mark')?.textContent).toBe('cat');
    });

    it('leaves an element with no text of its own untouched', async () => {
      await render(
        <MPHighlight query="cat">
          the cat <img alt="" src="data:," /> sat
        </MPHighlight>
      );

      expect(document.querySelector('.mp-highlight img')).toBeInTheDocument();
      expect(marks()).toEqual(['cat']);
    });
  });

  describe('appearance', () => {
    it('points the accent slots at the family it was given', async () => {
      await render(
        <MPHighlight query="cat" color="error">
          cat
        </MPHighlight>
      );

      const root = document.querySelector('.mp-highlight') as HTMLElement;

      expect(root.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-error)');
    });

    it('paints the container tone by default, which is what a highlighter is', async () => {
      await render(<MPHighlight query="cat">cat</MPHighlight>);

      const mark = document.querySelector('.mp-highlight mark') as HTMLElement;

      expect(mark.className).toContain('bg-(--_mp-accent-container)');
    });

    it('draws no surface at all for the text variant', async () => {
      await render(
        <MPHighlight query="cat" variant="text">
          cat
        </MPHighlight>
      );

      const mark = document.querySelector('.mp-highlight mark') as HTMLElement;

      // Said out loud rather than left off: a `<mark>` arrives from the browser's
      // own stylesheet with a yellow background.
      expect(getComputedStyle(mark).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });

    it('underlines only when asked', async () => {
      const screen = await render(<MPHighlight query="cat">cat</MPHighlight>);

      expect(getComputedStyle(document.querySelector('mark')!).textDecorationLine).toBe('none');

      await screen.rerender(
        <MPHighlight query="cat" underline>
          cat
        </MPHighlight>
      );

      expect(getComputedStyle(document.querySelector('mark')!).textDecorationLine).toBe(
        'underline'
      );
    });
  });
});
