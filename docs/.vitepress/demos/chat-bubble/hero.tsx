import { MPAvatar, MPChatBubble } from 'material-plus-ui';

/** One picture, shared by the two rows the same person sent. */
const NADIA = <MPAvatar size="sm" src="/samples/people/nadia-rowan.webp" name="Nadia Rowan" />;

/**
 * A thread, which is a column of these.
 *
 * `side` decides which way a row runs and which corner of the bubble is cut
 * short. `variant` decides the emphasis, and it is deliberately not tied to
 * `side`: filling the reading-end column is a convention, not a law.
 */
export default function ChatBubbleHero() {
  return (
    <div style={{ display: 'grid', gap: 10, width: '100%', maxWidth: 460 }}>
      <MPChatBubble avatar={NADIA} name="Nadia" time="18:01">
        Are we still on for six?
      </MPChatBubble>

      <MPChatBubble side="end" variant="filled" time="18:02" status="read">
        Yes — I booked the corner table.
      </MPChatBubble>

      <MPChatBubble avatar={NADIA} typing />
    </div>
  );
}
