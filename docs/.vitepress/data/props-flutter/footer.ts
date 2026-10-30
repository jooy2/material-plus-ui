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
  MPFooter: [
    from('MPFooter', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    elevationRow('MPFooter'),
    sizeRow('MPFooter'),
    densityRow('MPFooter'),
    from('MPFooter', 'maxWidth', {
      type: 'MPResponsive<MPMeasure>?',
      default: 'null',
      description: {
        ko: '시트는 창 전체를 덮은 채로 내용만 본문 폭에 묶고 가운데에 둡니다. `MPContainer`의 `maxWidth`와 같은 매개변수입니다. `null`은 한도가 없다는 뜻입니다',
        en: "Holds the content to a measure and centres it while the sheet still spans the window. The same parameter as `MPContainer`'s `maxWidth`. `null` is no limit"
      }
    }),
    from('MPFooter', 'padded', { type: 'bool', default: 'true' }),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '영역을 알리는 이름. 한 화면에 푸터가 둘일 때, 곧 기사 자신의 푸터와 사이트의 푸터가 함께 있을 때 줄 만합니다. React의 `label` 자리입니다',
        en: "The name the region is announced by. Worth giving when a screen has two footers, an article's own and the site's. React's `label`"
      }
    },
    renamed('MPFooter', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
