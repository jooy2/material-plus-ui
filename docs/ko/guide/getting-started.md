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

### 컴포넌트를 몇 개만 쓴다면

위의 시트는 라이브러리가 가진 모든 규칙입니다. 대부분의 프로젝트에는 그 편이 맞습니다. 한 줄이면 되고, 어떤 컴포넌트가 페이지에 있는지 생각할 일이 없습니다. 동시에 그것은 120 kB — 압축해서 17.4 kB — 이고, 페이지가 컴포넌트를 하나 그리든 전부 그리든 같습니다. Tailwind가 여러분의 import가 아니라 파일 스캔으로 생성하기 때문입니다.

그래서 패키지는 같은 규칙을 컴포넌트가 나뉜 것과 같은 선을 따라 잘라서도 제공합니다. 토큰 한 번, 그리고 컴포넌트마다 시트 하나입니다.

```ts
import 'material-plus-ui/styles/tokens.css';
import 'material-plus-ui/styles/button.css';
import 'material-plus-ui/styles/text-field.css';
```

`tokens.css`가 항상 먼저입니다. 레이어 순서와, 다른 모든 시트가 읽는 색 역할을 선언하는 파일입니다. 컴포넌트 시트의 이름은 패키지 안의 디렉터리 이름, 즉 케밥 케이스로 쓴 컴포넌트 이름입니다: `date-range-picker.css`, `animate-fade.css`.

| 페이지의 컴포넌트 수 | 전체 시트 | 토큰 + 시트 각각          |
| -------------------- | --------- | ------------------------- |
| 1                    | 17.4 kB   | 4.4 kB                    |
| 5                    | 17.4 kB   | 6.9 kB                    |
| 10                   | 17.4 kB   | 9.7 kB                    |
| 35 이상              | 17.4 kB   | 17.4 kB, 그리고 계속 증가 |

번들러가 이어 붙였을 때를 기준으로 압축한 값이고, 아래 번들 표가 쓰는 것과 같은 조합에 대한 값입니다. 시트끼리는 서로 겹칩니다 — `flex`는 열두 개쯤에 들어 있습니다 — 그래서 합계가 전체 시트보다 빠르게 늘고, 서른다섯 개 언저리에서 앞지릅니다. 그 뒤로는 `styles.css`가 더 작으면서 한 줄입니다.

이 경로가 아닌 것 두 가지. 트리셰이킹이 아닙니다. import해 놓고 쓰지 않은 시트를 떨어뜨려 주는 것은 없으니, 목록은 여러분이 정직하게 관리해야 합니다. 그리고 Tailwind를 쓰는 프로젝트를 위한 것도 아닙니다. 그쪽은 자기 패스에서 유틸리티를 생성하고, 아래 절이 설정의 전부입니다.

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

