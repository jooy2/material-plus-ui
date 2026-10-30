import { from, renamed, sizeRow, VARIANT, WIDGET, type PropRow } from './shared';

export default {
  MPBadge: [
    from('MPBadge', 'content', {
      type: `num | String | ${WIDGET}`,
      description: {
        ko: '배지가 말하는 것. 숫자, 글자, 위젯 중 하나이며 비우면 숨습니다. 유니언 타입이 없어 `Object?`로 받고, `max`와 `showZero`는 숫자에만 적용됩니다',
        en: 'What the badge says: a number, a word or a widget, and hidden when left out. Typed `Object?` because Dart has no union type; `max` and `showZero` apply to a number only'
      }
    }),
    from('MPBadge', 'max', { type: 'int', default: '99' }),
    from('MPBadge', 'dot', { type: 'bool', default: 'false' }),
    from('MPBadge', 'showZero', { type: 'bool', default: 'false' }),
    from('MPBadge', 'invisible', { type: 'bool', default: 'false' }),
    from('MPBadge', 'placement', { type: 'MPCorner', default: 'MPCorner.topEnd' }),
    from('MPBadge', 'overlap', { type: 'MPBadgeOverlap', default: 'MPBadgeOverlap.square' }),
    from('MPBadge', 'variant', { type: VARIANT, default: 'MPVariant.filled' }),
    sizeRow('MPBadge'),
    from('MPBadge', 'color', {
      type: 'MPColor',
      default: 'MPColor.error',
      description: {
        ko: '마커의 강조 계열. MD3가 배지에 주는 색이 `error` 한 쌍뿐이라 기본값이 `error`이며, `MPConfigProvider`의 색도 닿지 않습니다',
        en: 'Which accent family the marker reads. `error` by default, because MD3 gives a badge that one colour pair, and an `MPConfigProvider` colour does not reach it'
      }
    }),
    from('MPBadge', 'label', { type: 'String?' }),
    renamed('MPBadge', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
