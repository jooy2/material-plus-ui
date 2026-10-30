import { ALL_MOTION, modeRow, motionRows, staggerRows, subjectRows } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateGrow: [
    modeRow('MPAnimateGrow'),
    from('MPAnimateGrow', 'from', { type: 'double', default: '0.8' }),
    from('MPAnimateGrow', 'origin', {
      type: 'AlignmentGeometry',
      default: 'Alignment.center',
      description: {
        ko: '무엇이 제자리에 남고 나머지가 움직일지. `Alignment.topCenter`는 아래로, `Alignment.bottomLeft`는 모서리에서 펼쳐집니다. `AlignmentDirectional`은 읽기 방향을 따릅니다',
        en: 'Which point stays put while the rest moves. `Alignment.topCenter` unfolds downwards, `Alignment.bottomLeft` out of a corner. An `AlignmentDirectional` follows the reading direction'
      }
    }),
    from('MPAnimateGrow', 'fade', { type: 'bool', default: 'true' }),
    ...motionRows('MPAnimateGrow', ALL_MOTION),
    ...staggerRows('MPAnimateGrow'),
    ...subjectRows('MPAnimateGrow', { ko: '펼쳐질 것', en: 'What unfolds' })
  ]
} satisfies Record<string, PropRow[]>;
