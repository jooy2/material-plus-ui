import { COLOR, from, renamed, SIZE, WIDGET, type PropRow } from './shared';

export default {
  MPDivider: [
    from('MPDivider', 'orientation', {
      type: 'MPOrientation',
      default: 'MPOrientation.horizontal'
    }),
    from('MPDivider', 'color', { type: `${COLOR}?` }),
    {
      name: 'size',
      type: `${SIZE}?`,
      default: 'MPSize.md',
      description: {
        ko: '라벨의 글자 크기. 구분선에서 크기가 있는 것은 라벨뿐입니다',
        en: 'Type scale of the label. Nothing else on a divider has a size'
      }
    },
    from('MPDivider', 'length', {
      type: 'double?',
      description: {
        ko: '선이 뻗는 길이. 가로 구분선이면 너비, 세로 구분선이면 높이입니다. 비우면 주어진 길이를 끝까지 채웁니다',
        en: 'How far the rule runs: the width of a horizontal divider, the height of a vertical one. Left out, it runs the length it is given'
      }
    }),
    from('MPDivider', 'thickness', { type: 'double', default: '1' }),
    from('MPDivider', 'textAlign', { type: 'MPAlign', default: 'MPAlign.center' }),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '화면 낭독기가 읽는 구분선의 이름. 비우면 라벨이 `Text`일 때 그 글자를 쓰고, 이름이 없는 구분선은 장식으로 보고 의미 트리에서 뺍니다',
        en: 'The divider’s name for a screen reader. Defaults to the label when it is a `Text`; a divider with neither is decoration and is left out of the semantics tree'
      }
    },
    renamed('MPDivider', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
