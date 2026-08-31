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

### floatingLabel

고른 것도 입력한 것도 없고 포커스도 없는 동안 라벨은 입력 자신의 줄 위에 내려와 있다가 포커스·첫 글자·첫 칩에서 노치로 올라갑니다. 입력한 글자만으로도 내용으로 칩니다. 라벨이 그 아래에서 입력되고 있는 글자 위에 앉아 있을 수는 없기 때문입니다. 규칙 전체는 [MPTextField](./text-field#floatinglabel)에 있습니다.

### clearable

기본값은 꺼짐입니다. 한 번 클릭으로 비워지는 필드는 실수로도 비워지는 필드입니다.

### limit

한 번에 보여줄 최대 행 수입니다. 기본값 `-1`은 전부입니다.

### filter

질의를 통과할 행을, 이 컴포넌트가 스스로 하는 매칭 대신 정합니다.

**`null`이면 필터링을 아예 끕니다.** 행이 이미 걸러진 채로 도착하는 경우에 쓸 값입니다.

```tsx
<MPCombobox items={results} filter={null} onInputValueChange={search} />
```

키 입력마다 받아 오는 목록은 이쪽이 모르는 것들 — 동의어, 음차, 태그를 비교하기 전에 문장부호를 떼어내는 규칙 — 을 아는 서버가 이미 맞춰 준 것입니다. 여기서 한 번 더 거르면 그 서버가 일치라고 판단한 행을 지우는 일밖에 할 수 없습니다. 이유를 알 수 있는 행이 다음 글자를 치는 순간 사라지는 모습이 그것입니다.

함수는 그 중간입니다. 라벨뿐 아니라 설명까지 비교하거나, collator가 하지 않는 접기를 하고 싶을 때 씁니다.

```tsx
<MPCombobox items={items} filter={(option, query) => option.label?.startsWith(query) ?? false} />
```

입력한 값을 제안하는 행은 어느 쪽이든 예외입니다. 그 행의 라벨이 곧 질의이므로, 그것을 감추는 필터는 자기가 받은 질문의 답을 감추는 셈입니다.

### content

자기 라벨보다 많은 것을 그리는 행입니다 — 썸네일, 글리프, 두 번째 줄.

```tsx
<MPCombobox
  items={flashes.map((flash) => ({
    value: flash.id,
    label: flash.title,
    content: (
      <span className="flex items-center gap-2">
        <img src={flash.thumbnail} alt="" width={24} height={24} />
        {flash.title}
      </span>
    )
  }))}
/>
```

**팝업에서만** 라벨을 대신합니다. 행이 선택되면 입력칸은 여전히 `label`을 받고, 칩도 `label`을 보여주고, 필터도 `label`을 비교합니다. `label`을 `ReactNode`로 넓히는 대신 둘을 따로 둔 이유가 이것입니다. 텍스트 입력의 값은 문자열이고, 자기 문자열이 무엇인지 말할 수 없는 행은 거기에 넣을 것이 없습니다.

### chipVariant와 chipColor

`multiple`일 때 필드 안의 칩이 칠해지는 방식입니다. 기본값은 `primary`의 `tonal`이고, 오류 상태에서는 `error`의 `outlined`입니다.

전체를 `outlined`로 두는 선택은 알아 둘 만합니다. 칠해진 칩 여섯 개가 든 필드는 값이 아니라 버튼 줄로 읽히고, 머터리얼 UI의 autocomplete가 칩을 외곽선으로 그리는 이유가 그것입니다.

```tsx
<MPCombobox multiple chipVariant="outlined" items={tags} />
```

## 접근성

- 필터링과 collator, 팝업의 위치와 뒤집힘, `combobox`/`listbox` 연결, 목록과 칩을 가로지르는 화살표 키 이동, 폼과 함께 제출되게 하는 숨은 입력은 Base UI가 가집니다.
- 노치의 라벨이 입력의 이름이 되고, Base UI는 셰브런을 필드 자신의 이름으로 부릅니다 — "언어"라는 필드 옆의 "언어" 버튼은 그 필드를 여는 버튼입니다. `openLabel`은 라벨이 아예 없는 콤보박스를 위한 대비책입니다.
- 고른 행은 칠뿐 아니라 **체크**로도 표시됩니다. 칠은 키보드 커서의 모습이기도 하기 때문입니다. "선택됨"과 "화살표 키가 있는 곳"이 같은 색인 목록은 읽을 수 없는 목록입니다.

## 함께 보기

- [MPSelect](./select) — 값이 닫힌 집합이고 입력할 것이 없을 때.
- [MPTextField](./text-field) — 이것이 빌려 쓰는 껍데기.
- [MPChip](../display/chip) — `multiple`에서 고른 값이 되는 것.
