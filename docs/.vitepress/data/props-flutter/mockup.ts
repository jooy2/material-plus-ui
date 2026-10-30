import { from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPMockup: [
    from('MPMockup', 'device', { type: 'MPMockupDevice', required: true }),
    renamed('MPMockup', 'children', 'child', {
      type: `${WIDGET}?`,
      description: {
        ko: '화면에 놓이는 것. 기기 자신의 해상도에 맞춰 배치되고, 기기 크기의 `MediaQuery`를 받습니다',
        en: "What is on the screen, laid out at the device's own resolution and handed a `MediaQuery` the size of the device"
      }
    }),
    from('MPMockup', 'os', { type: 'MPMockupOs?' }),
    from('MPMockup', 'hardware', { type: 'MPMockupHardware', default: 'MPMockupHardware.monitor' }),
    sizeRow('MPMockup'),
    from('MPMockup', 'resolution', { type: 'MPMockupResolution?' }),
    from('MPMockup', 'orientation', {
      type: 'MPMockupOrientation',
      default: 'MPMockupOrientation.portrait'
    }),
    from('MPMockup', 'bezel', { type: 'MPMockupBezel', default: 'MPMockupBezel.standard' }),
    from('MPMockup', 'finish', { type: 'MPMockupFinish', default: 'MPMockupFinish.graphite' }),
    from('MPMockup', 'notch', { type: 'MPMockupNotch?' }),
    from('MPMockup', 'systemUi', { type: 'bool', default: 'true' }),
    from('MPMockup', 'width', {
      type: 'double?',
      description: {
        ko: '그림 전체가 그려지는 너비, 논리 픽셀입니다. 지정하지 않으면 받은 너비를 채웁니다. 기기는 자기 해상도로 배치된 뒤 한 번 축소되므로, 이 값은 그림의 크기만 바꾸고 화면의 크기는 바꾸지 않습니다',
        en: "The rendered width of the whole picture, in logical pixels. Left out, the mockup fills the width it is given. The device is laid out at its own resolution and scaled once, so this changes the picture's size and never the screen's"
      }
    }),
    from('MPMockup', 'height', { type: 'double?' })
  ]
} satisfies Record<string, PropRow[]>;
