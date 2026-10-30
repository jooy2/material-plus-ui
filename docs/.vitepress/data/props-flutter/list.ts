import {
  colorRow,
  densityRow,
  elevationRow,
  focusRows,
  from,
  renamed,
  semanticLabelRow,
  sizeRow,
  VARIANT,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPList: [
    {
      name: 'children',
      type: 'List<Widget>',
      required: true,
      description: { ko: '행들. 보통 `MPListItem`입니다', en: 'The rows, usually `MPListItem`s' }
    },
    from('MPList', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    sizeRow('MPList'),
    densityRow('MPList'),
    elevationRow('MPList'),
    colorRow('MPList'),
    from('MPList', 'dividers', { type: 'bool', default: 'false' })
  ],
  MPListItem: [
    renamed('MPListItem', 'onClick', 'onPressed', {
      type: 'VoidCallback?',
      description: {
        ko: '넘기면 행이 누를 수 있는 버튼이 됩니다. 이동하는 행은 여기서 라우터를 부릅니다',
        en: 'Makes the row a pressable button. A row that navigates calls the router from here'
      }
    }),
    from('MPListItem', 'startIcon', { type: `${WIDGET}?` }),
    from('MPListItem', 'endIcon', { type: `${WIDGET}?` }),
    from('MPListItem', 'description', { type: `${WIDGET}?` }),
    from('MPListItem', 'action', { type: `${WIDGET}?` }),
    from('MPListItem', 'selected', { type: 'bool', default: 'false' }),
    from('MPListItem', 'disabled', { type: 'bool', default: 'false' }),
    renamed('MPListItem', 'children', 'child', { type: `${WIDGET}?` }),
    semanticLabelRow,
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
