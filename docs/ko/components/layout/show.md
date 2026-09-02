---
title: MPShow
order: 19
---

# MPShow

<p class="mp-lede">어떤 창 크기에서는 보이고 어떤 창 크기에서는 보이지 않는 내용. 노트북에서는 레일, 휴대폰에서는 하단 바 — 하나의 컴포넌트 안에 분기를 두는 대신, 경계를 사이에 둔 두 컴포넌트로 씁니다.</p>

```tsx
import { MPShow } from 'material-plus-ui';

<MPShow from="expanded">
  <MPSidebar>{nav}</MPSidebar>
</MPShow>
<MPShow until="expanded">
  <MPBottomNavigation items={nav} />
</MPShow>;
```

같은 클래스를 두고 쓴 `from`과 `until`은 서로 배타적이면서 빈틈이 없습니다. 모든 너비에서 둘 중 하나는 화면에 있고, 둘 다인 적은 없습니다.

## Props

<PropsTable name="MPShow" />

## 세 개의 prop

| 이렇게 쓰면      | 이럴 때 보입니다    |
| ---------------- | ------------------- |
| `from="medium"`  | 600dp 이상          |
| `until="medium"` | 600dp 미만          |
| `only="medium"`  | 600dp부터 839dp까지 |

`only`는 `from`과 `until`을 한꺼번에 말하는 것이고, 두 prop은 각자의 절반을 그대로 덮어씁니다 — `only="medium" until="large"`는 600dp부터 1199dp까지입니다. 둘 중 무엇을 쓸지는 어느 쪽이 의도처럼 읽히는가의 문제입니다.

여기서의 클래스는 [머터리얼의 윈도우 사이즈 클래스](../../design/breakpoints)이고, Tailwind의 breakpoint가 아닙니다.

## 조건부 렌더링이 아니라 `display: none`입니다

두 갈래 모두 렌더링되고 그중 하나가 CSS로 숨겨집니다. 이건 트레이드오프이고, 어느 쪽으로 기운 것인지는 분명히 해 둘 가치가 있습니다.

미디어 쿼리는 브라우저가 **무엇을 그리기 전에** 결정합니다. 서버가 보낸 마크업에 대해서도 그렇습니다. 그래서 첫 프레임이 이미 맞습니다. [`useMPWindowClass`](../../guide/hooks)는 같은 질문에 자바스크립트로 답하지만 하이드레이션 전에는 답할 수 없습니다. 첫 페인트는 추측이고 교정은 두 번째 렌더링인데, 휴대폰에서 그 추측은 그렸다가 버리는 데스크톱 내비게이션입니다.

대신 치르는 값은 숨겨진 쪽도 거기 있다는 것입니다 — 만들어지고, 레이아웃되고, 페인트에서만 건너뛰며, 이펙트는 실행됩니다. 그래서:

- **`MPShow`를 쓸 때**: 바뀌는 것이 두 배치 중 *어느 쪽*이 화면에 있느냐일 때. 내비게이션, 툴바, 필터 열, 아이콘이 되는 레이블.
- **훅을 쓸 때**: 화면 밖 갈래가 비쌀 때. 차트, 지도, 에디터, 천 행짜리 테이블.

`display: none`은 내용을 접근성 트리에서도 빼는데, 이건 단점이 아니라 목적입니다. 좁은 창의 스크린 리더는 컴팩트한 배치 하나만 읽습니다.

## 상자가 아닙니다

보이는 동안 래퍼는 `display: contents`라 레이아웃에 참여하지 않습니다 — flex 행 안의 `MPShow`는 자식들을 flex 아이템으로 만듭니다. 마치 쓰이지 않은 것처럼요.

그 선언은 명시도가 0(`:where`)이라, 직접 넘긴 `className`의 display가 다툼 없이 이깁니다. 그리고 숨김은 여전히 둘 다를 이깁니다:

```tsx
<MPShow from="medium" className="flex items-center gap-2">
  …
</MPShow>
```

맨 `<div>`가 앉을 수 없는 자리에서는 `render`가 다른 엘리먼트를 줍니다: `render={<li />}`, `render={<td />}`.

## 컴포넌트 없이 같은 일을

숨김 자체는 이 라이브러리가 등록한 variant 아래의 Tailwind 자신의 `hidden`이라, 이미 가지고 있는 엘리먼트에 바로 붙일 수 있습니다:

```tsx
<nav className="mp-below-expanded:hidden">…</nav>
<footer className="mp-large:hidden">…</footer>
```

이 클래스들은 두 설치 경로 모두에서 배포되는 스타일시트에 들어 있습니다. `MPShow`가 더하는 것은 레이아웃에 참여하지 않는 래퍼, `only`, 그리고 그 엘리먼트가 무엇을 위한 것인지 말해 주는 이름입니다.

## 다음

- [브레이크포인트](../../design/breakpoints) — 다섯 개의 클래스, 이 축을 따라 바뀌는 다른 것들, 그리고 옮기는 방법.
- [`useMPWindowClass`](../../guide/hooks) — 같은 질문에 대한 자바스크립트 쪽 답과, 그쪽이 나은 경우.
- [`MPSidebar`](./sidebar) — 스스로 클래스에서 접히기 때문에 이 컴포넌트가 필요 없습니다.
