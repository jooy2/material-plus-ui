import { from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPContainer: [
    from('MPContainer', 'maxWidth', {
      type: 'MPResponsive<MPMeasure>?',
      default: 'null',
      description: {
        ko: '내용이 넓어질 수 있는 한도. 창 크기 클래스에 맞춘 단계(`MPMeasure.sm` 600, `md` 840, `lg` 1200, `xl` 1600, `xs` 480)이거나 `MPMeasure.pixels(640)` 같은 직접 정한 길이이며, 창 크기 클래스마다 다르게 줄 수 있습니다. `null`은 한도가 없다는 뜻이고 `MPMeasure.none`과 같습니다',
        en: 'How wide the content may get. A rung pinned to the window size classes (`MPMeasure.sm` 600, `md` 840, `lg` 1200, `xl` 1600, `xs` 480) or a length of your own, `MPMeasure.pixels(640)`, and either of them per window size class. `null` is no limit, the same as `MPMeasure.none`'
      }
    }),
    from('MPContainer', 'padded', { type: 'bool', default: 'true' }),
    sizeRow('MPContainer'),
    from('MPContainer', 'centered', { type: 'bool', default: 'true' }),
    renamed('MPContainer', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
