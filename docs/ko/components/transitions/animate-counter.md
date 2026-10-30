---
title: MPAnimateCounter
order: 17
---

# MPAnimateCounter

<p class="mp-lede">자기 값까지 세어 올라가는 숫자입니다. 여기서 혼자서는 keyframe이 될 수 없는 유일한 효과입니다.</p>

<Demo src="animate-counter/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateCounter } from 'material-plus-ui';

<MPAnimateCounter value={128_400} options={{ notation: 'compact' }} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPAnimateCounter(
  value: 128400,
  format: (double value) => '${(value / 1000).round()}K',
);
```

:::

## Props

<PropsTable name="MPAnimateCounter" />

::: fw react

## 그래도 CSS 애니메이션입니다

텍스트는 애니메이션 가능한 속성이 아닙니다. 세는 동작의 매 프레임마다 새로 보간한 값을 포매터에 통과시켜야 하므로 프레임 루프가 필요합니다. 그리고 뻔한 구현은 그 루프에 자기 시계, 자기 이징 곡선, 자기만의 *멈춤*의 정의를 줍니다. 그것은 선언된 여섯 효과와 발을 맞춰야 하는 것이 셋이라는 뜻이고, 맞춰지지 않습니다.

그래서 여기 애니메이션은 등록된 custom property에 대한 **진짜** 애니메이션이고, 루프는 값을 읽어 포맷하는 일만 합니다.

```css
@property --mp-count {
  syntax: '<number>';
  initial-value: 0;
  inherits: false;
}

