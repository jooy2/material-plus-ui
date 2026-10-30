import { colorRow, focusRows, from, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPFloatingActionButton: [
    from('MPFloatingActionButton', 'label', { type: 'String', required: true }),
    {
      name: 'onPressed',
      type: 'VoidCallback?',
      required: true,
      description: {
        ko: '눌렀을 때 실행됩니다. `null`이면 버튼이 비활성화되고 그림자도 사라집니다. React의 `onClick` 자리입니다',
        en: "Runs when the button is pressed. `null` disables it, and the shadow goes too. React's `onClick`"
      }
    },
    from('MPFloatingActionButton', 'icon', { type: `${WIDGET}?` }),
    from('MPFloatingActionButton', 'extended', { type: 'bool', default: 'false' }),
    from('MPFloatingActionButton', 'variant', {
      type: 'MPFloatingActionButtonVariant',
      default: 'MPFloatingActionButtonVariant.tonal'
    }),
    colorRow('MPFloatingActionButton'),
    sizeRow('MPFloatingActionButton'),
    {
      name: 'floating',
      type: 'bool',
      default: 'true',
      description: {
        ko: '둘러싼 `Stack`의 모서리에 스스로 자리를 잡을지. 끄면 같은 버튼을 레이아웃 안에 둘 수 있습니다. React의 `position` 자리입니다',
        en: "Whether it positions itself in a corner of the `Stack` around it. Off, the same button sits in the layout. React's `position`"
      }
    },
    from('MPFloatingActionButton', 'corner', { type: 'MPCorner', default: 'MPCorner.bottomEnd' }),
    from('MPFloatingActionButton', 'offset', {
      type: 'double',
      default: '16',
      description: {
        ko: '두 가장자리에서 들어오는 거리(논리 픽셀). 그 두 가장자리의 안전 영역이 더해집니다',
        en: 'How far in from both edges, in logical pixels. The safe area on those two edges is added on top'
      }
    }),
    {
      name: 'disabled',
      type: 'bool',
      default: 'false',
      description: {
        ko: '`onPressed`가 있어도 비활성화합니다. 자리는 지키고, 응답을 멈추고, 떠 있지 않습니다',
        en: 'Disables it even though `onPressed` is set. Keeps its place, stops answering, and stops floating'
      }
    },
    {
      name: 'onLongPress',
      type: 'VoidCallback?',
      description: { ko: '길게 눌렀을 때 실행됩니다', en: 'Runs on a long press' }
    },
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
