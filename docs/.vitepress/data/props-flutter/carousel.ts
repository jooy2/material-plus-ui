import { colorRow, from, renamed, sizeRow, VARIANT, type PropRow } from './shared';

export default {
  MPCarousel: [
    from('MPCarousel', 'children', {
      type: 'List<Widget>',
      required: true,
      description: {
        ko: '슬라이드들. 목록 안의 위젯 하나가 슬라이드 하나이고, 프레임 너비 그대로, 프레임은 가장 키 큰 슬라이드만큼 높습니다',
        en: 'The slides. Every widget in the list is one, as wide as the frame, and the frame is as tall as the tallest'
      }
    }),
    from('MPCarousel', 'value', { type: 'int?' }),
    renamed('MPCarousel', 'defaultValue', 'initialValue', {
      type: 'int',
      default: '0',
      description: {
        ko: 'uncontrolled 캐러셀이 처음 보여 줄 슬라이드. React의 `defaultValue`입니다',
        en: "Which slide an uncontrolled carousel opens on. React's `defaultValue`"
      }
    }),
    renamed('MPCarousel', 'onValueChange', 'onChanged', { type: 'ValueChanged<int>?' }),
    from('MPCarousel', 'loop', { type: 'bool', default: 'true' }),
    from('MPCarousel', 'autoPlay', { type: 'bool', default: 'false' }),
    from('MPCarousel', 'interval', {
      type: 'Duration',
      default: 'Duration(seconds: 5)',
      description: {
        ko: '`autoPlay`일 때 슬라이드 하나를 붙잡아 두는 시간',
        en: 'How long each slide is held when `autoPlay` is on'
      }
    }),
    from('MPCarousel', 'arrows', { type: 'bool', default: 'true' }),
    from('MPCarousel', 'indicators', { type: 'bool', default: 'true' }),
    from('MPCarousel', 'label', { type: 'String?' }),
    from('MPCarousel', 'previousLabel', { type: 'String?' }),
    from('MPCarousel', 'nextLabel', { type: 'String?' }),
    from('MPCarousel', 'slideLabel', { type: 'String Function(int index, int count)?' }),
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '캐러셀 자신의 이름을 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 로케일, 영어 순으로 따릅니다',
        en: "Which language the carousel's own names are in. Falls back to the nearest `MPLocaleProvider`, then the app's locale, then English"
      }
    },
    from('MPCarousel', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    sizeRow('MPCarousel'),
    colorRow('MPCarousel')
  ]
} satisfies Record<string, PropRow[]>;
