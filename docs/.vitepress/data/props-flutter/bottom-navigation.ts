import { focusRows, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

const VALUE = 'MPBottomNavigationValue';
const LABELS = 'MPBottomNavigationLabels';

/**
 * The value rows both bars take, which differ from React's in the same way
 * on each: `Object` where React says `string | number`, `initialValue` for
 * `defaultValue`, and `onChanged` for `onValueChange`.
 */
export function valueRows(component: string): PropRow[] {
  return [
    from(component, 'value', {
      type: `${VALUE}?`,
      description: {
        ko: '지금 있는 목적지. 주면 controlled입니다. `null`은 "controlled인데 아무 데도 아님"을 뜻할 수 없으므로, 그 경우 바는 첫 누름까지 자기 자리를 들고 있다가 `onChanged`로 알립니다',
        en: 'The destination the reader is on. Given, the bar is controlled. `null` cannot also mean "controlled, on none of them", so such a bar holds its own place until the first press and reports it through `onChanged`'
      }
    }),
    renamed(component, 'defaultValue', 'initialValue', { type: `${VALUE}?` }),
    renamed(component, 'onValueChange', 'onChanged', {
      type: `ValueChanged<${VALUE}>?`
    })
  ];
}

export function labelRow(component: string, fallback: string): PropRow {
  return from(component, 'labels', { type: LABELS, default: `${LABELS}.${fallback}` });
}

export function childrenRow(component: string): PropRow {
  return from(component, 'children', { type: `List<${WIDGET}>`, required: true });
}

export default {
  MPBottomNavigation: [
    childrenRow('MPBottomNavigation'),
    ...valueRows('MPBottomNavigation'),
    labelRow('MPBottomNavigation', 'all'),
    sizeRow('MPBottomNavigation'),
    from('MPBottomNavigation', 'divider', { type: 'bool', default: 'false' }),
    from('MPBottomNavigation', 'safeArea', {
      type: 'bool',
      default: 'true',
      description: {
        ko: '행 아래에 창의 아래쪽 여백(`MediaQuery.paddingOf`)을 더해 휴대폰의 홈 인디케이터를 피합니다. 표면은 화면 맨 아래까지 그대로 닿고 행만 올라갑니다',
        en: "Keeps the destinations clear of a phone's home indicator by adding the window's bottom inset (`MediaQuery.paddingOf`) under them. The surface still reaches the bottom of the screen; only the row moves up"
      }
    }),
    from('MPBottomNavigation', 'disabled', { type: 'bool', default: 'false' }),
    from('MPBottomNavigation', 'label', { type: 'String?' })
  ],

  MPBottomNavigationItem: [
    from('MPBottomNavigationItem', 'value', { type: VALUE }),
    renamed('MPBottomNavigationItem', 'children', 'label', {
      type: 'String',
      required: true,
      description: {
        ko: '목적지의 이름. 그려질 때는 이 글자가 그려지고, `labels`가 그리지 않을 때에도 언제나 화면 낭독기가 읽는 이름입니다. 그래서 위젯이 아니라 문자열입니다',
        en: "The destination's name. It is what is drawn when `labels` draws it, and always what a screen reader announces, which is why it is a string rather than a widget"
      }
    }),
    from('MPBottomNavigationItem', 'icon', { type: `${WIDGET}?` }),
    from('MPBottomNavigationItem', 'activeIcon', { type: `${WIDGET}?` }),
    from('MPBottomNavigationItem', 'disabled', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '사용할 수 없지만 묶음에는 남습니다. 포커스 순서에서 빠지고, 지금 있는 목적지여도 인디케이터를 그리지 않습니다',
        en: 'Unavailable, but still part of the set. It leaves the focus order, and draws no indicator even while it is current'
      }
    }),
    {
      name: 'onPressed',
      type: 'VoidCallback?',
      description: {
        ko: '바에 알린 다음 호출됩니다. 바를 옮기는 것 말고 할 일이 있는 목적지, 곧 라우터를 부르는 자리입니다. React에서 아이템에 주는 `onClick`입니다',
        en: "Called after the bar has been told, for a destination that does more than move the bar: the place a router is called. React's `onClick` on the item"
      }
    },
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
