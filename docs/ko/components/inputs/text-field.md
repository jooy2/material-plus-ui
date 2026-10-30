---
title: MPTextField
order: 1
---

# MPTextField

<p class="mp-lede">IME를 견디는 머터리얼 outlined 텍스트 필드입니다. 라벨, 보조 텍스트, adornment, 비밀번호 토글이 이미 조립되어 있습니다. 색·크기·지속시간이 모두 Material Design 3의 컴포넌트 토큰에서 옵니다.</p>

<Demo src="text-field/hero" :minHeight="72" />

::: fw react

```tsx
import { MPTextField } from 'material-plus-ui';

const [email, setEmail] = useState('');

<MPTextField label="이메일" type="email" value={email} onChange={setEmail} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTextField(
  label: const Text('이메일'),
  type: MPTextFieldType.email,
  value: email,
  onChanged: (String next) => setState(() => email = next),
);
```

:::

## Props

<PropsTable name="MPTextField" />

::: fw flutter

이 필드는 머터리얼의 `TextField`가 아니라 `package:flutter/widgets.dart`의 `EditableText` 위에 만들었습니다. 그래서 위에 `MaterialApp`이 없는 앱에서도 동작합니다. React 패키지에서 넘어오지 않는 것은 [React 빌드와 다른 점](#react-빌드와-다른-점)에 있습니다.

:::

## 이 컴포넌트가 존재하는 이유

::: fw react

controlled `<input>`은 `value` prop으로부터 그려집니다. 그런데 입력기(IME)가 조합 중일 때 — 한국어, 일본어, 중국어, 그리고 몇몇 유럽 자판의 데드키 조합 — 브라우저는 아직 확정되지 않은 **임시** 문자열을 엘리먼트 안에 들고 있습니다. 그 순간에 `value`를 덮어써 버리면 조합이 깨집니다. 만들던 음절이 사라지고 커서가 끝으로 튑니다.

:::

::: fw flutter

controlled 필드는 `value`를 에디터에 써 넣습니다. 그런데 입력기(IME)가 조합 중일 때 — 한국어, 일본어, 중국어, 그리고 몇몇 유럽 자판의 데드키 조합 — 에디터는 플랫폼이 관리하는 조합 범위와 함께 아직 확정되지 않은 **임시** 문자열을 들고 있습니다. 그 순간에 값을 덮어쓰면 조합이 끝나 버립니다. 만들던 음절이 사라지고 커서가 튑니다. 부모가 `onChanged`에서 `TextEditingController`에 값을 써 넣는 방식이 바로 이 문제를 겪습니다.

:::

부모가 변경 콜백에서 값에 무언가를 하기만 하면 이 문제가 터집니다. trim, 대문자 변환, 검증, 심지어 그냥 다시 그리는 속도가 느린 것만으로도 충분합니다.

`MPTextField`는 조합이 진행되는 동안 `value`를 보여 주지 않고, 실제로 조합되고 있는 내용을 보여 줍니다. 변경 콜백은 키 입력마다 그대로 호출되므로 부모는 입력되는 텍스트를 실시간으로 봅니다. 조합이 끝나면 확정된 텍스트를 알리고 다시 controlled 상태로 돌아갑니다.

<Demo src="text-field/composition" :minHeight="104">

::: fw react

<<< @/.vitepress/demos/text-field/composition.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_field/composition.dart

:::

</Demo>

이 예시의 부모는 받은 값을 전부 대문자로 바꿉니다. 한글 단어를 입력해 보세요. 만들어지는 중인 음절은 그대로 유지되고, 그 음절이 확정된 뒤에야 규칙이 적용됩니다. 평범하게 제어되는 필드라면 키를 누를 때마다 글자가 하나씩 사라집니다.

::: fw react

`value`와 `onChange`가 이벤트가 아니라 문자열인 이유이기도 합니다. 이벤트의 `target`은 조합 중인 엘리먼트이고, 그것이 바로 믿으면 안 되는 값입니다.

:::

::: fw flutter

필드가 `TextEditingController`가 아니라 문자열로 된 `value`와 `onChanged`를 받는 이유이기도 합니다. 컨트롤러는 부모가 조합 중이든 아니든 언제든 써 넣을 수 있는 공유 상태이고, 문자열은 언제 보여 줄지 필드가 정하는 값입니다.

부모가 거절한 변경은 화면에서도 거절됩니다. 부모의 응답이 실릴 프레임이 지나면 필드는 다시 `value`를 보여 주므로, 이전 텍스트를 그대로 둔 부모의 필드는 그 텍스트를 계속 보여 줍니다.

:::

## 예시

### type

`text`, `email`, `search`, `password`입니다. 이 중 `password`만 모양이 아니라 동작을 바꿉니다. 끝쪽 adornment에 표시/숨김 토글이 생깁니다.

::: fw react

`search`는 불려 나오는 키보드와 거절하는 자동완성 때문에 있습니다. iOS는 이 타입에서 리턴 키를 "검색"으로 쓰고, 브라우저는 여기에 입력된 것의 기록을 따로 남깁니다. 그리는 모습은 `text`와 같고, 브라우저가 안에 넣는 ×는 지웁니다. 그 표시는 adornment 줄 바깥에 있고, 탭 순서에도 없으며, controlled 값을 React에게 알리지 않고 비웁니다.

:::

::: fw flutter

타입은 `MPTextFieldType.text`, `.email`, `.search`, `.password`입니다. `email`은 `@`가 있는 키보드를 띄우고 자동 수정을 끕니다. `search`는 키보드의 동작 키를 "검색"으로 바꿉니다. 둘 다 그리는 모습은 `text`와 같습니다.

:::

<Demo src="text-field/password" :minHeight="72">

::: fw react

<<< @/.vitepress/demos/text-field/password.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_field/password.dart

:::

</Demo>

::: fw react

토글을 눌러도 커서가 움직이지 않습니다. `mousedown`과 `mouseup`을 둘 다 취소하기 때문인데, 하나만 취소하면 필드가 포커스를 잃고 커서가 텍스트 끝으로 돌아옵니다. 필드가 비활성화되면 토글도 함께 비활성화됩니다.

:::

::: fw flutter

토글을 눌러도 커서가 움직이지 않습니다. 토글은 눌릴 때 포커스를 가져가지 않고 필드의 탭 영역 안에 있으므로, 에디터가 포커스를 지키고 커서도 제자리에 남습니다. Tab으로는 토글에 갈 수 있고, 필드가 비활성화되면 토글도 함께 비활성화됩니다.

:::

### errorMessage

별도의 `error` boolean은 없습니다. 메시지가 곧 오류 상태를 만들므로, 왜 잘못되었는지 설명 없이 잘못되어 보이기만 하는 필드는 만들 수 없습니다.

<Demo src="text-field/states" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/text-field/states.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_field/states.dart

:::

</Demo>

::: warning `PageTextField`에서 옮겨 오신다면

원본에서는 오류 색이 helper 텍스트에만 닿고 외곽선은 평상시 상태 그대로였습니다. 여기서는 `errorMessage`가 컨트롤 전체 — 외곽선, 라벨, 메시지 — 를 함께 뒤집습니다. 스펙이 요구하는 동작입니다.

:::

`readOnly`는 값을 보여 주되 수정을 막습니다. `disabled`와 달리 텍스트를 선택할 수 있고 포커스 순서에도 남아 있으므로, 읽는 사람이 복사해야 할 값에 적합합니다.

### floatingLabel

필드가 비어 있고 포커스도 없는 동안 라벨은 필드 자신의 줄 위에, 필드 자신의 타입 스케일로 내려와 플레이스홀더처럼 읽힙니다. 그리고 자리를 비켜줄 무언가가 생기는 순간 노치로 올라갑니다. 이것이 머터리얼의 outlined text field이고, 이 라이브러리의 노치를 두른 컨트롤 전부가 그렇게 동작합니다.

<Demo src="text-field/floating-label" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/text-field/floating-label.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_field/floating_label.dart

:::

</Demo>

라벨을 올려두는 조건은 세 가지입니다. 포커스, 내용, 그리고 `startIcon`. 아이콘은 내려온 라벨이 설 자리에 이미 서 있고 둘이 그 자리를 나눠 쓸 수는 없으므로, 앞에 글리프가 있는 필드는 라벨을 노치에 그대로 둡니다 — 위의 세 번째 필드입니다.

`placeholder`는 라벨이 그 자리에 내려와 있는 동안 보류되고, 포커스와 함께 돌아옵니다. 어차피 쓸모가 있는 시점도 그때입니다. 한 상자 안의 회색 문자열 두 개는 힌트가 아닙니다.

::: fw react

`floatingLabel={false}`는 라벨을 노치에 고정합니다 — 위의 두 번째 필드입니다.

:::

::: fw flutter

`floatingLabel: false`는 라벨을 노치에 고정합니다 — 위의 두 번째 필드입니다.

:::

이것이 필요한 이유는 하나입니다. 라벨이 있는 필드와 없는 필드의 높이가 같은 것은 라벨이 올라가 있는 동안뿐이므로, 둘을 섞어 놓은 행이나 라벨이 움직이는 것 자체가 소음인 빽빽한 폼에서는 고정하는 편이 나을 수 있습니다.

여러 줄 필드에서는 내려온 라벨이 상자 한가운데가 아니라 첫 줄에 놓입니다. 여섯 줄짜리 상자의 한가운데는 커서가 있는 곳과 아무 상관이 없기 때문입니다.

### rows

::: fw react

`rows`를 주면 `<input>` 대신 `<textarea>`를 그립니다. 나머지는 모두 동일합니다.

:::

::: fw flutter

`rows`를 주면 그 줄 수만큼 높은 여러 줄 필드가 됩니다. 나머지는 모두 동일합니다.

:::

<Demo src="text-field/multiline" :minHeight="200">

::: fw react

<<< @/.vitepress/demos/text-field/multiline.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_field/multiline.dart

:::

</Demo>

::: fw react

`resizable`은 사용자가 드래그해서 필드를 늘릴 수 있게 합니다. 세로 방향만인데, 가로로 넓힐 수 있는 필드는 자기가 속한 폼의 열을 무너뜨리기 때문입니다.

:::

### size

다섯 단계이고 `md`가 스펙의 크기입니다. 머터리얼이 텍스트 필드에 규정하는 크기는 56px 하나이므로, 아무것도 지정하지 않으면 그것이 나옵니다. 나머지 네 단계가 있는 이유는 컴포넌트 라이브러리가 디자인 시스템이 계획하지 않은 자리에 쓰이기 때문입니다 — 필터 바, 표 안의 인라인 편집기, 촘촘한 설정 페이지 같은 곳입니다. 이 규칙은 [Prop 규약](../../design/prop-conventions#size)에 있습니다.

높이는 누군가 지정한 숫자가 아니라 머터리얼 타입 스케일에 패딩을 더한 값입니다. 그래서 여러 줄 필드가 자기 크기를 넘어 자랄 수 있습니다.

<Demo src="text-field/sizes" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/text-field/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_field/sizes.dart

:::

</Demo>

### startIcon

텍스트 앞에 놓이는 내용이고 보통 [MPIcon](../display/icon)입니다. `on-surface-variant` 롤과 필드 자체의 간격을 따르므로, 여기에 놓인 글리프는 스펙이 leading icon을 두는 자리에 놓입니다.

::: fw react

```tsx
<MPTextField
  label="검색"
  value={query}
  onChange={setQuery}
  startIcon={<MPIcon icon={ICONS.search} size={18} />}
/>
```

:::

::: fw flutter

```dart
MPTextField(
  label: const Text('검색'),
  value: query,
  onChanged: (String next) => setState(() => query = next),
  startIcon: MPIcon(icon: searchGlyph, size: 18),
)
```

`Icon`이나 `IconTheme`을 읽는 위젯은 필드에서 단계별 글리프 크기와 `on-surface-variant` 색을 받습니다.

:::

끝쪽 adornment는 비밀번호 토글이 쓰는 자리라 설정할 수 없습니다.

### onSubmit

Enter를 눌렀을 때 호출됩니다.

::: fw react

```tsx
<MPTextField value={query} onChange={setQuery} onSubmit={() => search(query)} />
```

**이 prop을 넘기는 것이 필드가 그 키를 가져가는 조건입니다.** 한 줄 필드에 `onSubmit`이 있으면 이후 Enter가 삼켜지므로 감싸고 있는 `<form>`이 native로 한 번 더 제출되지 않습니다. `onSubmit`이 없으면 그 키는 브라우저의 것이고, `<form>` 안이라면 `<input>`이 원래 하던 native 제출이 그대로 일어납니다. 이미 `<form onSubmit>`을 쓰고 있는 페이지는 여기에 아무것도 줄 필요가 없습니다.

:::

::: fw flutter

```dart
MPTextField(
  value: query,
  onChanged: (String next) => setState(() => query = next),
  onSubmit: () => search(query),
)
```

**이 파라미터를 넘기는 것이 필드가 그 키를 가져가는 조건입니다.** 한 줄 필드에 `onSubmit`이 있으면 Enter를 필드가 가져가므로, 필드를 감싼 [MPForm](./form)이 한 번 더 제출되지 않고 필드도 포커스를 지킵니다. `onSubmit`이 없으면 `MPForm` 안의 한 줄 필드에서 Enter가 폼을 제출합니다. `<input>`에서 Enter가 자기 `<form>`을 제출하는 것과 같습니다. 폼 밖이라면 그 키는 플랫폼의 것이고, 플랫폼은 화면 키보드를 내립니다. 휴대폰 키보드의 동작 키도 Enter로 칩니다.

:::

여러 줄 필드에서는 어느 쪽이든 Enter를 그대로 둡니다. 거기서 Enter는 줄바꿈이고, 그것이 여러 줄 필드의 존재 이유입니다. `disableEnterKey`는 Enter를 원래 가져갈 쪽에게서 뺏습니다. `rows`가 있으면 줄바꿈을, 없으면 폼의 제출을 대상으로 합니다.

**조합을 확정하는 Enter**는 여기까지 오지 않습니다. 한글이나 日本語를 입력하면 음절마다 입력기가 가져가는 Enter로 끝나는데, 그것을 제출로 읽는 필드는 문장의 첫 단어에서 폼을 보내버립니다. 이 컴포넌트가 막으려고 존재하는 바로 그 실패가 `value`가 아니라 키 핸들러를 통해 들어오는 셈입니다. 이 키는 가져가지 않고 그대로 둡니다. 입력기가 확정에 쓰고 있기 때문입니다. 조합 중이 아닐 때 눌린 다음 Enter는 평소대로 제출합니다.

::: fw react

### onKeyDown, 그리고 나머지 날것 이벤트

`onSubmit`은 그냥 누른 Enter입니다. 키보드가 말할 수 있는 나머지 — 조합, Escape, 방향키 — 는 `onKeyDown`으로, 포인터는 `onClick`, `onDoubleClick`, `onContextMenu`로 옵니다.

이들은 주위의 박스가 아니라 **컨트롤**에 붙습니다. 표시 토글에 떨어진 키 입력은 필드에 떨어진 것이 아니고, 토글이 가져가는 포커스도 마찬가지입니다. 당신 것이 **먼저** 실행되며, 필드는 그 키로 자기 일을 하기 전에 `defaultPrevented`를 확인합니다.

```tsx
<MPTextField
  value={draft}
  onChange={setDraft}
  rows={4}
  onSubmit={() => {}} // 여기서 Enter는 여전히 줄바꿈입니다
  onKeyDown={(event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault(); // ⌘Enter는 당신 것이고, 줄바꿈은 일어나지 않습니다
      send(draft);
    }
  }}
/>
```

`onFocus`와 `onBlur`도 같은 묶음에서 오며, 폼 라이브러리의 touched 처리가 기다리는 것이 이 둘입니다.

조합 규칙은 그대로입니다. 음절을 확정하는 Enter는 호출자에게도 들리지만 — 해석은 호출자의 몫입니다 — 필드가 그것을 제출로 바꾸지는 않습니다.

규칙 전체와 이 props를 받는 다른 컴포넌트들은 [Prop 규칙](../../design/prop-conventions#날것-이벤트)에 있습니다.

:::

::: fw flutter

### onKeyEvent와 onFocusChange

`onSubmit`은 그냥 누른 Enter입니다. 키보드가 말할 수 있는 나머지 — 조합, Escape, 방향키 — 는 Flutter의 키 콜백인 `onKeyEvent`로 옵니다.

이 콜백은 주위의 박스가 아니라 **컨트롤**에 붙습니다. 표시 토글에서 눌린 키는 필드에서 눌린 것이 아닙니다. 당신 것이 **먼저** 실행되고, `KeyEventResult.handled`를 돌려주면 그 키를 가져가므로 필드는 더 이상 아무것도 하지 않습니다.

```dart
MPTextField(
  value: draft,
  onChanged: (String next) => setState(() => draft = next),
  rows: 4,
  onKeyEvent: (FocusNode node, KeyEvent event) {
    final bool command = HardwareKeyboard.instance.isMetaPressed ||
        HardwareKeyboard.instance.isControlPressed;

    if (event is KeyDownEvent && event.logicalKey == LogicalKeyboardKey.enter && command) {
      send(draft);

      return KeyEventResult.handled; // ⌘Enter는 당신 것이고, 줄바꿈은 일어나지 않습니다
    }

    return KeyEventResult.ignored;
  },
)
```

`onFocusChange`는 컨트롤이 포커스를 얻고 잃는 것을 알립니다. 폼 라이브러리의 touched 처리가 기다리는 것이 이것입니다. 표시 토글이 포커스를 가져가는 것은 알리지 않습니다.

조합 규칙은 그대로입니다. 음절을 확정하는 Enter는 호출자에게도 들리지만 — 해석은 호출자의 몫입니다 — 필드가 그것을 제출로 바꾸지는 않습니다.

:::

### onFormReset

::: fw react

모든 변경 직전, `onChange`보다 먼저 호출됩니다. 수정으로 인해 의미가 없어진 폼 수준 오류를 지우는, 흔한 경우를 위해 있습니다.

```tsx
<MPTextField
  value={email}
  onChange={setEmail}
  onFormReset={() => setServerError('')}
  errorMessage={serverError}
/>
```

:::

::: fw flutter

모든 변경 직전, `onChanged`보다 먼저 호출됩니다. 수정으로 인해 의미가 없어진 폼 수준 오류를 지우는, 흔한 경우를 위해 있습니다.

```dart
MPTextField(
  value: email,
  onChanged: (String next) => setState(() => email = next),
  onFormReset: () => setState(() => serverError = null),
  errorMessage: serverError,
)
```

:::

::: fw react

### autoFocus

마운트 시 포커스를 줍니다. 다만 작은 화면에서는 건너뜁니다. 방금 도착한 페이지 위로 화면 키보드가 올라오기 때문입니다. 기준은 여러분 테마의 `sm` 중단점입니다.

:::

::: fw flutter

### autofocus

트리에 들어오면서 포커스를 가져갑니다. 다만 compact 창에서는 건너뜁니다. 방금 도착한 화면 위로 화면 키보드가 올라오기 때문입니다. 기준은 `medium` 창 크기 클래스이고, `MPConfigProvider`로 옮길 수 있습니다.

:::

## 접근성

::: fw react

- 라벨은 `id`로 컨트롤과 연결된 진짜 `<label>`입니다. `id`를 주면 그 값을 쓰고, 없으면 자동 생성하므로 필드 두 개가 한 페이지에서 충돌하지 않습니다.
- `required`는 라벨과 컨트롤 양쪽에 반영됩니다.
- 비밀번호 토글은 상태에 따라 이름이 바뀌는 진짜 버튼입니다. 영어로는 "Show the password" / "Hide the password"이고, 한국어 메시지를 등록하면 "비밀번호 표시" / "비밀번호 숨기기"입니다.

:::

::: fw flutter

- 화면 낭독기에게 필드는 한 번 멈추는 자리입니다. 라벨로 이름이 붙고 텍스트를 담은 텍스트 필드이며, 오류 메시지는 이름 다음에 읽힙니다. 필수 라벨의 별표는 읽지 않고, 대신 필드가 필수라고 알립니다.
- 오류 메시지가 있으면 필드가 유효하지 않다고 알리고, 보이는 라벨이 없는 필드에는 `semanticLabel`로 이름을 붙입니다.
- 화면 낭독기의 탭과 포커스는 둘 다 에디터에 닿습니다. 읽기 전용 필드는 포커스만 받고 탭은 받지 않으며, 비활성 필드는 둘 다 받지 않고 Tab도 건너뜁니다.
- 비밀번호 토글은 상태에 따라 이름이 바뀌는 별도의 버튼입니다. 영어로는 "Show the password" / "Hide the password"이고, 한국어 메시지를 등록하면 "비밀번호 표시" / "비밀번호 숨기기"입니다.

:::

::: fw flutter

## React 빌드와 다른 점

이 페이지의 대부분은 두 패키지에서 같습니다. 아래는 같지 않은 지점과 그 이유입니다.

| React | Flutter | 이유 |
| --- | --- | --- |
| `onChange` | `onChanged` | Flutter의 이름입니다. |
| `label` (`string`) | `label` (`Widget?`) | 보통 `Text`를 넘깁니다. Flutter 패키지의 다른 필드가 모두 라벨을 위젯으로 받으므로, 폼의 모든 필드를 같은 방식으로 씁니다. |
| `type="email"` | `type: MPTextFieldType.email` | 문자열이 아니라 enum입니다. |
| `autoComplete` | `autofillHints` | Flutter의 자동 완성은 HTML 토큰 대신 [`AutofillHints`](https://api.flutter.dev/flutter/services/AutofillHints-class.html)를 받습니다. |
| `aria-label` | `semanticLabel` | Flutter의 이름입니다. |
| `autoFocus` | `autofocus` | Flutter의 이름입니다. compact 창의 기준은 테마의 `sm` 중단점이 아니라 `medium` 창 크기 클래스입니다. |
| `onKeyDown`, `onKeyUp` | `onKeyEvent` | 둘을 한 콜백으로 받고, `preventDefault()` 대신 `KeyEventResult`를 돌려줍니다. |
| `onFocus`, `onBlur` | `onFocusChange` | `bool`을 받는 콜백 하나입니다. |
| `onClick`, `onDoubleClick`, `onContextMenu` | — | 포인터는 필드를 `GestureDetector`나 `Listener`로 감싸서 받습니다. |
| 브라우저의 선택 핸들과 컨텍스트 메뉴 | 패키지가 그림 | Android에서는 길게 누르면 단어가 선택되고, 테마의 primary 색으로 끌 수 있는 핸들과 잘라내기, 복사, 붙여넣기, 모두 선택, 공유 메뉴가 필드의 언어로 나타납니다. iOS에서는 시스템 메뉴가 뜹니다. 데스크톱에서는 오른쪽 클릭이 같은 메뉴를 열고, 웹에서는 브라우저 메뉴를 그대로 씁니다. 돋보기는 없습니다. |
| `resizable` | — | CSS의 `resize`이고, Flutter에는 대응하는 것이 없습니다. |
| `id` | — | 라벨이 가리킬 문서가 없습니다. 라벨은 필드의 시맨틱 노드에 들어갑니다. |
| `className`, `style` | — | 넘겨줄 대상이 없습니다. 대신 `focusNode`를 받습니다. |
| Enter로 `<form>` 제출 | Enter로 `MPForm` 제출 | Flutter에는 native 폼이 없으므로, `onSubmit`이 없는 한 줄 필드는 자기를 감싼 [MPForm](./form)을 제출합니다. |

`fullWidth`가 아닌 필드는 브라우저가 `<input>`에 주는 너비처럼 약 스무 글자 너비로 놓이고, 입력해도 넓어지지 않습니다.

나머지는 일부러 맞췄습니다. 조합 처리, 플로팅 라벨과 라벨을 올려두는 세 가지 조건, 노치, Enter 규칙, 커서를 지키는 비밀번호 토글, 크기 단계가 그렇습니다.

:::

## 함께 보기

- [MPIcon](../display/icon) — `startIcon`에 쓰입니다.
- [MPForm](./form) — 여러 필드를 한 번에 제출하고, 서버가 돌려준 오류를 해당 필드에 보여 줍니다.
- [테마](../../guide/getting-started#테마) — 이 필드가 읽는 색상 롤과 바꾸는 방법.

::: fw react

- [Base UI Field](https://base-ui.com/react/components/field) — 아래에 깔린 동작. 라벨 연결, 유효성 상태, 스타일링이 기준으로 삼는 `data-*` 속성.

:::
