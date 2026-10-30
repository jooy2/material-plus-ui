import { ALL_MOTION, modeRow, motionRows, staggerRows, subjectRows } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateReveal: [
    modeRow('MPAnimateReveal'),
    from('MPAnimateReveal', 'from', { type: 'MPSide', default: 'MPSide.left' }),
    from('MPAnimateReveal', 'fade', { type: 'bool', default: 'false' }),
    ...motionRows('MPAnimateReveal', ALL_MOTION),
    ...staggerRows('MPAnimateReveal'),
    ...subjectRows('MPAnimateReveal', { ko: '드러날 것', en: 'What is uncovered' })
  ]
} satisfies Record<string, PropRow[]>;
