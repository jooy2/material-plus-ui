---
title: MPIcon
order: 1
---

# MPIcon

<p class="mp-lede">아이콘 글리프에 크기와 색을 붙여 주는 wrapper입니다. Material Plus는 자체 아이콘을 그리지 않으므로 글리프는 여러분이 고른 세트에서 옵니다. React 패키지에는 <code>lucide-react</code>가 함께 들어 있고, 다른 세트도 똑같이 잘 동작합니다.</p>

<Demo src="icon/hero" />

::: fw react

```tsx
import { MPIcon, ICONS } from 'material-plus-ui';

<MPIcon icon={ICONS.success} size={24} color="green" label="배포됨" />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPIcon(icon: SuccessGlyph(), size: 24, color: Color(0xFF2E7D32), label: '배포됨');
```

:::

## Props

<PropsTable name="MPIcon" />

::: fw react

`<span>`의 native 속성은 그대로 전달되고, `ref`는 박스에 닿습니다.

:::

## 글리프는 children이 아니라 prop입니다

::: fw react

```tsx
<MPIcon icon={ICONS.search} />       // ✅
<MPIcon>{<SearchIcon />}</MPIcon>    // ✗ — children prop은 없습니다
```

:::

::: fw flutter

```dart
MPIcon(icon: mySet.search)           // IconData
const MPIcon(icon: SearchGlyph())    // 위젯
```

:::

아이콘에 대해 늘 정하고 싶은 두 가지 — 얼마나 큰지, 무슨 색인지 — 는 그것이 무언가의 자식이 되고 나면 손댈 수 없는 두 가지이기 때문입니다. prop으로 받으면 `MPIcon`이 단순히 감싸는 내용이 아니라 _크기를 정하는_ 내용이 됩니다.

## 예시

### icon

아이콘 세트가 돌려주는 형태가 두 가지이므로, 두 형태 모두 받습니다.

<Demo src="icon/custom">

::: fw react

<<< @/.vitepress/demos/icon/custom.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/icon/custom.dart

:::

</Demo>

::: fw react

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

:::

::: fw flutter

**`IconData`**는 아이콘 폰트가 돌려주는 형태입니다. `MPIcon`이 받은 크기와 색으로 `Icon`을 그립니다.

```dart
MPIcon(icon: mySet.close, size: 20)
```

**위젯**은 직접 그린 그림, 패키지에서 가져온 SVG, 다른 세트가 만든 글리프입니다. 크기와 색을 `IconTheme`, `DefaultTextStyle`, 놓이는 박스 세 갈래로 한꺼번에 알려 주므로, `IconTheme.of(context)`를 읽는 그림이든 박스를 채우는 위젯이든 글자 하나든 같은 크기로 나옵니다.

```dart
const MPIcon(icon: SpiralGlyph(), size: 20)
MPIcon(icon: SvgPicture.asset('assets/delete.svg'), size: 20)
```

Dart에는 유니언 타입이 없어 `icon`은 `Object`로 받습니다. `IconData`도 `Widget`도 아니면 디버그에서 assert로 막습니다.

:::

### size

::: fw react

숫자는 CSS 픽셀, 문자열은 임의의 CSS 길이입니다. `size="1em"`으로 주변 텍스트를 따라가게 할 수 있습니다.

:::

::: fw flutter

논리 픽셀 단위의 숫자입니다. 주변 텍스트를 따라가게 하려면 그 크기를 읽어서 넘깁니다. `size: DefaultTextStyle.of(context).style.fontSize`처럼 씁니다.

:::

<Demo src="icon/sizes">

::: fw react

<<< @/.vitepress/demos/icon/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/icon/sizes.dart

:::

</Demo>

크기 사다리(`sm`/`md`/`lg`)는 없습니다. 아이콘 세트는 특정 크기의 픽셀 격자 위에 그려지는데, wrapper가 자기만의 다섯 단계를 만들어 내는 것은 세트가 이미 내린 결정에 대한 두 번째 의견일 뿐입니다. 지정하지 않으면 글리프가 만들어진 크기 그대로 그려집니다.

::: fw react

길이는 박스에도 쓰이고 박스의 `font-size`에도 쓰입니다. `width`를 직접 들고 있는 `<svg>`와 `em`으로 그려진 `<svg>`가 같은 크기로 나오는 이유입니다.

:::

::: fw flutter

Flutter에서 "만들어진 크기"는 주변 `IconTheme`의 크기입니다. 아무것도 없으면 24이고, 버튼 안이라면 이미 버튼이 맞춰 둔 크기입니다.

:::

### color

React에서는 임의의 CSS 색상, Flutter에서는 `Color`입니다. 지정하지 않으면 아이콘이 놓인 자리의 색을 그대로 물려받는데, 자기만의 색을 갖는 것보다 이쪽이 맞는 경우가 훨씬 많습니다. 버튼 라벨, 흐린 캡션, `Alert` 안의 아이콘은 그 요소의 색이어야 합니다.

<Demo src="icon/colors">

::: fw react

<<< @/.vitepress/demos/icon/colors.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/icon/colors.dart

:::

</Demo>

::: fw react

색을 주지 않았을 때도 글리프에는 `currentColor`를 넘깁니다. 자체 기본값이 고정 색인 세트라도 놓인 자리의 텍스트를 따라가게 하기 위해서입니다.

:::

### label

