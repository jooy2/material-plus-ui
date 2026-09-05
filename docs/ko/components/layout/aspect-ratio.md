---
title: MPAspectRatio
order: 1
---

# MPAspectRatio

<p class="mp-lede">어떤 너비를 받든 비율을 지키는 상자. 아무것도 그리지 않고, 대신 공간을 미리 잡아 둡니다 — 이미지가 늦게 도착하는 카드가 주변 페이지를 밀어내지 않도록.</p>

<Demo src="aspect-ratio/hero" :minHeight="220" />

```tsx
import { MPAspectRatio } from 'material-plus-ui';

<MPAspectRatio ratio="16 / 9" rounded>
  <img src={cover} alt="" />
</MPAspectRatio>;
```

## Props

<PropsTable name="MPAspectRatio" />

## 무엇을 위한 것인가

머터리얼의 레이아웃 지침은 행이 서로 맞아떨어지는 그리드 위에 세워져 있습니다. 실제 페이지에서 그 정렬이 깨지는 가장 흔한 경로는 **높이를 모르는 미디어**가 주변 텍스트의 배치가 끝난 뒤에 도착하는 것입니다. 브라우저가 리플로우하고, 아래 있던 것들이 전부 튀고, 읽는 사람이 막 누르려던 게 자리를 옮깁니다.

공간을 미리 잡아 두는 것이 해결이고, 런타임 비용이 없는 해결입니다. 비율은 CSS 자신의 `aspect-ratio`이므로, 이미지의 첫 바이트가 내려오기 전에 상자는 이미 올바른 높이입니다.

썸네일이 한 줄로 늘어섰을 때 모두 같은 모양이 되는 것도, 이 컴포넌트가 있는 이유의 나머지 절반입니다.

## 비율을 CSS가 쓰는 대로 쓰는 이유

`ratio={1.5}`도 `ratio="16 / 9"`도 그대로 `aspect-ratio`로 갑니다.

`{ width: 16, height: 9 }` 객체도, 번역해야 할 `"16:9"` 문자열도 없습니다. 이미 CSS를 아는 사람은 찾아볼 게 없고, 모르는 사람은 이 라이브러리의 표기법이 아니라 진짜 물건을 설명하는 문서까지 검색 한 번이면 닿기 때문입니다.

## `fit`

비율 위에 더해진 유일한 편의입니다. 안의 미디어를 상자 전체로 늘린 _다음_ 맞춥니다. 이 컴포넌트를 쓸 때마다 어차피 처음에 써야 했을 선언 두 줄입니다.

<Demo src="aspect-ratio/fit" :minHeight="200">

<<< @/.vitepress/demos/aspect-ratio/fit.tsx

</Demo>

값은 `object-fit` 자신의 단어들 — `cover`, `contain`, `fill`, `none` — 이고, 비율과 같은 이유입니다. `fill-the-box` 같은 걸 지어내 봐야 읽는 사람이 그게 어떤 CSS에 대응하는지 찾아보게 만들 뿐입니다.

**직계 자식**인 `img`, `video`, `canvas`, `svg`, `picture`, `iframe`에 닿습니다. 그 밖의 것은 평범하게 배치되고 이 prop이 건드리지 않으므로, 직접 만든 `<div>`를 담은 상자는 그냥 비율을 가진 상자입니다.

`iframe`은 크기만 받고 fit은 받지 않습니다. 임베드는 자기 내용을 스스로 배치하므로 `object-fit`이 작용할 대상이 없습니다.

## `rounded`

기본은 꺼짐입니다. 레이아웃 컴포넌트는 아무것도 그리지 않고, 사진의 모서리를 잘라 낼지는 사진에 대한 결정이니까요. 다만 워낙 흔한 결정이라, 그때마다 `className`을 꺼내게 만드는 건 심술궂은 일입니다.

`md`는 `corner-medium`에 놓입니다. MD3 자신의 카드 모서리이기도 합니다 — 카드 안의 사진은 자기만의 모서리가 아니라 카드의 모서리를 가져야 합니다.

`overflow-hidden`은 `rounded` 여부와 상관없이 항상 켜져 있습니다. 그게 없으면 `cover` 이미지가 방금 받은 비율 밖으로 넘쳐 나가고, 상자는 공간만 잡아 둘 뿐 아무것도 붙들지 못합니다.

## 예시

### render

Base UI의 탈출구입니다. 상자가 의미상 맞는 엘리먼트가 될 수 있습니다.

```tsx
<MPAspectRatio ratio="4 / 3" render={<figure />}>
  <img src={photo} alt="새벽의 항구" />
</MPAspectRatio>
```

### 카드의 커버

가장 자주 쓰이는 형태입니다.

```tsx
<div className="rounded-mp-md bg-mp-surface-container overflow-hidden">
  <MPAspectRatio ratio="16 / 9">
    <img src={cover} alt="" />
  </MPAspectRatio>
  <div className="p-4">…</div>
</div>
```

여기서는 상자에 `rounded`를 주지 *않았다*는 점을 보세요. 감싸는 표면이 이미 둥글고, 같은 모서리에 반경이 둘이면 하나가 많습니다.

## 접근성

읽어 줄 것이 없습니다. 상자는 계산된 높이를 가진 `<div>`이고, 의도적으로 `role="img"`이 아닙니다. 의미를 지니는 건 안에 든 것이고, `alt`가 그것이 있어야 할 자리입니다.

이미 같은 말을 하는 제목 아래에 놓인 장식용 이미지는, 이 컴포넌트가 없을 때와 똑같이 `alt=""`를 받습니다.

## 함께 보기

- [MPSkeleton](../feedback/skeleton) — 미디어가 아니라 콘텐츠가 오는 중일 때의 같은 발상.
- [MPAvatar](../display/avatar) — 모양이 비율이 아니라 사람일 때의 고정 크기 원.
