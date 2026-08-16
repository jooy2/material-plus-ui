import { MPAnimateTyping, MPBox, MPTypography } from 'material-plus-ui';

/**
 * `repeat`, `hold` and `erase` are what make it a loop: type, hold, delete,
 * type again. Without `erase` a repeat clears in one frame, which is right for
 * a line being replaced rather than rewritten.
 */
export default function AnimateTypingHero() {
  return (
    <MPBox style={{ width: '100%', maxWidth: 420 }}>
      <MPTypography level="overline">Search for</MPTypography>
      <MPAnimateTyping
        text="anything you can name"
        speed={16}
        repeat="infinite"
        erase
        hold={1600}
        style={{ fontSize: '1.25rem' }}
      />
    </MPBox>
  );
}
