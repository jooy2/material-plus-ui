---
title: MPPanes
order: 2
---

# MPPanes

<p class="mp-lede">사이에 끌 수 있는 핸들이 놓인 패널 묶음. 분할을 비율로 기술하므로, 창 크기가 바뀌어도 JavaScript가 한 줄도 돌지 않고 그대로 유지됩니다.</p>

<Demo src="panes/hero" :minHeight="260" />

::: fw react

```tsx
import { MPPane, MPPanes } from 'material-plus-ui';

<MPPanes>
  <MPPane defaultSize="240px" minSize="160px" maxSize="50%">
    <Sidebar />
  </MPPane>
  <MPPane>
    <Body />
  </MPPane>
</MPPanes>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPPanes(
  children: <MPPane>[
    MPPane(
      defaultSize: const MPPaneSize.pixels(240),
      minSize: const MPPaneSize.pixels(160),
      maxSize: const MPPaneSize.percent(50),
      child: sidebar,
    ),
    MPPane(child: body),
  ],
);
```

:::

## Props

<PropsTable name="MPPanes" />

### MPPane

<PropsTable name="MPPane" />

::: fw react

## 비율, 그리고 거기서 따라 나오는 것들

모든 패널은 `flex-basis: calc((100% - gutters) * fraction)`으로 크기가 정해집니다. 이 컴포넌트의 나머지 전부가 이 결정 하나에서 따라 나옵니다.

퍼센트로 기술된 분할은 컨테이너 크기가 바뀌어도 의미를 유지하므로, 컴포넌트는 **정확히 두 번만 자신을 측정합니다**. 한 번은 마운트할 때, `'240px'` 기본값을 비율로 바꾸기 위해. 또 한 번은 각 드래그가 시작될 때, 포인터가 1픽셀 움직이는 게 얼마만큼인지 알기 위해. 그 뒤에 창 크기가 바뀌는 건 아무 비용도 들지 않습니다. 브라우저가 `calc()`를 다시 계산할 뿐 React 렌더는 일어나지 않습니다.

측정은 한 번 읽는 대신 `ResizeObserver`입니다. 닫힌 disclosure나 선택되지 않은 탭 안의 분할은 마운트 시점에 너비가 0이고, 그걸로 나누면 모든 패널이 0이 되기 때문입니다.

:::

::: fw flutter

## 비율로 정하는 크기

모든 패널은 핸들이 자기 트랙을 가져간 뒤 남은 공간의 비율로 크기가 정해지고, 위젯의 나머지는 여기서 따라 나옵니다. 비율로 기술된 분할은 공간의 크기가 바뀌어도 의미를 유지합니다. 분할은 `LayoutBuilder` 안에서 배치되고, `LayoutBuilder`는 배치할 때마다 크기를 넘겨받으므로 `MPPaneSize.pixels(240)` 같은 기본값은 그때 있는 공간을 기준으로 비율이 되고 따로 지켜볼 것이 없습니다. 닫힌 패널 안의 분할은 너비가 생길 때까지 0으로 나누는 대신 패널을 고르게 배치합니다.

:::

::: fw react

## 크기가 숫자 _또는_ 문자열인 이유

맨 숫자는 **퍼센트**입니다. 분할은 보통 그렇게 설명되고, 퍼센트는 창 크기가 바뀌어도 의미를 유지합니다.

문자열은 **절대 길이**입니다 — `'240px'`, `'15rem'`, `'20%'`. 최소 크기가 있는 사이드바에 실제로 필요한 게 이쪽입니다. "최소 200픽셀"은 아직 아무도 모르는 너비의 비율로 옮겨 적으면 살아남지 못합니다.

읽을 수 없는 단위의 문자열은 0이 아니라 *제약 없음*으로 해석됩니다. 오타는 패널을 닫아 버리는 게 아니라 제한을 풀어 두어야 합니다.

:::

::: fw flutter

## 퍼센트, 또는 길이

