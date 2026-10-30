import { colorRow, from, renamed, sizeRow, VARIANT, WIDGET, type PropRow } from './shared';

export default {
  MPChatBubble: [
    renamed('MPChatBubble', 'children', 'child', { type: `${WIDGET}?` }),
    from('MPChatBubble', 'side', { type: 'MPChatBubbleSide', default: 'MPChatBubbleSide.start' }),
    from('MPChatBubble', 'name', { type: `${WIDGET}?` }),
    from('MPChatBubble', 'time', { type: `${WIDGET}?` }),
    from('MPChatBubble', 'avatar', { type: `${WIDGET}?` }),
    from('MPChatBubble', 'status', { type: 'MPChatBubbleStatus?' }),
    from('MPChatBubble', 'statusLabel', { type: 'String?' }),
    from('MPChatBubble', 'typing', { type: 'bool', default: 'false' }),
    from('MPChatBubble', 'media', { type: `${WIDGET}?` }),
    from('MPChatBubble', 'preview', {
      type: 'MPChatBubblePreview?',
      description: {
        ko: '메시지 속 링크를 텍스트 아래 카드로 펼칩니다. `onPressed`, `title`, `description`, `image`(`ImageProvider`), `site`를 받고, `url`은 없습니다. 카드가 어디로 갈지는 앱이 `onPressed`에서 정합니다',
        en: 'A link in the message, unfurled into a card under the text. Takes `onPressed`, `title`, `description`, `image` (an `ImageProvider`) and `site`, and no `url`: where the card goes is the app’s to decide in `onPressed`'
      }
    }),
    from('MPChatBubble', 'actions', {
      type: `${WIDGET}?`,
      description: {
        ko: '메시지 자신의 액션. 말풍선 옆에 앉고, 행에 호버가 오거나 포커스가 들어오기 전까지 보이지 않습니다. Android와 iOS에서는 항상 보입니다',
        en: 'The message’s own actions. Sits beside the bubble and stays hidden until the row is hovered or something in it takes focus; always shown on Android and iOS'
      }
    }),
    from('MPChatBubble', 'locale', { type: 'String?' }),
    from('MPChatBubble', 'variant', { type: VARIANT, default: 'MPVariant.tonal' }),
    sizeRow('MPChatBubble'),
    colorRow('MPChatBubble')
  ]
} satisfies Record<string, PropRow[]>;
