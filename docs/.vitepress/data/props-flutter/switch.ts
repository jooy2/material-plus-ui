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
  MPSwitch: [
    from('MPSwitch', 'checked', {
      type: 'bool?',
      description: {
        ko: '켜짐 여부. 넘기면 controlled입니다',
        en: 'Whether the switch is on. Given, the switch is controlled'
      }
    }),
    {
      name: 'initialChecked',
      type: 'bool',
      default: 'false',
      description: {
        ko: '처음 켜짐 여부. 자기 상태를 스스로 들고 있는 스위치에 씁니다. React의 `defaultChecked` 자리입니다',
        en: "Whether it starts on, for one that holds its own state. React's `defaultChecked`"
      }
    },
    {
      name: 'onChanged',
      type: 'ValueChanged<bool>?',
      description: {
        ko: '새 상태로 호출됩니다. React의 `onCheckedChange` 자리이며, `null`이어도 스위치는 비활성화되지 않습니다',
        en: "Called with the new state. React's `onCheckedChange`; leaving it `null` does not disable the switch"
      }
    },
    from('MPSwitch', 'label', { type: `${WIDGET}?` }),
    from('MPSwitch', 'description', { type: `${WIDGET}?` }),
    from('MPSwitch', 'errorMessage', { type: `${WIDGET}?` }),
    from('MPSwitch', 'icons', { type: 'bool', default: 'false' }),
    from('MPSwitch', 'labelPlacement', {
      type: 'MPSwitchLabelPlacement',
      default: 'MPSwitchLabelPlacement.end'
    }),
    sizeRow('MPSwitch'),
    colorRow('MPSwitch'),
    from('MPSwitch', 'fullWidth', { type: 'bool', default: 'false' }),
    from('MPSwitch', 'required', { type: 'bool', default: 'false' }),
    from('MPSwitch', 'disabled', { type: 'bool', default: 'false' }),
    from('MPSwitch', 'readOnly', { type: 'bool', default: 'false' }),
    semanticLabelRow,
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
