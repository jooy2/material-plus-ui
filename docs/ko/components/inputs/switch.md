---
title: MPSwitch
order: 6
---

# MPSwitch

<p class="mp-lede">움직이는 순간 적용되는 켜짐/꺼짐입니다. 머터리얼의 52×32 트랙 안에 16dp 썸이 있고, 켜지면 24dp로 자랍니다. 이 커짐이 있어서 상태가 흘긋 보는 눈으로도, 흑백으로도, 설정 페이지 저편에서도 살아남습니다.</p>

<Demo src="switch/hero" :minHeight="64" />

::: fw react

```tsx
import { MPSwitch } from 'material-plus-ui';

const [on, setOn] = useState(false);

<MPSwitch label="Wi-Fi" checked={on} onCheckedChange={setOn} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

bool on = false;

MPSwitch(
  label: const Text('Wi-Fi'),
  checked: on,
  onChanged: (bool next) => setState(() => on = next),
);
```

:::

## Props

<PropsTable name="MPSwitch" />

## 스위치인가 체크박스인가

차이는 시각적인 것이 아니라 시간적인 것입니다.

**체크박스**는 폼과 함께 제출되는 값입니다. **스위치**는 움직이는 순간 적용됩니다. 아래에 저장 버튼이 있다면 그것은 체크박스였어야 합니다. 그리고 스크린 리더는 어느 쪽인지 듣습니다. React에서는 스위치가 `role="checkbox"`가 아니라 `role="switch"`를 갖고, Flutter에서는 체크됨이 아니라 켜짐(toggled)으로 알리기 때문입니다.

::: fw flutter

`checked`와 `onChanged`로 controlled로 쓰거나, `initialChecked`에서 시작해 상태를 스스로 들고 있게 둘 수 있습니다. `onChanged`가 없다고 비활성화되지는 않으며, 비활성화는 `disabled`가 맡습니다.

:::

## 예시

### labelPlacement

`end`는 컨트롤의 설명처럼 읽힙니다. `start`는 설정 목록용으로, 라벨이 열을 이루고 모든 트랙이 오른쪽에 정렬됩니다.

<Demo src="switch/settings" :minHeight="240">

::: fw react

<<< @/.vitepress/demos/switch/settings.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/switch/settings.dart

:::

</Demo>

그것을 가능하게 하는 것이 `fullWidth`입니다. 행을 늘려서 `start` 라벨이 남는 폭을 가져가고 트랙이 끝에 붙게 합니다. 이것이 없으면 각 트랙이 자기 텍스트에 붙어 버려서 열이 맞지 않습니다.

### icons

켜지면 썸 안에 체크를, 꺼지면 X를 그립니다.

기본은 꺼짐이고, 두 상태가 맥락상 뚜렷이 다르지 않은 자리라면 켜 둘 만합니다. 그렇지 않으면 상태를 나르는 신호는 썸의 위치와 트랙의 색뿐이고, 그중 하나는 색상입니다.

둘은 썸이 홈을 따라 움직이는 것과 같은 200ms 동안 제자리에서 교차 페이드합니다. 중간에 하나가 다른 하나로 갈아치워지는 것이 아닙니다. 그동안에는 둘 다 겹쳐 그려지므로, 나란히가 아니라 포개어 배치되어 있습니다.

### errorMessage

라벨 아래의 메시지이고 스위치도 함께 뒤집습니다 — 트랙의 테두리, 썸, 메시지가 함께요. `description`은 같은 자리이고 그것으로 대체됩니다.

## 테두리는 border가 아니라 ring입니다

주변을 스타일링한다면 알아 둘 만합니다.

꺼진 트랙에는 2dp 외곽선이 있고 켜진 트랙에는 없습니다. 생겼다 사라지는 `border`는 썸이 배치되는 상자를 바꾸므로, 썸이 이미 움직이고 있는 바로 그 순간에 2픽셀 튀게 됩니다. inset ring은 그림자로 그려집니다. 레이아웃의 일부가 되지 않은 채로 나타나고 사라집니다.

이 컴포넌트는 스펙의 `standard` 이징 토큰 — 빨리 떠나고 천천히 도착하는 — 을 읽는 라이브러리의 유일한 컴포넌트이기도 합니다. 여기서 실제로 움직이는 것이 이것뿐이기 때문입니다.

## 접근성

::: fw react

- `aria-checked`를 가진 `role="switch"`입니다. 이것이 보조기술에게 "지금 적용된다"고 말해 줍니다.
- 라벨은 `id`로 컨트롤과 연결됩니다. 글자를 누르면 전환됩니다.
- `readOnly`는 상태를 보여 주되 바꾸지 못하게 하고 포커스는 가능합니다. `disabled`는 둘 다 아닙니다.

:::

::: fw flutter

- 켜짐과 꺼짐을 toggled로 알리는 시맨틱 노드 하나입니다. Flutter는 이것으로 보조기술에 바로 적용되는 컨트롤임을 알립니다.
- 라벨을 눌러도 바뀝니다. 줄 전체가 대상입니다.
- <kbd>Enter</kbd>와 <kbd>Space</kbd>로 바꾸며, 키보드로 도달하면 썸의 후광가 10%로 켜집니다.
- 썸은 글이 흐르는 방향으로 움직입니다. 오른쪽에서 왼쪽으로 쓰는 화면에서는 오른쪽 끝에 있다가 왼쪽으로 가며 켜집니다.
- `readOnly`는 상태를 보여 주되 바꾸지 못하게 하고 포커스는 받습니다. `disabled`는 둘 다 하지 않습니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `checked`, `defaultChecked` | `checked`, `initialChecked` | Flutter는 시작 값을 `initialX`로 부릅니다. |
| `onCheckedChange` | `onChanged` | 컨트롤의 값이 바뀔 때 Flutter가 쓰는 이름입니다. |
| `labelPlacement="start"` | `MPSwitchLabelPlacement.start` | 문자열 대신 열거형입니다. |
| 테두리를 그리는 inset ring | 썸 아래의 별도 레이어 | 이유는 같습니다. 테두리가 생기고 사라져도 썸이 움직이지 않습니다. |
| `name`, `id` | — | 참여할 폼 제출도, 엘리먼트 id도 없습니다. |
| — | `semanticLabel` | 보이는 라벨이 없는 스위치의 이름입니다. React의 `aria-label` 자리입니다. |
| `className`, `style` | — | 넘길 클래스 목록도 style 속성도 없습니다. |

:::

## 함께 보기

- [MPCheckbox](./checkbox) — 적용이 아니라 제출되는 값일 때.
- [Base UI Switch](https://base-ui.com/react/components/switch) — 아래에 깔린 동작.
