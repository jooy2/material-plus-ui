---
title: MPForm
order: 13
---

# MPForm

<p class="mp-lede">자기 필드 중 어느 것이 틀렸는지 아는 폼입니다.</p>

<Demo src="form/hero" :minHeight="320" />

::: fw react

```tsx
import { MPForm, MPTextField, MPButton } from 'material-plus-ui';

<MPForm onSubmit={(values) => save(values)}>
  <MPTextField
    name="email"
    type="email"
    label="이메일"
    required
    value={email}
    onChange={setEmail}
  />
  <MPButton type="submit">저장</MPButton>
</MPForm>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();

MPForm(
  key: form,
  onSubmit: (Map<String, Object?> values) => save(values),
  children: <Widget>[
    MPTextField(
      name: 'email',
      type: MPTextFieldType.email,
      label: const Text('이메일'),
      required: true,
      value: email,
      onChanged: (String next) => setState(() => email = next),
    ),
    MPButton(onPressed: () => form.currentState!.submit(), child: const Text('저장')),
  ],
);
```

:::

## Props

<PropsTable name="MPForm" />

## 무엇을 더하는지

[MPTextField](./text-field)가 늘어선 페이지는 혼자서는 한 번에 한 필드씩만 검사하고, 제출이 실패하면 빨간 것을 찾는 일은 독자에게 남습니다.

이 컴포넌트가 소유하는 것은 필드들 **위에서** 다뤄져야 하는 부분입니다.

- 제출은 모든 필드의 유효성을 한 번에 모으고, 포커스는 실패한 첫 필드에 놓입니다.
- `errors`는 서버의 답을 그것이 속한 필드 위로 되돌려 놓습니다.
- 자식들은 간격을 두고 쌓입니다. 폼은 스택이고, 간격 없는 스택은 서로 맞닿은 필드의 열입니다.

::: fw react

`onSubmit`을 주면 값이 그 함수로 오고, 기본 제출은 취소됩니다. 대신 `action`(URL이나 React 서버 액션)을 주면 유효한 제출이 그쪽으로 갑니다. 자바스크립트가 로드되기 전의 페이지가 가진 폼도 바로 이것입니다.

선택기도 여기서는 다른 필드와 같습니다. 필수인 선택기는 아무것도 고르지 않은 동안 제출을 막고, 값은 `name` 아래 문자열 하나로 `onSubmit`에 옵니다. 날짜, 시간, 색은 숨은 입력이 제출하는 값 그대로 오고, 범위는 `2026-07-01/2026-07-04` 같은 ISO 8601 구간으로, `multiple`인 `MPTreeSelect`는 값들을 쉼표로 이어서 옵니다.

:::

::: fw flutter

`onSubmit`을 주면 값이 맵으로 옵니다. 이름이 있는 필드마다 그 `name` 아래 값이 들어가고, 텍스트 필드와 코드는 `String`, 숫자 필드는 `double?`입니다. `name`이 없는 필드는 검사만 하고 넘기지 않으며, 비활성 필드는 둘 다 하지 않습니다.

Flutter에는 제출 버튼 타입이 없으므로 제출은 세 곳에서 옵니다. 하나는 `MPFormState.submit()`이고, `GlobalKey<MPFormState>`나 폼 안의 버튼에서 `MPForm.of(context)`로 닿습니다. 둘째는 자기 `onSubmit`이 없는 한 줄 [MPTextField](./text-field)에서 누른 Enter입니다. `<input>`에서 Enter가 자기 `<form>`을 제출하는 것과 같습니다. 셋째는 `autoSubmit`인 [MPOtpField](./otp-field)가 다 채워졌을 때입니다. `submit()`은 폼이 유효했는지를 돌려줍니다.

필드가 스스로 하는 검사는 React 빌드가 브라우저에서 받는 검사 가운데 Flutter에 대응하는 것이 있는 쪽입니다. 비어 있는 `required` 필드는 "Required"라고 말하고, 메시지를 등록하면 읽는 사람의 언어로 말합니다. 다 채우지 않은 필수 코드도 비어 있는 것으로 칩니다.

:::

그게 전부입니다. 표면도, 여백도, 본문 폭도 없습니다. 그것들은 이 폼을 감싸는 [MPCard](../layout/card)나 [MPContainer](../layout/container)의 몫입니다. 컨테이너가 대는 근거 그대로, 페이지의 모양을 정하는 것이 페이지를 제출하는 것이어서는 안 됩니다.

## 폼 라이브러리가 아닙니다

여기에는 스키마도, 리졸버도, 필드 배열도 없습니다.

그것들이 필요한 프로젝트는 이미 쓰고 있는 것을 그대로 두고 결과를 `errors`에 넘기면 됩니다. 이 컴포넌트가 그 이음매를 중심으로 지어진 것이고, 통합이 아니라 **이음매**인 이유는 그 라이브러리들 전부가 `{ [name]: message }`를 만들어 낼 수 있기 때문입니다.

## validationMode

기본값은 `onSubmit`이고, 그 뒤로는 값이 바뀔 때마다입니다. 뒤쪽 절반이 이것을 쓸 만하게 만듭니다. 실패한 필드는 다시 감시 대상이 되므로, 고치는 동안 메시지가 사라집니다. 두 번째 제출을 기다리지 않고요.

`onBlur`와 `onChange`가 더 시끄러운 두 답입니다. 특히 `onChange`는 아직 이메일 주소를 반쯤 입력하는 중인 사람에게 틀렸다고 말하고, 그래서 기본값이 아닙니다.

## errors

<Demo src="form/errors" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/form/errors.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/form/errors.dart

