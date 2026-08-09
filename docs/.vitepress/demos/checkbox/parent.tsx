import { useState } from 'react';
import { MPCheckbox } from 'material-plus-ui';

const SCOPES = ['Read', 'Write', 'Delete'];

/**
 * What the third state is actually for.
 *
 * `indeterminate` is a *display* state, not a value: it says "some of my
 * children are ticked" and nothing else. Clicking a half-ticked box ticks it,
 * which is what the parent below does — it never hands the reader a click that
 * lands back where it started.
 */
export default function CheckboxParent() {
  const [chosen, setChosen] = useState<string[]>(['Read']);

  const all = chosen.length === SCOPES.length;
  const some = chosen.length > 0 && !all;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <MPCheckbox
        label="All permissions"
        checked={all}
        indeterminate={some}
        onCheckedChange={(checked) => setChosen(checked ? [...SCOPES] : [])}
      />
      <div style={{ display: 'grid', gap: 12, paddingInlineStart: 30 }}>
        {SCOPES.map((scope) => (
          <MPCheckbox
            key={scope}
            label={scope}
            checked={chosen.includes(scope)}
            onCheckedChange={(checked) =>
              setChosen((held) =>
                checked ? [...held, scope] : held.filter((name) => name !== scope)
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
