import {
  colorRow,
  focusRows,
  from,
  renamed,
  semanticLabelRow,
  sizeRow,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPRadioGroup: [
    renamed('MPRadioGroup', 'children', 'children', {
      type: `List<${WIDGET}>`,
      required: true,
      description: {
        ko: '옵션들. 대개 `MPRadio`이며, 패딩이나 정렬로 감싼 `MPRadio`도 그룹이 들여다봅니다. 항목 하나가 옵션 하나입니다',
        en: 'The options, usually `MPRadio`s. The group sees an `MPRadio` through padding or alignment; each entry is one option'
      }
    }),
    from('MPRadioGroup', 'value', {
      type: 'String?',
      description: {
        ko: '고른 값. 넘기면 controlled입니다. `null`은 “controlled인데 아무것도 안 고름”을 뜻할 수 없어서, 그런 그룹은 첫 선택 전까지 자기 값을 들고 있다가 `onChanged`로 알립니다',
        en: 'The chosen value. Given, the group is controlled. `null` cannot also mean "controlled, nothing chosen", so such a group holds its own choice until the first one and reports it through `onChanged`'
      }
    }),
    {
      name: 'initialValue',
      type: 'String?',
      description: {
        ko: '처음 고른 값. 자기 값을 스스로 들고 있는 그룹에 씁니다. React의 `defaultValue` 자리입니다',
        en: "The value chosen at the start, for a group that holds its own. React's `defaultValue`"
      }
    },
    {
      name: 'onChanged',
      type: 'ValueChanged<String>?',
      description: {
        ko: '새로 고른 값으로 호출됩니다. 이미 고른 옵션을 다시 누르면 호출되지 않습니다. React의 `onValueChange` 자리입니다',
        en: "Called with the newly chosen value, and not for pressing the option already chosen. React's `onValueChange`"
      }
    },
    from('MPRadioGroup', 'label', { type: `${WIDGET}?` }),
    from('MPRadioGroup', 'description', { type: `${WIDGET}?` }),
    from('MPRadioGroup', 'errorMessage', { type: `${WIDGET}?` }),
    from('MPRadioGroup', 'orientation', {
      type: 'MPOrientation',
      default: 'MPOrientation.vertical'
    }),
    sizeRow('MPRadioGroup'),
    colorRow('MPRadioGroup'),
    from('MPRadioGroup', 'required', { type: 'bool', default: 'false' }),
    from('MPRadioGroup', 'disabled', { type: 'bool', default: 'false' }),
    from('MPRadioGroup', 'readOnly', { type: 'bool', default: 'false' }),
    semanticLabelRow,
    {
      name: 'focusNode',
      type: 'FocusNode?',
      description: {
        ko: '그룹의 포커스 정지점. 선택을 따라 옵션 사이를 옮겨 다닙니다',
        en: 'The focus stop, which moves between the options with the choice'
      }
    },
    focusRows[1]
  ],
  MPRadio: [
    from('MPRadio', 'value', { type: 'String', required: true }),
    from('MPRadio', 'label', { type: `${WIDGET}?` }),
    from('MPRadio', 'description', { type: `${WIDGET}?` }),
    from('MPRadio', 'disabled', { type: 'bool', default: 'false' }),
    semanticLabelRow
  ]
} satisfies Record<string, PropRow[]>;
