import { from, renamed, WIDGET, type PropRow } from './shared';

export default {
  MPConfirmProvider: [
    from('MPConfirmProvider', 'defaults', {
      type: 'MPConfirmOptions?',
      description: {
        ko: '이 아래에서 올라오는 모든 확인의 기본값: 애플리케이션에 맞춘 `size`, 강조색, 직접 쓴 `cancelLabel`. 각 질문이 말한 것이 이기고, 질문할 때 읽으므로 나중에 바꾼 값이 쓰입니다. `title`, `description`, `child`, `semanticLabel`은 쓰이지 않습니다',
        en: 'Defaults for every confirmation raised under this: a `size` to match the application, an accent, a `cancelLabel` in your own words. Each question still wins, and they are read when a question is asked, so a later change is the one used. The `title`, `description`, `child` and `semanticLabel` here are never used'
      }
    }),
    renamed('MPConfirmProvider', 'children', 'child', {
      type: WIDGET,
      required: true,
      description: {
        ko: '`MPConfirmProvider.of(context)`로 질문할 수 있는 트리',
        en: 'The tree `MPConfirmProvider.of(context)` can be called from'
      }
    })
  ],
  MPConfirmOptions: [
    from('MPConfirmOptions', 'title', { type: `${WIDGET}?` }),
    from('MPConfirmOptions', 'description', { type: `${WIDGET}?` }),
    from('MPConfirmOptions', 'icon', { type: `${WIDGET}?` }),
    renamed('MPConfirmOptions', 'children', 'child', { type: `${WIDGET}?` }),
    from('MPConfirmOptions', 'confirmLabel', { type: `${WIDGET}?` }),
    from('MPConfirmOptions', 'cancelLabel', { type: `${WIDGET}?` }),
    from('MPConfirmOptions', 'color', { type: 'MPColor?', default: 'MPColor.primary' }),
    from('MPConfirmOptions', 'size', { type: 'MPSize?', default: 'MPSize.md' }),
    from('MPConfirmOptions', 'dismissible', {
      type: 'bool?',
      default: 'true',
      description: {
        ko: 'Escape, 시스템 뒤로 가기, 바깥 누름이 **아니오**로 답하는지. 켜져 있는 이유는 나갈 수 없는 다이얼로그가 덫이고, "정말인가요"의 안전한 답이 아니오이기 때문입니다',
        en: 'Whether Escape, the system back and a press outside answer **no**. On by default, because a dialog a reader cannot leave is a trap and because the safe answer to "are you sure" is no'
      }
    }),
    {
      name: 'semanticLabel',
      type: 'String?',
      description: {
        ko: '다이얼로그가 열릴 때 화면 낭독기가 읽는 이름. 기본값은 `title`이 평범한 `Text`일 때 그 글자입니다',
        en: 'The name a screen reader gives the dialog as it opens. Defaults to the words of `title` when that is a plain `Text`'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
