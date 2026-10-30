import { from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPDrawer: [
    from('MPDrawer', 'side', { type: 'MPSide', default: 'MPSide.left' }),
    from('MPDrawer', 'mode', { type: 'MPDrawerMode', default: 'MPDrawerMode.modal' }),
    from('MPDrawer', 'open', {
      type: 'bool?',
      description: {
        ko: '드로어가 보이는지. 값을 주면 controlled이고, `null`(기본값)이면 드로어가 `initialOpen`에서 시작해 상태를 스스로 갖습니다',
        en: 'Whether the drawer is shown. Given, the drawer is controlled; `null`, the default, leaves it to keep its own state from `initialOpen`'
      }
    }),
    renamed('MPDrawer', 'defaultOpen', 'initialOpen', {
      type: 'bool?',
      description: {
        ko: '처음에 열려 있을지. `null`이면 `modal`에서는 `false`, `standard`에서는 `true`입니다. 열어야만 나타나는 고정 사이드바는 고정 사이드바가 아닙니다',
        en: 'Whether it starts open. `null` is `false` in `modal` mode and `true` in `standard`, because a fixed sidebar that had to be opened before it appeared would not be a fixed sidebar'
      }
    }),
    from('MPDrawer', 'onOpenChange', {
      type: 'ValueChanged<bool>?',
      description: {
        ko: '열림 상태가 바뀌어야 할 때 그 값으로 불립니다. 트리거는 `true`, ×·`MPDrawerClose`·Escape·시스템 뒤로 가기·스크림 누름은 `false`입니다',
        en: 'Called with what the open state should become: `true` from the trigger, `false` from the ×, an `MPDrawerClose`, Escape, the system back or a press on the scrim'
      }
    }),
    from('MPDrawer', 'trigger', {
      type: 'MPDrawerTriggerBuilder?',
      description: {
        ko: '드로어를 여는 위젯을 만드는 함수. 여는 콜백을 받습니다. `modal` 전용입니다. `standard` 드로어는 여는 것이 아니라 레이아웃에 있는 것이라서 만들지 않습니다',
        en: 'Builds the widget that opens the drawer, handed the call that opens it. `modal` only: a `standard` drawer is not opened, it is in the layout, so the trigger is not built'
      }
    }),
    from('MPDrawer', 'title', {
      type: `${WIDGET}?`,
      description: {
        ko: '제목. 화면 낭독기에 제목(수준 2)으로 알려지고, 평범한 `Text`이면 그 글자가 모달 드로어의 이름이 됩니다',
        en: 'The heading, announced as a level-2 heading. When it is a plain `Text`, its words name the modal drawer'
      }
    }),
    from('MPDrawer', 'description', {
      type: `${WIDGET}?`,
      description: {
        ko: '제목 아래 한 줄. 한 단계 옅은 잉크로 씁니다',
        en: 'A line under the title, in the quieter ink'
      }
    }),
    from('MPDrawer', 'actions', {
      type: 'List<Widget>?',
      description: {
        ko: '패널 바닥에 고정되는 행. 끝 정렬로 줄바꿈되므로 버튼 두 개에 `Row`가 필요 없고, `MPDrawerClose`가 그중 하나를 닫기 버튼으로 만듭니다',
        en: 'The bottom row, held against the foot of the panel. End-aligned and wrapping, so a pair of buttons needs no `Row` of its own, and an `MPDrawerClose` is what makes one of them dismiss'
      }
    }),
    from('MPDrawer', 'dividers', { type: 'bool', default: 'false' }),
    from('MPDrawer', 'showClose', { type: 'bool?' }),
    from('MPDrawer', 'closeLabel', {
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
    from('MPDrawer', 'extent', {
      type: 'double?',
      description: {
        ko: '가장자리에서 얼마나 들어오는지, 논리 픽셀. `left`/`right`에는 **너비**, `top`/`bottom`에는 **높이**입니다. 생략하면 옆면 패널은 `size`가 함의하는 너비를, 위·아래 패널은 내용만큼의 높이(받은 공간의 최대 85%)를 씁니다',
        en: 'How far the panel reaches in from its edge, in logical pixels: a **width** for `left` and `right`, a **height** for `top` and `bottom`. Left out, a side panel takes the width its `size` implies and a top or bottom panel is as tall as its content, up to 85% of the room it has'
      }
    }),
    from('MPDrawer', 'rounded', { type: 'bool', default: 'true' }),
    from('MPDrawer', 'dismissible', {
      type: 'bool',
      default: 'true',
      description: {
        ko: 'Escape, 시스템 뒤로 가기, 스크림 누름으로 닫히는지. 반드시 대답을 받아야 하는 드로어에서만 끄고, 그때는 대답할 수 있는 액션을 함께 주세요. ×와 `MPDrawerClose`는 여전히 닫습니다. `modal` 전용입니다',
        en: 'Whether Escape, the system back or a press on the scrim closes the drawer. Turn it off only for the drawer that has to be answered, and then give it actions that answer it. The × and an `MPDrawerClose` still close it. `modal` only'
      }
    }),
    sizeRow('MPDrawer'),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '모달 드로어가 열릴 때 화면 낭독기가 읽는 이름. 기본값은 `title`이 평범한 `Text`일 때 그 글자이므로, 다른 위젯으로 만든 제목에는 이것이 필요합니다',
        en: 'The name a screen reader gives the modal drawer as it opens. Defaults to the words of `title` when that is a plain `Text`, so a title built from anything else needs this'
      }
    },
    renamed('MPDrawer', 'children', 'child', { type: `${WIDGET}?` })
  ],
  MPDrawerClose: [
    {
      name: 'builder',
      type: 'MPDrawerCloseBuilder',
      required: true,
      description: {
        ko: '닫는 위젯(보통 `MPButton`)을 만드는 함수. 둘러싼 드로어를 닫는 콜백을 받습니다. React의 `render`에 해당하며, 두 모드 모두에서 동작합니다',
        en: "Builds what closes the drawer, usually an `MPButton`, handed the call that closes the drawer round it. React's `render`, and it works in either mode"
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
