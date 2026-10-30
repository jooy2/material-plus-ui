import { COLOR, focusRows, from, renamed, sizeRow, VARIANT, WIDGET, type PropRow } from './shared';

export default {
  MPPill: [
    from('MPPill', 'title', { type: `${WIDGET}?` }),
    from('MPPill', 'description', { type: `${WIDGET}?` }),
    from('MPPill', 'startIcon', { type: `${WIDGET}?` }),
    from('MPPill', 'endIcon', { type: `${WIDGET}?` }),
    from('MPPill', 'details', { type: `${WIDGET}?` }),
    from('MPPill', 'expanded', { type: 'bool', default: 'false' }),
    renamed('MPPill', 'onClick', 'onPressed', {
      type: 'VoidCallback?',
      description: {
        ko: '가운데를 눌렀을 때 실행됩니다. 넘기면 가운데가 버튼이 되고, `details`가 있으면 펼침 상태를 알립니다',
        en: 'Runs when the middle is pressed. Passing it makes the middle a button, which says whether `details` are showing'
      }
    }),
    from('MPPill', 'variant', { type: VARIANT, default: 'MPVariant.filled' }),
    sizeRow('MPPill'),
    {
      name: 'color',
      type: COLOR,
      default: 'MPColor.secondary',
      description: { ko: '필이 쓰는 강조 계열', en: 'Which accent family the pill reads' }
    },
    renamed('MPPill', 'children', 'child', { type: `${WIDGET}?` }),
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
