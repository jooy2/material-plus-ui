import {
  colorRow,
  focusRows,
  from,
  renamed,
  semanticLabelRow,
  sizeRow,
  VARIANT,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPButton: [
    {
      name: 'onPressed',
      type: 'VoidCallback?',
      required: true,
      description: {
        ko: '눌렀을 때 실행됩니다. 포인터로 누르든 키보드로 누르든 같습니다. `null`이면 버튼이 비활성화되며, 이는 Flutter의 관례입니다',
        en: "Runs when the button is pressed, by pointer or by keyboard. `null` disables the button, which is Flutter's own convention"
      }
    },
    from('MPButton', 'variant', { type: `${VARIANT}?`, default: 'MPVariant.filled' }),
    colorRow('MPButton'),
    sizeRow('MPButton'),
    renamed('MPButton', 'children', 'child', {
      type: `${WIDGET}?`,
      description: {
        ko: '라벨. 비워 두면 정사각형 아이콘 버튼이 되므로 `semanticLabel`을 주세요',
        en: 'The label. Left out the button goes square, so give it a `semanticLabel`'
      }
    }),
    from('MPButton', 'startIcon', { type: `${WIDGET}?` }),
    from('MPButton', 'endIcon', { type: `${WIDGET}?` }),
    from('MPButton', 'loading', { type: 'bool', default: 'false' }),
    from('MPButton', 'loadingLabel', { type: 'String?' }),
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '스피너의 기본 이름을 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: "Which language the spinner's default name is in. Falls back to the nearest `MPLocaleProvider`, then the app's `Localizations`, then English"
      }
    },
    from('MPButton', 'fullWidth', { type: 'bool', default: 'false' }),
    {
      name: 'disabled',
      type: 'bool?',
      description: {
        ko: '`onPressed`가 있어도 버튼을 비활성화합니다',
        en: 'Disables the button even though `onPressed` is set'
      }
    },
    {
      name: 'onLongPress',
      type: 'VoidCallback?',
      description: {
        ko: '길게 눌렀을 때 실행됩니다. 터치 화면에서 컨텍스트 메뉴에 해당합니다',
        en: 'Runs on a long press, the touch equivalent of a context menu'
      }
    },
    semanticLabelRow,
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
