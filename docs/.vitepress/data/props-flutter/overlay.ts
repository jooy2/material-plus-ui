import { from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPOverlay: [
    from('MPOverlay', 'open', {
      type: 'bool?',
      description: {
        ko: '표시 여부. 값을 주면 controlled이고, `null`(기본값)이면 오버레이가 `initialOpen`에서 시작해 상태를 스스로 갖습니다',
        en: 'Whether the overlay is shown. Given, the overlay is controlled; `null`, the default, leaves it to keep its own state from `initialOpen`'
      }
    }),
    renamed('MPOverlay', 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from('MPOverlay', 'onOpenChange', {
      type: 'ValueChanged<bool>?',
      description: {
        ko: '오버레이가 닫히기를 청할 때 `false`로 불립니다. 다른 무엇도 청할 수 없으므로 `dismissible`이 켜져 있을 때만 불립니다',
        en: 'Called with `false` when the overlay asks to be closed. Only ever called while `dismissible` is on, because nothing else can ask'
      }
    }),
    from('MPOverlay', 'tone', { type: 'MPOverlayTone', default: 'MPOverlayTone.scrim' }),
    from('MPOverlay', 'dismissible', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '내용 바깥을 누르거나 Escape, 시스템 뒤로 가기로 닫을 수 있을지. 기본값이 꺼짐이고, 이것이 `MPDialog`와 반대입니다. 오버레이는 묻는 것이 아니라 *기다리라*고 말합니다',
        en: 'Whether a press outside the content, Escape or the system back closes it. Off by default, which is the other way round from `MPDialog`: an overlay is not asking anything, it is saying *wait*'
      }
    }),
    from('MPOverlay', 'modal', {
      type: 'bool',
      default: 'true',
      description: {
        ko: '뒤 페이지를 포인터에서도 가져갈지. `false`는 페이지를 스크롤·클릭 가능하게 두면서 포커스만 안에 잡아 두며, React의 `trap-focus`에 해당합니다. 보통 `clear` 오버레이가 원하는 쪽입니다',
        en: "Whether the page behind is taken away from the pointer as well as the keyboard. `false` keeps the page scrollable and clickable while still holding focus inside, which is React's `'trap-focus'` and usually what a `clear` overlay wants"
      }
    }),
    from('MPOverlay', 'align', { type: 'MPAlign', default: 'MPAlign.center' }),
    sizeRow('MPOverlay'),
    from('MPOverlay', 'label', {
      type: 'String?',
      default: "'Overlay'",
      description: {
        ko: '오버레이의 접근성 이름. 라이브러리에서 거의 유일하게 기본값이 있는 라벨입니다. 읽을 것이 없는 오버레이도 자신이 무엇인지는 말해야 합니다. 기본값은 `locale`의 해당 단어입니다',
        en: 'The accessible name of the overlay. It has a default rather than being left empty, which almost nothing else here does: an overlay that holds nothing readable still has to say what it is. Defaults to the word for it in `locale`'
      }
    }),
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '`label`의 기본값을 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: "Which language the default `label` is in. Falls back to the nearest `MPLocaleProvider`, then the app's `Localizations`, then English"
      }
    },
    renamed('MPOverlay', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
