---
title: MPAnimateShake
order: 10
---

# MPAnimateShake

<p class="mp-lede">되지 않은 일에 대한 응답. 400밀리초, 한 번만, 그리고 어떤 색보다도 분명하게 <em>그건 거절됐다</em>를 말합니다.</p>

<Demo src="animate-shake/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateShake } from 'material-plus-ui';

<MPAnimateShake play={wrong}>
  <MPOtpField />
</MPAnimateShake>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPAnimateShake(play: wrong, child: const MPOtpField());
```

:::

## Props

<PropsTable name="MPAnimateShake" />

## 컨트롤은 움직이지 않는데 이것은 왜 허용되는가

이 라이브러리의 규칙은 컨트롤이 transform하지 않는다는 것이고, 예외 없이 지켜집니다. 다만 그 규칙은 컨트롤의 **정지 상태**에 대한 것입니다. hover, press, on, off. 거기서 움직임은 색이 더 잘 말할 수 있는 것의 대역이고, 포인터가 쫓아다녀야 하는 표적을 만듭니다.

흔들림은 상태가 아닙니다. 컨트롤이 *무엇인지*가 아니라 방금 일어난 일이고, 조금 전 독자가 한 일에 대한 응답이며, 누군가 그것을 가리키려고 마음먹기 전에 끝납니다. 빨간 테두리는 그 필드의 새로운 조건입니다. 이것은 대답입니다.

그것이 예외의 전부이고, 라이브러리에서 유일한 예외입니다.

## 장식이 되지 않게 붙잡는 것

`trigger`의 기본값은 **`manual`**(Flutter에서는 `MPAnimateTrigger.manual`)이고, 이 묶음에서 `mount`가 아닌 유일한 기본값입니다. 페이지가 열릴 때 도는 흔들림은 장식이고, 사람들은 움직이는 장식을 무시하는 법을 배웁니다. 그러면 이 효과가 존재하는 이유인 그 의미를 정확히 잃습니다.

`repeat`은 없습니다. 거절은 한 번 말하는 것이고, 계속 말하는 것은 더 분명해지는 것이 아니라 조르는 것입니다.

keyframe은 **양 끝이 제자리**입니다. 그래서 흔들림이 중간에 끊겨도 — 재렌더, 라우트 이동, 두 번째 거절 — 요소는 한쪽으로 1cm 밀린 채가 아니라 페이지가 놓아 둔 자리에 남습니다.

그리고 후반이 전반보다 작습니다. 20%와 40%에서 100%인 진폭이 60%와 80%에서는 55%입니다. 시작만큼 세게 끝나는 흔들림은 끝난 대답이 아니라 잘린 루프처럼 읽힙니다.

## 다시 흔들기

`play`를 `false`로 되돌렸다가 `true`로 두세요. 아무것도 언마운트하지 않고 애니메이션만 되감기므로, 필드는 값을 유지하고 독자는 포커스를 유지합니다. 그리고 두 번째 오답도 첫 번째만큼 움직입니다. 재렌더만으로는 그렇게 되지 않습니다.

::: fw react

```tsx
const [wrong, setWrong] = useState(false);

async function submit(code: string) {
  const ok = await check(code);

  if (!ok) {
    setWrong(false);
    requestAnimationFrame(() => setWrong(true));
  }
}

<MPAnimateShake play={wrong}>
  <MPOtpField />
</MPAnimateShake>;
```

:::

::: fw flutter

```dart
bool _wrong = false;

Future<void> _submit(String code) async {
  final bool ok = await check(code);

  if (!ok) {
    setState(() => _wrong = false);
    WidgetsBinding.instance.addPostFrameCallback((_) => setState(() => _wrong = true));
  }
}

