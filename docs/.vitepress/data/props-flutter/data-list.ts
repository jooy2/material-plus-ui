import { densityRow, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPDataList: [
    from('MPDataList', 'children', {
      type: 'List<MPDataListItem>',
      required: true,
      description: {
        ko: '쌍들. 목록이 각 쌍의 두 반쪽을 직접 배치하므로 아무 위젯이 아니라 `MPDataListItem`을 받습니다',
        en: "The pairs. `MPDataListItem`s rather than any widget, because the list lays out each pair's two halves itself"
      }
    }),
    from('MPDataList', 'orientation', {
      type: 'MPOrientation',
      default: 'MPOrientation.horizontal'
    }),
    from('MPDataList', 'labelWidth', {
      type: 'double?',
      description: {
        ko: '가로일 때 레이블 열의 너비, 논리 픽셀 단위. 비워 두면 가장 긴 레이블만큼 넓어서, 아무도 재지 않아도 모든 값이 같은 자리에서 시작합니다',
        en: 'How wide the label column is when horizontal, in logical pixels. Left out it is as wide as the widest label, so every value starts at the same place without anybody measuring anything'
      }
    }),
    from('MPDataList', 'dividers', { type: 'bool', default: 'false' }),
    sizeRow('MPDataList'),
    densityRow('MPDataList')
  ],
  MPDataListItem: [
    from('MPDataListItem', 'label', { type: WIDGET, required: true }),
    renamed('MPDataListItem', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
