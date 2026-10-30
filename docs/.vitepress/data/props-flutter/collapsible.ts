import {
  elevationRow,
  focusRows,
  from,
  renamed,
  sizeRow,
  VARIANT,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPCollapsible: [
    from('MPCollapsible', 'open', { type: 'bool?' }),
    renamed('MPCollapsible', 'defaultOpen', 'initialOpen', {
      type: 'bool',
      default: 'false',
      description: {
        ko: 'uncontrolled 콜랩서블이 처음에 열려 있을지. React의 `defaultOpen`입니다',
        en: "Whether an uncontrolled collapsible starts open. React's `defaultOpen`"
      }
    }),
    from('MPCollapsible', 'onOpenChange', { type: 'ValueChanged<bool>?' }),
    from('MPCollapsible', 'title', { type: `${WIDGET}?` }),
    from('MPCollapsible', 'subtitle', { type: `${WIDGET}?` }),
    from('MPCollapsible', 'startIcon', { type: `${WIDGET}?` }),
    from('MPCollapsible', 'action', { type: `${WIDGET}?` }),
    renamed('MPCollapsible', 'trigger', 'triggerBuilder', {
      type: 'Widget Function(BuildContext, bool open, VoidCallback toggle)?',
      description: {
        ko: '헤더 전체를 직접 만든 트리거로 바꿉니다. 열림 상태와 접었다 펴는 콜백을 받으므로, 상태는 `Semantics(expanded: open)`으로 직접 알리세요',
        en: 'Replaces the header with a trigger of your own. Handed whether the panel is open and a callback that toggles it; announce the state with `Semantics(expanded: open)`'
      }
    }),
    from('MPCollapsible', 'indicator', { type: 'bool', default: 'true' }),
    from('MPCollapsible', 'disabled', { type: 'bool', default: 'false' }),
    from('MPCollapsible', 'padded', { type: 'bool', default: 'true' }),
    from('MPCollapsible', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    elevationRow('MPCollapsible'),
    sizeRow('MPCollapsible'),
    from('MPCollapsible', 'keepMounted', { type: 'bool', default: 'false' }),
    renamed('MPCollapsible', 'children', 'child', { type: `${WIDGET}?` }),
    focusRows[0]
  ]
} satisfies Record<string, PropRow[]>;
