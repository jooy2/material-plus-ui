import { colorRow, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPMenubar: [
    renamed('MPMenubar', 'children', 'menus', {
      type: 'List<MPMenubarMenu>',
      required: true,
      description: {
        ko: '바 위의 메뉴들. 바를 따라 놓이는 순서대로 적습니다',
        en: 'The menus, in order along the bar'
      }
    }),
    from('MPMenubar', 'orientation', {
      type: 'MPOrientation',
      default: 'MPOrientation.horizontal'
    }),
    from('MPMenubar', 'loopFocus', { type: 'bool', default: 'true' }),
    from('MPMenubar', 'disabled', { type: 'bool', default: 'false' }),
    sizeRow('MPMenubar'),
    colorRow('MPMenubar'),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '화면 낭독기가 바를 부르는 이름. React에서는 나머지 속성으로 넘기는 `aria-label`입니다',
        en: "The name a screen reader gives the bar. React's `aria-label`, passed through the rest props"
      }
    }
  ],
  MPMenubarMenu: [
    from('MPMenubarMenu', 'label', { type: 'String', required: true }),
    renamed('MPMenubarMenu', 'children', 'items', {
      type: 'List<MPMenuEntry>',
      required: true,
      description: {
        ko: '`MPMenu`의 `items`에 적는 것과 똑같이 적는 행들',
        en: "The rows, written exactly as they are in an `MPMenu`'s `items`"
      }
    }),
    from('MPMenubarMenu', 'startIcon', { type: `${WIDGET}?` }),
    from('MPMenubarMenu', 'disabled', { type: 'bool', default: 'false' })
  ]
} satisfies Record<string, PropRow[]>;
