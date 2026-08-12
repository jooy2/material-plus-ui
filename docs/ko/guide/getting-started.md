---
title: 시작하기
order: 1
---

# 시작하기

Material Plus는 [Material Design 3](https://m3.material.io)를 구현한 React 컴포넌트 라이브러리입니다. 다른 구현체를 감싸는 것이 아니라 스펙을 직접 따르기 때문에, 색상 롤·타입 스케일·모양의 이름이 모두 스펙의 이름입니다.

동작은 [Base UI](https://base-ui.com)가 맡습니다. 라벨 연결, 유효성 배선, 접근성이 그쪽에서 옵니다. 스타일은 [Tailwind CSS](https://tailwindcss.com) v4가, 테마는 평범한 CSS 커스텀 프로퍼티가 맡습니다. 이 마지막 선택이 이미 자체 머터리얼 환경을 갖춘 프로젝트 안에서 서로 충돌하지 않고 함께 쓰일 수 있게 하는 부분입니다.

## 설치

```bash
npm install material-plus-ui
```

```bash
pnpm add material-plus-ui
```

### Peer dependency

Material Plus가 자기 사본을 들고 오는 대신 프로젝트에 있을 것으로 기대하는 패키지입니다.

| 패키지               | 버전       |
| -------------------- | ---------- |
| `@base-ui/react`     | 1          |
| `react`, `react-dom` | 18 또는 19 |

`@base-ui/react`를 dependency가 아니라 peer로 둔 것은 의도적입니다. React context를 담고 있어서, 여러분의 `Form`이 이 라이브러리의 필드를 볼 수 있어야 하고 그건 트리에 사본이 하나일 때만 됩니다.

`lucide-react`는 실제 dependency이고 패키지에 함께 들어옵니다. 컴포넌트 자체 글리프를 여기서 그립니다 — [MPIcon](../components/display/icon)을 참고하세요.

## 스타일시트 연결

앱의 CSS 진입점에 한 줄 추가합니다.

```css
@import 'material-plus-ui/styles.css';
```

번들러가 CSS를 처리한다면 진입 모듈에서 import해도 똑같이 동작합니다.

```ts
import 'material-plus-ui/styles.css';
```

이건 **완성된 CSS**입니다. 디자인 토큰과, 컴포넌트가 쓰는 모든 유틸리티 클래스의 실제 규칙이 들어 있습니다. 빌드 측 설정도, PostCSS 플러그인도, `@source`도 필요 없습니다.

### reset이 들어 있지 않습니다

Material Plus는 페이지 수준 스타일링을 전혀 추가하지 않습니다. Preflight도, baseline도, 자기가 렌더링하지 않은 엘리먼트에 닿는 어떤 것도 없습니다. 컴포넌트는 자기가 소유한 엘리먼트에서 자기가 소유한 것만 리셋합니다 — `<button>`의 브라우저 기본 회색 배경, 그리고 네이티브 폼 컨트롤이 상속하지 않는 글꼴 같은 것들입니다.

따라서 페이지에 이미 있는 reset이 계속 주도권을 갖고, 이 라이브러리가 페이지의 나머지를 다시 칠하는 일은 없습니다.

### 이미 Tailwind를 쓰고 있다면

프로젝트에 Tailwind v4가 이미 있다면 컴파일된 쪽이 아니라 토큰 시트를 import하세요. 중복 생성이 없고, 컴포넌트에 넘긴 `className`이 컴포넌트 자체 클래스와 올바른 순서로 정렬됩니다.

```css
@import 'tailwindcss';
@import 'material-plus-ui/tailwind.css';
```

| 줄                                        | 역할                                            |
| ----------------------------------------- | ----------------------------------------------- |
| `@import 'tailwindcss'`                   | Tailwind 자체                                   |
| `@import 'material-plus-ui/tailwind.css'` | 디자인 토큰, 그리고 패키지를 등록하는 `@source` |

`@source`를 직접 쓰지 않습니다. 컴포넌트가 쓰는 클래스는 Tailwind 유틸리티라서 Tailwind가 패키지의 컴파일된 파일을 읽어야 찾을 수 있는데, `material-plus-ui/tailwind.css`가 자기 안에 `@source '.'`를 선언해 그 일을 처리합니다. `@source`는 그것이 쓰인 파일을 기준으로 해석되고, 여기서는 `node_modules/material-plus-ui/dist/`, 즉 그 파일들 바로 옆입니다.

결과적으로 여러분의 CSS 파일이 어디에 있든 상관이 없습니다.

## 사용

provider가 없습니다. 컴포넌트를 import해서 렌더링하면 됩니다.

```tsx
import { useState } from 'react';
import { MPTextField } from 'material-plus-ui';

export default function App() {
  const [email, setEmail] = useState('');

  return <MPTextField label="이메일" type="email" value={email} onChange={setEmail} />;
}
```

## 테마

컴포넌트가 그리는 모든 것이 CSS 커스텀 프로퍼티에서 옵니다. 그래서 테마 설정이 곧 CSS입니다. provider도, 테마 객체도 없고, 색이 바뀔 때 리렌더도 없습니다. Tailwind를 쓰든 안 쓰든 동일하게 동작합니다.

### 대부분의 프로젝트는 한 줄

머터리얼은 하나의 **소스 색상(source colour)** 에서 스킴 전체를 생성합니다. 그 하나만 지정하면 모든 롤이 따라옵니다.

```css
:root {
  --mp-source-color: #7c3aed;
}
```

`@theme` 안이 아니라 평범한 `:root`에 쓰세요. 라이브러리 기본값은 cascade layer 안에 선언되어 있고 레이어에 든 규칙은 레이어에 들지 않은 모든 규칙에 집니다. 그래서 여러분의 override는 `@import` 앞에 있든 뒤에 있든 이기고, 순서를 신경 쓸 필요가 없습니다.

기본값은 깊은 azure `#00639b`입니다. 이유와, 소스 색상에 대해 알아둘 유일한 제약(회색에 가까우면 안 된다는 것)은 [색상](../design/color#기본값)에 있습니다.

### 색상에 관한 나머지 전부

롤 하나만 덮기, 직접 만든 마크업에서 롤 값을 읽어 쓰기, 이미 `--md-sys-color-*`가 있는 페이지와의 공존, 그리고 파생이 머터리얼 레퍼런스 팔레트에 맞춰 보정된 방식은 모두 [색상](../design/color) 페이지에 있습니다.

### 다크 모드

설정할 것이 없습니다. 컴포넌트가 `prefers-color-scheme`을 스스로 따릅니다.

직접 제어하려면 아무 엘리먼트에나 속성이나 클래스를 붙입니다.

```html
<html data-mp-scheme="dark">
  <!-- … -->
</html>
```

Tailwind의 `dark:` 변형이 기준으로 삼는 `.dark`도 동작합니다. `[data-mp-scheme='light']`는 시스템 설정이 다크인 페이지 안에서도 해당 서브트리를 라이트로 되돌립니다.

두 스킴은 같은 톤 팔레트를 다른 톤에서 읽은 것이고, 이는 머터리얼이 스킴을 정의하는 방식 그대로입니다. 그래서 소스 색상을 바꾸면 라이트와 다크가 함께 움직이고, 따로 동기화할 두 번째 값 집합이 없습니다.

### 스코프 테마와 런타임 변경

위의 모든 토큰은 평범한 상속되는 커스텀 프로퍼티라서, 루트가 아니라 아무 엘리먼트에나 지정할 수 있습니다. 자체 브랜딩을 쓰는 섹션은 속성 하나입니다.

```html
<section style="--mp-source-color: #00696d">…</section>
```

사용자가 런타임에 고른 색도 style 객체 하나면 됩니다. 트리 리렌더도, 테마 재생성도 없습니다.

```tsx
<div style={{ '--mp-source-color': userColour } as React.CSSProperties}>
  <MPTextField … />
</div>
```

### 나머지 토큰

타입, 모양, 모션도 같은 방식입니다. 색상 롤과 마찬가지로 컴포넌트가 읽는 것만 있습니다.

```css
:root {
  /* 타입. `*-font`가 `inherit`이라, 따로 지정하지 않으면 필드는 여러분 앱의
     글꼴로 말합니다. */
  --mp-sys-typescale-body-large-font: inherit;
  --mp-sys-typescale-body-large-size: 1rem;
  --mp-sys-typescale-body-large-line-height: 1.5rem;
  --mp-sys-typescale-body-large-tracking: 0.03125rem;
  --mp-sys-typescale-body-large-weight: 400;
  /* `body-small`도 같은 다섯 개. */

  --mp-sys-shape-corner-extra-small: 4px;
  --mp-sys-motion-duration-short4: 200ms;
}
```

### 모양

모서리도 다른 것들과 똑같은 토큰이고, 모두 여섯 개입니다. 어떤 컴포넌트가 어떤 것을 가져가는지는 취향에 따른 크기가 아니라 그것이 어떤 종류의 물건인가에 대한 진술입니다 — 필드는 우물이고, 칩은 타일이고, 버튼은 알약입니다.

| 토큰 | 기본값 | 읽는 곳 |
| --- | --- | --- |
| `--mp-sys-shape-corner-extra-small` | `4px` | 텍스트 필드, OTP 필드, 툴팁, 메뉴, 스낵바, 하이라이트 |
| `--mp-sys-shape-corner-small` | `8px` | 칩, 리스트 행, 키 캡 |
| `--mp-sys-shape-corner-medium` | `12px` | 박스, 카드, 콜랩서블, 아코디언, 캐러셀, 테이블, 드롭존, 리스트 시트, 빈 상태 |
| `--mp-sys-shape-corner-large` | `16px` | 드로어의 자유 가장자리 |
| `--mp-sys-shape-corner-extra-large` | `28px` | 다이얼로그, 채팅 말풍선, 바텀 시트 |
| `--mp-sys-shape-corner-full` | `9999px` | 버튼, 세그먼티드 버튼, 슬라이더, 진행 표시줄 |

이 중 아무거나 지정하면 그것을 읽는 모든 컴포넌트가 함께 움직입니다. 자주 쓰이는 두 방향에는 속성이 따로 있고, `data-mp-scheme`과 같은 모델입니다. 아무것도 지정하지 않으면 명세의 모서리가 나오고, 프리셋 이름을 대면 서브트리 전체가 움직입니다.

```html
<html data-mp-shape="rounded">
  <!-- 8 / 12 / 20 / 24 / 32. 버튼은 그대로입니다. 알약은 더 둥글어질 데가 없습니다. -->
</html>
```

```html
<section data-mp-shape="sharp">
  <!-- 버튼을 포함해 모든 모서리가 0. 알약이 갈 수 있는 유일한 방향입니다. -->
</section>
```

알아둘 것 두 가지입니다.

- **`rounded`는 버튼, 슬라이더, 진행 표시줄을 건드리지 않습니다.** 이미 `corner-full`이라, 프리셋은 움직일 데가 있는 다섯 칸만 움직입니다. 화면은 더 둥글게 하면서 버튼은 각지게 하고 싶다면 `--mp-sys-shape-corner-full`에 직접 길이를 지정하면 됩니다.
- **다이얼로그는 포털로 렌더링됩니다.** 트리거를 감싼 섹션에 속성을 걸어도 그 섹션은 팝업의 조상이 아닙니다. 다이얼로그까지 닿게 하려면 `<html>`이나 `:root`에 지정하세요.

직접 지정한 값은 두 파일의 import 순서와 관계없이 항상 프리셋을 이깁니다.

```css
:root {
  --mp-sys-shape-corner-small: 10px; /* data-mp-shape보다 우선 */
}
```

테마가 아니라 인스턴스 하나만 바꾸려면 `rounded-*` 클래스가 아니라 토큰을 넘기세요. 컴포넌트는 넘겨받은 `className`을 병합하지 않고 이어 붙이기 때문에, 같은 속성을 지정하는 두 유틸리티는 생성된 스타일시트에서의 순서로 결정됩니다. 기대고 있을 만한 것이 아닙니다.

```tsx
<MPChip style={{ '--mp-sys-shape-corner-small': '9999px' } as React.CSSProperties}>필터</MPChip>
```

### 소스 색상에 대한 주의사항 하나

파생에 CSS 상대 색상 문법을 쓰기 때문에 `--mp-source-color`는 **완전한 색상 값**이어야 합니다. `#7c3aed`, `oklch(0.49 0.24 292)`, `rgb(124 58 237)` 같은 것들입니다. 채널만 담고 있는 디자인 토큰은 동작하지 않습니다.

```css
:root {
  --brand: 262 83% 58%; /* 채널만 */

  --mp-source-color: var(--brand); /* ✗ 색상이 아님 */
  --mp-source-color: hsl(var(--brand)); /* ✓ */
}
```

## 크기

모든 컨트롤이 하나의 사다리에서 `size`를 가져갑니다 — `xs`, `sm`, `md`, `lg`, `xl` — 그리고 `md`가 머터리얼 본래의 크기이므로 아무것도 지정하지 않으면 그것이 나옵니다.

```tsx
<MPTextField label="검색" size="sm" value={query} onChange={setQuery} />
```

이 사다리는 라이브러리가 스펙을 알면서 넘어서는 유일한 지점입니다. 이유와 각 단계가 무엇인지는 [Prop 규약](../design/prop-conventions#size)에 있습니다.

## 패키지에 들어 있는 것

| Export                             | 내용                                         |
| ---------------------------------- | -------------------------------------------- |
| `material-plus-ui`                 | 모든 컴포넌트와 타입                         |
| `material-plus-ui/types`           | 공유 prop 어휘만                             |
| `material-plus-ui/constants/icons` | 아이콘 세트. named export와 조회 테이블 형태 |
| `material-plus-ui/styles.css`      | 완성된 CSS. Tailwind가 없는 프로젝트용       |
| `material-plus-ui/tailwind.css`    | 토큰과 `@source`. Tailwind가 있는 프로젝트용 |

## 다음

- [전체 컴포넌트](../components/) — 컴포넌트당 한 페이지. 라이브 프리뷰와 전체 props 표가 있습니다.
- [MPTextField](../components/inputs/text-field) — 필드, 그리고 조합 처리가 왜 필요한지.
- [MPIcon](../components/display/icon) — 직접 쓰는 아이콘 세트 연결하기.
