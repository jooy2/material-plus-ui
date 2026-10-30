import { COLOR, from, sizeRow, type PropRow } from './shared';

export default {
  MPSkeleton: [
    from('MPSkeleton', 'shape', { type: 'MPSkeletonShape', default: 'MPSkeletonShape.line' }),
    from('MPSkeleton', 'lines', { type: 'int', default: '1' }),
    sizeRow('MPSkeleton'),
    from('MPSkeleton', 'color', { type: `${COLOR}?` }),
    from('MPSkeleton', 'width', {
      type: 'double?',
      description: {
        ko: '너비(논리 픽셀). 부모가 늘이려 해도 이 너비를 지킵니다. 너비의 일부는 `FractionallySizedBox`로 감싸서 줍니다',
        en: 'An explicit width, in logical pixels, kept even where the parent would stretch it. A share of the width is a `FractionallySizedBox` round the skeleton'
      }
    }),
    from('MPSkeleton', 'height', {
      type: 'double?',
      description: {
        ko: '높이(논리 픽셀). 줄 여러 개를 쌓은 스켈레톤에는 적용되지 않습니다. 각 막대가 이미 타입 크기의 높이를 가집니다',
        en: "An explicit height, in logical pixels. Not applied to a stack of lines, where each bar already has the type scale's height"
      }
    }),
    from('MPSkeleton', 'animated', { type: 'bool', default: 'true' }),
    from('MPSkeleton', 'label', {
      type: 'String?',
      description: {
        ko: '스크린 리더에 무엇을 말할지. 비워 두면 아무것도 말하지 않습니다. 영역 전체를 대표하는 스켈레톤 하나에 주면 상태 역할과 이 라벨을 가진 노드가 됩니다',
        en: 'What a screen reader is told, if anything. Left out, nothing. Give it to the one skeleton that stands for the whole region and it becomes a node with the status role and this label'
      }
    })
  ]
} satisfies Record<string, PropRow[]>;
