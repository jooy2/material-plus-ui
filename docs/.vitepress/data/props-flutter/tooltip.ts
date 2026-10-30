import { COLOR, from, renamed, SIZE, WIDGET, type PropRow } from './shared';

export default {
  MPTooltip: [
    from('MPTooltip', 'content', {
      type: WIDGET,
      description: {
        ko: '툴팁이 말하는 것. 보통 `Text` 하나입니다. 짧은 구절이어야 합니다 — 툴팁은 컨테이너가 아닙니다',
        en: 'What the tooltip says, usually a `Text`. A short phrase — a tooltip is not a container'
      }
    }),
    renamed('MPTooltip', 'children', 'child', {
      type: WIDGET,
      description: {
        ko: '툴팁이 매달리는 위젯. 화면 낭독기는 이 위젯과 툴팁의 말을 한 노드로 읽으므로, 툴팁이 설명하는 컨트롤이나 텍스트 하나여야 합니다',
        en: 'What it hangs off. A screen reader reads it and the tooltip’s words as one node, so it should be the one control, or the text, the tooltip describes'
      }
    }),
    from('MPTooltip', 'side', { type: 'MPSide', default: 'MPSide.top' }),
    from('MPTooltip', 'align', { type: 'MPAlign', default: 'MPAlign.center' }),
    from('MPTooltip', 'sideOffset', {
      type: 'double',
      description: {
        ko: '트리거와의 거리(논리 픽셀)',
        en: 'Distance from the trigger, in logical pixels'
      }
    }),
    from('MPTooltip', 'delay', {
      type: 'Duration?',
      default: '600ms',
      description: {
        ko: '열리기까지 포인터가 머물러야 하는 시간. 비워 두면 가장 가까운 `MPTooltipProvider`를, 그다음 600밀리초를 따릅니다',
        en: 'How long the pointer has to rest before it opens. Left out, it follows the nearest `MPTooltipProvider`, then 600 milliseconds'
      }
    }),
    from('MPTooltip', 'closeDelay', {
      type: 'Duration?',
      default: 'Duration.zero',
      description: {
        ko: '포인터가 떠난 뒤 닫히기까지의 시간. 비워 두면 가장 가까운 `MPTooltipProvider`를, 그다음 0을 따릅니다',
        en: 'How long it waits before closing once the pointer leaves. Left out, it follows the nearest `MPTooltipProvider`, then none'
      }
    }),
    from('MPTooltip', 'arrow', { type: 'bool' }),
    from('MPTooltip', 'open', {
      type: 'bool?',
      description: {
        ko: '밖에서 열림을 정합니다. `null`(기본값)이면 포인터, 키보드, 길게 누르기가 정합니다',
        en: 'Drives the tooltip from outside. `null`, the default, leaves it to the pointer, the keyboard and a long press'
      }
    }),
    renamed('MPTooltip', 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from('MPTooltip', 'onOpenChange', { type: 'ValueChanged<bool>?' }),
    from('MPTooltip', 'disabled', { type: 'bool' }),
    from('MPTooltip', 'size', { type: SIZE, default: 'MPSize.sm' }),
    from('MPTooltip', 'color', { type: `${COLOR}?` }),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '화면 낭독기가 읽는 툴팁의 말. `content`가 `Text`면 그 글자가 기본값이고, 다른 위젯이면 이것을 주어야 합니다',
        en: 'What a screen reader reads as the tooltip. Defaults to the text when `content` is a `Text`; anything else needs it'
      }
    }
  ],
  MPTooltipProvider: [
    {
      name: 'child',
      type: WIDGET,
      required: true,
      description: { ko: '묶음 안에 들어가는 것', en: 'What is inside the group' }
    },
    {
      name: 'delay',
      type: 'Duration?',
      description: {
        ko: '자기 `delay`를 정하지 않은 안쪽 툴팁의 열림 지연',
        en: 'How long a tooltip inside waits before it opens, for one that does not set its own `delay`'
      }
    },
    {
      name: 'closeDelay',
      type: 'Duration?',
      description: {
        ko: '자기 `closeDelay`를 정하지 않은 안쪽 툴팁의 닫힘 지연',
        en: 'How long a tooltip inside waits before it closes, for one that does not set its own `closeDelay`'
      }
    },
    {
      name: 'timeout',
      type: 'Duration',
      default: '400ms',
      description: {
        ko: '마지막 툴팁이 닫힌 뒤에도 이웃이 곧바로 열리는 시간',
        en: 'How long after the last tooltip closed its neighbours still open at once'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
