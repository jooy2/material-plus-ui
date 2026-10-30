import { colorRow, from, sizeRow, VARIANT, type PropRow } from './shared';

export default {
  MPScrollZone: [
    from('MPScrollZone', 'children', { type: 'List<Widget>', required: true }),
    from('MPScrollZone', 'orientation', {
      type: 'MPOrientation',
      default: 'MPOrientation.horizontal'
    }),
    from('MPScrollZone', 'lines', { type: 'int', default: '1' }),
    from('MPScrollZone', 'gap', {
      type: 'double',
      default: '8',
      description: {
        ko: '자식 사이의 간격, 논리 픽셀입니다',
        en: 'The space between children, in logical pixels'
      }
    }),
    from('MPScrollZone', 'buttons', {
      type: 'MPScrollZoneButtons',
      default: 'MPScrollZoneButtons.auto'
    }),
    from('MPScrollZone', 'buttonPlacement', {
      type: 'MPScrollZoneButtonPlacement',
      default: 'MPScrollZoneButtonPlacement.inline'
    }),
    from('MPScrollZone', 'mode', { type: 'MPScrollZoneMode', default: 'MPScrollZoneMode.item' }),
    from('MPScrollZone', 'step', { type: 'int', default: '1' }),
    from('MPScrollZone', 'speed', { type: 'double', default: '900' }),
    from('MPScrollZone', 'snap', { type: 'bool', default: 'false' }),
    from('MPScrollZone', 'drag', { type: 'bool', default: 'true' }),
    from('MPScrollZone', 'wheel', { type: 'bool', default: 'false' }),
    from('MPScrollZone', 'scrollbar', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '띠 위에 얇은 스크롤바를 그립니다',
        en: 'Draws a thin scrollbar over the strip'
      }
    }),
    {
      name: 'controller',
      type: 'ScrollController?',
      description: {
        ko: '띠의 스크롤을 바깥에서 다룰 때 넘기는 컨트롤러. 주지 않으면 띠가 자기 것을 씁니다',
        en: 'Drives the scroll from outside. Left out, the zone owns one of its own'
      }
    },
    from('MPScrollZone', 'variant', { type: VARIANT, default: 'MPVariant.filled' }),
    sizeRow('MPScrollZone'),
    colorRow('MPScrollZone'),
    from('MPScrollZone', 'label', { type: 'String?' }),
    from('MPScrollZone', 'previousLabel', { type: 'String?' }),
    from('MPScrollZone', 'nextLabel', { type: 'String?' }),
    from('MPScrollZone', 'locale', { type: 'String?' })
  ]
} satisfies Record<string, PropRow[]>;
