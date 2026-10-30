import { colorRow, focusRows, from, renamed, SIZE, WIDGET, type PropRow } from './shared';

export default {
  MPBreadcrumb: [
    {
      name: 'children',
      type: 'List<Widget>',
      required: true,
      description: {
        ko: '단계들, 보통 `MPBreadcrumbItem`. 각 단계는 자기가 마지막인지를 경로에게서 듣습니다',
        en: 'The steps, usually `MPBreadcrumbItem`s. Each learns from the trail whether it is the last one'
      }
    },
    {
      name: 'size',
      type: `${SIZE}?`,
      default: 'MPSize.md',
      description: {
        ko: '글자 크기. `xs`·`sm`은 `bodyMedium`, `md`부터는 `bodyLarge`입니다',
        en: 'The type scale: `bodyMedium` at `xs` and `sm`, `bodyLarge` from `md` up'
      }
    },
    colorRow('MPBreadcrumb'),
    from('MPBreadcrumb', 'separator', {
      type: 'Object',
      default: 'MPBreadcrumbSeparator.chevron',
      description: {
        ko: '단계 사이의 표시. `MPBreadcrumbSeparator`의 네 이름 중 하나나 아무 위젯입니다. Dart에 유니언 타입이 없어 `Object`로 받으며, 그 밖의 값은 디버그에서 assert에 걸립니다',
        en: 'The mark between two steps: one of the four `MPBreadcrumbSeparator` names, or any widget. Typed `Object` because Dart has no union type; anything else fails an assertion in debug'
      }
    }),
    from('MPBreadcrumb', 'maxItems', { type: 'int?' }),
    from('MPBreadcrumb', 'itemsBeforeCollapse', { type: 'int' }),
    from('MPBreadcrumb', 'itemsAfterCollapse', { type: 'int' }),
    from('MPBreadcrumb', 'expandable', { type: 'bool' }),
    renamed('MPBreadcrumb', 'label', 'semanticLabel', {
      type: 'String?',
      description: {
        ko: '화면 낭독기가 경로를 부르는 이름. 비워 두면 `locale`의 낱말입니다. 화면에 그려지지 않습니다',
        en: 'The name a screen reader gives the trail. Defaults to the word for it in `locale`. Never drawn'
      }
    }),
    from('MPBreadcrumb', 'expandLabel', { type: 'String?' }),
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '`semanticLabel`과 `expandLabel`의 기본 문구를 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: "Which language the default `semanticLabel` and `expandLabel` are in. Falls back to the nearest `MPLocaleProvider`, then the app's `Localizations`, then English"
      }
    }
  ],
  MPBreadcrumbItem: [
    renamed('MPBreadcrumbItem', 'onClick', 'onPressed', {
      type: 'VoidCallback?',
      description: {
        ko: '단계를 따라갈 때 호출됩니다. 앱의 라우터를 부르는 자리입니다. 비워 두면 단계는 그냥 글자입니다',
        en: "Called when the step is followed, which is where the app's router is called. Left out, the step is plain text"
      }
    }),
    from('MPBreadcrumbItem', 'startIcon', { type: `${WIDGET}?` }),
    from('MPBreadcrumbItem', 'endIcon', { type: `${WIDGET}?` }),
    from('MPBreadcrumbItem', 'current', { type: 'bool?' }),
    {
      name: 'disabled',
      type: 'bool',
      default: 'false',
      description: {
        ko: '사용할 수 없는 상태. 누름에 답하지 않지만 경로 안의 자리는 지킵니다',
        en: 'Unavailable. Stops answering, keeps its place in the trail'
      }
    },
    renamed('MPBreadcrumbItem', 'children', 'child', { type: `${WIDGET}?` }),
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
