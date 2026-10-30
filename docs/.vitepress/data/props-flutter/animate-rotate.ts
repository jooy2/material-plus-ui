import { ALL_MOTION, modeRow, motionRows, staggerRows, subjectRows } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateRotate: [
    modeRow('MPAnimateRotate'),
    from('MPAnimateRotate', 'from', { type: 'double', default: '-180' }),
    from('MPAnimateRotate', 'to', { type: 'double', default: '0' }),
    from('MPAnimateRotate', 'origin', {
      type: 'AlignmentGeometry',
      default: 'Alignment.center',
      description: {
        ko: '무엇을 축으로 도는지. `AlignmentDirectional`은 읽기 방향을 따릅니다',
        en: 'Which point it turns about. An `AlignmentDirectional` follows the reading direction'
      }
    }),
    from('MPAnimateRotate', 'fade', { type: 'bool', default: 'true' }),
    ...motionRows('MPAnimateRotate', ALL_MOTION),
    ...staggerRows('MPAnimateRotate'),
    ...subjectRows('MPAnimateRotate', {
      ko: '돌아갈 것. 글자는 아닙니다',
      en: 'What turns. Not text'
    })
  ]
} satisfies Record<string, PropRow[]>;
