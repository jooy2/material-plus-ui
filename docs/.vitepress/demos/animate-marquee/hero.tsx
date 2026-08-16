import { MPAnimateMarquee, MPChip } from 'material-plus-ui';

/**
 * `pauseOnHover` is on by default and is not decoration: content moving past a
 * pointer cannot be clicked reliably, and a link inside a marquee that never
 * stops is a link nobody can follow. Point at the strip and it holds still.
 */
export default function AnimateMarqueeHero() {
  const tools = [
    'TypeScript',
    'React',
    'Base UI',
    'Tailwind CSS',
    'Vite',
    'Vitest',
    'Playwright',
    'VitePress'
  ];

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <MPAnimateMarquee speed={50} gap="1rem">
        {tools.map((tool) => (
          <MPChip key={tool} variant="tonal">
            {tool}
          </MPChip>
        ))}
      </MPAnimateMarquee>
    </div>
  );
}
