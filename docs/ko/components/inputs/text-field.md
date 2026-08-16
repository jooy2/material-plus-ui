---
title: MPTextField
order: 1
---

# MPTextField

<p class="mp-lede">IME를 견디는 머터리얼 outlined 텍스트 필드입니다. 라벨, 보조 텍스트, adornment, 비밀번호 토글이 이미 조립되어 있습니다. 색·크기·지속시간이 모두 Material Design 3의 컴포넌트 토큰에서 옵니다.</p>

<Demo src="text-field/hero" :minHeight="72" />

```tsx
import { MPTextField } from 'material-plus-ui';

const [email, setEmail] = useState('');

<MPTextField label="이메일" type="email" value={email} onChange={setEmail} />;
```

## Props

<PropsTable name="MPTextField" />

## 이 컴포넌트가 존재하는 이유

controlled `<input>`은 `value` prop으로부터 그려집니다. 그런데 입력기(IME)가 조합 중일 때 — 한국어, 일본어, 중국어, 그리고 몇몇 유럽 자판의 데드키 조합 — 브라우저는 아직 확정되지 않은 **임시** 문자열을 엘리먼트 안에 들고 있습니다. 그 순간에 `value`를 덮어써 버리면 조합이 깨집니다. 만들던 음절이 사라지고 커서가 끝으로 튑니다.

부모가 `onChange`에서 값에 무언가를 하기만 하면 이 문제가 터집니다. trim, 대문자 변환, 검증, 심지어 그냥 리렌더가 느린 것만으로도 충분합니다.

`MPTextField`는 조합이 진행되는 동안 `value` 렌더링을 멈추고, 엘리먼트가 실제로 담고 있는 내용의 자체 복사본을 보여 줍니다. `onChange`는 키 입력마다 그대로 발생하므로 부모는 입력되는 텍스트를 실시간으로 봅니다. 조합이 끝나면 복사본을 버리고 다시 controlled 상태로 돌아갑니다.

<Demo src="text-field/composition" :minHeight="104">

<<< @/.vitepress/demos/text-field/composition.tsx

</Demo>

이 예시의 부모는 받은 값을 전부 대문자로 바꿉니다. 한글 단어를 입력해 보세요. 만들어지는 중인 음절은 그대로 유지되고, 그 음절이 확정된 뒤에야 규칙이 적용됩니다. 평범하게 제어되는 `<input>`이라면 키를 누를 때마다 글자가 하나씩 사라집니다.

`value`와 `onChange`가 이벤트가 아니라 문자열인 이유이기도 합니다. 이벤트의 `target`은 조합 중인 엘리먼트이고, 그것이 바로 믿으면 안 되는 값입니다.

## 예시

### type

`text`, `email`, `password`입니다. 이 중 `password`만 모양이 아니라 동작을 바꿉니다. 끝쪽 adornment에 표시/숨김 토글이 생깁니다.

<Demo src="text-field/password" :minHeight="72">

<<< @/.vitepress/demos/text-field/password.tsx

</Demo>

토글을 눌러도 커서가 움직이지 않습니다. `mousedown`과 `mouseup`을 둘 다 취소하기 때문인데, 하나만 취소하면 필드가 포커스를 잃고 커서가 텍스트 끝으로 돌아옵니다. 필드가 비활성화되면 토글도 함께 비활성화됩니다.

### errorMessage

별도의 `error` boolean은 없습니다. 메시지가 곧 오류 상태를 만들므로, 왜 잘못되었는지 설명 없이 잘못되어 보이기만 하는 필드는 만들 수 없습니다.

<Demo src="text-field/states" :minHeight="280">

<<< @/.vitepress/demos/text-field/states.tsx

</Demo>

::: warning `PageTextField`에서 옮겨 오신다면

원본에서는 오류 색이 helper 텍스트에만 닿고 외곽선은 평상시 상태 그대로였습니다. 여기서는 `errorMessage`가 컨트롤 전체 — 외곽선, 라벨, 메시지 — 를 함께 뒤집습니다. 스펙이 요구하는 동작입니다.

:::

`readOnly`는 값을 보여 주되 수정을 막습니다. `disabled`와 달리 텍스트를 선택할 수 있고 탭 순서에도 남아 있으므로, 읽는 사람이 복사해야 할 값에 적합합니다.

### floatingLabel

필드가 비어 있고 포커스도 없는 동안 라벨은 필드 자신의 줄 위에, 필드 자신의 타입 스케일로 내려와 플레이스홀더처럼 읽힙니다. 그리고 자리를 비켜줄 무언가가 생기는 순간 노치로 올라갑니다. 이것이 머터리얼의 outlined text field이고, 이제 이 라이브러리의 노치를 두른 컨트롤 전부가 그렇게 동작합니다.

<Demo src="text-field/floating-label" :minHeight="260">

<<< @/.vitepress/demos/text-field/floating-label.tsx

</Demo>

라벨을 올려두는 조건은 세 가지입니다. 포커스, 내용, 그리고 `startIcon`. 아이콘은 내려온 라벨이 설 자리에 이미 서 있고 둘이 그 자리를 나눠 쓸 수는 없으므로, 앞에 글리프가 있는 필드는 라벨을 노치에 그대로 둡니다 — 위의 세 번째 필드입니다.

`placeholder`는 라벨이 그 자리에 내려와 있는 동안 보류되고, 포커스와 함께 돌아옵니다. 어차피 쓸모가 있는 시점도 그때입니다. 한 상자 안의 회색 문자열 두 개는 힌트가 아닙니다.

