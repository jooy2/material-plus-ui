---
title: MPSegmentedButton
order: 3
---

# MPSegmentedButton

<p class="mp-lede">하나의 알약 안에 담긴 두세 가지에서 다섯 가지 선택입니다. 가는 선의 컨테이너와 같은 선으로 나뉜 세그먼트들, 그리고 선택된 하나는 `secondary-container`로 채워집니다 — 무언가를 하는 것이 아니라 무엇을 보고 있는지를 바꾸는 컨트롤에 머터리얼이 쓰는 색입니다.</p>

<Demo src="segmented-button/hero" :minHeight="64" />

```tsx
import { MPSegmentedButton } from 'material-plus-ui';

const [view, setView] = useState(['week']);

<MPSegmentedButton
  aria-label="달력 보기"
  items={[
    { value: 'day', label: '일' },
    { value: 'week', label: '주' },
    { value: 'month', label: '월' }
  ]}
  value={view}
  onValueChange={setView}
/>;
```

## Props

<PropsTable name="MPSegmentedButton" />

## 값이 항상 배열인 이유

단일 선택일 때도 마찬가지입니다. 그때는 최대 한 개가 들어 있습니다.

세그먼티드 버튼은 어느 쪽이든 정말로 같은 컨트롤입니다. MD3도 다중 선택 옵션을 가진 컴포넌트 하나를 문서화하지, 두 개를 문서화하지 않습니다. 그리고 boolean prop에 따라 **타입**이 바뀌는 `value`는, 읽기 전에 모든 호출부가 좁혀야 하는 유니온이 됩니다. 모양은 하나이고, 한 번만 배우면 됩니다.

<Demo src="segmented-button/multiple" :minHeight="240">

<<< @/.vitepress/demos/segmented-button/multiple.tsx

</Demo>

## showCheck

선택된 세그먼트에 체크 표시가 들어가고, 아무것도 선택되지 않았을 때도 그 자리는 비워 둡니다.

그 예약이 핵심입니다. 없던 체크가 생기면 읽는 사람이 바로 그것을 보고 있는 순간에 라벨이 옆으로 밀립니다. 컨트롤이 움직이면 안 되는 유일한 순간이 그때입니다. 아이콘만 있는 세그먼트 묶음이라면 꺼도 됩니다. 채워진 배경이 이미 어느 쪽이 켜졌는지 말해 주니까요.

항목의 `icon`은 같은 자리를 씁니다. 선택되기 전까지 세그먼트가 보여 주는 것이 아이콘이고, 선택되면 체크가 그 자리를 대신합니다. 그래서 어느 쪽이든 폭이 변하지 않습니다.

둘은 하나가 다른 하나로 갈아치워지는 대신 교차 페이드합니다. 세그먼트의 컨테이너와 잉크가 선택 상태에 도달하는 것과 같은 200ms이므로, 세그먼트를 고르는 일이 하나의 사건으로 읽힙니다. 진행 중간에 체크가 찍히는 것이 아니라요.

## 이 컴포넌트가 답이 아닐 때

**세그먼트가 다섯 개를 넘으면** [MPSelect](../inputs/select)를 쓰세요. 라벨이 들어가지 않기 시작하고 묶음이 줄바꿈됩니다. 두 줄로 넘어간 세그먼티드 버튼은 자기 존재 이유를 잃은 상태입니다.

**폼에서 값을 고르는 것이라면** [MPRadioGroup](../inputs/radio-group)을 쓰세요. 폼의 값이 나오는 컨트롤은 그쪽이고, 옆이 아니라 아래로 늘어납니다. 세그먼티드 버튼은 화면이 무엇을 보여 줄지 바꾸는 용도입니다.

## 접근성

- 아래에는 Base UI의 toggle group이 깔려 있습니다. 묶음에 탭 정지 하나, 그 안에서 화살표 키, 각 세그먼트에 `aria-pressed`.
- 평범한 버튼으로 만들면 4방향 스위치가 서로 관계없는 동작 네 개로 읽힙니다. 그중 셋은 마침 꺼져 있고요.
- 보이는 라벨이 없으면 `aria-label`을 주세요. 이름이 필요한 것은 묶음이고, 세그먼트는 자기 이름만 갖습니다.

## 함께 보기

- [MPRadioGroup](../inputs/radio-group) — 같은 질문을 폼에서 할 때.
- [MPButtonGroup](./button-group) — 선택이 아니라 동작의 줄일 때.
- [Base UI Toggle Group](https://base-ui.com/react/components/toggle-group) — 아래에 깔린 동작.
