import {
  colorRow,
  focusRows,
  from,
  renamed,
  sizeRow,
  VARIANT,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPChip: [
    renamed('MPChip', 'children', 'child', { type: `${WIDGET}?` }),
    {
      name: 'onPressed',
      type: 'VoidCallback?',
      description: {
        ko: '칩을 눌렀을 때 실행됩니다. 넘기면 칩이 버튼이 되어 포커스를 받고, 키보드의 Enter와 Space로도 눌립니다. React의 `onClick` 자리입니다',
        en: 'Runs when the chip is pressed. Passing it makes the chip a button that takes the focus and answers Enter and Space. React’s `onClick`'
      }
    },
    from('MPChip', 'onDelete', {
      type: 'VoidCallback?',
      description: {
        ko: '삭제 버튼을 눌렀을 때 실행됩니다. 넘겨야 × 버튼이 나타나며, 칩 본체와는 따로 포커스를 받습니다',
        en: 'Runs when the delete affordance is pressed. Passing it is what draws the ×, which takes the focus apart from the chip itself'
      }
    }),
    from('MPChip', 'deleteLabel', { type: 'String?' }),
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '삭제 버튼의 기본 이름을 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: 'Which language the delete button’s default name is in. Falls back to the nearest `MPLocaleProvider`, then the app’s `Localizations`, then English'
      }
    },
    from('MPChip', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    sizeRow('MPChip'),
    colorRow('MPChip'),
    from('MPChip', 'startIcon', { type: `${WIDGET}?` }),
    from('MPChip', 'endIcon', { type: `${WIDGET}?` }),
    from('MPChip', 'count', {
      type: `num | String | ${WIDGET}`,
      description: {
        ko: '칩 끝에 작은 판으로 붙는 숫자. 숫자, 글자, 위젯 중 하나이며 유니언 타입이 없어 `Object?`로 받습니다',
        en: 'A number set into the end of the chip on its own plate: a number, a word or a widget. Typed `Object?` because Dart has no union type'
      }
    }),
    from('MPChip', 'selected', { type: 'bool?' }),
    from('MPChip', 'disabled', { type: 'bool', default: 'false' }),
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
