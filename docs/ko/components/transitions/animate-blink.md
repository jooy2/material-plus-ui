---
title: MPAnimateBlink
order: 7
---

# MPAnimateBlink

<p class="mp-lede">완전한 불투명도와 바닥값 사이를 오가며 맥동하는 내용. 녹화 표시등, 라이브 배지, 방금 바뀐 숫자 — 그리고 쓰기 전에 한 번은 따져 봐야 할 유일한 효과입니다.</p>

<Demo src="animate-blink/hero" :minHeight="220" />

::: fw react

```tsx
import { MPAnimateBlink } from 'material-plus-ui';

<MPAnimateBlink min={0.55}>
  <MPChip variant="tonal" color="error">
    3 checks failing
  </MPChip>
</MPAnimateBlink>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateBlink(
  min: 0.55,
  child: MPChip(
    variant: MPVariant.tonal,
    color: MPColor.error,
    child: Text('3 checks failing'),
  ),
);
```

:::

## Props

<PropsTable name="MPAnimateBlink" />

## 쓰기 전에 읽으세요

누군가 읽고 있는 페이지 구석에서 멈추지 않는 움직임은, 이 라이브러리가 다른 곳에서는 거부하는 유일한 종류의 움직임입니다. 두 가지가 따라오고, 둘 다 호출하는 쪽이 감당해야 합니다.

- **모션 감소를 설정한 사람은 이것을 전혀 보지 못합니다.** 깜빡임이 하려던 말은 내용에도 들어 있어야 합니다. 급한 일이면 말로도 쓰세요.
- **`min`은 사라짐이 아니라 어두워짐입니다.** `0`이면 매 주기의 절반 동안 요소가 정말로 없어집니다. 읽을 수 없게 되고, 다른 것들 사이에 있으면 누를 수 없는 것처럼 느껴집니다. 글자가 있는 것에는 바닥값을 올리세요.

내용이 아직 오지 않아서 맥동하는 자리표시자라면 이것은 맞지 않는 컴포넌트입니다. [MPSkeleton](../feedback/skeleton)은 진짜가 차지할 자리를 잡아 두고, 일을 하고 있던 것은 바로 그 부분입니다.

## 주기가 왜 대칭인가

가득, 흐리게, 가득. 몇 번을 돌든 시작한 자리에서 끝납니다.

::: fw react

가득에서 흐리게로 갔다가 멈추는 키프레임이라면, 횟수가 다 되는 순간 요소가 영영 반쯤 그려진 채로 남습니다 — 끝난 효과가 아니라 렌더링 결함으로 읽힙니다. `repeat`이 다른 곳에서는 `1`인데 여기서만 `infinite`인 이유이기도 합니다. 한 번의 깜빡임은 그냥 깜빡임이고, 아무도 그것을 요청하지 않습니다.

:::

::: fw flutter

가득에서 흐리게로 갔다가 멈추는 진행이라면, 횟수가 다 되는 순간 위젯이 영영 반쯤 그려진 채로 남습니다. 끝난 효과가 아니라 렌더링 결함으로 읽힙니다. `repeat`이 다른 곳에서는 `1`인데 여기서만 멈추지 않는 `null`인 이유이기도 합니다. 한 번의 깜빡임은 그냥 깜빡임이고, 아무도 그것을 요청하지 않습니다.

:::

## 여기서 숫자는 여정이 아니라 주기입니다

`duration`은 도착까지 걸리는 시간이 아니라 한 **주기** — `extra-long4`, 1초 — 입니다. 곡선도 다섯 개의 도착이 쓰는 emphasized decelerate가 아니라 `standard`입니다. 맥동에는 감속해 들어갈 목적지가 없고, 곧바로 떠날 프레임으로 부드럽게 들어가는 것은 더듬거림으로 읽힙니다.

::: fw flutter

길이를 비워 두면 `MPMotion.extraLong4`입니다. 곡선은 주기 전체가 아니라 반쪽마다 따로 걸립니다. 바닥으로 들어갈 때 한 번, 바닥에서 나올 때 한 번입니다. CSS 타이밍 함수가 진행 전체가 아니라 키프레임 두 개 사이마다 걸리는 것과 같습니다.

:::

## 하나의 효과를 집합 전체에

`stagger`는 효과를 자식 단위로 바꿉니다. 상자가 맥동하는 대신 자식 하나하나가 자기 순서만큼 늦게 그렇게 합니다. `durationStep`은 각 자식에게 앞의 것보다 길거나 짧은 시간을 주고, `reverse`는 집합을 끝에서부터 재생합니다.

::: fw react

```tsx
<MPAnimateBlink stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateBlink>
```

:::

::: fw flutter

```dart
MPAnimateBlink(
  stagger: const Duration(milliseconds: 60),
  children: [for (final Item item in items) ItemTile(key: ValueKey(item.id), item: item)],
);
```

집합은 `children`으로 넘기고 `layoutBuilder`가 배치합니다. 아무 말도 없으면 세로로 쌓입니다.

:::

