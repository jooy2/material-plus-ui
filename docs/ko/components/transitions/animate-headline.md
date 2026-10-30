---
title: MPAnimateHeadline
order: 16
---

# MPAnimateHeadline

<p class="mp-lede">한 줄이 위의 줄을 대신하며 도는 릴. 어느 것이었어도 괜찮았을 문구 묶음을 위한 것입니다 — 제품이 무엇인지 말하는 세 가지 방법, 돌아가며 나오는 지역 이름.</p>

<Demo src="animate-headline/hero" :minHeight="200" />

::: fw react

```tsx
import { MPAnimateHeadline } from 'material-plus-ui';

<MPAnimateHeadline interval={2200}>
  <MPTypography level="h4">a component library</MPTypography>
  <MPTypography level="h4">Material Design 3</MPTypography>
</MPAnimateHeadline>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateHeadline(
  interval: Duration(milliseconds: 2200),
  children: [
    MPTypography('a component library', level: MPTypographyLevel.h4),
    MPTypography('Material Design 3', level: MPTypographyLevel.h4),
  ],
);
```

:::

## Props

<PropsTable name="MPAnimateHeadline" />

## 상자는 크기가 변하지 않습니다

::: fw react

모든 줄이 **같은 그리드 칸**에 있으므로, 릴은 첫 프레임부터 가장 긴 줄만큼 높고 넓습니다. 이 효과의 어려움 전부가 여기 있습니다. 돌면서 크기가 변하는 헤드라인은 한 문장에 네 번씩 아래의 모든 것을 밀고, 페이지 중간을 읽던 사람은 2초마다 흔들립니다.

보이지 않는 줄들이 `display`가 아니라 `visibility`로 자리를 지키는 이유이기도 합니다. 레이아웃에서 빼면 상자 크기에 대한 그들의 기여도 함께 사라집니다.

:::

::: fw flutter

모든 줄이 **같은 자리에 겹쳐** 있으므로, 릴은 첫 프레임부터 가장 큰 줄만큼 높고 넓습니다. 이 효과의 어려움 전부가 여기 있습니다. 돌면서 크기가 변하는 헤드라인은 한 문장에 네 번씩 아래의 모든 것을 밀고, 화면 중간을 읽던 사람은 2초마다 흔들립니다.

보이지 않는 줄들이 자리만 지키고 나머지는 하지 않는 이유이기도 합니다. 그려지지도, 눌리지도, 읽히지도 않지만 배치는 그대로 됩니다. 트리에서 빼면 상자 크기에 대한 그들의 기여도 함께 사라집니다.

:::

## 문장 안에서

::: fw react

루트는 `<div>`입니다. 제목 옆에서는 맞지만 문단 안에서는 틀립니다. HTML 파서는 `<p>` 뒤에 `<div>`를 만나면 문단을 닫으므로, 서버가 보낸 페이지와 React가 렌더링한 페이지가 달라지고 그 차이 때문에 하이드레이션이 실패합니다. 텍스트 한 줄 안에 들어가는 릴이라면 `render={<span />}`을 넘기고, 각 줄도 인라인 요소로 쓰세요. `MPAnimateTyping`, `MPAnimateScramble`, `MPAnimateSplit`도 같은 prop을 받습니다.

:::

::: fw flutter

릴은 상자라서 주변 글의 문단 안이 아니라 그 옆에 놓입니다. 히어로 데모처럼 앞에 오는 글과 함께 `Wrap`에 넣거나, 둘을 기준선에 맞추려면 `CrossAxisAlignment.baseline`을 준 `Row`에 넣으세요.

:::

## 티커가 아닙니다

한 줄이 올라오고, **멈추고**, 읽을 만큼 머무릅니다.

`interval`은 주기의 시작이 아니라 줄이 도착한 순간부터 셉니다. 그래서 그것은 읽는 시간입니다 — 전환을 느리게 하려고 `duration`을 올려도 그 시간을 잡아먹지 않습니다.

## emphasized 곡선의 두 절반

::: fw react

MD3의 `emphasized-decelerate`와 `emphasized-accelerate`가 둘 다 쓰여 있는 라이브러리 유일한 자리입니다. 다른 곳에서는 퇴장이 등장을 거꾸로 돌린 것이고 그러면 곡선이 공짜로 뒤집힙니다. 하지만 여기서는 둘이 정말로 같은 순간, 두 요소 위의 두 애니메이션입니다. 도착하는 줄은 감속해 자리를 잡고, 떠나는 줄은 가속해 사라집니다.

:::

::: fw flutter

MD3의 `emphasizedDecelerate`와 `emphasizedAccelerate`가 둘 다 쓰여 있는 라이브러리 유일한 자리입니다. 다른 곳에서는 퇴장이 등장을 거꾸로 돌린 것이고 곡선도 함께 뒤집힙니다. 하지만 여기서는 둘이 정말로 같은 순간, 두 줄 위의 두 애니메이션입니다. 도착하는 줄은 감속해 자리를 잡고, 떠나는 줄은 가속해 사라집니다. `easing`을 주면 두 줄 모두 그 곡선 하나를 탑니다.

:::

## 예제

<Demo src="animate-headline/controlled" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/animate-headline/controlled.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_headline/controlled.dart

:::

</Demo>

### index

`index`를 넘기면 릴은 **스스로 돌기를 멈춥니다**. 제어되는 헤드라인은 다른 누군가의 타이머이고, 그 아래에서 두 번째 타이머가 도는 것은 같은 상태를 두고 싸우는 일입니다.

