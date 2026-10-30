import { from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPDialog: [
    from('MPDialog', 'open', {
      type: 'bool?',
      description: {
        ko: '열림 여부. 값을 주면 controlled이고, `null`(기본값)이면 대화상자가 `initialOpen`에서 시작해 상태를 스스로 갖습니다',
        en: 'Whether the dialog is open. Given, the dialog is controlled; `null`, the default, leaves it to keep its own state from `initialOpen`'
      }
    }),
    renamed('MPDialog', 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from('MPDialog', 'onOpenChange', {
      type: 'ValueChanged<bool>?',
      description: {
        ko: '열림 상태가 바뀌어야 할 때 그 값으로 불립니다. 트리거는 `true`, ×·`MPDialogClose`·Escape·시스템 뒤로 가기·스크림 누름은 `false`입니다',
        en: 'Called with what the open state should become: `true` from the trigger, `false` from the ×, an `MPDialogClose`, Escape, the system back or a press on the scrim'
      }
    }),
    from('MPDialog', 'trigger', {
      type: 'MPDialogTriggerBuilder?',
      description: {
        ko: '대화상자를 여는 위젯을 만드는 함수. 여는 콜백을 받습니다. 선택 사항이며, 다른 곳에서 여는 controlled 대화상자에는 필요 없습니다',
        en: 'Builds the widget that opens the dialog, handed the call that opens it. Optional: a controlled dialog opened from elsewhere needs none'
      }
    }),
    from('MPDialog', 'icon', { type: `${WIDGET}?` }),
    from('MPDialog', 'title', {
      type: `${WIDGET}?`,
      description: {
        ko: '헤드라인. 화면 낭독기에 제목으로 알려지고, 평범한 `Text`이면 그 글자가 대화상자의 이름이 됩니다',
        en: 'The headline, announced as a heading. When it is a plain `Text`, its words name the dialog'
      }
    }),
    from('MPDialog', 'description', {
      type: `${WIDGET}?`,
      description: {
        ko: '헤드라인 아래 보조 텍스트. 한 단계 옅은 잉크로 씁니다',
        en: 'The supporting text under it, in the quieter ink'
      }
    }),
    from('MPDialog', 'actions', {
      type: 'List<Widget>?',
      description: {
        ko: '아래 줄. 끝 정렬로 줄바꿈되므로 버튼 두 개에 `Row`가 필요 없고, `MPDialogClose`가 그중 하나를 닫기 버튼으로 만듭니다',
        en: 'The bottom row, end-aligned and wrapping, so a pair of buttons needs no `Row` of its own. An `MPDialogClose` is what makes one of them close the dialog'
      }
    }),
    renamed('MPDialog', 'children', 'child', { type: `${WIDGET}?` }),
    from('MPDialog', 'dividers', { type: 'bool', default: 'false' }),
    from('MPDialog', 'showClose', { type: 'bool?' }),
    from('MPDialog', 'closeLabel', {
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
        ko: '× 버튼의 기본 이름을 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: "Which language the × button's default name is in. Falls back to the nearest `MPLocaleProvider`, then the app's `Localizations`, then English"
      }
    },
    from('MPDialog', 'width', {
      type: 'double?',
      description: {
        ko: '`size`가 정하는 최대 너비를 덮어쓰는 상한, 논리 픽셀. 내용이 너비를 정하는 대화상자를 위한 것이지, 스케일을 손보는 용도가 아닙니다. 그쪽은 `size`입니다',
        en: "A hard cap on the sheet's width in logical pixels, overriding the one `size` implies. For the dialog whose *content* decides its width, rather than for tuning the scale, which is `size`"
      }
    }),
    from('MPDialog', 'fullWidth', { type: 'bool', default: 'true' }),
    from('MPDialog', 'fullScreen', { type: 'bool', default: 'false' }),
    from('MPDialog', 'modal', {
      type: 'bool',
      default: 'true',
      description: {
        ko: '뒤 페이지를 포인터에서도 가져갈지. `false`는 페이지를 스크롤·클릭 가능하게 두면서 포커스만 시트 안에 잡아 두며, React의 `trap-focus`에 해당합니다',
        en: "Whether the page behind is taken away from the pointer as well as the keyboard. `false` keeps the page scrollable and clickable while still holding focus inside, which is React's `'trap-focus'`"
      }
    }),
    from('MPDialog', 'dismissible', {
      type: 'bool',
      default: 'true',
      description: {
        ko: 'Escape, 시스템 뒤로 가기, 스크림 누름으로 닫을지. 반드시 답해야 하는 대화상자에서는 끄되 답할 액션을 주세요. ×와 `MPDialogClose`는 여전히 닫습니다',
        en: 'Whether Escape, the system back or a press on the scrim closes the dialog. Turn it off for the dialog that has to be answered, and give it actions that answer it. The × and an `MPDialogClose` still close it'
      }
    }),
    sizeRow('MPDialog'),
    from('MPDialog', 'color', { type: 'MPColor', default: 'MPColor.secondary' }),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '대화상자가 열릴 때 화면 낭독기가 읽는 이름. 기본값은 `title`이 평범한 `Text`일 때 그 글자이므로, 다른 위젯으로 만든 제목에는 이것이 필요합니다',
        en: 'The name a screen reader gives the dialog as it opens. Defaults to the words of `title` when that is a plain `Text`, so a title built from anything else needs this'
      }
    }
  ],
  MPDialogClose: [
    {
      name: 'builder',
      type: 'MPDialogCloseBuilder',
      required: true,
      description: {
        ko: '닫는 위젯(보통 `MPButton`)을 만드는 함수. 둘러싼 대화상자를 닫는 콜백을 받습니다. React의 `render`에 해당합니다',
        en: "Builds what closes the dialog, usually an `MPButton`, handed the call that closes the dialog round it. React's `render`"
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
