---
title: MPMenu
order: 4
---

# MPMenu

<p class="mp-lede">무언가를 누르면 나타나는 동작의 목록입니다. 행은 데이터로 넘기는 것이 아니라 조합합니다 — <code>MPSelect</code>와 반대이고, 일부러 그렇습니다.</p>

<Demo src="menu/hero" :minHeight="80" />

```tsx
import { MPButton, MPMenu, MPMenuItem, MPMenuSeparator } from 'material-plus-ui';

<MPMenu trigger={<MPButton>동작</MPButton>}>
  <MPMenuItem shortcut="⌘C">복사</MPMenuItem>
  <MPMenuSeparator />
  <MPMenuItem color="error">삭제</MPMenuItem>
</MPMenu>;
```

## 왜 행은 조합하고 select의 선택지는 데이터인가

select의 선택지는 호출자가 이미 가진 목록에서 나온 값이고, 트리거는 팝업이 한 번도 마운트되기 전에 고른 것의 이름을 말할 수 있어야 합니다.

메뉴의 행은 **코드**입니다 — 하나하나가 다른 핸들러, 다른 아이콘, 때로는 하위 메뉴 — 그리고 메뉴가 열리기 전까지는 아무도 그것들을 알 필요가 없습니다. 데이터로 하면 행이 가질 수 있는 모든 모양에 대해 variant를 가진 `items` 타입이 되는데, 그것은 discriminated union으로 적은 컴포넌트 트리입니다.

## Props

<PropsTable name="MPMenu" />

### `MPMenuItem`

<PropsTable name="MPMenuItem" />

### `MPMenuCheckboxItem`

<PropsTable name="MPMenuCheckboxItem" />

### `MPMenuRadioItem`

<PropsTable name="MPMenuRadioItem" />

`MPMenuRadioGroup`으로 감쌉니다. 그룹은 `value`, `defaultValue`, `onValueChange`, `disabled`를 받습니다.

### `MPMenuSubmenu`

<PropsTable name="MPMenuSubmenu" />

### `MPMenuGroup`과 `MPMenuSeparator`

`MPMenuGroup`은 `label`을 받아 행 묶음을 감쌉니다. 라벨은 행이 아니라 heading이므로 고를 수 없습니다. `MPMenuSeparator`는 두 묶음 사이의 얇은 선이고 `outline-variant`입니다.

## 팝업

elevation 2의 `surface-container`, `corner-extra-small` — MD3의 세 선택이고, 일부러 [MPSelect](./select)의 목록과 같은 셋입니다. select는 *고른 것을 기억하는 메뉴*이고, 서로 맞지 않는 두 개의 떠 있는 목록은 눈이 따로 익혀야 하는 두 개의 목록입니다.

행은 안쪽으로 들여 놓인 타일이 아니라 가장자리까지 닿습니다. MD3는 메뉴 아이템에 자기 모서리를 주지 않으므로 state layer가 양 끝까지 흐르고, 팝업 자신의 4px 모서리가 이 물건의 유일한 곡선입니다.

## 예시

### 행이 가질 수 있는 모든 모양

<Demo src="menu/rows" :minHeight="80">

<<< @/.vitepress/demos/menu/rows.tsx

</Demo>

체크는 "그리고"를, 점은 "대신에"를 말합니다 — [MPCheckbox](./checkbox)와 [MPRadioGroup](./radio-group)이 다른 곳에서 내리는 것과 같은 구분입니다. 둘 다 기본적으로 메뉴를 열어 둡니다. 체크하는 목록은 하나 이상 체크하는 목록이기 때문입니다.

### href

`href`를 받은 행은 진짜 `<a>`로 렌더됩니다. 링크가 아닌 링크의 메뉴는 새 탭으로 열 수도, 복사할 수도 없고, 스크린 리더에게 매번 틀린 것을 말합니다.

### color

행은 자기 계열을 말할 수 있습니다 — 삭제하는 행에 `error` — 그리고 슬롯이 행에 다시 선언되므로 글자색도 함께 넘어갑니다.

### MPContextMenu

<PropsTable name="MPContextMenu" />

같은 행들을, 버튼이 아니라 오른쪽 클릭이나 길게 누르기로 엽니다.

<Demo src="menu/context" :minHeight="160">

<<< @/.vitepress/demos/menu/context.tsx

</Demo>

행을 `content`로, 영역을 `children`으로 받습니다. `MPMenu`가 아니라 [MPTooltip](../feedback/tooltip)의 모양인데, 여기서 트리거는 넘겨받는 엘리먼트 하나가 아니라 페이지의 한 구역이고 감싸는 대상이 그 구역이기 때문입니다.

## 접근성

- 화살표 키의 roving focus, Home과 End, typeahead, Escape, 바깥 클릭으로 닫기, 트리거로 포커스 되돌리기, safe triangle을 쓰는 hover 하위 메뉴, 그리고 그 모든 것을 스크린 리더에게 의미 있게 만드는 `menu` / `menuitem` role은 Base UI가 가집니다.
- 행에는 focus ring이 없습니다. Base UI가 강조된 행 자체로 포커스를 옮기므로, ring이 있으면 화살표를 누를 때마다 팝업 안에 사각형이 그려집니다 — state layer가 그 표시이고, 그래서 마우스가 받는 것과 같은 표시가 됩니다.
- `disabled` 행은 목록에 남고 typeahead에도 걸립니다. "있지만 당신에게는 아님"과 "없음"은 다른 것입니다.

## 함께 보기

- [MPSelect](./select) — 고른 것을 기억하는 메뉴.
- [MPButton](./button) — 보통 이것을 여는 것.
- [MPShortcut](../display/shortcut) — 행 끝의 키 조합에.
