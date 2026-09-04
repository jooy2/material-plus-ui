---
title: MPContainer
order: 11
---

# MPContainer

<p class="mp-lede">페이지 여백, 그리고 필요하다면 본문 폭입니다. 머터리얼은 내용을 창 가장자리에서 compact 윈도우에서는 16dp, medium부터는 24dp 떨어뜨려 놓습니다. 이 컴포넌트가 그 여백이고, 안에 있는 것들마다가 아니라 페이지 맨 위에서 한 번 말합니다.</p>

<Demo src="container/hero" :minHeight="180" />

```tsx
import { MPContainer } from 'material-plus-ui';

<MPContainer maxWidth="lg" render={<main />}>
  …
</MPContainer>;
```

## Props

<PropsTable name="MPContainer" />

## maxWidth는 기본적으로 꺼져 있습니다

두 결정이 서로 다른 시점에 도착하기 때문입니다. 거의 모든 페이지가 여백을 원하지만, 그중 적지 않은 수 — 대시보드, 테이블, 에디터 — 는 일부러 전체 폭을 원합니다. 스스로 폭을 제한하는 컨테이너는 가장 흔한 사용법이 자기가 한 일을 되돌리는 것인 컴포넌트가 됩니다.

폭을 제한하기로 했다면, 사다리는 MD3의 윈도우 크기 클래스 경계에 맞춰져 있습니다.

| `maxWidth` | 폭     | 무엇인지                      |
| ---------- | ------ | ----------------------------- |
| `xs`       | 480dp  | compact 윈도우보다 좁은 폭    |
| `sm`       | 600dp  | medium 윈도우가 시작하는 지점 |
| `md`       | 840dp  | expanded가 시작하는 지점      |
| `lg`       | 1200dp | large가 시작하는 지점         |
| `xl`       | 1600dp | extra-large가 시작하는 지점   |

그래서 `maxWidth="md"`는 "expanded 윈도우보다 넓어지지 않는다"는 뜻이고, 이건 누군가 마음에 들어 한 숫자가 아니라 명세에 대한 문장입니다. Tailwind의 `max-w-*` 스케일은 일부러 **아닙니다**. 거기서 `max-w-lg`는 32rem이고, 한 페이지에 `lg`라는 이름의 사다리가 둘이면 아무도 나중에 찾을 수 없는 이유로 레이아웃이 몇 픽셀씩 어긋납니다.

사다리의 각 칸은 옆에 따로 적힌 숫자가 아니라 윈도우 크기 클래스에서 읽어 옵니다. 그래서 [경계를 옮긴](../../design/breakpoints) 프로젝트에서는 본문 폭도 함께 옮겨집니다.

## 직접 쓰는 길이

본문 폭은 창이 아니라 **글**에 대한 결정일 때가 많습니다. 산문 한 단의 고전적인 답은 60자쯤인데, 창 너비의 사다리로는 그걸 표현할 수 없습니다. 그래서 `maxWidth`는 CSS 길이도 받습니다:

```tsx
<MPContainer maxWidth="60ch">{article}</MPContainer>
```

`'42rem'`, `'800px'`, `'min(90vw, 70ch)'` — `max-width`가 받는 것이면 그대로 전달됩니다. 검증하지 않습니다. CSS가 해석할 수 없는 길이는 컨테이너를 제한하지 않은 채로 두는데, 이는 `none`이 주는 답과 같습니다.

## 너비마다 다른 본문 폭

`maxWidth`는 반응형이고, [`MPGrid`](./grid)의 prop들과 같은 모양입니다 — 윈도우 크기 클래스를 키로 하는 맵이며, 각 항목은 자기 클래스**부터 위로** 적용됩니다:

```tsx
<MPContainer maxWidth={{ compact: 'none', expanded: 'lg' }}>
```

휴대폰에서는 가장자리까지, 840dp부터는 1200dp로 묶입니다. 지정하지 않은 클래스는 아래 클래스가 말한 것을 그대로 유지하므로, 보통 두 항목이면 페이지 전체를 설명합니다.

이건 자바스크립트가 아니라 CSS가 해결합니다. 서버가 렌더링한 것을 포함해 브라우저가 그리는 첫 프레임에서 이미 올바른 폭이고, 윈도우 클래스가 바뀌어도 리렌더링 비용이 없습니다.

## size는 여백, maxWidth는 본문 폭

사다리가 둘이고, 일부러 서로 독립적입니다. 내용이 창 가장자리에서 얼마나 떨어져 있는가와, 내용이 얼마나 넓어질 수 있는가는 다른 질문입니다.

`size="md"`는 16dp로 MD3의 compact 여백입니다. 명세는 medium 윈도우부터 이를 24dp로 넓히는데, 여기서는 `size="lg"`입니다.

```tsx
<MPContainer size="lg" maxWidth="lg">
  …
</MPContainer>
```

[MPBox](./box)와 마찬가지로 여기서 `size`는 높이도 타입 스케일도 정하지 않습니다. 컨테이너는 담은 것만큼 높습니다.

## 레이아웃 컴포넌트 셋

<Demo src="container/page" :minHeight="320">

<<< @/.vitepress/demos/container/page.tsx

</Demo>

셋은 서로 다른 세 가지 일을 하고, 어느 하나도 다른 것의 일을 하지 않습니다.

- **MPContainer** 는 페이지를 창 가장자리에서 떨어뜨리고 본문 폭을 제한합니다.
- **[MPGrid](./grid)** 는 그 안의 내용을 열로 나눕니다.
- **[MPBox](./box)** 는 표면입니다.

컨테이너는 그리드를 담는 것만큼이나 문단 하나도 잘 담고, 그리드에 컨테이너가 반드시 필요하지도 않습니다.

## 표면을 그리지 않는 이유

`variant`도 `color`도 그림자도 없습니다. 페이지의 가장 바깥 엘리먼트는 페이지가 어떻게 보일지를 결정해서는 안 되는 유일한 것입니다. `surface-container`를 칠하는 컨테이너는 이미 배경을 가진 애플리케이션 뒤에 배경을 하나 더 두는 것이고, 그 안의 모든 시트가 시트 위의 시트가 됩니다.

페이지가 정말로 배경 위의 카드라면, 그건 컨테이너 **안의** [MPBox](./box)나 [MPCard](./card)입니다.

## 중첩

컨테이너 안의 컨테이너는 여백 두 개이고, 의도한 경우는 거의 없습니다. 안쪽 구획에 더 좁은 본문 폭이 필요하다면 폭만 주고 여백은 빼세요.

```tsx
<MPContainer>
  <MPContainer maxWidth="sm" padded={false}>
    …
  </MPContainer>
</MPContainer>
```

## 접근성

컨테이너는 여백을 가진 `<div>`입니다. role도, 상태도, 키보드 계약도 없고 일부러 아무것도 더하지 않습니다. 대부분의 페이지에는 정확히 하나가 있고 그건 보통 문서의 main 영역인데, `render`가 그것을 위한 것입니다.

```tsx
<MPContainer render={<main />}>…</MPContainer>
```

## 함께 보기

- [MPGrid](./grid) — 안쪽 내용이 자기를 나누는 방식.
- [MPBox](./box) — 표면이 필요할 때의 시트.
- [MPPanes](./panes) — 손잡이로 나뉘는 페이지의 두 영역.
