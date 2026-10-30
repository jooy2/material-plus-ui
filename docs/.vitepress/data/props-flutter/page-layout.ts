import { from, renamed, WIDGET, type PropRow } from './shared';

const OPEN_CHANGE = 'ValueChanged<bool>?';

export default {
  MPPageLayout: [
    renamed('MPPageLayout', 'children', 'child', {
      type: `${WIDGET}?`,
      description: {
        ko: '화면. 바와 열이 남긴 자리를 받아 주 영역 안에 들어갑니다. 스크롤 뷰로 감싸지 않으므로, 무엇이 어느 방향으로 스크롤할지는 여기에 넣는 위젯이 정합니다',
        en: 'The screen, in the main region, given whatever the bars and the columns leave. It is not wrapped in a scroll view: what scrolls, and which way, belongs to whatever is put here'
      }
    }),
    from('MPPageLayout', 'header', { type: `${WIDGET}?` }),
    from('MPPageLayout', 'footer', { type: `${WIDGET}?` }),
    from('MPPageLayout', 'sidebar', { type: `${WIDGET}?` }),
    from('MPPageLayout', 'endSidebar', { type: `${WIDGET}?` }),
    from('MPPageLayout', 'headerSpan', { type: 'MPPageSpan', default: 'MPPageSpan.full' }),
    from('MPPageLayout', 'footerSpan', { type: 'MPPageSpan', default: 'MPPageSpan.full' }),
    from('MPPageLayout', 'collapseBelow', {
      type: 'MPPageCollapse',
      default: 'MPPageCollapse.expanded',
      description: {
        ko: '사이드바가 열이기를 그만두고 서랍이 되는 윈도우 크기 클래스. 기본값 `expanded`는 MD3의 답 그대로입니다. 비교하는 폭은 창이 아니라 이 레이아웃이 받은 폭이고, 경계는 `MPConfigProvider`가 정한 곳입니다. `MPPageCollapse.none`은 어느 폭에서도 열로 남깁니다',
        en: "The window size class below which the sidebars stop being columns and become drawers. `expanded` is MD3's own answer. The width compared is the one this layout was given rather than the window's, against the boundaries an `MPConfigProvider` sets. `MPPageCollapse.none` keeps them columns at every width"
      }
    }),
    from('MPPageLayout', 'sidebarOpen', { type: 'bool?' }),
    renamed('MPPageLayout', 'defaultSidebarOpen', 'initialSidebarOpen', {
      type: 'bool',
      default: 'false'
    }),
    from('MPPageLayout', 'onSidebarOpenChange', { type: OPEN_CHANGE }),
    from('MPPageLayout', 'endSidebarOpen', { type: 'bool?' }),
    renamed('MPPageLayout', 'defaultEndSidebarOpen', 'initialEndSidebarOpen', {
      type: 'bool',
      default: 'false'
    }),
    from('MPPageLayout', 'onEndSidebarOpenChange', { type: OPEN_CHANGE }),
    from('MPPageLayout', 'skipLink', {
      type: 'bool',
      default: 'true',
      description: {
        ko: '"본문으로 건너뛰기" 버튼을 포커스 순서의 맨 앞에 두고, 키보드가 잡은 동안에만 그립니다. 누르면 포커스가 주 영역으로 옮겨 가서 다음 Tab이 그 안의 첫 정지점에 닿습니다. 다른 레이아웃 안의 레이아웃은 그리지 않습니다',
        en: 'Puts a "Skip to content" button first in the focus order, drawn only while the keyboard holds it. Pressing it moves the focus to the main region, so the next Tab lands on the first stop inside it. A layout inside another draws none'
      }
    }),
    from('MPPageLayout', 'skipLabel', { type: 'String?' }),
    {
      name: 'mainSemanticLabel',
      type: 'String?',
      description: {
        ko: '화면 낭독기가 주 영역에 붙이는 이름. React의 `mainProps`로 넘기는 `aria-label` 자리입니다. 레이아웃 둘을 나란히 두면 주 영역도 둘이 되고, Flutter는 그 각각에 이름을 요구합니다',
        en: 'The name a screen reader gives the main region, where React passes an `aria-label` through `mainProps`. Two layouts side by side are two main regions, and Flutter asks for a name on each'
      }
    },
    from('MPPageLayout', 'locale', {
      type: 'String?',
      description: {
        ko: '레이아웃이 자기 단어를 말할 언어. 가장 가까운 `MPLocaleProvider`, 앱의 로캘, 영어 순으로 내려갑니다. 안의 모든 사이드바와 트리거가 물려받으므로 화면당 한 번만 씁니다',
        en: "Which language the layout's own words are in. Falls back to the nearest `MPLocaleProvider`, then the app's locale, then English. Every sidebar and trigger inside inherits it, so it is written once per screen"
      }
    })
  ]
} satisfies Record<string, PropRow[]>;
