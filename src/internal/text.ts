/**
 * Where a character ends, and where a word does.
 *
 * One module, because the alternative is three. `MPAnimateTyping` counts
 * characters, `MPAnimateScramble` replaces them and `MPAnimateSplit` hands each
 * one its own delay, and every one of those has to agree about what a character
 * *is*. Three copies would be three opinions, and they would only disagree on
 * the text nobody tests with.
 *
 * ## Why not `[...text]`, and why not `split('')`
 *
 * A code point is not a character. `👩‍👩‍👧` is seven of them joined by zero-width
 * joiners; `한` typed on a Korean keyboard can be three; a flag is two; an
 * accented letter may be one or two depending on how the file was normalised.
 * A typewriter that advances by code points spends four frames assembling an
 * emoji out of parts that mean nothing on their own, and a splitter that does it
 * hands a screen reader — or a `key` — a fragment that is not a character.
 *
 * `split('')` is worse again: it splits by UTF-16 code *unit*, so it halves
 * every astral character into two lone surrogates, which render as `�`.
 *
 * ## Why not `split(' ')` for words
 *
 * Because a word boundary is not a space anywhere east of Myanmar. Japanese,
 * Chinese, Thai, Khmer and Lao write without them, so splitting on whitespace
 * hands back the entire sentence as a single fragment — an effect that silently
 * does nothing, in the languages where nobody testing it would notice.
 *
 * `Intl.Segmenter` knows both boundaries and is in every current engine. The
 * fallbacks below are for a runtime that does not have it, and they are the
 * naive answers rather than an attempt at a second implementation: something
 * imperfect that runs beats an effect that throws.
 */

import * as React from 'react';

/**
 * Whether the runtime can answer the question properly.
 *
 * Read once. `Intl.Segmenter` is not cheap to construct and this is asked per
 * render of every text effect on the page.
 */
const SEGMENTER = typeof Intl !== 'undefined' && 'Segmenter' in Intl;

/**
 * The text a node carries, and nothing about its markup.
 *
 * Elements contribute nothing on purpose. There is no honest way to type out
 * half of a link, or to scramble the third character of a `<strong>` and leave
 * the emphasis intact — the effects that read this animate *text*, so what they
 * take is text.
 */
export function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(textOf).join('');
  }

  return '';
}

/** The text split the way a reader would split it: by grapheme cluster. */
export function graphemesOf(text: string, locale?: string): string[] {
  if (!SEGMENTER) {
    return [...text];
  }

  const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });

  return [...segmenter.segment(text)].map((segment) => segment.segment);
}

/**
 * The text split into words, with the space after each one kept on it.
 *
 * Kept rather than dropped, because a set of fragments that has thrown its
 * whitespace away cannot be laid out again: joining with `' '` puts a space
 * where a line break was and another one before a full stop. Each fragment
 * carries what followed it, so the pieces still concatenate to the original.
 *
 * `isWordLike` is what separates a word from the punctuation and spacing
 * between two of them, and the run of non-words after a word is folded onto it.
 */
export function wordsOf(text: string, locale?: string): string[] {
  if (!SEGMENTER) {
    // Split *after* each run of whitespace, so the space stays on the word
    // before it and the pieces still join back to the original string.
    return text.match(/\S+\s*|\s+/g) ?? [];
  }

  const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
  const words: string[] = [];

  for (const segment of segmenter.segment(text)) {
    if (segment.isWordLike || words.length === 0) {
      words.push(segment.segment);
    } else {
      words[words.length - 1] += segment.segment;
    }
  }

  return words;
}
