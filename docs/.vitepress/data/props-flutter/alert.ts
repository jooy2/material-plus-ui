import {
  colorRow,
  densityRow,
  from,
  renamed,
  sizeRow,
  VARIANT,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPAlert: [
    from('MPAlert', 'variant', { type: VARIANT, default: 'MPVariant.tonal' }),
    colorRow('MPAlert'),
    sizeRow('MPAlert'),
    densityRow('MPAlert'),
    from('MPAlert', 'title', { type: `${WIDGET}?` }),
    from('MPAlert', 'icon', {
      type: `${WIDGET}?`,
      description: {
        ko: '앞쪽의 글리프. 비워 두면 `color`에 맞는 것이 그려집니다. error 계열은 오류 글리프, 나머지는 정보 글리프입니다. "잘 됐습니다"라는 얼럿은 색에서 추측하게 두지 말고 자기 아이콘으로 말합니다',
        en: 'The glyph at the start. Left out, the one that goes with `color`: the error mark for the error family and the informational one for the rest. An alert that means "this worked" says so with an icon of its own rather than having the library guess from a colour'
      }
    }),
    {
      name: 'showIcon',
      type: 'bool',
      default: 'true',
      description: {
        ko: '글리프를 그릴지. Dart에는 `null`도 위젯도 아닌 값이 없으므로, React의 `icon={false}`가 이 이름을 갖습니다',
        en: "Whether a glyph is drawn at all. Dart has no value that is neither `null` nor a widget, so React's `icon={false}` gets a name of its own"
      }
    },
    from('MPAlert', 'action', { type: `${WIDGET}?` }),
    {
      name: 'live',
      type: 'MPAlertLive?',
      description: {
        ko: '얼마나 크게 알릴지. 비워 두면 error 계열은 `assertive`, 나머지는 `polite`입니다. 화면이 만들어질 때부터 있던 얼럿에는 `off`를 줍니다. Flutter의 live region은 단계가 하나뿐이라 웹이 아닌 곳에서는 `assertive`도 polite로 읽힙니다',
        en: "How loudly it announces itself. Left out, `assertive` for the error family and `polite` for the rest; `off` for an alert that was on the screen before the reader was. Flutter's live region has one level, so off the web `assertive` is read politely too"
      }
    },
    from('MPAlert', 'onClose', {
      type: 'VoidCallback?',
      description: {
        ko: '넘기면 닫기 버튼이 나타납니다. ×를 누른 순간이 아니라 얼럿이 자기 높이를 다 접은 뒤, 약 200ms 후에 호출됩니다. 그때 얼럿을 트리에서 빼면 됩니다',
        en: 'Passing it is what makes the dismiss button appear. It fires once the alert has folded its height away, about 200ms after the press rather than on it, which is the moment to stop building it'
      }
    }),
    from('MPAlert', 'closeLabel', { type: 'String?' }),
    from('MPAlert', 'locale', {
      type: 'String?',
      description: {
        ko: '닫기 버튼의 기본 이름을 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: "Which language the dismiss button's default name is in. Falls back to the nearest `MPLocaleProvider`, then the app's `Localizations`, then English"
      }
    }),
    renamed('MPAlert', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
