import {
  densityRow,
  elevationRow,
  from,
  renamed,
  sizeRow,
  VARIANT,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPCard: [
    from('MPCard', 'title', {
      type: `${WIDGET}?`,
      description: {
        ko: '카드의 제목. 시트의 제목 역할로 그려지며, `headingLevel`을 주지 않으면 제목으로 읽히지 않습니다',
        en: "The card's heading, set in the sheet's title role. Not announced as a heading unless `headingLevel` is given"
      }
    }),
    {
      name: 'headingLevel',
      type: 'int?',
      description: {
        ko: '제목이 화면 개요에서 몇 단계인지, `1`부터 `6`까지. React에서 `title`에 제목 엘리먼트를 넘기는 자리입니다',
        en: "The title's depth in the screen's outline, `1` to `6`. Where React takes a heading element in `title`"
      }
    },
    from('MPCard', 'subtitle', { type: `${WIDGET}?` }),
    from('MPCard', 'headerAction', { type: `${WIDGET}?` }),
    from('MPCard', 'media', { type: `${WIDGET}?` }),
    from('MPCard', 'footer', {
      type: `${WIDGET}?`,
      description: {
        ko: '아래 영역. 8px 간격의 줄바꿈되는 행 안에 놓입니다. 위젯 하나이므로 버튼 두 개는 `Wrap`이나 `Row`로 묶어서 넘깁니다',
        en: 'The bottom area, placed in a wrapping row with an 8px gap. One widget, so a pair of buttons comes in a `Wrap` or `Row` of its own'
      }
    }),
    from('MPCard', 'dividers', { type: 'bool', default: 'false' }),
    from('MPCard', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    elevationRow('MPCard'),
    sizeRow('MPCard'),
    densityRow('MPCard'),
    renamed('MPCard', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
