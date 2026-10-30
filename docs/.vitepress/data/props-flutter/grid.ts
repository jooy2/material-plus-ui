import { from, renamed, WIDGET, type PropRow } from './shared';

const RESPONSIVE = {
  ko: '`MPResponsive(값, medium: …)`은 기본값에 창 크기 클래스별 덮어쓸 값을 더한 것이고, `MPResponsive.from(expanded: …)`은 바꾸는 클래스만 적어 그 아래는 기본값을 남깁니다',
  en: '`MPResponsive(value, medium: …)` is a value with overrides per window size class; `MPResponsive.from(expanded: …)` names only the classes it changes and leaves the ones below at the default'
};

export default {
  MPGrid: [
    renamed('MPGrid', 'children', 'children', {
      type: 'List<Widget>',
      required: true,
      description: {
        ko: '아이템들. `MPGridItem`은 자기가 차지할 열을 말하고, 그 밖의 위젯은 행 전체를 채웁니다. `MPGridItem`은 `Expanded`처럼 그리드의 직접 자식이어야 합니다',
        en: 'The items. An `MPGridItem` says how many columns it takes; anything else fills the row. An `MPGridItem` has to be a direct child, as an `Expanded` has to be of its `Row`'
      }
    }),
    from('MPGrid', 'columns', {
      type: 'MPResponsive<int>?',
      default: '12',
      description: {
        ko: `한 행을 몇 열로 나눌지. 안의 span과 offset은 모두 이 숫자를 기준으로 읽습니다. MD3 자신의 그리드는 \`MPResponsive<int>(4, medium: 12)\`입니다. ${RESPONSIVE.ko}`,
        en: `How many columns a row is divided into; every span and offset inside is read against it. MD3's own grid is \`MPResponsive<int>(4, medium: 12)\`. ${RESPONSIVE.en}`
      }
    }),
    from('MPGrid', 'spacing', {
      type: 'MPResponsive<double>?',
      default: '4',
      description: {
        ko: '아이템 사이 간격. Tailwind 간격 척도이므로 `4`는 16px이고 `1.5`는 6px입니다. MD3 자신의 간격은 `MPResponsive<double>(4, medium: 6)`입니다',
        en: "The gutter between items, on Tailwind's spacing scale: `4` is 16px and `1.5` is 6px. MD3's own gutter is `MPResponsive<double>(4, medium: 6)`"
      }
    }),
    from('MPGrid', 'rowSpacing', { type: 'MPResponsive<double>?' }),
    from('MPGrid', 'columnSpacing', { type: 'MPResponsive<double>?' }),
    from('MPGrid', 'justifyContent', { type: 'MPGridJustify?', default: 'MPGridJustify.start' }),
    from('MPGrid', 'alignItems', { type: 'MPGridAlign', default: 'MPGridAlign.stretch' }),
    from('MPGrid', 'alignContent', { type: 'MPGridAlignContent?' }),
    from('MPGrid', 'wrap', {
      type: 'bool',
      default: 'true',
      description: {
        ko: '열이 모자란 행을 다음 줄로 이어 갈지. 끄면 한 행이 되고, 그 행은 가로로 스크롤됩니다. 폭은 여전히 보이는 상자를 기준으로 계산합니다',
        en: 'Whether a row that runs out of columns continues on the next one. Turned off, the grid is one row that scrolls sideways, with the widths still worked out against the visible box'
      }
    })
  ],
  MPGridItem: [
    from('MPGridItem', 'span', {
      type: 'MPResponsive<MPGridSpan>?',
      description: {
        ko: '그리드의 열 중 몇 열을 차지할지. `MPGridSpan(6)`은 기본 12열의 절반이고, `MPGridSpan.grow`는 행에 남은 폭, `MPGridSpan.auto`는 안에 든 것의 폭입니다. 행보다 넓으면 행에 맞춰 잘립니다. 지정하지 않으면 행 전체를 채웁니다',
        en: "How many of the grid's columns the item takes. `MPGridSpan(6)` is half of the default twelve, `MPGridSpan.grow` the width the row has left, `MPGridSpan.auto` the width of what is inside. Clamped to the row; left out, the item fills it"
      }
    }),
    from('MPGridItem', 'offset', { type: 'MPResponsive<int>?', default: '0' }),
    from('MPGridItem', 'alignSelf', { type: 'MPGridAlignSelf?' }),
    renamed('MPGridItem', 'children', 'child', { type: WIDGET, required: true })
  ]
} satisfies Record<string, PropRow[]>;
