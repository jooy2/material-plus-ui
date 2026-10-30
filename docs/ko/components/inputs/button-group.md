---
title: MPButtonGroup
order: 2
---

# MPButtonGroup

<p class="mp-lede">함께 묶이는 버튼들의 한 줄입니다. 이웃과 맞닿는 모서리를 깎고, variant·size·color·비활성 상태를 버튼마다 반복하는 대신 묶음에 한 번만 설정합니다.</p>

<Demo src="button-group/hero" :minHeight="120" />

::: fw react

```tsx
import { MPButton, MPButtonGroup } from 'material-plus-ui';

<MPButtonGroup variant="outlined">
  <MPButton>이전</MPButton>
  <MPButton>다음</MPButton>
</MPButtonGroup>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPButtonGroup(
  variant: MPVariant.outlined,
  children: <Widget>[
    MPButton(onPressed: previous, child: const Text('이전')),
    MPButton(onPressed: next, child: const Text('다음')),
  ],
);
```

:::

## Props

<PropsTable name="MPButtonGroup" />

::: fw flutter

`children` 항목 하나가 줄의 구성원 하나입니다. 그룹은 구성원마다 스코프를 하나씩 둘러 줍니다. 그래서 `MPButton`, `MPIconButton`, `MPToggle`은 항목 안 어디에 있든 그룹의 `variant`, `size`, `color`, `disabled`를 읽고, 어느 모서리가 이웃을 향하는지 압니다.

:::

## 두 가지 일이 일어나고, 그중 하나만 시각적입니다

이웃과 맞닿는 모서리가 `corner-full`에서 `corner-small`로 깎입니다. 그래서 이 줄은 알약 세 개가 우연히 붙어 있는 것이 아니라 하나의 형태를 나눈 것으로 읽힙니다. 그것이 겉모습입니다.

나머지 절반은 `variant`, `size`, `color`, `disabled`가 한 번만 설정된다는 것입니다. 버튼 하나만 크기가 다른 묶음 — 이것이 이 컴포넌트가 막으려는 실패이고, 각 버튼은 따로 보면 모두 옳기 때문에 디자인 리뷰에서야 드러나는 종류의 실패입니다.

<Demo src="button-group/inheritance" :minHeight="200">

::: fw react

<<< @/.vitepress/demos/button-group/inheritance.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/button_group/inheritance.dart

:::

</Demo>

버튼 자신의 prop은 여전히 우선합니다. 보조 동작들 사이에 파괴적인 버튼 하나가 섞이는 것은 실제로 있는 일이고, 위의 세 번째 버튼이 바로 그것입니다.

## 이음매는 테두리가 아니라 간격입니다

filled 버튼 두 개가 맞닿으면 하나의 덩어리로 합쳐집니다. 그 사이에 그은 실선은 페이지에서 유일하게 *두 개의 면 사이*에 그어진 선이 되고요. MD3의 connected group은 대신 2px 간격을 씁니다. 두 번째 규칙 없이 모든 variant에서 작동합니다.

## 이것은 세그먼티드 컨트롤이 아닙니다

버튼들은 진짜 `MPButton`으로 남고, 그룹은 선택 상태를 관리하지 않습니다. 여럿 중 하나를 고르는 것이라면 [MPSegmentedButton](./segmented-button)을 쓰세요.

취향의 문제가 아닙니다. 눌린 버튼을 기억하는 버튼 줄은 스크린 리더에 "서로 관계없는 여러 동작, 그중 하나가 눌림으로 설명됨"으로 읽힙니다. 세그먼티드 버튼은 탭 정지가 하나이고 그 안에서 화살표 키가 움직이는 단일 컨트롤이며, "이 중 하나를 고르세요"는 실제로 그것입니다.

## 접근성

::: fw react

- 그룹은 `role="group"`을 갖습니다. roving tab index는 **없습니다**. 안의 버튼 하나하나가 각자의 탭 정지인데, 하나하나가 각자의 동작이기 때문입니다.
- 포커스 링은 버튼 바깥에 그려지므로 각 자식이 자기 stacking context를 갖고 포커스될 때 앞으로 나옵니다. 이것이 없으면 링이 DOM에서 뒤에 오는 이웃 밑에 깔립니다.

:::

::: fw flutter

- 그룹은 `semanticLabel`로 이름이 붙는 시맨틱 노드 하나이고, 버튼은 그 안에서 저마다 노드가 됩니다. 로빙 포커스는 쓰지 **않습니다**. 버튼 하나하나가 따로 하는 일이 있으니 정지점도 하나씩입니다.
- 포커스 링은 버튼 바깥에 그려지므로, 그룹은 포커스가 있는 구성원을 이웃 위에 그립니다. 그러지 않으면 링이 다음 버튼 아래에 깔립니다.
- 오른쪽에서 왼쪽으로 쓰는 화면에서는 줄이 오른쪽에서 시작하고, 이웃을 향한 모서리도 함께 바뀝니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `aria-label`을 단 `role="group"` | `semanticLabel`을 단 컨테이너 노드 | Flutter에는 group 역할이 없고, 이름 붙은 컨테이너가 스크린 리더가 들어서는 경계입니다. |
| 자식마다 쌓임 맥락 | 포커스가 있는 구성원을 마지막에 그림 | `z-index`가 없어서 줄이 직접 그리는 순서를 정합니다. |
| inline-flex의 늘이기 | 세로 줄은 가장 넓은 구성원에 맞춤 | 같은 모양을 줄의 레이아웃이 직접 만듭니다. |
| 그 밖의 `<div>` 속성 | — | 나머지 속성이 내려앉을 엘리먼트가 없습니다. |
| `className`, `ref` | — | 클래스 목록도 엘리먼트도 없습니다. |

:::

## 함께 보기

- [MPButton](./button) — 안에 들어가는 버튼.
- [MPSegmentedButton](./segmented-button) — 한 줄이 동작 묶음이 아니라 선택일 때.
