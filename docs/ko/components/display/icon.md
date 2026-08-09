---
title: MPIcon
order: 1
---

# MPIcon

<p class="mp-lede">아이콘 글리프에 크기와 색을 붙여 주는 wrapper입니다. Material Plus는 자체 아이콘을 그리지 않으므로 글리프는 여러분이 고른 세트에서 옵니다. <code>lucide-react</code>가 패키지에 함께 들어 있고, 다른 세트도 똑같이 잘 동작합니다.</p>

<Demo src="icon/hero" />

```tsx
import { MPIcon, ICONS } from 'material-plus-ui';

<MPIcon icon={ICONS.success} size={24} color="green" label="배포됨" />;
```

## Props

<PropsTable name="MPIcon" />

`<span>`의 native 속성은 그대로 전달되고, `ref`는 박스에 닿습니다.

## 글리프는 children이 아니라 prop입니다

```tsx
<MPIcon icon={ICONS.search} />       // ✅
<MPIcon>{<SearchIcon />}</MPIcon>    // ✗ — children prop은 없습니다
```

아이콘에 대해 늘 정하고 싶은 두 가지 — 얼마나 큰지, 무슨 색인지 — 는 그것이 무언가의 자식이 되고 나면 손댈 수 없는 두 가지이기 때문입니다. prop으로 받으면 `MPIcon`이 단순히 감싸는 내용이 아니라 _크기를 정하는_ 내용이 됩니다.

## 예시

### icon

아이콘 세트가 돌려주는 형태가 두 가지이므로, 두 형태 모두 받습니다.

<Demo src="icon/custom">

<<< @/.vitepress/demos/icon/custom.tsx

</Demo>

**컴포넌트**는 `lucide-react`, `react-icons` 등 대부분의 세트가 export하는 형태이고, `MPIcon`이 크기와 색을 글리프 _안으로_ 넘길 수 있게 해 주는 형태입니다. 바깥에서 엘리먼트에 스타일을 입히려 애쓸 필요가 없습니다.

```tsx
<MPIcon icon={ICONS.close} size={20} />
```

**엘리먼트**는 직접 그린 그림, 다른 세트에서 이미 만들어진 글리프, `<img>` 같은 것입니다. 놓인 박스에 맞춰 크기가 조정됩니다.

```tsx
<MPIcon icon={<svg viewBox="0 0 24 24">…</svg>} size={20} />
<MPIcon icon={<DeleteIcon />} size={20} />
```

구분은 오직 `React.isValidElement`로만 합니다. 그래서 요즘 아이콘 세트가 실제로 export하는 `forwardRef` 객체가 "이미 그려진 것"이 아니라 컴포넌트로 올바르게 취급됩니다.

### size

숫자는 CSS 픽셀, 문자열은 임의의 CSS 길이입니다. `size="1em"`으로 주변 텍스트를 따라가게 할 수 있습니다.

<Demo src="icon/sizes">

<<< @/.vitepress/demos/icon/sizes.tsx

</Demo>

크기 사다리(`sm`/`md`/`lg`)는 없습니다. 아이콘 세트는 특정 크기의 픽셀 격자 위에 그려지는데, wrapper가 자기만의 다섯 단계를 만들어 내는 것은 세트가 이미 내린 결정에 대한 두 번째 의견일 뿐입니다. 지정하지 않으면 글리프가 만들어진 크기 그대로 그려집니다.

길이는 박스에도 쓰이고 박스의 `font-size`에도 쓰입니다. `width`를 직접 들고 있는 `<svg>`와 `em`으로 그려진 `<svg>`가 같은 크기로 나오는 이유입니다.

### color

임의의 CSS 색상입니다. 지정하지 않으면 아이콘이 놓인 자리의 색을 그대로 물려받는데, 자기만의 색을 갖는 것보다 이쪽이 맞는 경우가 훨씬 많습니다. 버튼 라벨, 흐린 캡션, `Alert` 안의 아이콘은 그 요소의 색이어야 합니다.

<Demo src="icon/colors">

<<< @/.vitepress/demos/icon/colors.tsx

</Demo>

색을 주지 않았을 때도 글리프에는 `currentColor`를 넘깁니다. 자체 기본값이 고정 색인 세트라도 놓인 자리의 텍스트를 따라가게 하기 위해서입니다.

### label

`label`이 없으면 아이콘은 `aria-hidden`이 되어 접근성 트리에서 빠집니다. 대부분의 아이콘은 이미 같은 말을 하는 텍스트 옆에 놓이고, 둘 다 읽어 주는 것은 하나만 읽어 주는 것보다 나쁘기 때문에 이쪽이 기본값입니다.

```tsx
// 옆의 텍스트가 이미 "삭제"라고 말하고 있습니다.
<Button startIcon={<MPIcon icon={ICONS.close} />}>삭제</Button>

// 글리프뿐이므로 이름이 필요합니다.
<MPIcon icon={ICONS.close} label="닫기" />
```

`label`이 있으면 박스가 그 이름을 가진 `role="img"`이 됩니다.

## 함께 들어 있는 아이콘 세트

`lucide-react`는 이 패키지의 dependency이고, 라이브러리 자체 컴포넌트가 그리는 모든 글리프는 `src/constants/icons.ts` 한 파일에 이름이 붙어 있습니다. 꺼내 쓰는 방법은 두 가지입니다.

```tsx
import { ICONS, SearchIcon } from 'material-plus-ui';

<MPIcon icon={ICONS.search} />     // 역할 이름으로
<MPIcon icon={SearchIcon} />       // named import로
```

키는 컴포넌트가 요구하는 역할(`visibility`)이지, lucide가 마침 제공하는 그림 이름(`Eye`)이 아닙니다. 컴포넌트는 개념을 요구하므로, 그 뒤의 그림은 컴포넌트를 건드리지 않고 바꿀 수 있습니다.

::: tip 어느 쪽을 쓸지 `ICONS`는 객체 리터럴이라 번들러가 속성 단위로 tree-shaking할 수 없습니다. 즉, 이것을 import하면 테이블의 모든 글리프가 딸려 옵니다. 한두 개만 필요하면 named import를, 이름으로 조회하는 레지스트리가 필요하면 `ICONS`를 쓰세요. :::

이 세트에만 묶여 있는 것은 아닙니다. `MPIcon`은 아이콘 컴포넌트 모양을 한 것이면 무엇이든 받으므로 `react-icons`, `@material-symbols`, 다른 머터리얼 아이콘 패키지, 직접 만든 SVG 모두 wrapper 없이 그대로 동작합니다.
