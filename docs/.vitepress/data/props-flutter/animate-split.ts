import { ALL_MOTION, motionRows, textStyleRow } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateSplit: [
    from('MPAnimateSplit', 'text', {
      type: 'String',
      required: true,
      description: { ko: '쪼갤 한 줄', en: 'The line to split' }
    }),
    from('MPAnimateSplit', 'by', { type: 'MPAnimateSplitBy', default: 'MPAnimateSplitBy.word' }),
    textStyleRow,
    {
      name: 'textAlign',
      type: 'TextAlign',
      default: 'TextAlign.start',
      description: {
        ko: '줄이 넘칠 때 각 줄이 너비 안에서 어디에 놓일지',
        en: 'How the lines of a line that wraps sit across the width'
      }
    },
    from('MPAnimateSplit', 'stagger', {
      type: 'Duration',
      default: 'Duration(milliseconds: 40)',
      description: {
        ko: '한 조각 뒤에 다음 조각이 시작하기까지의 시간. 이것이 효과의 전부입니다. 기본값은 단어에 맞는 값입니다',
        en: 'How much later each piece starts than the one before it. This is the whole effect, and the default is right for words'
      }
    }),
    from('MPAnimateSplit', 'durationStep', {
      type: 'Duration',
      default: 'Duration.zero',
      description: {
        ko: '조각마다 앞의 것보다 얼마나 더 오래 걸리는지. 음수는 짧아지며 0에서 멈춥니다',
        en: 'How much longer each piece takes than the one before it. Negative shortens instead, clamped at zero'
      }
    }),
    from('MPAnimateSplit', 'reverse', { type: 'bool', default: 'false' }),
    from('MPAnimateSplit', 'from', { type: 'MPSide', default: 'MPSide.bottom' }),
    from('MPAnimateSplit', 'distance', {
      type: 'double',
      default: '8',
      description: {
        ko: '각 조각이 이동하는 거리, 논리 픽셀. 일부러 짧습니다. 조각 마흔 개에 걸친 긴 이동은 도착하는 문단이 아니라 움직이는 문단입니다',
        en: 'How far each piece travels, in logical pixels. Short on purpose: a long travel over forty pieces is a paragraph that is *moving* rather than a paragraph arriving'
      }
    }),
    from('MPAnimateSplit', 'fade', { type: 'bool', default: 'true' }),
    ...motionRows('MPAnimateSplit', ALL_MOTION)
  ]
} satisfies Record<string, PropRow[]>;
