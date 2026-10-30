import { from, WIDGET, type PropRow } from './shared';

export default {
  MPIcon: [
    from('MPIcon', 'icon', {
      type: `IconData | ${WIDGET}`,
      description: {
        ko: '그릴 글리프. 아이콘 폰트의 `IconData`나 직접 만든 위젯을 받습니다. Dart에는 유니언 타입이 없어 `Object`로 받고, 둘 다 아니면 디버그에서 assert로 막습니다',
        en: 'The glyph to draw: an `IconData` from an icon font, or a widget of your own. Typed `Object` because Dart has no union type; anything else fails an assertion in debug'
      }
    }),
    from('MPIcon', 'size', {
      type: 'double?',
      description: {
        ko: '글리프를 그리는 상자의 크기(논리 픽셀). 비워 두면 주변 `IconTheme`의 크기를 따르고, 아무것도 없으면 24입니다',
        en: 'The box the glyph is drawn in, in logical pixels. Left unset it follows the surrounding `IconTheme`, 24 for a bare one'
      }
    }),
    from('MPIcon', 'color', {
      type: 'Color?',
      description: {
        ko: '글리프의 색. 비워 두면 놓인 자리의 색(`IconTheme`, `DefaultTextStyle`)을 이어받습니다',
        en: 'The glyph’s colour. Left unset it takes the colour of whatever it sits in, through `IconTheme` and `DefaultTextStyle`'
      }
    }),
    from('MPIcon', 'label', { type: 'String?' })
  ]
} satisfies Record<string, PropRow[]>;
