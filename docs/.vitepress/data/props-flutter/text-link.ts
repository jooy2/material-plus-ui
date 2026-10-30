import { COLOR, focusRows, from, SIZE, WIDGET, type PropRow } from './shared';

export default {
  MPTextLink: [
    {
      name: 'child',
      type: WIDGET,
      required: true,
      description: { ko: '라벨. 보통 `Text`입니다', en: 'The label, usually a `Text`' }
    },
    {
      name: 'onPressed',
      type: 'VoidCallback?',
      description: {
        ko: '링크를 따라갈 때 실행됩니다. 포인터나 Enter로 눌리며, 라우트를 올리거나 `url_launcher`에 주소를 넘기는 일을 여기서 합니다',
        en: 'Runs when the link is followed, by pointer or Enter. Push a route or hand the address to `url_launcher` here'
      }
    },
    from('MPTextLink', 'href', {
      type: 'String?',
      description: {
        ko: '링크가 가는 주소. 링크가 직접 열지는 않고 보조 기술에 알려 주며, 웹에서는 화면 낭독기용으로 그리는 링크에 들어갑니다',
        en: 'Where the link goes. Not opened by the link itself: it is told to assistive technology, and on the web it is written into the link the engine renders for a screen reader'
      }
    }),
    from('MPTextLink', 'underline', {
      type: 'MPTextLinkUnderline',
      default: 'MPTextLinkUnderline.always'
    }),
    from('MPTextLink', 'color', { type: `${COLOR}?` }),
    from('MPTextLink', 'size', { type: `${SIZE}?` }),
    from('MPTextLink', 'newTab', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '앱을 떠나거나 새 창을 여는 링크라고 표시합니다. 상자에서 나가는 화살표를 그리고 화면 낭독기에도 알리지만, 여는 일은 `onPressed`가 합니다',
        en: 'Marks the link as one that leaves the app or opens a new window: draws the arrow leaving its box and tells a screen reader. Opening it is still `onPressed`’s job'
      }
    }),
    from('MPTextLink', 'icon', {
      type: `bool | ${WIDGET}`,
      description: {
        ko: '라벨 뒤의 표시. `true`는 `newTab`이면 나가는 화살표, 아니면 사슬을 그리고, `false`는 아무것도 그리지 않으며, 위젯은 글리프를 대신합니다. 비우면 `newTab`을 따릅니다',
        en: 'The mark after the label. `true` draws the arrow leaving its box when `newTab` is on and the chain otherwise, `false` draws nothing, and a widget replaces the glyph. Left out, it follows `newTab`'
      }
    }),
    from('MPTextLink', 'newTabLabel', { type: 'String?' }),
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '`newTabLabel`의 기본 문구를 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: 'Which language the default `newTabLabel` is in. Falls back to the nearest `MPLocaleProvider`, then the app’s `Localizations`, then English'
      }
    },
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
