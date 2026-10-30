import { ALL_MOTION, motionRows } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateMarquee: [
    from('MPAnimateMarquee', 'children', { type: 'List<Widget>', required: true }),
    from('MPAnimateMarquee', 'orientation', {
      type: 'MPOrientation',
      default: 'MPOrientation.horizontal',
      description: {
        ko: '띠가 어느 방향으로 흐르는지. 세로면 부모가 높이를 줘야 합니다',
        en: 'Which way the strip runs. A vertical strip needs a height from its parent'
      }
    }),
    from('MPAnimateMarquee', 'reverse', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '반대로 흘립니다. 읽기 방향의 끝 쪽으로, 또는 아래에서 위로',
        en: "Runs it the other way: towards the reader's end, or bottom to top"
      }
    }),
    from('MPAnimateMarquee', 'speed', { type: 'double', default: '60' }),
    from('MPAnimateMarquee', 'gap', {
      type: 'double',
      default: '32',
      description: {
        ko: '항목 사이, 그리고 한 사본의 끝과 다음 사본의 처음 사이의 간격, 논리 픽셀',
        en: 'The gap between items, and between the last item and the first of the next pass, in logical pixels'
      }
    }),
    from('MPAnimateMarquee', 'copies', { type: 'int', default: '2' }),
    from('MPAnimateMarquee', 'pauseOnHover', { type: 'bool', default: 'true' }),
    ...motionRows('MPAnimateMarquee', ALL_MOTION, {
      duration: {
        description: {
          ko: '한 바퀴의 길이. 비워 두면 `speed`와 측정한 길이가 정합니다',
          en: 'How long one pass takes. Left out, `speed` and the measured length decide'
        }
      },
      easing: {
        description: {
          ko: '한 바퀴가 탈 곡선. 비워 두면 `MPEasing.linear`입니다. 끝이 없는 반복에 이징을 주면 양 끝에서 느려져 화면이 더듬는 것처럼 읽힙니다',
          en: 'Which curve a pass runs on. Left out, `MPEasing.linear`: an eased marquee slows at both ends of a loop that has no ends, which reads as the screen stuttering'
        }
      },
      repeat: { default: 'null' }
    })
  ]
} satisfies Record<string, PropRow[]>;
