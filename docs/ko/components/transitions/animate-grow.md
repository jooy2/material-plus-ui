---
title: MPAnimateGrow
order: 2
---

# MPAnimateGrow

<p class="mp-lede">한 점에서 펼쳐져 나오는 내용. 툴바에서 나오는 패널, 자기가 있던 행에서 나오는 카드, 자기를 불러낸 버튼에서 나오는 시트.</p>

<Demo src="animate-grow/hero" :minHeight="380" />

::: fw react

```tsx
import { MPAnimateGrow } from 'material-plus-ui';

<MPAnimateGrow origin="top">
  <MPCard title="Out of the toolbar" />
</MPAnimateGrow>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateGrow(
  origin: Alignment.topCenter,
  child: MPCard(title: Text('Out of the toolbar')),
);
```

:::

## Props

<PropsTable name="MPAnimateGrow" />

## 줌과 무엇이 다른가

`origin`, 그리고 얼마나 멀리 움직이는가입니다.

그로우는 최종 크기의 `0.8`에서 시작하고 어느 점에든 고정할 수 있어서, **옆에 있던 것에서 열려 나오는** 것으로 읽힙니다. 이동 거리가 짧으니 안의 내용이 애니메이션 대부분의 시간 동안 읽히고, 끝에 가서야 형태가 잡히는 얼룩이 되지 않습니다.

[MPAnimateZoom](./animate-zoom)은 절반도 안 되는 크기에서, 언제나 한가운데를 중심으로 시작합니다. 무언가에서 나오는 것이 아니라 읽는 사람 쪽으로 다가오는 것이고, 그것은 다른 종류의 내용에 대한 다른 문장입니다.

이것은 컴포넌트 라이브러리가 MD3의 **container transform**에 닿을 수 있는 가장 가까운 지점입니다. 명세의 그것은 한 요소의 경계를 다른 요소의 경계로 변형시키는 것이라 두 요소와 그 사이의 정체성이 모두 필요합니다. 감싸는 쪽 혼자 할 수 있는 절반 — 도착지가 자기가 나온 자리에서 펼쳐지는 것 — 만이 옮겨올 수 있습니다.

## 왜 transform이 아니라 `transform-origin`인가

::: fw react

`origin`은 `transform-origin`을 설정하고, 이 속성은 `transform` 단축 속성뿐 아니라 독립 `scale` 속성도 지배합니다. 애니메이션 자체는 `scale`만 쓰므로, 같은 요소에 걸린 호출자의 `transform`은 덮이지 않고 살아남습니다.

호출자가 자기 `style`에 준 `transformOrigin`이 여전히 이기는 이유도 같습니다. prop은 호출자의 style 객체보다 뒤가 아니라 앞에 쓰입니다.

:::

::: fw flutter

Flutter에서 `origin`은 내용 둘레에 그리는 순간 거는 확대의 정렬점입니다. 확대는 그 자체로 하나의 변환이라서, 위젯 안팎에 호출하는 쪽이 건 `Transform`은 그대로 남고, 도는 동안 위젯 옆에 있는 것이 다시 배치되지도 않습니다.

:::

## 예제

<Demo src="animate-grow/origin" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/animate-grow/origin.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_grow/origin.dart

:::

</Demo>

### origin

::: fw react

CSS `transform-origin`이면 무엇이든 됩니다. `'top'`은 아래로 펼쳐지고, `'bottom left'`는 모서리에서 나오며, 기본값인 `'center'`는 한가운데에서 나옵니다.

내용이 나온 자리에 고정하세요. 버튼 아래 메뉴는 `'top'`에서 자라고, 그리드에서 펼쳐지는 카드는 자기가 앉아 있던 모서리에서 자랍니다.

:::

::: fw flutter

