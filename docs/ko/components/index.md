---
title: 컴포넌트
order: 3
aside: false
---

# 모든 컴포넌트

<p class="mp-lede">지금까지 공개된 전부입니다. 카드 안의 미리보기는 그림이 아니라 실제로 동작하는 컴포넌트입니다.</p>

::: fw flutter

아래 갤러리는 **React** 빌드입니다. 라이브 미리보기 백여 개가 한 페이지에 있고 Flutter 미리보기는 하나하나가 엔진이라서, 각 컴포넌트의 Flutter 쪽은 그 컴포넌트 페이지에 있습니다.

목록은 두 패키지가 같습니다. DOM에만 있는 문제를 푸는 컴포넌트 세 개만 React 전용이고, Flutter에는 각각에 해당하는 답이 이미 있습니다.

| React 전용                                      | Flutter에서는              |
| ----------------------------------------------- | -------------------------- |
| [`MPFlex`](./layout/flex)                       | `Row`, `Column`, `Wrap`    |
| [`MPPortal`](./layout/portal)                   | `Overlay`, `OverlayPortal` |
| [`MPVisuallyHidden`](./display/visually-hidden) | `Semantics`                |

각 컴포넌트 페이지에 어느 패키지를 다루는지 적혀 있습니다.

:::

<Demo src="gallery/all" plain />

## 다음

- 같은 컴포넌트로 만든 완성된 화면은 [예제](../examples/overview)에 있습니다.
- 공유 prop이 뜻하는 것은 [Prop 규약](../design/prop-conventions)에 있습니다.
- 색상 롤과 바꾸는 방법은 [색상](../design/color)에 있습니다.
- 레이아웃이 창 크기에 따라 바뀌는 지점은 [브레이크포인트](../design/breakpoints)에 있습니다.
- 설치와 설정은 [시작하기](../guide/getting-started)에 있습니다.
