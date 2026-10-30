---
title: MPMenu
order: 4
---

# MPMenu

<p class="mp-lede">무언가를 누르면 나타나는 동작의 목록입니다. 행 하나하나가 값이 아니라 코드입니다. 핸들러가 있고 아이콘이 있고, 때로는 체크나 하위 메뉴가 붙습니다. <code>MPSelect</code>와 반대이고, 일부러 그렇게 만들었습니다.</p>

<Demo src="menu/hero" :minHeight="80" />

::: fw react

```tsx
import { MPButton, MPMenu, MPMenuItem, MPMenuSeparator } from 'material-plus-ui';

<MPMenu trigger={<MPButton>동작</MPButton>}>
  <MPMenuItem shortcut="⌘C">복사</MPMenuItem>
  <MPMenuSeparator />
  <MPMenuItem color="error">삭제</MPMenuItem>
</MPMenu>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPMenu(
  trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
      MPButton(onPressed: open, child: const Text('동작')),
  items: <MPMenuEntry>[
    MPMenuItem(label: '복사', shortcut: '⌘C', onPressed: copy),
    const MPMenuSeparator(),
    MPMenuItem(label: '삭제', color: MPColor.error, onPressed: remove),
  ],
);
```

:::

::: fw react

## 왜 행은 조합하고 select의 선택지는 데이터인가

select의 선택지는 호출자가 이미 가진 목록에서 나온 값이고, 트리거는 팝업이 한 번도 마운트되기 전에 고른 것의 이름을 말할 수 있어야 합니다.

메뉴의 행은 **코드**입니다. 행마다 핸들러와 아이콘이 다르고, 때로는 하위 메뉴가 됩니다. 메뉴가 열리기 전까지는 아무도 행을 알 필요가 없습니다. 데이터로 받으면 행이 가질 수 있는 모든 모양마다 variant를 둔 `items` 타입이 생기는데, 이는 컴포넌트 트리를 discriminated union으로 다시 적은 것에 지나지 않습니다.

:::

::: fw flutter

## 왜 행을 설명으로 넘기는가

행은 여전히 목록에서 나온 값이 아니라 저마다 핸들러를 가진 코드입니다. 달라지는 것은 적는 방법입니다. 메뉴 아래에 위젯으로 조합하지 않고, 설명을 `items`로 메뉴에 넘깁니다.

React 빌드가 조합할 수 있는 것은 Base UI가 행이 적힌 DOM을 읽기 때문입니다. 누가 목록을 넘겨주지 않아도 행을 찾고, 세고, 하이라이트를 옮기고, typeahead를 맞춰 봅니다. 위젯 트리는 빌드되기 전에는 훑어볼 것이 없고, 메뉴의 행은 메뉴가 열려야 빌드됩니다. 그래서 메뉴가 무엇을 담는지 직접 알려 줘야 합니다.

`MPMenuEntry`는 **sealed** 클래스입니다. 그래서 행은 판별 필드를 단 클래스 하나가 아니라 서로 다른 종류가 됩니다. `MPMenuItem`, `MPMenuCheckboxItem`, `MPMenuRadioItem`을 담은 `MPMenuRadioGroup`, `MPMenuGroup`, `MPMenuSeparator`, `MPMenuSubmenu`가 그 종류입니다. 이름과 필드와 기본값은 React와 같습니다.

:::

## Props

<PropsTable name="MPMenu" />

### `MPMenuItem`

<PropsTable name="MPMenuItem" />

### `MPMenuCheckboxItem`

<PropsTable name="MPMenuCheckboxItem" />

### `MPMenuRadioItem`

<PropsTable name="MPMenuRadioItem" />

::: fw react

`MPMenuRadioGroup`으로 감쌉니다. 그룹은 `value`, `defaultValue`, `onValueChange`, `disabled`를 받습니다.

:::

::: fw flutter

`MPMenuRadioGroup<T>`에 담습니다. 묶음의 행은 `items`로 넘깁니다.

<PropsTable name="MPMenuRadioGroup" />

:::

### `MPMenuSubmenu`

<PropsTable name="MPMenuSubmenu" />

### `MPMenuGroup`과 `MPMenuSeparator`

`MPMenuGroup`은 `label`을 받아 행 묶음을 감쌉니다. 라벨은 행이 아니라 제목이므로 고를 수 없습니다. `MPMenuSeparator`는 두 묶음 사이의 얇은 선이고 `outline-variant`로 그립니다.

::: fw flutter

