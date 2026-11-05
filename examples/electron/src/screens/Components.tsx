import { Suspense, lazy, useMemo, useState, type ComponentType } from 'react';
import { MPChip, MPList, MPListItem, MPTextField } from 'material-plus-ui';

// The same files the documentation mounts, one module per demo. The folders left
// out hold whole pages, hooks or the colour guide rather than one component, and
// are left out of the build too rather than only out of the list.
const modules = import.meta.glob<{ default: ComponentType<Record<string, unknown>> }>([
  '../../../../docs/.vitepress/demos/*/*.tsx',
  '!../../../../docs/.vitepress/demos/{color,concepts,gallery,home,hooks,showcase}/*.tsx',
  '!../../../../docs/.vitepress/demos/*/glyphs.tsx'
]);

function demoName(path: string) {
  return path.split('/demos/')[1].replace(/\.tsx$/, '');
}

const demos = new Map(Object.entries(modules).map(([path, load]) => [demoName(path), lazy(load)]));

const components = [...new Set([...demos.keys()].map((name) => name.split('/')[0]))].sort();

/** The demo a component opens on: its hero, or its first when it has none. */
function firstDemo(component: string) {
  const names = [...demos.keys()].filter((name) => name.split('/')[0] === component);

  return names.includes(`${component}/hero`) ? `${component}/hero` : names.sort()[0];
}

/** Every demo, grouped by the component it belongs to. */
export function Components({ initial }: { initial?: string }) {
  const [query, setQuery] = useState('');
  const [demo, setDemo] = useState(initial ?? 'button/hero');
  const component = demo.split('/')[0];
  const Demo = demos.get(demo);
  const found = useMemo(
    () => components.filter((name) => name.includes(query.trim().toLowerCase())),
    [query]
  );

  return (
    <div className="grid h-full min-h-0 grid-cols-[14rem_1fr] gap-4">
      <div className="flex min-h-0 flex-col gap-3">
        <MPTextField
          fullWidth
          type="search"
          aria-label="Search components"
          placeholder={`Search ${components.length} components`}
          value={query}
          onChange={setQuery}
        />
        <MPList size="sm" className="min-h-0 overflow-auto">
          {found.map((name) => (
            <MPListItem
              key={name}
              selected={name === component}
              onClick={() => setDemo(firstDemo(name))}
            >
              {name}
            </MPListItem>
          ))}
        </MPList>
      </div>

      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {[...demos.keys()]
            .filter((name) => name.split('/')[0] === component)
            .map((name) => (
              <MPChip key={name} selected={name === demo} onClick={() => setDemo(name)}>
                {name.split('/')[1]}
              </MPChip>
            ))}
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-1" data-testid="demo">
          <Suspense fallback={null}>{Demo ? <Demo key={demo} /> : null}</Suspense>
        </div>
      </div>
    </div>
  );
}
