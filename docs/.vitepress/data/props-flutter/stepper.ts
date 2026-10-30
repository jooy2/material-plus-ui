import { COLOR, from, renamed, SIZE, WIDGET, type PropRow } from './shared';

export default {
  MPStepper: [
    from('MPStepper', 'children', {
      type: 'List<Widget>',
      required: true,
      description: {
        ko: '`MPStep`들. 스테퍼가 순서대로 번호를 매기므로 스텝은 자기 자리를 듣지 않습니다',
        en: 'The `MPStep`s. The stepper numbers them as it walks them, so a step is never told where it is'
      }
    }),
    from('MPStepper', 'active', { type: 'int?' }),
    renamed('MPStepper', 'defaultActive', 'initialActive', {
      type: 'int',
      default: '0',
      description: {
        ko: '비제어 스테퍼가 시작하는 스텝. React의 `defaultActive`입니다',
        en: "Where an uncontrolled stepper starts. React's `defaultActive`"
      }
    }),
    from('MPStepper', 'onActiveChange', { type: 'ValueChanged<int>?' }),
    from('MPStepper', 'linear', { type: 'bool' }),
    from('MPStepper', 'orientation', {
      type: 'MPOrientation',
      default: 'MPOrientation.horizontal'
    }),
    {
      name: 'size',
      type: `${SIZE}?`,
      default: 'MPSize.md',
      description: {
        ko: '불릿 지름(14·16·20·24·30)과 제목의 글자 크기',
        en: "The bullet's diameter (14, 16, 20, 24, 30) and the title's type scale"
      }
    },
    {
      name: 'color',
      type: `${COLOR}?`,
      default: 'MPColor.primary',
      description: {
        ko: '레일이 읽는 강조색 계열. 스텝마다 따로 정할 수 있습니다',
        en: 'Which accent family the rail reads. A step can name its own'
      }
    }
  ],
  MPStep: [
    from('MPStep', 'label', { type: `${WIDGET}?` }),
    from('MPStep', 'description', { type: `${WIDGET}?` }),
    from('MPStep', 'bullet', { type: `${WIDGET}?` }),
    from('MPStep', 'error', { type: 'bool' }),
    from('MPStep', 'optional', { type: `${WIDGET}?` }),
    from('MPStep', 'disabled', { type: 'bool', default: 'false' }),
    from('MPStep', 'connector', { type: 'MPStepConnector', default: 'MPStepConnector.solid' }),
    from('MPStep', 'color', { type: `${COLOR}?` }),
    {
      name: 'focusNode',
      type: 'FocusNode?',
      description: {
        ko: '스텝의 포커스를 밖에서 다룰 때 넘기는 노드',
        en: "Drives the step's focus from outside"
      }
    },
    renamed('MPStep', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
