import { motionRows, staggerRows, subjectRows } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateFloat: [
    from('MPAnimateFloat', 'distance', {
      type: 'double',
      default: '10',
      description: {
        ko: '경로의 꼭대기에서 얼마나 떠오르는지, 논리 픽셀. 작은 것이 의도입니다. 이것은 고정되어 있지 않다를 말하고, 잴 수 있는 값은 대신 움직인다를 말합니다',
        en: 'How far it rises at the top of the drift, in logical pixels. Small on purpose: this says *not fixed down*, and anything a reader can measure says *moving* instead'
      }
    }),
    from('MPAnimateFloat', 'sway', {
      type: 'double',
      default: '6',
      description: {
        ko: '좌우로 얼마나 헤매는지, 논리 픽셀. `distance`보다 작아서 경로가 원이 아니라 표류로 읽힙니다',
        en: 'How far it wanders to either side, in logical pixels. Less than `distance`, so the path reads as a drift rather than as a circle'
      }
    }),
    from('MPAnimateFloat', 'tilt', { type: 'double', default: '0' }),
    ...motionRows(
      'MPAnimateFloat',
      ['duration', 'delay', 'easing', 'repeat', 'paused', 'trigger', 'play', 'once', 'threshold'],
      {
        duration: {
          default: 'Duration(seconds: 6)',
          description: {
            ko: '한 주기의 길이. Material 토큰이 아닙니다. 모션 사다리는 도착하는 것들을 위한 것이고, 주기는 지속 시간이 아닙니다',
            en: 'How long one cycle takes. Not a Material token: the motion ladder is for things that arrive, and a period is not a duration'
          }
        },
        easing: { default: 'MPEasing.standard' },
        repeat: {
          default: 'null',
          description: {
            ko: '몇 번 도는지. 표류에는 도착이 없으므로 기본값 `null`은 멈추지 않습니다',
            en: 'How many times it runs. `null`, the default, never stops, because a drift has no arrival to stop at'
          }
        }
      }
    ),
    ...staggerRows('MPAnimateFloat'),
    ...subjectRows('MPAnimateFloat', {
      ko: '표류할 것. 컨트롤은 절대 안 됩니다',
      en: 'What drifts. Never a control'
    })
  ]
} satisfies Record<string, PropRow[]>;
