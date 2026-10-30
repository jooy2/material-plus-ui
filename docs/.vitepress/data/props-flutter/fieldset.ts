import { from, WIDGET, type PropRow } from './shared';

export default {
  MPFieldset: [
    from('MPFieldset', 'legend', {
      type: `${WIDGET}?`,
      description: {
        ko: '그룹의 이름. 그룹 안에서 가장 먼저 읽히므로, 각 컨트롤 앞에 놓아도 여전히 말이 되는 구절이어야 합니다 — "어디로 보낼까요?"가 아니라 "청구지 주소"',
        en: 'What the group is called. It is read first in the group, so it has to be a phrase that still reads correctly in front of each control — "Billing address", not "Where should we send it?"'
      }
    }),
    from('MPFieldset', 'description', { type: `${WIDGET}?` }),
    {
      name: 'disabled',
      type: 'bool',
      default: 'false',
      description: {
        ko: '안의 모든 컨트롤을 한 번에 비활성화합니다. 포인터와 포커스를 거둬 가고, 이 패키지의 컨트롤은 스스로 비활성으로 그려집니다',
        en: "Disables every control inside at once: takes the pointer and the focus away, and this package's controls draw themselves disabled"
      }
    },
    {
      name: 'size',
      type: 'MPSize?',
      default: 'MPSize.md',
      description: {
        ko: '레전드의 타입 스케일과 컨트롤 사이 간격',
        en: "The legend's type scale and the gap the controls stand at"
      }
    },
    from('MPFieldset', 'children', { type: `List<${WIDGET}>`, required: true })
  ]
} satisfies Record<string, PropRow[]>;
