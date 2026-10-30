---
title: MPSegmentedButton
order: 3
---

# MPSegmentedButton

<p class="mp-lede">하나의 알약 안에 담긴 두세 가지에서 다섯 가지 선택입니다. 가는 선의 컨테이너와 같은 선으로 나뉜 세그먼트들, 그리고 선택된 하나는 `secondary-container`로 채워집니다 — 무언가를 하는 것이 아니라 무엇을 보고 있는지를 바꾸는 컨트롤에 머터리얼이 쓰는 색입니다.</p>

<Demo src="segmented-button/hero" :minHeight="64" />

::: fw react

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

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

List<String> view = <String>['week'];

MPSegmentedButton(
  semanticLabel: '달력 보기',
  items: const <MPSegment>[
    MPSegment(value: 'day', label: Text('일')),
    MPSegment(value: 'week', label: Text('주')),
    MPSegment(value: 'month', label: Text('월')),
  ],
  value: view,
  onChanged: (List<String> next) => setState(() => view = next),
);
```

:::

## Props

<PropsTable name="MPSegmentedButton" />

::: fw flutter

### MPSegment

<PropsTable name="MPSegment" />

:::

## 값이 항상 배열인 이유

단일 선택일 때도 마찬가지입니다. 그때는 최대 한 개가 들어 있습니다.

세그먼티드 버튼은 어느 쪽이든 정말로 같은 컨트롤입니다. MD3도 다중 선택 옵션을 가진 컴포넌트 하나를 문서화하지, 두 개를 문서화하지 않습니다. 그리고 boolean prop에 따라 **타입**이 바뀌는 `value`는, 읽기 전에 모든 호출부가 좁혀야 하는 유니온이 됩니다. 모양은 하나이고, 한 번만 배우면 됩니다.

<Demo src="segmented-button/multiple" :minHeight="240">

::: fw react

<<< @/.vitepress/demos/segmented-button/multiple.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/segmented_button/multiple.dart

:::

</Demo>

## showCheck

선택된 세그먼트에 체크 표시가 들어가고, 아무것도 선택되지 않았을 때도 그 자리는 비워 둡니다.

그 예약이 핵심입니다. 없던 체크가 생기면 읽는 사람이 바로 그것을 보고 있는 순간에 라벨이 옆으로 밀립니다. 컨트롤이 움직이면 안 되는 유일한 순간이 그때입니다. 아이콘만 있는 세그먼트 묶음이라면 꺼도 됩니다. 채워진 배경이 이미 어느 쪽이 켜졌는지 말해 주니까요.

항목의 `icon`은 같은 자리를 씁니다. 선택되기 전까지 세그먼트가 보여 주는 것이 아이콘이고, 선택되면 체크가 그 자리를 대신합니다. 그래서 어느 쪽이든 폭이 변하지 않습니다.

둘은 하나가 다른 하나로 갈아치워지는 대신 교차 페이드합니다. 세그먼트의 컨테이너와 잉크가 선택 상태에 도달하는 것과 같은 200ms이므로, 세그먼트를 고르는 일이 하나의 사건으로 읽힙니다. 진행 중간에 체크가 찍히는 것이 아니라요.

## size

[MPChip](../display/chip)이 32dp를 중심에 두듯, MD3의 40dp를 중심에 둔 자기 사다리를 씁니다.

| `size`   | 높이     |
| -------- | -------- |
| `xs`     | 32px     |
| `sm`     | 36px     |
| **`md`** | **40px** |
| `lg`     | 48px     |
| `xl`     | 56px     |

버튼이 쓰는 컨트롤 사다리를 따르면 명세의 세그먼트 버튼이 `sm`에 놓이고 기본값은 56px짜리 알약이 됩니다. `xs`, `md`, `xl`은 그 사다리의 `xs`, `sm`, `md`와 높이, 글자, 여백, 아이콘까지 같아서, 그 단계로 그린 버튼이나 필드와 한 줄에 맞습니다.

## 이 컴포넌트가 답이 아닐 때

**세그먼트가 다섯 개를 넘으면** [MPSelect](../inputs/select)를 쓰세요. 라벨이 들어가지 않기 시작하고 묶음이 줄바꿈됩니다. 두 줄로 넘어간 세그먼티드 버튼은 자기 존재 이유를 잃은 상태입니다.

**폼에서 값을 고르는 것이라면** [MPRadioGroup](../inputs/radio-group)을 쓰세요. 폼의 값이 나오는 컨트롤은 그쪽이고, 옆이 아니라 아래로 늘어납니다. 세그먼티드 버튼은 화면이 무엇을 보여 줄지 바꾸는 용도입니다.

## 접근성

::: fw react

- 아래에는 Base UI의 toggle group이 깔려 있습니다. 묶음에 탭 정지 하나, 그 안에서 화살표 키, 각 세그먼트에 `aria-pressed`.
- 평범한 버튼으로 만들면 4방향 스위치가 서로 관계없는 동작 네 개로 읽힙니다. 그중 셋은 마침 꺼져 있고요.
- 보이는 라벨이 없으면 `aria-label`을 주세요. 이름이 필요한 것은 묶음이고, 세그먼트는 자기 이름만 갖습니다.

:::

::: fw flutter

- 묶음 전체에 포커스 정지점이 하나입니다. 왼쪽과 오른쪽 화살표가 글이 흐르는 방향으로 정지점을 세그먼트 사이에서 옮기고, <kbd>Home</kbd>과 <kbd>End</kbd>는 양 끝으로 갑니다. <kbd>Enter</kbd>와 <kbd>Space</kbd>는 정지점이 있는 세그먼트를 누릅니다.
- 세그먼트마다 켜짐과 꺼짐을 알리는 버튼입니다. 웹에서 `aria-pressed`가 하는 말과 같습니다.
- 링은 없습니다. 세그먼트는 잘라 내는 알약 안에 있고, React 빌드처럼 10%의 스테이트 레이어가 키보드 위치를 보여 줍니다.
- 라벨이 필요로 하는 너비보다 좁으면, 세트는 비율대로 너비를 내주고 라벨을 줄임표로 자릅니다. 가장자리 밖으로 넘치지 않습니다.
- 보이는 라벨이 없으면 `semanticLabel`을 주세요. 묶음에는 이름이 필요하고, 세그먼트는 자기 이름만 말합니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `defaultValue` | `initialValue` | Flutter는 시작 값을 `initialX`로 부릅니다. |
| `onValueChange` | `onChanged` | 컨트롤의 값이 바뀔 때 Flutter가 쓰는 이름입니다. |
| 일반 객체인 `items` | `List<MPSegment>` | 객체 리터럴 대신 타입이 있는 클래스입니다. |
| `aria-label` | `semanticLabel` | Flutter의 이름입니다. |
| — | `focusNode`, `autofocus` | Flutter의 포커스는 노드로 다루고, 노드는 정지점을 따라 움직입니다. |
| `className`, `style` | — | 넘길 클래스 목록도 style 속성도 없습니다. |

:::

## 함께 보기

- [MPRadioGroup](../inputs/radio-group) — 같은 질문을 폼에서 할 때.
- [MPButtonGroup](./button-group) — 선택이 아니라 동작의 줄일 때.
- [Base UI Toggle Group](https://base-ui.com/react/components/toggle-group) — 아래에 깔린 동작.
