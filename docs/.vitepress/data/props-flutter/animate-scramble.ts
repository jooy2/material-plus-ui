import { motionRows, textStyleRow } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateScramble: [
    from('MPAnimateScramble', 'text', {
      type: 'String',
      required: true,
      description: { ko: '가라앉을 한 줄', en: 'The line to settle' }
    }),
    textStyleRow,
    from('MPAnimateScramble', 'duration', {
      type: 'Duration',
      default: 'Duration(milliseconds: 1200)',
      description: {
        ko: '줄 전체가 가라앉는 데 걸리는 시간',
        en: 'How long the whole line takes to settle'
      }
    }),
    from('MPAnimateScramble', 'spread', { type: 'double', default: '0.4' }),
    from('MPAnimateScramble', 'tick', {
      type: 'Duration',
      default: 'Duration(milliseconds: 50)',
      description: {
        ko: '결정되지 않은 글자가 교체되는 간격. 30ms 아래에서는 노이즈가 글자가 아니라 깜빡임으로 읽힙니다',
        en: 'How often an unsettled character is replaced. Below about 30ms the noise stops reading as characters and starts reading as flicker'
      }
    }),
    from('MPAnimateScramble', 'characters', { type: 'String' }),
    ...motionRows('MPAnimateScramble', [
      'delay',
      'repeat',
      'paused',
      'trigger',
      'play',
      'once',
      'threshold'
    ])
  ]
} satisfies Record<string, PropRow[]>;
