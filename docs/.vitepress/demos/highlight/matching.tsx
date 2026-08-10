import { MPHighlight } from 'material-plus-ui';

/**
 * How the matching is done is a prop, not something a caller pre-computes into
 * a list of offsets.
 */
export default function HighlightMatching() {
  return (
    <div style={{ display: 'grid', gap: 16, lineHeight: 1.8 }}>
      <div>
        <MPHighlight query="cat">A cat, a Cat and concatenate</MPHighlight>
      </div>
      <div>
        <MPHighlight query="cat" caseSensitive>
          A cat, a Cat and concatenate
        </MPHighlight>
      </div>
      <div>
        <MPHighlight query="cat" wholeWord>
          A cat, a Cat and concatenate
        </MPHighlight>
      </div>
      <div>
        <MPHighlight query={/\d{4}-\d{2}-\d{2}/} color="primary">
          Released 2026-08-10, superseded 2026-09-01.
        </MPHighlight>
      </div>
    </div>
  );
}
