import { focusRows, from, renamed, semanticLabelRow, WIDGET, type PropRow } from './shared';

export default {
  MPNumberField: [
    from('MPNumberField', 'value', {
      type: 'double?',
      description: {
        ko: '숫자. 주면 controlled이고 `null`은 빈 필드입니다. 빼면 숫자가 아닌 표식이 기본값으로 들어가 필드가 숫자를 직접 들고 있습니다',
        en: 'The number. Given, the field is controlled, and `null` is an empty field; left out, it defaults to a marker that is not a number and the field keeps its own'
      }
    }),
    renamed('MPNumberField', 'defaultValue', 'initialValue', { type: 'double?' }),
    renamed('MPNumberField', 'onValueChange', 'onChanged', { type: 'ValueChanged<double?>?' }),
    from('MPNumberField', 'onValueCommitted', { type: 'ValueChanged<double?>?' }),
    from('MPNumberField', 'min', { type: 'double?' }),
    from('MPNumberField', 'max', { type: 'double?' }),
    from('MPNumberField', 'step', { type: 'double', default: '1' }),
    from('MPNumberField', 'largeStep', { type: 'double', default: '10' }),
    from('MPNumberField', 'smallStep', { type: 'double', default: '0.1' }),
    from('MPNumberField', 'allowWheelScrub', { type: 'bool', default: 'false' }),
    from('MPNumberField', 'format', {
      type: 'String Function(double)?',
      description: {
        ko: '숫자를 상자에 쓰는 함수 — 통화, 백분율, 소수 자릿수. `$1,240.00`으로 보여주면서 값은 `1240`으로 유지합니다',
        en: 'Writes the number into the box — currency, percent, decimal places. Shows `$1,240.00` and still reports `1240`'
      }
    }),
    {
      name: 'parse',
      type: 'double? Function(String)?',
      description: {
        ko: '입력된 텍스트를 숫자로 되읽는 함수. `format`의 반대쪽입니다. 빼면 숫자, 부호, 소수점만 남기고 읽습니다',
        en: 'Reads typed text back as a number, the other half of `format`. Left out, everything but digits, a sign and a decimal point is dropped'
      }
    },
    from('MPNumberField', 'locale', {
      type: 'String?',
      description: {
        ko: '증감 버튼의 이름을 어느 언어로 쓸지. 숫자를 쓰는 방식은 `format`이 정합니다',
        en: "Which language the steppers are named in. How the number is written is `format`'s"
      }
    }),
    from('MPNumberField', 'steppers', {
      type: 'MPNumberFieldSteppers',
      default: 'MPNumberFieldSteppers.end'
    }),
    from('MPNumberField', 'incrementLabel', { type: 'String?' }),
    from('MPNumberField', 'decrementLabel', { type: 'String?' }),
    from('MPNumberField', 'label', { type: `${WIDGET}?` }),
    from('MPNumberField', 'floatingLabel', { type: 'bool', default: 'true' }),
    {
      name: 'description',
      type: `${WIDGET}?`,
      description: {
        ko: '필드 아래 줄. 오류가 있으면 `errorMessage`가 대신합니다',
        en: 'The line under the field. Replaced by `errorMessage` when there is one'
      }
    },
    {
      name: 'errorMessage',
      type: `${WIDGET}?`,
      description: {
        ko: '필드 아래 메시지. 이 값이 있으면 필드 전체가 오류 상태가 됩니다',
        en: 'The message under the field, whose presence puts the whole field into its error state'
      }
    },
    from('MPNumberField', 'placeholder', { type: 'String?' }),
    from('MPNumberField', 'startIcon', { type: `${WIDGET}?` }),
    {
      name: 'required',
      type: 'bool',
      default: 'false',
      description: {
        ko: '필수로 표시합니다. `MPForm` 안에서 빈 필수 필드는 제출을 막습니다',
        en: 'Marks the field required. Inside an `MPForm`, an empty required field holds the submit back'
      }
    },
    {
      name: 'disabled',
      type: 'bool',
      default: 'false',
      description: {
        ko: '필드를 흐리게 하고 입력을 막으며 증감 버튼을 없앱니다',
        en: 'Greys the field out, stops it taking input and drops the steppers'
      }
    },
    {
      name: 'readOnly',
      type: 'bool',
      default: 'false',
      description: {
        ko: '숫자를 보여 주되 수정을 막고, 증감 버튼을 없앱니다',
        en: 'Shows the number without allowing edits, and drops the steppers'
      }
    },
    {
      name: 'name',
      type: 'String?',
      description: {
        ko: '`MPForm`이 값을 넣어 두는 이름',
        en: 'The name an `MPForm` files the value under'
      }
    },
    {
      name: 'size',
      type: 'MPSize?',
      default: 'MPSize.md',
      description: {
        ko: '컨트롤의 높이와 타입 스케일. 텍스트 필드와 같은 단계를 씁니다',
        en: "The control's height and type scale, on the same rungs a text field uses"
      }
    },
    {
      name: 'fullWidth',
      type: 'bool',
      default: 'false',
      description: {
        ko: '약 스무 글자 너비 대신 주어진 너비를 채웁니다',
        en: "Fills the width it is given rather than taking about twenty characters' worth"
      }
    },
    {
      name: 'onKeyEvent',
      type: 'FocusOnKeyEventCallback?',
      description: {
        ko: '필드가 키로 무언가를 하기 전에 모든 키를 먼저 듣습니다. `KeyEventResult.handled`를 돌려주면 그 키를 가져갑니다',
        en: 'Hears every key before the field does anything with it. Returning `KeyEventResult.handled` takes the key'
      }
    },
    {
      name: 'onFocusChange',
      type: 'ValueChanged<bool>?',
      description: {
        ko: '포커스를 얻으면 `true`, 잃으면 `false`로 호출됩니다. 포커스를 잃을 때의 확정은 그대로 일어납니다',
        en: 'Called with `true` when the field takes the focus and `false` when it loses it. The settle a blur causes still happens'
      }
    },
    semanticLabelRow,
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
