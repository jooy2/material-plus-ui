---
title: 시작하기
order: 1
---

# 시작하기

Material Plus는 [Material UI](https://mui.com)를 확장하는 React 컴포넌트 라이브러리입니다. 컴포넌트가 `@mui/material` 옆이 아니라 그것으로 만들어져 있으므로, 앱에 이미 있는 MUI 컴포넌트와 같은 `ThemeProvider`를 읽고 같은 팔레트를 쓰며 높이도 맞습니다.

MUI로 해결되지 않는 스타일은 [Tailwind CSS](https://tailwindcss.com) v4가, 둘 다로 해결되지 않는 동작은 [Base UI](https://base-ui.com)가 맡습니다. 둘 다 여러분 프로젝트에 설치할 필요는 없습니다.

## 설치

```bash
npm install material-plus-ui
```

```bash
pnpm add material-plus-ui
```

### Peer dependency

Material Plus가 자체 사본을 들고 오는 대신 프로젝트에서 찾아 쓰는 패키지들입니다.

| 패키지                              | 버전       |
| ----------------------------------- | ---------- |
| `@mui/material`                     | 6, 7, 8, 9 |
| `@emotion/react`, `@emotion/styled` | 11         |
| `react`, `react-dom`                | 18, 19     |

CI에서 실제로 돌려보는 것은 MUI 9뿐입니다. 컴포넌트가 쓰는 API는 MUI 5부터 안정적이었던 것들이라 이전 메이저도 단순히 눈감아 주는 것이 아니라 지원 대상입니다. 다만 특정 버전에서 문제가 생긴다면 [이슈로 알려 주세요](https://github.com/jooy2/material-plus/issues). 버그로 처리합니다.

`lucide-react`는 실제 dependency이며 패키지와 함께 설치됩니다. 라이브러리 자체 컴포넌트들이 그리는 글리프의 출처입니다 — [MPIcon](../components/display/icon)을 참고하세요.

## 스타일시트 연결

앱의 CSS 진입점에 한 줄을 추가합니다.

```css
@import 'material-plus-ui/styles.css';
```

번들러가 CSS를 처리한다면 진입 모듈에서 import해도 똑같이 동작합니다.

```ts
import 'material-plus-ui/styles.css';
```

이 파일은 **완성된 CSS**입니다. 디자인 토큰과, 컴포넌트가 쓰는 모든 유틸리티 클래스의 실제 규칙이 들어 있습니다. 빌드 쪽 설정도, PostCSS 플러그인도, `@source`도 필요 없습니다.

### reset은 들어 있지 않습니다

Tailwind 기반 컴포넌트 라이브러리가 보통 만들어지는 방식과 다른 유일한 지점이고, 의도한 것입니다. Tailwind의 Preflight는 페이지 전체 reset인데, 여러분 프로젝트에는 이미 하나가 있습니다. `@mui/material`의 `CssBaseline`입니다. 이 둘은 눈에 보이게 충돌합니다. Preflight는 MUI 타이포그래피가 잡아 둔 제목 크기, 리스트 마커, 링크 색을 평평하게 만들고, `border: 0 solid`는 이 라이브러리의 컴포넌트만이 아니라 페이지의 모든 MUI 컴포넌트를 다시 칠합니다.

이 라이브러리의 어떤 것도 Preflight에 의존하지 않습니다. `CssBaseline`을 그대로 쓰세요.

### 이미 Tailwind를 쓰고 있다면

프로젝트에 Tailwind v4가 이미 있다면, 컴파일된 쪽 대신 토큰 시트를 import하세요. 무엇도 두 번 생성되지 않고, 컴포넌트에 넘긴 `className`이 컴포넌트 자신의 클래스와 올바른 순서로 정렬됩니다.

```css
@import 'tailwindcss';
@import 'material-plus-ui/tailwind.css';
```

| 줄                                        | 역할                                       |
| ----------------------------------------- | ------------------------------------------ |
| `@import 'tailwindcss'`                   | Tailwind 자체                              |
| `@import 'material-plus-ui/tailwind.css'` | 디자인 토큰과, 패키지를 등록하는 `@source` |

`@source`를 직접 쓸 필요는 없습니다. 컴포넌트가 쓰는 클래스는 Tailwind 유틸리티이므로 Tailwind가 패키지의 컴파일된 파일을 읽어야 찾을 수 있는데, `material-plus-ui/tailwind.css`가 자기 안에 `@source '.'`를 선언해 그 일을 대신합니다. `@source`는 그것이 쓰인 파일 기준으로 경로를 풉니다. 여기서는 `node_modules/material-plus-ui/dist/`, 바로 그 파일들 옆입니다. 명시적으로 등록된 source는 자동 감지가 건너뛰는 `node_modules` 안에서도 스캔됩니다.

덕분에 여러분의 CSS 파일이 어디 있든 상관이 없습니다.

## 사용

Material Plus 컴포넌트는 MUI 컴포넌트가 들어가는 곳이면 어디든, 같은 provider 안에 들어갑니다.

```tsx
import { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MPTextField } from 'material-plus-ui';

const theme = createTheme({ palette: { mode: 'light' } });

export default function App() {
  const [email, setEmail] = useState('');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MPTextField label="이메일" type="email" value={email} onChange={setEmail} />
    </ThemeProvider>
  );
}
```

## 다크 모드

따로 설정할 것이 없습니다. 컴포넌트는 감싸고 있는 `ThemeProvider`에서 팔레트를 읽으므로, MUI에서 다크 모드를 위해 이미 하고 있는 것 — 테마의 `mode`, `useColorScheme`, `CssVarsProvider` — 이 이 컴포넌트들에도 그대로 적용됩니다.

## 패키지에 들어 있는 것

| Export                             | 내용                                             |
| ---------------------------------- | ------------------------------------------------ |
| `material-plus-ui`                 | 모든 컴포넌트와 타입                             |
| `material-plus-ui/types`           | 공유 prop 어휘만 따로                            |
| `material-plus-ui/constants/icons` | 아이콘 세트. named export와 조회 테이블 양쪽으로 |
| `material-plus-ui/styles.css`      | 완성된 CSS. Tailwind가 없는 프로젝트용           |
| `material-plus-ui/tailwind.css`    | 토큰과 `@source`. Tailwind가 있는 프로젝트용     |

## 다음

- [모든 컴포넌트](../components/) — 하나에 한 페이지씩, 라이브 미리보기와 전체 props 표.
- [MPTextField](../components/inputs/text-field) — 필드와, 애초에 조합 처리가 왜 필요한지.
- [MPIcon](../components/display/icon) — 쓰던 아이콘 세트 가져오기.