폼의 단계, 탭, 어느 줄이 보여야 하는지 이미 아는 무엇이든 릴을 묶는 방법이 그것입니다. 제어하지 않는 경우에는 `onIndexChange`가 방금 올라온 줄을 알려 줍니다.

### loop

기본으로 켜져 있습니다. 끄면 릴은 마지막 줄에서 멈춰 그대로 있습니다 — 묶음이 아니라 순서가 원하는 것입니다.

### rise

::: fw react

줄이 올라오거나 나갈 때 이동하는 거리. `'100%'`는 줄 하나의 높이이고, 두 줄이 하나의 띠처럼 움직이게 만드는 값입니다. 더 짧으면 살짝 밀린 페이드로 읽힙니다.

:::

::: fw flutter

줄이 올라오거나 나갈 때 이동하는 거리, 논리 픽셀. 비워 두면(`null`) 줄 하나의 높이이고, 두 줄이 하나의 띠처럼 움직이게 만드는 값입니다. 더 짧으면 살짝 밀린 페이드로 읽힙니다.

:::

## 접근성

::: fw react

- 스크린 리더에게는 묶음이 아니라 그때 보이고 있는 줄이 주어집니다. 그러니 **읽는 사람이 반드시 봐야 하는 내용에는 쓰지 마세요.** 특정 줄이 떠 있는 2초 동안 누군가 보고 있으리라는 보장이 없습니다.
- `prefers-reduced-motion`에서도 릴은 계속 돕니다 — 문구 묶음이고, 첫 줄에서 멈추는 것은 다른 메시지가 되기 때문입니다 — 다만 줄이 이동하지 않고 교체됩니다.
- 중요한 것은 릴 바깥에 두거나, 읽는 사람이 직접 움직이는 무언가로 릴을 제어하세요.
- `paused`는 릴을 그 자리에 붙들고, 사람이 머무는 자리의 헤드라인에는 `trigger="hover"`도 고려할 만합니다.

:::

::: fw flutter

- 스크린 리더에게는 묶음이 아니라 그때 보이고 있는 줄이 주어집니다. 그러니 **읽는 사람이 반드시 봐야 하는 내용에는 쓰지 마세요.** 특정 줄이 떠 있는 2초 동안 누군가 보고 있으리라는 보장이 없습니다.
- 플랫폼이 애니메이션을 끄면(`MediaQuery.disableAnimations`) 릴은 계속 돕니다 — 문구 묶음이고, 첫 줄에서 멈추는 것은 다른 메시지가 되기 때문입니다 — 다만 줄이 이동하지 않고 한 프레임에 교체되며, 그 사이에는 아무것도 틱하지 않습니다.
- 중요한 것은 릴 바깥에 두거나, 읽는 사람이 직접 움직이는 무언가로 릴을 제어하세요.
- `paused`는 릴을 그 자리에 붙들고, 사람이 머무는 자리의 헤드라인에는 `MPAnimateTrigger.hover`도 고려할 만합니다. 포인터가 올라오거나 안쪽에 포커스가 와도 시작합니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `children`으로 넘기는 줄 | `List<Widget>`인 `children` | 줄마다 위젯이 하나이고, 릴이 그 수를 세야 합니다. |
| 한 그리드 칸에 놓고 `visibility`로 숨기는 줄 | 한 자리에 겹쳐 놓고, 올라와 있지 않은 줄은 자리만 지킨 채 그리기·누르기·시맨틱스에서 빠집니다 | 같은 답을 프레임워크의 말로 한 것입니다. |
| CSS 길이이고 기본값이 `'100%'`인 `rise` | 논리 픽셀 `double?`, `null`이면 줄 하나의 높이 | 상자의 백분율을 적을 방법이 없으므로 `null`이 상자 자신의 높이입니다. |
| 밀리초 숫자인 `duration`, `delay`, `interval` | `Duration` | 프레임워크에 이미 그 타입이 있습니다. |
| `easing="emphasized-decelerate"` | `MPEasing.emphasizedDecelerate` | 이름마다 `MPMotion`의 곡선 하나에 대응합니다. |
| `repeat: number \| 'infinite'` | `null`이면 멈추지 않는 `int?`인 `MPAnimateRepeat` | Dart에는 숫자와 단어의 합집합 타입이 없습니다. 여기서는 포인터가 떠날 때 hover 트리거가 릴을 멈추는지만 정합니다. |
| `IntersectionObserver`로 보는 `trigger="visible"` | 위젯 위의 모든 `Scrollable`을 지켜봅니다 | 옵저버가 없습니다. 위에 스크롤 영역이 없으면 바로 시작합니다. |
| 문장 안의 `render={<span />}` | — | 위젯은 상자입니다. 앞에 오는 글과 함께 `Row`나 `Wrap`에 놓으세요. |
| 스스로 도는 릴이 화면 밖에서도 돕니다 | 조금도 보이지 않는 동안 쉬고, 줄이 기다리던 남은 시간을 붙들어 둡니다 | Flutter는 아무도 보지 못하는 타이머도 계속 돌립니다. |

:::

## 함께 보기

- [MPAnimateTyping](./animate-typing) — 여러 줄을 바꾸는 대신 한 줄이 쓰여 나가는 것.
- [MPCarousel](../layout/carousel) — 읽는 사람이 진짜 컨트롤로 넘기는 묶음에.
- [MPAnimateMarquee](./animate-marquee) — 하나씩이 아니라 계속 흘러가는 묶음에.