`MPPaneSize.percent(30)`은 몫입니다. 분할은 보통 이렇게 설명되고, 창 크기가 바뀌어도 의미를 유지합니다. `MPPaneSize.pixels(240)`은 길이이고, 최소 크기가 있는 사이드바에 필요한 쪽입니다. "최소 200픽셀"은 아직 아무도 모르는 너비의 비율로 옮겨 적으면 살아남지 못합니다. React의 `number | string`은 Dart에 대응하는 말이 없는 유니언이라 생성자 두 개로 나눴습니다.

:::

## 그리지 않는 것

양쪽 어디에도 표면이 없습니다.

분할은 레이아웃이고, 패널이 시트를 그리는 순간 테이블·카드·에디터를 _안에 넣는_ 물건으로는 쓸 수 없게 됩니다. 강조 색 계열이 닿는 곳은 정확히 세 군데인데, 이 컴포넌트가 남기는 자국이 그 셋뿐이기 때문입니다. 실선, 호버된 핸들 아래의 틴트, 그리고 포커스 링.

<Demo src="panes/nested" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/panes/nested.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/panes/nested.dart

:::

</Demo>

## 핸들이 선보다 넓은 이유

1픽셀짜리 선은 1픽셀짜리 과녁이고, 그건 과녁이 아닙니다.

MD3는 48dp의 터치 타깃을 요구하지만 스플리터가 그걸 가지면 여백이 되어 버립니다. 그래서 모든 구현이 하는 타협을 여기서도 합니다. 핸들은 몇 픽셀 폭의 트랙이고 실선은 그 한가운데에 그려집니다 — 스크롤바가 그려지는 것과 잡히는 것을 나누는 방식과 같습니다. `size`가 그 트랙을 정합니다.

실선은 색만 바뀝니다. 그것이 놓인 트랙의 폭은 고정이라, 포인터가 도착해도 양옆의 무엇도 움직이지 않습니다.

::: fw react

## Base UI 프리미티브가 없는 이유

위임할 것이 없습니다.

스플리터의 동작은 pointer capture 하나와 clamp 하나입니다. 접근성은 ARIA 역할 하나 — 값을 가진 `separator`, 즉 window-splitter 패턴 — 이고, 그건 어차피 컴포넌트가 그려야 해서 소유하고 있는 엘리먼트가 지닙니다. Base UI가 필요한 건 정말로 어렵고 잘 동작할 때는 보이지 않는 것들입니다. 포커스 트랩, 포지셔너, 타입어헤드. 두 상자 사이의 레일은 그중 하나가 아닙니다.

:::

## 예시

### orientation

`horizontal`은 패널을 나란히 놓고 그 사이에 세로 핸들을 둡니다. `vertical`은 위아래로 쌓습니다. 화살표 키도 따라갑니다. 가로 분할에서는 ← →, 세로 분할에서는 ↑ ↓.

### resizable

컨트롤이 아니라 레이아웃인 분할을 위한 것입니다. 핸들은 실선을 유지하고, 커서와 호버 상태를 잃고, 탭 순서를 떠납니다.

::: fw react

```tsx
<MPPanes resizable={false}>…</MPPanes>
```

:::

::: fw flutter

```dart
MPPanes(resizable: false, children: panes)
```

:::

### onResize와 onResizeEnd

둘 다 각 패널의 몫을 그려진 순서대로 **퍼센트**로 보고합니다. 픽셀이 아닌 이유는, 픽셀은 그 순간 분할이 우연히 가지고 있던 너비에서만 참이기 때문입니다.

`onResize`는 드래그 중 계속 호출되고, `onResizeEnd`는 놓을 때 한 번 호출됩니다. 저장할 값은 이쪽입니다. 화살표 키는 그 자체로 하나의 제스처이므로 `onResizeEnd`도 함께 호출합니다.

::: fw react

```tsx
<MPPanes onResizeEnd={(sizes) => localStorage.setItem('split', JSON.stringify(sizes))}>…</MPPanes>
```

:::

::: fw flutter

```dart
MPPanes(onResizeEnd: (List<double> sizes) => preferences.saveSplit(sizes), children: panes)
```

:::

::: fw react

### children은 패널이어야 합니다

