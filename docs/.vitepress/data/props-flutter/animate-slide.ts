import { ALL_MOTION, modeRow, motionRows, staggerRows, subjectRows } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateSlide: [
    modeRow('MPAnimateSlide'),
    from('MPAnimateSlide', 'from', { type: 'MPSide', default: 'MPSide.bottom' }),
    from('MPAnimateSlide', 'distance', {
      type: 'double?',
      default: 'null',
      description: {
        ko: '얼마나 이동할지, 논리 픽셀. 비워 두면 위젯 자신의 너비나 높이라서 자기 가장자리 뒤에서 나타납니다. React의 `100%` 자리입니다',
        en: "How far it travels, in logical pixels. Left out, the widget's own width or height, which is what makes it appear from behind its own edge: React's `'100%'`"
      }
    }),
    from('MPAnimateSlide', 'fade', { type: 'bool', default: 'true' }),
    ...motionRows('MPAnimateSlide', ALL_MOTION),
    ...staggerRows('MPAnimateSlide'),
    ...subjectRows('MPAnimateSlide', { ko: '들어오거나 나갈 것', en: 'What travels in or away' })
  ]
} satisfies Record<string, PropRow[]>;
