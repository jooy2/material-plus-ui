import { COLOR, from, type PropRow } from './shared';

export default {
  MPTypography: [
    {
      name: 'data',
      type: 'String',
      required: true,
      description: {
        ko: '글자. 첫 번째 위치 인자로 받으며, 여러 스타일이 섞인 문단은 `MPTypography.rich`에 `InlineSpan`으로 넘깁니다',
        en: 'The text, as the first positional argument. A paragraph of mixed styles goes to `MPTypography.rich` as an `InlineSpan`'
      }
    },
    from('MPTypography', 'level', { type: 'MPTypographyLevel', default: 'MPTypographyLevel.body' }),
    from('MPTypography', 'color', { type: `${COLOR}?` }),
    from('MPTypography', 'weight', { type: 'MPTypographyWeight?' }),
    from('MPTypography', 'align', {
      type: 'TextAlign?',
      description: {
        ko: '글줄을 맞추는 방향. Flutter의 `TextAlign`을 그대로 받으며, 비우면 주변 `DefaultTextStyle`을 따릅니다',
        en: 'How the text is set against its measure, as Flutter’s own `TextAlign`. Left out, it follows the surrounding `DefaultTextStyle`'
      }
    }),
    from('MPTypography', 'lines', { type: 'int?' }),
    from('MPTypography', 'gutter', { type: 'bool', default: 'false' }),
    {
      name: 'headingLevel',
      type: 'int?',
      description: {
        ko: '제목으로 읽히는 단계, `1`부터 `6`까지. 비우면 `h1`–`h6`은 자기 단계로 읽히고 나머지는 제목이 아닙니다. React의 `render`로 요소를 바꾸던 자리입니다',
        en: 'The heading level it is announced at, `1` to `6`. Left out, `h1`–`h6` announce their own and the rest are not headings. Where React swaps the element with `render`'
      }
    },
    {
      name: 'semanticsLabel',
      type: 'String?',
      description: {
        ko: '화면 낭독기가 글자 대신 읽는 문장',
        en: 'What a screen reader says in place of the text'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
