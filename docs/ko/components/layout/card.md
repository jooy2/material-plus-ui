---
title: MPCard
order: 5
---

# MPCard

<p class="mp-lede">카드를 이루는 부분들을 배치한 MPBox입니다. 사진, 제목, 부제, 본문, 푸터 — MD3 자신의 카드 해부도를 슬롯으로 옮긴 것입니다.</p>

<Demo src="card/hero" :minHeight="320" />

```tsx
import { MPCard, MPButton } from 'material-plus-ui';

<MPCard
  variant="elevated"
  title="주간 요약"
  subtitle="매주 월요일 09:00 발송"
  footer={<MPButton>지금 보내기</MPButton>}
>
  지난 호는 42명이 열어 봤습니다.
</MPCard>;
```

## Props

<PropsTable name="MPCard" />

[MPBox](./box)의 모든 prop이 그대로 통과하므로, 카드는 자신이기도 한 박스와 정확히 같은 축으로 스타일링됩니다.

## 구획이 prop인 이유

`<MPCard.Header>`나 `<MPCard.Title>`은 없고, 이는 [MPDialog](../feedback/dialog)와 같은 결정입니다.

카드의 배치는 **고정**되어 있습니다. 미디어, 제목, 부제, 본문, 액션 순서인데, 그것이 MD3 자신의 해부도이기 때문입니다. 호출자가 정하고 싶은 것은 각 슬롯에 무엇을 넣을지이지 슬롯의 순서가 아니고, compound 서브컴포넌트는 정답이 하나뿐인 순서를 선택지로 내미는 셈입니다.

그리고 그 방식은 누군가 중첩을 잊어서 제목이 조용히 사라진 카드도 함께 제공합니다. 비어 있는 슬롯은 아무것도 그리지 않습니다. 래퍼도, 여백도, 간격도 없습니다.

## 표면은 MD3의 카드입니다

`corner-medium`이고, 다섯 variant 중 셋은 명세 자신의 카드 variant 그대로입니다 — `filled`는 `surface-container-highest`, `elevated`는 레벨 1 그림자 아래의 `surface-container-low`, `outlined`는 `outline-variant` 실선입니다.

어느 것도 물들지 않고 `color`도 없습니다. 근거는 [MPBox](./box#절대-물들지-않고-color도-받지-않는-이유)의 것 그대로입니다. 카드가 담는 것은 남의 내용이고, 그것은 자기 색을 가지고 도착했습니다.

## media

<Demo src="card/media" :minHeight="320">

<<< @/.vitepress/demos/card/media.tsx

</Demo>

위쪽에 **가장자리까지** 그려지므로, 카드 자신의 모서리가 사진을 잘라냅니다. `children`의 일부가 아니라 독립된 슬롯인 이유는, 카드에서 여백이 붙으면 안 되는 유일한 부분이기 때문입니다. 다른 구획들이 놓이는 세로 트랙은 미디어 _아래에서_ 시작하므로, 사진이 시트 자신의 여백에 액자처럼 갇히는 일이 없습니다.

카드는 미디어가 있을 때만 잘라냅니다. 모든 카드에 `overflow: hidden`을 걸면 시트 가장자리에 붙은 컨트롤의 포커스 링이 깎여 나가는데, 잘라낼 것이 없는 카드에서는 그 대가로 얻는 게 없습니다.

## dividers

<Demo src="card/dividers" :minHeight="360">

<<< @/.vitepress/demos/card/dividers.tsx

</Demo>

기본은 꺼짐입니다. 켜는 것은 선이 하나 생기는 일이 아니라 교환입니다.

|           | 끔              | 켬                  |
| --------- | --------------- | ------------------- |
| 세로 여백 | **시트**가 부담 | 각 **구획**이 부담  |
| 구획 사이 | 간격            | 양 끝까지 닿는 실선 |

선은 카드 자신의 테두리와 같은 `outline-variant`라서, 별개의 두 번째 선이 아니라 시트에 새겨진 자국으로 읽힙니다. 첫 구획 위에는 선이 없고, 미디어 아래에도 없습니다. 사진이 이미 구분이기 때문입니다.

## 카드를 누를 수 없게 한 이유

`href`도 `onClick`도 없습니다.

MD3가 카드를 상호작용할 수 _있는_ 컨테이너로 설명하는 건 맞지만, 카드 전체를 과녁으로 삼는 건 _이_ 카드에 맞지 않는 모양입니다. 제목과 본문과 푸터의 버튼 두 개를 가진 카드가 동시에 커다란 링크 하나이면, 그건 링크 안의 링크이고 HTML 파서가 들어오는 길에 분해해 버립니다. 그러면 모든 키보드 사용자가 스크린 리더로는 설명되지 않는 컨트롤을 만나게 됩니다.

대신 이렇게 하세요.

```tsx
// 제목이 링크입니다.
<MPCard title={<MPTextLink href="/digests/42">주간 요약</MPTextLink>}>…</MPCard>

// 또는 푸터가 액션을 들고 있습니다.
<MPCard title="주간 요약" footer={<MPButton onClick={open}>열기</MPButton>}>…</MPCard>
```

**타일 전체**가 하나의 과녁인 타일 격자는 다른 컴포넌트이고, 그건 안에 `<a>`가 들어 있는 평범한 [MPBox](./box)입니다. 클릭을 두고 경쟁하는 것이 아무것도 없습니다.

## 예시

### 제목 엘리먼트로서의 title

문서 개요에 나타나야 하는 카드에는 진짜 제목이 필요합니다. 넘기면 브라우저의 것이 아니라 카드의 타이포그래피를 그대로 유지합니다.

```tsx
<MPCard title={<h3>합계</h3>}>…</MPCard>
```

평범한 문자열은 일부러 제목으로 만들지 않습니다. 그랬다면 카드가 늘어선 페이지는 렌더링 순서대로 놓인 `<h3>` 더미가 되는데, 그건 아무도 쓰지 않은 개요입니다.

### headerAction

제목이 옆에서 줄바꿈되는 동안에도 제목의 줄에 남습니다.

```tsx
<MPCard title="주간 요약" headerAction={<MPIconButton icon={…} label="더 보기" size="xs" />}>
  …
</MPCard>
```

### 본문만 있는 카드

모든 슬롯은 선택 사항이고, 아무것도 채우지 않은 카드는 [MPBox](./box)입니다 — 실제로 그것이기도 합니다.

```tsx
<MPCard>시트뿐입니다.</MPCard>
```

## 접근성

- 카드는 자기 역할이 없습니다. 표면을 가진 `<div>`이고, 박스와 같은 이유로 그대로 둡니다. 스크린 리더가 알려야 할 영역에는 이름과 그 이름을 받을 엘리먼트가 필요하며, 그것이 `render`가 있는 이유입니다.
- `title`은 조용히 제목이 되지 않습니다. 카드가 개요에 속한다면 제목 엘리먼트를 넘기세요.
- 누를 수 있는 것이 없으므로, 여기서 컨트롤 안에 컨트롤이 중첩될 일도 없습니다.

```tsx
<MPCard render={<article />} aria-labelledby="digest-title" title={<h3 id="digest-title">…</h3>}>
  …
</MPCard>
```

## 함께 보기

- [MPBox](./box) — 구획이 놓이지 않은, 아래에 깔린 시트.
- [MPCollapsible](./collapsible) — 본문이 접히는 시트.
- [MPDialog](../feedback/dialog) — 페이지를 가져간 시트 위의 같은 슬롯들.