<PropsTable name="MPMenuGroup" />

:::

## 팝업

elevation 2의 `surface-container`와 `corner-extra-small`입니다. MD3가 메뉴에 정한 세 가지이고, 일부러 [MPSelect](./select)의 목록과 같은 셋을 골랐습니다. select는 _고른 것을 기억하는 메뉴_이고, 서로 맞지 않는 떠 있는 목록 두 개는 눈이 따로 익혀야 하는 목록 두 개입니다.

행은 안쪽으로 들여 놓은 타일이 아니라 팝업 가장자리까지 닿습니다. MD3는 메뉴 항목에 모서리를 따로 주지 않으므로 state layer가 양 끝까지 칠해지고, 팝업의 4px 모서리가 유일한 곡선이 됩니다.

팝업의 너비는 MD3가 정한 가장 좁은 메뉴와 가장 넓은 메뉴 사이인 112px에서 280px이고, 높이가 384px을 넘으면 스크롤됩니다. 행 높이는 `size`를 따라 32, 40, 48, 56, 64로 오르며, `md`의 48이 MD3의 값입니다. 이 값은 최소 높이라서 `description`이 있는 행은 둘째 줄을 자르지 않고 두 줄로 늘어납니다.

## 트리거

::: fw react

무엇이든 되고, 연결은 Base UI가 합니다. `trigger={<MPButton>작업</MPButton>}`, [MPIconButton](./icon-button), `onClick`이 있는 [MPChip](../display/chip) 모두 진짜 `<button>`이고, `nativeButton`의 기본값이 `true`인 이유가 그것입니다.

아바타, 카드, 글 한 줄처럼 일부러 다른 것을 트리거로 줄 때는 `false`로 두세요.

```tsx
<MPMenu nativeButton={false} trigger={<MPAvatar src={user.photo} />}>
  <MPMenuItem>프로필</MPMenuItem>
</MPMenu>
```

그러면 Base UI가 `<button>`이 가져왔을 role과 탭 스톱, Enter/Space 처리를 대신 붙여 주므로, 스크린 리더와 키보드에게 그 트리거는 여전히 버튼입니다.

추론하지 않고 prop으로 받는 이유는, 트리거가 무엇을 그리는지는 그려 본 뒤에야 알 수 있고 그때는 이미 연결이 정해진 뒤이기 때문입니다. 둘이 어긋나면 Base UI가 콘솔에 알려 줍니다. 양쪽 방향 모두이므로, 진짜 `<button>`에 `false`를 주는 것도 그 반대만큼 틀린 일입니다.

:::

::: fw flutter

트리거는 빌더입니다. 메뉴를 여는 콜백과 메뉴가 열려 있는지를 받습니다. 그 콜백을 부를 수 있으면 무엇이든 트리거가 됩니다. `MPButton`, `MPIconButton`, `onPressed`가 있는 `MPChip` 모두 됩니다.

```dart
MPMenu(
  trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
      MPChip(onPressed: open, selected: isOpen, child: const Text('필터')),
  items: rows,
);
```

Material Plus 컨트롤을 트리거로 쓰면, 메뉴가 포커스를 가진 동안 트리거가 자기가 포커스를 가졌다고 말하고 메뉴가 열려 있는지도 말합니다. React 트리거가 `aria-expanded`로 말하는 것과 같습니다. 트리거는 없어도 됩니다. `open`을 받아 다른 곳에서 여는 메뉴는 메뉴를 적은 자리에 매달립니다.

:::

## 예시

### 행이 가질 수 있는 모든 모양

<Demo src="menu/rows" :minHeight="80">

::: fw react

<<< @/.vitepress/demos/menu/rows.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/menu/rows.dart

:::

</Demo>

체크는 "그리고"를, 점은 "대신에"를 말합니다. [MPCheckbox](./checkbox)와 [MPRadioGroup](./radio-group)이 다른 곳에서 하는 것과 같은 구분입니다. 둘 다 기본적으로 메뉴를 열어 둡니다. 체크하는 목록은 보통 둘 이상을 체크하기 때문입니다.

`checked`를 주지 않은 체크 행과 `value`를 주지 않은 묶음은 `defaultChecked`와 `defaultValue`에서 시작해 상태를 스스로 기억합니다. Flutter에서는 `initialChecked`와 `initialValue`입니다.

::: fw react

### href

`href`를 받은 행은 진짜 `<a>`로 렌더됩니다. 링크가 아닌 링크의 메뉴는 새 탭으로 열 수도, 복사할 수도 없고, 스크린 리더에게 매번 틀린 것을 말합니다.

