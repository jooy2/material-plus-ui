import { motionRows, textStyleRow } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateTyping: [
    from('MPAnimateTyping', 'text', {
      type: 'String',
      required: true,
      description: { ko: '칠 텍스트', en: 'The text to type' }
    }),
    textStyleRow,
    from('MPAnimateTyping', 'speed', { type: 'double', default: '24' }),
    from('MPAnimateTyping', 'hold', {
      type: 'Duration',
      default: 'Duration(milliseconds: 1400)',
      description: {
        ko: '다 친 텍스트를 반복 전에 얼마나 붙들지',
        en: 'How long the finished text is held before it repeats'
      }
    }),
    from('MPAnimateTyping', 'erase', { type: 'bool', default: 'false' }),
    from('MPAnimateTyping', 'eraseSpeed', { type: 'double?', default: '`speed` × 2' }),
    from('MPAnimateTyping', 'caret', { type: 'bool', default: 'true' }),
    from('MPAnimateTyping', 'caretChar', { type: 'String', default: "'|'" }),
    ...motionRows(
      'MPAnimateTyping',
      ['duration', 'delay', 'repeat', 'paused', 'trigger', 'play', 'once', 'threshold'],
      {
        duration: {
          description: {
            ko: '문자열 전체를 치는 데 걸리는 시간. 비워 두면 `speed`가 정하므로, 긴 문단과 짧은 문단이 같은 시간이 아니라 같은 속도로 쳐집니다',
            en: 'How long the whole string takes to type. Left out, `speed` decides, so a long paragraph and a short one are typed at the same pace rather than in the same time'
          }
        }
      }
    )
  ]
} satisfies Record<string, PropRow[]>;
