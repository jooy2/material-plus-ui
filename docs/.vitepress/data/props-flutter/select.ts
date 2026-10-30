import {
  focusRows,
  from,
  renamed,
  semanticLabelRow,
  sizeRow,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPSelect: [
    from('MPSelect', 'items', {
      type: 'List<MPSelectOption>',
      description: {
        ko: '옵션 목록. `MPSelectOption(value:, label:, disabled:)`의 리스트입니다. 위젯 조합이 아니라 데이터인 이유는 닫힌 트리거도 고른 옵션의 *라벨*을 보여줘야 하기 때문입니다',
        en: 'The options, as `MPSelectOption(value:, label:, disabled:)`. Data rather than composed widgets, because a closed trigger has to show the chosen option’s *label*'
      }
    }),
    from('MPSelect', 'value', {
      type: 'MPSelectValue?',
      description: {
        ko: '고른 값(`String`이나 `num`). 주면 controlled이고 **고르지 않음은 `null`**입니다. 빼면 값이 아닌 표식이 기본값으로 들어가 셀렉트가 값을 직접 들고 있습니다. `items`에 없는 값은 값 자체가 그려집니다',
        en: 'The chosen value, a `String` or a `num`. Given, the select is controlled, and **nothing chosen is `null`**; left out, it defaults to a marker that is not a value and the select keeps its own. A value with no entry in `items` is drawn as itself'
      }
    }),
    renamed('MPSelect', 'defaultValue', 'initialValue', { type: 'MPSelectValue?' }),
    renamed('MPSelect', 'onValueChange', 'onChanged', { type: 'ValueChanged<MPSelectValue?>?' }),
    from('MPSelect', 'placeholder', { type: `${WIDGET}?` }),
    from('MPSelect', 'label', { type: `${WIDGET}?` }),
    from('MPSelect', 'floatingLabel', { type: 'bool', default: 'true' }),
    from('MPSelect', 'description', { type: `${WIDGET}?` }),
    from('MPSelect', 'errorMessage', { type: `${WIDGET}?` }),
    from('MPSelect', 'startIcon', { type: `${WIDGET}?` }),
    sizeRow('MPSelect'),
    from('MPSelect', 'fullWidth', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '가장 긴 옵션의 너비를 유지하는 대신 주어진 너비를 채웁니다',
        en: 'Fills the width it is given rather than holding the width of its widest option'
      }
    }),
    from('MPSelect', 'required', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '필수로 표시합니다. `MPForm` 안에서 아무것도 고르지 않은 필수 셀렉트는 제출을 막습니다',
        en: 'Marks the select required. Inside an `MPForm`, a required select with nothing chosen holds the submit back'
      }
    }),
    from('MPSelect', 'disabled', { type: 'bool', default: 'false' }),
    from('MPSelect', 'readOnly', { type: 'bool', default: 'false' }),
    from('MPSelect', 'name', {
      type: 'String?',
      description: {
        ko: '`MPForm`이 값을 넣어 두고 오류를 찾는 이름',
        en: 'The name an `MPForm` files the value under and finds its errors by'
      }
    }),
    {
      name: 'onKeyEvent',
      type: 'FocusOnKeyEventCallback?',
      description: {
        ko: '셀렉트가 키로 무언가를 하기 전에 트리거에 눌린 모든 키를 먼저 듣습니다. `KeyEventResult.handled`를 돌려주면 그 키를 가져갑니다',
        en: 'Hears every key pressed on the trigger before the select does anything with it. Returning `KeyEventResult.handled` takes the key'
      }
    },
    {
      name: 'onFocusChange',
      type: 'ValueChanged<bool>?',
      description: {
        ko: '트리거가 포커스를 얻으면 `true`, 잃으면 `false`로 호출됩니다',
        en: 'Called with `true` when the trigger takes the focus and `false` when it loses it'
      }
    },
    semanticLabelRow,
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
