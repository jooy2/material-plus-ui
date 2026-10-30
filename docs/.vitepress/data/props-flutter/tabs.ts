import { colorRow, focusRows, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPTabs: [
    {
      name: 'children',
      type: 'List<Widget>',
      required: true,
      description: {
        ko: '`MPTab`들과 `MPTabPanel`들. 순서와 상관없이 바와 본문으로 알아서 나뉘고, 바의 탭 순서는 `MPTab`이 놓인 순서입니다',
        en: 'The `MPTab`s and the `MPTabPanel`s, in any order, sorted into the bar and the body for you. The bar runs in the order the `MPTab`s are written'
      }
    },
    from('MPTabs', 'variant', { type: 'MPTabsVariant', default: 'MPTabsVariant.primary' }),
    colorRow('MPTabs'),
    from('MPTabs', 'value', {
      type: 'T?',
      description: {
        ko: '선택된 탭. controlled로 쓰려면 `onChanged`와 함께 쓰세요. `null`이면 바가 스스로 선택을 관리합니다',
        en: 'The chosen tab. Use with `onChanged` for a controlled set. `null` leaves the set to keep its own choice'
      }
    }),
    renamed('MPTabs', 'defaultValue', 'initialValue', {
      type: 'T?',
      description: {
        ko: '처음 선택되는 탭. uncontrolled일 때 씁니다. 비워 두면 비활성화되지 않은 첫 탭입니다',
        en: 'Which starts chosen, for an uncontrolled set. Left out, the first tab that is not disabled'
      }
    }),
    renamed('MPTabs', 'onValueChange', 'onChanged', { type: 'ValueChanged<T>?' }),
    from('MPTabs', 'iconPosition', { type: 'MPTabIconPosition?' }),
    from('MPTabs', 'activateOnFocus', { type: 'bool', default: 'false' }),
    from('MPTabs', 'loopFocus', { type: 'bool', default: 'true' }),
    from('MPTabs', 'divider', { type: 'bool', default: 'true' }),
    sizeRow('MPTabs'),
    from('MPTabs', 'fullWidth', { type: 'bool', default: 'false' }),
    renamed('MPTabs', 'aria-label', 'semanticLabel', { type: 'String?' }),
    {
      name: 'focusNode',
      type: 'FocusNode?',
      description: {
        ko: '바의 유일한 포커스 지점을 밖에서 다룰 때 넘기는 노드. 방향키를 따라 탭에서 탭으로 옮겨 갑니다',
        en: "Drives the bar's one focus stop from outside. It moves from tab to tab with the arrow keys"
      }
    },
    focusRows[1]
  ],
  MPTab: [
    from('MPTab', 'value', { type: 'T' }),
    renamed('MPTab', 'children', 'child', { type: `${WIDGET}?` }),
    from('MPTab', 'icon', { type: `${WIDGET}?` }),
    from('MPTab', 'disabled', { type: 'bool', default: 'false' }),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '보이는 내용 대신 화면 낭독기가 읽는 탭의 이름. 글리프만 있는 탭에 필요합니다',
        en: "The tab's name for a screen reader, in place of what it shows. The one an icon-only tab needs"
      }
    }
  ],
  MPTabPanel: [
    from('MPTabPanel', 'value', { type: 'T' }),
    renamed('MPTabPanel', 'children', 'child', { type: WIDGET, required: true }),
    from('MPTabPanel', 'keepMounted', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '숨겨진 동안에도 패널을 트리에 남깁니다. 숨은 패널은 그려지지 않고, 포커스도 받지 않고, 시맨틱 트리에도 없으며, 애니메이션은 멈춥니다',
        en: 'Keeps the panel built while it is hidden. A hidden panel is not painted, takes no focus, is not on the semantics tree, and its animations are paused'
      }
    })
  ]
} satisfies Record<string, PropRow[]>;
