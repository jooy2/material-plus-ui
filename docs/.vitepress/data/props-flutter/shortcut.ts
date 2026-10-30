import { COLOR, from, sizeRow, VARIANT, WIDGET, type PropRow } from './shared';

export default {
  MPShortcut: [
    from('MPShortcut', 'keys', {
      type: 'String | List<String>',
      description: {
        ko: '키들. 문자열은 `+`로 나누고, 키 자체가 `+`인 단축키는 목록으로 넘깁니다. 유니언 타입이 없어 `Object`로 받습니다',
        en: 'The keys. A string is split on `+`; a shortcut whose key is a plus is passed as a list. Typed `Object` because Dart has no union type'
      }
    }),
    from('MPShortcut', 'os', { type: 'MPShortcutOS', default: 'MPShortcutOS.auto' }),
    from('MPShortcut', 'separator', { type: `${WIDGET}?` }),
    from('MPShortcut', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    sizeRow('MPShortcut'),
    {
      name: 'color',
      type: COLOR,
      default: 'MPColor.secondary',
      description: {
        ko: '`filled`와 `tonal` 키캡이 쓰는 강조 계열',
        en: 'Which accent family a filled or tonal cap reads'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
