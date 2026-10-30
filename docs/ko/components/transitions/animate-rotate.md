---
title: MPAnimateRotate
order: 5
---

# MPAnimateRotate

<p class="mp-lede">한 점을 중심으로 도는 내용. 각도가 하나가 아니라 둘이라서, 한 컴포넌트가 제자리로 들어오는 회전과 끝나지 않는 회전 둘 다가 됩니다.</p>

<Demo src="animate-rotate/hero" :minHeight="240" />

::: fw react

```tsx
import { MPAnimateRotate } from 'material-plus-ui';

// 도착
<MPAnimateRotate>
  <MPIcon icon={ICONS['chevron-down']} />
</MPAnimateRotate>

// 회전
<MPAnimateRotate from={0} to={360} repeat="infinite" easing="linear" fade={false}>
  <MPIcon icon={ICONS.spinner} />
</MPAnimateRotate>
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

// `chevron`과 `spinner`는 앱이 쓰는 아이콘 묶음의 글리프입니다.

// 도착
MPAnimateRotate(child: MPIcon(icon: chevron));

// 회전
MPAnimateRotate(
  from: 0,
  to: 360,
  repeat: null,
  easing: MPEasing.linear,
  fade: false,
  child: MPIcon(icon: spinner),
);
```

:::

## Props

<PropsTable name="MPAnimateRotate" />

## 각도 둘, 효과 둘

`from` 하나만 있으면 **도착**입니다. 무언가가 제자리로 돌아 들어와 멈춥니다. 기본값이 그것입니다 — 반 바퀴 뒤에서 시작해 0도에서 끝납니다.

::: fw react

`from`과 `to`를 함께 주고 `repeat="infinite"`에 `easing="linear"`를 더하면 **회전**입니다. 끝나는 곳에서 시작하므로 착지하지도, 튀지도 않습니다. 이때는 `fade`를 꺼 두세요. 반복되는 불투명도 경사는 깜빡임으로 읽힙니다.

:::

::: fw flutter

`from`과 `to`를 함께 주고 `repeat: null`에 `easing: MPEasing.linear`를 더하면 **회전**입니다. 끝나는 곳에서 시작하므로 착지하지도, 튀지도 않습니다. 이때는 `fade`를 꺼 두세요. 반복되는 불투명도 경사는 깜빡임으로 읽힙니다.

:::

한 컴포넌트가 둘 다를 덮는 이유는, 두 번째 컴포넌트라는 것이 결국 같은 키프레임에 다른 이름을 붙인 것이기 때문입니다.

## 이것을 쓰면 안 되는 곳

**텍스트.** 회전한 단어는 길이 전체에 걸쳐 다시 샘플링되고, 90의 배수가 아닌 각도에서는 모든 획이 픽셀 사이에 떨어집니다. 회전은 이 라이브러리가 **글리프**에 이견 없이 허용하는 유일한 움직임이지만 — 셰브런은 컴포넌트 전체에서 다시 그려지는 대신 돌려집니다. 돌아간 화살표도 같은 화살표니까요 — 그 허용이 문장까지 이어지지는 않습니다.

::: fw react

**로딩 표시기.** 도는 표시는 무언가 움직이고 있다고 말하지만, 불확정 표시기는 무엇을 기다리는지 말하고 결과가 차지할 자리를 잡아 두어야 합니다. 그것이 [MPProgressCircular](../feedback/progress-circular)입니다. `prefers-reduced-motion`에서는 일부만 그린 호에서 멈춥니다. 움직이지 않아도 무언가 진행 중이라고 말하는 모양이고, 돌지 않은 장식은 잃은 것이 없습니다.

:::

::: fw flutter

**로딩 표시기.** 도는 표시는 무언가 움직이고 있다고 말하지만, 불확정 표시기는 무엇을 기다리는지 말하고 결과가 차지할 자리를 잡아 두어야 합니다. 그것이 [MPProgressCircular](../feedback/progress-circular)입니다. 애니메이션이 꺼져 있으면 일부만 그린 호에서 멈춥니다. 움직이지 않아도 무언가 진행 중이라고 말하는 모양이고, 돌지 않은 장식은 잃은 것이 없습니다.

:::

## 여기서는 `duration`이 더 깁니다

`long2` — 500ms — 로, 페이드의 `medium2`나 슬라이드의 `medium4`보다 깁니다. 반 바퀴는 불투명도 한 축보다 먼 여정이고, 같은 숫자에서는 서두르는 것으로 읽힙니다. duration 표에 하나의 숫자가 아니라 효과마다 한 줄이 있는 이유가 바로 이것입니다.

## 예제

### origin

::: fw react

CSS `transform-origin`이면 무엇이든 됩니다. 기본값은 한가운데이고, 경첩이 달린 것 — 자기 위쪽 가장자리를 축으로 열리는 패널, 밑동에서 도는 바늘 — 에는 다른 곳에 고정하세요.

