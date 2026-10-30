import { ALL_MOTION, motionRows, staggerRows, subjectRows } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateBlink: [
    from('MPAnimateBlink', 'min', { type: 'double', default: '0' }),
    ...motionRows('MPAnimateBlink', ALL_MOTION, {
      duration: {
        description: {
          ko: '한 주기의 길이. 비워 두면 MD3의 `extraLong4`입니다. 도착까지 걸리는 시간이 아니라 주기입니다',
          en: "How long one cycle takes. Left out, MD3's `extraLong4`: a period rather than the time something takes to arrive"
        }
      },
      repeat: {
        default: 'null',
        description: {
          ko: '몇 번 도는지. 기본값 `null`은 멈추지 않습니다. 한 번의 깜빡임은 그냥 깜빡임이라서입니다',
          en: 'How many times it runs. `null`, the default, never stops, because a single blink is a flicker'
        }
      }
    }),
    ...staggerRows('MPAnimateBlink'),
    ...subjectRows('MPAnimateBlink', { ko: '맥동할 것', en: 'What pulses' })
  ]
} satisfies Record<string, PropRow[]>;
