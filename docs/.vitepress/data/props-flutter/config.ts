import { COLOR, DENSITY, from, renamed, SIZE, WIDGET, type PropRow } from './shared';

export default {
  MPConfigProvider: [
    from('MPConfigProvider', 'size', { type: `${SIZE}?` }),
    from('MPConfigProvider', 'color', { type: `${COLOR}?` }),
    from('MPConfigProvider', 'density', { type: `${DENSITY}?` }),
    from('MPConfigProvider', 'breakpoints', {
      type: 'Map<MPWindowClass, double>?',
      description: {
        ko: '윈도우 크기 클래스가 시작하는 지점(논리 픽셀). MD3의 값 위에 부분적으로 덮어씁니다. Flutter에서는 그리드, `MPShow`, 사이드바를 포함해 모든 것이 이 값을 따릅니다',
        en: 'Where the window size classes begin, in logical pixels, merged over MD3’s own. In Flutter everything follows it, the grid, `MPShow` and the sidebar included'
      }
    }),
    from('MPConfigProvider', 'locale', { type: 'String?' }),
    from('MPConfigProvider', 'labels', {
      type: 'Map<String, Map<String, String>>?',
      description: {
        ko: "라이브러리가 스스로 하는 말을 네임스페이스와 키별로 바꿉니다. 예: `{'alert': {'dismiss': '숨기기'}}`. 등록된 번역 위에 덮이고, 적지 않은 말은 그대로 남습니다. 컴포넌트 자신의 `labels`가 이기고, 중첩된 프로바이더는 말 하나 단위로 병합됩니다",
        en: "The words the library says on its own behalf, by namespace and key, over the registered translation: `{'alert': {'dismiss': 'Hide'}}`. Whatever is not named stays as it was. A component's own `labels` wins, and nested providers merge a word at a time"
      }
    }),
    from('MPConfigProvider', 'floatingLabel', { type: 'bool?' }),
    from('MPConfigProvider', 'weekStartsOn', {
      type: 'MPWeekday?',
      description: {
        ko: '아래의 모든 달력과 날짜 피커에서 주가 시작하는 요일. 주지 않으면 각자 날짜 이름 표에 묻고, 컴포넌트 자신의 `weekStartsOn`이 이깁니다',
        en: "Which day the weeks start on in every calendar and date picker under this. Left out, each one asks its date names, and a component's own `weekStartsOn` wins"
      }
    }),
    renamed('MPConfigProvider', 'dir', 'textDirection', {
      type: 'TextDirection?',
      description: {
        ko: '아래 서브트리의 텍스트 방향. 주면 `Directionality`로 감싸고, 주지 않으면 주변의 방향을 그대로 씁니다',
        en: 'Which way the text runs under it. Given, it puts a `Directionality` round the subtree; left out, the ambient direction stays in charge'
      }
    }),
    from('MPConfigProvider', 'reserveSupportingText', { type: 'bool?' }),
    renamed('MPConfigProvider', 'children', 'child', { type: WIDGET, required: true })
  ],
  MPLocaleProvider: [
    from('MPLocaleProvider', 'locale', {
      type: 'String',
      required: true,
      description: {
        ko: '아래 컴포넌트가 쓰는 언어의 BCP 47 태그. 컴포넌트 자체의 `locale`이 이기고, 프로바이더가 없으면 앱의 `Localizations`, 그다음 영어를 따릅니다',
        en: 'The BCP 47 tag of the language the components under it speak. A component’s own `locale` wins, and with no provider they follow the app’s `Localizations`, then English'
      }
    }),
    renamed('MPLocaleProvider', 'children', 'child', { type: WIDGET, required: true })
  ]
} satisfies Record<string, PropRow[]>;
