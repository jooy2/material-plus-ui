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
    renamed('MPConfigProvider', 'dir', 'textDirection', {
      type: 'TextDirection?',
      description: {
        ko: '아래 서브트리의 텍스트 방향. 주면 `Directionality`로 감싸고, 주지 않으면 주변의 방향을 그대로 씁니다',
        en: 'Which way the text runs under it. Given, it puts a `Directionality` round the subtree; left out, the ambient direction stays in charge'
      }
    }),
    {
      name: 'reserveSupportingText',
      type: 'bool?',
      description: {
        ko: '설명이나 오류가 아직 없어도 모든 필드 아래에 한 줄을 남겨 둡니다. 나중에 도착한 오류가 아래 내용을 밀어내지 않습니다',
        en: 'Keeps a line under every field for its description or error whether or not there is one yet, so an error that arrives later does not push what is below it down'
      }
    },
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
