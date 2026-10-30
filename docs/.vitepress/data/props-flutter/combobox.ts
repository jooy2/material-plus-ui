import {
  COLOR,
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
  MPCombobox: [
    from('MPCombobox', 'items', { type: 'List<MPComboboxOption>' }),
    {
      name: 'value',
      type: 'MPComboboxValue? · List<MPComboboxValue>?',
      description: {
        ko: '고른 값. 단일 생성자는 `String`이나 `num` 하나를 받고, 주면 controlled이며 **고르지 않음은 `null`**입니다. 빼면 값이 아닌 표식이 기본값으로 들어가 직접 들고 있습니다. `MPCombobox.multiple`은 리스트를 받고, `null`이면 직접 들고 있습니다. `items`에 없는 값은 그대로 그려집니다',
        en: 'The chosen value. The single constructor takes one `String` or `num`; given, it is controlled and **nothing chosen is `null`**, and left out it defaults to a marker that is not a value and the combobox keeps its own. `MPCombobox.multiple` takes a list, and `null` keeps its own. A value with no entry in `items` is drawn as itself'
      }
    },
    renamed('MPCombobox', 'defaultValue', 'initialValue', {
      type: 'MPComboboxValue? · List<MPComboboxValue>'
    }),
    renamed('MPCombobox', 'onValueChange', 'onChanged', {
      type: 'ValueChanged<MPComboboxValue?>? · ValueChanged<List<MPComboboxValue>>?'
    }),
    from('MPCombobox', 'onInputValueChange', { type: 'ValueChanged<String>?' }),
    from('MPCombobox', 'allowCustom', { type: 'bool', default: 'true' }),
    from('MPCombobox', 'customLabel', { type: `${WIDGET} Function(String query)?` }),
    from('MPCombobox', 'clearable', { type: 'bool', default: 'false' }),
    from('MPCombobox', 'emptyMessage', { type: `${WIDGET}?` }),
    from('MPCombobox', 'limit', { type: 'int', default: '-1' }),
    from('MPCombobox', 'filter', {
      type: 'MPComboboxFilter?',
      description: {
        ko: '질의를 통과할 행을 이 컴포넌트의 매칭 대신 정합니다. **`MPCombobox.noFilter`를 주면 필터링을 끕니다** — 키 입력마다 서버가 이미 골라 준 목록에 여기서 한 번 더 거르면 서버가 일치라고 판단한 행을 지우는 일밖에 할 수 없습니다. 입력한 값을 제안하는 행은 어느 쪽이든 예외입니다',
        en: 'Which rows survive the query, in place of the matching this does on its own. **`MPCombobox.noFilter` turns the filtering off** — for a list already matched per keystroke by a server, where a second pass here can only take away rows that server decided were hits. The row offering what was typed is exempt either way'
      }
    }),
    from('MPCombobox', 'chipVariant', { type: `${VARIANT}?` }),
    from('MPCombobox', 'chipColor', { type: `${COLOR}?` }),
    from('MPCombobox', 'placeholder', { type: 'String?' }),
    from('MPCombobox', 'label', { type: `${WIDGET}?` }),
    from('MPCombobox', 'floatingLabel', { type: 'bool', default: 'true' }),
    from('MPCombobox', 'description', { type: `${WIDGET}?` }),
    from('MPCombobox', 'errorMessage', { type: `${WIDGET}?` }),
    from('MPCombobox', 'startIcon', { type: `${WIDGET}?` }),
    sizeRow('MPCombobox'),
    from('MPCombobox', 'fullWidth', { type: 'bool', default: 'false' }),
    from('MPCombobox', 'required', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '필수로 표시합니다. `MPForm` 안에서 비어 있는 필수 콤보박스는 제출을 막습니다',
        en: 'Marks the combobox required. Inside an `MPForm`, an empty required combobox holds the submit back'
      }
    }),
    from('MPCombobox', 'disabled', { type: 'bool', default: 'false' }),
    from('MPCombobox', 'readOnly', { type: 'bool', default: 'false' }),
    from('MPCombobox', 'name', {
      type: 'String?',
      description: {
        ko: '`MPForm`이 값을 넣어 두고 오류를 찾는 이름. `MPCombobox.multiple`은 리스트를 넣습니다',
        en: 'The name an `MPForm` files the value under and finds its errors by. `MPCombobox.multiple` files a list'
      }
    }),
    from('MPCombobox', 'open', { type: 'bool?' }),
    renamed('MPCombobox', 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from('MPCombobox', 'onOpenChange', { type: 'ValueChanged<bool>?' }),
    from('MPCombobox', 'clearLabel', { type: 'String?', default: undefined }),
    from('MPCombobox', 'openLabel', { type: 'String?' }),
    from('MPCombobox', 'removeLabel', { type: 'String Function(String label)?' }),
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '콤보박스가 직접 쓰는 말 — 버튼 이름, 빈 목록 문구, 새 값을 제안하는 행 — 을 어느 언어로 쓸지',
        en: "Which language the field's own words are in: the buttons' names, the empty line, the row offering a new value"
      }
    },
    {
      name: 'onKeyEvent',
      type: 'FocusOnKeyEventCallback?',
      description: {
        ko: '콤보박스가 키로 무언가를 하기 전에 입력란에 눌린 모든 키를 먼저 듣습니다. `KeyEventResult.handled`를 돌려주면 그 키를 가져갑니다',
        en: 'Hears every key pressed in the text before the combobox does anything with it. Returning `KeyEventResult.handled` takes the key'
      }
    },
    {
      name: 'onFocusChange',
      type: 'ValueChanged<bool>?',
      description: {
        ko: '입력란이 포커스를 얻으면 `true`, 잃으면 `false`로 호출됩니다',
        en: 'Called with `true` when the text takes the focus and `false` when it loses it'
      }
    },
    semanticLabelRow,
    {
      name: 'focusNode',
      type: 'FocusNode?',
      description: {
        ko: '입력란의 포커스를 밖에서 다룰 때 넘기는 노드. React의 `inputRef` 자리입니다',
        en: "Drives the text's focus from outside. React's `inputRef`"
      }
    },
    focusRows[1]
  ],

  MPComboboxOption: [
    from('MPComboboxOption', 'value', { type: 'MPComboboxValue' }),
    from('MPComboboxOption', 'label', { type: 'String?' }),
    from('MPComboboxOption', 'content', { type: `${WIDGET}?` }),
    from('MPComboboxOption', 'disabled', { type: 'bool', default: 'false' })
  ]
} satisfies Record<string, PropRow[]>;