`stagger`가 설정되면 상자 자신은 아무것도 재생하지 않습니다. 같은 내용을 두 번 재생하면 아무도 요청하지 않은 세 번째 곡선이 되기 때문입니다. 세 prop의 근거는 [MPAnimateFade](./animate-fade#하나의-효과를-집합-전체에)에 자세히 적혀 있고, [MPAnimateAppear](./animate-appear)는 `stagger`가 이미 켜져 있는 이것입니다.

## 스크롤이 곧 시계입니다

::: fw react

`timeline="view"`는 애니메이션을 스톱워치가 아니라 읽는 사람의 스크롤에 넘깁니다. 진행도가 곧 요소가 스크롤포트를 지나는 진행도이고, `range`가 그 여정 중 어느 구간에 펼칠지를 말합니다.

```tsx
<MPAnimateBlink timeline="view">…</MPAnimateBlink>
```

`view`에서는 `duration`, `delay`, `repeat`, `trigger`가 의미를 잃고, 이 기능이 없는 브라우저는 시계로 되돌아가 한 번 재생합니다. 근거는 [MPAnimateFade](./animate-fade#스크롤이-곧-시계입니다)에 자세히 적혀 있습니다.

:::

::: fw flutter

제공하지 않습니다. `timeline`과 `range`는 키프레임을 CSS의 `view()` 타임라인에 넘기는데, 여기에는 그에 대응하는 것이 없습니다. 스크롤에 묶인 맥동은 `ScrollPosition`으로 `AnimationController`를 움직이는 것이고, 앱이 직접 연결할 일입니다. 근거는 [MPAnimateFade](./animate-fade#스크롤이-곧-시계입니다)에 자세히 적혀 있습니다.

:::

## 접근성

::: fw react

- `prefers-reduced-motion`에서는 맥동이 완전히 멈추고 내용이 완전한 불투명도로 놓입니다.
- 번쩍이는 내용은 발작을 유발할 수 있습니다. 주기를 위험 구간 — 초당 3회 근처 — 에서 충분히 멀리 두고, `min`을 올려 명암 차이를 작게 유지하세요. 기본 주기 1초는 일부러 느립니다.
- 깜빡임은 접근성 트리에 전혀 닿지 않습니다. 스크린 리더는 내용이 말하는 것만 듣고 어떻게 그려지는지는 듣지 못합니다. 맥동이 "라이브"나 "실패"를 뜻한다면 내용도 그렇게 말해야 합니다.
- `paused`는 되감지 않고 맥동을 붙들어 둡니다. 자체 "애니메이션 줄이기" 스위치가 있는 페이지를 위한 prop입니다.

:::

::: fw flutter

- 플랫폼이 애니메이션을 끄면(`MediaQuery.disableAnimations`) 맥동이 완전히 멈추고 내용이 완전한 불투명도로 놓이며, 아무것도 틱하지 않습니다.
- 번쩍이는 내용은 발작을 유발할 수 있습니다. 주기를 위험 구간 — 초당 3회 근처 — 에서 충분히 멀리 두고, `min`을 올려 명암 차이를 작게 유지하세요. 기본 주기 1초는 일부러 느립니다.
- 깜빡임은 시맨틱스 트리에 전혀 닿지 않습니다. 스크린 리더는 내용이 말하는 것만 듣고 어떻게 그려지는지는 듣지 못합니다. 주기의 바닥에서도, `0`일 때도 내용은 트리에 남습니다. 맥동이 "라이브"나 "실패"를 뜻한다면 내용도 그렇게 말해야 합니다.
- `paused`는 되감지 않고 맥동을 붙들어 둡니다. 자체 "애니메이션 줄이기" 스위치가 있는 앱을 위한 매개변수입니다.
- 끝없는 맥동은 조금도 보이지 않는 동안 쉬다가, 돌아오면 같은 프레임에서 이어 갑니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 밀리초 숫자인 `duration`, `delay`, `stagger`, `durationStep` | `Duration` | 프레임워크에 이미 그 타입이 있습니다. |
| `easing="standard"` | `MPEasing.standard` | 이름마다 `MPMotion`의 곡선 하나에 대응합니다. 테마가 다시 조율할 스타일시트 토큰은 없습니다. |
| 기본값이 `'infinite'`인 `repeat: number \| 'infinite'` | 기본값이 `null`인 `int?`, `MPAnimateRepeat` | Dart에는 숫자와 단어의 합집합 타입이 없습니다. 멈추지 않는 값이 `null`입니다. |
| 키프레임 두 개 사이마다 걸리는 타이밍 함수 | 주기의 반쪽마다 걸리는 곡선 | Flutter의 진행에는 곡선이 하나뿐이라서, 위젯이 구간마다 직접 곡선을 걸어 같은 결과를 냅니다. |
| 호출하는 쪽의 마크업이 배치하는 `children` | `child`, 또는 `children`과 `layoutBuilder` | 위젯은 받은 것을 직접 놓아야 하므로, 차례로 움직이는 집합은 어떻게 놓일지를 함께 말합니다. |
| `IntersectionObserver`로 보는 `trigger="visible"` | 위젯 위의 모든 `Scrollable`을 지켜봅니다 | 옵저버가 없습니다. 위에 스크롤 영역이 없으면 바로 시작합니다. |
| `timeline`, `range` | — | CSS의 `view()` 타임라인에 대응하는 것이 없습니다. |
| `render`, `className`, `style` | — | 바꿔 끼울 엘리먼트도, 넘겨줄 클래스 목록이나 style 속성도 없습니다. |
| 끝없는 맥동이 화면 밖에서도 돕니다 | 조금도 보이지 않는 동안 쉽니다 | Flutter는 아무도 보지 못하는 애니메이션도 계속 그립니다. |

:::

## 함께 보기

- [MPSkeleton](../feedback/skeleton) — 내용이 아직 오지 않았을 때.
- [MPProgressLinear](../feedback/progress-linear) — 실제로 진행 중인 것에.
- [MPBadge](../display/badge) — 아무것도 움직이지 않고 눈에 띄어야 하는 숫자에.
