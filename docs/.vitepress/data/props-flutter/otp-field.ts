import { focusRows, from, renamed, semanticLabelRow, WIDGET, type PropRow } from './shared';

export default {
  MPOtpField: [
    from('MPOtpField', 'length', { type: 'int', default: '6' }),
    from('MPOtpField', 'charset', {
      type: 'MPOtpFieldCharset',
      default: 'MPOtpFieldCharset.numeric'
    }),
    from('MPOtpField', 'mask', { type: 'bool', default: 'false' }),
    from('MPOtpField', 'groupSize', { type: 'int?' }),
    from('MPOtpField', 'separator', { type: WIDGET, default: "const Text('–')" }),
    from('MPOtpField', 'value', { type: 'String?' }),
    renamed('MPOtpField', 'defaultValue', 'initialValue', { type: 'String?' }),
    renamed('MPOtpField', 'onValueChange', 'onChanged', { type: 'ValueChanged<String>?' }),
    from('MPOtpField', 'onComplete', { type: 'ValueChanged<String>?' }),
    from('MPOtpField', 'onValueInvalid', { type: 'ValueChanged<String>?' }),
    from('MPOtpField', 'autoSubmit', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '코드가 완성되면 필드가 속한 `MPForm`을 바로 제출합니다',
        en: 'Submits the `MPForm` the field is in as soon as the code is complete'
      }
    }),
    from('MPOtpField', 'label', { type: `${WIDGET}?` }),
    {
      name: 'description',
      type: `${WIDGET}?`,
      description: {
        ko: '줄 아래의 보조 텍스트. 오류가 있으면 `errorMessage`가 대신합니다',
        en: 'The line under the row. Replaced by `errorMessage` when there is one'
      }
    },
    {
      name: 'errorMessage',
      type: `${WIDGET}?`,
      description: {
        ko: '줄 아래 메시지. 이 값이 있으면 필드가 오류 상태가 됩니다',
        en: 'The message under the row, whose presence puts the field into its error state'
      }
    },
    {
      name: 'name',
      type: 'String?',
      description: {
        ko: '`MPForm`이 코드를 넣어 두는 이름',
        en: 'The name an `MPForm` files the code under'
      }
    },
    {
      name: 'required',
      type: 'bool',
      default: 'false',
      description: {
        ko: '폼이 제출되기 전에 코드가 다 채워져 있어야 합니다',
        en: 'The form must have a complete code before it submits'
      }
    },
    {
      name: 'disabled',
      type: 'bool',
      default: 'false',
      description: {
        ko: '모든 칸을 흐리게 하고 입력을 막습니다',
        en: 'Greys every slot out and stops them taking input'
      }
    },
    {
      name: 'readOnly',
      type: 'bool',
      default: 'false',
      description: {
        ko: '읽고 복사할 수 있지만 입력할 수는 없습니다',
        en: 'Readable and copyable, but not typeable'
      }
    },
    renamed('MPOtpField', 'autoFocus', 'autofocus', { type: 'bool', default: 'false' }),
    {
      name: 'size',
      type: 'MPSize?',
      default: 'MPSize.md',
      description: {
        ko: '칸의 크기, 칸 안의 타입, 칸 사이 간격. 높이는 같은 이름의 컨트롤 높이입니다',
        en: "The slot's box, its type and the gap between slots. The height is the control height of the same name"
      }
    },
    {
      name: 'fullWidth',
      type: 'bool',
      default: 'false',
      description: {
        ko: '필드와 아래 줄이 주어진 너비를 씁니다. 칸의 크기는 그대로입니다',
        en: 'Lets the field and the line under it take the width it is given. The slots keep their size'
      }
    },
    semanticLabelRow,
    focusRows[0]
  ]
} satisfies Record<string, PropRow[]>;
