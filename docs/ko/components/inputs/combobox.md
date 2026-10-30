---
title: MPCombobox
order: 3
---

# MPCombobox

<p class="mp-lede">입력할 수도 있고 고를 수도 있는 필드입니다. 껍데기는 <code>MPSelect</code>의 트리거와 마찬가지로 셰브런을 단 <code>MPTextField</code>이고, 다른 것은 텍스트가 하는 일입니다. 목록을 걸러내고, 값 그 자체가 될 수도 있습니다.</p>

<Demo src="combobox/hero" :minHeight="90" />

::: fw react

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

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPCombobox(
  label: const Text('언어'),
  items: const <MPComboboxOption>[
    MPComboboxOption(value: 'ts', label: 'TypeScript'),
    MPComboboxOption(value: 'rs', label: 'Rust'),
  ],
  value: language,
  onChanged: (MPComboboxValue? next) => setState(() => language = next),
);
```

:::

## Props

<PropsTable name="MPCombobox" />

### `items`

<PropsTable name="MPComboboxOption" />

::: fw react

`label`이 `ReactNode`가 아니라 `string`인 것이 [MPSelect](./select)와 다른 유일한 지점입니다. 이 라벨은 필터가 비교하는 대상이자 텍스트 입력에 써 넣는 값인데, 엘리먼트에는 둘 다 할 수 없습니다.

:::

::: fw flutter

`label`이 `Widget`이 아니라 `String`인 것이 [MPSelect](./select)와 다른 유일한 지점입니다. 이 라벨은 필터가 비교하는 대상이자 텍스트 필드에 써 넣는 값인데, 위젯에는 둘 다 할 수 없습니다.

`value`를 주면 controlled 콤보박스가 됩니다. `null`도 값이고, 아무것도 고르지 않았다는 뜻입니다. `value`를 빼면 값을 직접 들고 있고 `initialValue`에서 시작합니다. React 패키지에서 넘어오지 않는 것은 [React 빌드와 다른 점](#react-빌드와-다른-점)에 있습니다.

:::

## 목록에 없는 값

`allowCustom`은 기본값이 켜짐이고, 그것이 검색되는 Select와의 차이입니다.

입력한 텍스트가 blur에서 조용히 확정되는 대신 목록 끝에 **자기 행**으로 제시됩니다. 그래서 값을 추가하는 것은 사용자가 보이는 순간에 내리는 선택이 되고, Enter로도 클릭으로도 화살표 키로도 다른 행과 똑같이 닿을 수 있습니다.

값이 닫힌 집합인 필드에서는 끄세요.

목록에 없는 `value`가 어떻게 보이는지도 같은 규칙이 정합니다. 값 자체가 그려지는데, 여기서 그것은 조회 실패가 아니라 누군가 입력한 값이기 때문입니다. **그래서 고르지 않음은 `null`입니다** — `0`도 `''`도 아닙니다. 센티널은 커스텀 값과 구별되지 않고, 필드는 그것을 그대로 보여 줍니다.

## 예시

### multiple

고른 값은 필드 안의 [MPChip](../display/chip)이 되고, 입력은 그 뒤로도 계속 걸러냅니다. 필드가 한 번도 닫히지 않은 채로 태그 묶음이 만들어집니다.

::: fw flutter

`multiple`은 별도의 생성자 `MPCombobox.multiple`이고, 그 `value`, `initialValue`, `onChanged`는 `List<MPComboboxValue>`로 말합니다. 플래그에 따라 타입이 바뀌는 값은 읽을 때마다 호출하는 쪽이 타입을 좁혀야 하기 때문입니다.

:::

<Demo src="combobox/multiple" :minHeight="120">

::: fw react

<<< @/.vitepress/demos/combobox/multiple.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/combobox/multiple.dart

:::

</Demo>

::: fw flutter

입력한 글자의 맨 앞에서 뒤쪽 화살표를 누르면 칩으로 들어가고, 줄을 따라가는 화살표로 칩 사이를 오갑니다. 칩에서 Backspace나 Delete를 누르면 그 칩이 빠지고, 빈 필드에서 Backspace를 누르면 마지막 칩이 빠집니다. 목록에서 이미 고른 행을 다시 고르면 그 값이 빠집니다.

:::

### errorMessage

별도의 `error` 불리언이 없습니다. 컨트롤을 오류 상태로 만드는 것은 메시지이고, 그래서 왜 잘못됐는지 설명 없이 잘못돼 보이는 컨트롤은 만들 수 없습니다.

<Demo src="combobox/states" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/combobox/states.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/combobox/states.dart

:::

</Demo>

`description`은 같은 칸이고, `errorMessage`는 그 아래 쌓이는 것이 아니라 그것을 대체합니다 — 머터리얼은 보조 텍스트에 한 줄을 줍니다.

### floatingLabel

고른 것도 입력한 것도 없고 포커스도 없는 동안 라벨은 입력 자신의 줄 위에 내려와 있다가 포커스·첫 글자·첫 칩에서 노치로 올라갑니다. 입력한 글자만으로도 내용으로 칩니다. 라벨이 그 아래에서 입력되고 있는 글자 위에 앉아 있을 수는 없기 때문입니다. 규칙 전체는 [MPTextField](./text-field#floatinglabel)에 있습니다.

### clearable

기본값은 꺼짐입니다. 한 번 클릭으로 비워지는 필드는 실수로도 비워지는 필드입니다.

### limit

한 번에 보여줄 최대 행 수입니다. 기본값 `-1`은 전부입니다.

목록이 보여주는 행은 하나하나가 실제 요소이고, 가상화하지 않습니다. 몇백 개는 바로 열리지만 몇천 개면 팝업이 열릴 때 눈에 띄게 멈추며, 그 멈춤은 메인 스레드의 긴 작업입니다. 긴 목록에는 `limit`으로 상한을 두세요. 상한은 필터 다음에 적용되므로 검색은 여전히 모든 항목을 대상으로 하고, 독자는 입력해서 목록을 좁히며, 팝업은 일치하는 앞쪽 행만 그립니다.

::: fw react

```tsx
<MPCombobox items={countries} limit={50} />
```

브라우저에 통째로 보낼 수 없을 만큼 긴 목록이라면 검색으로 바꾸세요. 독자가 입력할 때마다 일치하는 항목을 받아 아래의 `filter={null}`과 함께 넘기면 됩니다.

:::

::: fw flutter

```dart
MPCombobox(items: countries, limit: 50)
```

통째로 들고 있을 수 없을 만큼 긴 목록이라면 검색으로 바꾸세요. 독자가 입력할 때마다 일치하는 항목을 받아 아래의 `filter: MPCombobox.noFilter`와 함께 넘기면 됩니다.

:::

### filter

질의를 통과할 행을, 이 컴포넌트가 스스로 하는 매칭 대신 정합니다.

::: fw react

**`null`이면 필터링을 아예 끕니다.** 행이 이미 걸러진 채로 도착하는 경우에 쓸 값입니다.

```tsx
<MPCombobox items={results} filter={null} onInputValueChange={search} />
```

:::

::: fw flutter

**`MPCombobox.noFilter`를 주면 필터링을 아예 끕니다.** 행이 이미 걸러진 채로 도착하는 경우에 쓸 값입니다.

```dart
MPCombobox(items: results, filter: MPCombobox.noFilter, onInputValueChange: search)
```

독자가 입력을 멈춘 뒤에 도착한 행들 가운데 첫 행이 도착하는 대로 강조되므로, 여기서 맞춘 행과 똑같이 Enter로 고를 수 있습니다.

:::

키 입력마다 받아 오는 목록은 이쪽이 모르는 것들 — 동의어, 음차, 태그를 비교하기 전에 문장부호를 떼어내는 규칙 — 을 아는 서버가 이미 맞춰 준 것입니다. 여기서 한 번 더 거르면 그 서버가 일치라고 판단한 행을 지우는 일밖에 할 수 없습니다. 이유를 알 수 있는 행이 다음 글자를 치는 순간 사라지는 모습이 그것입니다.

::: fw react

함수는 그 중간입니다. 라벨뿐 아니라 설명까지 비교하거나, collator가 하지 않는 접기를 하고 싶을 때 씁니다.

```tsx
<MPCombobox items={items} filter={(option, query) => option.label?.startsWith(query) ?? false} />
```

:::

::: fw flutter

함수는 그 중간입니다. 라벨뿐 아니라 설명까지 비교하거나, 기본 매칭이 하지 않는 접기를 하고 싶을 때 씁니다. 빼 두면 대소문자를 무시하고 라벨에 질의가 들어 있는 옵션을 남깁니다. 악센트는 접지 않으므로, 직접 준 필터가 그렇게 하지 않는 한 `cafe`로 `Café`를 찾지 못합니다.

```dart
MPCombobox(
  items: items,
  filter: (MPComboboxOption option, String query) => option.label?.startsWith(query) ?? false,
)
```

:::

입력한 값을 제안하는 행은 어느 쪽이든 예외입니다. 그 행의 라벨이 곧 질의이므로, 그것을 감추는 필터는 자기가 받은 질문의 답을 감추는 셈입니다.

### content

자기 라벨보다 많은 것을 그리는 행입니다 — 썸네일, 글리프, 두 번째 줄.

::: fw react

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

:::

::: fw flutter

```dart
MPCombobox(
  items: <MPComboboxOption>[
    for (final Flash flash in flashes)
      MPComboboxOption(
        value: flash.id,
        label: flash.title,
        content: Row(
          spacing: 8,
          children: <Widget>[Image.network(flash.thumbnail, width: 24), Text(flash.title)],
        ),
      ),
  ],
)
```

**팝업에서만** 라벨을 대신합니다. 행이 선택되면 텍스트 필드는 여전히 `label`을 받고, 칩도 `label`을 보여주고, 필터도 `label`을 비교합니다. `label`을 `Widget`으로 넓히는 대신 둘을 따로 둔 이유가 이것입니다. 텍스트 필드의 값은 문자열이고, 자기 문자열이 무엇인지 말할 수 없는 행은 거기에 넣을 것이 없습니다.

:::

### chipVariant와 chipColor

`multiple`일 때 필드 안의 칩이 칠해지는 방식입니다. 기본값은 `primary`의 `tonal`이고, 오류 상태에서는 `error`의 `outlined`입니다.

전체를 `outlined`로 두는 선택은 알아 둘 만합니다. 칠해진 칩 여섯 개가 든 필드는 값이 아니라 버튼 줄로 읽히고, 머터리얼 UI의 autocomplete가 칩을 외곽선으로 그리는 이유가 그것입니다.

::: fw react

```tsx
<MPCombobox multiple chipVariant="outlined" items={tags} />
```

:::

::: fw flutter

```dart
MPCombobox.multiple(chipVariant: MPVariant.outlined, items: tags)
```

:::

## 접근성

::: fw react

- 필터링과 collator, 팝업의 위치와 뒤집힘, `combobox`/`listbox` 연결, 목록과 칩을 가로지르는 화살표 키 이동, 폼과 함께 제출되게 하는 숨은 입력은 Base UI가 가집니다.
- 노치의 라벨이 입력의 이름이 되고, Base UI는 셰브런을 필드 자신의 이름으로 부릅니다 — "언어"라는 필드 옆의 "언어" 버튼은 그 필드를 여는 버튼입니다. `openLabel`은 라벨이 아예 없는 콤보박스를 위한 대비책입니다.

:::

::: fw flutter

- 화면 낭독기에게 필드는 텍스트 필드 노드 하나입니다. 노치의 라벨로 이름이 붙고, 목록이 펼쳐졌는지 알립니다. 셰브런은 필드 이름으로 불립니다 — "언어"라는 필드 옆의 "언어" 버튼은 그 필드를 여는 버튼입니다. `openLabel`은 라벨이 아예 없는 콤보박스를 위한 대비책입니다.
- 입력하는 동안 첫 일치 행이 강조되므로 Enter로 바로 고릅니다. 화살표 키는 목록을 열고 움직이며, Escape나 바깥 누르기는 목록을 닫고 텍스트를 되돌립니다. 포커스는 내내 입력란에 있습니다.
- 칩은 각각 따로 멈추는 자리이고, Tab이 아니라 입력란에서 화살표 키로 닿습니다. 칩의 ×는 자기가 지우는 칩의 이름으로 불립니다.
- 셰브런과 ×에는 Tab이 멈추지 않습니다. 입력란에서 화살표 키와 Backspace로 같은 일을 합니다.
- `MPForm` 안에서는 `name`으로 값이 나머지와 함께 넘어가고, 비어 있는 필수 콤보박스는 제출을 막고 포커스를 받으며, 폼이 그 이름으로 돌려준 오류가 필드 아래에 보입니다.

:::

- 고른 행은 칠뿐 아니라 **체크**로도 표시됩니다. 칠은 키보드 커서의 모습이기도 하기 때문입니다. "선택됨"과 "화살표 키가 있는 곳"이 같은 색인 목록은 읽을 수 없는 목록입니다.

::: fw flutter

## React 빌드와 다른 점

이 페이지의 대부분은 두 패키지에서 같습니다. 아래는 같지 않은 지점과 그 이유입니다.

| React | Flutter | 이유 |
| --- | --- | --- |
| `multiple` | `MPCombobox.multiple` | 별도의 생성자라서 `value`와 `onChanged`의 타입이 값 하나인지 리스트인지 정해집니다. |
| `onValueChange` | `onChanged` | 평범한 변경에 붙는 Flutter의 이름입니다. `onInputValueChange`와 `onOpenChange`는 이름을 그대로 둡니다. |
| `defaultValue`, `defaultOpen` | `initialValue`, `initialOpen` | Flutter의 이름입니다. 단일 콤보박스에서 `value`를 빼면 값이 아닌 표식이 기본값으로 들어가고, 그것이 값을 직접 들게 만듭니다. `value: null`은 아무것도 고르지 않은 controlled 콤보박스입니다. |
| `string \| number` | `MPComboboxValue` (`Object`) | Dart에는 유니언 타입이 없습니다. `String`이나 `num`을 넘기세요. 독자가 입력한 값은 `String`으로 옵니다. |
| `filter={null}` | `filter: MPCombobox.noFilter` | Dart에서 `null`은 기본 매칭을 남겨 두는 값입니다. |
| collator 매칭 | 대소문자만 무시, 악센트는 구분 | Dart에는 collator가 없고 이 패키지는 의존성이 없습니다. 악센트를 접으려면 `filter`를 직접 주세요. |
| `label`, `emptyMessage`, `customLabel` (`ReactNode`) | `Widget` | 보통 `Text`입니다. |
| `inputRef` | `focusNode` | Flutter에서는 포커스 노드로 텍스트 필드에 닿습니다. |
| `onKeyDown`, `onKeyUp` | `onKeyEvent` | `KeyEventResult`를 돌려주는 콜백 하나입니다. 콤보박스보다 먼저 모든 키를 듣습니다. |
| `onFocus`, `onBlur` | `onFocusChange` | `bool`을 받는 콜백 하나입니다. |
| `onClick`, `onDoubleClick`, `onContextMenu` | — | 포인터는 콤보박스를 `GestureDetector`로 감싸서 받습니다. |
| `id`, `className`, `style`, `classNames` | — | 넘겨줄 대상이 없습니다. |
| — | `semanticLabel`, `autofocus` | 보이는 라벨이 없는 콤보박스의 이름과, 들어오면서 받는 포커스입니다. |

나머지는 일부러 맞췄습니다. 껍데기, 입력한 값을 제안하는 행, 첫 일치 행의 강조, 칩과 그 색, 팝업의 면과 체크가 그렇습니다.

:::

## 함께 보기

- [MPSelect](./select) — 값이 닫힌 집합이고 입력할 것이 없을 때.
- [MPTextField](./text-field) — 이것이 빌려 쓰는 껍데기.
- [MPChip](../display/chip) — `multiple`에서 고른 값이 되는 것.
