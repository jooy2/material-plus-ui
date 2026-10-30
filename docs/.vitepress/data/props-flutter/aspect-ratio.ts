import { from, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPAspectRatio: [
    from('MPAspectRatio', 'ratio', {
      type: 'double',
      default: '1',
      description: {
        ko: '지킬 비율, 너비 나누기 높이입니다. `16 / 9`처럼 나눗셈으로 씁니다',
        en: 'The proportion, as width over height, written as the division: `16 / 9`'
      }
    }),
    from('MPAspectRatio', 'fit', {
      type: 'MPAspectFit?',
      default: 'null',
      description: {
        ko: '안의 내용을 상자에 맞추는 방식. React와 달리 기본값은 `null`이고, 주면 무엇이든 `FittedBox`로 맞춥니다. Flutter에는 이미지와 글 상자를 가르는 구분이 없어서, 기본으로 켜 두면 글 한 단락도 늘어나기 때문입니다',
        en: 'How the content is fitted to the box. `null` by default, unlike React, and when given it fits whatever the child is with a `FittedBox`: Flutter has no line between an image and a box of text, and a default fit would scale a paragraph'
      }
    }),
    from('MPAspectRatio', 'rounded', { type: 'bool', default: 'false' }),
    sizeRow('MPAspectRatio'),
    {
      name: 'child',
      type: `${WIDGET}?`,
      description: {
        ko: '비율이 담는 것. 상자 전체에 맞춰 배치됩니다',
        en: 'What the proportion holds, laid out to the full box'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
