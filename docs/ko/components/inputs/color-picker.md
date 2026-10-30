---
title: MPColorPicker
order: 6
---

# MPColorPicker

<p class="mp-lede">눈으로 고르는 색입니다. 채도 사각형과 그 옆의 색조 레일 — 모든 디자인 도구가 결국 정착한 배치이고, 한 번의 포인터 움직임 안에 한 색조의 모든 색을 넣어 주는 유일한 배치이기 때문입니다.</p>

<Demo src="color-picker/hero" :minHeight="100" />

::: fw react

```tsx
import { MPColorPicker } from 'material-plus-ui';

<MPColorPicker label="태그 색" value={colour} onValueChange={setColour} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPColorPicker(
  label: const Text('태그 색'),
  value: colour,
  onChanged: (String next) => setState(() => colour = next),
);
```

:::

## Props

<PropsTable name="MPColorPicker" />

::: fw flutter

`value`를 주면 controlled 피커가 됩니다. `''`도 값이고, 색이 없다는 뜻입니다. `value`를 빼면 피커가 색을 직접 들고 있고 `initialValue`에서 시작합니다. React 패키지에서 넘어오지 않는 것은 [React 빌드와 다른 점](#react-빌드와-다른-점)에 있습니다.

:::

## 이것은 테마가 아닙니다

여기서 고른 색은 **데이터**입니다. 태그의 색, 캘린더의 색, 프로젝트의 색. `--mp-source-color`가 아니고, 런타임에 라이브러리를 다시 테마하는 방법도 아닙니다. 그쪽은 [색상](../../design/color)입니다.

picker는 스킴의 네 계열을 스와치로 제공하지도 않습니다. 그것들은 의미를 가진 *role*이고 — `primary`는 "이 화면에서 가장 중요한 것"을 뜻합니다 — 여기서 그것을 내주는 것은 누군가 애플리케이션을 다시 테마하는 순간 사용자 눈앞에서 움직이는 네 가지 색을 내주는 일입니다.

## 패널의 상태는 HSV이고, 거기서 벗어나지 않습니다

그것이 포인터가 검은 구석에 있을 때 색조 레일을 가만히 있게 하는 것입니다. RGB를 거치면 모든 검정은 같은 색이고, 사각형 바닥에 닿는 순간 레일이 빨강으로 튀게 됩니다.

값은 모델에서 유도되지 그 반대가 아니며, 들어온 `value`는 모델이 이미 뜻하는 것과 다른 말을 할 때만 모델을 다시 심습니다 — 문자열이 아니라 색으로 비교합니다. `#FF0000`과 `#ff0000`은 두 가지로 적힌 같은 색이기 때문입니다.

이 아래에 색 라이브러리는 없습니다. 변환은 백 줄 남짓의 산술이고, 그래서 컬러 피커는 패키지가 이미 설치하는 것 위에 아무것도 더하지 않습니다.

## 예시

### format과 swatches

<Demo src="color-picker/format" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/color-picker/format.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/color_picker/format.dart

:::

</Demo>

`format`은 값이 어떤 표기로 나갈지 정합니다. `hex`는 불투명할 때 alpha 쌍을 떼고, 두 함수형 표기도 같은 이유로 네 번째 인자를 뗍니다 — `alpha`를 켠 적 없는 호출자가 세 채널만 쓴 컨트롤에서 `rgba(…, 1)`을 보게 되어서는 안 됩니다.

`swatches`는 제품이 실제로 쓰는 몇 가지 색을 한 번의 클릭 거리에 둡니다.

::: fw react

`false`면 그리지 않습니다.

:::

::: fw flutter

빈 리스트면 그리지 않고, 빼 두면 기본 제공 색들을 그립니다.

:::

체크 표시는 견본 사이를 건너뛰는 대신 서서히 옮겨 갑니다. 견본을 고른다고 견본 자체가 달라지지는 않으므로, 표시가 움직이는 것이 피드백의 전부입니다. 한 프레임 만에 나타나는 표시는 선택이 아니라 깜빡임으로 읽힙니다. 포인터가 올라간 견본은 같은 200ms 동안 elevation 1로 떠오릅니다.

### floatingLabel

색이 없고 트리거에 포커스도 없는 동안 라벨은 트리거 자신의 줄 위에 내려와 있다가 포커스나 첫 색에서 노치로 올라갑니다. 규칙 전체는 [MPTextField](./text-field#floatinglabel)에 있습니다.

견본도 함께 내려갑니다. 라이브러리에서 앞머리 표식이 자리를 내주는 컨트롤은 이것 하나뿐입니다. 다른 곳에서 값 앞의 표식은 어포던스입니다 — 달력 글리프는 트리거를 누르면 달력이 열린다고 말합니다 — 그래서 자리를 지키고 라벨을 밀어냅니다. 견본은 값을 그린 것입니다. 피커에 색이 없으면 아무 말도 하지 않는 빈 고리이므로, 자리를 내주었다가 라벨과 함께 돌아옵니다.

### inline

트리거 없이 패널을 페이지 안에 그립니다. picker가 폼 속 필드가 아니라 내용 자체인 사이드바나 설정 화면을 위한 것입니다.

<Demo src="color-picker/inline" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/color-picker/inline.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/color_picker/inline.dart

:::

</Demo>

### alpha

세 번째 레일을 더하고 값이 네 번째 채널을 갖게 합니다. 레일은 체커보드 위에 그려지는데, 일부만 존재하는 색을 정직하게 보여주는 방법은 그것뿐입니다.

### editable

패널 아래의 필드입니다. 이해할 수 있는 색을 입력하면 패널이 움직이고, 그 외의 것을 입력하면 패널은 그대로 있고 입력한 글자만 보입니다.

### locale과 labels

피커가 지어내야 하는 일곱 문자열입니다. 채도 사각형에는 이름을 가져올 데가 없기 때문입니다. 사각형, 레일 둘, 값 필드, 스와치 격자, ×, 그리고 색을 고르기 전 트리거가 보여 주는 단어.

그것들은 컴포넌트에 남는 기본값이 아니라 라이브러리 자신의 [메시지 표](../../design/localization)에 있습니다. 단어를 지어내는 모든 컴포넌트가 따르는 규칙입니다. `locale`이 번역을 가져오고, `MPLocaleProvider`가 애플리케이션 전체에 한 번에 그것을 주며, `labels`가 나머지를 맡습니다.

::: fw react

```tsx
// 번역된 것.
<MPColorPicker locale="ko" … />

// 그리고 그 위에 얹는 내 단어 하나.
<MPColorPicker locale="ko" labels={{ empty: '아직 없음' }} … />
```

:::

::: fw flutter

```dart
// 번역된 것.
MPColorPicker(locale: 'ko', …)

// 그리고 그 위에 얹는 내 단어 하나.
MPColorPicker(locale: 'ko', labels: const <String, String>{'empty': '아직 없음'}, …)
```

:::

덮어쓰기가 번역보다 우선하고, 지정하지 않은 나머지는 번역된 채로 남습니다.

## 접근성

- 사각형과 두 레일은 모두 slider이고 화살표 키로 움직입니다. Shift는 라이브러리의 다른 곳과 마찬가지로 열 칸씩 움직입니다.
- 트리거는 [MPSelect](./select)와 똑같이 노치의 라벨로 이름이 붙습니다.
- 고른 스와치 위의 체크는 검정이거나 흰색이고, 아래 스와치의 상대 휘도가 그것을 정합니다. 고정된 흰 체크는 노란색 위에서 사라집니다.

::: fw flutter

- 트리거는 버튼 노드 하나이고, 적힌 색을 값으로 갖고 팝업이 펼쳐졌는지 알립니다.
- 팝업이 열리면 포커스가 사각형으로 들어갑니다. Tab으로 사각형, 레일, 값 필드, 스와치를 차례로 지나고, Escape나 바깥 누르기는 팝업을 닫고 포커스를 트리거로 돌려줍니다. Tab으로 패널을 벗어나도 팝업이 닫힙니다.
- 레일은 Home과 End에도 답합니다. 화면 낭독기는 모든 slider를 한 칸씩 올리고 내릴 수 있고, 한 칸 움직이면 값이 무엇이 되는지 듣습니다.
- 인라인 피커는 라벨로 이름이 붙은 그룹 하나입니다. 그래서 그 안의 slider들이 서로 구별되지 않는 "색조"와 "불투명도" 두 벌이 되지 않습니다.

## React 빌드와 다른 점

이 페이지의 대부분은 두 패키지에서 같습니다. 아래는 같지 않은 지점과 그 이유입니다.

| React | Flutter | 이유 |
| --- | --- | --- |
| `onValueChange` | `onChanged` | 평범한 변경에 붙는 Flutter의 이름입니다. `onOpenChange`는 이름을 그대로 둡니다. |
| `defaultValue`, `defaultOpen` | `initialValue`, `initialOpen` | Flutter의 이름입니다. |
| `swatches={false}` | `swatches: const <String>[]` | 빈 리스트는 아무것도 그리지 않고, `null`이 기본 제공 색들을 요청합니다. |
| `labels` (`Partial<MPColorPickerLabels>`) | `labels` (`Map<String, String>?`) | 같은 키를 맵으로 받습니다. |
| `label`, `description`, `errorMessage` (`ReactNode`) | `Widget?` | 보통 `Text`입니다. |
| `id`, `className`, `style` | — | 넘겨줄 대상이 없습니다. |
| — | `semanticLabel`, `focusNode`, `autofocus` | 보이는 라벨이 없는 피커의 이름과, 밖에서 다루는 트리거의 포커스입니다. |

나머지는 일부러 맞췄습니다. HSV 모델, 패널의 크기 단계, 세 가지 표기, 체커보드, 스와치 격자와 체크, 그리고 라벨과 함께 내려가는 견본이 그렇습니다.

:::

## 함께 보기

- [MPSelect](./select) — 이것이 빌려 쓰는 트리거.
- [색상](../../design/color) — 이것이 설정하지 _않는_, 라이브러리 자신의 스킴.
- [지역화](../../design/localization) — 피커 자신의 일곱 단어가 오는 곳.
