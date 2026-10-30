import { elevationRow, from, sizeRow, VARIANT, type PropRow } from './shared';
import { childrenRow, labelRow, valueRows } from './bottom-navigation';

export default {
  MPFloatingBottomNavigation: [
    childrenRow('MPFloatingBottomNavigation'),
    ...valueRows('MPFloatingBottomNavigation'),
    from('MPFloatingBottomNavigation', 'offset', {
      type: 'double',
      default: '16',
      description: {
        ko: '아래 가장자리에서 얼마나 떠 있는지, 논리 픽셀로. 이 컴포넌트와 `MPBottomNavigation`의 차이 전부입니다. 위젯이 로젠지 아래에 이만큼의 틈을 스스로 둡니다',
        en: 'How far it floats above the bottom edge, in logical pixels. This is the whole difference from `MPBottomNavigation`; the widget keeps that gap under the lozenge itself'
      }
    }),
    labelRow('MPFloatingBottomNavigation', 'selected'),
    from('MPFloatingBottomNavigation', 'variant', {
      type: `${VARIANT}?`,
      default: 'MPVariant.filled'
    }),
    {
      ...elevationRow('MPFloatingBottomNavigation'),
      default: '3, unless variant is set'
    },
    sizeRow('MPFloatingBottomNavigation'),
    from('MPFloatingBottomNavigation', 'safeArea', {
      type: 'bool',
      default: 'true',
      description: {
        ko: '`offset`에 창의 아래쪽 여백(`MediaQuery.paddingOf`)을 더해 홈 인디케이터를 피합니다. 전폭 바와 달리 시트 전체가 움직입니다. 아래에 덮어 둘 것이 없기 때문입니다',
        en: "Adds the window's bottom inset (`MediaQuery.paddingOf`) to `offset` so the bar clears a home indicator. Unlike the full-width bar this moves the whole sheet: there is nothing under it to keep covered"
      }
    }),
    from('MPFloatingBottomNavigation', 'disabled', { type: 'bool', default: 'false' }),
    from('MPFloatingBottomNavigation', 'label', { type: 'String?' })
  ]
} satisfies Record<string, PropRow[]>;
