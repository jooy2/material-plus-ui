import { motionRows } from './animate-fade';
import { from, renamed, WIDGET, type PropRow } from './shared';

export default {
  MPAnimateShake: [
    from('MPAnimateShake', 'distance', {
      type: 'double',
      default: '8',
      description: {
        ko: '첫 스윙의 가장 먼 지점까지 얼마나 이동하는지, 논리 픽셀',
        en: 'How far it travels at the widest point of the first swing, in logical pixels'
      }
    }),
    from('MPAnimateShake', 'trigger', {
      type: 'MPAnimateTrigger',
      default: 'MPAnimateTrigger.manual'
    }),
    from('MPAnimateShake', 'play', { type: 'bool', default: 'false' }),
    ...motionRows('MPAnimateShake', ['duration', 'delay', 'easing', 'paused'], {
      duration: {
        type: 'Duration',
        default: 'Duration(milliseconds: 400)',
        description: {
          ko: '흔들림 전체의 길이. 거절은 어떤 도착의 사다리에도 없으므로 Material 토큰이 아닙니다',
          en: 'How long the whole shake takes. Not a Material token: a refusal is not on any arrival’s ladder'
        }
      },
      easing: { type: 'MPEasing', default: 'MPEasing.standard' }
    }),
    renamed('MPAnimateShake', 'children', 'child', { type: WIDGET, required: true })
  ]
} satisfies Record<string, PropRow[]>;
