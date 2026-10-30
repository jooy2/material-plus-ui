import { focusRows, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPTextField: [
    from('MPTextField', 'value', { type: 'String' }),
    renamed('MPTextField', 'onChange', 'onChanged', { type: 'ValueChanged<String>?' }),
    from('MPTextField', 'label', { type: `${WIDGET}?` }),
    renamed('MPTextField', 'aria-label', 'semanticLabel', { type: 'String?' }),
    from('MPTextField', 'floatingLabel', { type: 'bool', default: 'true' }),
    from('MPTextField', 'type', {
      type: 'MPTextFieldType',
      default: 'MPTextFieldType.text',
      description: {
        ko: '어떤 키보드를 띄울지. `password`는 동작도 달라져서, 끝에 표시/숨김 토글이 생깁니다. `email`은 `@`가 있는 키보드를, `search`는 동작 키가 "검색"인 키보드를 띄우고 그리는 모습은 `text`와 같습니다',
        en: 'Which keyboard to summon. `password` also changes behaviour: it grows a reveal toggle in the trailing adornment. `email` brings the keyboard with `@` and `search` makes the action key read "search"; both draw exactly as `text` does'
      }
    }),
    from('MPTextField', 'errorMessage', { type: 'String?', default: undefined }),
    from('MPTextField', 'name', {
      type: 'String?',
      description: {
        ko: '`MPForm`이 값을 넣어 두고 오류를 찾는 이름',
        en: 'The name an `MPForm` files the value under, and finds its errors by'
      }
    }),
    from('MPTextField', 'placeholder', { type: 'String?' }),
    renamed('MPTextField', 'autoComplete', 'autofillHints', {
      type: 'Iterable<String>?',
      description: {
        ko: '플랫폼 자동 완성이 제안할 것. `AutofillHints.email`, `AutofillHints.password`처럼 `AutofillHints`의 값을 넘깁니다',
        en: 'What the platform autofill should offer, from `AutofillHints`: `AutofillHints.email`, `AutofillHints.password`'
      }
    }),
    from('MPTextField', 'rows', {
      type: 'int?',
      description: {
        ko: '지정하면 이만큼의 줄을 가진 여러 줄 필드가 됩니다',
        en: 'Makes the field multiline, this many rows tall'
      }
    }),
    from('MPTextField', 'maxLength', { type: 'int?' }),
    from('MPTextField', 'startIcon', { type: `${WIDGET}?` }),
    sizeRow('MPTextField'),
    from('MPTextField', 'fullWidth', { type: 'bool', default: 'false' }),
    from('MPTextField', 'required', { type: 'bool', default: 'false' }),
    from('MPTextField', 'disabled', { type: 'bool', default: 'false' }),
    from('MPTextField', 'readOnly', { type: 'bool', default: 'false' }),
    renamed('MPTextField', 'autoFocus', 'autofocus', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '트리에 들어오면서 포커스를 가져갑니다. 다만 compact 창에서는 키보드가 올라오는 것을 막기 위해 건너뜁니다',
        en: 'Takes the focus as it is inserted — except in a compact window, where it would summon the on-screen keyboard'
      }
    }),
    from('MPTextField', 'onSubmit', {
      type: 'VoidCallback?',
      description: {
        ko: 'Enter를 눌렀을 때 호출됩니다. **이걸 넘기는 것이 필드가 그 키를 가져가는 조건**입니다. 넘기지 않으면 `MPForm` 안의 한 줄 필드에서 Enter가 폼을 제출하고, 폼 밖에서는 플랫폼의 것입니다',
        en: 'Called when Enter is pressed. **Passing it is what makes the field take the key.** Without it, Enter on a single-line field inside an `MPForm` submits the form, and anywhere else is left to the platform'
      }
    }),
    from('MPTextField', 'disableEnterKey', { type: 'bool', default: 'false' }),
    from('MPTextField', 'onFormReset', { type: 'VoidCallback?' }),
    {
      name: 'onKeyEvent',
      type: 'FocusOnKeyEventCallback?',
      description: {
        ko: '필드가 키로 무언가를 하기 전에 모든 키를 먼저 듣습니다. `KeyEventResult.handled`를 돌려주면 그 키를 가져갑니다. React의 `onKeyDown`, `onKeyUp` 자리입니다',
        en: "Hears every key before the field does anything with it. Returning `KeyEventResult.handled` takes the key. React's `onKeyDown` and `onKeyUp`"
      }
    },
    {
      name: 'onFocusChange',
      type: 'ValueChanged<bool>?',
      description: {
        ko: '컨트롤이 포커스를 얻으면 `true`, 잃으면 `false`로 호출됩니다. 표시 토글의 포커스는 알리지 않습니다. React의 `onFocus`, `onBlur` 자리입니다',
        en: "Called with `true` when the control takes the focus and `false` when it loses it. The reveal toggle's focus is not reported. React's `onFocus` and `onBlur`"
      }
    },
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '표시 토글의 이름을 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: "Which language the reveal toggle's name is in. Falls back to the nearest `MPLocaleProvider`, then the app's `Localizations`, then English"
      }
    },
    {
      name: 'passwordLabels',
      type: 'Map<String, String>?',
      description: {
        ko: '표시 토글이 불리는 두 이름 `showPassword`, `hidePassword`를 바꿉니다',
        en: 'Overrides the two words the reveal toggle is announced by: `showPassword` and `hidePassword`'
      }
    },
    focusRows[0]
  ]
} satisfies Record<string, PropRow[]>;
