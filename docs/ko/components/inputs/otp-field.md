---
title: MPOtpField
order: 5
---

# MPOtpField

<p class="mp-lede">한 글자짜리 칸의 줄입니다. PIN, 문자로 온 인증 코드, 초대 키. 몇 개의 입력이 있든 그 뒤에는 하나의 감춰진 값이 있습니다.</p>

<Demo src="otp-field/hero" :minHeight="140" />

::: fw react

```tsx
import { MPOtpField } from 'material-plus-ui';

<MPOtpField label="인증 코드" onComplete={(code) => verify(code)} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPOtpField(label: const Text('인증 코드'), onComplete: (String code) => verify(code));
```

:::

## Props

<PropsTable name="MPOtpField" />

::: fw flutter

`value`를 주면 controlled 필드가 되고, 빼면 필드가 코드를 직접 들고 `initialValue`에서 시작합니다. React 패키지에서 넘어오지 않는 것은 [React 빌드와 다른 점](#react-빌드와-다른-점)에 있습니다.

:::

## 라벨이 노치가 아니라 줄 위에 있습니다

이 컨트롤이 [MPTextField](./text-field)의 껍데기에서 벗어나는 유일한 지점입니다.

노치 라벨은 외곽선 상자 **하나**의 것인데 코드는 여섯 개입니다. 첫 번째 상자에 노치를 파면 필드가 아니라 첫 자리 숫자에 이름을 붙이게 됩니다. 나머지는 같은 물건입니다. 같은 `corner-extra-small`, `outline`의 같은 얇은 선, 포커스에서의 같은 2픽셀 `primary` ring.

## 예시

### length

2–12로 제한됩니다. 한 칸은 `MPTextField`이고, 열둘을 넘으면 줄이 휴대폰에 들어가지 않습니다.

### groupSize와 separator

<Demo src="otp-field/grouping" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/otp-field/grouping.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/otp_field/grouping.dart

:::

</Demo>

### charset

`numeric`이 기본값인 이유는 문자로 오는 코드가 그것이고, 휴대폰에 숫자판을 띄우는 것도 그것이기 때문입니다. charset이 거부한 것은 보여주지 않고 버려지며 `onValueInvalid`로 알립니다.

### onComplete

마지막 칸이 채워지는 순간 실행됩니다 — 아무도 누르지 않을 제출 버튼을 기다리는 대신, 코드를 확인할 순간이 바로 그때입니다. `autoSubmit`은 한 걸음 더 나아가 필드가 속한 [MPForm](./form)을 제출합니다.

### errorMessage

별도의 `error` 불리언이 없습니다. 필드를 오류 상태로 만드는 것은 메시지이고, 모든 칸의 외곽선·글자·캐럿이 함께 `error`를 향합니다.

<Demo src="otp-field/states" :minHeight="300">

::: fw react

<<< @/.vitepress/demos/otp-field/states.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/otp_field/states.dart

:::

</Demo>

### size

모든 단계가 같은 이름의 컨트롤 높이입니다. 그래서 코드는 폼에서 위아래 필드와 같은 높이에 섭니다. **너비**는 아닙니다. 한 칸은 한 글자를 담으므로 높이보다 좁게 그려집니다 — 그것이 이 줄을 작은 필드의 줄이 아니라 한 글자씩 들어갈 자리의 줄로 읽히게 합니다.

타입 스케일이 컨트롤 사다리보다 훨씬 위인 것도 같은 이유입니다. 인증 코드는 휴대폰에서 소리 내어 읽으며 다른 손으로 입력하는 것이고, 폼에서 위의 라벨보다 커야 하는 유일한 텍스트입니다.

<Demo src="otp-field/sizes" :minHeight="460">

::: fw react

<<< @/.vitepress/demos/otp-field/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/otp_field/sizes.dart

:::

</Demo>

## 접근성

::: fw react

- 칸들 뒤의 감춰진 값, 캐럿이 있던 자리에서부터 퍼지는 붙여넣기, 한 칸 뒤로 물러나는 backspace, 포인터 아래가 아니라 첫 빈 칸에 떨어지는 클릭, 휴대폰이 메시지에서 바로 코드를 제안하게 하는 autofill 훅은 Base UI가 가집니다.
- 구분자는 `aria-hidden`입니다. 대시는 하나의 값 안에 있는 문장부호이지 두 가지 사이의 구분이 아니고, 묶음마다 그것을 읽어 주는 리더는 코드가 아니라 상자의 모양을 읽어 주는 것입니다.
- 포커스는 `:focus-visible`이 아니라 `:focus`에 그려집니다. 칸은 입력만큼이나 클릭으로도 포커스를 받고, 다음 키가 어느 글자에 떨어질지 말해 주는 것은 ring뿐이기 때문입니다.

:::

::: fw flutter

- 칸들 뒤에는 에디터 하나가 있습니다. 그래서 붙여넣기는 캐럿이 있던 자리부터 칸에 퍼지고, backspace는 한 칸 뒤로 물러나며, 줄의 어디를 눌러도 포인터 아래 칸이 아니라 마지막 글자 뒤에 떨어집니다. 에디터는 `AutofillHints.oneTimeCode`를 요청하므로 휴대폰이 메시지에서 바로 코드를 제안할 수 있습니다.
- 화면 낭독기에게 필드는 코드 자체를 담은 텍스트 필드 노드 하나입니다. `mask`가 켜져 있으면 가려졌다고 알리고 점으로 읽습니다.
- 구분자는 시맨틱 트리에서 뺍니다. 대시는 하나의 값 안에 있는 문장부호이지 두 가지 사이의 구분이 아니고, 묶음마다 그것을 읽어 주는 리더는 코드가 아니라 상자의 모양을 읽어 주는 것입니다.
- 링은 포인터든 키보드든 필드가 포커스를 가지면 그려집니다. 칸은 입력만큼이나 누르는 것으로도 포커스를 받고, 다음 키가 어느 글자에 떨어질지 말해 주는 것은 링뿐이기 때문입니다.

:::

::: fw flutter

## React 빌드와 다른 점

이 페이지의 대부분은 두 패키지에서 같습니다. 아래는 같지 않은 지점과 그 이유입니다.

| React | Flutter | 이유 |
| --- | --- | --- |
| `onValueChange` | `onChanged` | Flutter의 이름입니다. `onComplete`와 `onValueInvalid`는 이름을 그대로 둡니다. |
| `defaultValue` | `initialValue` | Flutter의 이름입니다. |
| `autoFocus` | `autofocus` | Flutter의 이름입니다. |
| `separator` (노드) | `separator` (위젯) | 기본값은 `const Text('–')`이고, 칸의 타입으로 그립니다. |
| `autoSubmit` (감싼 `<form>`) | `autoSubmit` (감싼 `MPForm`) | Flutter에는 native 폼이 없으므로, 필드는 자기를 감싼 [MPForm](./form)을 제출합니다. |
| `className`, `style` | — | 넘겨줄 대상이 없습니다. |
| — | `semanticLabel`, `focusNode` | 보이는 라벨이 없는 필드의 이름과, 밖에서 다루는 포커스입니다. |

나머지는 일부러 맞췄습니다. 칸의 크기와 타입, 줄 위의 라벨, 칸을 키우지 않는 링, charset, 길이 제한이 그렇습니다.

:::

## 함께 보기

- [MPTextField](./text-field) — 이것이 공유하는 껍데기.
- [MPNumberField](./number-field) — 코드가 아니라 수량일 때.
