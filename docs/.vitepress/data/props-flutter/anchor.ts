import { colorRow, densityRow, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPAnchor: [
    from('MPAnchor', 'items', {
      type: 'List<MPAnchorItem>',
      description: {
        ko: '제목들. 화면에 나타나는 순서대로 `MPAnchorItem(target:, label:, depth:)`을 넘깁니다. `target`은 제목 위젯에 단 `GlobalKey`이고, 그 키가 어디에도 달려 있지 않은 제목은 추적할 수 없습니다',
        en: 'The headings, in the order they appear on the screen, as `MPAnchorItem(target:, label:, depth:)`. `target` is a `GlobalKey` on the heading widget, and a heading the key is on nowhere cannot be tracked'
      }
    }),
    renamed('MPAnchor', 'activeHref', 'activeTarget', {
      type: 'GlobalKey?',
      description: {
        ko: '표시할 행을 `target`으로 지정합니다. 주면 목록은 스크롤을 지켜보지 않고 시키는 대로만 말합니다. `null`이면 스크롤을 따라갑니다',
        en: 'Which row is marked, by its `target`. Given, the list stops watching the scroll and says what it is told; `null` follows the scroll'
      }
    }),
    from('MPAnchor', 'onActiveChange', {
      type: 'ValueChanged<GlobalKey?>?',
      description: {
        ko: '독자가 있는 행이 바뀔 때마다 그 행의 `target`으로 호출됩니다. 첫 제목 위에서는 `null`입니다',
        en: "Called whenever the row the reader is in changes, with that row's `target`, or `null` above the first heading"
      }
    }),
    from('MPAnchor', 'offset', {
      type: 'double',
      description: {
        ko: '스크롤 뷰 위쪽에서 얼마나 내려가야 제목에 닿은 것으로 칠지, 논리 픽셀. 위에 고정된 바의 높이를 넣으세요. 그러지 않으면 바 뒤에 가려진 제목이 표시되는 일이 없습니다',
        en: 'How far below the top of the scroll view a heading counts as reached, in logical pixels. Set it to the height of whatever is pinned over the content, or the heading behind it is never the one marked'
      }
    }),
    renamed('MPAnchor', 'container', 'controller', {
      type: 'ScrollController?',
      description: {
        ko: '스크롤되는 것. 비워 두면 첫 제목이 들어 있는 스크롤 뷰를 스스로 찾아 따라가며, 대개 그것이 맞습니다',
        en: 'What scrolls. Left out, the list follows the scroll view its first heading sits in, which is nearly always the right one'
      }
    }),
    from('MPAnchor', 'rail', { type: 'bool' }),
    sizeRow('MPAnchor'),
    colorRow('MPAnchor'),
    densityRow('MPAnchor'),
    from('MPAnchor', 'locale', {
      type: 'String?',
      description: {
        ko: '목록의 기본 이름을 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: "Which language the list's default name is in. Falls back to the nearest `MPLocaleProvider`, then the app's `Localizations`, then English"
      }
    }),
    renamed('MPAnchor', 'label', 'semanticLabel', {
      type: 'String?',
      description: {
        ko: '화면 낭독기가 목록을 부르는 이름. 메뉴와 목차가 한 화면에 있으면 둘을 구분하는 것이 이 이름입니다',
        en: 'The name a screen reader gives the list. With a menu and a table of contents on one screen, this is what tells them apart'
      }
    })
  ],
  MPAnchorItem: [
    {
      name: 'target',
      type: 'GlobalKey',
      required: true,
      description: {
        ko: '이 항목이 가리키는 제목 위젯에 단 키. React의 `href` 자리입니다',
        en: "A key on the heading widget this entry points at. React's `href`"
      }
    },
    {
      name: 'label',
      type: WIDGET,
      required: true,
      description: { ko: '행에 쓰이는 내용', en: 'What the row says' }
    },
    {
      name: 'depth',
      type: 'int',
      default: '0',
      description: {
        ko: '제목의 깊이, `0`부터. 들여쓰기만 바뀌고 목록은 평평하게 남습니다',
        en: 'How deep the heading sits, from `0`. Only the indent changes; the list stays flat'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
