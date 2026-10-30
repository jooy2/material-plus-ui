import {
  colorRow,
  focusRows,
  from,
  semanticLabelRow,
  sizeRow,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPCheckbox: [
    from('MPCheckbox', 'checked', {
      type: 'bool?',
      description: {
        ko: '체크 여부. 넘기면 controlled가 되어 부모가 바꿀 때까지 이 값을 보여 줍니다',
        en: 'Whether the box is ticked. Given, the box is controlled and shows this until the parent changes it'
      }
    }),
    {
      name: 'initialChecked',
      type: 'bool',
      default: 'false',
      description: {
        ko: '처음 체크 여부. 자기 상태를 스스로 들고 있는 체크박스에 씁니다. React의 `defaultChecked` 자리입니다',
        en: "Whether the box starts ticked, for one that holds its own state. React's `defaultChecked`"
      }
    },
    {
      name: 'onChanged',
      type: 'ValueChanged<bool>?',
      description: {
        ko: '새 상태로 호출됩니다. 포인터로 누르든 키보드로 누르든 같습니다. React의 `onCheckedChange` 자리이며, `null`이어도 체크박스는 비활성화되지 않습니다',
        en: "Called with the new state, by pointer or by keyboard. React's `onCheckedChange`; leaving it `null` does not disable the box"
      }
    },
    from('MPCheckbox', 'indeterminate', { type: 'bool', default: 'false' }),
    from('MPCheckbox', 'label', { type: `${WIDGET}?` }),
    from('MPCheckbox', 'description', { type: `${WIDGET}?` }),
    from('MPCheckbox', 'errorMessage', { type: `${WIDGET}?` }),
    sizeRow('MPCheckbox'),
    colorRow('MPCheckbox'),
    from('MPCheckbox', 'required', { type: 'bool', default: 'false' }),
    from('MPCheckbox', 'disabled', { type: 'bool', default: 'false' }),
    from('MPCheckbox', 'readOnly', { type: 'bool', default: 'false' }),
    semanticLabelRow,
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
