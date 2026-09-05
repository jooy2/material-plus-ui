import { ICONS, MPAvatar, MPChatBubble, MPIcon, MPIconButton } from 'material-plus-ui';

/**
 * The optional parts: a picture across the top, a link unfurled underneath, and
 * the row's own actions.
 *
 * `media` reaches all four edges of the bubble's top, so the bubble's corners
 * crop it. The link card is mixed out of `currentColor` rather than pointed at a
 * role, because it has to work on an accent fill and on a neutral one alike.
 *
 * The action stays invisible until the row is hovered or something in it takes
 * focus — a menu trigger sitting permanently in the middle of a conversation is
 * a handle in the way of the reading. On a touch screen there is nothing to
 * hover, so it is simply always there.
 */
export default function ChatBubbleSlots() {
  return (
    <div style={{ display: 'grid', gap: 10, width: '100%', maxWidth: 460 }}>
      <MPChatBubble
        avatar={<MPAvatar size="sm" src="/samples/people/theo-quinn.webp" name="Theo Quinn" />}
        name="Theo"
        time="09:12"
        actions={
          <MPIconButton size="xs" icon={<MPIcon icon={ICONS.more} />} label="Message menu" />
        }
        media={
          <img
            src="/samples/photos/thumbs/rainy-city-crosswalk-reflections.webp"
            alt="A city crossing in the rain, the lights running down the wet road"
            style={{ display: 'block', width: '100%', height: 120, objectFit: 'cover' }}
          />
        }
      >
        The view from the office this morning.
      </MPChatBubble>

      <MPChatBubble
        side="end"
        variant="filled"
        status="delivered"
        preview={{
          url: 'https://m3.material.io/components/cards',
          site: 'm3.material.io',
          title: 'Cards — Material Design 3',
          description:
            'Cards contain content and actions about a single subject, and come in three variants.',
          image: '/samples/illustrations/thumbs/layered-mountains-rising-sun.webp'
        }}
      >
        This is the page I meant.
      </MPChatBubble>
    </div>
  );
}
