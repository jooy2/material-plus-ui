import { motionRows } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateHeadline: [
    from('MPAnimateHeadline', 'children', { type: 'List<Widget>', required: true }),
    from('MPAnimateHeadline', 'interval', {
      type: 'Duration',
      default: 'Duration(milliseconds: 2600)',
      description: {
        ko: '다음 줄이 올라오기 전에 한 줄을 얼마나 붙들지. 줄이 도착한 순간부터 세므로 주기 길이가 아니라 읽는 시간입니다',
        en: 'How long each line is held before the next one comes up. Counted from the moment a line arrives, so it is reading time rather than a cycle length'
      }
    }),
    from('MPAnimateHeadline', 'index', { type: 'int?' }),
    from('MPAnimateHeadline', 'defaultIndex', { type: 'int', default: '0' }),
    from('MPAnimateHeadline', 'onIndexChange', { type: 'ValueChanged<int>?' }),
    from('MPAnimateHeadline', 'loop', { type: 'bool', default: 'true' }),
    from('MPAnimateHeadline', 'rise', {
      type: 'double?',
      default: 'null',
      description: {
        ko: "줄이 올라오거나 나갈 때 이동하는 거리, 논리 픽셀. 비워 두면 줄 하나의 높이입니다. React의 `'100%'` 자리입니다",
        en: "How far a line travels as it comes up or leaves, in logical pixels. Left out, one line's own height: React's `'100%'`"
      }
    }),
    ...motionRows(
      'MPAnimateHeadline',
      ['duration', 'delay', 'easing', 'repeat', 'paused', 'trigger', 'play', 'once', 'threshold'],
      {
        duration: {
          description: {
            ko: '줄 하나가 바뀌는 데 걸리는 시간. 비워 두면 MD3의 `long2`입니다',
            en: "How long one swap takes. Left out, MD3's `long2`"
          }
        },
        easing: {
          description: {
            ko: '바뀌는 두 줄이 함께 탈 곡선. 비워 두면 올라오는 줄은 `emphasizedDecelerate`로, 나가는 줄은 `emphasizedAccelerate`로 움직입니다',
            en: 'Which curve both lines of a swap run on. Left out, the arriving line decelerates on `emphasizedDecelerate` and the leaving one accelerates on `emphasizedAccelerate`'
          }
        },
        repeat: {
          default: 'null',
          description: {
            ko: '릴은 `loop`가 정하는 동안 계속 돕니다. 이 값은 포인터가 떠날 때 hover 트리거가 멈추는지만 정합니다',
            en: 'The reel turns for as long as `loop` says; this only decides whether a hover trigger stops it when the pointer leaves'
          }
        }
      }
    )
  ]
} satisfies Record<string, PropRow[]>;
