import { colorRow, from, semanticLabelRow, sizeRow, VARIANT, WIDGET, type PropRow } from './shared';

export default {
  MPButtonGroup: [
    from('MPButtonGroup', 'children', {
      type: `List<${WIDGET}>`,
      required: true,
      description: {
        ko: '버튼들. 항목 하나가 줄의 구성원 하나이며 이웃과 이어집니다',
        en: 'The buttons, in order. Each entry is one member of the run, joined to its neighbours'
      }
    }),
    from('MPButtonGroup', 'orientation', {
      type: 'MPOrientation',
      default: 'MPOrientation.horizontal'
    }),
    from('MPButtonGroup', 'variant', { type: `${VARIANT}?` }),
    sizeRow('MPButtonGroup'),
    colorRow('MPButtonGroup'),
    from('MPButtonGroup', 'disabled', { type: 'bool?' }),
    from('MPButtonGroup', 'fullWidth', { type: 'bool', default: 'false' }),
    {
      ...semanticLabelRow,
      description: {
        ko: '그룹의 이름. 줄이 우연히 붙은 버튼이 아니라 하나의 *세트*일 때 붙이세요. React에서는 나머지 props로 넘기는 `aria-label`입니다',
        en: "The group's name, worth setting whenever the run is a *set*. The `aria-label` React passes through the rest props"
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
