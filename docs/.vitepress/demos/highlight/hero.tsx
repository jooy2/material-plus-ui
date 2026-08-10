import { useState } from 'react';
import { MPHighlight, MPTextField } from 'material-plus-ui';

const PASSAGE =
  'A database is a structured set of data. The word data is the plural of datum, and a data set that nobody can query is a file.';

/**
 * The component is the search, not just the styling: `query` is whatever the
 * field holds, and the marking re-runs on its own as it changes.
 */
export default function HighlightHero() {
  const [query, setQuery] = useState('data');

  return (
    <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 460 }}>
      <MPTextField label="Find in page" value={query} onChange={setQuery} size="sm" fullWidth />
      <p style={{ margin: 0, lineHeight: 1.7 }}>
        <MPHighlight query={query}>{PASSAGE}</MPHighlight>
      </p>
    </div>
  );
}
