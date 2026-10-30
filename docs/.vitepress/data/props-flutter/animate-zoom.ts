import { ALL_MOTION, modeRow, motionRows, staggerRows, subjectRows } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateZoom: [
    modeRow('MPAnimateZoom'),
    from('MPAnimateZoom', 'from', { type: 'double', default: '0.4' }),
    from('MPAnimateZoom', 'fade', { type: 'bool', default: 'true' }),
    ...motionRows('MPAnimateZoom', ALL_MOTION),
    ...staggerRows('MPAnimateZoom'),
    ...subjectRows('MPAnimateZoom', { ko: '도착할 것', en: 'What arrives' })
  ]
} satisfies Record<string, PropRow[]>;
