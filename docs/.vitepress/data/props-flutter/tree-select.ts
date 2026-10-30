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
  MPTreeSelect: [
    from('MPTreeSelect', 'items', { type: 'List<MPTreeSelectItem>', default: 'const []' }),
    from('MPTreeSelect', 'value', {
      type: 'List<Object>?',
      description: {
        ko: '고른 값들. 여러 개를 고를 수 없으면 한 개짜리 리스트입니다. 주면 controlled이고, 빼면 직접 들고 `initialValue`에서 시작합니다',
        en: 'The chosen values, one entry long unless `multiple`. Given, the select is controlled; left out, it keeps its own, starting at `initialValue`'
      }
    }),
    renamed('MPTreeSelect', 'defaultValue', 'initialValue', {
      type: 'List<Object>',
      default: 'const []'
    }),
    renamed('MPTreeSelect', 'onValueChange', 'onChanged', { type: 'ValueChanged<List<Object>>?' }),
    from('MPTreeSelect', 'multiple', { type: 'bool', default: 'false' }),
    from('MPTreeSelect', 'selectableBranches', { type: 'bool', default: 'false' }),
    from('MPTreeSelect', 'searchable', { type: 'bool', default: 'false' }),
    from('MPTreeSelect', 'searchPlaceholder', { type: 'String?' }),
    from('MPTreeSelect', 'expanded', { type: 'List<Object>?' }),
    renamed('MPTreeSelect', 'defaultExpanded', 'initialExpanded', {
      type: 'List<Object>',
      default: 'const []'
    }),
    from('MPTreeSelect', 'onExpandedChange', { type: 'ValueChanged<List<Object>>?' }),
    from('MPTreeSelect', 'closeOnSelect', { type: 'bool?' }),
    from('MPTreeSelect', 'format', {
      type: 'String Function(List<MPTreeSelectItem> chosen)?',
      description: {
        ko: '트리거가 가진 값을 어떻게 쓸지. 빼면 라벨을 쉼표로 이어 씁니다. 화면 낭독기가 읽는 값과 같은 문자열입니다',
        en: 'How the trigger writes what is held. Left out, the labels, comma-joined. It is also the value a screen reader reads'
      }
    }),
    from('MPTreeSelect', 'placeholder', { type: `${WIDGET}?` }),
    from('MPTreeSelect', 'label', { type: `${WIDGET}?` }),
    from('MPTreeSelect', 'floatingLabel', { type: 'bool', default: 'true' }),
    from('MPTreeSelect', 'description', { type: `${WIDGET}?` }),
    from('MPTreeSelect', 'errorMessage', { type: `${WIDGET}?` }),
    from('MPTreeSelect', 'startIcon', { type: `${WIDGET}?` }),
    from('MPTreeSelect', 'clearable', { type: 'bool', default: 'false' }),
    from('MPTreeSelect', 'open', { type: 'bool?' }),
    renamed('MPTreeSelect', 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from('MPTreeSelect', 'onOpenChange', { type: 'ValueChanged<bool>?' }),
    from('MPTreeSelect', 'labels', {
      type: 'Map<String, String>?',
      description: {
        ko: '셀렉트가 직접 쓰는 말에 대한 덮어쓰기. 키는 `clear`입니다',
        en: "Overrides for the select's own words, by key: `clear`"
      }
    }),
    from('MPTreeSelect', 'locale', { type: 'String?' }),
    sizeRow('MPTreeSelect'),
    from('MPTreeSelect', 'fullWidth', { type: 'bool', default: 'false' }),
    from('MPTreeSelect', 'required', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '필수로 표시합니다. `MPForm` 안에서 아무것도 고르지 않은 필수 셀렉트는 제출을 막습니다',
        en: 'Marks the select required. Inside an `MPForm`, a required select holding nothing holds the submit back'
      }
    }),
    from('MPTreeSelect', 'disabled', { type: 'bool', default: 'false' }),
    from('MPTreeSelect', 'readOnly', { type: 'bool', default: 'false' }),
    from('MPTreeSelect', 'name', {
      type: 'String?',
      description: {
        ko: '`MPForm`이 값 리스트를 넣어 두는 이름',
        en: 'The name an `MPForm` files the list of values under'
      }
    }),
    {
      name: 'onKeyEvent',
      type: 'FocusOnKeyEventCallback?',
      description: {
        ko: '트리거에 눌린 모든 키를 먼저 듣습니다. `KeyEventResult.handled`를 돌려주면 그 키를 가져갑니다',
        en: 'Hears every key pressed on the trigger first. Returning `KeyEventResult.handled` takes the key'
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
  ],

  MPTreeSelectItem: [
    {
      name: 'value',
      type: 'Object',
      required: true,
      description: {
        ko: '이 노드를 고르면 저장되는 값. `String`이나 `num`이고, 트리 전체에서 유일해야 합니다',
        en: 'What is stored when this node is chosen: a `String` or a `num`, unique across the whole tree'
      }
    },
    {
      name: 'label',
      type: WIDGET,
      required: true,
      description: {
        ko: '행이 보여 주는 것. 보통 `Text`입니다',
        en: 'What the row says, usually a `Text`'
      }
    },
    {
      name: 'searchLabel',
      type: 'String?',
      description: {
        ko: '검색이 비교하는 문자열. 빼면 `label`이 `Text`일 때 그 글자, 아니면 값을 씁니다',
        en: 'What a search matches against. Falls back to the words of `label` when it is a `Text`, then to the value'
      }
    },
    {
      name: 'startIcon',
      type: `${WIDGET}?`,
      description: {
        ko: '라벨 앞의 내용. 폴더, 국기 같은 것',
        en: 'Content before the label: a folder, a flag'
      }
    },
    {
      name: 'disabled',
      type: 'bool',
      default: 'false',
      description: {
        ko: '사용할 수 없음. 흐리게 그려지고 고를 수도 열 수도 없습니다',
        en: 'Unavailable: greyed out, and it can be neither chosen nor opened'
      }
    },
    {
      name: 'selectable',
      type: 'bool?',
      description: {
        ko: '이 노드 자체를 고를 수 있는지. 빼면 잎은 고를 수 있고, 자식이 있는 노드는 `selectableBranches`를 따릅니다',
        en: 'Whether this node may itself be chosen. Left out, a leaf may be and a node with children follows `selectableBranches`'
      }
    },
    {
      name: 'children',
      type: 'List<MPTreeSelectItem>?',
      description: { ko: '이 노드 아래의 노드들', en: 'The nodes under this one' }
    }
  ]
} satisfies Record<string, PropRow[]>;
