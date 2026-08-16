---
title: MPAnimateGrow
order: 2
---

# MPAnimateGrow

<p class="mp-lede">한 점에서 펼쳐져 나오는 내용. 툴바에서 나오는 패널, 자기가 있던 행에서 나오는 카드, 자기를 불러낸 버튼에서 나오는 시트.</p>

<Demo src="animate-grow/hero" :minHeight="380" />

```tsx
import { MPAnimateGrow } from 'material-plus-ui';

<MPAnimateGrow origin="top">
  <MPCard title="Out of the toolbar" />
</MPAnimateGrow>;
```

## Props

<PropsTable name="MPAnimateGrow" />

## 줌과 무엇이 다른가

`origin`, 그리고 얼마나 멀리 움직이는가입니다.

그로우는 최종 크기의 `0.8`에서 시작하고 어느 점에든 고정할 수 있어서, **옆에 있던 것에서 열려 나오는** 것으로 읽힙니다. 이동 거리가 짧으니 안의 내용이 애니메이션 대부분의 시간 동안 읽히고, 끝에 가서야 형태가 잡히는 얼룩이 되지 않습니다.

[MPAnimateZoom](./animate-zoom)은 절반도 안 되는 크기에서, 언제나 한가운데를 중심으로 시작합니다. 무언가에서 나오는 것이 아니라 읽는 사람 쪽으로 다가오는 것이고, 그것은 다른 종류의 내용에 대한 다른 문장입니다.

이것은 컴포넌트 라이브러리가 MD3의 **container transform**에 닿을 수 있는 가장 가까운 지점입니다. 명세의 그것은 한 요소의 경계를 다른 요소의 경계로 변형시키는 것이라 두 요소와 그 사이의 정체성이 모두 필요합니다. 감싸는 쪽 혼자 할 수 있는 절반 — 도착지가 자기가 나온 자리에서 펼쳐지는 것 — 만이 옮겨올 수 있습니다.

## 왜 transform이 아니라 `transform-origin`인가

`origin`은 `transform-origin`을 설정하고, 이 속성은 `transform` 단축 속성뿐 아니라 독립 `scale` 속성도 지배합니다. 애니메이션 자체는 `scale`만 쓰므로, 같은 요소에 걸린 호출자의 `transform`은 덮이지 않고 살아남습니다.

호출자가 자기 `style`에 준 `transformOrigin`이 여전히 이기는 이유도 같습니다. prop은 호출자의 style 객체보다 뒤가 아니라 앞에 쓰입니다.

## 예제

<Demo src="animate-grow/origin" :minHeight="320">

<<< @/.vitepress/demos/animate-grow/origin.tsx

</Demo>

### origin

CSS `transform-origin`이면 무엇이든 됩니다. `'top'`은 아래로 펼쳐지고, `'bottom left'`는 모서리에서 나오며, 기본값인 `'center'`는 한가운데에서 나옵니다.

내용이 나온 자리에 고정하세요. 버튼 아래 메뉴는 `'top'`에서 자라고, 그리드에서 펼쳐지는 카드는 자기가 앉아 있던 모서리에서 자랍니다.

### from

최종 크기의 몇 배에서 시작할지. `1`보다 크면 크게 도착해 페이지 위로 내려앉습니다 — 열리는 것이 아니라 **놓이는** 것의 몸짓입니다.

### fade

기본으로 켜져 있습니다. 이미 페이지에 있고 크기만 바뀌는 것에는 꺼 두세요. 보고 있던 내용에 반복되는 페이드는 등장이 아니라 깜빡임으로 읽힙니다.

## 접근성

- `prefers-reduced-motion`에서는 아무것도 확대되지 않고 내용이 최종 크기 그대로 있습니다.
- 크기를 바꾸면 안에 있는 것이, 글자를 포함해 다시 샘플링됩니다. 그로우가 지나는 짧은 거리와 읽는 사람이 뜯어볼 시간이 없는 `duration`에서는 괜찮지만, 본문 한 페이지를 감싸야 할 때 이것이 아니라 [MPAnimateFade](./animate-fade)를 쓰는 이유이기도 합니다.
- 내용은 첫 프레임부터 최종 레이아웃 크기로 문서 안에 있으므로, 애니메이션이 도는 동안 아래에 있는 것이 움직이지 않고 스크린 리더가 기다릴 일도 없습니다.

## 함께 보기

- [MPAnimateZoom](./animate-zoom) — 같은 계산을 두 배 넘는 거리에서, 언제나 한가운데를 중심으로.
- [MPAnimateFade](./animate-fade) — 다시 샘플링되면 안 되는 내용에.
- [MPAnimateSlide](./animate-slide) — 제자리에서 펼쳐지는 대신 가장자리에서 들어오는 것.
