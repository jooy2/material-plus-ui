import { MPButton, MPEmpty } from 'material-plus-ui';

export default function EmptyHero() {
  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <MPEmpty
        variant="outlined"
        title="No results for “oklch”"
        action={
          <>
            <MPButton size="sm" variant="tonal">
              Clear filters
            </MPButton>
            <MPButton size="sm" variant="text">
              Search everywhere
            </MPButton>
          </>
        }
      >
        Nothing in this repository matches that. Try a shorter term, or widen the date range.
      </MPEmpty>
    </div>
  );
}
