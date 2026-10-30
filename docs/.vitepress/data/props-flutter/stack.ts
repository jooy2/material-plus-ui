import { from, renamed, sizeRow, type PropRow } from './shared';

export default {
  MPStack: [
    renamed('MPStack', 'children', 'children', { type: 'List<Widget>', required: true }),
    from('MPStack', 'direction', {
      type: 'MPStackDirection',
      default: 'MPStackDirection.horizontal'
    }),
    from('MPStack', 'overlap', {
      type: 'double?',
      description: {
        ko: '항목마다 앞 항목 아래로 들어가는 거리, 논리 픽셀입니다. 지정하지 않으면 `size`의 단계에서 가져옵니다: 10, 12, 18, 20, 24',
        en: "How far each item sits under the one before it, in logical pixels. Left out, it comes off `size`'s rung: 10, 12, 18, 20, 24"
      }
    }),
    from('MPStack', 'drop', { type: 'double?' }),
    sizeRow('MPStack'),
    from('MPStack', 'max', { type: 'int?' }),
    from('MPStack', 'total', { type: 'int?' }),
    from('MPStack', 'overflow', {
      type: 'Widget Function(int hidden)?',
      description: {
        ko: "들어가지 못한 개수로 만드는 더미의 마지막 항목. 그 개수가 그 항목이 할 말의 전부이므로 위젯이 아니라 함수입니다: `(hidden) => MPAvatar(initials: '+$hidden')`",
        en: "The last item in the pile, built from the number that did not fit. A builder rather than a widget, because the count is the whole of what it says: `(hidden) => MPAvatar(initials: '+$hidden')`"
      }
    }),
    from('MPStack', 'front', { type: 'MPStackFront', default: 'MPStackFront.first' }),
    from('MPStack', 'scaleStep', { type: 'double', default: '1' }),
    from('MPStack', 'opacityStep', { type: 'double', default: '1' }),
    from('MPStack', 'ring', { type: 'bool', default: 'false' }),
    {
      name: 'ringRadius',
      type: 'BorderRadius?',
      description: {
        ko: '`ring`의 모서리. 지정하지 않으면 완전히 둥근 모양으로, 아바타 더미에 맞습니다. Flutter는 자식의 모양을 읽을 수 없으므로 둥근 카드 더미라면 그 모서리를 알려 줍니다',
        en: "The corners of the `ring`. Fully round when left out, which is what a pile of avatars wants. Flutter cannot read a child's shape, so a pile of rounded cards says what their corner is"
      }
    },
    from('MPStack', 'transition', {
      type: 'MPAnimation?',
      description: {
        ko: '각 항목의 등장 효과. `MPAnimate*` 위젯이 쓰는 일곱 가지 중 하나이며, 지정하지 않으면 아무것도 움직이지 않습니다',
        en: 'An entrance for each item, one of the seven the `MPAnimate*` widgets run. Left out, nothing is animated'
      }
    }),
    from('MPStack', 'duration', { type: 'Duration?' }),
    from('MPStack', 'delay', { type: 'Duration', default: 'Duration.zero' }),
    from('MPStack', 'easing', { type: 'MPEasing?' }),
    from('MPStack', 'stagger', { type: 'Duration', default: 'Duration(milliseconds: 60)' }),
    from('MPStack', 'durationStep', { type: 'Duration', default: 'Duration.zero' }),
    from('MPStack', 'reverse', { type: 'bool', default: 'false' }),
    from('MPStack', 'trigger', { type: 'MPAnimateTrigger', default: 'MPAnimateTrigger.mount' }),
    from('MPStack', 'play', { type: 'bool', default: 'false' }),
    from('MPStack', 'once', { type: 'bool', default: 'true' }),
    from('MPStack', 'threshold', { type: 'double', default: '0.2' }),
    from('MPStack', 'paused', { type: 'bool', default: 'false' }),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '더미가 무엇의 더미인지 화면 낭독기에 알리는 이름. 주면 그 이름의 컨테이너가 되고, 항목마다 자기 노드를 유지합니다. React에서 감싸는 엘리먼트에 `aria-label`을 주는 자리입니다',
        en: 'What the pile is a pile of, for a screen reader. Given, the stack is a container with that name and each item keeps its own node. Where React puts an `aria-label` on a wrapping element'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
