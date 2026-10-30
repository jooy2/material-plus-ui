---
title: MPAnimateSlide
order: 4
---

# MPAnimateSlide

<p class="mp-lede">한쪽 가장자리에서 이동해 들어오는 내용. 요소가 움직일 뿐 레이아웃은 움직이지 않습니다 — 도는 동안 페이지의 어떤 것도 다시 흐르지 않습니다.</p>

<Demo src="animate-slide/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateSlide } from 'material-plus-ui';

<MPAnimateSlide from="left">
  <MPCard title="From behind the edge" />
</MPAnimateSlide>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateSlide(
  from: MPSide.left,
  child: MPCard(title: Text('From behind the edge')),
);
```

:::

## Props

<PropsTable name="MPAnimateSlide" />

## 방향은 관계입니다

이것은 하나의 래퍼가 제공할 수 있는 규모의 MD3 **shared axis** 전환입니다. 서로 관련된 것들은 같은 선을 따라 움직이고, 읽는 사람은 그 방향을 관계로 읽습니다. 앞으로 가는 단계는 끝 쪽 가장자리에서 오고, 뒤로 가는 단계는 시작 쪽에서 오며, 위 바에 속한 패널은 위에서 내려옵니다.

그러니 `from`은 취향의 결정이 아니라 내용이 어디에서 왔는지에 대한 진술입니다. 한 화면에 네 개의 슬라이드가 각각 다른 가장자리에서 들어온다면 아무 말도 하지 않는 것입니다.

## 기본 이동 거리가 왜 `100%`인가

::: fw react

`100%`는 요소 **자신의** 너비 또는 높이라서, 정확히 화면 밖에서 시작합니다 — 있어서는 안 될 자리에 반쯤 그려지는 일이 없고, 무엇을 측정할 필요도 없습니다.

`overflow: hidden`인 컨테이너 안에 넣으면 그 컨테이너의 가장자리 뒤에서 패널이 나타나는 효과가 됩니다. 없으면 내용이 요소 하나 너비만큼 떨어진 곳에서 시작해 들어옵니다.

:::

::: fw flutter

`distance`를 비워 두면(`null`) 위젯 **자신의** 너비 또는 높이라서, 정확히 화면 밖에서 시작합니다. 있어서는 안 될 자리에 반쯤 그려지는 일이 없고, 누군가 잰 숫자에 기댈 필요도 없습니다.

`ClipRect` 안에 넣으면 그 상자의 가장자리 뒤에서 패널이 나타나는 효과가 됩니다. 없으면 내용이 위젯 하나 너비만큼 떨어진 곳에서 시작해 들어옵니다.

:::

짧은 `distance`는 다른 몸짓입니다. 이미 대체로 제자리에 있는 내용을 위한, 자리잡음입니다.

## 가장자리는 물리적입니다

`from`은 `MPSide`를 받고, 이 값은 RTL에서도 `top` / `right` / `bottom` / `left` 그대로입니다 — [MPTooltip](../feedback/tooltip)과 팝업들이 하는 것과 같은 선택입니다. 여기에는 뒤집을 읽기 순서가 없고 화면 가장자리만 있습니다. 창 위쪽에서 내려오는 것은 어떤 언어에서든 위에서 옵니다.

뒤집혀야 _하는_ 이동 — 흐름에서 앞으로 가는 단계 — 이라면, 흐름의 방향을 아는 코드에서 문서 방향에 맞는 쪽을 넘기세요.

## 예제

<Demo src="animate-slide/axis" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/animate-slide/axis.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_slide/axis.dart

:::

</Demo>

### distance

::: fw react

CSS 길이 또는 픽셀 숫자입니다. `'100%'`는 화면 밖이고, `'1.5rem'` 같은 짧은 값은 제자리에서의 자리잡음입니다 — 두 화면 사이의 shared axis 단계가 보통 원하는 쪽입니다.

:::

::: fw flutter

논리 픽셀이고, 기본값 `null`은 위젯 자신의 크기입니다. `null`은 화면 밖이고, `24` 같은 짧은 값은 제자리에서의 자리잡음입니다. 두 화면 사이의 shared axis 단계가 보통 원하는 쪽입니다.

:::

### mode

::: fw react

`out`은 들어왔을 가장자리로 되돌아 나갑니다. 왼쪽에서 도착한 패널은 왼쪽으로 갑니다. 또한 더 짧습니다. 머터리얼이 퇴장에 그렇게 요구하기 때문입니다.

:::

::: fw flutter

`MPAnimateMode.exit`는 들어왔을 가장자리로 되돌아 나갑니다. 왼쪽에서 도착한 패널은 왼쪽으로 갑니다. 또한 더 짧습니다. 머터리얼이 퇴장에 그렇게 요구하기 때문입니다.

:::

## 하나의 효과를 집합 전체에

`stagger`는 효과를 자식 단위로 바꿉니다. 상자가 이동하는 대신 자식 하나하나가 자기 순서만큼 늦게 그렇게 합니다. `durationStep`은 각 자식에게 앞의 것보다 길거나 짧은 시간을 주고, `reverse`는 집합을 끝에서부터 재생합니다.

::: fw react

```tsx
<MPAnimateSlide stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateSlide>
```

:::

::: fw flutter

```dart
MPAnimateSlide(
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
<MPAnimateSlide timeline="view">…</MPAnimateSlide>
```

`view`에서는 `duration`, `delay`, `repeat`, `trigger`가 의미를 잃고, 이 기능이 없는 브라우저는 시계로 되돌아가 한 번 재생합니다. 근거는 [MPAnimateFade](./animate-fade#스크롤이-곧-시계입니다)에 자세히 적혀 있습니다.

:::

::: fw flutter

제공하지 않습니다. CSS의 `view()` 타임라인에 대응하는 것이 Flutter에는 없고, 스크롤에 묶인 효과는 앱이 `ScrollPosition`으로 `AnimationController`를 움직여 직접 연결할 일입니다. 가장 가까운 것은 `MPAnimateTrigger.visible`로, 위젯이 스크롤해서 보이는 순간 진행을 시작합니다. [MPAnimateFade](./animate-fade#스크롤이-곧-시계입니다)를 보세요.

:::

## 접근성

::: fw react

- `prefers-reduced-motion`에서는 아무것도 이동하지 않고 내용이 최종 위치에 그대로 있습니다.
- 애니메이션은 `translate`이므로 레이아웃 안에서 요소의 박스는 전혀 움직이지 않습니다. 슬라이드가 도는 동안 아래에 있는 것이 밀리지 않고, 페이지 중간을 읽던 사람이 흔들리지 않습니다.
- 슬라이드는 글자를 확대하지는 않지만 _움직이기는_ 합니다. 움직이는 글자는 멈춘 글자보다 읽기 어렵습니다. 문단 위를 길게 이동하는 것은 줌과 같은 이유로 피하는 편이 좋고, 본문에 안전한 래퍼는 [MPAnimateFade](./animate-fade)입니다.
- 내용은 첫 프레임부터 최종 크기로 문서 안에 있으므로 스크린 리더가 애니메이션을 기다리지 않습니다.

:::

::: fw flutter

- 플랫폼이 애니메이션을 끄면(`MediaQuery.disableAnimations`) 효과를 떨어뜨리고 내용을 첫 프레임부터 최종 위치에 그대로 둡니다. 퇴장도, 트리거를 기다리는 중인 것도 마찬가지입니다.
- 애니메이션은 그리는 순간에만 거는 이동이라서 레이아웃 안에서 위젯의 상자는 전혀 움직이지 않습니다. 슬라이드가 도는 동안 옆에 있는 것이 밀리지 않고, 화면 중간을 읽던 사람이 흔들리지 않습니다.
- 슬라이드는 글자를 확대하지는 않지만 _움직이기는_ 합니다. 움직이는 글자는 멈춘 글자보다 읽기 어렵습니다. 문단 위를 길게 이동하는 것은 줌과 같은 이유로 피하는 편이 좋고, 본문에 안전한 래퍼는 [MPAnimateFade](./animate-fade)입니다.
- 내용은 첫 프레임부터 최종 크기로 시맨틱스 안에 있으므로 스크린 리더가 애니메이션을 기다리지 않습니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| CSS 길이나 픽셀 숫자인 `distance`, 기본값 `'100%'` | 논리 픽셀인 `double?`, 기본값 `null`은 위젯 자신의 크기 | Flutter에는 CSS 길이가 없고, 백분율이 필요했던 경우는 자기 크기 하나였습니다. |
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

- [MPAnimateAppear](./animate-appear) — 같은 이동을 훨씬 짧게, 목록의 자식마다 차례로.
- [MPDrawer](../layout/drawer) — 들어오는 것이 스크림과 포커스 트랩과 Escape 키를 가진 진짜 패널일 때.
- [MPAnimateFade](./animate-fade) — 전혀 움직이면 안 되는 내용에.
