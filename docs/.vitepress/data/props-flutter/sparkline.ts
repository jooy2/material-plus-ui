import { curveRow, gapsRow } from './chart-rows';
import { from, type PropRow } from './shared';

export default {
  MPSparkline: [
    from('MPSparkline', 'data', { type: 'List<double?>' }),
    from('MPSparkline', 'shape', { type: 'MPSparklineShape', default: 'MPSparklineShape.line' }),
    curveRow('MPSparkline'),
    gapsRow('MPSparkline'),
    from('MPSparkline', 'endDot', { type: 'bool', default: 'true' }),
    from('MPSparkline', 'baseline', { type: 'double?' }),
    from('MPSparkline', 'min', { type: 'double?' }),
    from('MPSparkline', 'max', { type: 'double?' }),
    from('MPSparkline', 'width', {
      type: 'double?',
      default: 'the width it is given',
      description: {
        ko: '너비, 논리 픽셀 단위. 주지 않으면 받은 너비를 채우고, 부모가 너비를 제한하지 않으면 100입니다',
        en: 'How wide, in logical pixels. Left out it fills the width it is given, and takes 100 where its parent sets no limit'
      }
    }),
    from('MPSparkline', 'height', { type: 'double?' }),
    from('MPSparkline', 'color', {
      type: 'MPChartColor?',
      description: {
        ko: '표식이 읽을 강조 계열(`MPColor`) 또는 아무 `Color`. 주지 않으면 차트 팔레트의 첫 칸을 씁니다',
        en: 'Which accent family the mark reads (an `MPColor`), or any `Color`. Left out, it takes the first slot of the chart palette'
      }
    }),
    from('MPSparkline', 'label', { type: 'String?' }),
    from('MPSparkline', 'locale', { type: 'String?' }),
    {
      name: 'size',
      type: 'MPSize?',
      default: 'MPSize.md',
      description: {
        ko: '높이와 선 두께의 단계: 16, 24, 32, 44, 56. 함께 놓이는 글자에 맞춘 사다리입니다',
        en: 'The rung for its height and stroke: 16, 24, 32, 44, 56. A ladder set against the type it sits with'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
