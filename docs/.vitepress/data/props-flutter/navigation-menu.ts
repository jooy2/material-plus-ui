import { colorRow, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

/** `href`, under the job it does in Flutter: calling the app's router. */
const goRow = (component: string, name: string): PropRow =>
  renamed(component, name, 'onPressed', {
    type: 'VoidCallback?',
    description: {
      ko: '이 목적지로 갑니다. `href`가 하던 일이고, 이 패키지에는 라우터가 없으므로 앱의 라우터를 여기서 부릅니다',
      en: "Goes to this destination, the job `href` does in React. There is no router in this package, so this is where the app's own is called"
    }
  });

export default {
  MPNavigationMenu: [
    renamed('MPNavigationMenu', 'children', 'items', {
      type: 'List<MPNavigationMenuItem>',
      required: true,
      description: {
        ko: '행에 놓이는 아이템들',
        en: 'The items in the row'
      }
    }),
    from('MPNavigationMenu', 'orientation', {
      type: 'MPOrientation',
      default: 'MPOrientation.horizontal'
    }),
    renamed('MPNavigationMenu', 'defaultValue', 'initialValue', {
      type: 'String?',
      description: {
        ko: '처음 열려 있을 패널의 아이템 `value`. `null`이면 닫혀 있습니다. controlled `value`는 없습니다. `String?`으로는 "제어하지 않음"과 "제어하면서 닫힘"을 구분할 수 없기 때문입니다',
        en: 'Which item’s panel starts open, by its `value`. `null` is closed. There is no controlled `value`, because `String?` cannot tell "not controlled" from "controlled and closed"'
      }
    }),
    renamed('MPNavigationMenu', 'onValueChange', 'onChanged', { type: 'ValueChanged<String?>?' }),
    from('MPNavigationMenu', 'delay', {
      type: 'Duration',
      default: 'Duration(milliseconds: 50)'
    }),
    from('MPNavigationMenu', 'closeDelay', {
      type: 'Duration',
      default: 'Duration(milliseconds: 50)'
    }),
    from('MPNavigationMenu', 'sideOffset', { type: 'double', default: '8' }),
    sizeRow('MPNavigationMenu'),
    colorRow('MPNavigationMenu'),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '내비게이션 영역을 부르는 이름. 기본값은 없습니다. 한 화면에 이 영역이 둘 이상이면 꼭 주세요. Flutter는 이름 없는 내비게이션 영역이 둘 있으면 받아들이지 않습니다',
        en: 'The name the navigation region is announced by. No default. Give one whenever a screen has more than one, which Flutter refuses outright while they are unnamed'
      }
    }
  ],
  MPNavigationMenuItem: [
    from('MPNavigationMenuItem', 'label', { type: 'String', required: true }),
    goRow('MPNavigationMenuItem', 'href'),
    from('MPNavigationMenuItem', 'startIcon', { type: `${WIDGET}?` }),
    from('MPNavigationMenuItem', 'value', {
      type: 'String?',
      description: {
        ko: '`onChanged`와 `initialValue`에서 이 아이템을 가리키는 값. 비워 두면 `label`이 그 역할을 합니다',
        en: 'Identifies the item in `onChanged` and `initialValue`. Left out, the `label` does'
      }
    }),
    from('MPNavigationMenuItem', 'disabled', { type: 'bool', default: 'false' }),
    from('MPNavigationMenuItem', 'columns', { type: 'int', default: '1' }),
    renamed('MPNavigationMenuItem', 'children', 'links', {
      type: 'List<MPNavigationMenuLink>',
      default: 'const []',
      description: {
        ko: '패널 안의 행. 있으면 아이템은 패널을 여는 트리거이고, 없으면 `onPressed`로 가는 목적지입니다',
        en: 'The panel’s rows. With them the item is a trigger that opens a panel; without them it is a destination that `onPressed` goes to'
      }
    })
  ],
  MPNavigationMenuLink: [
    from('MPNavigationMenuLink', 'title', { type: 'String', required: true }),
    goRow('MPNavigationMenuLink', 'href'),
    from('MPNavigationMenuLink', 'description', { type: 'String?' }),
    from('MPNavigationMenuLink', 'startIcon', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
