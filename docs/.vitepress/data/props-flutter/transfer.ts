import { colorRow, from, renamed, sizeRow, VARIANT, WIDGET, type PropRow } from './shared';

export default {
  MPTransfer: [
    from('MPTransfer', 'items', {
      type: 'List<MPTransferItem>',
      description: {
        ko: '모든 행. `MPTransferItem(value:, label:, disabled:)`의 리스트이고, 두 목록 모두 이 순서로 그립니다',
        en: 'Every row, as `MPTransferItem(value:, label:, disabled:)`, in the order both lists draw them'
      }
    }),
    from('MPTransfer', 'value', {
      type: 'List<String>?',
      description: {
        ko: '고른 쪽에 있는 값들. 주면 controlled이고, 빼면 직접 들고 `initialValue`에서 시작합니다',
        en: 'The values on the chosen side. Given, the transfer is controlled; left out, it keeps its own, starting at `initialValue`'
      }
    }),
    renamed('MPTransfer', 'defaultValue', 'initialValue', {
      type: 'List<String>',
      default: 'const []'
    }),
    renamed('MPTransfer', 'onValueChange', 'onChanged', { type: 'ValueChanged<List<String>>?' }),
    from('MPTransfer', 'sourceLabel', { type: `${WIDGET}?` }),
    from('MPTransfer', 'targetLabel', { type: `${WIDGET}?` }),
    from('MPTransfer', 'searchable', { type: 'bool', default: 'false' }),
    from('MPTransfer', 'height', {
      type: 'double',
      default: '220',
      description: {
        ko: '각 목록의 높이(논리 픽셀). 두 목록은 어느 쪽이 더 긴지와 무관하게 같은 높이입니다',
        en: 'How tall each list is, in logical pixels. Both are the same height whichever side is longer'
      }
    }),
    from('MPTransfer', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    sizeRow('MPTransfer'),
    colorRow('MPTransfer'),
    from('MPTransfer', 'disabled', { type: 'bool', default: 'false' }),
    from('MPTransfer', 'locale', { type: 'String?' }),
    from('MPTransfer', 'labels', {
      type: 'Map<String, String>?',
      description: {
        ko: '단어 자체에 대한 덮어쓰기. 키는 `source`, `target`, `toTarget`, `toSource`, `search`, `empty`, `moved`입니다. 번역보다 우선하고, 지정하지 않은 나머지는 번역된 채로 남습니다',
        en: 'Overrides for the words themselves, by key: `source`, `target`, `toTarget`, `toSource`, `search`, `empty`, `moved`. They win over the translation, and anything not named stays translated'
      }
    })
  ]
} satisfies Record<string, PropRow[]>;
