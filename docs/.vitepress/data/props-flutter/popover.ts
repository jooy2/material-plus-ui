import { from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPPopover: [
    from('MPPopover', 'trigger', {
      type: 'MPPopoverTriggerBuilder?',
      description: {
        ko: '팝업이 매달리고 팝업을 여는 위젯을 만드는 함수. 열고 닫는 콜백을 받습니다. 여기서 만든 `MPButton`과 `MPIconButton`은 팝업이 열렸는지도 화면 낭독기에 알립니다. 선택 사항이지만, 없으면 `MPPopover`를 쓴 자리에 매달립니다',
        en: 'Builds the widget the popup hangs off and that opens it, handed the call that toggles it. An `MPButton` or `MPIconButton` built here also tells a screen reader whether its popup is open. Optional, though a popover with none hangs off the place the `MPPopover` was written'
      }
    }),
    from('MPPopover', 'title', {
      type: `${WIDGET}?`,
      description: {
        ko: '제목. 화면 낭독기에 제목으로 알려지고, 팝업의 이름이 됩니다',
        en: "The heading, announced as one and as the popup's name"
      }
    }),
    from('MPPopover', 'description', {
      type: `${WIDGET}?`,
      description: {
        ko: '제목 아래 한 줄. 한 단계 옅은 잉크로 씁니다',
        en: 'A line under the title, in the quieter ink'
      }
    }),
    from('MPPopover', 'side', {
      type: 'MPSide',
      default: 'MPSide.bottom',
      description: {
        ko: '트리거의 어느 변에 나타날지. 자리가 없으면 반대편으로 뒤집히고, 변을 따라 미끄러지지는 않습니다. 지시가 아니라 선호입니다',
        en: 'Which edge of the trigger it appears on. Flips to the opposite edge when there is no room, and never slides along the edge it is on: a preference, not an instruction'
      }
    }),
    from('MPPopover', 'align', { type: 'MPAlign', default: 'MPAlign.center' }),
    from('MPPopover', 'sideOffset', {
      type: 'double',
      default: '8',
      description: {
        ko: '트리거와의 거리, 논리 픽셀',
        en: 'Distance from the trigger, in logical pixels'
      }
    }),
    from('MPPopover', 'alignOffset', {
      type: 'double',
      default: '0',
      description: {
        ko: '그 변을 따라 밀어내는 양, 논리 픽셀. `start`와 `center`는 줄의 끝 쪽으로, `end`는 시작 쪽으로 밀립니다',
        en: 'Shift along that edge, in logical pixels: towards the end of the line for `start` and `center`, back towards its start for `end`'
      }
    }),
    from('MPPopover', 'arrow', { type: 'bool', default: 'false' }),
    from('MPPopover', 'open', {
      type: 'bool?',
      description: {
        ko: '열림 여부. 값을 주면 controlled이고, `null`(기본값)이면 팝오버가 `initialOpen`에서 시작해 상태를 스스로 갖습니다',
        en: 'Whether the popover is open. Given, it is controlled; `null`, the default, leaves it to keep its own state from `initialOpen`'
      }
    }),
    renamed('MPPopover', 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from('MPPopover', 'onOpenChange', {
      type: 'ValueChanged<bool>?',
      description: {
        ko: '열림 상태가 바뀌어야 할 때 그 값으로 불립니다. 트리거는 `true`, ×·`MPPopoverClose`·바깥 누름·Escape·시스템 뒤로 가기·Tab으로 빠져나가기는 `false`입니다',
        en: 'Called with what the open state should become: `true` from the trigger, `false` from the ×, an `MPPopoverClose`, a press outside, Escape, the system back or Tab leaving the popup'
      }
    }),
    from('MPPopover', 'modal', {
      type: 'MPPopoverModal',
      default: 'MPPopoverModal.off',
      description: {
        ko: '뒤쪽 페이지를 얼마나 가져갈지. `off`는 페이지가 그대로 동작하고 마지막 컨트롤에서 Tab을 누르면 팝업을 떠나며 닫습니다. `trapFocus`는 Tab이 팝업 안을 돕니다. `on`은 여기에 더해 바깥 누름이 페이지에 닿지 않고 화면 낭독기도 페이지에 닿지 못합니다',
        en: 'How much of the page is taken away. `off` leaves the page working, and Tab past the last control leaves the popup and closes it. `trapFocus` keeps Tab going round the popup. `on` does that too, and a press outside reaches nothing on the page, nor does a screen reader'
      }
    }),
    from('MPPopover', 'dismissible', {
      type: 'bool',
      default: 'true',
      description: {
        ko: '바깥 누름, Escape, 시스템 뒤로 가기, Tab으로 빠져나가기로 닫히는지. 스스로 나갈 길이 있는 팝업에서만 끄세요. ×, `MPPopoverClose`, 트리거, controlled `open`으로는 계속 닫힙니다',
        en: 'Whether a press outside, Escape, the system back and Tab leaving the popup close it. Turn it off only for a popup with its own way out; the ×, an `MPPopoverClose`, the trigger and a controlled `open` still close it'
      }
    }),
    from('MPPopover', 'showClose', { type: 'bool', default: 'false' }),
    from('MPPopover', 'closeLabel', {
      type: 'String?',
      default: undefined,
      description: {
        ko: '× 버튼의 접근성 이름. 기본값은 `locale`의 "닫기"입니다',
        en: 'Accessible name of the × button. Defaults to the word for "close" in `locale`'
      }
    }),
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '× 버튼의 기본 이름을 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 로캘, 영어 순으로 따릅니다',
        en: "Which language the ×'s default name is in. Falls back to the nearest `MPLocaleProvider`, then the app's locale, then English"
      }
    },
    from('MPPopover', 'width', {
      type: 'double?',
      description: {
        ko: '`size`가 정하는 너비 상한을 덮어씁니다. 논리 픽셀입니다. 스케일 조정이 아니라 *내용*이 너비를 정하는 팝오버를 위한 것입니다',
        en: "A hard cap on the popup's width in logical pixels, overriding the one `size` implies. For the popover whose *content* decides its width, rather than for tuning the scale"
      }
    }),
    sizeRow('MPPopover'),
    renamed('MPPopover', 'children', 'child', { type: `${WIDGET}?` })
  ],
  MPPopoverClose: [
    {
      name: 'builder',
      type: 'MPPopoverCloseBuilder',
      required: true,
      description: {
        ko: '팝오버를 닫는 위젯(보통 `MPButton`)을 만드는 함수. 닫는 콜백을 받습니다. `dismissible`이 꺼져 있어도 닫습니다',
        en: 'Builds what closes the popover, usually an `MPButton`, handed the call that closes it. It closes the popover even while `dismissible` is off'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
