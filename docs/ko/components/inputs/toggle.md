---
title: MPToggle
order: 11
---

# MPToggle

<p class="mp-lede">눌린 채로 남는 버튼입니다. 꺼짐은 중립, 켜짐은 강조색이고, 바뀌는 것은 옆에 있는 것의 상태입니다.</p>

<Demo src="toggle/hero" :minHeight="200" />

```tsx
import { MPToggle, MPToggleGroup } from 'material-plus-ui';

<MPToggleGroup multiple value={marks} onValueChange={setMarks}>
  <MPToggle value="bold" aria-label="굵게" startIcon={<MPIcon icon={Bold} />} />
  <MPToggle value="italic" aria-label="기울임" startIcon={<MPIcon icon={Italic} />} />
</MPToggleGroup>;
```

## Props

<PropsTable name="MPToggle" />

## 셋 중 어느 것인지

이 라이브러리에는 불리언을 들고 있는 컨트롤이 셋 있고, 서로 바꿔 쓸 수 없습니다.

| 컴포넌트                 | 누름이 무엇인지                                 |
| ------------------------ | ----------------------------------------------- |
| [MPSwitch](./switch)     | **설정**을 바꿉니다. 그 변경 자체가 요점입니다. |
| [MPCheckbox](./checkbox) | **답**을 줍니다. 폼에 들어가고 값이 제출됩니다. |
| **MPToggle**             | 지금 당장 **옆에 있는 것의 상태**를 바꿉니다.   |

선택한 단어의 굵게. 캔버스의 격자. 목록의 필터. 어느 경우든 독자가 보고 있는 것이 누르는 그 순간 바뀌고, 그래서 토글은 폼에 들어가지 않습니다. 제출할 것이 없습니다. 이미 일어났으니까요.

## 꺼짐이 중립이고 켜짐이 강조색인 이유

여덟 개가 늘어선 행에서도 한눈에 읽혀야 하고, 독자가 홀로 판단할 수 있는 축은 채도가 아니라 **색상**이기 때문입니다. 꺼짐이 옅은 강조색이고 켜짐이 진한 강조색인 세트는 둘을 나란히 놓고 비교하지 않으면 아무도 읽을 수 없는 세트입니다.

`color`가 의미를 갖게 남겨 두는 것도 이 규칙입니다. 버튼에서 계열은 _이것이 어떤 종류의 행동인지_ 를 말하지만, 여기서는 "켜짐"이 어떻게 보이는지를 말합니다. 눌리지 않은 토글이 이미 그 색을 입고 있었다면, 신호할 것이 생기기도 전에 신호를 다 써 버린 셈입니다.

## variant

<Demo src="toggle/variant" :minHeight="320">

<<< @/.vitepress/demos/toggle/variant.tsx

</Demo>

`variant`는 토글이 **꺼져 있는 동안**의 모습을 말합니다. 잉크는 다섯 모두 `on-surface-variant`이고, 달라지는 것은 컨테이너뿐입니다.

켜짐은 강조색이 자기를 주장하는 쪽입니다. `filled`는 강조색과 그 위의 잉크를 가져가고, 가운데 셋은 컨테이너 톤에 불을 켜고 라벨을 `on-accent-container`로 남기며, 켤 컨테이너가 없는 `text`는 강조색을 잉크에 넣습니다. 마지막 것이 MD3의 standard toggle icon button 그대로입니다.

**바뀌지 않는** 것은 깊이입니다. 켜진 토글은 들어 올려진 토글이 아니므로, `elevated`는 양쪽 상태에서 레벨 1 그림자를 그대로 유지하고 움직이는 것은 색뿐입니다.

## 아이콘만

자식이 없으면 토글은 글리프를 감싸 정사각형이 됩니다. [MPButton](./button)이 하는 것과 똑같고, `corner-full` 컨트롤에서 정사각형은 원이며, 그것이 MD3 자신의 toggle icon button입니다.