`target="_blank"`인 행에는 `rel="noopener noreferrer"`도 함께 붙습니다. 열린 페이지가 `window.opener`를 통해 이 페이지로 되돌아오는 것을 막는 것이 그 역할입니다. `rel`을 직접 주면 그 값을 더하는 것이 아니라 대체합니다.

`disabled`인 행은 `href`가 무엇이든 링크가 **아닙니다**. 평범한 항목으로 돌아갑니다. `disabled`는 `<a>`가 될 수 있는 상태가 아니고, 사용할 수 없어 보이기만 하는 링크는 키보드가 여전히 들르고 크롤러가 여전히 따라가는 링크입니다.

:::

### color

행은 자기 계열을 따로 고를 수 있습니다. 삭제하는 행이라면 `error`를 줍니다. 그러면 행의 글자색과, 행이 자신을 표시하는 체크나 점의 색이 함께 바뀝니다. 나머지 행은 메뉴의 계열을 그대로 씁니다.

::: fw react

```tsx
<MPMenuItem color="error">삭제</MPMenuItem>
```

:::

::: fw flutter

```dart
MPMenuItem(label: '삭제', color: MPColor.error, onPressed: remove)
```

:::

### MPContextMenu

::: fw react

<PropsTable name="MPContextMenu" />

같은 행들을 버튼이 아니라 오른쪽 클릭이나 길게 누르기로 엽니다.

<Demo src="menu/context" :minHeight="160" :flutter="false">

<<< @/.vitepress/demos/menu/context.tsx

</Demo>

행을 `content`로, 영역을 `children`으로 받습니다. `MPMenu`가 아니라 [MPTooltip](../feedback/tooltip)의 모양인데, 여기서 트리거는 넘겨받는 엘리먼트 하나가 아니라 페이지의 한 구역이고 감싸는 대상이 그 구역이기 때문입니다.

:::

::: fw flutter

`MPContextMenu`는 React 전용입니다. Flutter가 돌아가는 모든 플랫폼에서 같은 뜻을 갖는 오른쪽 클릭 제스처는 없고, Flutter 앱에는 이미 그런 제스처가 둘 있습니다. 길게 누르기와 보조 탭입니다. 둘 중 어느 쪽에든 트리거 빌더의 `open`을 넘기면 됩니다.

```dart
MPMenu(
  trigger: (BuildContext context, VoidCallback open, bool isOpen) => GestureDetector(
    onLongPress: open,
    onSecondaryTap: open,
    child: const DropZone(),
  ),
  items: rows,
);
```

팝업은 포인터가 아니라 그 영역에 매달리고, 자리가 있는 쪽으로 뒤집힙니다.

:::

## 접근성

::: fw react

- 화살표 키의 roving focus, Home과 End, typeahead, Escape, 바깥 클릭으로 닫기, 트리거로 포커스 되돌리기, safe triangle을 쓰는 hover 하위 메뉴, 그리고 이 모든 것을 스크린 리더에게 의미 있게 만드는 `menu` / `menuitem` role은 Base UI가 맡습니다.
- 행에는 focus ring이 없습니다. Base UI가 강조된 행 자체로 포커스를 옮기므로, ring이 있으면 화살표를 누를 때마다 팝업 안에 사각형이 그려집니다. state layer가 그 표시이고, 그래서 마우스가 보는 표시와 같습니다.
- `disabled` 행은 목록에 남고 typeahead에도 걸립니다. "있지만 지금은 쓸 수 없음"과 "없음"은 다릅니다.

:::

::: fw flutter

