import { colorRow, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPTour: [
    from('MPTour', 'steps', { type: 'List<MPTourStep>' }),
    from('MPTour', 'open', {
      type: 'bool?',
      description: {
        ko: '투어가 진행 중인지. `onOpenChange`와 함께 쓰면 controlled이고, `null`이면 투어가 `initialOpen`에서 시작해 스스로 기억합니다',
        en: 'Whether the tour is running. Use with `onOpenChange` for a controlled one; `null` lets the tour keep it, starting from `initialOpen`'
      }
    }),
    renamed('MPTour', 'defaultOpen', 'initialOpen', { type: 'bool' }),
    from('MPTour', 'onOpenChange', {
      type: 'ValueChanged<bool>?',
      description: {
        ko: '투어가 시작되거나 끝날 때 호출됩니다. 건너뛰기, 완료, ×, Escape, 시스템 뒤로 가기가 모두 여기로 옵니다',
        en: 'Called when the tour starts or ends: Skip, Done, the ×, Escape and the system back all arrive here'
      }
    }),
    from('MPTour', 'step', {
      type: 'int?',
      description: {
        ko: '몇 번째 단계인지, `0`부터. `onStepChange`와 함께 쓰면 controlled입니다. 끝을 넘는 값은 마지막 단계가 됩니다',
        en: 'Which stop, from `0`. Use with `onStepChange` for a controlled one. A step past the end is the last one'
      }
    }),
    renamed('MPTour', 'defaultStep', 'initialStep', { type: 'int' }),
    from('MPTour', 'onStepChange', { type: 'ValueChanged<int>?' }),
    from('MPTour', 'onFinish', { type: 'VoidCallback?' }),
    from('MPTour', 'scrim', { type: 'bool' }),
    from('MPTour', 'skippable', { type: 'bool' }),
    from('MPTour', 'dismissible', {
      type: 'bool',
      description: {
        ko: 'Escape, 시스템 뒤로 가기, ×로 투어를 끝낼 수 있는지. `false`면 ×도 그려지지 않고, 뒤로 가기는 투어가 가져가지 않은 페이지로 넘어갑니다',
        en: 'Whether Escape, the system back and the × end the tour. `false` draws no ×, and the back goes on to the page, which the tour never took away'
      }
    }),
    from('MPTour', 'scrollIntoView', { type: 'bool' }),
    from('MPTour', 'labels', {
      type: 'Map<String, String>?',
      description: {
        ko: '투어가 스스로 말하는 다섯 단어(`previous`, `next`, `done`, `skip`, `position`)의 개별 override. `position`에는 `{index}`와 `{total}`이 들어갑니다. 지정하지 않은 것은 `locale`의 번역, 그다음 영어로 내려갑니다',
        en: 'Individual overrides for the five words the tour says on its own behalf (`previous`, `next`, `done`, `skip`, `position`, the last with `{index}` and `{total}` in it). Whatever is not given falls back to the translation for `locale`, then to English'
      }
    }),
    from('MPTour', 'locale', {
      type: 'String?',
      description: {
        ko: '그 다섯 단어의 언어. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: "Which language those five words are in. Falls back to the nearest `MPLocaleProvider`, then the app's `Localizations`, then English"
      }
    }),
    sizeRow('MPTour'),
    colorRow('MPTour')
  ],

  MPTourStep: [
    from('MPTourStep', 'target', {
      type: 'GlobalKey?',
      description: {
        ko: '이 단계가 말하는 위젯에 단 `GlobalKey`. 생략하거나 배치되지 않은 위젯을 가리키면, 아무것도 도려내지 않은 채 카드가 화면 가운데에 매달립니다 — 환영 단계와 마무리 단계가 그것입니다',
        en: 'A `GlobalKey` on the widget this step is about. Left out, or pointing at nothing laid out, the card hangs from the middle of the screen with nothing cut out — which is what a welcome step and a closing step are'
      }
    }),
    from('MPTourStep', 'title', { type: `${WIDGET}?` }),
    from('MPTourStep', 'content', { type: `${WIDGET}?` }),
    from('MPTourStep', 'side', { type: 'MPSide', default: 'MPSide.bottom' }),
    from('MPTourStep', 'align', { type: 'MPAlign', default: 'MPAlign.center' }),
    from('MPTourStep', 'padding', { type: 'double' })
  ]
} satisfies Record<string, PropRow[]>;
