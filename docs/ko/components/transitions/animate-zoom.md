---
title: MPAnimateZoom
order: 3
---

# MPAnimateZoom

<p class="mp-lede">자기가 자리잡을 곳의 한가운데에서 도착하는 내용. 화면에서 끼어들어야 하는 단 하나를 위한 효과입니다 — 확인, 결과, 방금 도착한 숫자.</p>

<Demo src="animate-zoom/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateZoom } from 'material-plus-ui';

<MPAnimateZoom>
  <MPCard title="Payment received" />
</MPAnimateZoom>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateZoom(
  child: MPCard(title: Text('Payment received')),
);
```

:::

## Props

<PropsTable name="MPAnimateZoom" />

## 한 번만 쓰세요

줌은 끼어드는 것이고, 한 화면에서 세 번 일어나는 끼어듦은 레이아웃입니다. 여러 개가 도착해야 한다면 **묶음**으로 도착해야 합니다 — 그것이 [MPAnimateAppear](./animate-appear)이고, 거기서 효과는 그룹의 것이며 읽는 사람의 눈을 읽어야 할 순서대로 끌고 내려갑니다.

## `origin`이 없습니다

일부러입니다. 모서리에 고정된 줌은 [그로우](./animate-grow)이고, 이 라이브러리는 하나의 생각을 두 가지로 쓰지 않습니다.

::: fw react

한가운데는 스타일시트의 기본값에 맡기지 않고 요소에 직접 씁니다. 호출자의 규칙에서 상속된 `transform-origin`이 한 효과를 슬그머니 다른 효과로 바꾸지 못하도록.

:::

::: fw flutter

한가운데는 기본값에 맡기지 않고 확대 자체에 `Alignment.center`로 적습니다. 그래서 어느 읽기 방향에서든 한가운데이고, 위젯 주변의 무엇도 한 효과를 슬그머니 다른 효과로 바꾸지 못합니다.

:::

## 그로우와 같은 키프레임

::: fw react

둘 다 크기의 변화이므로 둘 다 `mp-anim-scale`을 돕니다. 똑같은 `@keyframes`가 하나 더 있으면 버그를 고칠 곳이 하나 더 생길 뿐입니다.

:::

::: fw flutter

둘 다 크기의 변화이므로 프레임을 같은 방식으로 그립니다. 그리는 순간 거는 확대와 불투명도입니다. 같은 것을 두 벌 두면 버그를 고칠 곳만 둘이 됩니다.

:::

둘을 가르는 것은 거리와 고정점입니다. 줌은 한가운데를 중심으로 `0.4`에서, 그로우는 지정한 곳을 중심으로 `0.8`에서 시작합니다. 몸짓은 둘, 계산은 하나입니다.

## 예제

<Demo src="animate-zoom/distance" :minHeight="300">

::: fw react

<<< @/.vitepress/demos/animate-zoom/distance.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_zoom/distance.dart

:::

</Demo>

### from

`1`보다 작으면 한가운데에서 앞으로 나옵니다. `1`보다 크면 크게 도착해 뒤로 물러앉는데, 읽는 사람 **쪽으로** 밀려오는 것으로 읽힙니다.

너무 낮은 값 — 대략 `0.2` 아래 — 은 이동 거리가 너무 길어서 애니메이션 대부분 동안 내용을 읽을 수 없습니다. 그것은 등장이 아니라 스플래시입니다.

### fade

기본으로 켜져 있고, 도착에는 켜 두는 편이 좋습니다. 첫 프레임들이 *작다*가 아니라 *아직 없다*로 읽히게 만드는 것이 불투명도이기 때문입니다.

## 하나의 효과를 집합 전체에

`stagger`는 효과를 자식 단위로 바꿉니다. 상자가 도착하는 대신 자식 하나하나가 자기 순서만큼 늦게 그렇게 합니다. `durationStep`은 각 자식에게 앞의 것보다 길거나 짧은 시간을 주고, `reverse`는 집합을 끝에서부터 재생합니다.

::: fw react

```tsx
<MPAnimateZoom stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateZoom>
```

:::

::: fw flutter

```dart
MPAnimateZoom(
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
<MPAnimateZoom timeline="view">…</MPAnimateZoom>
```

`view`에서는 `duration`, `delay`, `repeat`, `trigger`가 의미를 잃고, 이 기능이 없는 브라우저는 시계로 되돌아가 한 번 재생합니다. 근거는 [MPAnimateFade](./animate-fade#스크롤이-곧-시계입니다)에 자세히 적혀 있습니다.

:::

::: fw flutter

제공하지 않습니다. CSS의 `view()` 타임라인에 대응하는 것이 Flutter에는 없고, 스크롤에 묶인 효과는 앱이 `ScrollPosition`으로 `AnimationController`를 움직여 직접 연결할 일입니다. 가장 가까운 것은 `MPAnimateTrigger.visible`로, 위젯이 스크롤해서 보이는 순간 진행을 시작합니다. [MPAnimateFade](./animate-fade#스크롤이-곧-시계입니다)를 보세요.

:::

## 접근성

::: fw react

- `prefers-reduced-motion`에서는 아무것도 확대되지 않고 내용이 최종 크기 그대로 있습니다.
- 줌은 긴 거리에 걸쳐 안의 모든 것을 다시 샘플링하므로 문단을 감싸기에는 맞지 않습니다. 읽는 것이 아니라 보는 것 — 표제, 그림, 카드 — 에 두르고, 본문에는 [MPAnimateFade](./animate-fade)를 쓰세요.
- 내용은 첫 프레임부터 최종 레이아웃 크기를 차지하므로, 애니메이션이 도는 동안 주변이 움직이지 않습니다.
- 도착하는 것이 주의를 요구하는 것 — 확인, 오류 — 이라면 내용에도 그렇게 쓰세요. 움직임은 메시지가 아니고, 모션 감소를 설정한 사람은 그것을 영영 보지 못합니다.

:::

::: fw flutter

- 플랫폼이 애니메이션을 끄면(`MediaQuery.disableAnimations`) 효과를 떨어뜨리고 내용을 첫 프레임부터 최종 크기 그대로 둡니다. 퇴장도, 트리거를 기다리는 중인 것도 마찬가지입니다.
- 줌은 긴 거리에 걸쳐 안의 모든 것을 다시 샘플링하므로 문단을 감싸기에는 맞지 않습니다. 읽는 것이 아니라 보는 것 — 표제, 그림, 카드 — 에 두르고, 본문에는 [MPAnimateFade](./animate-fade)를 쓰세요.
- 확대는 그리는 순간에만 걸리고 내용은 첫 프레임부터 최종 크기로 배치되므로, 애니메이션이 도는 동안 주변이 움직이지 않습니다.
- 도착하는 것이 주의를 요구하는 것 — 확인, 오류 — 이라면 내용에도 그렇게 쓰세요. 움직임은 메시지가 아니고, 애니메이션을 끈 사람은 그것을 영영 보지 못합니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
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

- [MPAnimateGrow](./animate-grow) — 같은 계산을, 고정점을 두고, 절반도 안 되는 거리에서.
- [MPAnimateAppear](./animate-appear) — 여러 개가 묶음으로 도착할 때.
- [MPDialog](../feedback/dialog) — 끼어듦이 페이지까지 가져가야 할 때.
