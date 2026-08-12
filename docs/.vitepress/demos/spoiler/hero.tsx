import { MPSpoiler, MPTypography } from 'material-plus-ui';

/**
 * The cover is a blur rather than a `display: none`, and that is the whole
 * point: a reader can see that there is something there and roughly how much of
 * it, without being able to read it by accident.
 *
 * While it is covered the content is `inert` — not tabbable, not readable by a
 * screen reader, not selectable by a drag across the page. A spoiler that can be
 * defeated by Ctrl-A is not a spoiler.
 */
export default function SpoilerHero() {
  return (
    <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 460 }}>
      <MPSpoiler reversible>
        <MPTypography level="body">
          She was his sister the whole time, and the letter in the drawer was written by their
          mother the night before she left.
        </MPTypography>
      </MPSpoiler>

      <MPSpoiler variant="text" description="Salary range">
        <MPTypography level="h5">₩72,000,000 – ₩96,000,000</MPTypography>
      </MPSpoiler>
    </div>
  );
}