:::

</Demo>

각 메시지가 속한 필드의 `name`으로 키가 붙으므로, 페이지 위쪽 배너가 아니라 **필드 위에** 놓입니다. 그리고 그 필드가 바뀌는 순간 지워집니다. 이제 아무도 갖고 있지 않은 값에 대한 오류는 아무것도 아닌 것에 대한 오류입니다.

이 라이브러리의 모든 필드가 그것을 보여 줍니다. 자기 `errorMessage`를 가진 필드는 그것을 유지하고, 없는 필드는 할 말이 있을 때만 보조 줄을 그립니다. 그리고 그때가 바로 폼이 무언가를 건넨 순간입니다.

::: fw flutter

`errors`의 오류는 다음 제출을 막지 않습니다. 지난 제출에 대한 바깥의 답이고, 바깥에 다시 묻는 방법이 다음 제출이기 때문입니다. 메시지가 다른 새 맵을 주면, 그 사이에 바뀐 필드에도 다시 보여 줍니다.

:::

## 예시

### 카드 안에서

::: fw react

```tsx
<MPCard title="계정">
  <MPForm onSubmit={save}>…</MPForm>
</MPCard>
```

:::

::: fw flutter

```dart
MPCard(
  title: const Text('계정'),
  child: MPForm(onSubmit: save, children: <Widget>[...]),
)
```

:::

### 묶인 질문들

폼 안의 [MPFieldset](./fieldset)은 하나의 질문에 함께 답하는 컨트롤 묶음이고, 그 위에 이름이 붙습니다.

::: fw react

```tsx
<MPForm onSubmit={save}>
  <MPFieldset legend="청구지 주소">
    <MPTextField name="street" label="도로명" … />
    <MPTextField name="city" label="도시" … />
  </MPFieldset>
  <MPButton type="submit">저장</MPButton>
</MPForm>
```

:::

::: fw flutter

```dart
MPForm(
  key: form,
  onSubmit: save,
  children: <Widget>[
    MPFieldset(
      legend: const Text('청구지 주소'),
      children: <Widget>[
        MPTextField(name: 'street', label: const Text('도로명'), ...),
        MPTextField(name: 'city', label: const Text('도시'), ...),
      ],
    ),
    MPButton(onPressed: () => form.currentState!.submit(), child: const Text('저장')),
  ],
)
```

:::

### 서버 왕복

::: fw react

```tsx
const [errors, setErrors] = useState({});

<MPForm
  errors={errors}
  onSubmit={async (values) => {
    const result = await save(values);
    setErrors(result.ok ? {} : result.errors);
  }}
>
  …
</MPForm>;
```

:::

::: fw flutter

```dart
Map<String, String> errors = const <String, String>{};

MPForm(
  errors: errors,
  onSubmit: (Map<String, Object?> values) async {
    final SaveResult result = await save(values);
    setState(() => errors = result.ok ? const <String, String>{} : result.errors);
  },
  children: <Widget>[...],
)
```

:::

## 접근성

::: fw react

- 진짜 `<form>`이므로 필드 안에서 Enter로 제출되고, 브라우저 자신의 자동 완성이 채울 대상이 생깁니다.
- 실패한 제출은 포커스를 첫 번째 유효하지 않은 필드로 옮깁니다. 화면을 볼 수 없는 독자에게는 그것이 없으면 아무 일도 일어나지 않은 것과 같습니다.
- 각 메시지는 `aria-describedby`로 자기 필드에 연결됩니다. Base UI의 `Field`가 아무도 id를 만들지 않고도 해 줍니다.
- `onSubmit`은 네이티브 이벤트를 막으므로, 값을 처리하는 동안 어디로도 이동하지 않습니다.

:::

::: fw flutter

- 한 줄 필드에서 누른 Enter는 `<form>` 안에서처럼 폼을 제출합니다.
- 실패한 제출은 트리에 놓인 순서로 첫 번째 유효하지 않은 필드에 포커스를 옮깁니다. 화면을 볼 수 없는 독자에게는 그것이 없으면 아무 일도 일어나지 않은 것과 같습니다.
- 각 메시지는 필드의 이름과 함께 읽히고, 필드는 유효하지 않다고 알립니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `type="submit"` 버튼이 제출하는 native `<form>` | `MPFormState.submit()` | Flutter에는 폼 엘리먼트가 없습니다. 상태에는 `GlobalKey<MPFormState>`나 `MPForm.of(context)`로 닿습니다. |
| `onSubmit(values: Record<string, unknown>)` | `onSubmit(Map<String, Object?>)` | 같은 맵을 Dart의 타입으로 받습니다. |
| `errors: Record<string, string \| string[]>` | `errors: Map<String, String>` | 필드마다 메시지 하나입니다. 목록은 이어 붙여서 넘기세요. |
| `action` | — | 제출할 URL이나 서버 액션이 없습니다. |
| 브라우저의 제약 검사 | `required` | 이메일 주소 모양 같은 브라우저의 다른 검사는 Flutter에 대응하는 것이 없습니다. 직접 검사해서 `errorMessage`로 넘기세요. |
| `children` | `children` (`List<Widget>`) | 쌓기에 쓰는 Flutter의 모양입니다. |
| native `<form>` 속성, `className` | — | 넘겨줄 대상이 없습니다. |

:::

## 함께 보기

- [MPFieldset](./fieldset) — 폼 안에서 쓰는, 이름 하나가 붙은 컨트롤 묶음.
- [MPTextField](./text-field) — 폼이 보통 한 페이지 가득 담는 필드.
- [MPCard](../layout/card) — 폼이 보통 놓이는 시트.
