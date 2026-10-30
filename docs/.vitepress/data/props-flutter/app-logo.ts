import {
  colorRow,
  focusRows,
  from,
  renamed,
  sizeRow,
  VARIANT,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPAppLogo: [
    renamed('MPAppLogo', 'children', 'child', { type: `${WIDGET}?` }),
    renamed('MPAppLogo', 'src', 'image', {
      type: 'ImageProvider?',
      description: {
        ko: '그림으로 된 로고. `child`가 있으면 그쪽이 이깁니다',
        en: 'The artwork, as a picture. Beaten by `child`'
      }
    }),
    renamed('MPAppLogo', 'alt', 'semanticLabel', {
      type: 'String?',
      description: {
        ko: '로고가 화면 낭독기에 말하는 것. React의 `alt` 자리이며 기본값은 `name`입니다',
        en: 'What the artwork says to a screen reader. React’s `alt`; defaults to `name`'
      }
    }),
    from('MPAppLogo', 'name', { type: 'String?' }),
    from('MPAppLogo', 'initials', { type: 'String?' }),
    from('MPAppLogo', 'showName', { type: 'bool', default: 'false' }),
    from('MPAppLogo', 'shape', { type: 'MPAppLogoShape', default: 'MPAppLogoShape.bare' }),
    from('MPAppLogo', 'variant', { type: VARIANT, default: 'MPVariant.filled' }),
    sizeRow('MPAppLogo'),
    colorRow('MPAppLogo'),
    from('MPAppLogo', 'padded', { type: 'bool', default: 'true' }),
    from('MPAppLogo', 'height', { type: 'double?' }),
    {
      name: 'onPressed',
      type: 'VoidCallback?',
      description: {
        ko: '로고 전체를 링크로 만듭니다. 포인터나 Enter로 따라가며, 첫 화면으로 돌아가는 일을 여기서 합니다',
        en: 'Makes the whole lockup a link, followed by pointer or Enter. Go back to the first screen here'
      }
    },
    from('MPAppLogo', 'href', {
      type: 'String?',
      description: {
        ko: '링크가 가는 주소. 로고가 직접 열지는 않고 보조 기술에 알려 줍니다',
        en: 'Where the link goes. Not opened by the logo itself: it is told to assistive technology'
      }
    }),
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
