import { MPButton, MPCard } from 'material-plus-ui';

/**
 * `media` is drawn edge to edge across the top, so the card's own corners crop
 * it.
 *
 * It is a slot of its own rather than part of `children` because it is the one
 * part of a card that must not be padded — and because the sheet only clips when
 * there is something to crop, so a card with no picture keeps its focus rings
 * intact.
 */
export default function CardMedia() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 320 }}>
      <MPCard
        variant="filled"
        title="Sunrise over Namsan"
        subtitle="Seoul, 05:41"
        media={
          <div
            style={{
              height: 120,
              background: 'linear-gradient(120deg, var(--mp-source-color), transparent)'
            }}
          />
        }
        footer={<MPButton variant="text">Open</MPButton>}
      >
        The picture reaches all four edges of the top. Nothing above it is padded.
      </MPCard>
    </div>
  );
}
