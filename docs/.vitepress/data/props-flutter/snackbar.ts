import { from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

const POSITION = 'MPSnackbarPosition';

export default {
  MPSnackbarProvider: [
    renamed('MPSnackbarProvider', 'children', 'child', {
      type: WIDGET,
      required: true,
      description: {
        ko: '앱. 한 번만 감싸면 되고, `WidgetsApp`의 `builder` 안이 알맞은 자리입니다',
        en: "The app. Wrap it once; a `WidgetsApp`'s `builder` is the place"
      }
    }),
    from('MPSnackbarProvider', 'color', { type: 'MPColor?' }),
    from('MPSnackbarProvider', 'position', {
      type: POSITION,
      default: `${POSITION}.bottomStart`
    }),
    from('MPSnackbarProvider', 'timeout', {
      type: 'Duration',
      default: 'Duration(seconds: 5)',
      description: {
        ko: '기본 유지 시간. `Duration.zero`면 닫힐 때까지 남습니다 — 사용자가 행동해야 하는 메시지에는 그쪽이 맞습니다',
        en: 'How long a snackbar lasts by default. `Duration.zero` keeps it up until it is closed, which is the right answer for anything the reader has to act on'
      }
    }),
    from('MPSnackbarProvider', 'limit', {
      type: 'int',
      description: {
        ko: '한 번에 보이는 개수. 화면에 남는 것은 가장 새로운 것들이고, 나머지는 버려지지 않고 스택이 비는 대로 돌아옵니다',
        en: 'How many are shown at once. The newest are the ones on screen; the rest are kept and come back as the stack drains'
      }
    }),
    from('MPSnackbarProvider', 'width', {
      type: 'double',
      description: {
        ko: '스낵바의 너비(논리 픽셀). 이 값과 화면 너비 중 좁은 쪽이 되고, 600은 MD3의 최대치입니다',
        en: "How wide a snackbar is, in logical pixels: this or the screen, whichever is narrower. 600 is MD3's own maximum"
      }
    }),
    sizeRow('MPSnackbarProvider'),
    from('MPSnackbarProvider', 'showClose', { type: 'bool' }),
    from('MPSnackbarProvider', 'closeLabel', {
      type: 'String?',
      default: undefined,
      description: {
        ko: '모든 × 버튼을 화면 낭독기가 부르는 이름. 기본값은 `locale`의 "닫기"입니다',
        en: 'The name a screen reader gives every ×. Defaults to the word for "close" in `locale`'
      }
    }),
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '× 버튼의 기본 이름을 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: "Which language the ×'s default name is in. Falls back to the nearest `MPLocaleProvider`, then the app's `Localizations`, then English"
      }
    }
  ],

  MPSnackbarOptions: [
    from('MPSnackbarOptions', 'message', { type: `${WIDGET}?` }),
    from('MPSnackbarOptions', 'id', { type: 'String?' }),
    from('MPSnackbarOptions', 'actionLabel', { type: `${WIDGET}?` }),
    from('MPSnackbarOptions', 'onAction', {
      type: 'VoidCallback?',
      description: {
        ko: '액션을 눌렀을 때. 스낵바는 그대로 남습니다. React 빌드와 같고, 닫고 싶다면 액션이 직접 닫습니다',
        en: 'Called when the action is pressed. The snackbar stays up, as in the React build; an action that wants it gone closes it'
      }
    }),
    from('MPSnackbarOptions', 'timeout', {
      type: 'Duration?',
      description: {
        ko: '이 스낵바만의 유지 시간. `Duration.zero`면 닫힐 때까지 남고, 생략하면 provider의 값을 씁니다',
        en: "How long this one lasts. `Duration.zero` keeps it up until it is closed; left out, the provider's"
      }
    }),
    from('MPSnackbarOptions', 'priority', {
      type: 'MPSnackbarPriority?',
      default: 'MPSnackbarPriority.low',
      description: {
        ko: '얼마나 급하게 읽혀야 하는지. Flutter의 live region에는 공손한 단계 하나뿐이라, 두 값 모두 읽는 사람이 쉬는 지점에서 읽힙니다',
        en: "How urgently it asks to be read out. Flutter's live region has one politeness, so both are read when the reader pauses"
      }
    }),
    from('MPSnackbarOptions', 'color', { type: 'MPColor?' }),
    from('MPSnackbarOptions', 'icon', {
      type: `${WIDGET}?`,
      description: {
        ko: '메시지 앞의 글리프. 판의 잉크 색으로 그려집니다',
        en: "A glyph before the message, drawn in the plate's ink"
      }
    }),
    from('MPSnackbarOptions', 'position', { type: `${POSITION}?` }),
    from('MPSnackbarOptions', 'onClose', { type: 'VoidCallback?' }),
    from('MPSnackbarOptions', 'onRemove', {
      type: 'VoidCallback?',
      description: {
        ko: '사라지는 움직임이 끝나고 트리에서 빠졌을 때',
        en: 'Called once it has finished going out and has left the tree'
      }
    })
  ]
} satisfies Record<string, PropRow[]>;
