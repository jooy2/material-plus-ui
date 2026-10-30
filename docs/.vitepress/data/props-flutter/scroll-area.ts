import { from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPScrollArea: [
    sizeRow('MPScrollArea'),
    from('MPScrollArea', 'axis', { type: 'MPScrollAxis', default: 'MPScrollAxis.vertical' }),
    from('MPScrollArea', 'maxHeight', {
      type: 'double?',
      description: {
        ko: '스크롤을 시작하기 전까지 상자가 커질 수 있는 높이, 논리 픽셀입니다',
        en: 'How tall the box may get before it starts scrolling, in logical pixels'
      }
    }),
    from('MPScrollArea', 'height', { type: 'double?' }),
    from('MPScrollArea', 'persistent', { type: 'bool', default: 'false' }),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '상자가 포커스를 받을 때 읽히는 이름. 스크롤할 수 있어서 키보드가 닿는 상자는 이름이 없으면 아무것도 아닌 것으로 알려지므로 줄 만합니다',
        en: 'The name the box is announced by when it takes the focus. Worth giving: a box the keyboard reaches because it scrolls is otherwise announced as nothing at all'
      }
    },
    renamed('MPScrollArea', 'children', 'child', { type: WIDGET, required: true })
  ]
} satisfies Record<string, PropRow[]>;
