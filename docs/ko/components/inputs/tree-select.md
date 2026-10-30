---
title: MPTreeSelect
order: 17
---

# MPTreeSelect

<p class="mp-lede">목록이 아니라 나무에서 값을 고릅니다. 셀렉트와 트리 뷰 사이의 빈자리 — 필드 뒤로 접혀 들어가는 계층입니다.</p>

<Demo src="tree-select/hero" :minHeight="420" />

::: fw react

```tsx
import { MPTreeSelect } from 'material-plus-ui';

<MPTreeSelect
  label="지역"
  searchable
  items={[
    {
      value: 'asia',
      label: '아시아',
      children: [{ value: 'seoul', label: '서울' }]
    }
  ]}
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTreeSelect(
  label: const Text('지역'),
  searchable: true,
  items: const <MPTreeSelectItem>[
    MPTreeSelectItem(
      value: 'asia',
      label: Text('아시아'),
      children: <MPTreeSelectItem>[MPTreeSelectItem(value: 'seoul', label: Text('서울'))],
    ),
  ],
  value: regions,
  onChanged: (List<Object> next) => setState(() => regions = next),
);
```

:::

## Props

<PropsTable name="MPTreeSelect" />

::: fw flutter

### `items`

<PropsTable name="MPTreeSelectItem" />

