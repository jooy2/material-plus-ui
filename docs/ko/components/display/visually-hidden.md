---
title: MPVisuallyHidden
order: 21
---

# MPVisuallyHidden

<p class="mp-lede">화면 낭독기만 읽고 나머지는 보지 않는 텍스트. 맨숫자 뒤에, 홀로 있는 글리프 뒤에, 정렬 화살표 뒤에 있는 문장입니다.</p>

<Demo src="visually-hidden/hero" :minHeight="220" />

```tsx
import { MPVisuallyHidden } from 'material-plus-ui';

<button>
  <MPIcon icon={ICONS.close} />
  <MPVisuallyHidden>Close this dialog</MPVisuallyHidden>
</button>;
```

## Props

<PropsTable name="MPVisuallyHidden" />

## 왜 조언이 아니라 컴포넌트인가

이 라이브러리의 컴포넌트 아홉 개가 이미 이 규칙으로 자기를 그리고 있었습니다 — `MPPagination`의 live region, `MPRating`의 라디오, `MPShortcut`의 키 이름, `MPCarousel`의 슬라이드 안내, `MPProgressLinear`의 라벨. 그런데 직접 만든 버튼에 맨 글리프를 넣는 애플리케이션은 같은 처리를 가져다 쓸 방법이 없었습니다. 라이브러리에 규칙은 있었고 이름이 없었습니다.

경우들은 전부 같은 모양입니다. 볼 수 있는 사람은 즉시 풀어 읽고, 볼 수 없는 사람은 **아무것도** 얻지 못하는 표시입니다.

| 그려지는 것   | 읽히는 것            |
| ------------- | -------------------- |
| 배지의 `3`    | 읽지 않은 메시지 3개 |
| 열 머리의 `↑` | 오름차순 정렬됨      |
| 링크 뒤의 `↗` | 새 탭에서 열림       |
| 아바타의 `JM` | 조민준               |

## `hidden`도, `display: none`도, `opacity: 0`도 아닙니다

앞의 둘은 화면과 함께 접근성 트리에서도 텍스트를 걷어 가는데, 그건 원하는 것의 정반대입니다. 세 번째는 글자 크기만 한 **클릭되는 유령**을 남겨 그 아래 있는 것 위에 얹습니다.

1px로 잘라 낸 상자만이 보는 사람에게는 보이지 않고 나머지 모든 종류의 독자에게는 있는 유일한 형태입니다.

```css
position: absolute;
width: 1px;
height: 1px;
overflow: hidden;
white-space: nowrap;
clip-path: inset(50%);
```

### 왜 `sr-only`가 아닌가

바로 이 일을 위한 Tailwind 자신의 유틸리티이고, 위 규칙은 그것을 풀어 쓴 것입니다.

풀어 쓴 이유는 `sr-only`가 **생성되는** 것이기 때문입니다. 자체 Tailwind 빌드에 `prefix`를 설정해 둔 프로젝트는 그것을 다른 이름으로 생성하고, `sr-only`를 박아 둔 컴포넌트는 그 페이지에서 그대로 보이게 됩니다. 임의 속성은 어떤 prefix에도 살아남습니다 — [스타일시트가 Preflight를 싣지 않는](../../guide/getting-started.md#it-contains-no-reset) 것과 같은 이유입니다.

## 레이아웃에는 남아 있습니다

`position: absolute`라서 자리를 차지하지 않습니다. 그래도 **문서 안에는** 있고, 그게 핵심입니다 — 쓰인 순서대로 읽힙니다.

```tsx
<p>
  Sent <MPVisuallyHidden>on</MPVisuallyHidden> Tuesday
</p>
```

는 *Sent on Tuesday*로 읽힙니다. 블록 끝이 아니라 그 문장이 속한 자리에 두세요.

## `<span>`이 아닌 것

`render`는 Base UI의 탈출구이고, 보통은 숨은 제목 때문에 씁니다 — 화면에 제목을 띄우지 않으면서 접근성 트리에서 섹션에 이름을 주는 랜드마크입니다.

```tsx
<nav>
  <MPVisuallyHidden render={<h2 />}>Pagination</MPVisuallyHidden>
  {/* … */}
</nav>
```

## 날카로운 모서리

- **안에 있는 포커스 가능한 것은 그대로 포커스됩니다.** Tab으로 들어간 독자는 자기가 볼 수 없는 곳에 도착합니다. 포커스를 받을 수 있는 것에는 컨트롤 자체에 `aria-label`을 다세요 — [`MPIconButton`](../inputs/icon-button.md)이 그렇게 하고, 그래서 그쪽 `label`이 필수입니다.
- **live region이 아닙니다.** 안의 텍스트를 바꿔도 엘리먼트가 `aria-live`를 함께 지니지 않는 한 안내되지 않습니다. `aria-live`는 그대로 통과하며, 위의 컴포넌트들이 그렇게 쓰고 있습니다.
- **`position`이나 `clip-path`를 지정하는 `className`은 이걸 무효로 만듭니다.** 여기의 클래스 이름은 병합이 아니라 연결이라서 스타일시트에서 나중에 오는 유틸리티가 이기고, 내용이 도로 보이게 됩니다. [클래스 이름과 스타일](../../guide/getting-started.md#class-names-and-styles)을 보세요.

## 다음

- [MPIconButton](../inputs/icon-button.md) — 스스로 이름을 대는 글리프 버튼.
- [MPIcon](./icon.md) — 그 옆에 놓이는 글리프.
