import { useState } from 'react';
import { ICONS, MPChip, MPIcon } from 'material-plus-ui';

const FILTERS = ['Open', 'Assigned to me', 'Has failures'];

export default function ChipHero() {
  const [on, setOn] = useState<string[]>(['Open']);
  const [tags, setTags] = useState(['design', 'a11y', 'md3']);

  return (
    <div style={{ display: 'grid', gap: 18, width: '100%', maxWidth: 520 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {FILTERS.map((filter) => (
          <MPChip
            key={filter}
            selected={on.includes(filter)}
            startIcon={on.includes(filter) ? <MPIcon icon={ICONS.check} size={18} /> : undefined}
            onClick={() =>
              setOn((current) =>
                current.includes(filter)
                  ? current.filter((value) => value !== filter)
                  : [...current, filter]
              )
            }
          >
            {filter}
          </MPChip>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tags.map((tag) => (
          <MPChip
            key={tag}
            variant="tonal"
            onDelete={() => setTags((current) => current.filter((value) => value !== tag))}
          >
            {tag}
          </MPChip>
        ))}
        <MPChip variant="text" count={12} color="error">
          Errors
        </MPChip>
      </div>
    </div>
  );
}
