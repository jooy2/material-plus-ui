import { MPBlockquote } from 'material-plus-ui';

export default function BlockquoteHero() {
  return (
    <div style={{ display: 'grid', gap: 24, width: '100%', maxWidth: 560 }}>
      <MPBlockquote author="Ada Lovelace" source="Notes on the Analytical Engine">
        The Analytical Engine has no pretensions whatever to originate anything.
      </MPBlockquote>

      <MPBlockquote variant="tonal" size="sm" icon={false} author="Design review">
        A heading set in 600 is the fastest way to make a Material page look like it belongs to some
        other system.
      </MPBlockquote>
    </div>
  );
}
