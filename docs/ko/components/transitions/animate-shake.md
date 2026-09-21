---
title: MPAnimateShake
order: 10
---

# MPAnimateShake

<p class="mp-lede">되지 않은 일에 대한 응답. 400밀리초, 한 번만, 그리고 어떤 색보다도 분명하게 <em>그건 거절됐다</em>를 말합니다.</p>

<Demo src="animate-shake/hero" :minHeight="360" />

```tsx
import { MPAnimateShake } from 'material-plus-ui';

<MPAnimateShake play={wrong}>
  <MPOtpField />
</MPAnimateShake>;
```

## Props

<PropsTable name="MPAnimateShake" />

## 컨트롤은 움직이지 않는데 이것은 왜 허용되는가

이 라이브러리의 규칙은 컨트롤이 transform하지 않는다는 것이고, 예외 없이 지켜집니다. 다만 그 규칙은 컨트롤의 **정지 상태**에 대한 것입니다. hover, press, on, off. 거기서 움직임은 색이 더 잘 말할 수 있는 것의 대역이고, 포인터가 쫓아다녀야 하는 표적을 만듭니다.

흔들림은 상태가 아닙니다. 컨트롤이 *무엇인지*가 아니라 방금 일어난 일이고, 조금 전 독자가 한 일에 대한 응답이며, 누군가 그것을 가리키려고 마음먹기 전에 끝납니다. 빨간 테두리는 그 필드의 새로운 조건입니다. 이것은 대답입니다.

그것이 예외의 전부이고, 라이브러리에서 유일한 예외입니다.

## 장식이 되지 않게 붙잡는 것

`trigger`의 기본값은 **`manual`**이고, 이 묶음에서 `mount`가 아닌 유일한 기본값입니다. 페이지가 열릴 때 도는 흔들림은 장식이고, 사람들은 움직이는 장식을 무시하는 법을 배웁니다. 그러면 이 효과가 존재하는 이유인 그 의미를 정확히 잃습니다.

`repeat`은 없습니다. 거절은 한 번 말하는 것이고, 계속 말하는 것은 더 분명해지는 것이 아니라 조르는 것입니다.

keyframe은 **양 끝이 제자리**입니다. 그래서 흔들림이 중간에 끊겨도 — 재렌더, 라우트 이동, 두 번째 거절 — 요소는 한쪽으로 1cm 밀린 채가 아니라 페이지가 놓아 둔 자리에 남습니다.

그리고 후반이 전반보다 작습니다. 20%와 40%에서 100%인 진폭이 60%와 80%에서는 55%입니다. 시작만큼 세게 끝나는 흔들림은 끝난 대답이 아니라 잘린 루프처럼 읽힙니다.

## 다시 흔들기

`play`를 `false`로 되돌렸다가 `true`로 두세요. 아무것도 언마운트하지 않고 애니메이션만 되감기므로, 필드는 값을 유지하고 독자는 포커스를 유지합니다. 그리고 두 번째 오답도 첫 번째만큼 움직입니다. 재렌더만으로는 그렇게 되지 않습니다.

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

## 공용 효과 중 하나가 아닙니다

[MPAnimateFloat](./animate-float)와 마찬가지로 이것은 도착이 아닙니다. 아무 데도 가지 않고 되돌아옵니다. 그래서 `MPAnimation`에 합류하지 않고 자기 파일에 keyframe을 둡니다. 그 union은 조회 테이블이 뒷받침하고 그것을 읽는 모든 컴포넌트가 전부를 지불하는데, 페이드가 거절을 위한 행을 지고 있을 이유는 없습니다.

## 접근성

- **흔들림은 메시지가 아닙니다.** `prefers-reduced-motion`에서는 통째로 빠지고, 스크린 리더를 쓰는 독자는 애초에 받은 적이 없습니다. 그러니 그것이 말하려던 바는 글로도 말해야 합니다. 이유를 필드의 `errorMessage`에 적거나 live region으로 알리세요.
- 여기서 접근성 트리는 바뀌지 않고, 흔들림이 다시 재생돼도 안의 어떤 것도 상태를 잃지 않습니다.

## 함께 보기

- [MPTextField](../inputs/text-field) — `errorMessage`. 글이 들어갈 자리입니다.
- [MPSnackbar](../feedback/snackbar) — 필드 하나가 담기에 할 말이 많은 거절에.
