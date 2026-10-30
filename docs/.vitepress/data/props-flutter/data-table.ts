import {
  colorRow,
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
  MPDataTable: [
    from('MPDataTable', 'headers', { type: 'List<MPDataTableColumn<T>>' }),
    from('MPDataTable', 'items', { type: 'List<T>' }),
    from('MPDataTable', 'getRowKey', { type: 'Object Function(T row, int index)?' }),
    from('MPDataTable', 'sortable', { type: 'bool', default: 'false' }),
    from('MPDataTable', 'sortMode', {
      type: 'MPDataTableSortMode',
      default: 'MPDataTableSortMode.single'
    }),
    from('MPDataTable', 'sort', { type: 'List<MPDataTableSort>?' }),
    renamed('MPDataTable', 'defaultSort', 'initialSort', { type: 'List<MPDataTableSort>?' }),
    from('MPDataTable', 'onSortChange', { type: 'ValueChanged<List<MPDataTableSort>>?' }),
    from('MPDataTable', 'searchable', { type: 'bool', default: 'false' }),
    from('MPDataTable', 'search', { type: 'String?' }),
    renamed('MPDataTable', 'defaultSearch', 'initialSearch', { type: 'String?' }),
    from('MPDataTable', 'onSearchChange', { type: 'ValueChanged<String>?' }),
    from('MPDataTable', 'searchLabel', { type: 'String?' }),
    from('MPDataTable', 'filter', { type: 'bool Function(T row, int index)?' }),
    from('MPDataTable', 'toolbar', { type: `${WIDGET}?` }),
    from('MPDataTable', 'paged', { type: 'bool', default: 'false' }),
    from('MPDataTable', 'page', { type: 'int?' }),
    renamed('MPDataTable', 'defaultPage', 'initialPage', { type: 'int', default: '1' }),
    from('MPDataTable', 'onPageChange', { type: 'ValueChanged<int>?' }),
    from('MPDataTable', 'pageSize', { type: 'int?' }),
    renamed('MPDataTable', 'defaultPageSize', 'initialPageSize', { type: 'int', default: '25' }),
    from('MPDataTable', 'onPageSizeChange', { type: 'ValueChanged<int>?' }),
    from('MPDataTable', 'pageSizeOptions', {
      type: 'List<int>',
      default: '[10, 25, 50, 100]'
    }),
    from('MPDataTable', 'resizable', { type: 'bool', default: 'false' }),
    from('MPDataTable', 'columnWidths', { type: 'Map<String, double>?' }),
    renamed('MPDataTable', 'defaultColumnWidths', 'initialColumnWidths', {
      type: 'Map<String, double>?'
    }),
    from('MPDataTable', 'onColumnWidthsChange', { type: 'ValueChanged<Map<String, double>>?' }),
    from('MPDataTable', 'selectionMode', {
      type: 'MPDataTableSelectionMode',
      default: 'MPDataTableSelectionMode.none'
    }),
    from('MPDataTable', 'selected', { type: 'List<Object>?' }),
    renamed('MPDataTable', 'defaultSelected', 'initialSelected', { type: 'List<Object>?' }),
    from('MPDataTable', 'onSelectedChange', {
      type: 'void Function(List<Object> selected, List<T> rows)?'
    }),
    from('MPDataTable', 'checkboxes', { type: 'bool', default: 'false' }),
    renamed('MPDataTable', 'onRowClick', 'onRowPressed', {
      type: 'void Function(T row, int index)?'
    }),
    from('MPDataTable', 'exportable', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '행들을 CSV로 만들어 `onExport`에 넘기는 버튼을 답니다. 페이지가 아니라 지금 보이는 모든 행이고, 검색과 정렬은 적용됩니다',
        en: 'Adds a button that builds the rows as CSV and hands the text to `onExport`: every row the reader is looking at, searched and sorted, not just the page'
      }
    }),
    {
      name: 'exportEscapeFormulas',
      type: 'bool',
      default: 'true',
      description: {
        ko: '스프레드시트가 수식으로 실행할 셀(`=`, `+`, `-`, `@`로 시작) 앞에 작은따옴표를 붙입니다. 숫자는 부호를 지킵니다. 사람이 아니라 파서에게 갈 텍스트라면 끄세요',
        en: 'Puts an apostrophe in front of a cell a spreadsheet would run as a formula (one beginning `=`, `+`, `-` or `@`). A number keeps its sign. Turn it off for text going to a parser rather than to a person'
      }
    },
    from('MPDataTable', 'onExport', {
      type: 'ValueChanged<String>?',
      description: {
        ko: 'CSV 텍스트를 받습니다. 위젯만으로 된 패키지는 파일을 쓰지 못하므로, 저장이나 공유는 앱이 여기서 합니다. 없으면 내보내기 버튼이 비활성입니다',
        en: 'Takes the CSV text. A widgets-only package cannot write a file, so the app saves or shares it from here. Without it the export button is disabled'
      }
    }),
    from('MPDataTable', 'caption', { type: `${WIDGET}?` }),
    from('MPDataTable', 'empty', { type: `${WIDGET}?` }),
    from('MPDataTable', 'striped', { type: 'bool', default: 'false' }),
    from('MPDataTable', 'hoverable', { type: 'bool', default: 'false' }),
    from('MPDataTable', 'stickyHeader', { type: 'bool', default: 'false' }),
    from('MPDataTable', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    elevationRow('MPDataTable'),
    sizeRow('MPDataTable'),
    colorRow('MPDataTable'),
    densityRow('MPDataTable'),
    from('MPDataTable', 'locale', { type: 'String?' }),
    semanticLabelRow
  ],
  MPDataTableColumn: [
    from('MPDataTableColumn', 'key', { type: 'String' }),
    from('MPDataTableColumn', 'label', { type: `${WIDGET}?` }),
    from('MPDataTableColumn', 'width', { type: 'double?' }),
    from('MPDataTableColumn', 'minWidth', { type: 'double', default: '48' }),
    from('MPDataTableColumn', 'align', { type: 'MPAlign', default: 'MPAlign.start' }),
    from('MPDataTableColumn', 'sortable', { type: 'bool?' }),
    from('MPDataTableColumn', 'resizable', { type: 'bool?' }),
    from('MPDataTableColumn', 'searchable', { type: 'bool', default: 'true' }),
    from('MPDataTableColumn', 'value', {
      type: 'Object? Function(T row)?',
      description: {
        ko: '셀 뒤의 값. 정렬과 검색이 보는 것입니다. 비워 두면 맵 행의 `row[key]`이므로, 직접 만든 타입의 행에는 필요합니다',
        en: 'The value behind the cell: what is sorted and searched. Defaults to `row[key]` of a map row, so rows of your own type need it'
      }
    }),
    from('MPDataTableColumn', 'compare', { type: 'int Function(T a, T b)?' }),
    from('MPDataTableColumn', 'render', { type: 'Widget Function(T row, int index)?' }),
    from('MPDataTableColumn', 'exportValue', { type: 'Object? Function(T row)?' }),
    from('MPDataTableColumn', 'exportable', { type: 'bool', default: 'true' })
  ]
} satisfies Record<string, PropRow[]>;
