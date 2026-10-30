import {
  densityRow,
  elevationRow,
  from,
  renamed,
  sizeRow,
  VARIANT,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPTreeView: [
    from('MPTreeView', 'children', {
      type: 'List<MPTreeItem>',
      required: true,
      description: {
        ko: '맨 위 단계의 행들. 어느 행이 보이는지와 화살표 키의 순서를 알려면 트리가 행을 훑어야 하므로 `MPTreeItem`을 받습니다',
        en: 'The top-level rows. `MPTreeItem`s, because the tree walks them to know which rows are showing and in what order the arrow keys reach them'
      }
    }),
    from('MPTreeView', 'lines', { type: 'MPTreeViewLines', default: 'MPTreeViewLines.simple' }),
    from('MPTreeView', 'expanded', { type: 'List<Object>?' }),
    renamed('MPTreeView', 'defaultExpanded', 'initialExpanded', { type: 'List<Object>?' }),
    from('MPTreeView', 'onExpandedChange', { type: 'ValueChanged<List<Object>>?' }),
    from('MPTreeView', 'selected', { type: 'List<Object>?' }),
    renamed('MPTreeView', 'defaultSelected', 'initialSelected', { type: 'List<Object>?' }),
    from('MPTreeView', 'onSelectedChange', { type: 'ValueChanged<List<Object>>?' }),
    from('MPTreeView', 'multiple', { type: 'bool', default: 'false' }),
    from('MPTreeView', 'disabled', { type: 'bool', default: 'false' }),
    from('MPTreeView', 'label', { type: 'String?' }),
    from('MPTreeView', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    elevationRow('MPTreeView'),
    sizeRow('MPTreeView'),
    densityRow('MPTreeView')
  ],
  MPTreeItem: [
    from('MPTreeItem', 'label', { type: `${WIDGET}?` }),
    from('MPTreeItem', 'children', {
      type: 'List<MPTreeItem>',
      default: 'const <MPTreeItem>[]',
      description: {
        ko: '이 가지의 행들',
        en: 'The rows in this branch'
      }
    }),
    from('MPTreeItem', 'value', {
      type: 'Object?',
      description: {
        ko: '`expanded`와 `selected`에서 이 행을 가리키는 값. 비워 두면 트리 안에서의 자리로 구별되며, 모양이 바뀌지 않는 트리에는 충분합니다',
        en: 'Identifies the row to `expanded` and `selected`. Left out, the row is known by where it sits, which is enough for a tree whose shape does not change'
      }
    }),
    from('MPTreeItem', 'startIcon', { type: `${WIDGET}?` }),
    from('MPTreeItem', 'endIcon', { type: `${WIDGET}?` }),
    from('MPTreeItem', 'action', { type: `${WIDGET}?` }),
    from('MPTreeItem', 'expandable', { type: 'bool?' }),
    from('MPTreeItem', 'disabled', { type: 'bool', default: 'false' }),
    renamed('MPTreeItem', 'onClick', 'onPressed', {
      type: 'VoidCallback?',
      description: {
        ko: '행을 누를 때마다, 열리고 골라지기 전에 호출됩니다. 이동하는 행은 여기서 라우터를 부릅니다',
        en: 'Called on every press of the row, before it opens and is chosen. A row that navigates calls the router from here'
      }
    })
  ]
} satisfies Record<string, PropRow[]>;