테마가 아니라 인스턴스 하나만 바꾸려면 `rounded-*` 클래스가 아니라 토큰을 넘기세요. 넘긴 클래스는 병합되지 않고 이어 붙기만 하며, 그것이 무엇을 뜻하는지는 [클래스와 스타일](#클래스와-스타일)에 있습니다.

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

제품 전체를 한 단계로 돌리려면 호출 지점마다가 아니라 한 번만 정하세요 — [앱 전역 기본값](./config)을 보세요.

## 클래스와 스타일

모든 컴포넌트가 `className`과 `style`을 받습니다. 둘 다 props 표에 적힌 엘리먼트에 붙습니다 — 컴포넌트가 그리는 가장 바깥 엘리먼트이고, 보이는 부분이 트리거가 있는 트리 밖으로 포털되는 경우는 예외입니다. 대화상자의 시트, 메뉴의 팝업, 툴팁의 판이 그렇습니다.

### 클래스는 병합이 아니라 이어 붙이기입니다

넘긴 클래스는 컴포넌트 자신의 클래스 뒤에 붙고, 자리를 내주기 위해 지워지는 것은 없습니다. 같은 속성을 지정하는 두 클래스가 같은 명시도로 엘리먼트에 함께 올라가고, **이기는 쪽은 스타일시트가 뒤에 놓은 쪽입니다.** 어느 쪽을 썼는지가 아닙니다.

컴포넌트가 지정하지 않은 것에 대한 클래스는 언제나 적용됩니다. 클래스로 하려는 일의 대부분이 이것이고, 여기에 더 알아야 할 것은 없습니다.

```tsx
<MPButton className="mt-4 w-full">저장</MPButton>
```

그 너머는 짝에 따라 다릅니다. 컴파일된 시트를 쓰는 경우에는 애플리케이션이 나중에 import한 시트가 이기고, Tailwind를 쓰는 경우에는 둘이 한 번의 패스에서 생성되어 Tailwind 자신의 정렬이 결정합니다. 이 저장소의 시트로, 기본 크기의 `MPButton`에 대고 실제로 측정한 결과입니다.

| 넘긴 것                       | 컴포넌트가 지정한 것   | 결과   |
| ----------------------------- | ---------------------- | ------ |
| `px-8`                        | `px-6`                 | 적용됨 |
| `px-2`                        | `px-6`                 | 무시됨 |
| `h-20`                        | `h-14`                 | 적용됨 |
| `h-8`                         | `h-14`                 | 무시됨 |
| `text-lg`, `text-xs`          | `text-mp-title-medium` | 적용됨 |
| `bg-red-500`                  | `bg-(--_mp-accent)`    | 적용됨 |
| `rounded-lg`                  | `rounded-mp-full`      | 무시됨 |
| `shadow-lg`                   | `shadow-mp-1`          | 무시됨 |
| `p-8`                         | `px-6`                 | 무시됨 |
| 위의 어느 것이든 `!`를 붙이면 | —                      | 적용됨 |

들여다볼 만한 것은 처음 네 줄입니다. 같은 컴포넌트, 같은 속성인데 `px-8`은 되고 `px-2`는 안 됩니다. Tailwind가 스케일을 스케일 순서로 내놓기 때문에 더 큰 단계가 더 뒤에 오고, 그래서 _컨트롤을 키우는 쪽은 대체로 되고 줄이는 쪽은 대체로 안 됩니다_. 나머지는 두 테마 키 중 어느 쪽을 Tailwind가 먼저 정렬했는가의 문제입니다. 이 라이브러리의 `--text-mp-*`는 Tailwind 자신의 것보다 앞에 놓이므로 넘긴 `text-*`가 이기고, `--radius-mp-*`와 `--shadow-mp-*`는 뒤에 놓이므로 `rounded-*`와 `shadow-*`는 집니다.

이 중 무엇도 약속이 아닙니다. 어떤 한 버전의 Tailwind가 내놓은 결과이고, 속성 단위가 아니라 짝 단위이며, 양쪽 중 어느 한쪽이 토큰을 추가하면 발밑에서 움직일 수 있습니다. `className`은 컴포넌트가 건드리지 않는 것에 쓰는 도구로 두세요.

### 이미 지정된 것을 가져오려면

- **토큰을 넘기세요.** `style`은 인라인이라 시트의 순서와 무관하게 항상 이기고, 컴포넌트가 실제로 읽고 있는 값을 바꿉니다.

  ```tsx
  <MPChip style={{ '--mp-sys-shape-corner-small': '9999px' } as React.CSSProperties}>필터</MPChip>
  ```

- **prop을 쓰세요.** 높이와 타입 스케일과 패딩 묶음이 곧 `size`이고, 강조 색 계열이 곧 `color`입니다. 유틸리티로 크기를 바꾼 컨트롤은 페이지의 다른 모든 컨트롤이 올라 있는 사다리에서 혼자 내려온 컨트롤입니다.
- **`!`를 붙이세요.** Tailwind의 important 수식어 — `px-8!` — 는 순서와 무관하게 이깁니다. 어떤 테마도 닿을 수 없는 호출부 오버라이드이므로, 한 번뿐인 예외에만 쓰세요.

  쓰기 전에 알아 둘 것이 하나 있습니다. 두 번씩 걸리는 지점이기 때문입니다. **`!important`는 레이어 순서를 뒤집습니다.** 표시 없는 선언은 레이어 밖이 모든 레이어를 이기고, 위쪽 테마 설명이 기대고 있는 것이 그 규칙입니다. important는 반대로 갑니다. 가장 앞선 레이어가 이기고, 레이어 밖이 꼴찌입니다. 그래서 평범한 스타일시트에 쓴 `!`는 페이지 자신의 `[&_h3]:my-7.5!`를 이기지 _못합니다_. 그쪽은 Tailwind 유틸리티라 `@layer utilities` 안에 있기 때문입니다. 이기려면 `!`를 붙이는 동시에 `utilities`보다 앞서 선언된 레이어 안에 있어야 합니다. 레이어 밖의 `!` 둘끼리는 다시 평범한 명시도와 소스 순서로 돌아갑니다.

이 라이브러리는 클래스 머저를 싣지 않으며, 그것은 의도된 선택입니다. `tailwind-merge`가 이 일을 위한 도구이고 좋은 도구이지만, 모든 컴포넌트에 걸리는 런타임 의존성이 됩니다 — 버튼 하나가 3.0 kB인 것에 비하면 작지 않습니다 — 그리고 이 패키지가 추가하는 모든 `mp-` 토큰을 그쪽 클래스 그룹에 계속 맞춰 가르쳐야 합니다. 호출부에서 병합하는 것은 한 줄이고, 필요 없는 프로젝트에는 아무 비용도 지우지 않습니다.

### 클래스 훅과 Tailwind의 밑줄

모든 컴포넌트는 자신이 그리는 엘리먼트에 고유한 클래스를 답니다 — `mp-button`, `mp-list-item`, `mp-accordion` — 그리고 그 안쪽 부분들은 BEM으로 이름 지어져 있습니다. `mp-list-item__label`, `mp-accordion__title`, `mp-card__header` 같은 것들입니다. 어떤 prop으로도 `className`으로도 닿을 수 없는 부분에 접근하는 안정적인 방법입니다.

**Tailwind의 arbitrary variant 안에서는 이스케이프가 필요하며, 하지 않으면 조용히 실패합니다.** Tailwind는 대괄호 안의 `_`를 공백으로 읽기 때문에, BEM의 `__`가 후손 결합자로 바뀌어 아무도 쓴 적 없는 엘리먼트를 찾아 나섭니다.

```
[&_.mp-accordion__title]:text-lg
  ↓
.mp-accordion title { … }     /* .mp-accordion 안의 <title> 엘리먼트 */
```

아무것도 맞지 않고, 아무도 그렇다고 말해 주지 않습니다. 밑줄을 `\_\_`로 쓰세요.

```tsx
<MPAccordion className="[&_.mp-accordion\_\_title]:text-lg" />
```

JSX 속성이라 백슬래시가 그대로 들어갑니다. JavaScript 문자열 안에서는 — `clsx('[&_.mp-accordion\\_\\_title]:text-lg')` — 두 번 써야 합니다.

또는 규칙을 스타일시트에 쓰세요. 거기서는 이름에 이스케이프가 전혀 필요 없고, 사이트의 모든 아코디언에 적용되는 규칙이라면 애초에 그쪽이 있을 자리이기도 합니다.

```css
.mp-accordion__title {
  font-size: 1.125rem;
}
```

## 무게

압축(gzip) 기준이고, 실제 번들러로 잰 값이며, React와 `@base-ui/react`는 external로 뺐습니다. 즉 전체 다운로드가 아니라 이 라이브러리가 더하는 몫입니다.

| 페이지에 올린 것 | JavaScript | 스타일시트(분할) |
| ---------------- | ---------- | ---------------- |
| `MPBox` 하나     | 1.7 kB     | 4.5 kB           |
| `MPButton` 하나  | 3.0 kB     | 4.5 kB           |
| 컴포넌트 다섯 개 | 9.0 kB     | 7.5 kB           |
| 컴포넌트 열 개   | 13.3 kB    | 10.3 kB          |
| 내보내는 것 전부 | 91.0 kB    | 18.1 kB          |

여기서 읽을 것이 두 가지입니다. 첫 번째 열은 한계 비용입니다. import하지 않은 컴포넌트는 여기에 들어 있지 않고, `sideEffects`와 빌드가 붙이는 `@__PURE__` 주석, 네임스페이스마다 하나씩인 메시지 테이블이 전부 그것을 위한 것입니다. 두 번째 열은 한계 비용이 아닙니다. 스타일시트는 import했거나 하지 않았거나 둘 중 하나라서, 위 숫자는 시트 목록이 실제로 그리는 것과 일치한다고 가정합니다.

Base UI는 실제 다운로드의 더 큰 절반이고 두 열 어디에도 들어 있지 않습니다. 함께 번들하면 컴포넌트 다섯 개는 20.3 kB, 열 개는 93.0 kB가 됩니다. 다만 peer dependency이므로 그것을 쓰는 다른 것들과 공유되고, 버전은 여러분이 정합니다.

두 숫자 모두 기억이 아니라 빌드가 찍어 냅니다. 조용히 사실이 아니게 될 수 없습니다.

## Next.js와 React Server Components

이 라이브러리의 모든 컴포넌트에는 `"use client"`가 붙어 있습니다. 서버 컴포넌트에서 지시문 없이 그대로 import해서 렌더링할 수 있습니다.

```tsx
// app/page.tsx — 서버 컴포넌트입니다. "use client"가 없습니다
import { MPBox, MPButton, MPTextField } from 'material-plus-ui';

export default function Page() {
  return (
    <MPBox>
      <MPTextField label="이름" value="" />
      <MPButton>저장</MPButton>
    </MPBox>
  );
}
```

배럴 자체에는 붙어 있지 않고, 그것이 이 방식이 싸게 먹히는 이유입니다. 서버 컴포넌트에서 `MPBox`를 import하면 경계를 넘는 것은 `MPBox`뿐입니다. 데이터도 마찬가지여서 — `registerMPMessages`와 로케일 테이블, 공용 타입은 부르는 곳에서 그냥 실행됩니다. 애플리케이션이 시작할 때 쓰는 그 한 줄을 서버 파일에 둬도 됩니다.

```ts
import { registerMPMessages } from 'material-plus-ui';
import { ko } from 'material-plus-ui/locales/ko';

registerMPMessages(ko);
```

아이콘은 서버 컴포넌트에서 양쪽 다 동작합니다. 이름 붙은 export도, 조회 테이블도요.

```tsx
import { MPIcon, CheckIcon, ICONS } from 'material-plus-ui';

<MPIcon icon={CheckIcon} />
<MPIcon icon={ICONS.check} />
```

여러분 파일 맨 위에 `"use client"`가 여전히 필요한 것은, 어떤 React 라이브러리에서도 필요한 그것들입니다.

- **훅.** `useMPSnackbar`와 `useMPLocale`은 훅이고, 훅은 클라이언트 컴포넌트에서만 실행됩니다. *프로바이더*는 있던 자리에 그대로 둬도 됩니다 — `MPLocaleProvider`, `MPSnackbarProvider`, `MPTooltipProvider` 모두 서버 레이아웃에서 렌더링됩니다.
- **콜백을 넘기는 것.** `onChange`, `onOpenChange`, `onValueChange` — 함수는 서버 컴포넌트에서 클라이언트 컴포넌트로 건너갈 수 없습니다. 이건 이 라이브러리의 규칙이 아니라 React의 규칙이고, 맨 `<input onChange>`에도 똑같이 적용됩니다.

### 다른 번들러에서는

지시문은 그 외의 곳에서는 아무 일도 하지 않습니다. esbuild, webpack, Vite, Next.js 모두 아무 말 없이 번들에서 제거하고, 위의 압축 크기는 지시문이 있든 없든 바이트까지 같습니다(양쪽 다 측정했습니다). 뭔가 말하는 것은 Rollup을 그대로 쓰는 빌드뿐입니다. 컴포넌트마다 하나씩 `MODULE_LEVEL_DIRECTIVE` 경고가 찍힙니다. 서버 컴포넌트를 지원하는 라이브러리는 전부 이 경고를 냅니다. `onwarn`으로 걸러 내면 됩니다.

```js
onwarn(warning, warn) {
  if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
  warn(warning);
}
```

## 패키지에 들어 있는 것

| Export                             | 내용                                                 |
| ---------------------------------- | ---------------------------------------------------- |
| `material-plus-ui`                 | 모든 컴포넌트와 타입                                 |
| `material-plus-ui/types`           | 공유 prop 어휘만                                     |
| `material-plus-ui/constants/icons` | 아이콘 세트. named export와 조회 테이블 형태         |
| `material-plus-ui/hooks`           | 자기 컴포넌트가 없는 다섯 개의 훅                    |
| `material-plus-ui/locales`         | 열여덟 개의 번역. 요청하기 전에는 하나도 실리지 않음 |
| `material-plus-ui/styles.css`      | 완성된 CSS. Tailwind가 없는 프로젝트용               |
| `material-plus-ui/styles/*.css`    | 같은 CSS를 컴포넌트별 시트로                         |
| `material-plus-ui/tailwind.css`    | 토큰과 `@source`. Tailwind가 있는 프로젝트용         |

## 다음

- [전체 컴포넌트](../components/) — 컴포넌트당 한 페이지. 라이브 프리뷰와 전체 props 표가 있습니다.
- [MPTextField](../components/inputs/text-field) — 필드, 그리고 조합 처리가 왜 필요한지.
- [MPIcon](../components/display/icon) — 직접 쓰는 아이콘 세트 연결하기.
