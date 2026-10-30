import { motionRows } from './animate-fade';
import { colorRow, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPAnimateLighting: [
    colorRow('MPAnimateLighting'),
    sizeRow('MPAnimateLighting'),
    from('MPAnimateLighting', 'spread', {
      type: 'double',
      default: '3',
      description: {
        ko: '빛이 내용 바깥으로 얼마나 나가는지, 논리 픽셀',
        en: 'How far past the content the light reaches, in logical pixels'
      }
    }),
    from('MPAnimateLighting', 'arc', { type: 'double', default: '50' }),
    from('MPAnimateLighting', 'blur', {
      type: 'double',
      default: '4',
      description: {
        ko: '빛이 얼마나 부드러운지, 논리 픽셀. `0`이면 빛이 아니라 그래픽으로 읽히는 쐐기가 됩니다',
        en: 'How soft the light is, in logical pixels. At `0` it is a hard-edged wedge, which reads as a graphic rather than as light'
      }
    }),
    from('MPAnimateLighting', 'reverse', { type: 'bool', default: 'false' }),
    ...motionRows(
      'MPAnimateLighting',
      [
        'duration',
        'delay',
        'repeat',
        'alternate',
        'paused',
        'trigger',
        'play',
        'once',
        'threshold'
      ],
      {
        duration: {
          type: 'Duration',
          default: 'Duration(milliseconds: 3000)',
          description: {
            ko: '빛이 한 바퀴 도는 데 걸리는 시간',
            en: 'How long one revolution takes'
          }
        },
        repeat: { default: 'null' }
      }
    ),
    renamed('MPAnimateLighting', 'children', 'child', { type: WIDGET, required: true })
  ]
} satisfies Record<string, PropRow[]>;
