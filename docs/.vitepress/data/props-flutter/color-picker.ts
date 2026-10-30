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
  MPColorPicker: [
    from('MPColorPicker', 'value', {
      type: 'String?',
      description: {
        ko: "CSS 문자열로 쓴 색. `''`은 색이 없다는 뜻입니다. 주면 controlled이고, 빼면 피커가 직접 들고 `initialValue`에서 시작합니다",
        en: "The colour, as a CSS string, `''` for none. Given, the picker is controlled; left out, it keeps its own, starting at `initialValue`"
      }
    }),
    renamed('MPColorPicker', 'defaultValue', 'initialValue', {
      type: 'String',
      default: "'#00639b'"
    }),
    renamed('MPColorPicker', 'onValueChange', 'onChanged', { type: 'ValueChanged<String>?' }),
    from('MPColorPicker', 'format', { type: 'MPColorFormat', default: 'MPColorFormat.hex' }),
    from('MPColorPicker', 'alpha', { type: 'bool', default: 'false' }),
    from('MPColorPicker', 'swatches', {
      type: 'List<String>?',
      default: undefined,
      description: {
        ko: '패널 아래의 기본 제공 색들. 빼면 단순한 스펙트럼과 회색들이고, 빈 리스트는 아무것도 그리지 않습니다. 읽을 수 없는 문자열은 빠집니다',
        en: 'The ready-made colours under the panel. Left out, a plain spectrum and the greys; an empty list draws none. A string the picker cannot read is left out'
      }
    }),
    from('MPColorPicker', 'inline', { type: 'bool', default: 'false' }),
    from('MPColorPicker', 'editable', { type: 'bool', default: 'true' }),
    from('MPColorPicker', 'label', { type: `${WIDGET}?` }),
    from('MPColorPicker', 'floatingLabel', { type: 'bool', default: 'true' }),
    from('MPColorPicker', 'description', { type: `${WIDGET}?` }),
    from('MPColorPicker', 'errorMessage', { type: `${WIDGET}?` }),
    sizeRow('MPColorPicker'),
    from('MPColorPicker', 'fullWidth', { type: 'bool', default: 'false' }),
    from('MPColorPicker', 'required', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '필수로 표시합니다. `MPForm` 안에서 색이 없는 필수 피커는 제출을 막습니다',
        en: 'Marks the picker required. Inside an `MPForm`, a required picker with no colour holds the submit back'
      }
    }),
    from('MPColorPicker', 'disabled', { type: 'bool', default: 'false' }),
    from('MPColorPicker', 'readOnly', { type: 'bool', default: 'false' }),
    from('MPColorPicker', 'clearable', { type: 'bool', default: 'false' }),
    from('MPColorPicker', 'name', {
      type: 'String?',
      description: {
        ko: '`MPForm`이 값을 넣어 두는 이름. 값은 `format`으로 쓰인 문자열입니다',
        en: 'The name an `MPForm` files the value under, written in `format`'
      }
    }),
    from('MPColorPicker', 'open', { type: 'bool?' }),
    renamed('MPColorPicker', 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from('MPColorPicker', 'onOpenChange', { type: 'ValueChanged<bool>?' }),
    from('MPColorPicker', 'locale', { type: 'String?' }),
    from('MPColorPicker', 'labels', {
      type: 'Map<String, String>?',
      description: {
        ko: '단어 자체에 대한 덮어쓰기. 키는 `area`, `hue`, `alpha`, `value`, `swatches`, `clear`, `empty`입니다. 번역보다 우선하고, 지정하지 않은 나머지는 번역된 채로 남습니다',
        en: 'Overrides for the words themselves, by key: `area`, `hue`, `alpha`, `value`, `swatches`, `clear`, `empty`. They win over the translation, and anything not named stays translated'
      }
    }),
    semanticLabelRow,
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