제약은 직계 자식의 props에서 읽으므로, 무언가로 감싼 `MPPane`은 최소 크기가 없는 패널입니다. 패널이 아닌 것도 배치는 되지만, 자기 몫도 없고 옆에 핸들도 생기지 않습니다.

:::

::: fw flutter

### children은 패널입니다

`children`은 `MPPane`의 리스트이므로, React 문서가 말로 해야 하는 것을 타입이 말합니다. 분할의 자식은 모두 패널이고, 분할이 각 패널의 크기를 읽습니다.

:::

## 접근성

::: fw react

- 각 핸들은 `aria-valuenow`, `aria-valuemin`, `aria-valuemax`를 가진 `role="separator"`입니다 — window-splitter 패턴이며, `aria-orientation`은 분할이 아니라 **구분선** 자신의 방향이므로 둘은 서로 반대입니다.
- 화살표 키는 핸들을 한 번에 16픽셀 움직이고, 드래그와 같은 경계를 지킵니다. `Home`과 `End`는 그 경계가 갈 수 있는 양 끝으로 곧장 갑니다. 이것이 없으면 사백 픽셀 떨어진 바닥에 닿는 데 스물다섯 번을 눌러야 합니다.
- `aria-controls`가 그 값이 가리키는 pane을 지목합니다. `aria-valuenow`는 그 pane의 몫이므로, 이것이 없으면 스크린 리더는 붙일 곳 없는 백분율만 읽게 됩니다.
- 누르는 것만으로는 핸들에 포커스 링이 생기지 않습니다. 브라우저가 `pointerdown`에서 알아서 포커스를 주고, 누르는 것과 키 입력을 구분할 줄 압니다. 컴포넌트는 `preventDefault` — 그걸 망가뜨렸을 — 대신, 드래그 동안 페이지의 텍스트 선택만 잠시 가져갑니다.
- RTL에서의 드래그는 축의 번호가 아니라 포인터가 간 방향으로 경계를 옮깁니다.

:::

::: fw flutter

- Flutter의 시맨틱에는 `separator` 역할이 없으므로, 각 핸들은 화면 낭독기에 있는 그대로 알려집니다. 앞 패널의 몫을 값으로 가진 슬라이더이고, 화면 낭독기의 올리기와 내리기 동작이 키 한 번만큼 움직입니다. 핸들의 이름은 분할의 `semanticLabel`로 줍니다.
- 핸들이 움직이는 방향의 화살표 키는 한 번에 16픽셀 움직이고, 드래그와 같은 경계를 지킵니다. 그와 엇갈리는 방향의 화살표는 포커스 이동에 맡깁니다. `Home`과 `End`는 그 경계가 갈 수 있는 양 끝으로 곧장 갑니다.
- 누르는 것만으로는 핸들에 포커스 링이 생기지 않습니다. 키보드로 온 포커스에만 생깁니다.
- 오른쪽에서 왼쪽으로 쓰는 글에서의 드래그는 축의 번호가 아니라 포인터가 간 방향으로 경계를 옮깁니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `defaultSize="240px"`, 맨 숫자는 퍼센트 | `MPPaneSize.pixels(240)`, `MPPaneSize.percent(30)` | Dart에는 숫자와 문자열을 합친 유니언이 없습니다. `rem` 길이도 없습니다. |
| `ResizeObserver`로 측정 | `LayoutBuilder` 안에서 배치 | 배치할 때마다 크기가 오므로 지켜볼 것이 없습니다. |
| `aria-valuenow`를 가진 `role="separator"` | 값을 가진 슬라이더 | Flutter의 시맨틱에는 구분선 역할이 없습니다. |
| 루트의 `aria-label` | 각 핸들의 이름이 되는 `semanticLabel` | 이름을 붙일 루트 엘리먼트가 없습니다. |

:::

## 함께 보기

- [MPDivider](../display/divider) — 움직이지 않는 두 가지 사이의 선.
- [MPAspectRatio](./aspect-ratio) — 여기 있는 또 하나의 레이아웃 컴포넌트. 비율을 지키는 상자입니다.
