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

### marks

트랙 위의 눈금과, 그 아래 쓰일 글자입니다.

`marks`만 주면 `step`마다 하나씩 놓입니다. MD3의 discrete 슬라이더입니다.

```tsx
<MPSlider min={0} max={100} step={25} marks aria-label="품질" />
```

배열을 주면 어느 눈금인지 직접 정하게 되고, 라벨을 가질 수 있는 쪽이 이 형태입니다.

```tsx
<MPSlider
  min={1990}
  max={2030}
  marks={[
    { value: 1990, label: '1990' },
    { value: 2010, label: '2010' },
    { value: 2030, label: '2030' }
  ]}
  aria-label="연도"
/>
```

채워진 트랙 위의 눈금은 강조 색 자신의 잉크로, 홈 위의 눈금은 `on-surface-variant`로 그려집니다. 명세의 짝이고, 핸들이 지나가도 눈금이 계속 보이는 이유입니다.

쓰기 전에 알아 둘 것이 셋 있습니다. boolean 형태는 눈금이 **쉰 개**를 넘으면 아무것도 그리지 않습니다. 그 지점부터는 눈금이 아니라 DOM 노드를 하나씩 쓴 점선이 되고, 눈금이 없는 것보다도 말해 주는 게 적어집니다. 어느 눈금이 중요한지는 배열 형태로 말하세요. `min`…`max` 밖의 눈금은 끝에 붙이지 않고 버립니다. 같은 끝에 붙은 둘은 하나로 읽히기 때문입니다. 그리고 라벨은 각 눈금의 중심에서 배치되고 폭을 재지 않으므로, 부딪힐 둘은 겹칩니다. 답은 더 작은 타입 스케일이 아니라 더 적은 항목입니다.

눈금에는 `aria-hidden`이 붙습니다. 눈금은 `step`의 그림이고, 스크린 리더는 이미 thumb의 range 속성으로 step을 듣습니다. 점 쉰 개를 읽어 주는 것은 자를 읽어 주는 일입니다.

## 핸들은 막대가 아니라 원입니다

머터리얼의 2025년 개정판은 핸들을 양옆에 틈을 둔 길쭉한 막대로 그립니다. 여기서는 의도적으로 그 이전 것을 씁니다.

그 틈은 슬라이더가 놓인 바탕색과 같은 색으로 트랙을 파내야 만들어지는데, 컴포넌트 라이브러리는 그 색이 무엇인지 알 수 없습니다. 페이지가 `surface`라고 가정한 핸들은 그렇지 않은 모든 화면 — 카드, 다이얼로그, 색이 있는 패널 — 에서 트랙에 옅은 홈을 남깁니다. 원에는 그런 의존이 없습니다.

## 핸들은 이동하지만, 붙잡고 있는 동안에는 아닙니다

슬라이더가 움직이는 방식은 크게 둘이고, 전환이 필요한 것은 그중 하나뿐입니다.

화살표 키, <kbd>Page Up</kbd>, 트랙 클릭은 **점프**입니다. 핸들은 그 자리에 나타나는 대신 100ms에 걸쳐 이동합니다. 키보드로 탭을 고를 때 탭 인디케이터가 하는 것과 같습니다.

드래그는 핸들을 **붙잡고 있는** 것입니다. 여기에 전환이 걸리면 핸들이 전환 시간만큼 포인터를 뒤따르게 되고, 읽는 사람은 스프링을 미는 느낌을 받습니다. 그래서 컨트롤이 드래그되는 동안에는 꺼집니다.

라이브러리의 다른 곳이 쓰는 200ms가 아니라 100ms인 이유는, 화살표 키를 누르고 있으면 200ms보다 빠르게 반복되기 때문입니다. 더 긴 시간을 쓰는 핸들은 한 단계를 끝내기 전에 다음 단계가 시작됩니다.

## 접근성

- 각 핸들은 진짜 `<input type="range">`입니다. 그래서 범위는 native `min`과 `max`이고, 보조기술은 폼이 읽는 것과 같은 숫자를 읽습니다.
- 보이는 `label`이 없으면 `aria-label`을 주세요. 라벨이 있으면 이름 연결은 Base UI가 해 줍니다.
- 누를 수 있는 띠는 레일보다 훨씬 두껍습니다. Base UI는 컨트롤을 누른 자리로 값을 옮기므로, 표적이 4px 선의 두께가 아니라 손가락의 두께여야 합니다.

## 함께 보기

- [MPNumberField](./number-field) — 가늠하는 값이 아니라 정확히 아는 숫자라면.
- [Base UI Slider](https://base-ui.com/react/components/slider) — 아래에 깔린 동작.