@keyframes mp-anim-count {
  from {
    --mp-count: var(--_mp-anim-from, 0);
  }
  to {
    --mp-count: var(--_mp-anim-to, 0);
  }
}
```

애초에 보간이 되게 하는 것이 `@property`입니다. 등록된 syntax가 없으면 custom property는 문자열이고, 문자열은 50%에서 교체되는 방식으로 애니메이션됩니다.

그 대가로 나머지 전부가 공짜입니다. `duration`, `delay`, 이징 **토큰**은 다른 모든 효과가 읽는 것과 같은 것입니다. `trigger`와 `paused`가 동작합니다. `prefers-reduced-motion`이 동작합니다. `timeline="view"`도 동작하고, 제대로 동작해서 되돌려 스크롤하면 숫자가 다시 내려갑니다.

:::

::: fw flutter

## 같은 기계 위에서 돕니다

텍스트는 진행이 보간할 수 있는 것이 아닙니다. 세는 동작의 매 프레임마다 새 값을 포매터에 통과시켜야 하고, 뻔한 구현은 거기에 자기 시계, 자기 이징 곡선, 자기만의 *멈춤*의 정의를 줍니다. 다른 효과들과 발을 맞춰야 하는 것이 셋이라는 뜻이고, 맞춰지지 않습니다.

그래서 숫자 세기도 다른 모든 효과와 같은 진행, 페이드가 그려지는 바로 그 진행이고, 매 프레임 `from + (value - from) × t`를 포매터로 씁니다. 그러면 `duration`, `delay`, 이징 곡선, `trigger`, `paused`, 모션 감소가 각각을 두 번째로 구현한 것이 아니라 나머지 묶음이 쓰는 같은 기계가 됩니다.

:::

## 기다릴 때는 답이 아니라 `from`을 보여 줍니다

::: fw react

선언된 모든 효과는 무언가가 시작시킬 때까지 자기 첫 프레임에 멈춰 있습니다. `animation-fill-mode: both`가 그것을 위한 것입니다. 자기 시계로 도는 카운터는 그것을 _가르쳐야_ 하고, 가르치지 않은 구현이 바로 스크롤로 시야에 들어오기를 기다리면서 이미 `1,284`를 표시하고 있는 버전입니다. 곧 던질 질문에 이미 답해 버린 것입니다.

여기서는 그것이 공짜로 옵니다. 기다리는 상태가 멈춘 애니메이션이고, 멈춘 애니메이션은 `from`에 앉아 있기 때문입니다.

:::

::: fw flutter

모든 효과는 무언가가 시작시킬 때까지 자기 첫 프레임에 머뭅니다. 자기 시계로 도는 카운터는 그것을 _가르쳐야_ 하고, 가르치지 않은 구현이 바로 스크롤로 시야에 들어오기를 기다리면서 이미 `1,284`를 표시하고 있는 버전입니다. 곧 던질 질문에 이미 답해 버린 것입니다.

여기서는 그것이 공짜로 옵니다. 트리거를 기다리는 진행은 첫 프레임에 붙들려 있고, 카운터의 첫 프레임이 `from`이기 때문입니다.

:::

## 포맷

::: fw react

`options`는 `Intl.NumberFormat`이 받는 무엇이든입니다. 그래서 통화, 백분율, 축약 표기가 템플릿이 아니라 prop입니다.

```tsx
<MPAnimateCounter value={1234.5} locale="de-DE" options={{ style: 'currency', currency: 'EUR' }} />
```

이어 붙이는 대신 포맷하는 이유는 숫자의 조각들이 어디서나 같은 순서가 아니기 때문입니다. `$1,234.50`과 `1.234,50 €`는 같은 값이고, `prefix`/`suffix` 한 쌍으로는 둘 중 하나만 쓸 수 있습니다.

`format`은 `Intl`에 옵션이 없는 숫자들 — 서수, 10점 만점, 소요 시간 — 을 위해 포매터 전체를 받습니다.

숫자는 `tabular-nums`로 조판됩니다. 그러지 않으면 `1`이 `8`로 바뀌는 프레임마다 타일이 옆으로 흔들립니다. 세는 동안 떠는 통계는 아예 세지 않는 통계보다 나쁩니다.

:::

::: fw flutter

패키지에는 `Intl`이 없으므로 `format`이 그 일을 통째로 맡습니다. 비워 두면 천 단위를 쉼표로 묶고 소수 셋째 자리까지 씁니다. `128,400`, `0.999`처럼, `Intl.NumberFormat`이 옵션 없이 영어로 쓰는 모양입니다.

통화, 백분율, 축약 표기, 다른 언어의 구분 기호는 직접 쓰는 `format`입니다.

```dart
MPAnimateCounter(
  value: 0.9992,
  format: (double value) => '${(value * 100).toStringAsFixed(2)}%',
);
```

매 프레임과 스크린 리더용 사본에 같은 함수를 쓰므로, 둘이 다른 말을 하는 일은 없습니다.

숫자는 `style`이 무엇이든 `FontFeature.tabularFigures()`로 조판됩니다. 그러지 않으면 `1`이 `8`로 바뀌는 프레임마다 숫자가 옆으로 흔들립니다. 세는 동안 떠는 통계는 아예 세지 않는 통계보다 나쁩니다.

:::

::: fw react

## 백그라운드 탭에서

`requestAnimationFrame`은 아무도 보고 있지 않은 탭에서는 돌지 않습니다. 그래서 백그라운드에 둔 카운터는 `from`에 머물러 있다가 돌아오면 값으로 점프합니다. 그동안 내내 "돌고 있던" 셈입니다.

그것이 옳은 동작이고 — 독자는 자기가 보러 온 숫자를 봅니다 — 누군가 버그로 신고하기 전에 알아 둘 만합니다.

:::

::: fw flutter

## 백그라운드에서

백그라운드에 있는 앱은 프레임을 그리지 않으므로, 그 사이에 돌던 카운터는 아예 그려지지 않습니다. 진행은 멈춘 동안에도 계속 가는 프레임 시계로 재므로, 앱이 돌아오면 숫자는 그 시간이 가리키는 자리에 있고 대개는 이미 값에 닿아 있습니다.

그것이 옳은 동작이고 — 독자는 자기가 보러 온 숫자를 봅니다 — 누군가 버그로 신고하기 전에 알아 둘 만합니다.

:::

## 접근성

::: fw react

- 스크린 리더는 잘린 상자에서 **최종 숫자**를 한 번 받습니다. 세는 사본은 `aria-hidden`입니다. 실시간으로 세면 초당 예순 번 읽히고, 통계에서 독자가 원하는 단 하나는 그 통계입니다.
- `prefers-reduced-motion`에서는 애니메이션이 빠지고 숫자가 그냥 거기 있습니다.
- 값은 첫 프레임부터 문서 안에 있으므로, 세는 것이 끝나기 전에도 페이지 내 찾기가 매치됩니다.

:::

::: fw flutter

- 스크린 리더는 `Semantics` 노드의 라벨로 **최종 숫자**를 한 번 받습니다. 세는 사본은 시맨틱스에서 빠집니다. 실시간으로 세면 프레임마다 읽히고, 통계에서 독자가 원하는 단 하나는 그 통계입니다.
- 플랫폼이 애니메이션을 끄면(`MediaQuery.disableAnimations`) 세기가 빠지고, 트리거가 무엇을 기다리든 숫자가 첫 프레임부터 그냥 거기 있습니다.
- 라벨은 첫 프레임부터 값이므로, 세는 도중에 도착한 독자도 값으로 가는 중간 숫자가 아니라 답을 듣습니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 밀리초 숫자인 `duration`, `delay` | `Duration` | 프레임워크에 이미 그 타입이 있습니다. |
| `easing="emphasized-decelerate"` | `MPEasing.emphasizedDecelerate` | 이름마다 `MPMotion`의 곡선 하나에 대응합니다. |
| `Intl.NumberFormat`에 넘기는 `options`와 `locale` | `String Function(double)`인 `format` | 패키지에는 물어볼 `intl`이 없습니다. 비워 두면 천 단위로 묶고 소수 셋째 자리까지 영어로 씁니다. |
| 매 프레임 읽는 등록된 custom property | 매 프레임 쓰는 공용 진행의 진행도 | 속성을 애니메이션할 스타일시트가 없습니다. 진행은 다른 모든 효과가 쓰는 것과 같습니다. |
| 스타일시트의 `tabular-nums`, 나머지는 CSS `style` | `FontFeature.tabularFigures()`, 그 아래 합쳐지는 `style: TextStyle?` | 글자 스타일은 위젯 자신의 매개변수입니다. |
| 눈에 보이지 않는 상자 안의 최종 숫자 | `Semantics` 라벨인 최종 숫자 | 시맨틱스 트리는 라벨을 바로 받습니다. |
| `IntersectionObserver`로 보는 `trigger="visible"` | 위젯 위의 모든 `Scrollable`을 지켜봅니다 | 옵저버가 없습니다. 위에 스크롤 영역이 없으면 바로 시작합니다. |
| `timeline`, `range` | — | CSS의 `view()` 타임라인에 대응하는 것이 없습니다. |
| `className` | — | 넘겨줄 클래스 목록이 없습니다. |

:::

## 함께 보기

- [MPAnimateReveal](./animate-reveal) — 숫자를 둘러싼 타일에. 그 위치가 말의 일부인 것에.
- [MPAnimateFade](./animate-fade) — 그 옆의 라벨에.