[MPAnimateGrow](./animate-grow)처럼 `transform-origin`을 통해 독립 `rotate` 속성에 닿으므로, 효과는 `transform` 단축 속성을 건드리지 않고 호출자의 transform은 살아남습니다.

:::

::: fw flutter

`AlignmentGeometry`를 받습니다. 기본값은 `Alignment.center`이고, 경첩이 달린 것에는 다른 곳에 고정하세요. 자기 위쪽 가장자리를 축으로 열리는 패널은 `Alignment.topCenter`, 밑동에서 도는 바늘은 `Alignment.bottomCenter`입니다. `AlignmentDirectional`은 읽기 방향을 따릅니다.

[MPAnimateGrow](./animate-grow)처럼 회전은 그리는 순간 거는 그 자체의 변환이라서, 위젯 안팎에 호출하는 쪽이 건 `Transform`은 그대로 남습니다.

:::

### fade

도착에는 켜고, 회전에는 끄세요. prop 하나를 따로 둘 만한 세 번째 답은 없습니다.

## 하나의 효과를 집합 전체에

`stagger`는 효과를 자식 단위로 바꿉니다. 상자가 도는 대신 자식 하나하나가 자기 순서만큼 늦게 그렇게 합니다. `durationStep`은 각 자식에게 앞의 것보다 길거나 짧은 시간을 주고, `reverse`는 집합을 끝에서부터 재생합니다.

::: fw react

```tsx
<MPAnimateRotate stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateRotate>
```

:::

::: fw flutter

```dart
MPAnimateRotate(
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
<MPAnimateRotate timeline="view">…</MPAnimateRotate>
```

`view`에서는 `duration`, `delay`, `repeat`, `trigger`가 의미를 잃고, 이 기능이 없는 브라우저는 시계로 되돌아가 한 번 재생합니다. 근거는 [MPAnimateFade](./animate-fade#스크롤이-곧-시계입니다)에 자세히 적혀 있습니다.

:::

::: fw flutter

제공하지 않습니다. CSS의 `view()` 타임라인에 대응하는 것이 Flutter에는 없고, 스크롤에 묶인 효과는 앱이 `ScrollPosition`으로 `AnimationController`를 움직여 직접 연결할 일입니다. 가장 가까운 것은 `MPAnimateTrigger.visible`로, 위젯이 스크롤해서 보이는 순간 진행을 시작합니다. [MPAnimateFade](./animate-fade#스크롤이-곧-시계입니다)를 보세요.

:::

## 접근성

::: fw react

- `prefers-reduced-motion`에서는 아무것도 돌지 않고 내용이 `to` 각도에 놓입니다 — 기본값이면 똑바로 선 상태이고, 회전이면 호출자가 끝이라고 말한 자리입니다.
- 끝없는 회전은 누군가 읽고 있는 페이지 구석에서 멈추지 않는 움직임입니다. 이 라이브러리가 다른 곳에서는 거부하는 종류의 움직임이므로, 작고 장식적이어야 하며 메시지를 혼자 짊어져서는 안 됩니다.
- 회전은 레이아웃 박스를 바꾸지 않으므로 도는 요소 주변의 어떤 것도 움직이지 않습니다.

:::

::: fw flutter

- 플랫폼이 애니메이션을 끄면(`MediaQuery.disableAnimations`) 아무것도 돌지 않고 내용이 첫 프레임부터 `to` 각도에 놓입니다. 기본값이면 똑바로 선 상태이고, 회전이면 호출자가 끝이라고 말한 자리입니다. 설정이 켜져 있는 동안에는 아무것도 틱하지 않습니다.
- 끝없는 회전은 누군가 읽고 있는 화면 구석에서 멈추지 않는 움직임입니다. 이 라이브러리가 다른 곳에서는 거부하는 종류의 움직임이므로, 작고 장식적이어야 하며 메시지를 혼자 짊어져서는 안 됩니다. 조금도 화면에 보이지 않는 동안에는 쉽니다.
- 회전은 그리는 순간에만 걸리고 레이아웃 상자를 바꾸지 않으므로, 도는 위젯 주변의 어떤 것도 움직이지 않습니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| CSS `transform-origin` 문자열인 `origin` | 기본값이 `Alignment.center`인 `AlignmentGeometry` | 상자 안의 한 점을 부르는 Flutter의 방식입니다. `AlignmentDirectional`은 읽기 방향을 따릅니다. |
| 각도 숫자인 `from`, `to` | 각도인 `double` | 단위는 같고, 소수가 있는 값을 Dart가 쓰는 타입으로 받습니다. |
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

- [MPProgressCircular](../feedback/progress-circular) — 도는 것이 장식이 아니라 기다림에 대한 것일 때.
- [MPAnimateGrow](./animate-grow) — `origin`을 받는 또 하나의 효과.
- [MPAnimateBlink](./animate-blink) — 또 하나의 무한 효과이고, 같은 주의가 그대로 적용됩니다.
