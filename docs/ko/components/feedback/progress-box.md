---
title: MPProgressBox
order: 8
---

# MPProgressBox

<p class="mp-lede">차례로 켜지는 조각들의 줄입니다. 바와 링은 둘 다 “이만큼 끝났다”고 말합니다 — 읽는 사람이 재는 양입니다. 조각 넷은 “지금은 세 번째 단계”라고 말하고, 그것은 세는 양입니다. 셀 수 있을 만큼 작은 수라면 세는 쪽이 재는 쪽보다 빠릅니다.</p>

<Demo src="progress-box/hero" :minHeight="80" />

```tsx
import { MPProgressBox } from 'material-plus-ui';

<MPProgressBox label="배포 중" count={4} value={step * 25} />;
```

## Props

<PropsTable name="MPProgressBox" />

## 이것은 명세에 없습니다

MD3에는 바와 링이 있고 거기서 끝납니다. 이것은 라이브러리 자신의 세 번째 모양이고 — 그것이 Material Plus의 전제 그 자체입니다. 다른 머터리얼 라이브러리가 제공하지 않는 컴포넌트.

그래도 명세의 부품으로 그려집니다 — `corner-extra-small` 타일, 강조 색, 12%의 `on-surface` — 그래서 머터리얼 페이지 안에 놓여도 자신이 덤이라고 광고하지 않습니다.

## 예시

### count

기본값은 넷입니다. 물결이 물결로 읽힐 만큼 많고, 값이 있는 줄을 재지 않고 셀 수 있을 만큼 적습니다. 기다리는 일에 진짜 단계가 있다면 그 수로 두세요.

<Demo src="progress-box/count" :minHeight="180">

<<< @/.vitepress/demos/progress-box/count.tsx

</Demo>

맨 앞 조각은 부분적으로 채워집니다. 그래서 조각 넷이 0·25·50·75·100에 갇히지 않습니다 — 그러지 않으면 30%가 4분의 1로 반올림되어 사라집니다.

조각이 없는 줄은 표시기가 아니고, 소수인 count는 무언가를 나눈 호출자입니다. 둘 다 0이 아니라 하나의 조각으로 떨어집니다.

### value

기본값인 `null`은 줄을 대신 순환시키고, 각 조각은 자기 index만큼 늦게 켜집니다.

### size

조각 하나의 크기이고, 자기만의 사다리를 씁니다. 표시기는 컨트롤이 아니므로 컨트롤 높이 위에 있지 않습니다.

## 접근성

- `progressbar` role과 값은 Base UI가 가집니다. 조각들은 그것의 그림입니다.
- 물결은 위치가 아니라 opacity를 움직이므로 아무것도 이동하지 않고 리플로우도 없습니다. `prefers-reduced-motion`에서는 아예 멈춥니다.

## 함께 보기

- [MPProgressLinear](./progress-linear) — 세는 것이 아니라 백분율일 때.
- [MPTimeline](../display/timeline) — 단계에 이름과 기록이 있을 때.
