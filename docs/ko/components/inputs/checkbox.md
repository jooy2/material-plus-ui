---
title: MPCheckbox
order: 4
---

# MPCheckbox

<p class="mp-lede">예/아니오 하나입니다. 상자는 평상시 `on-surface-variant`이고 체크되면 강조 색 계열로 채워집니다. 18dp 상자 둘레에 머터리얼의 40dp 스테이트 레이어가 있는데, 보이는 것은 상자이고 눌리는 것은 후광입니다.</p>

<Demo src="checkbox/hero" :minHeight="64" />

```tsx
import { MPCheckbox } from 'material-plus-ui';

const [agreed, setAgreed] = useState(false);

<MPCheckbox label="약관에 동의합니다" checked={agreed} onCheckedChange={setAgreed} />;
```

## Props

<PropsTable name="MPCheckbox" />

## 예시

### indeterminate

체크도 해제도 아닌 상태 — 자식 중 일부만 체크되었을 때 부모 상자가 보여 주는 모습입니다.

<Demo src="checkbox/parent" :minHeight="180">

<<< @/.vitepress/demos/checkbox/parent.tsx

</Demo>

값이 아니라 **표시** 상태입니다. 반쯤 체크된 상자를 누르면 체크됩니다. 다시 반쯤 체크된 상태로 돌아가는 부모는, 눌러도 제자리로 돌아오는 클릭을 읽는 사람에게 건네는 셈입니다.

### errorMessage

별도의 `error` boolean은 없습니다. [MPTextField](./text-field)와 같은 거래입니다. 메시지가 체크박스를 뒤집으므로, 설명 없이 잘못되어 보이기만 하는 컨트롤은 만들 수 없습니다.

<Demo src="checkbox/states" :minHeight="200">

<<< @/.vitepress/demos/checkbox/states.tsx

</Demo>

오류 상태는 강조 색 계열 전체를 `error`로 다시 가리킵니다. 그래서 상자와 후광과 메시지가 함께 뒤집히고, 메시지만 단서로 남는 일이 없습니다.

`description`은 `errorMessage`와 같은 자리이고 그것으로 대체됩니다. 머터리얼은 보조 텍스트에 한 줄을 줍니다.

### readOnly

상태를 보여 주되 바꾸지 못하게 하고, `disabled`와 달리 탭 순서에 남습니다. 읽는 사람이 여전히 찾을 수 있어야 하는 값에 필요한 것이 그것입니다. [Prop 규약](../../design/prop-conventions#state-props)을 참고하세요.

### size와 color

다섯 단계이고, 후광은 40dp에 머무는 대신 상자와 함께 커집니다. 사다리가 지키는 것은 그 둘 사이의 *관계*이고, 그것이 `xs` 체크박스도 여전히 누를 수 있게 만듭니다.

<Demo src="checkbox/sizes" :minHeight="260">

<<< @/.vitepress/demos/checkbox/sizes.tsx

</Demo>

`color`는 체크된 상자를 채울 강조 계열을 고릅니다. 오류 상태에서는 무시되는데, 브랜드 색을 유지한 오류는 오류로 읽히지 않기 때문입니다.

## 체크 표시가 나타나는 방식

체크는 상자의 채움과 같은 200ms 동안 자라 들어옵니다. 그래서 체크하는 동작이 하나의 사건으로 읽힙니다 — 컨테이너는 부드럽게 변하는데 글리프만 중간에 툭 얹히는 것이 아니라. 빠질 때도 같은 방식으로 나갑니다.

0이 아니라 60%에서 시작합니다. 0에서 시작한 표시는 처음 몇 프레임을 체크로 읽히기엔 너무 작은 얼룩으로 보내고, 눈은 그것을 획이 아니라 깜빡임으로 받아들이기 때문입니다. 라디오의 점은 0에서 시작합니다. 원은 어떤 크기에서도 여전히 원이기 때문입니다 — [MPRadioGroup](./radio-group#점이-나타나는-방식)을 보세요.

## `children`은 없습니다

`label`, `description`, `errorMessage`가 prop이고, 체크박스가 할 말은 전부 이 셋 중 하나에 들어갑니다. 배치는 고정되어 있고 — 체크, 라벨, 보조 한 줄 — 호출하는 쪽이 실제로 정하고 싶은 것은 각 자리에 무엇이 들어가느냐입니다.

## 접근성

- 보이고 눌리는 것은 `role="checkbox"`인 span이고 `aria-labelledby`로 라벨에서 이름을 받습니다. 라벨 자신의 `for`는 값을 폼으로 나르는 숨은 input을 가리킵니다. 글자를 눌러도 체크되는 이유가 그것입니다.
- `indeterminate`는 `aria-checked="mixed"`로 읽힙니다.
- 후광이 상자보다 큰 것은 의도입니다. 18dp는 쓸 만한 포인터 표적에 한참 못 미칩니다.

## 함께 보기

- [MPRadioGroup](./radio-group) — 묶음 중 정확히 하나만 고를 때.
- [MPSwitch](./switch) — 저장이 아니라 즉시 적용될 때.
- [Base UI Checkbox](https://base-ui.com/react/components/checkbox) — 아래에 깔린 동작.
