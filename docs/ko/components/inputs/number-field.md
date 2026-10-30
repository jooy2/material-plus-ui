---
title: MPNumberField
order: 3
---

# MPNumberField

<p class="mp-lede">숫자만 담는 필드이고, `MPTextField`의 껍데기를 픽셀 단위로 그대로 씁니다. 화살표 키와 증감 버튼이 `step`만큼 움직이고, 값은 `min`과 `max` 사이로 잘리며, `format`은 통화나 백분율로 써 주면서도 값 자체는 순수한 숫자로 남깁니다.</p>

<Demo src="number-field/hero" :minHeight="72" />

::: fw react

```tsx
import { MPNumberField } from 'material-plus-ui';

const [quantity, setQuantity] = useState(1);

<MPNumberField label="수량" value={quantity} onValueChange={setQuantity} min={1} max={20} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPNumberField(
  label: const Text('수량'),
  value: quantity,
  onChanged: (double? next) => setState(() => quantity = next),
  min: 1,
  max: 20,
);
```

:::

## Props

<PropsTable name="MPNumberField" />

::: fw flutter

`value`를 주면 controlled 필드가 됩니다. `null`도 값이고, 빈 필드를 뜻합니다. `value`를 빼면 필드가 숫자를 직접 들고 있고 `initialValue`에서 시작합니다. React 패키지에서 넘어오지 않는 것은 [React 빌드와 다른 점](#react-빌드와-다른-점)에 있습니다.

:::

::: fw react

## `<input type="number">`가 아닌 이유

native 쪽도 될 것처럼 보이기 때문에 분명히 적어 둘 가치가 있습니다.

일부 브라우저에서는 텍스트를 조용히 받아들입니다. 스피너는 스타일을 줄 수 없고, 사파리에는 스피너가 아예 없습니다. 기본적으로 스크롤에 반응해서, 포인터 아래에서 페이지가 스크롤되면 값이 바뀝니다. 그리고 파싱에 실패한 모든 입력을 `''`로 보고합니다. 즉 _약간_ 잘못된 필드와 빈 필드를 읽는 쪽에서 구분할 수 없습니다.

이것은 `inputmode="numeric"`을 가진 `type="text"`에 role 설명을 붙인 것이고, Base UI의 number field가 하는 방식입니다. 그래서 휴대폰은 여전히 숫자 키패드를 띄우고 스크린 리더는 여전히 숫자 필드라고 말하면서, 파싱은 브라우저의 기분이 아니라 로케일을 기준으로 이루어집니다.

:::

::: fw flutter

## 아래에 무엇이 있는가

숫자 키보드를 띄우는 텍스트 필드이고, 숫자는 텍스트와 따로 관리합니다. `-5`로 가는 길에 혼자 입력된 `-`는 아직 숫자로 읽히지 않는 텍스트일 뿐이므로, 그동안 필드는 `null`을 알리고 필드를 떠날 때 상자를 정리합니다. 스텝, 범위 제한, 서식처럼 숫자 필드가 더하는 것은 모두 필드가 직접 하므로 어느 플랫폼에서나 똑같이 동작합니다.

:::

## 예시

### format

::: fw react

`format`은 `Intl.NumberFormat`으로 그대로 전달됩니다. 그래서 상자는 `$1,240.00`이라고 말하면서 `onValueChange`는 `1240`을 넘깁니다.

:::

::: fw flutter

`format`은 숫자를 상자에 들어갈 텍스트로 바꾸는 함수입니다. 그래서 상자는 `$1,240.00`이라고 말하면서 `onChanged`는 `1240`을 넘깁니다. `parse`는 그 반대쪽으로, 입력된 텍스트를 숫자로 되읽습니다. 빼 두면 숫자, 부호, 소수점을 뺀 나머지를 모두 버리고 읽으므로 통화나 단위는 그대로 되읽힙니다. 백분율은 `15%`가 `0.15`이므로 직접 줘야 합니다.

:::

<Demo src="number-field/format" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/number-field/format.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/number_field/format.dart

:::

</Demo>

이 분리가 이것이 파라미터인 이유의 전부입니다. 들어갈 때 서식을 입히면 나올 때 파싱을 해야 하고, 어려운 쪽은 파싱입니다.

### steppers

세 가지 배치이고, 네 번째는 없습니다.

<Demo src="number-field/steppers" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/number-field/steppers.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/number_field/steppers.dart

:::

</Demo>

native 숫자 입력이 만들어 내는 모양 — 위아래로 쌓인 절반 높이 chevron 한 쌍 — 은 의도적으로 없습니다. `xs`에서는 화살표 하나가 3픽셀도 되지 않고, 그만한 표적은 아무도 맞히지 못합니다.

`min`이나 `max`에 닿은 증감 버튼은 그냥 반응하지 않는 것이 아니라 비활성화됩니다. 누르기 전에 갈 곳이 없다는 것을 볼 수 있어야 하니까요. `readOnly`는 두 버튼을 통째로 없앱니다. 비활성 상태로 남겨 두는 것은 같은 말을 두 번 하는 것이고, 그중 비활성 쪽은 고장 난 것처럼 보입니다. 증감 버튼을 누르고 있으면 잠깐 쉰 뒤 반복합니다.

### floatingLabel

숫자가 없고 포커스도 없는 동안 라벨은 필드 자신의 줄 위에 내려와 있다가 포커스나 첫 숫자에서 노치로 올라갑니다. 규칙 전체는 [MPTextField](./text-field#floatinglabel)에 있습니다.

::: fw react

`steppers="split"`은 라벨을 노치에 고정합니다. `startIcon`과 같은 이유로, 빼기 버튼이 정확히 내려온 라벨이 설 자리에 앉기 때문입니다.

:::

::: fw flutter

`steppers: MPNumberFieldSteppers.split`은 라벨을 노치에 고정합니다. `startIcon`과 같은 이유로, 빼기 버튼이 정확히 내려온 라벨이 설 자리에 앉기 때문입니다.

:::

### step, largeStep, smallStep

`step`은 화살표 키 한 번입니다. Shift는 `largeStep`(기본 10), Alt는 `smallStep`(기본 0.1)을 씁니다. Base UI의 관례이고 스프레드시트와 같은 동작입니다. Page Up과 Page Down도 `largeStep`을 쓰고, Home과 End는 범위에 끝이 있으면 `min`과 `max`로 갑니다.

::: fw react

```tsx
<MPNumberField label="투명도" step={0.05} smallStep={0.01} min={0} max={1} />
```

:::

::: fw flutter

```dart
MPNumberField(label: const Text('투명도'), step: 0.05, smallStep: 0.01, min: 0, max: 1)
```

:::

### onValueCommitted

::: fw react

`onValueChange`는 모든 변경마다 — 모든 키 입력, 모든 스텝, 휠 한 칸마다 — 발생합니다. `onValueCommitted`는 값이 확정될 때 한 번 발생합니다. 타이핑 후 blur, 버튼을 누르고 뗀 시점, 그리고 키보드에서는 `onValueChange`와 함께입니다.

:::

::: fw flutter

`onChanged`는 모든 변경마다 — 모든 키 입력, 모든 스텝, 휠 한 칸마다 — 호출됩니다. `onValueCommitted`는 값이 확정될 때 한 번 호출됩니다. 타이핑 후 포커스를 잃거나 Enter를 누른 시점, 버튼을 누르고 뗀 시점, 그리고 키보드에서는 `onChanged`와 함께입니다.

:::

앞의 것으로 폼 상태를 맞추고, 비싼 일은 뒤의 것에 두세요.

## 접근성

::: fw react

- 라벨은 외곽선의 홈에 놓이고 `id`로 input과 연결됩니다. 텍스트 필드와 똑같습니다.
- 두 증감 버튼은 이름을 가진 진짜 버튼입니다. `incrementLabel`과 `decrementLabel`은 기본값이 영어이고, 현지화된 애플리케이션에서는 바꿔 주는 것을 전제로 합니다.
- `allowWheelScrub`은 기본이 **꺼짐**입니다. 포인터 아래에서 페이지가 스크롤되는 것과 필드가 바뀌는 것은 같은 제스처이고, 의도한 쪽은 하나뿐입니다.

:::

::: fw flutter

- 화면 낭독기에게 필드는 라벨로 이름이 붙은 텍스트 필드 노드 하나입니다. 텍스트 필드와 똑같습니다.
- 두 증감 버튼은 이름을 가진 버튼입니다. `incrementLabel`과 `decrementLabel`의 기본값은 `locale`의 단어입니다. Tab은 이 버튼에 멈추지 않습니다. 숫자를 움직이는 화살표 키가 필드의 것이므로, 버튼마다 멈추면 필드를 지나가는 데 두 번을 더 눌러야 합니다.
- `allowWheelScrub`은 기본이 **꺼짐**입니다. 포인터 아래에서 페이지가 스크롤되는 것과 필드가 바뀌는 것은 같은 제스처이고, 의도한 쪽은 하나뿐입니다.

:::

::: fw flutter

## React 빌드와 다른 점

이 페이지의 대부분은 두 패키지에서 같습니다. 아래는 같지 않은 지점과 그 이유입니다.

| React | Flutter | 이유 |
| --- | --- | --- |
| `onValueChange` | `onChanged` | 평범한 변경에 붙는 Flutter의 이름입니다. `onValueCommitted`는 이름을 그대로 둡니다. |
| `defaultValue` | `initialValue` | Flutter의 이름입니다. `value`를 빼면 숫자가 아닌 표식이 기본값으로 들어가고, 그것이 필드를 uncontrolled로 만듭니다. `value: null`은 비어 있는 controlled 필드입니다. |
| `format` (`Intl.NumberFormatOptions`) | `format`과 `parse` (함수) | Dart SDK에는 `Intl.NumberFormat`이 없고 이 패키지는 의존성이 없으므로, 쓰는 쪽과 읽는 쪽을 직접 줍니다. |
| `locale` (`Intl.LocalesArgument`) | `locale` (`String?`) | 증감 버튼의 언어만 정합니다. 숫자를 쓰는 방식은 `format`이 정합니다. |
| `onKeyDown`, `onKeyUp` | `onKeyEvent` | `KeyEventResult`를 돌려주는 콜백 하나입니다. |
| `onFocus`, `onBlur` | `onFocusChange` | `bool`을 받는 콜백 하나입니다. 포커스를 잃을 때의 확정은 그대로 일어납니다. |
| `onClick`, `onDoubleClick`, `onContextMenu` | — | 포인터는 필드를 `GestureDetector`로 감싸서 받습니다. |
| `id`, `className`, `style` | — | 넘겨줄 대상이 없습니다. |
| — | `semanticLabel`, `focusNode`, `autofocus` | 보이는 라벨이 없는 필드의 이름과, 밖에서 다루는 포커스입니다. |

나머지는 일부러 맞췄습니다. 껍데기, 세 가지 증감 버튼 배치, 확정할 때의 범위 제한, 키, 누르고 있으면 반복되는 버튼, 요청하기 전에는 꺼져 있는 휠이 그렇습니다.

:::

## 함께 보기

- [MPTextField](./text-field) — 여기서 빌려 온 껍데기.
- [MPSlider](./slider) — 읽는 사람이 정확히 아는 값이 아니라 가늠하는 값이라면.

::: fw react

- [Base UI Number Field](https://base-ui.com/react/components/number-field) — 아래에 깔린 동작.

:::
