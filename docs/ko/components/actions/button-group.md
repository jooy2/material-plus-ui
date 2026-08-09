---
title: MPButtonGroup
order: 2
---

# MPButtonGroup

<p class="mp-lede">함께 묶이는 버튼들의 한 줄입니다. 이웃과 맞닿는 모서리를 깎고, variant·size·color·비활성 상태를 버튼마다 반복하는 대신 묶음에 한 번만 설정합니다.</p>

<Demo src="button-group/hero" :minHeight="120" />

```tsx
import { MPButton, MPButtonGroup } from 'material-plus-ui';

<MPButtonGroup variant="outlined">
  <MPButton>이전</MPButton>
  <MPButton>다음</MPButton>
</MPButtonGroup>;
```

## Props

<PropsTable name="MPButtonGroup" />

## 두 가지 일이 일어나고, 그중 하나만 시각적입니다

이웃과 맞닿는 모서리가 `corner-full`에서 `corner-small`로 깎입니다. 그래서 이 줄은 알약 세 개가 우연히 붙어 있는 것이 아니라 하나의 형태를 나눈 것으로 읽힙니다. 그것이 겉모습입니다.

나머지 절반은 `variant`, `size`, `color`, `disabled`가 한 번만 설정된다는 것입니다. 버튼 하나만 크기가 다른 묶음 — 이것이 이 컴포넌트가 막으려는 실패이고, 각 버튼은 따로 보면 모두 옳기 때문에 디자인 리뷰에서야 드러나는 종류의 실패입니다.

<Demo src="button-group/inheritance" :minHeight="200">

<<< @/.vitepress/demos/button-group/inheritance.tsx

</Demo>

버튼 자신의 prop은 여전히 우선합니다. 보조 동작들 사이에 파괴적인 버튼 하나가 섞이는 것은 실제로 있는 일이고, 위의 세 번째 버튼이 바로 그것입니다.

## 이음매는 테두리가 아니라 간격입니다

filled 버튼 두 개가 맞닿으면 하나의 덩어리로 합쳐집니다. 그 사이에 그은 실선은 페이지에서 유일하게 *두 개의 면 사이*에 그어진 선이 되고요. MD3의 connected group은 대신 2px 간격을 씁니다. 두 번째 규칙 없이 모든 variant에서 작동합니다.

## 이것은 세그먼티드 컨트롤이 아닙니다

버튼들은 진짜 `MPButton`으로 남고, 그룹은 선택 상태를 관리하지 않습니다. 여럿 중 하나를 고르는 것이라면 [MPSegmentedButton](./segmented-button)을 쓰세요.

취향의 문제가 아닙니다. 눌린 버튼을 기억하는 버튼 줄은 스크린 리더에 "서로 관계없는 여러 동작, 그중 하나가 눌림으로 설명됨"으로 읽힙니다. 세그먼티드 버튼은 탭 정지가 하나이고 그 안에서 화살표 키가 움직이는 단일 컨트롤이며, "이 중 하나를 고르세요"는 실제로 그것입니다.

## 접근성

- 그룹은 `role="group"`을 갖습니다. roving tab index는 **없습니다**. 안의 버튼 하나하나가 각자의 탭 정지인데, 하나하나가 각자의 동작이기 때문입니다.
- 포커스 링은 버튼 바깥에 그려지므로 각 자식이 자기 stacking context를 갖고 포커스될 때 앞으로 나옵니다. 이것이 없으면 링이 DOM에서 뒤에 오는 이웃 밑에 깔립니다.

## 함께 보기

- [MPButton](./button) — 안에 들어가는 버튼.
- [MPSegmentedButton](./segmented-button) — 한 줄이 동작 묶음이 아니라 선택일 때.
