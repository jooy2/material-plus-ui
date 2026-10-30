import { from, type PropRow } from './shared';

export default {
  MPHighlight: [
    {
      name: 'text',
      type: 'String',
      required: true,
      description: {
        ko: '찾을 대상이 되는 글. 첫 번째 위치 인자로 받습니다',
        en: 'The text to search, as the first positional argument'
      }
    },
    from('MPHighlight', 'query', {
      type: 'String | List<String> | RegExp',
      description: {
        ko: '찾을 것. 문자열은 낱말 하나, 목록은 여러 낱말이며 긴 것부터 맞춥니다. 문자열은 이스케이프되고, `RegExp`는 쓴 그대로 쓰므로 `caseSensitive`와 `wholeWord`를 무시합니다',
        en: 'What to find. A string is one term and a list several, tried longest first. Strings are escaped; a `RegExp` is used as written, and `caseSensitive` and `wholeWord` are ignored for it'
      }
    }),
    from('MPHighlight', 'variant', {
      type: 'MPHighlightVariant',
      default: 'MPHighlightVariant.tonal'
    }),
    from('MPHighlight', 'color', { type: 'MPColor', default: 'MPColor.tertiary' }),
    from('MPHighlight', 'caseSensitive', { type: 'bool', default: 'false' }),
    from('MPHighlight', 'wholeWord', { type: 'bool', default: 'false' }),
    from('MPHighlight', 'underline', { type: 'bool', default: 'false' }),
    from('MPHighlight', 'weight', { type: 'MPTypographyWeight?' }),
    {
      name: 'style',
      type: 'TextStyle?',
      description: {
        ko: '글의 스타일. 주변 `DefaultTextStyle` 위에 합쳐집니다',
        en: 'The text’s style, merged over the surrounding `DefaultTextStyle`'
      }
    },
    {
      name: 'align',
      type: 'TextAlign?',
      description: { ko: '글줄을 맞추는 방향', en: 'How the text is set against its measure' }
    },
    {
      name: 'lines',
      type: 'int?',
      description: {
        ko: '이 줄 수에서 말줄임표로 자릅니다',
        en: 'Cuts the text at this many lines with an ellipsis'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
