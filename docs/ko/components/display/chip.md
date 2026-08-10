---
title: MPChip
order: 6
---

# MPChip

<p class="mp-lede">작은 토큰입니다. 태그, 필터, 상태, 목록에서 뽑아낸 개체. 누를 수도 있고, 선택될 수도 있고, 자기 삭제 버튼을 가질 수도 있습니다 — 버튼 안에 버튼을 넣지 않고 셋 다 됩니다.</p>

<Demo src="chip/hero" :minHeight="140" />

```tsx
import { MPChip } from 'material-plus-ui';

<MPChip selected onClick={toggle}>열림</MPChip>
<MPChip variant="tonal" onDelete={remove}>design</MPChip>
<MPChip variant="text" count={12} color="error">오류</MPChip>;
```

## Props

<PropsTable name="MPChip" />

모든 native `<span>` 속성이 그대로 전달되고, `ref`는 껍데기에 닿습니다.

## 칩은 작은 버튼이 아닙니다

두 가지가 그렇게 말하고, 둘 다 스펙의 것입니다.

**높이.** MD3는 칩을 32dp로 그립니다. 예외 없이 32이고, 그것은 `CONTROL_HEIGHT`의 `xs`입니다. 컨트롤 사다리를 그대로 쓰면 `md`가 56px이 되는데, 56px짜리 칩은 모서리가 각진 버튼입니다. 그래서 여기서는 `md`가 32이고, 사다리는 다른 모든 사다리가 자기 스펙 값을 중심에 두는 것과 똑같이 그 값을 중심에 둡니다.

**모서리.** 시스템의 모든 버튼이 `corner-full`인 동안 칩은 `corner-small`입니다. 그 차이가 검색 필드 아래의 칩 줄이 버튼 줄로 읽히지 않는 이유 전부이고, 이 컴포넌트가 어느 단계에서도 `rounded-mp-full`을 쓰지 않는 이유입니다.

## 예시

### variant와 selected

`outlined`가 기본값인 이유는 MD3가 그렇기 때문입니다. assist·filter·input 칩이 모두 평상시 outlined이고, 스무 개가 늘어선 줄에서도 읽히는 것이 outlined 칩입니다.

<Demo src="chip/variants">

<<< @/.vitepress/demos/chip/variants.tsx

</Demo>

선택되면 계열의 **container** 색으로 채우고 그 `on-` 잉크를 가져갑니다. MD3의 선택된 filter 칩 그대로입니다. 다른 색도 아니고 더 굵은 글씨도 아닙니다. 켜진 필터도 여전히 같은 필터입니다.

`outlined`는 평상시 강조 색이 아니라 `on-surface-variant`를 읽는데, 이것도 MD3의 선택입니다. 꺼진 필터의 라벨은 아무 주장도 하고 있지 않고, 강조 색 라벨 스무 개가 늘어선 줄은 전부 켜져 있는 것처럼 보이는 필터 바입니다.

### onClick과 onDelete

껍데기는 **항상** `<span>`입니다. 바뀌는 것은 그 안입니다. 평범한 내용이거나, `onClick`이 주어지면 그 내용을 감싼 진짜 `<button>`, 그리고 `onDelete`를 위한 두 번째 버튼입니다.

```tsx
<MPChip onClick={toggle} onDelete={remove}>
  design
</MPChip>
```

둘 다 키보드로 닿을 수 있고, 어느 쪽도 다른 쪽 안에 들어 있지 않습니다. 이 구조는 정갈함의 문제가 아닙니다 — 클릭 핸들러를 단 무기력한 `<span>`은 컴포넌트 라이브러리가 키보드 사용자를 잃는 가장 흔한 방법이고, `<button>` 안의 `<button>`은 크롬이 파싱 시점에 조용히 풀어버리는 칩을 만드는 가장 흔한 방법입니다.

누를 수 있는 칩은 `selected`를 `aria-pressed`로 알리고, 라벨 버튼이 패딩을 소유하므로 클릭 영역이 글자만이 아니라 칩 전체입니다.

### count

칩 끝에 얹히는 숫자입니다. 자기 작은 판 위에 그려지므로 "오류 12"가 두 단어가 아니라 숫자를 단 하나의 토큰으로 읽힙니다. `filled` 칩에서는 판이 면에 뚫린 구멍이고, 나머지에서는 container 색이 비쳐 나온 것입니다.

## disabled

스펙의 처리입니다. 내용은 38%, 컨테이너는 12%, 둘 다 `on-surface`입니다. 강조 색은 완전히 사라집니다 — 비활성 칩이 활성 칩의 옅은 버전이면 둘은 채도로만 구분되고, 그것은 독자가 홀로 판단할 수 없는 유일한 축입니다.

비활성 칩은 눌리지 않게 되고, 삭제 버튼도 함께 비활성화됩니다.

## 함께 보기

- [MPSegmentedButton](../inputs/segmented-button) — 줄이 여러 독립 필터가 아니라 하나의 선택일 때.
- [MPBadge](./badge) — 토큰이 아니라 표시일 때.
