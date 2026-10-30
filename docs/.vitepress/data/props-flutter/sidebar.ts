import {
  COLOR,
  DENSITY,
  focusRows,
  from,
  renamed,
  SIZE,
  VARIANT,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPSidebar: [
    renamed('MPSidebar', 'children', 'child', { type: `${WIDGET}?` }),
    from('MPSidebar', 'side', { type: 'MPSidebarSide?', default: 'MPSidebarSide.start' }),
    from('MPSidebar', 'width', {
      type: 'double?',
      description: {
        ko: '열의 폭, 논리 픽셀 단위. 지정하지 않으면 `size`가 함의하는 폭입니다. `resizable`과 함께 쓰면 시작 폭일 뿐이고 드래그가 그 위에 덮어쓰지만, 새로 준 값은 드래그한 폭보다 우선합니다. 명시한 폭은 서랍이 되어도 유지됩니다',
        en: 'How wide the column is, in logical pixels. Left out, it is the width `size` implies. With `resizable` it is only the width the column starts at, and a drag writes over it, though a new value given here outranks the drag. An explicit width survives the change into a drawer'
      }
    }),
    from('MPSidebar', 'minWidth', { type: 'double', default: '160' }),
    from('MPSidebar', 'maxWidth', { type: 'double', default: '480' }),
    from('MPSidebar', 'resizable', { type: 'bool', default: 'false' }),
    from('MPSidebar', 'onResize', { type: 'ValueChanged<double>?' }),
    from('MPSidebar', 'onResizeEnd', {
      type: 'ValueChanged<double>?',
      description: {
        ko: '놓았을 때 같은 숫자와 함께 한 번 호출됩니다. 방향키 한 번은 그 자체로 끝난 동작이라 누를 때마다 호출됩니다',
        en: 'Called once, with the same number, when it is let go. An arrow key press is a whole gesture on its own and calls it every time'
      }
    }),
    from('MPSidebar', 'collapseBelow', {
      type: 'MPPageCollapse?',
      description: {
        ko: '열이 서랍이 되는 윈도우 크기 클래스. [MPPageLayout](./page-layout)의 값을 기본으로 하고, 레이아웃 밖에서는 `MPPageCollapse.none`입니다. 레이아웃 안에서는 레이아웃이 받은 폭과, 혼자일 때는 창의 폭과 비교합니다',
        en: "The window size class below which the column becomes a drawer. Defaults to the [MPPageLayout](./page-layout)'s own, and to `MPPageCollapse.none` outside one. Inside a layout it is compared with the width the layout was given; on its own, with the window's"
      }
    }),
    from('MPSidebar', 'open', { type: 'bool?' }),
    renamed('MPSidebar', 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from('MPSidebar', 'onOpenChange', { type: 'ValueChanged<bool>?' }),
    from('MPSidebar', 'title', { type: `${WIDGET}?` }),
    {
      name: 'variant',
      type: VARIANT,
      default: 'MPVariant.outlined',
      description: {
        ko: '열이 칠하는 표면의 양. `MPHeader`, `MPFooter`와 같은 바의 사다리입니다. `filled`는 `surfaceContainerHighest`, `tonal`은 `surfaceContainer`, `elevated`는 레벨 2 그림자 아래의 `surfaceContainerLow`, 기본값 `outlined`는 페이지 자신의 `surface`에 내용을 마주 보는 가장자리의 실선 하나, `text`는 아무것도 칠하지 않습니다. 사이드바는 물들이지 않습니다',
        en: "How much surface the column paints, on the bar ladder `MPHeader` and `MPFooter` use. `filled` is `surfaceContainerHighest`, `tonal` is `surfaceContainer`, `elevated` is `surfaceContainerLow` under a level-2 shadow, `outlined`, the default, is the page's own `surface` with a hairline on the edge that faces the content, and `text` paints nothing. A sidebar is never dyed"
      }
    },
    {
      name: 'elevation',
      type: 'int?',
      description: {
        ko: '열이 페이지에서 얼마나 떠 있는지, MD3의 단계로. 그림자와 함께 색조도 옮깁니다. 비워 두면 `variant`가 정합니다',
        en: "How far off the page the column is lifted, on MD3's own scale. It moves the tone as well as the shadow. Left unset, `variant` decides"
      }
    },
    {
      name: 'size',
      type: `${SIZE}?`,
      default: 'MPSize.md',
      description: {
        ko: '열의 기본 폭과 내용 둘레의 여백. `md`는 360으로 MD3 자신의 navigation drawer이고, 사이드바는 자신이 되는 서랍과 같은 폭입니다. 240, 288, 360, 416, 480',
        en: "The column's default width and the air around its content. `md` is 360, MD3's own navigation drawer, so a sidebar is exactly as wide as the drawer it becomes. 240, 288, 360, 416, 480"
      }
    },
    {
      name: 'density',
      type: `${DENSITY}?`,
      default: '0',
      description: {
        ko: '내용 둘레의 여백을 줄입니다. 폭은 `size`의 것이라 움직이지 않습니다',
        en: "Takes room out of the air around the column's content. The width is `size`'s and does not move"
      }
    },
    {
      name: 'padded',
      type: 'bool',
      default: 'true',
      description: {
        ko: '좌우 여백과 내용 위아래의 여백',
        en: 'The gutter, and the air above and below the content'
      }
    },
    from('MPSidebar', 'label', { type: 'String?' }),
    from('MPSidebar', 'locale', { type: 'String?' })
  ],
  MPSidebarTrigger: [
    from('MPSidebarTrigger', 'side', { type: 'MPSidebarSide', default: 'MPSidebarSide.start' }),
    from('MPSidebarTrigger', 'collapseBelow', { type: 'MPPageCollapse?' }),
    from('MPSidebarTrigger', 'icon', { type: `${WIDGET}?` }),
    from('MPSidebarTrigger', 'label', { type: 'String?' }),
    from('MPSidebarTrigger', 'locale', { type: 'String?' }),
    {
      name: 'variant',
      type: `${VARIANT}?`,
      default: 'MPVariant.text',
      description: {
        ko: '버튼이 칠하는 표면의 양. MD3의 표준 아이콘 버튼인 `text`가 기본입니다. 이미 표면인 바 위에 놓이기 때문입니다',
        en: "How much surface the button paints. `text`, MD3's standard icon button, by default, because it sits on a bar that is already a surface"
      }
    },
    {
      name: 'size',
      type: `${SIZE}?`,
      default: 'MPSize.md',
      description: {
        ko: '크기 사다리의 단. `MPConfigProvider`를 따르고, 없으면 `md`입니다',
        en: 'Which rung of the size ladder. Falls back to an `MPConfigProvider`, then to `md`'
      }
    },
    {
      name: 'color',
      type: `${COLOR}?`,
      default: 'MPColor.primary',
      description: { ko: '어느 강조색 계열을 읽을지', en: 'Which accent family it reads' }
    },
    {
      name: 'disabled',
      type: 'bool?',
      description: { ko: '버튼을 비활성화합니다', en: 'Disables the button' }
    },
    {
      name: 'onPressed',
      type: 'VoidCallback?',
      description: {
        ko: '사이드바에 열거나 닫으라고 요청한 다음 실행됩니다. React의 `onClick` 자리입니다',
        en: "Runs after the sidebar has been asked to open or close. React's `onClick`"
      }
    },
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
