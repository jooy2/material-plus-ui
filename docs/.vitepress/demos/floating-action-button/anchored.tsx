import { ICONS, MPBox, MPFloatingActionButton, MPIcon, MPTypography } from 'material-plus-ui';

/**
 * `position="absolute"`, which pins the button to a *region* rather than to the
 * window.
 *
 * This is the value that makes a floating button usable anywhere but the corner
 * of the screen: over a card, over a map, over the preview of a phone. The
 * offset is the same 16dp Material puts between the button and the edge.
 */
export default function FloatingActionButtonAnchored() {
  return (
    <MPBox variant="filled" style={{ position: 'relative', width: '100%', minHeight: 200 }}>
      <MPTypography level="h6" gutter>
        Today
      </MPTypography>
      <MPTypography level="body">
        Three notes, none of them urgent. The button belongs to this sheet rather than to the
        window, so it stays where the sheet is.
      </MPTypography>

      <MPFloatingActionButton
        position="absolute"
        corner="bottom-end"
        icon={<MPIcon icon={ICONS.add} />}
        label="New note"
      />
    </MPBox>
  );
}
