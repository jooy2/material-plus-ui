import { MPAnimateLighting, MPBox, MPTypography } from 'material-plus-ui';

/**
 * Three dials, and they are the whole of the look.
 *
 * `arc` is how much of the outline is lit at once — small is a travelling
 * spark, large is a sweep. `blur` is how soft the light is; at `0` it is a
 * hard-edged wedge, which reads as a graphic rather than as light. `spread` is
 * how far past the content it reaches.
 */
export default function AnimateLightingShape() {
  const looks = [
    { label: 'A spark', arc: 18, blur: 6, spread: 3, color: 'primary' as const },
    { label: 'A sweep', arc: 140, blur: 10, spread: 5, color: 'tertiary' as const },
    { label: 'A wedge', arc: 60, blur: 0, spread: 2, color: 'secondary' as const },
    { label: 'A halo', arc: 200, blur: 14, spread: 8, color: 'error' as const }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gap: 20,
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        width: '100%',
        maxWidth: 460
      }}
    >
      {looks.map((look) => (
        <MPAnimateLighting
          key={look.label}
          size="sm"
          color={look.color}
          arc={look.arc}
          blur={look.blur}
          spread={look.spread}
          duration={4000}
        >
          <MPBox size="sm" variant="filled">
            <MPTypography level="caption">{look.label}</MPTypography>
          </MPBox>
        </MPAnimateLighting>
      ))}
    </div>
  );
}
