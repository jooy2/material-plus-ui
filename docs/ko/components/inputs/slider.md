---
title: MPSlider
order: 7
---

# MPSlider

<p class="mp-lede">범위 위에서 고르는 값입니다. 트랙의 활성 부분은 강조 색 계열이고 나머지는 `surface-container-highest`입니다. 머터리얼 자신의 조합이고, 비활성 절반이 두 번째 값이 아니라 홈으로 읽히는 이유입니다.</p>

<Demo src="slider/hero" :minHeight="80" />

```tsx
import { MPSlider } from 'material-plus-ui';

const [volume, setVolume] = useState(40);

<MPSlider label="볼륨" showValue value={volume} onValueChange={setVolume} />;
```

## Props

<PropsTable name="MPSlider" />

## 예시

### 범위는 배열입니다

`range` prop은 없습니다. `value`나 `defaultValue`에 배열을 주면 항목 수만큼 핸들이 생기면서 범위 슬라이더가 됩니다. 값의 모양이 이미 그것을 말하고 있고, 그 모양과 일치해야 하는 boolean은 틀릴 거리가 하나 더 생기는 것이기 때문입니다.

<Demo src="slider/range" :minHeight="320">

<<< @/.vitepress/demos/slider/range.tsx

</Demo>

핸들끼리 서로를 넘어가지 못하게 하는 것은 Base UI가 담당하므로, 배열은 정렬된 상태로 남습니다.

### showValue

기본은 꺼짐이고, 단위가 있는 값이라면 켜 두는 편이 좋습니다. 읽기값이 없는 슬라이더는 값을 가늠할 수만 있는 컨트롤입니다. 볼륨 다이얼이라면 괜찮고 가격 필터라면 틀립니다.

`format`은 `Intl.NumberFormat`으로 전달되므로, 값이 숫자이기를 그만두지 않으면서도 읽기값을 통화나 백분율로 쓸 수 있습니다.

### onValueChange와 onValueCommitted

`onValueChange`는 드래그 내내 발생하고, `onValueCommitted`는 드래그가 끝날 때 한 번 발생합니다. 비싼 것 — 요청, 큰 목록의 리렌더 — 은 두 번째에 두세요.

```tsx
<MPSlider
  label="가격"
  defaultValue={[20, 80]}
  onValueChange={setPreview}
  onValueCommitted={search}
/>
```

### orientation

세로 슬라이더는 자기 길이가 없으므로 높이를 주세요. 기본값은 규칙이 아니라 출발점입니다.

## 핸들은 막대가 아니라 원입니다

머터리얼의 2025년 개정판은 핸들을 양옆에 틈을 둔 길쭉한 막대로 그립니다. 여기서는 의도적으로 그 이전 것을 씁니다.

그 틈은 슬라이더가 놓인 바탕색과 같은 색으로 트랙을 파내야 만들어지는데, 컴포넌트 라이브러리는 그 색이 무엇인지 알 수 없습니다. 페이지가 `surface`라고 가정한 핸들은 그렇지 않은 모든 화면 — 카드, 다이얼로그, 색이 있는 패널 — 에서 트랙에 옅은 홈을 남깁니다. 원에는 그런 의존이 없습니다.

## 접근성

- 각 핸들은 진짜 `<input type="range">`입니다. 그래서 범위는 native `min`과 `max`이고, 보조기술은 폼이 읽는 것과 같은 숫자를 읽습니다.
- 보이는 `label`이 없으면 `aria-label`을 주세요. 라벨이 있으면 이름 연결은 Base UI가 해 줍니다.
- 누를 수 있는 띠는 레일보다 훨씬 두껍습니다. Base UI는 컨트롤을 누른 자리로 값을 옮기므로, 표적이 4px 선의 두께가 아니라 손가락의 두께여야 합니다.

## 함께 보기

- [MPNumberField](./number-field) — 가늠하는 값이 아니라 정확히 아는 숫자라면.
- [Base UI Slider](https://base-ui.com/react/components/slider) — 아래에 깔린 동작.
