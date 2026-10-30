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

const measure: Partial<PropRow> = {
  type: 'MPResponsive<MPMeasure>?',
  default: 'null',
  description: {
    ko: '시트는 창 전체를 덮은 채로, 슬롯이 놓인 행만 본문 폭에 묶고 가운데에 둡니다. `MPContainer`의 `maxWidth`와 같은 매개변수이므로 같은 값을 주면 둘이 한 선에 맞습니다. `null`은 한도가 없다는 뜻입니다',
    en: "Holds the row of slots to a measure and centres it while the sheet still spans the window. The same parameter as `MPContainer`'s `maxWidth`, so the two line up by being given the same value. `null` is no limit"
  }
};

const semanticLabel: PropRow = {
  name: 'semanticLabel',
  type: 'String?',
  description: {
    ko: '바를 알리는 이름. 주면 이름 있는 랜드마크 영역이 됩니다. Flutter에는 `banner` 역할이 없으므로 이름이 없으면 아무 역할도 주장하지 않습니다. React의 `label` 자리입니다',
    en: "The name the bar is announced by, which makes it a named landmark region. Flutter has no `banner` role, so without a name it claims none. React's `label`"
  }
};

export default {
  MPHeader: [
    from('MPHeader', 'brand', {
      type: 'List<Widget>?',
      description: {
        ko: '앞쪽 슬롯: 로고, 제품 이름, 좁은 창에서는 그 앞의 `MPSidebarTrigger`. 슬롯 간격으로 한 줄에 놓이고, 바의 제목 역할 글꼴로 씁니다',
        en: "The leading slot: the mark, the product's name, and on a narrow window the `MPSidebarTrigger` ahead of it. Laid out in a row with the slot's gap, in the bar's headline role"
      }
    }),
    from('MPHeader', 'actions', {
      type: 'List<Widget>?',
      description: {
        ko: '뒤쪽 슬롯: 계정 메뉴, 테마 전환, 행동 유도 버튼. 끝에 맞춰 슬롯 간격으로 한 줄에 놓입니다',
        en: "The trailing slot: the account menu, the theme switch, the call to action. Laid out end-aligned in a row with the slot's gap"
      }
    }),
    from('MPHeader', 'align', { type: 'MPAlign', default: 'MPAlign.start' }),
    from('MPHeader', 'variant', { type: VARIANT, default: 'MPVariant.tonal' }),
    elevationRow('MPHeader'),
    sizeRow('MPHeader'),
    densityRow('MPHeader'),
    from('MPHeader', 'maxWidth', measure),
    from('MPHeader', 'padded', { type: 'bool', default: 'true' }),
    semanticLabel,
    renamed('MPHeader', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
