import { ALL_MOTION, layoutRow, motionRows } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateAppear: [
    from('MPAnimateAppear', 'stagger', {
      type: 'Duration',
      default: 'Duration(milliseconds: 80)',
      description: {
        ko: '한 자식 다음 자식이 시작하기까지의 간격. 이것이 효과의 전부이고, 나머지는 자식 하나가 하는 일입니다. 0이면 묶음이 한 번에 도착합니다',
        en: 'How much later each child starts than the one before it. This is the whole effect; everything else is what a single child does. At zero the set arrives all at once'
      }
    }),
    from('MPAnimateAppear', 'from', { type: 'MPSide', default: 'MPSide.bottom' }),
    from('MPAnimateAppear', 'distance', {
      type: 'double',
      default: '12',
      description: {
        ko: '각 자식이 이동하는 거리, 논리 픽셀. 일부러 짧습니다. 화면 밖에서의 등장이 아니라 자리잡음입니다',
        en: 'How far each child travels, in logical pixels. Short on purpose: this is a settling, not an entrance from off screen'
      }
    }),
    from('MPAnimateAppear', 'fade', { type: 'bool', default: 'true' }),
    from('MPAnimateAppear', 'reverse', { type: 'bool', default: 'false' }),
    ...motionRows('MPAnimateAppear', ALL_MOTION),
    from('MPAnimateAppear', 'children', {
      type: 'List<Widget>',
      required: true
    }),
    {
      ...layoutRow,
      description: {
        ko: '자식들을 배치합니다. 목록, 행, 그리드처럼 자식이 들어갈 자리를 넘기세요. 비워 두면 각자 제 너비로 세로로 쌓입니다. React의 `render` 자리입니다',
        en: "Lays the children out: hand it the list, the row or the grid they belong in. Left out, they stack down the page, each at its own width. React's `render`"
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
