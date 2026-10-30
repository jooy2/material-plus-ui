import { colorRow, from, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPProgressBox: [
    from('MPProgressBox', 'value', { type: 'double?', default: 'null' }),
    from('MPProgressBox', 'min', { type: 'double', default: '0' }),
    from('MPProgressBox', 'max', { type: 'double', default: '100' }),
    from('MPProgressBox', 'count', { type: 'int', default: '4' }),
    from('MPProgressBox', 'label', { type: `${WIDGET}?` }),
    from('MPProgressBox', 'hideLabel', { type: 'bool', default: 'false' }),
    from('MPProgressBox', 'showValue', { type: 'bool', default: 'false' }),
    {
      name: 'formatValue',
      type: 'String Function(double value)?',
      description: {
        ko: '값을 보여줄 때의 표기. 범위 안으로 clamp된 값을 받아 글을 돌려주며, 스크린 리더도 같은 문자열을 듣습니다. 없으면 범위의 백분율입니다. React의 `format` 자리입니다',
        en: "How the value is written when it is shown, handed the value clamped into the range. A screen reader hears the same string. Without it the value is a percentage of the range. React's `format`"
      }
    },
    sizeRow('MPProgressBox'),
    colorRow('MPProgressBox')
  ]
} satisfies Record<string, PropRow[]>;