```tsx
<MPToggle aria-label="굵게" startIcon={<MPIcon icon={Bold} />} />
```

별도의 `MPToggleIconButton`은 없습니다. [MPIconButton](./icon-button)의 근거를 뒤집은 것입니다. 아이콘 버튼이 더하는 것은 **이름**인데, 토글은 어차피 이름을 받아야 합니다.

## MPToggleGroup

<Demo src="toggle/group" :minHeight="280">

<<< @/.vitepress/demos/toggle/group.tsx

</Demo>

<PropsTable name="MPToggleGroup" />

여기서 두 가지 일이 일어나고, 그중 하나만이 시각적입니다.

이웃을 마주 보는 모서리는 `corner-small`로 깎입니다. MD3의 connected button group이고, [MPButtonGroup](./button-group)이 그리는 것과 같은 모양을 같은 표에서 가져옵니다.

나머지 절반은 **세트가 값을 소유한다**는 것입니다. 토글들은 하나의 배열로 보고하고, `multiple`이 둘 이상이 켜질 수 있는지를 정하며, `variant`, `size`, `color`, `disabled`는 토글마다가 아니라 여기서 한 번 정해집니다. 네 번째 토글만 한 단 어긋난 행은 행이 아닙니다.

로빙 탭 인덱스는 Base UI가 소유합니다. 세트 전체에 탭 정지 하나, 그 안에서는 방향키. 그래서 토글 여덟 개짜리 툴바가 여덟 번이 아니라 두 번의 키 입력 깊이가 됩니다.

토글은 [MPButtonGroup](./button-group)의 컨텍스트도 읽습니다. 같은 컨텍스트이기 때문입니다. 버튼 그룹이 하지 않는 일은 값을 들고 있는 것입니다.

### 토글 그룹이 맞지 않을 때

고르는 것이 상태가 아니라 **값**일 때입니다.

`multiple`이 꺼진 토글 묶음은 하나 고르기이고, 그것을 제대로 말하는 컴포넌트는 둘입니다. [MPSegmentedButton](./segmented-button) — 둘에서 다섯 사이의 뷰를 고르는 MD3 자신의 컨트롤로, 고른 것에 체크가 붙습니다 — 그리고 [MPRadioGroup](./radio-group), 폼의 값이 나오는 곳입니다.

토글 그룹은 **툴바**를 위한 것입니다. 굵게, 기울임, 밑줄. 격자, 스냅, 눈금자. 각각이 다른 무언가의 상태이고, 그것들이 마침 함께 놓여 있을 뿐입니다.

## 접근성

- 토글은 `aria-pressed`를 단 `<button>`입니다. `aria-selected`도 `aria-checked`도 아닙니다. 눌린 채로 남는 컨트롤의 속성은 그것이고, Base UI가 소유합니다.
- 아이콘만 있는 토글에는 `aria-label`이 필요합니다. 라벨 전체가 그림인 버튼에는 접근 가능한 이름이 아예 없습니다.
- 그룹 안에서는 방향키가 토글 사이를 움직이고 Tab은 세트를 떠납니다. 모든 토글이 자기 탭 정지를 갖는 툴바는 키보드 사용자가 한 번에 하나씩 지나가야 하는 툴바입니다.
- 비활성 토글은 명세의 처리를 받고 — 내용 38%, 컨테이너 12% — 상태 레이어를 잃습니다. 그 위의 워시는 무언가 쓸 수 있다고 말하기 때문입니다.

## 함께 보기

- [MPSwitch](./switch) — 설정을 위한 컨트롤.
- [MPCheckbox](./checkbox) — 폼 안의 답을 위한 컨트롤.
- [MPSegmentedButton](./segmented-button) — 둘에서 다섯 개의 뷰 중 하나, MD3 자신의 체크와 함께.
- [MPButtonGroup](./button-group) — 상태를 들지 않는 버튼을 위한 같은 연결 모양.
