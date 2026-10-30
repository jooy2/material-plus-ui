import { colorRow, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPPopconfirm: [
    from('MPPopconfirm', 'trigger', {
      type: 'MPPopoverTriggerBuilder',
      description: {
        ko: '묻는 컨트롤이자 질문이 매달리는 곳을 만드는 함수. 열고 닫는 콜백을 받으며, 그 콜백을 컨트롤의 `onPressed`에 연결합니다',
        en: "Builds the control that asks, and that the question hangs off, handed the call that opens and closes it. Wire that call to the control's `onPressed`"
      }
    }),
    from('MPPopconfirm', 'title', { type: `${WIDGET}?` }),
    from('MPPopconfirm', 'description', { type: `${WIDGET}?` }),
    {
      name: 'child',
      type: `${WIDGET}?`,
      description: {
        ko: '팝업이 담을 나머지. 두 버튼 위에 놓입니다',
        en: 'Anything else the popup should hold, above the two buttons'
      }
    },
    from('MPPopconfirm', 'onConfirm', {
      type: 'VoidCallback?',
      description: {
        ko: '읽는 사람이 예라고 했을 때. `Future`가 아니라 콜백인 것이 `MPConfirmProvider`와의 차이 전부입니다. 이건 버튼이 있는 자리에 쓰이므로 이미 거기에 핸들러가 있습니다',
        en: 'Called when the reader says yes. A callback rather than a `Future`, which is the whole difference from `MPConfirmProvider`: this is written where the button is, so there is already a handler there'
      }
    }),
    from('MPPopconfirm', 'onCancel', {
      type: 'VoidCallback?',
      description: {
        ko: '아니오라고 했을 때. Escape, 바깥 누름, 시스템 뒤로 가기, Tab으로 빠져나가기도 여기로 셉니다. 여는 것은 답이 아니라 질문이므로 세지 않습니다',
        en: 'Called when they say no. Escape, a press outside, the system back and Tab leaving it all count; opening does not, because an open is the question rather than an answer'
      }
    }),
    from('MPPopconfirm', 'confirmLabel', { type: `${WIDGET}?` }),
    from('MPPopconfirm', 'cancelLabel', { type: `${WIDGET}?` }),
    colorRow('MPPopconfirm'),
    from('MPPopconfirm', 'side', { type: 'MPSide', default: 'MPSide.top' }),
    from('MPPopconfirm', 'align', { type: 'MPAlign', default: 'MPAlign.center' }),
    from('MPPopconfirm', 'arrow', { type: 'bool', default: 'true' }),
    sizeRow('MPPopconfirm'),
    from('MPPopconfirm', 'open', {
      type: 'bool?',
      description: {
        ko: '열림 여부. 값을 주면 controlled이고, `null`(기본값)이면 `initialOpen`에서 시작해 상태를 스스로 갖습니다',
        en: 'Whether it is open. Given, it is controlled; `null`, the default, leaves it to keep its own state from `initialOpen`'
      }
    }),
    renamed('MPPopconfirm', 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from('MPPopconfirm', 'onOpenChange', { type: 'ValueChanged<bool>?' })
  ]
} satisfies Record<string, PropRow[]>;
