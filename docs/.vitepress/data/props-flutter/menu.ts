import { colorRow, COLOR, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

/** What a row draws and is found by, which a Flutter row takes as a string. */
function labelRow(component: string): PropRow {
  return renamed(component, 'children', 'label', {
    type: 'String',
    required: true,
    description: {
      ko: '행에 그려지는 글자이자 화면 낭독기가 읽는 이름이고, typeahead가 맞춰 보는 글자입니다. 셋을 모두 할 수 있는 것은 문자열뿐입니다',
      en: 'What the row says, what a screen reader announces and what typeahead matches. Only a string can be all three'
    }
  });
}

/** `closeOnClick`, under the name Flutter gives a press. */
function closeRow(component: string, fallback: string): PropRow {
  return renamed(component, 'closeOnClick', 'closeOnPress', { type: 'bool', default: fallback });
}

/** The parts every kind of row shares after its label. */
function trailingRows(component: string): PropRow[] {
  return [
    from(component, 'endIcon', { type: `${WIDGET}?` }),
    from(component, 'shortcut', { type: 'String?' }),
    from(component, 'description', { type: 'String?' }),
    from(component, 'color', { type: `${COLOR}?` })
  ];
}

const disabledRow = (component: string): PropRow =>
  from(component, 'disabled', { type: 'bool', default: 'false' });

export default {
  MPMenu: [
    {
      name: 'items',
      type: 'List<MPMenuEntry>',
      required: true,
      description: {
        ko: '행. `MPMenuItem`, `MPMenuCheckboxItem`, `MPMenuRadioGroup`, `MPMenuGroup`, `MPMenuSeparator`, `MPMenuSubmenu`로 적습니다. 메뉴가 행을 세고 하이라이트를 옮기고 typeahead를 맞추려면 목록을 넘겨받아야 하므로 위젯이 아니라 설명입니다',
        en: 'The rows, written as `MPMenuItem`, `MPMenuCheckboxItem`, `MPMenuRadioGroup`, `MPMenuGroup`, `MPMenuSeparator` and `MPMenuSubmenu`. Descriptions rather than widgets, because the menu has to be handed the list to count its rows, walk a highlight through them and match typeahead'
      }
    },
    from('MPMenu', 'trigger', {
      type: 'MPMenuTriggerBuilder?',
      description: {
        ko: '메뉴를 여는 것을 만드는 빌더. 메뉴를 여는 콜백과 열려 있는지를 함께 받습니다. 다른 곳에서 여는 controlled 메뉴라면 없어도 되고, 그때 팝업은 메뉴를 적은 자리에 매달립니다',
        en: 'Builds what opens the menu, handed the callback that opens it and whether it is open. Optional: a controlled menu opened from elsewhere needs none, and hangs off the place it was written'
      }
    }),
    sizeRow('MPMenu'),
    colorRow('MPMenu'),
    from('MPMenu', 'open', { type: 'bool?' }),
    renamed('MPMenu', 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from('MPMenu', 'onOpenChange', { type: 'ValueChanged<bool>?' }),
    from('MPMenu', 'side', { type: 'MPSide', default: 'MPSide.bottom' }),
    from('MPMenu', 'align', { type: 'MPAlign', default: 'MPAlign.start' }),
    from('MPMenu', 'sideOffset', { type: 'double', default: '4' }),
    from('MPMenu', 'openOnHover', { type: 'bool', default: 'false' }),
    from('MPMenu', 'loopFocus', { type: 'bool', default: 'true' }),
    disabledRow('MPMenu'),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '화면 낭독기가 팝업을 부르는 이름',
        en: 'The name a screen reader gives the popup'
      }
    }
  ],
  MPMenuItem: [
    labelRow('MPMenuItem'),
    renamed('MPMenuItem', 'onClick', 'onPressed', {
      type: 'VoidCallback?',
      description: {
        ko: '행이 하는 일. 포인터로 누르든 키보드로 고르든 화면 낭독기로 실행하든 같습니다. 비워 두면 행은 동작이 아니라 라벨입니다. `href`가 없으므로 앱의 라우터를 여기서 부릅니다',
        en: "What the row does, by pointer, by keyboard or from a screen reader. Left out, the row is a label. There is no `href`, so this is where the app's router is called"
      }
    }),
    from('MPMenuItem', 'startIcon', { type: `${WIDGET}?` }),
    ...trailingRows('MPMenuItem'),
    closeRow('MPMenuItem', 'true'),
    from('MPMenuItem', 'disabled', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '쓸 수 없는 행. 목록에 남고 방향키와 typeahead도 여전히 이 행에 닿지만, 골라도 아무 일도 일어나지 않습니다',
        en: 'Unavailable. Still listed, and still reached by the arrow keys and typeahead, but picking it does nothing'
      }
    })
  ],
  MPMenuCheckboxItem: [
    labelRow('MPMenuCheckboxItem'),
    from('MPMenuCheckboxItem', 'checked', {
      type: 'bool?',
      description: {
        ko: '체크 여부. 주면 controlled이고, 비워 두면 메뉴가 체크를 직접 기억합니다',
        en: 'Whether the row is ticked. Given, the row is controlled; left `null`, the menu keeps the tick itself'
      }
    }),
    renamed('MPMenuCheckboxItem', 'defaultChecked', 'initialChecked', {
      type: 'bool',
      default: 'false'
    }),
    renamed('MPMenuCheckboxItem', 'onCheckedChange', 'onChanged', { type: 'ValueChanged<bool>?' }),
    ...trailingRows('MPMenuCheckboxItem'),
    closeRow('MPMenuCheckboxItem', 'false'),
    disabledRow('MPMenuCheckboxItem')
  ],
  MPMenuRadioGroup: [
    {
      name: 'items',
      type: 'List<MPMenuRadioItem<T>>',
      required: true,
      description: {
        ko: '선택지 행들',
        en: 'The rows that make up the set'
      }
    },
    {
      name: 'value',
      type: 'T?',
      description: {
        ko: '고른 행의 `value`. 주면 controlled이고, 비워 두면 메뉴가 선택을 직접 기억합니다. 그래서 아무것도 고르지 않은 controlled 묶음은 표현할 수 없습니다',
        en: "The chosen row's `value`. Given, the set is controlled; left `null`, the menu keeps the choice itself, so a controlled set with nothing chosen is not expressible"
      }
    },
    {
      name: 'initialValue',
      type: 'T?',
      description: {
        ko: 'uncontrolled 묶음이 처음 고른 값',
        en: 'The choice an uncontrolled set starts with'
      }
    },
    {
      name: 'onChanged',
      type: 'ValueChanged<T>?',
      description: {
        ko: '다른 행을 고르면 그 행의 `value`로 불립니다',
        en: 'Called with the value of the row that was chosen, when it changes'
      }
    },
    {
      name: 'disabled',
      type: 'bool',
      default: 'false',
      description: {
        ko: '묶음 안의 모든 행을 쓸 수 없게 합니다',
        en: 'Makes every row in the set unavailable'
      }
    }
  ],
  MPMenuRadioItem: [
    from('MPMenuRadioItem', 'value', { type: 'T' }),
    labelRow('MPMenuRadioItem'),
    ...trailingRows('MPMenuRadioItem'),
    closeRow('MPMenuRadioItem', 'false'),
    disabledRow('MPMenuRadioItem')
  ],
  MPMenuGroup: [
    {
      name: 'items',
      type: 'List<MPMenuEntry>',
      required: true,
      description: {
        ko: '묶음 안의 행',
        en: 'The rows in the group'
      }
    },
    {
      name: 'label',
      type: 'String?',
      description: {
        ko: '행 위의 제목. 고를 수 없고, 방향키도 typeahead도 여기에 머물지 않습니다',
        en: 'The heading over the rows. It cannot be picked, and neither the arrow keys nor typeahead land on it'
      }
    }
  ],
  MPMenuSubmenu: [
    from('MPMenuSubmenu', 'label', { type: 'String', required: true }),
    renamed('MPMenuSubmenu', 'children', 'items', {
      type: 'List<MPMenuEntry>',
      required: true,
      description: {
        ko: '안쪽 행. 이 안에 다시 `MPMenuSubmenu`를 넣을 수 있습니다',
        en: 'The nested rows, which can hold another `MPMenuSubmenu`'
      }
    }),
    from('MPMenuSubmenu', 'startIcon', { type: `${WIDGET}?` }),
    disabledRow('MPMenuSubmenu'),
    from('MPMenuSubmenu', 'side', {
      type: 'MPSide?',
      description: {
        ko: '부모 행의 어느 쪽으로 열지. 비워 두면 줄이 끝나는 쪽, 즉 오른쪽이고 RTL에서는 왼쪽입니다. 여는 방향키도 그쪽을 가리킵니다',
        en: 'Which edge of the parent row it opens against. Left `null`, the end of the line: the right, and the left under RTL, where the arrow key that opens it points too'
      }
    }),
    from('MPMenuSubmenu', 'sideOffset', { type: 'double', default: '0' })
  ]
} satisfies Record<string, PropRow[]>;
