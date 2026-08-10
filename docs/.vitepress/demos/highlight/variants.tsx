import { MPHighlight } from 'material-plus-ui';

const SENTENCE = 'The migration ran on Tuesday and finished in four minutes.';

/**
 * Four weights, and the default is the one that is actually a highlighter pen:
 * `tonal` is a container tone — a pale wash under dark ink — rather than a word
 * replaced by a block of colour.
 */
export default function HighlightVariants() {
  return (
    <div style={{ display: 'grid', gap: 12, lineHeight: 1.8 }}>
      <MPHighlight query="Tuesday" variant="tonal">
        {SENTENCE}
      </MPHighlight>
      <MPHighlight query="Tuesday" variant="filled">
        {SENTENCE}
      </MPHighlight>
      <MPHighlight query="Tuesday" variant="outlined">
        {SENTENCE}
      </MPHighlight>
      <MPHighlight query="Tuesday" variant="text" underline>
        {SENTENCE}
      </MPHighlight>
    </div>
  );
}
