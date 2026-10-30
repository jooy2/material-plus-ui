import { colorRow, from, sizeRow, VARIANT, WIDGET, type PropRow } from './shared';

export default {
  MPBlockquote: [
    {
      name: 'child',
      type: WIDGET,
      required: true,
      description: { ko: '인용한 말. 보통 `Text`입니다', en: 'What was said, usually a `Text`' }
    },
    from('MPBlockquote', 'variant', { type: VARIANT, default: 'MPVariant.text' }),
    sizeRow('MPBlockquote'),
    colorRow('MPBlockquote'),
    from('MPBlockquote', 'author', { type: `${WIDGET}?` }),
    from('MPBlockquote', 'source', { type: `${WIDGET}?` }),
    from('MPBlockquote', 'icon', {
      type: `${WIDGET} | false`,
      description: {
        ko: '인용문 앞의 표시. 비우면 기본 따옴표 글리프, 위젯은 그것을 대신하고, `false`는 지웁니다',
        en: 'The mark drawn before the quote. Left out it is the house glyph, a widget replaces it, and `false` takes it away'
      }
    })
  ]
} satisfies Record<string, PropRow[]>;