`AlignmentGeometry`를 받습니다. `Alignment.topCenter`는 아래로 펼쳐지고, `Alignment.bottomLeft`는 모서리에서 나오며, 기본값인 `Alignment.center`는 한가운데에서 나옵니다. `AlignmentDirectional`은 읽기 방향을 따르므로, `AlignmentDirectional.topStart`는 영어에서도 아랍어에서도 글이 시작하는 쪽 모서리입니다.

내용이 나온 자리에 고정하세요. 버튼 아래 메뉴는 `Alignment.topCenter`에서 자라고, 그리드에서 펼쳐지는 카드는 자기가 앉아 있던 모서리에서 자랍니다.

:::

### from

최종 크기의 몇 배에서 시작할지. `1`보다 크면 크게 도착해 페이지 위로 내려앉습니다 — 열리는 것이 아니라 **놓이는** 것의 몸짓입니다.

### fade

기본으로 켜져 있습니다. 이미 페이지에 있고 크기만 바뀌는 것에는 꺼 두세요. 보고 있던 내용에 반복되는 페이드는 등장이 아니라 깜빡임으로 읽힙니다.

## 하나의 효과를 집합 전체에

`stagger`는 효과를 자식 단위로 바꿉니다. 상자가 펼쳐지는 대신 자식 하나하나가 자기 순서만큼 늦게 그렇게 합니다. `durationStep`은 각 자식에게 앞의 것보다 길거나 짧은 시간을 주고, `reverse`는 집합을 끝에서부터 재생합니다.

::: fw react

```tsx
<MPAnimateGrow stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateGrow>
```

:::

::: fw flutter

```dart
MPAnimateGrow(
  stagger: const Duration(milliseconds: 60),
  children: [for (final Item item in items) ItemTile(key: ValueKey(item.id), item: item)],
);
```

집합은 `child`가 아니라 `children`으로 넘기고, 배치는 `layoutBuilder`가 맡습니다. 아무 말도 없으면 세로로 쌓이고, 자식이 들어갈 행이나 그리드를 넘기면 그 안에 놓입니다.

:::

