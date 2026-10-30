---
title: MPTransfer
order: 12
---

# MPTransfer

<p class="mp-lede">두 목록과 그 사이의 화살표입니다. 한쪽에는 고를 수 있는 모든 것, 다른 쪽에는 이미 고른 것.</p>

<Demo src="transfer/hero" :minHeight="320" />

::: fw react

```tsx
import { MPTransfer } from 'material-plus-ui';

<MPTransfer
  items={columns}
  value={chosen}
  onValueChange={setChosen}
  sourceLabel="모든 열"
  targetLabel="보고서에 포함"
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTransfer(
  items: columns,
  value: chosen,
  onChanged: (List<String> next) => setState(() => chosen = next),
  sourceLabel: const Text('모든 열'),
  targetLabel: const Text('보고서에 포함'),
);
```

:::

## Props

<PropsTable name="MPTransfer" />

::: fw flutter

`value`를 주면 controlled 트랜스퍼가 됩니다. 빼면 직접 들고 있고 `initialValue`에서 시작합니다. React 패키지에서 넘어오지 않는 것은 [React 빌드와 다른 점](#react-빌드와-다른-점)에 있습니다.

:::

## 이 모양이 맞을 때

선택이 **길** 때입니다.

보고서의 열, 역할의 권한, 채널의 사람들. 그 길이에서는 필드에 칩이 마흔 개 들어찬 [MPCombobox](./combobox)가 더 이상 읽히지 않고, 체크박스 마흔 개가 늘어선 열은 독자가 실제로 갖는 단 하나의 질문 — _내가 뭘 골랐지?_ — 에 아무 답도 주지 못합니다. 두 목록은 그 답을 구조로 줍니다. 한쪽이 곧 답이니까요.

선택지가 열 몇 개 아래라면 앞의 둘 중 하나가 더 작은 컴포넌트이고 더 나은 선택입니다. 트랜스퍼는 다중 선택이 한 줄로 말하는 것을 위해 페이지의 두 열을 가져갑니다.

## 체크는 선택이 아닙니다

이것이 상호작용의 전부이고, 분명히 해 둘 값어치가 있습니다.

`value`는 **행이 어느 쪽에 있는지**입니다. 체크는 다음에 화살표를 누를 때 이 행이 옮겨져야 한다는 표시입니다. 둘은 별개의 상태이고, 여러분의 것은 앞의 하나뿐입니다.

- <Fw react="`onValueChange`" flutter="`onChanged`" />는 **화살표를 누를 때** 호출되고 체크에서는 절대 호출되지 않습니다.
- 호출자가 저장하는 것은 `value`, 즉 과정이 아니라 답입니다.
- 옮기면 옮겨진 것의 체크는 지워지고 나머지는 남습니다. 반대쪽에 도착한 행은 더 이상 거기로 보내지기를 기다리고 있지 않습니다.

자기 쪽에 체크된 것이 없으면 화살표는 죽어 있습니다. 아무 일도 하지 않을 누름을 막는 것이 그것입니다.

## 순서는 바뀌지 않습니다

두 목록 모두 `items`의 순서로 그리므로, 보냈다가 되돌린 행은 정확히 원래 자리로 돌아옵니다.

대안 — 반대쪽 목록 끝에 덧붙이는 것 — 은 독자가 마음을 바꿀 때마다 독자 자신의 목록을 재정렬하고, "저거 이미 옮겼던가?"를 열 전체를 훑는 일로 만듭니다.

## searchable

<Demo src="transfer/searchable" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/transfer/searchable.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/transfer/searchable.dart

:::

</Demo>

각 목록 위의 필터이고, 각각 자기 쪽만 좁힙니다.

누름은 필터가 **여전히 보여 주고 있는** 것만 옮깁니다. 체크된 뒤 숨겨진 행은 애초에 그 누름의 일부가 아니었습니다. 그렇지 않으면 필터가 독자가 볼 수 없는 것을 옮기게 되는데, 그것이 필터가 절대 해서는 안 되는 단 하나입니다.

::: fw react

필터는 문자열인 라벨에만 매칭합니다. 엘리먼트인 라벨은 할 수 없는 비교로 걸러 내는 대신 목록에 남겨 둡니다.

:::

::: fw flutter

필터는 대소문자를 무시하고 라벨의 글자에 매칭합니다. 읽을 글자가 없는 라벨, 즉 아이콘이나 위젯 배치는 할 수 없는 비교로 걸러 내는 대신 목록에 남겨 둡니다.

:::

## 제목 줄

각 목록의 이름이 그 목록 전체 선택 체크박스의 라벨입니다.

한 문자열이 두 가지 일을 하는 것은 의도한 것입니다. 이름 없는 열 머리글의 체크는 스크린 리더가 "체크박스"라고만 알리는 컨트롤이고, "Available" 옆에 그려진 "모두 선택"은 200픽셀밖에 없는 줄에서 같은 말을 두 번 하는 것입니다.

옆의 숫자는 그쪽에 있는 것 중 몇 개가 체크되었는지입니다. 고정폭 숫자로 설정되어 있어서, 더 좁은 숫자를 지나며 옆으로 흔들리지 않습니다. 체크할 때마다 바뀌고, 그때가 바로 독자가 그것을 보고 있는 순간입니다.

전체 선택은 옮길 수 없는 행을 건너뜁니다. 비활성 행은 목록 안에 있고 거래 밖에 있습니다.

## 화면을 보지 못하는 사람에게 전해지는 것

각 목록은 그 위 제목을 이름으로 갖는 그룹입니다. 그것이 없으면 두 패널은 구분되지 않는 체크박스 한 줄이고, 폼 컨트롤 단위로 이동하는 사람은 행의 라벨만 듣고 그것이 어느 쪽에 있는지는 듣지 못합니다. 행이 어느 쪽에 있는지가 주제의 전부인 컴포넌트에서 말입니다.

누름은 알림으로 전해집니다. 몇 행이 건너갔고 어느 목록에 도착했는지입니다. 화살표는 포커스를 그대로 쥐고 있고 바뀌는 것은 거의 똑같은 행 두 컬럼 중 어디에 행이 있느냐뿐이라, 누름에 대해 저절로 전해지는 것은 아무것도 없습니다.

::: fw react

목록 이름은 `sourceLabel`이나 `targetLabel`이 문자열일 때 그것을 쓰고, 아니면 로케일의 단어를 씁니다. 마크업에서 제목을 읽어 내는 정직한 방법은 없습니다.

:::

::: fw flutter

목록 이름은 `sourceLabel`이나 `targetLabel`에 글자가 있으면 그 글자를 쓰고, 아니면 로케일의 단어를 씁니다. 플랫폼이 알림을 받는 곳에서는 문장을 알림으로 보내고, 그 밖에서는 트리에 계속 남아 있는 라이브 영역에 넣습니다.

:::

## 예시

### 비제어

값을 받는 모든 prop에는 비제어 짝이 있으므로, 제출할 때만 답을 읽는 폼에는 자기 상태가 필요 없습니다.

::: fw react

```tsx
<MPTransfer items={columns} defaultValue={['name']} />
```

:::

::: fw flutter

```dart
MPTransfer(items: columns, initialValue: const <String>['name'])
```

:::

### 더 짧은 목록 한 쌍

`height`는 각 목록의 높이이고, 어느 쪽이 더 길든 둘은 같은 높이입니다. 따로 자라는 한 쌍은 무언가 건너갈 때마다 화살표를 움직입니다.

::: fw react

```tsx
<MPTransfer items={columns} height={140} size="sm" />
```

:::

::: fw flutter

```dart
MPTransfer(items: columns, height: 140, size: MPSize.sm)
```

:::

### 옮길 수 없는 행

::: fw react

```tsx
const columns = [
  { value: 'id', label: '내부 ID', disabled: true },
  …
];
```

:::

::: fw flutter

```dart
const List<MPTransferItem> columns = <MPTransferItem>[
  MPTransferItem(value: 'id', label: Text('내부 ID'), disabled: true),
  …
];
```

:::

행은 자기가 있는 목록에 그대로 그려집니다. 다만 어떤 누름의 일부도 되지 않습니다. "이건 항상 포함" 또는 "이건 쓸 수 없음"을 말하는 정직한 방법입니다.

## 접근성

- 모든 행은 그 행의 라벨이 붙은 진짜 체크박스입니다. 그래서 목록은 스크린 리더가 걸어가며 체크할 수 있는 목록입니다.
- 화살표는 [MPIconButton](./icon-button)이므로 이름이 있습니다. "선택함으로 이동"과 "선택 가능으로 되돌리기"가 읽히고, 글리프는 읽히지 않습니다.
- 뒤쪽 화살표는 같은 글리프를 180° 돌린 것이고, 두 축 모두에 대해 대칭이므로 RTL에서도 맞습니다. 거기서는 목록이 자리를 바꾸고 화살표도 함께 바뀝니다.
- `disabled`는 컨트롤 전체를 멈춥니다. 모든 체크, 두 화살표, 그리고 필터까지.

::: fw flutter

- 좁은 창에서는 두 목록이 위아래로 쌓이고, 그 사이의 화살표가 아래와 위를 가리킵니다. 중간 크기 창부터는 나란히 서고, RTL에서는 목록이 옮겨 간 쪽을 화살표가 가리킵니다.

## React 빌드와 다른 점

이 페이지의 대부분은 두 패키지에서 같습니다. 아래는 같지 않은 지점과 그 이유입니다.

| React | Flutter | 이유 |
| --- | --- | --- |
| `onValueChange` | `onChanged` | 평범한 변경에 붙는 Flutter의 이름입니다. |
| `defaultValue` | `initialValue` | Flutter의 이름입니다. `value`를 빼면 `null`이 되고 트랜스퍼가 값을 직접 듭니다. |
| `label`, `sourceLabel`, `targetLabel` (`ReactNode`) | `Widget` | 보통 `Text`이고, 필터와 알림은 그 글자를 읽습니다. |
| `height` (`number \| string`) | `height` (`double`) | 논리 픽셀입니다. 넘길 CSS 길이가 없습니다. |
| `labels` (`Partial<…>`) | `labels` (`Map<String, String>?`) | 같은 키를 맵으로 받습니다. |
| 중간 크기 기준점, CSS 미디어 쿼리 | `MPConfigProvider`의 창 크기 등급 | 화면 너비에서 읽는 같은 600 논리 픽셀입니다. |
| 네이티브 `<div>` 속성, `className` | — | 넘겨줄 대상이 없습니다. |

나머지는 일부러 맞췄습니다. 패널과 제목 줄, 숫자, 필터, 화살표와 그 이름, 바뀌지 않는 순서, 새로 들어와 자리 잡는 행이 그렇습니다.

:::

## 함께 보기

- [MPCombobox](./combobox) — 한 줄로 충분할 만큼 짧은 선택을 위한 한 줄짜리 답.
- [MPCheckbox](./checkbox) — 각 행이 무엇인지.
- [MPSelect](./select) — 하나만 고를 수 있을 때의 목록.
