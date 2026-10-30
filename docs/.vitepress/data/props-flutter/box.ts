import {
  densityRow,
  elevationRow,
  from,
  renamed,
  sizeRow,
  VARIANT,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPBox: [
    from('MPBox', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    sizeRow('MPBox'),
    densityRow('MPBox'),
    elevationRow('MPBox'),
    from('MPBox', 'padded', { type: 'bool', default: 'true' }),
    {
      name: 'clipBehavior',
      type: 'Clip',
      default: 'Clip.none',
      description: {
        ko: '시트 위의 것을 시트의 모서리에 맞춰 자를지. 자르면 자식이 바깥에 그리는 포커스 링도 잘리므로 기본은 꺼져 있습니다. React에서 `className`으로 `overflow-hidden`을 더하는 자리입니다',
        en: "Whether what is on the sheet is cut to the sheet's corners. Off by default, because a clip also cuts off a focus ring a child draws outside itself. Where React adds `overflow-hidden` through `className`"
      }
    },
    renamed('MPBox', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