`stagger`가 설정되면 상자 자신은 아무것도 재생하지 않습니다. 같은 내용을 두 번 재생하면 아무도 요청하지 않은 세 번째 곡선이 되기 때문입니다. 세 prop의 근거는 [MPAnimateFade](./animate-fade#하나의-효과를-집합-전체에)에 자세히 적혀 있고, [MPAnimateAppear](./animate-appear)는 `stagger`가 이미 켜져 있는 이것입니다.

## 스크롤이 곧 시계입니다

::: fw react

`timeline="view"`는 애니메이션을 스톱워치가 아니라 읽는 사람의 스크롤에 넘깁니다. 진행도가 곧 요소가 스크롤포트를 지나는 진행도이고, `range`가 그 여정 중 어느 구간에 펼칠지를 말합니다.

```tsx
<MPAnimateGrow timeline="view">…</MPAnimateGrow>
```

`view`에서는 `duration`, `delay`, `repeat`, `trigger`가 의미를 잃고, 이 기능이 없는 브라우저는 시계로 되돌아가 한 번 재생합니다. 근거는 [MPAnimateFade](./animate-fade#스크롤이-곧-시계입니다)에 자세히 적혀 있습니다.

:::

::: fw flutter

제공하지 않습니다. CSS의 `view()` 타임라인에 대응하는 것이 Flutter에는 없고, 스크롤에 묶인 효과는 앱이 `ScrollPosition`으로 `AnimationController`를 움직여 직접 연결할 일입니다. 가장 가까운 것은 `MPAnimateTrigger.visible`로, 위젯이 스크롤해서 보이는 순간 진행을 시작합니다. [MPAnimateFade](./animate-fade#스크롤이-곧-시계입니다)를 보세요.

:::

## 접근성

::: fw react

- `prefers-reduced-motion`에서는 아무것도 확대되지 않고 내용이 최종 크기 그대로 있습니다.
- 크기를 바꾸면 안에 있는 것이, 글자를 포함해 다시 샘플링됩니다. 그로우가 지나는 짧은 거리와 읽는 사람이 뜯어볼 시간이 없는 `duration`에서는 괜찮지만, 본문 한 페이지를 감싸야 할 때 이것이 아니라 [MPAnimateFade](./animate-fade)를 쓰는 이유이기도 합니다.
- 내용은 첫 프레임부터 최종 레이아웃 크기로 문서 안에 있으므로, 애니메이션이 도는 동안 아래에 있는 것이 움직이지 않고 스크린 리더가 기다릴 일도 없습니다.

:::

::: fw flutter

- 플랫폼이 애니메이션을 끄면(`MediaQuery.disableAnimations`) 효과를 떨어뜨리고 내용을 첫 프레임부터 최종 크기 그대로 둡니다. 퇴장도, 트리거를 기다리는 중인 것도 마찬가지입니다.
- 크기를 바꾸면 안에 있는 것이, 글자를 포함해 다시 샘플링됩니다. 그로우가 지나는 짧은 거리와 읽는 사람이 뜯어볼 시간이 없는 `duration`에서는 괜찮지만, 본문 한 페이지를 감싸야 할 때 이것이 아니라 [MPAnimateFade](./animate-fade)를 쓰는 이유이기도 합니다.
- 확대는 그리는 순간에만 걸리고 내용은 첫 프레임부터 최종 크기로 배치되므로, 애니메이션이 도는 동안 옆에 있는 것이 움직이지 않습니다. 시맨틱스에도 첫 프레임부터 들어 있어 스크린 리더가 기다릴 일이 없습니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| CSS `transform-origin` 문자열인 `origin` | 기본값이 `Alignment.center`인 `AlignmentGeometry` | 상자 안의 한 점을 부르는 Flutter의 방식입니다. `AlignmentDirectional`은 읽기 방향을 따릅니다. |
| 밀리초 숫자인 `duration`, `delay`, `stagger`, `durationStep` | `Duration` | 프레임워크에 이미 그 타입이 있습니다. |
| `easing="emphasized-decelerate"` | `MPEasing.emphasizedDecelerate` | 이름마다 `MPMotion`의 곡선 하나에 대응합니다. 테마가 다시 조율할 스타일시트 토큰은 없습니다. |
| `repeat: number \| 'infinite'` | `null`이면 멈추지 않는 `int?`인 `MPAnimateRepeat` | Dart에는 숫자와 단어의 합집합 타입이 없습니다. |
| `mode="in" \| "out"` | `MPAnimateMode.enter` / `.exit` | `in`은 Dart의 예약어입니다. |
| 호출하는 쪽의 마크업이 배치하는 `children` | `child`, 또는 `children`과 `layoutBuilder` | 위젯은 받은 것을 직접 놓아야 하므로, 차례로 움직이는 집합은 어떻게 놓일지를 함께 말합니다. |
| `IntersectionObserver`로 보는 `trigger="visible"` | 위젯 위의 모든 `Scrollable`을 지켜봅니다 | 옵저버가 없습니다. 위에 스크롤 영역이 없으면 바로 시작합니다. |
| `timeline`, `range` | — | CSS의 `view()` 타임라인에 대응하는 것이 없습니다. |
| `render`, `className`, `style` | — | 바꿔 끼울 엘리먼트도, 넘겨줄 클래스 목록이나 style 속성도 없습니다. |
| 끝없는 효과가 화면 밖에서도 돕니다 | 조금도 보이지 않는 동안 쉽니다 | Flutter는 아무도 보지 못하는 애니메이션도 계속 그립니다. |

:::

## 함께 보기

- [MPAnimateZoom](./animate-zoom) — 같은 계산을 두 배 넘는 거리에서, 언제나 한가운데를 중심으로.
- [MPAnimateFade](./animate-fade) — 다시 샘플링되면 안 되는 내용에.
- [MPAnimateSlide](./animate-slide) — 제자리에서 펼쳐지는 대신 가장자리에서 들어오는 것.
