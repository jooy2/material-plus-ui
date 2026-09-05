import { MPButton, MPCard, MPImage } from 'material-plus-ui';

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
        title="Sunrise over the terraces"
        subtitle="05:41, from the top of the ridge"
        media={
          <MPImage
            src="/samples/photos/thumbs/misty-tea-terraces-sunrise.webp"
            alt="Rows of tea terraces in low mist, with the sun just over the hills"
            ratio="16 / 9"
          />
        }
        footer={<MPButton variant="text">Open</MPButton>}
      >
        The picture reaches all four edges of the top. Nothing above it is padded.
      </MPCard>
    </div>
  );
}