`floatingLabel={false}`는 라벨을 노치에 고정합니다 — 위의 두 번째 필드입니다. 이것이 필요한 이유는 하나입니다. 라벨이 있는 필드와 없는 필드의 높이가 같은 것은 라벨이 올라가 있는 동안뿐이므로, 둘을 섞어 놓은 행이나 라벨이 움직이는 것 자체가 소음인 빽빽한 폼에서는 고정하는 편이 나을 수 있습니다.

여러 줄 필드에서는 내려온 라벨이 상자 한가운데가 아니라 첫 줄에 놓입니다. 여섯 줄짜리 상자의 한가운데는 커서가 있는 곳과 아무 상관이 없기 때문입니다.

### rows

`rows`를 주면 `<input>` 대신 `<textarea>`를 그립니다. 나머지는 모두 동일합니다.

<Demo src="text-field/multiline" :minHeight="200">

<<< @/.vitepress/demos/text-field/multiline.tsx

</Demo>

`resizable`은 사용자가 드래그해서 필드를 늘릴 수 있게 합니다. 세로 방향만인데, 가로로 넓힐 수 있는 필드는 자기가 속한 폼의 열을 무너뜨리기 때문입니다.

### size

다섯 단계이고 `md`가 스펙의 크기입니다. 머터리얼이 텍스트 필드에 규정하는 크기는 56px 하나이므로, 아무것도 지정하지 않으면 그것이 나옵니다. 나머지 네 단계가 있는 이유는 컴포넌트 라이브러리가 디자인 시스템이 계획하지 않은 자리에 쓰이기 때문입니다 — 필터 바, 표 안의 인라인 편집기, 촘촘한 설정 페이지 같은 곳입니다. 이 규칙은 [Prop 규약](../../design/prop-conventions#size)에 있습니다.

높이는 누군가 지정한 숫자가 아니라 머터리얼 타입 스케일에 패딩을 더한 값입니다. 그래서 multiline 필드가 자기 크기를 넘어 자랄 수 있습니다.

<Demo src="text-field/sizes" :minHeight="220">

<<< @/.vitepress/demos/text-field/sizes.tsx

</Demo>

### startIcon

텍스트 앞에 놓이는 내용이고 보통 [MPIcon](../display/icon)입니다. `on-surface-variant` 롤과 필드 자체의 간격을 따르므로, 여기에 놓인 글리프는 스펙이 leading icon을 두는 자리에 놓입니다.

```tsx
<MPTextField
  label="검색"
  value={query}
  onChange={setQuery}
  startIcon={<MPIcon icon={ICONS.search} size={18} />}
/>
```

끝쪽 adornment는 비밀번호 토글이 쓰는 자리라 설정할 수 없습니다.

### onSubmit

Enter를 눌렀을 때 호출됩니다.

```tsx
<MPTextField value={query} onChange={setQuery} onSubmit={() => search(query)} />
```

한 줄 필드에서는 이후 Enter가 삼켜지므로 감싸고 있는 `<form>`이 native로 한 번 더 제출되지 않습니다. 여러 줄 필드에서는 그대로 둡니다. 거기서 Enter는 줄바꿈이고, 그것이 textarea의 존재 이유입니다. 제출해야 하는 여러 줄 필드라면 `disableEnterKey`로 거기서도 삼킬 수 있습니다.

**조합을 확정하는 Enter**는 여기까지 오지 않습니다. 한글이나 日本語를 입력하면 음절마다 입력기가 가져가는 Enter로 끝나는데, 그것을 제출로 읽는 필드는 문장의 첫 단어에서 폼을 보내버립니다. 이 컴포넌트가 막으려고 존재하는 바로 그 실패가 `value`가 아니라 키 핸들러를 통해 들어오는 셈입니다. 이 키는 삼키지 않고 그대로 둡니다. 브라우저가 확정에 쓰고 있기 때문입니다. 조합 중이 아닐 때 눌린 다음 Enter는 평소대로 제출합니다.

### onFormReset

모든 변경 직전, `onChange`보다 먼저 호출됩니다. 수정으로 인해 의미가 없어진 폼 수준 오류를 지우는, 흔한 경우를 위해 있습니다.

```tsx
<MPTextField
  value={email}
  onChange={setEmail}
  onFormReset={() => setServerError('')}
  errorMessage={serverError}
/>
```

### autoFocus

마운트 시 포커스를 줍니다. 다만 작은 화면에서는 건너뜁니다. 방금 도착한 페이지 위로 화면 키보드가 올라오기 때문입니다. 기준은 여러분 테마의 `sm` 중단점입니다.

## 접근성

- 라벨은 `id`로 컨트롤과 연결된 진짜 `<label>`입니다. `name`을 주면 그것으로 id를 만들고, 둘 다 없으면 자동 생성하므로 이름 없는 필드 두 개가 한 페이지에서 충돌하지 않습니다.
- `required`는 라벨과 컨트롤 양쪽에 반영됩니다.
- 비밀번호 토글은 상태에 따라 이름이 바뀌는 진짜 버튼입니다 — "display the password" / "hide the password".

## 함께 보기

- [MPIcon](../display/icon) — `startIcon`에 쓰입니다.
- [테마](../../guide/getting-started#테마) — 이 필드가 읽는 색상 롤과 바꾸는 방법.
- [Base UI Field](https://base-ui.com/react/components/field) — 아래에 깔린 동작. 라벨 연결, 유효성 상태, 스타일링이 기준으로 삼는 `data-*` 속성.