`label`이 없으면 아이콘은 접근성 트리에서 빠집니다. 대부분의 아이콘은 이미 같은 말을 하는 텍스트 옆에 놓이고, 둘 다 읽어 주는 것은 하나만 읽어 주는 것보다 나쁘기 때문에 이쪽이 기본값입니다.

::: fw react

```tsx
// 옆의 텍스트가 이미 "삭제"라고 말하고 있습니다.
<Button startIcon={<MPIcon icon={ICONS.close} />}>삭제</Button>

// 글리프뿐이므로 이름이 필요합니다.
<MPIcon icon={ICONS.close} label="닫기" />
```

`label`이 있으면 박스가 그 이름을 가진 `role="img"`이 됩니다.

:::

::: fw flutter

```dart
// 옆의 텍스트가 이미 "삭제"라고 말하고 있습니다.
MPButton(onPressed: delete, startIcon: const MPIcon(icon: CloseGlyph()), child: const Text('삭제'))

// 글리프뿐이므로 이름이 필요합니다.
const MPIcon(icon: CloseGlyph(), label: '닫기')
```

`label`이 있으면 그 이름을 가진 이미지 노드가 되고, 없으면 `ExcludeSemantics`로 감쌉니다. 버튼 전체가 아이콘 하나라면 아이콘은 버튼 안에 두고, 이름은 버튼의 `semanticLabel`에 줍니다.

:::

:::: fw react

## 아이콘 주변 여백은 박스에 줍니다

글리프는 `MPIcon`이 그리는 박스를 가득 채웁니다. 그래서 margin은 안쪽 그림이 아니라 그 박스에 주어야 합니다. 이 컴포넌트가 그리는 모든 박스에는 `.mp-icon`이 붙어 있고, 클래스는 바로 이럴 때 쓰라고 있습니다.

```css
.toolbar .mp-icon {
  margin-inline-end: 5px;
} /* 박스 */

.toolbar svg {
  margin-inline-end: 5px;
} /* 그림 */
```

두 번째 규칙은 Material UI에서 넘어올 때 남는 형태입니다. 거기서는 `SvgIcon`이 곧 margin을 주는 대상이었습니다. 여기서는 이미 박스를 가득 채운 flex 항목에 margin이 붙으므로 들어갈 자리가 없고, 그대로 눈에 보이게 넘칩니다. 의도한 동작입니다. 예전에는 그 차이를 글리프에서 빼 갔고, `size={16}`인 아이콘이 11×16으로 그려지면서 그저 한 치수 작아 보이기만 했습니다.

## 함께 들어 있는 아이콘 세트

`lucide-react`는 이 패키지의 dependency이고, 라이브러리 자체 컴포넌트가 그리는 모든 글리프는 `src/constants/icons.ts` 한 파일에 이름이 붙어 있습니다. 꺼내 쓰는 방법은 두 가지입니다.

```tsx
import { ICONS, SearchIcon } from 'material-plus-ui';

<MPIcon icon={ICONS.search} />     // 역할 이름으로
<MPIcon icon={SearchIcon} />       // named import로
```

키는 컴포넌트가 요구하는 역할(`visibility`)이지, lucide가 마침 제공하는 그림 이름(`Eye`)이 아닙니다. 컴포넌트는 개념을 요구하므로, 그 뒤의 그림은 컴포넌트를 건드리지 않고 바꿀 수 있습니다.

::: tip 어느 쪽을 쓸지

`ICONS`는 객체 리터럴이라 번들러가 속성 단위로 tree-shaking할 수 없습니다. 즉, 이것을 import하면 테이블의 모든 글리프가 딸려 옵니다. 한두 개만 필요하면 named import를, 이름으로 조회하는 레지스트리가 필요하면 `ICONS`를 쓰세요.

:::

이 세트에만 묶여 있는 것은 아닙니다. `MPIcon`은 아이콘 컴포넌트 모양을 한 것이면 무엇이든 받으므로 `react-icons`, `@material-symbols`, 다른 머터리얼 아이콘 패키지, 직접 만든 SVG 모두 wrapper 없이 그대로 동작합니다.

::::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `icon`에 컴포넌트나 엘리먼트 | `IconData`나 위젯 | Flutter에서 아이콘이 가지는 두 형태입니다. 아이콘 폰트의 글리프이거나 위젯입니다. |
| CSS 길이로 된 `size` | `double?` | CSS 길이가 없습니다. 글자를 따라가야 하면 글자 크기를 읽어서 넘깁니다. |
| CSS 색상으로 된 `color` | `Color?` | `Color`로 받고, `null`이면 `IconTheme`으로 이어받습니다. |
| `strokeWidth` | — | 위젯은 스스로 그리므로 바깥에서 선 굵기를 넘길 수 없습니다. 가변 아이콘 폰트의 굵기는 `IconThemeData.weight`가 맡습니다. |
| `center` | — | `Center`나 `Align`으로 감쌉니다. 그리드 트랙 안의 배치는 부모가 정합니다. |
| `ICONS`와 이름 붙은 글리프 export | — | Flutter 패키지에는 아이콘 세트가 들어 있지 않습니다. Flutter에는 Material 밖의 아이콘 세트가 없고, 이 패키지는 Material을 가져오지 않습니다. 미리보기의 글리프는 갤러리가 직접 그렸고, 앱도 자기가 고른 세트로 똑같이 하면 됩니다. |
| `className`, `style`, `ref`, 속성 전달 | — | 넘길 클래스 목록, style 속성, 엘리먼트가 없습니다. |

:::
