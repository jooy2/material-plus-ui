import { colorRow, focusRows, from, sizeRow, VARIANT, WIDGET, type PropRow } from './shared';

export default {
  MPIconButton: [
    from('MPIconButton', 'icon', { type: WIDGET, required: true }),
    from('MPIconButton', 'label', { type: 'String', required: true }),
    {
      name: 'onPressed',
      type: 'VoidCallback?',
      required: true,
      description: {
        ko: '눌렀을 때 실행됩니다. `null`이면 버튼이 비활성화되며, 이는 Flutter의 관례입니다. React의 `onClick` 자리입니다',
        en: "Runs when the button is pressed. `null` disables it, which is Flutter's own convention. React's `onClick`"
      }
    },
    from('MPIconButton', 'variant', { type: `${VARIANT}?`, default: 'MPVariant.text' }),
    colorRow('MPIconButton'),
    sizeRow('MPIconButton'),
    from('MPIconButton', 'loading', { type: 'bool', default: 'false' }),
    from('MPIconButton', 'loadingLabel', { type: 'String?' }),
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '스피너의 기본 이름을 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: "Which language the spinner's default name is in. Falls back to the nearest `MPLocaleProvider`, then the app's `Localizations`, then English"
      }
    },
    from('MPIconButton', 'disabled', { type: 'bool?' }),
    {
      name: 'onLongPress',
      type: 'VoidCallback?',
      description: {
        ko: '길게 눌렀을 때 실행됩니다',
        en: 'Runs on a long press'
      }
    },
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
