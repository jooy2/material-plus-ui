---
title: MPDivider
order: 3
---

# MPDivider

<p class="mp-lede">두 가지 사이를 가르는 선입니다. 라벨이 없으면 선 그 이상도 이하도 아니고, 라벨이 있으면 라벨을 중심으로 선이 끊깁니다.</p>

<Demo src="divider/hero" />

::: fw react

```tsx
import { MPDivider } from 'material-plus-ui';

<MPDivider />
<MPDivider>또는</MPDivider>
<MPDivider orientation="vertical" />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPDivider();
const MPDivider(child: Text('또는'));
const MPDivider(orientation: MPOrientation.vertical);
```

:::

## Props

<PropsTable name="MPDivider" />

::: fw react

모든 native `<div>` 속성이 그대로 전달되고, `ref`는 루트에 닿습니다.

:::

## `color`에 기본값이 없는 것이 곧 스펙입니다

MD3는 구분선에 딱 하나의 색만 줍니다. `outline-variant`이고, 그것은 강조 색이 아닙니다. 토큰 시트에서 가장 조용한 선이고 — _컨트롤_ 의 가장자리인 `outline`보다도 조용합니다 — 구분선의 일은 두 가지를 가르는 것이지 세 번째가 되는 것이 아니기 때문입니다.

그래서 지정하지 않으면 선은 `outline-variant`, 즉 머터리얼의 구분선입니다. `color`를 주면 물듭니다. 선이 구조가 아니라 의미를 나르는 경우를 위한 것입니다.

::: fw react

```tsx
<MPDivider />                 // outline-variant — 머터리얼의 구분선
<MPDivider color="error" />   // 무언가를 뜻하는 선
```

:::

::: fw flutter

```dart
const MPDivider()                      // outlineVariant — 머터리얼의 구분선
const MPDivider(color: MPColor.error)  // 무언가를 뜻하는 선
```

:::

## 선은 레이아웃을 더하지 않습니다

::: fw react

선은 자기 두께가 없는 상자의 테두리 한 변이므로, 구분선은 선 자체를 넘어 1픽셀도 더하지 않습니다. `thickness`가 `border-2`가 아니라 커스텀 프로퍼티인 이유이기도 합니다. 라벨이 있는 구분선은 선을 세 번 그리는데 — 루트와 라벨 양옆의 짧은 조각 — 프로퍼티 하나가 셋을 같게 유지합니다.

:::

::: fw flutter

가로 구분선은 높이가 정확히 `thickness`이고 세로 구분선은 너비가 정확히 `thickness`라서, 선 말고는 아무것도 더하지 않습니다. 라벨이 있는 구분선은 라벨 양옆에 같은 두께로 선을 두 번 그립니다.

:::

## `width`가 아니라 `length`

구분선은 긴 축이 `orientation`을 따라 도는 유일한 컴포넌트입니다. 절반의 경우에 높이를 뜻하는 `width`는 조금 긴 이름보다 나쁜 이름입니다.

생략하면 가로 구분선은 컨테이너의 전체 너비를 차지하고 세로 구분선은 자기가 놓인 flex 행의 높이만큼 늘어납니다. 두 가지 사이를 가르는 선이라면 이미 그래야 하는 동작입니다.

::: fw react

```tsx
<MPDivider length={200} />                        // 너비 200px
<MPDivider orientation="vertical" length="4rem" /> // 높이 4rem
```

:::

::: fw flutter

```dart
const MPDivider(length: 200)                                     // 너비 200
const MPDivider(orientation: MPOrientation.vertical, length: 64) // 높이 64
```

세로 구분선은 `Row`가 주는 높이를 씁니다. 자기 높이가 없는 `Row`는 줄 높이가 없으므로, 행에 높이를 주거나 `IntrinsicHeight`로 감싸거나 구분선에 `length`를 줍니다.

:::

## 예시

### children

선 안에 끼워 넣는 라벨입니다. `textAlign`이 자리를 정합니다. `center`는 선을 반으로 가르고, `start`와 `end`는 가까운 쪽에 짧은 조각을 남깁니다. 그래야 라벨이 선 위에 떠 있는 것이 아니라 선 _안에_ 끼워진 것으로 읽힙니다.

<Demo src="divider/labels">

::: fw react

<<< @/.vitepress/demos/divider/labels.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/divider/labels.dart

:::

</Demo>

## 접근성

::: fw react

`separator`는 내용에서 이름을 가져오는 역할이 아닙니다. 그래서 눈에 보이는 라벨이 저절로 접근성 이름이 되지 **않습니다** — 스크린 리더는 밋밋한 "구분선"을 읽고, "또는"은 어딘가의 떠 있는 글로 읽힙니다. 그래서 문자열 라벨은 `aria-label`로 복사됩니다.

그보다 복잡한 것은 건드리지 않습니다. 어느 부분이 이름인지는 호출자만 알기 때문입니다.

```tsx
<MPDivider>또는</MPDivider>                    // 이름은 "또는"
<MPDivider><Logo /> 또는 <Logo /></MPDivider>  // 이름 없음 — 직접 지정하세요
```

:::

::: fw flutter

Flutter에는 구분선 역할이 없습니다. 라벨이 `Text`인 구분선은 그 라벨을 이름으로 가진 노드 하나가 되어 한 번만 읽히고, 그보다 복잡한 라벨은 `semanticLabel`로 이름을 줍니다. 둘 다 없는 구분선은 장식이라 의미 트리에서 빠집니다.

```dart
const MPDivider(child: Text('또는'))                                 // 이름은 "또는"
const MPDivider(semanticLabel: '또는', child: Row(children: <Widget>[Logo(), Text(' 또는 '), Logo()]))
```

:::

## variant도 elevation도 없습니다

구분선은 면이 아닙니다. 칠할 컨테이너가 없으므로 다섯 variant 중 넷은 할 말이 없고, 나머지 하나는 이미 그려져 있는 그 선입니다.

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `role="separator"` | 역할 없음 | Flutter에는 구분선 역할이 없습니다. 이름 있는 구분선은 이름 붙은 노드이고, 없으면 빠집니다. |
| `aria-label`로 복사되는 문자열 라벨 | `semanticLabel` | 라벨이 `Text`면 그 글자가 기본값이고, 복잡한 라벨에 이름을 줄 때 씁니다. |
| CSS 길이인 `length`, `thickness` | `double` | CSS 길이가 없습니다. |
| `children` | `child` | Flutter의 이름입니다. |
| `className`, `style`, `ref` | — | 넘길 클래스 목록, style 속성, 엘리먼트가 없습니다. |

:::

## 함께 보기

- [MPList](./list) — `dividers`가 행 사이에 그리는 것이 바로 이 선입니다.
- [색](../../design/color) — `outline-variant`가 어디서 오는지.
