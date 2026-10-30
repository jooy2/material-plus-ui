import { densityRow, from, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPCodeBlock: [
    from('MPCodeBlock', 'code', { type: 'String' }),
    from('MPCodeBlock', 'language', { type: 'String?' }),
    from('MPCodeBlock', 'theme', {
      type: 'MPCodeBlockTheme',
      default: 'MPCodeBlockTheme.auto',
      description: {
        ko: '팔레트. `auto`는 화면의 밝기를 따르고, `dark`와 `light`는 고정, `mono`는 색조 없이 화면의 중립 역할로 그립니다',
        en: "The palette. `auto` follows the screen's brightness, `dark` and `light` are pinned, and `mono` has no hue, drawn out of the screen's neutral roles"
      }
    }),
    {
      name: 'customTheme',
      type: 'MPCodeTheme?',
      description: {
        ko: '`theme` 대신 쓸 직접 만든 팔레트. 바탕, 잉크, 열두 슬롯의 색 열네 개이고, 나머지 다섯은 섞여 나옵니다',
        en: 'A palette of your own in place of `theme`: fourteen colours, the ground, the ink and the twelve slots; the other five are mixed from them'
      }
    },
    from('MPCodeBlock', 'highlight', {
      type: 'bool',
      default: 'true',
      description: {
        ko: '`highlighter`로 코드를 칠합니다. 끄거나 하이라이터가 없으면 테마의 잉크 한 가지로 그립니다',
        en: "Colours the code with `highlighter`. Off, or with no highlighter, the code is drawn in the theme's ink"
      }
    }),
    {
      name: 'highlighter',
      type: 'List<MPCodeLine>? Function(String code, String language)?',
      description: {
        ko: '코드와 정식 언어 이름을 받아 줄마다 `MPCodeToken` 목록을 돌려줍니다. 모르는 언어에는 `null`을 돌려주면 맨몸으로 그려집니다. 패키지에는 문법이 들어 있지 않습니다',
        en: 'Turns the code and its canonical language name into lines of `MPCodeToken`s; returns `null` for a language it does not know, which draws plain. The package carries no grammar of its own'
      }
    },
    from('MPCodeBlock', 'toolbar', { type: 'bool', default: 'true' }),
    from('MPCodeBlock', 'title', { type: `${WIDGET}?` }),
    from('MPCodeBlock', 'showLanguage', { type: 'bool', default: 'true' }),
    from('MPCodeBlock', 'copyable', { type: 'bool', default: 'true' }),
    from('MPCodeBlock', 'rawToggle', { type: 'bool', default: 'false' }),
    from('MPCodeBlock', 'markLines', {
      type: 'String?',
      description: {
        ko: "표시할 줄. `'4'`, `'4-9'`, `'1,4-9,12'`처럼 줄과 범위를 적은 문자열이고, gutter가 세는 방식으로 셉니다",
        en: "Lines to mark, as a string of lines and ranges — `'4'`, `'4-9'`, `'1,4-9,12'` — counted the way the gutter counts"
      }
    }),
    from('MPCodeBlock', 'lineNumbers', { type: 'bool', default: 'false' }),
    from('MPCodeBlock', 'startLine', { type: 'int', default: '1' }),
    from('MPCodeBlock', 'prompt', { type: 'String?' }),
    from('MPCodeBlock', 'wrap', { type: 'bool', default: 'false' }),
    from('MPCodeBlock', 'maxHeight', {
      type: 'double?',
      description: {
        ko: '안에서 스크롤되기 전까지 블록이 커질 수 있는 높이, 논리 픽셀 단위',
        en: 'How tall the block may get before the code scrolls inside it, in logical pixels'
      }
    }),
    from('MPCodeBlock', 'fontFamily', { type: 'String?' }),
    from('MPCodeBlock', 'fontSize', { type: 'double?' }),
    from('MPCodeBlock', 'lineHeight', {
      type: 'double?',
      description: {
        ko: '행간을 덮어씁니다. 글자 크기의 배수입니다',
        en: 'Overrides the leading, as a multiple of the font size'
      }
    }),
    from('MPCodeBlock', 'locale', { type: 'String?' }),
    from('MPCodeBlock', 'copyLabel', { type: 'String?' }),
    from('MPCodeBlock', 'copiedLabel', { type: 'String?' }),
    from('MPCodeBlock', 'rawLabel', { type: 'String?' }),
    from('MPCodeBlock', 'onCopy', { type: 'ValueChanged<String>?' }),
    sizeRow('MPCodeBlock'),
    densityRow('MPCodeBlock')
  ]
} satisfies Record<string, PropRow[]>;
