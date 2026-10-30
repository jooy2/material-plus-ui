import {
  colorRow,
  focusRows,
  from,
  semanticLabelRow,
  sizeRow,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPSlider: [
    from('MPSlider', 'value', {
      type: 'List<double>?',
      description: {
        ko: '값. 손잡이 하나에 항목 하나이며, 두 개면 범위 슬라이더입니다. 넘기면 controlled입니다',
        en: 'The value, one entry per handle; two entries make it a range. Given, the slider is controlled'
      }
    }),
    {
      name: 'initialValue',
      type: 'List<double>?',
      default: '[min]',
      description: {
        ko: '처음 값. 자기 값을 스스로 들고 있는 슬라이더에 씁니다. React의 `defaultValue` 자리입니다',
        en: "The starting value, for a slider that holds its own. React's `defaultValue`"
      }
    },
    {
      name: 'onChanged',
      type: 'ValueChanged<List<double>>?',
      description: {
        ko: '움직일 때마다 값과 같은 모양의 목록으로 호출됩니다. React의 `onValueChange` 자리입니다',
        en: "Called on every move, with the same shape the value takes. React's `onValueChange`"
      }
    },
    from('MPSlider', 'onValueCommitted', {
      type: 'ValueChanged<List<double>>?',
      description: {
        ko: '움직임이 끝났을 때 한 번 호출됩니다. 드래그가 끝나거나, 키를 누르거나, 트랙을 눌렀을 때입니다',
        en: 'Called once a move settles: a drag ends, a key is pressed, the track is pressed'
      }
    }),
    from('MPSlider', 'min', { type: 'double', default: '0' }),
    from('MPSlider', 'max', { type: 'double', default: '100' }),
    from('MPSlider', 'step', { type: 'double', default: '1' }),
    from('MPSlider', 'marks', {
      type: 'MPSliderMarks?',
      description: {
        ko: '트랙 위 눈금. `MPSliderMarks.everyStep()`은 `step`마다 하나씩(최대 50개), `MPSliderMarks([...])`는 직접 고른 눈금이며 라벨을 붙일 수 있습니다. Dart에 유니언 타입이 없어 React의 `true`와 배열이 두 생성자가 되었습니다',
        en: 'The ticks on the track. `MPSliderMarks.everyStep()` puts one at every `step` (up to fifty); `MPSliderMarks([...])` names them and can carry labels. React’s `true` and array are two constructors, because Dart has no union type'
      }
    }),
    from('MPSlider', 'label', { type: `${WIDGET}?` }),
    from('MPSlider', 'description', { type: `${WIDGET}?` }),
    from('MPSlider', 'showValue', { type: 'bool', default: 'false' }),
    from('MPSlider', 'format', {
      type: 'String Function(double value)?',
      description: {
        ko: '읽기 표시와 화면 낭독기가 읽는 값을 쓰는 방법. 숫자 하나를 받아 글자로 돌려줍니다. 생략하면 `step`의 소수 자릿수만큼 씁니다',
        en: 'How the readout and the spoken value write one number. Left out, the number has as many decimals as `step`'
      }
    }),
    from('MPSlider', 'orientation', {
      type: 'MPOrientation',
      default: 'MPOrientation.horizontal'
    }),
    sizeRow('MPSlider'),
    colorRow('MPSlider'),
    from('MPSlider', 'disabled', { type: 'bool', default: 'false' }),
    semanticLabelRow,
    {
      name: 'focusNode',
      type: 'FocusNode?',
      description: {
        ko: '첫 손잡이의 포커스를 밖에서 다룰 때 넘기는 노드',
        en: 'Drives the focus of the first handle from outside'
      }
    },
    focusRows[1]
  ],
  MPSliderMark: [
    {
      name: 'value',
      type: 'double',
      required: true,
      description: {
        ko: '범위 위의 위치. `min`…`max` 밖이면 그리지 않습니다',
        en: 'Where on the range it sits. Outside `min`…`max` it is not drawn'
      }
    },
    {
      name: 'label',
      type: `${WIDGET}?`,
      description: {
        ko: '눈금 아래(세로 슬라이더에서는 옆)에 쓰는 글. 없으면 트랙 위 점 하나입니다',
        en: 'What is written under it, or beside it on a vertical slider. Left out, the mark is a tick and nothing else'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
