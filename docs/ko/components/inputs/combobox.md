---
title: MPCombobox
order: 3
---

# MPCombobox

<p class="mp-lede">입력할 수도 있고 고를 수도 있는 필드입니다. 껍데기는 <code>MPSelect</code>의 트리거와 마찬가지로 셰브런을 단 <code>MPTextField</code>이고, 다른 것은 텍스트가 하는 일입니다. 목록을 걸러내고, 값 그 자체가 될 수도 있습니다.</p>

<Demo src="combobox/hero" :minHeight="90" />

```tsx
import { MPCombobox } from 'material-plus-ui';

<MPCombobox
  label="언어"
  items={[
    { value: 'ts', label: 'TypeScript' },
    { value: 'rs', label: 'Rust' }
  ]}
  value={language}
  onValueChange={setLanguage}
/>;
```

## Props

<PropsTable name="MPCombobox" />

### `items`

<PropsTable name="MPComboboxOption" />

`label`이 `ReactNode`가 아니라 `string`인 것이 [MPSelect](./select)와 다른 유일한 지점입니다. 이 라벨은 필터가 비교하는 대상이자 텍스트 입력에 써 넣는 값인데, 엘리먼트에는 둘 다 할 수 없습니다.

## 목록에 없는 값

`allowCustom`은 기본값이 켜짐이고, 그것이 검색되는 Select와의 차이입니다.

입력한 텍스트가 blur에서 조용히 확정되는 대신 목록 끝에 **자기 행**으로 제시됩니다. 그래서 값을 추가하는 것은 사용자가 보이는 순간에 내리는 선택이 되고, Enter로도 클릭으로도 화살표 키로도 다른 행과 똑같이 닿을 수 있습니다.

값이 닫힌 집합인 필드에서는 끄세요.

## 예시

### multiple

고른 값은 필드 안의 [MPChip](../display/chip)이 되고, 입력은 그 뒤로도 계속 걸러냅니다. 필드가 한 번도 닫히지 않은 채로 태그 묶음이 만들어집니다.

<Demo src="combobox/multiple" :minHeight="120">

<<< @/.vitepress/demos/combobox/multiple.tsx

</Demo>

### errorMessage

별도의 `error` 불리언이 없습니다. 컨트롤을 오류 상태로 만드는 것은 메시지이고, 그래서 왜 잘못됐는지 설명 없이 잘못돼 보이는 컨트롤은 만들 수 없습니다.

<Demo src="combobox/states" :minHeight="320">

<<< @/.vitepress/demos/combobox/states.tsx

</Demo>

`description`은 같은 칸이고, `errorMessage`는 그 아래 쌓이는 것이 아니라 그것을 대체합니다 — 머터리얼은 보조 텍스트에 한 줄을 줍니다.

### clearable

기본값은 꺼짐입니다. 한 번 클릭으로 비워지는 필드는 실수로도 비워지는 필드입니다.

### limit

한 번에 보여줄 최대 행 수입니다. 기본값 `-1`은 전부입니다.

## 접근성

- 필터링과 collator, 팝업의 위치와 뒤집힘, `combobox`/`listbox` 연결, 목록과 칩을 가로지르는 화살표 키 이동, 폼과 함께 제출되게 하는 숨은 입력은 Base UI가 가집니다.
- 노치의 라벨이 입력의 이름이 되고, Base UI는 셰브런을 필드 자신의 이름으로 부릅니다 — "언어"라는 필드 옆의 "언어" 버튼은 그 필드를 여는 버튼입니다. `openLabel`은 라벨이 아예 없는 콤보박스를 위한 대비책입니다.
- 고른 행은 칠뿐 아니라 **체크**로도 표시됩니다. 칠은 키보드 커서의 모습이기도 하기 때문입니다. "선택됨"과 "화살표 키가 있는 곳"이 같은 색인 목록은 읽을 수 없는 목록입니다.

## 함께 보기

- [MPSelect](./select) — 값이 닫힌 집합이고 입력할 것이 없을 때.
- [MPTextField](./text-field) — 이것이 빌려 쓰는 껍데기.
- [MPChip](../display/chip) — `multiple`에서 고른 값이 되는 것.
