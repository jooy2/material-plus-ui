import { colorRow, from, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPPanes: [
    {
      name: 'children',
      type: 'List<MPPane>',
      required: true,
      description: {
        ko: '영역들. 둘마다 사이에 핸들이 하나씩 놓입니다',
        en: 'The regions, with one handle between each two'
      }
    },
    from('MPPanes', 'orientation', { type: 'MPOrientation', default: 'MPOrientation.horizontal' }),
    from('MPPanes', 'resizable', { type: 'bool', default: 'true' }),
    colorRow('MPPanes'),
    sizeRow('MPPanes'),
    from('MPPanes', 'onResize', { type: 'ValueChanged<List<double>>?' }),
    from('MPPanes', 'onResizeEnd', { type: 'ValueChanged<List<double>>?' }),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '화면 낭독기가 각 핸들을 부르는 이름. 핸들이 가리키는 몫보다 먼저 읽힙니다',
        en: 'What a screen reader calls each handle, before the share it is at'
      }
    }
  ],
  MPPane: [
    from('MPPane', 'defaultSize', {
      type: 'MPPaneSize?',
      description: {
        ko: '처음 차지하는 몫. `MPPaneSize.percent(30)`은 분할할 공간의 30%이고, `MPPaneSize.pixels(240)`은 절대 길이입니다. 지정하지 않은 패널끼리 남은 공간을 똑같이 나눕니다',
        en: 'The share it starts with. `MPPaneSize.percent(30)` is 30% of the space being divided, `MPPaneSize.pixels(240)` an absolute length. Panes without one split what is left equally'
      }
    }),
    from('MPPane', 'minSize', { type: 'MPPaneSize?' }),
    from('MPPane', 'maxSize', { type: 'MPPaneSize?' }),
    {
      name: 'child',
      type: WIDGET,
      required: true,
      description: {
        ko: '패널 안에 들어가는 것. 패널은 이것을 자기 크기에 맞춰 잘라냅니다',
        en: 'What is inside the pane, clipped to it'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
