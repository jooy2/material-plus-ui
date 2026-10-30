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
  MPToolbar: [
    renamed('MPToolbar', 'children', 'child', { type: `${WIDGET}?` }),
    from('MPToolbar', 'start', {
      type: `${WIDGET}?`,
      description: {
        ko: '바 시작 쪽에 고정되는 것 — 로고, 제목, 뒤로 가기 버튼. 위젯 하나이므로 여럿은 `Row`로 묶어서 넘깁니다',
        en: 'Pinned to the start of the bar: a logo, a title, a back button. One widget, so several come in a `Row` of their own'
      }
    }),
    from('MPToolbar', 'end', {
      type: `${WIDGET}?`,
      description: {
        ko: '끝 쪽에 고정되는 것 — 액션들. 위젯 하나이므로 버튼 두 개는 `Row`로 묶어서 넘깁니다',
        en: 'Pinned to the end: the actions. One widget, so a pair of buttons comes in a `Row` of its own'
      }
    }),
    from('MPToolbar', 'side', {
      type: 'MPToolbarSide',
      default: 'MPToolbarSide.top',
      description: {
        ko: '바가 어느 쪽을 향하는지. 이 값으로 정해지는 것은 `divider`가 그어지는 가장자리 하나뿐입니다',
        en: 'Which way the bar faces, and the one thing that depends on it: which edge `divider` is drawn along'
      }
    }),
    {
      name: 'rounded',
      type: 'bool',
      default: 'true',
      description: {
        ko: '바가 모서리 있는 시트인지. 화면 가장자리에 붙인 바에서는 끄세요 — 화면 끝에 닿은 둥근 모서리는 뒤에 아무것도 없는 틈입니다. React는 같은 판단을 `position`으로 합니다',
        en: 'Whether the bar is a sheet with corners. Turn it off for a bar held against an edge of the screen: a rounded corner there is a gap with nothing behind it. React makes the same call from `position`'
      }
    },
    from('MPToolbar', 'divider', { type: 'bool', default: 'false' }),
    from('MPToolbar', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    elevationRow('MPToolbar'),
    sizeRow('MPToolbar'),
    densityRow('MPToolbar'),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '바에 따로 이름이 필요할 때 화면 낭독기가 읽는 이름',
        en: 'The name a screen reader gives the bar, when it needs one of its own'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
