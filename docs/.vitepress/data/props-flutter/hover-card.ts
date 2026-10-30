import { densityRow, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPHoverCard: [
    from('MPHoverCard', 'trigger', {
      type: WIDGET,
      description: {
        ko: '카드가 매달리는 위젯. 쓰인 자리에 그대로 그려집니다. 보통 텍스트 링크나 아바타입니다',
        en: 'What the card hangs off, drawn where it was written. Usually a text link or an avatar'
      }
    }),
    from('MPHoverCard', 'title', {
      type: `${WIDGET}?`,
      description: {
        ko: '제목. 화면 낭독기에 제목으로 알려집니다',
        en: 'The heading, announced as one'
      }
    }),
    from('MPHoverCard', 'description', {
      type: `${WIDGET}?`,
      description: {
        ko: '제목 아래 한 줄. 한 단계 옅은 잉크로 씁니다',
        en: 'A line under the heading, in the quieter ink'
      }
    }),
    renamed('MPHoverCard', 'children', 'child', { type: `${WIDGET}?` }),
    from('MPHoverCard', 'side', { type: 'MPSide', default: 'MPSide.bottom' }),
    from('MPHoverCard', 'align', { type: 'MPAlign', default: 'MPAlign.center' }),
    from('MPHoverCard', 'sideOffset', {
      type: 'double',
      description: {
        ko: '트리거에서 떨어진 거리, 논리 픽셀',
        en: 'Distance from the trigger, in logical pixels'
      }
    }),
    from('MPHoverCard', 'alignOffset', {
      type: 'double',
      description: {
        ko: '그 가장자리를 따라 밀린 정도, 논리 픽셀. 위아래에서는 줄이 끝나는 쪽으로, 양옆에서는 아래로 밉니다',
        en: 'Shift along that edge, in logical pixels: towards the end of the line above or below the trigger, and downwards beside it'
      }
    }),
    from('MPHoverCard', 'arrow', { type: 'bool' }),
    from('MPHoverCard', 'open', {
      type: 'bool?',
      description: {
        ko: '밖에서 열림을 정합니다. `null`(기본값)이면 포인터와 키보드가 정합니다',
        en: 'Drives the card from outside. `null`, the default, leaves it to the pointer and the keyboard'
      }
    }),
    renamed('MPHoverCard', 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from('MPHoverCard', 'onOpenChange', { type: 'ValueChanged<bool>?' }),
    from('MPHoverCard', 'delay', {
      type: 'Duration?',
      default: '600ms',
      description: {
        ko: '카드가 열리기 전까지 포인터가 머물러야 하는 시간. 링크 문단을 훑고 지날 때 네 개가 따라 열리지 않을 만큼 깁니다',
        en: 'How long the pointer has to rest before the card opens. Long enough that dragging across a paragraph of links does not open four of them'
      }
    }),
    from('MPHoverCard', 'closeDelay', {
      type: 'Duration?',
      default: '300ms',
      description: {
        ko: '포인터가 떠난 뒤 카드가 남아 있는 시간. 트리거와 카드 사이의 틈을 건널 수 있게 하는 것이 이것입니다',
        en: 'How long the card stays after the pointer has left. This is what makes the gap between the trigger and the card crossable'
      }
    }),
    from('MPHoverCard', 'width', { type: 'double?' }),
    sizeRow('MPHoverCard'),
    densityRow('MPHoverCard')
  ]
} satisfies Record<string, PropRow[]>;
