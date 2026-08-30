---
title: MPForm
order: 13
---

# MPForm

<p class="mp-lede">자기 필드 중 어느 것이 틀렸는지 아는 <code>&lt;form&gt;</code>입니다.</p>

<Demo src="form/hero" :minHeight="320" />

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

## Props

<PropsTable name="MPForm" />

## 무엇을 더하는지

[MPTextField](./text-field)가 늘어선 페이지는 혼자서는 한 번에 한 필드씩만 검사하고, 제출이 실패하면 빨간 것을 찾는 일은 독자에게 남습니다.

이 컴포넌트가 소유하는 것은 필드들 **위에서** 다뤄져야 하는 부분입니다.

- 제출은 모든 필드의 유효성을 한 번에 모으고, 포커스는 실패한 첫 필드에 놓입니다.
- `errors`는 서버의 답을 그것이 속한 필드 위로 되돌려 놓습니다.
- 자식들은 간격을 두고 쌓입니다. 폼은 스택이고, 간격 없는 스택은 서로 맞닿은 필드의 열입니다.

그게 전부입니다. 표면도, 여백도, 본문 폭도 없습니다. 그것들은 이 폼을 감싸는 [MPCard](../layout/card)나 [MPContainer](../layout/container)의 몫입니다. 컨테이너가 대는 근거 그대로, 페이지의 모양을 정하는 것이 페이지를 제출하는 것이어서는 안 됩니다.

## 폼 라이브러리가 아닙니다

여기에는 스키마도, 리졸버도, 필드 배열도 없습니다.

그것들이 필요한 프로젝트는 이미 쓰고 있는 것을 그대로 두고 결과를 `errors`에 넘기면 됩니다. 이 컴포넌트가 그 이음매를 중심으로 지어진 것이고, 통합이 아니라 **이음매**인 이유는 그 라이브러리들 전부가 `{ [name]: message }`를 만들어 낼 수 있기 때문입니다.

## validationMode

기본값은 `onSubmit`이고, 그 뒤로는 값이 바뀔 때마다입니다. 뒤쪽 절반이 이것을 쓸 만하게 만듭니다. 실패한 필드는 다시 감시 대상이 되므로, 고치는 동안 메시지가 사라집니다. 두 번째 제출을 기다리지 않고요.

`onBlur`와 `onChange`가 더 시끄러운 두 답입니다. 특히 `onChange`는 아직 이메일 주소를 반쯤 입력하는 중인 사람에게 틀렸다고 말하고, 그래서 기본값이 아닙니다.

## errors

<Demo src="form/errors" :minHeight="260">

<<< @/.vitepress/demos/form/errors.tsx

</Demo>

각 메시지가 속한 필드의 `name`으로 키가 붙으므로, 페이지 위쪽 배너가 아니라 **필드 위에** 놓입니다. 그리고 그 필드가 바뀌는 순간 지워집니다. 이제 아무도 갖고 있지 않은 값에 대한 오류는 아무것도 아닌 것에 대한 오류입니다.

이 라이브러리의 모든 필드가 그것을 보여 줍니다. 자기 `errorMessage`를 가진 필드는 그것을 유지하고, 없는 필드는 할 말이 있을 때만 보조 줄을 그립니다. 그리고 그때가 바로 폼이 무언가를 건넨 순간입니다.

## 예시

### 카드 안에서

```tsx
<MPCard title="계정">
  <MPForm onSubmit={save}>…</MPForm>
</MPCard>
```

### 묶인 질문들

폼 안의 [MPFieldset](./fieldset)은 하나의 질문에 함께 답하는 컨트롤 묶음이고, 그 위에 이름이 붙습니다.

```tsx
<MPForm onSubmit={save}>
  <MPFieldset legend="청구지 주소">
    <MPTextField name="street" label="도로명" … />
    <MPTextField name="city" label="도시" … />
  </MPFieldset>
  <MPButton type="submit">저장</MPButton>
</MPForm>
```

### 서버 왕복

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

## 접근성

- 진짜 `<form>`이므로 필드 안에서 Enter로 제출되고, 브라우저 자신의 자동 완성이 채울 대상이 생깁니다.
- 실패한 제출은 포커스를 첫 번째 유효하지 않은 필드로 옮깁니다. 화면을 볼 수 없는 독자에게는 그것이 없으면 아무 일도 일어나지 않은 것과 같습니다.
- 각 메시지는 `aria-describedby`로 자기 필드에 연결됩니다. Base UI의 `Field`가 아무도 id를 만들지 않고도 해 줍니다.
- `onSubmit`은 네이티브 이벤트를 막으므로, 값을 처리하는 동안 어디로도 이동하지 않습니다.

## 함께 보기

- [MPFieldset](./fieldset) — 폼 안에서 쓰는, 이름 하나가 붙은 컨트롤 묶음.
- [MPTextField](./text-field) — 폼이 보통 한 페이지 가득 담는 필드.
- [MPCard](../layout/card) — 폼이 보통 놓이는 시트.