MPAnimateShake(play: _wrong, child: const MPOtpField());
```

`true`는 `false`를 그린 프레임이 지난 뒤에 넣습니다. 한 프레임 안의 `setState` 두 번은 빌드 한 번이라서, 위젯은 `play`가 내려간 것을 보지 못합니다.

:::

## 공용 효과 중 하나가 아닙니다

::: fw react

[MPAnimateFloat](./animate-float)와 마찬가지로 이것은 도착이 아닙니다. 아무 데도 가지 않고 되돌아옵니다. 그래서 `MPAnimation`에 합류하지 않고 자기 파일에 keyframe을 둡니다. 그 union은 조회 테이블이 뒷받침하고 그것을 읽는 모든 컴포넌트가 전부를 지불하는데, 페이드가 거절을 위한 행을 지고 있을 이유는 없습니다.

:::

::: fw flutter

[MPAnimateFloat](./animate-float)와 마찬가지로 이것은 도착이 아닙니다. 아무 데도 가지 않고 되돌아옵니다. 그래서 `MPAnimation`이 아니고, 그 표의 길이와 곡선도 받지 않습니다. 키프레임 여섯 개는 흔들림만의 것이고, CSS 타이밍 함수가 키프레임 두 개 사이마다 걸리듯 곡선도 스윙마다 걸립니다.

:::

## 접근성

::: fw react

- **흔들림은 메시지가 아닙니다.** `prefers-reduced-motion`에서는 통째로 빠지고, 스크린 리더를 쓰는 독자는 애초에 받은 적이 없습니다. 그러니 그것이 말하려던 바는 글로도 말해야 합니다. 이유를 필드의 `errorMessage`에 적거나 live region으로 알리세요.
- 여기서 접근성 트리는 바뀌지 않고, 흔들림이 다시 재생돼도 안의 어떤 것도 상태를 잃지 않습니다.

:::

::: fw flutter

- **흔들림은 메시지가 아닙니다.** 플랫폼이 애니메이션을 끄면(`MediaQuery.disableAnimations`) 통째로 빠지고, 스크린 리더를 쓰는 독자는 애초에 받은 적이 없습니다. 그러니 그것이 말하려던 바는 글로도 말해야 합니다. 이유를 필드의 `errorMessage`에 적거나, `liveRegion`으로 표시한 `Semantics` 노드에 넣으세요.
- 여기서 시맨틱스 트리는 바뀌지 않고, 흔들림이 다시 재생돼도 안의 어떤 것도 상태를 잃지 않습니다. 자식을 다시 만들지 않으므로 필드는 값을 유지하고 포커스도 그대로 남습니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 밀리초 숫자인 `duration`, `delay` | `Duration` | 프레임워크에 이미 그 타입이 있습니다. |
| 픽셀 숫자나 CSS 길이인 `distance` | 논리 픽셀 단위의 `double` | `rem`을 환산할 루트 글자 크기가 없습니다. |
| `easing="standard"` | `MPEasing.standard` | 이름마다 `MPMotion`의 곡선 하나에 대응합니다. |
| 키프레임 두 개 사이마다 걸리는 타이밍 함수 | 스윙마다 걸리는 곡선 | Flutter의 진행에는 곡선이 하나뿐이라서, 위젯이 구간마다 직접 곡선을 걸어 같은 결과를 냅니다. |
| `play`를 `false`로 되돌리고 다음 애니메이션 프레임에 `true`로 | 같은 `play`를 두 프레임에 걸쳐 | 다시 재생하려고 더한 것은 없습니다. 한 프레임 안의 `setState` 두 번은 빌드 한 번입니다. |
| `IntersectionObserver`로 보는 `trigger="visible"` | 위젯 위의 모든 `Scrollable`을 지켜봅니다 | 옵저버가 없습니다. 위에 스크롤 영역이 없으면 바로 시작합니다. |
| `render`, `className`, `style` | — | 바꿔 끼울 엘리먼트도, 넘겨줄 클래스 목록이나 style 속성도 없습니다. |

:::

## 함께 보기

- [MPTextField](../inputs/text-field) — `errorMessage`. 글이 들어갈 자리입니다.
- [MPSnackbar](../feedback/snackbar) — 필드 하나가 담기에 할 말이 많은 거절에.
