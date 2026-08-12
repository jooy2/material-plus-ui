import { MPChatBubble } from 'material-plus-ui';
import type { MPChatBubbleStatus } from 'material-plus-ui';

/**
 * The five marks, and the two that carry a colour.
 *
 * `read` and `failed` are the only ones worth colouring: one says it arrived and
 * the other says it did not. The three in between are the ordinary course of
 * events, and a thread where every message is marked in colour is a thread where
 * the colour has stopped meaning anything.
 *
 * Every mark has a word behind it that only a screen reader hears, in whichever
 * language `locale` names.
 */
const STATUSES: MPChatBubbleStatus[] = ['sending', 'sent', 'delivered', 'read', 'failed'];

export default function ChatBubbleStatus() {
  return (
    <div style={{ display: 'grid', gap: 10, width: '100%', maxWidth: 400 }}>
      {STATUSES.map((status) => (
        <MPChatBubble key={status} side="end" variant="filled" status={status}>
          {status}
        </MPChatBubble>
      ))}
    </div>
  );
}
