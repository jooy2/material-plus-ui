---
title: MPFlex
order: 10
---

# MPFlex

<p class="mp-lede">행, 또는 열, 그리고 둘 사이가 바뀌는 너비. 아무것도 그리지 않습니다. 면도 여백도 모서리도 없고, flex 컨테이너가 가진 다섯 속성뿐이며, 그 하나하나를 윈도우 크기 클래스별로 말할 수 있습니다.</p>

<Demo src="flex/hero" :minHeight="300" />

```tsx
import { MPFlex } from 'material-plus-ui';

<MPFlex direction={{ compact: 'column', medium: 'row' }} gap={16}>
  <Card />
  <Card />
</MPFlex>;
```

## Props

<PropsTable name="MPFlex" />

## 왜 `className`이 아니라 이것인가

언제나 행인 행이라면 `className`이 더 나은 답이고 이 컴포넌트는 군더더기입니다. 이것이 있는 이유는 휴대폰에서 열이 되는 행입니다.

Tailwind의 변형으로 쓰면 `flex-col md:flex-row`입니다. 라이브러리의 경계를 Tailwind의 숫자로 다시 적은 것이고 — 600이 아니라 768 — 옆의 [MPGrid](./grid)와 다른 너비에서 다시 흐르는 레이아웃이 됩니다.

맞는 답이 둘 있고, 이것이 두 번째입니다.

```tsx
<div className="mp-medium:flex-row flex flex-col">  // 이 패키지가 싣는 변형
<MPFlex direction={{ compact: 'column', medium: 'row' }} />  // 같은 것을 prop으로
```

둘 다 숫자를 고정하고 둘 다 CSS에서 풀립니다. 페이지가 이미 Tailwind를 쓰고 있다면 첫 번째를, 레이아웃을 prop으로 말하고 싶다면 이쪽을 쓰세요. [브레이크포인트](../../design/breakpoints.md)를 보세요.

## 나머지 셋과의 관계

| 컴포넌트           | 하는 일                               |
| ------------------ | ------------------------------------- |
| `MPFlex`           | 행이나 열, 아무것도 그리지 않음       |
| [MPGrid](./grid)   | 행을 열로 나눔 — *페이지*가 놓이는 판 |
| [MPStack](./stack) | 여러 개를 **겹쳐** 쌓음               |
| [MPBox](./box)     | 시트: 여백, 면, 모서리                |

다른 행의 것과 세로로 맞아야 한다면 `MPGrid`입니다. 열 수가 있는 이유가 그것이고, flex 행은 그것을 약속할 수 없습니다. `MPStack`은 생태계 전반에서 이름이 불운하게 겹치는 것일 뿐 완전히 다른 개념입니다. 아바타 더미, 카드 덱 같은 것.

## 모든 축이 반응형입니다

`direction`, `wrap`, `justify`, `align`, `gap` 다섯 모두 값 하나를 받거나 윈도우 크기 클래스로 키를 준 맵을 받고, 각 항목은 자기 클래스**부터 위로** 적용됩니다.

```tsx
<MPFlex direction={{ compact: 'column', expanded: 'row' }} gap={{ compact: 8, expanded: 24 }} />
```

지목하지 않은 클래스는 아래 클래스가 말한 것을 그대로 유지하므로, 보통은 다섯이 아니라 두 항목이면 됩니다.

자바스크립트가 아니라 **CSS**에서 풀립니다. 값은 호출부가 실제로 지목한 클래스만큼 custom property로 스타일시트에 도착하므로, 창이 600dp를 넘어갈 때 아무것도 다시 렌더되지 않고 서버에서 렌더된 첫 페인트가 이미 맞습니다. 훅과 분기로는 할 수 없는 절반이 이것입니다.

## `justify`와 `align`

CSS 자신의 단어입니다. 이것이 CSS 자신의 질문이기 때문입니다. [MPGrid](./grid)가 받는 것과 같은 집합이라, 행과 그리드에 어휘가 둘 필요하지 않습니다.

`start`와 `end`만 예외이고 그 둘은 라이브러리의 것입니다. CSS에는 `flex-start`와 `flex-end`로 도착합니다. 디바이더의 라벨에 `align="start"`라고 쓴 사람이 여기서 다른 단어를 써야 할 이유가 없습니다.

`align`의 기본값은 `stretch`입니다. CSS 자신의 기본값이고, 어느 쪽도 높이를 지정받지 않고도 한 행의 두 카드가 같은 높이가 되는 이유입니다. 라벨과 컨트롤이 한 줄에 있는 경우가 원하는 것은 `center`입니다.

## `gap`

숫자는 픽셀이고 문자열은 CSS 길이 그대로입니다. 이 라이브러리가 길이에 대해 어디서나 지키는 한 가지 규칙입니다.

## 중첩

flex 안의 flex는 바를 만드는 보통 방법입니다. 행 하나가 양 끝에 그룹을 하나씩 두고, 그 그룹이 각각 다시 행인 구조.

안쪽은 바깥쪽의 반응형 값에 영향받지 않습니다. 당연해 보이지만 순진하게 구현하면 어긋나는 지점이 여기입니다. 슬롯은 상속되는 custom property라서, `direction="row"`를 받은 — `compact`에 슬롯 하나뿐인 — 안쪽 flex가 1200dp 위에서 부모의 `large` 항목을 풀어 노트북에서 열로 나오게 됩니다. 모든 `MPFlex`가 자기 위에서 그 집합 전체를 지우고, 그것이 이를 막습니다.