값은 언제나 리스트이고, `multiple`이 아니면 항목 하나짜리입니다. 주면 controlled 셀렉트가 되고, 빼면 직접 들고 `initialValue`에서 시작합니다. React 패키지에서 넘어오지 않는 것은 [React 빌드와 다른 점](#react-빌드와-다른-점)에 있습니다.

:::

## 들여쓴 옵션을 가진 셀렉트로 하면 안 되는 이유

평평한 목록의 들여쓰기는 계층 자체가 아니라 계층의 그림이기 때문입니다. 아무것도 접히지 않으니 노드 이백 개짜리 분류는 이백 줄로 도착하고, 한 번 스크롤해 지나가고 나면 어떤 행이 그 위의 행에 속하는지 말해 주는 것이 없으며, 어떤 행이 그 아래 행들을 묶기만 할 뿐 자신은 답이 아니라는 말을 할 방법이 없습니다.

답들의 목록에는 [MPSelect](select)가 맞는 컨트롤입니다. 이것은 _어딘가에 속한_ 답을 위한 컨트롤입니다.

## 가지는 답이 아닙니다

`selectableBranches`는 기본이 꺼짐입니다. 이런 나무 대부분이 그런 모양이기 때문입니다. 가지가 분류이고 잎이 답입니다. "유럽"을 "프랑스"와 나란히 고를 수 있다는 것은 보통 아무도 의도하지 않은 데이터 모델이고, 정말로 의도한 날에는 prop 하나를 켜서 그렇다고 말하면 됩니다.

item 자신의 `selectable`은 어느 쪽으로든 이 규칙을 뒤집습니다. 고를 수 있는 가지가 딱 하나인 나무는 그렇게 말합니다.

고를 수 없는 가지는 **비활성 행이 아닙니다**. 다른 행들과 똑같이 생겼고, 포커스를 받고, 열리고 닫힙니다 — 가지가 열리지 않는 분류는 단계만 늘어난 목록입니다. 하지 않는 것은 답하는 일뿐입니다. 그 누름은 트리가 보기 전에 가로채이므로, "유럽"을 누르면 유럽이 열리고 이미 골라 둔 "프랑스"는 있던 자리에 그대로 남습니다.

## 검색은 조상을 남깁니다

`searchable`은 나무 위에 필드를 답니다. 그것이 걸러 내고 남기는 것은 일치한 노드 **하나하나와 그 모든 조상**입니다. 일치한 것만 남긴 나무는 목록이고, 잎들의 목록은 애초에 나무를 고른 이유 그 자체이기 때문입니다. 아무것도 위에 없는 "서울"은 어느 서울인지도, 어느 분류에서 왔는지도 말해 주지 않습니다.

같은 이유에서 규칙 두 개가 따라옵니다.

- **일치한 노드는 자기 자식을 전부 남깁니다.** 일치한 자식만이 아닙니다. 읽는 사람이 찾던 가지를 찾아 준 다음 그 안에 든 것을 감추는 것은 도움의 반대입니다.
- **필터가 남긴 가지는 전부 열립니다.** 닫힌 부모 안에 접혀 있는 일치는 보여 준 적 없는 일치입니다.

검색이 켜져 있는 동안 열려 있는 가지는 읽는 사람의 답이 아니라 검색의 답이므로 `onExpandedChange`는 조용합니다. 필드를 비우면 — 팝업을 닫아도 비워집니다 — 읽는 사람 자신의 상태가 돌아옵니다.

::: fw react

일치 판정은 [MPCombobox](combobox)와 같습니다. `locale`의 언어로 Base UI의 collator가 비교하고, 대소문자와 악센트와 문장부호는 비교에서 뺍니다. "malaga"로 "Málaga"를, "saint etienne"으로 "Saint-Étienne"을 찾습니다. `label`이 순수한 문자열이 아닐 때 무엇에 대고 일치를 볼지는 `searchLabel`이 정합니다.

:::

::: fw flutter

일치 판정은 [MPCombobox](combobox)와 같습니다. 대소문자를 무시하고 노드의 글자에 질의가 들어 있으면 남깁니다. 악센트와 문장부호는 접지 않습니다. Dart에는 collator가 없고 이 패키지는 의존성이 없기 때문입니다. 그래서 "malaga"로 "Málaga"를 찾지 못하니, 그런 노드에는 두 가지 표기를 다 담은 `searchLabel`을 주세요. `label`이 `Text`가 아닐 때 무엇에 대고 일치를 볼지도 `searchLabel`이 정합니다.

:::

필드에 적히는 단어 자체는 [MPTransfer](transfer)의 "검색"입니다. 같은 일을 하는 같은 필드이기 때문입니다. 한 번 더 적어 두면 열여덟 개 로케일에서 한 번 더 번역해야 하고, 둘이 어긋날 기회가 한 번 더 생깁니다.

## 트리거가 쓰는 것

고른 것들의 레이블을 쉼표로 이은 것입니다. `format`은 그것을 무엇으로든 바꾸며, 노드 백 개짜리 다중 선택이 바로 이 prop이 있는 이유입니다.

::: fw react

``format={(chosen) => `${chosen.length}개 선택`}`` 은 어차피 들어가지 않았을 아흔아홉 개의 레이블보다 좁은 자리에서 더 많이 말합니다.

:::

::: fw flutter

`format: (List<MPTreeSelectItem> chosen) => '${chosen.length}개 선택'`은 어차피 들어가지 않았을 아흔아홉 개의 레이블보다 좁은 자리에서 더 많이 말합니다. `String`을 돌려주고, 화면 낭독기도 이 문자열을 트리거의 값으로 읽습니다.

:::

## `name`

::: fw react

값 하나당 `<input type="hidden">` 하나이고, 전부 같은 이름 아래입니다. 그래서 폼은 다중 선택을 반복되는 필드로 읽습니다. `FormData.getAll`이 기대하는 모양이고, `multiple`이 붙은 select가 이미 제출하는 모양입니다.

:::

::: fw flutter

`MPForm` 안에서는 값 리스트가 `name` 아래 들어가고, 아무것도 고르지 않은 필수 셀렉트는 제출을 막고 포커스를 받으며, 폼이 그 이름으로 돌려준 오류가 트리거 아래에 보입니다.

## 접근성

- 트리거는 버튼 노드 하나이고, 노치의 라벨로 이름이 붙고, 트리거가 쓴 글자를 값으로 가지며, 팝업이 펼쳐졌는지 알립니다.
- 팝업이 열리면 포커스가 그 안으로 들어갑니다. 검색 필드가 있으면 그리로 가고, 거기서 아래 화살표를 누르면 나무로 넘어갑니다. 없으면 나무로 바로 갑니다.
- 나무는 멈추는 자리가 하나입니다. 위아래 화살표는 보이는 행을 따라가고, 오른쪽은 가지를 연 다음 그 안으로 들어가며, 왼쪽은 가지를 닫은 다음 부모로 나옵니다. Home과 End는 양 끝으로 가고, Enter나 Space는 행을 누릅니다. 포커스 링은 키가 놓인 행 안쪽에 그려집니다.
- 행마다 골랐는지, 가지라면 펼쳐졌는지 알립니다. 비활성 행은 사용할 수 없다고 알립니다.
- Escape나 바깥 누르기는 팝업을 닫고 포커스를 트리거로 돌려줍니다. Tab으로 팝업을 벗어나도 닫힙니다.

## React 빌드와 다른 점

이 페이지의 대부분은 두 패키지에서 같습니다. 아래는 같지 않은 지점과 그 이유입니다.

| React | Flutter | 이유 |
| --- | --- | --- |
| `value` (`value \| value[] \| null`) | `value` (`List<Object>?`) | 언제나 리스트입니다. `onValueChange`가 이미 돌려주는 모양입니다. `null`이면 셀렉트가 값을 직접 듭니다. |
| `onValueChange` | `onChanged` | 평범한 변경에 붙는 Flutter의 이름입니다. `onExpandedChange`와 `onOpenChange`는 이름을 그대로 둡니다. |
| `defaultValue`, `defaultExpanded`, `defaultOpen` | `initialValue`, `initialExpanded`, `initialOpen` | Flutter의 이름입니다. |
| `format` (`ReactNode` 반환) | `format` (`String` 반환) | 트리거의 글자는 화면 낭독기에게 값이기도 하고, 둘 다 될 수 있는 것은 문자열뿐입니다. |
| collator 매칭 | 대소문자만 무시, 악센트는 구분 | Dart에는 collator가 없고 이 패키지는 의존성이 없습니다. |
| `color` | — | React에서도 사용 중단 예정이고 보이는 효과가 없습니다. |
| `labels` (`Partial<MPPickerLabels>`) | `labels` (`Map<String, String>?`) | `clear` 키를 맵으로 받습니다. |
| `id`, `className`, `style`, `classNames` | — | 넘겨줄 대상이 없습니다. |
| `onKeyDown`, `onKeyUp`, `onFocus`, `onBlur` | `onKeyEvent`, `onFocusChange` | 각각 콜백 하나입니다. |
| — | `semanticLabel`, `focusNode`, `autofocus` | 보이는 라벨이 없는 셀렉트의 이름과, 밖에서 다루는 트리거의 포커스입니다. |

나무의 행은 셀렉트가 직접 그립니다. 행 높이, 들여쓰기, 화살표, 고른 행의 둥근 띠, 안쪽 포커스 링은 React 트리 뷰의 것입니다.

:::