- 팝업이 떠 있는 동안 포커스는 **트리거** 둘레에 있는 메뉴 자신의 노드에 머뭅니다. 행은 오버레이에 그려지는데, 행과 함께 포커스 스코프를 들어 올리면 키보드를 어떻게 다룰지 아는 위젯에게서 키보드를 빼앗게 됩니다. 방향키, <kbd>Home</kbd>, <kbd>End</kbd>, typeahead, <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>Esc</kbd>는 모두 그 노드가 받습니다.
- 키보드로 닿은 트리거는 첫 행을 밝힌 채로 메뉴를 엽니다. 닫힌 메뉴는 아래 방향키로 열면 첫 행이, 위 방향키로 열면 마지막 행이 밝혀집니다. <kbd>Tab</kbd>은 메뉴를 닫고 트리거 다음으로 넘어갑니다.
- 메뉴가 닫히면 키로 열었든 포인터로 열었든 포커스는 트리거로 돌아갑니다. 행의 핸들러가 포커스를 다른 곳으로 보냈다면 그쪽을 따릅니다. `MPButton`은 Flutter의 포커스 하이라이트 모드가 키보드일 때만 그 자리에 링을 그립니다.
- 포인터는 방향키와 같은 하이라이트를 옮깁니다. 그래서 마우스와 키보드가 두 행이 아니라 한 행을 밝히고, 바깥 메뉴의 다른 행으로 포인터를 옮기면 옆에 열려 있던 하위 메뉴가 닫힙니다.
- 팝업은 menu role을 가진 노드이고 이름은 `semanticLabel`입니다. 행은 menu item이고, 체크 행은 체크 여부를 말하는 checkbox menu item, 선택지는 서로 배타적인 묶음 안의 radio menu item입니다. 하위 메뉴를 여는 행은 펼쳐졌는지를 말합니다.
- 하위 메뉴를 여는 방향키는 쓰기 방향을 따르므로 RTL에서는 반대쪽을 가리키고, 갈매기표도 같이 돌아갑니다.
- 비활성 행은 목록에 남고, React와 마찬가지로 방향키와 typeahead도 여전히 닿습니다. 골라도 아무 일이 없고, 쓸 수 없다고 읽힙니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 조합하는 행 | `items: List<MPMenuEntry>` | Base UI는 행이 적힌 DOM을 읽습니다. 행이 빌드되기 전에는 훑어볼 트리가 없으므로, 메뉴에 무엇을 담는지 알려 줘야 합니다. |
| 행의 `children` | `String` 타입의 `label` | 그려지고, 읽히고, typeahead가 맞춰 보는 글자입니다. 셋을 모두 할 수 있는 것은 문자열뿐이고, typeahead용으로 따로 두던 React의 `label`은 필요 없습니다. |
| 엘리먼트인 `trigger` | 빌더인 `trigger` | 메뉴를 여는 콜백과 열려 있는지를 넘겨받습니다. |
| `onClick` | `onPressed` | Flutter의 이름입니다. |
| `closeOnClick` | `closeOnPress` | 누르기에 Flutter가 쓰는 이름입니다. |
| `defaultOpen`, `defaultChecked`, `defaultValue` | `initialOpen`, `initialChecked`, `initialValue` | Flutter의 이름입니다. |
| `onCheckedChange`, `onValueChange` | `onChanged` | 값이 바뀌는 것뿐인 콜백에 Flutter가 쓰는 이름입니다. |
| 라디오 묶음의 `value={null}` | — | `value: null`은 메뉴가 선택을 스스로 기억한다는 뜻이므로, 아무것도 고르지 않은 controlled 묶음은 표현할 수 없습니다. |
| 행의 `href`, `target`, `rel`, `render` | — | 링크 엘리먼트가 없고, Flutter 앱을 훑는 크롤러도 없습니다. 라우터는 `onPressed`에서 부릅니다. |
| `nativeButton` | — | 물어볼 DOM 엘리먼트가 없습니다. `open`을 부르는 위젯이면 무엇이든 트리거입니다. |
| `modal` | — | 팝업은 트리거에 매달리고 바깥을 누르면 닫힙니다. 그 누르기는 눌린 자리에 그대로 전달됩니다. |
| safe triangle | — | 하위 메뉴는 포인터가 자기 행에 올라오면 열리고 같은 메뉴의 다른 행에 올라가면 닫힙니다. 그래서 이웃 행을 가로지르는 대각선 이동은 하위 메뉴를 닫습니다. |
| `MPContextMenu` | `onLongPress`나 `onSecondaryTap`으로 여는 `MPMenu` | 모든 플랫폼에서 같은 뜻을 갖는 오른쪽 클릭 제스처가 없습니다. |
| — | `semanticLabel` | 화면 낭독기가 팝업을 부르는 이름입니다. Base UI는 트리거에서 이름을 가져옵니다. |
| `className`, `style` | — | 넘겨줄 클래스 목록도 style 속성도 없습니다. |

:::

## 함께 보기

- [MPSelect](./select) — 고른 것을 기억하는 메뉴.
- [MPMenubar](./menubar) — 애플리케이션 맨 위에 놓이는 메뉴 띠.
- [MPButton](./button) — 보통 메뉴를 여는 것.
- [MPShortcut](../display/shortcut) — 행 끝의 키 조합에.
