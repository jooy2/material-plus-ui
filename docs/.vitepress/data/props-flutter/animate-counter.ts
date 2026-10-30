import { motionRows, textStyleRow } from './animate-fade';
import { from, type PropRow } from './shared';

export default {
  MPAnimateCounter: [
    from('MPAnimateCounter', 'value', { type: 'double' }),
    from('MPAnimateCounter', 'from', { type: 'double', default: '0' }),
    from('MPAnimateCounter', 'format', {
      type: 'String Function(double)?',
      description: {
        ko: '숫자를 어떻게 쓸지. 매 프레임과 화면 낭독기용 사본에 쓰입니다. 비워 두면 천 단위로 묶고 소수 셋째 자리까지 영어식으로 씁니다. 통화, 백분율, 다른 언어의 구분 기호는 여기서 씁니다. React의 `options`와 `locale` 자리입니다',
        en: "Writes a number out, for every frame and for the screen reader's copy. Left out, it is grouped in thousands with up to three decimals, in English; a currency, a percentage or another language's separators is a `format` of your own. Where React takes `options` and `locale`"
      }
    }),
    textStyleRow,
    ...motionRows('MPAnimateCounter', [
      'duration',
      'delay',
      'easing',
      'paused',
      'trigger',
      'play',
      'once',
      'threshold'
    ])
  ]
} satisfies Record<string, PropRow[]>;
