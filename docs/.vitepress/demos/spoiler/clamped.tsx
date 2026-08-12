import { MPSpoiler, MPTypography } from 'material-plus-ui';

/**
 * `maxHeight` clamps the **covered** box only.
 *
 * Set it for something long enough that a page of blurred content would be a
 * page of nothing. Revealing releases the clamp and the content takes whatever
 * height it needs — revealing something and leaving it in a box with a scrollbar
 * is answering the wrong question.
 *
 * `padded={false}` is for content that should reach the edges. The sheet's own
 * corners still crop it.
 */
export default function SpoilerClamped() {
  return (
    <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 460 }}>
      <MPSpoiler maxHeight={96} blur={6} reversible label="Read the ending">
        <MPTypography level="body">
          The train was late, which is how she came to be standing on the platform when the letter
          arrived. It had been posted four years earlier, from an address that no longer existed, by
          a man who had signed it with her own surname. She read it twice on the platform and a
          third time on the train, and by the time she reached the coast she had decided what to do
          about it.
        </MPTypography>
      </MPSpoiler>

      <MPSpoiler padded={false} description="Contains flashing images">
        <div
          style={{
            height: 120,
            background: 'linear-gradient(120deg, var(--mp-source-color), transparent)'
          }}
        />
      </MPSpoiler>
    </div>
  );
}
