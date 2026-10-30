import {
  densityRow,
  elevationRow,
  from,
  renamed,
  semanticLabelRow,
  sizeRow,
  VARIANT,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPTable: [
    from('MPTable', 'headers', { type: 'List<MPTableColumn<T>>' }),
    from('MPTable', 'items', { type: 'List<T>' }),
    from('MPTable', 'getRowKey', { type: 'Object Function(T row, int index)?' }),
    from('MPTable', 'caption', {
      type: `${WIDGET}?`,
      description: {
        ko: '표 위에 놓입니다. 평범한 텍스트이고 `semanticLabel`이 없으면 표의 이름으로 읽힙니다',
        en: 'Shown above the table, and read out as its name when it is plain text and no `semanticLabel` is given'
      }
    }),
    from('MPTable', 'empty', { type: `${WIDGET}?` }),
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '빈 표의 기본 문구를 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 로케일, 영어 순으로 따릅니다',
        en: "Which language the empty line is written in. Falls back to the nearest `MPLocaleProvider`, then the app's locale, then English"
      }
    },
    from('MPTable', 'striped', { type: 'bool', default: 'false' }),
    from('MPTable', 'hoverable', { type: 'bool', default: 'false' }),
    from('MPTable', 'stickyHeader', { type: 'bool', default: 'false' }),
    renamed('MPTable', 'onRowClick', 'onRowPressed', { type: 'void Function(T row, int index)?' }),
    from('MPTable', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    sizeRow('MPTable'),
    densityRow('MPTable'),
    elevationRow('MPTable'),
    semanticLabelRow
  ],
  MPTableColumn: [
    from('MPTableColumn', 'key', { type: 'String' }),
    from('MPTableColumn', 'label', { type: `${WIDGET}?` }),
    from('MPTableColumn', 'width', {
      type: 'double?',
      description: {
        ko: '열의 너비, 논리 픽셀 단위이며 정확히 지켜집니다. 비워 두면 내용으로 재고, 시트에 남은 너비를 나눠 받습니다',
        en: "The column's width in logical pixels, held exactly. Left out, the column is measured from its content and handed a share of what the sheet has left over"
      }
    }),
    from('MPTableColumn', 'align', { type: 'MPAlign', default: 'MPAlign.start' }),
    from('MPTableColumn', 'render', {
      type: 'Widget Function(T row, int index)?',
      description: {
        ko: '셀을 그립니다. 없으면 맵 행의 `row[key]`를 텍스트로 그리므로, 직접 만든 타입의 행에는 모든 열에 필요합니다',
        en: 'Draws the cell. Without it the cell is `row[key]` of a map row, drawn as text, so rows of your own type need it on every column'
      }
    })
  ]
} satisfies Record<string, PropRow[]>;
