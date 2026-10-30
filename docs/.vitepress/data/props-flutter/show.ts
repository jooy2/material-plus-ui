import { from, renamed, WIDGET, type PropRow } from './shared';

export default {
  MPShow: [
    from('MPShow', 'from', { type: 'MPWindowClass?' }),
    from('MPShow', 'until', { type: 'MPWindowClass?' }),
    from('MPShow', 'only', { type: 'MPWindowClass?' }),
    renamed('MPShow', 'children', 'child', {
      type: WIDGET,
      required: true,
      description: {
        ko: '보여 줄 것. 닫혀 있는 창에서는 아예 만들어지지 않습니다',
        en: 'What is shown. Not built at all in a window the gate is closed in'
      }
    })
  ]
} satisfies Record<string, PropRow[]>;
