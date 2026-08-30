---
title: MPFieldset
order: 14
---

# MPFieldset

<p class="mp-lede">하나의 질문에 함께 답하는 컨트롤 묶음이고, 그 위에 이름이 하나 붙습니다.</p>

<Demo src="fieldset/hero" :minHeight="320" />

```tsx
import { MPFieldset, MPTextField } from 'material-plus-ui';

<MPFieldset legend="청구지 주소" description="청구서가 가는 곳">
  <MPTextField name="street" label="도로명" value={street} onChange={setStreet} />
  <MPTextField name="city" label="도시" value={city} onChange={setCity} />
</MPFieldset>;
```

## Props

<PropsTable name="MPFieldset" />

## 표면을 그리지 않는 이유

필드 묶음은 **묶음**이지 시트가 아니고, 시트는 이미 있기 때문입니다.

시트가 필요하면 이것을 [MPCard](../layout/card)나 [MPBox](../layout/box) 안에 넣으세요. 자기 표면을 칠하는 fieldset은 누군가 그렇게 하는 순간 첫 번째 시트 안의 두 번째 시트가 됩니다. 페이지 반대쪽 끝에서 [MPContainer](../layout/container#표면을-그리지-않는-이유)가 대는 것과 같은 논리입니다.

대신 소유하는 것은 셋입니다. 레전드, 컨트롤들이 서는 간격, 그리고 `disabled`.

## disabled, 그리고 이것이 진짜 `<fieldset>`인 이유

<Demo src="fieldset/disabled" :minHeight="280">

<<< @/.vitepress/demos/fieldset/disabled.tsx

</Demo>

`<fieldset>`의 `disabled`는 **안의 모든 컨트롤**에 닿습니다. 세 단계 아래의 컴포넌트가 그린, 이 그룹의 존재를 들어 본 적도 없는 컨트롤까지요.

React 컨텍스트로는 약속할 수 없는 일입니다. 컨텍스트는 그것을 읽는 컴포넌트에 닿지만, fieldset은 누가 그렸든 얼마나 깊든 폼 컨트롤에 닿습니다. 이것이 제목을 얹은 `<div>`가 아니라 컴포넌트인 이유의 전부입니다.

## 레전드

안에 있는 모든 컨트롤의 접근 가능한 이름의 일부가 되고, 그래서 어떻게 써야 하는지가 달라집니다. 각각의 앞에 놓아도 여전히 말이 되는 구절이어야 합니다.

> **청구지 주소** → "청구지 주소 도로명", "청구지 주소 도시". ✓
>
> **어디로 보낼까요?** → "어디로 보낼까요? 도로명". ✗

### `<legend>` 엘리먼트가 아닌 이유

레전드는 `aria-labelledby`가 가리키는 `<div>`입니다. Base UI의 결정이고, 그룹을 평범한 flex 컨테이너로 만드는 결정입니다.

실제로 렌더링된 `<legend>`는 모든 브라우저가 fieldset의 콘텐츠 박스 밖으로 들어 올리므로, `gap`을 줘도 그 아래에는 아무 공간도 생기지 않고 첫 컨트롤이 그룹 이름에 붙어 버립니다. 접근 가능한 이름은 어느 쪽이든 같고, 살아남아야 했던 것은 그것뿐입니다.

## 예시

### 폼 안에서

```tsx
<MPForm onSubmit={save}>
  <MPFieldset legend="청구지 주소">…</MPFieldset>
  <MPFieldset legend="배송지 주소">…</MPFieldset>
  <MPButton type="submit">저장</MPButton>
</MPForm>
```

각각은 자기 단으로 쌓이고, 폼은 fieldset들을 자기 단으로 쌓습니다.

### 라디오 그룹은 이미 하나입니다

[MPRadioGroup](./radio-group)은 자기 `label`을 가지고 스스로를 그룹으로 알리므로 감쌀 필요가 없습니다.

```tsx
// MPFieldset으로 감싸지 말고 이렇게.
<MPRadioGroup label="배송">…</MPRadioGroup>
```

fieldset은 컨트롤들이 **함께 묶이는 서로 다른 질문**일 때 — 도로명, 도시, 우편번호 — 손에 잡으세요. 답이 여럿인 하나의 질문이 아니라요.

## 접근성

- 그룹은 하나로 알려지고, 레전드가 그 이름입니다.
- `disabled`는 네이티브 그것이므로 브라우저도, 폼 제출도, 안의 모든 컨트롤도 무엇이 그렸든 그것을 지킵니다.
- description은 레전드 블록 안에 있으므로 따로 찾아야 하는 것이 아니라 그룹 이름의 일부입니다.
- 여기서 자기 탭 정지를 갖는 것은 없습니다.

## 함께 보기

- [MPForm](./form) — 보통 이것들이 쌓이는 폼.
- [MPRadioGroup](./radio-group) — 답이 여럿인 하나의 질문을 위한, 이미 스스로 이름을 붙이는 그룹.
- [MPCard](../layout/card) — 시트가 필요할 때 fieldset을 올릴 곳.
