---
layout: home

title: Material Plus
titleTemplate: Material UI를 위한 추가 컴포넌트
description: Material UI를 확장하는 React 컴포넌트 라이브러리입니다. MUI가 제공하지 않는 컴포넌트와, 제공하더라도 기능을 더 넓힌 컴포넌트를 모았습니다. 타입 정의가 포함되어 있고 ESM 전용입니다.

hero:
  name: Material Plus
  text: 매번 직접 만들게 되는 Material UI 컴포넌트들
  tagline: '@mui/material 옆이 아니라 그 위에 세웠습니다. 같은 테마, 같은 prop 어휘, 맞춰야 할 두 번째 디자인 시스템은 없습니다.'
  actions:
    - theme: brand
      text: 시작하기
      link: /ko/guide/getting-started
    - theme: alt
      text: 모든 컴포넌트
      link: /ko/components/

features:
  - title: 대체재가 아닙니다
    details: 모든 컴포넌트가 @mui/material로 만들어져 있습니다. 여러분의 ThemeProvider, 팔레트, 타이포그래피를 그대로 읽고, 바로 옆의 MUI 컨트롤과 높이가 맞습니다.
    link: /ko/components/
    linkText: 둘러보기
  - title: 구조적으로 IME에 안전합니다
    details: 한국어, 일본어, 중국어 조합을 견디는 controlled 입력입니다. onChange에서 값을 어떻게 다루든 음절이 사라지거나 커서가 튀지 않습니다.
    link: /ko/components/inputs/text-field
    linkText: MPTextField
  - title: TypeScript 우선
    details: 타입 정의가 패키지에 함께 들어 있습니다. prop 이름과 받을 수 있는 값을 에디터가 먼저 알려줍니다.
  - title: 아이콘은 원하는 것으로
    details: MPIcon은 어떤 아이콘 세트의 컴포넌트나 엘리먼트든 받습니다. lucide-react가 기본 포함되며, 한눈에 읽을 수 있는 단일 constants 파일에 모여 있습니다.
    link: /ko/components/display/icon
    linkText: MPIcon
---

## Material Plus를 만든 이유

Material UI는 큰 라이브러리지만, 그럼에도 프로젝트마다 같은 컴포넌트 네다섯 개를 매번 다시 쓰게 됩니다. 조합(composition)을 제대로 처리하는 입력 필드, 쓰는 아이콘 세트와 맞아떨어지는 아이콘 wrapper, 라벨과 helper와 adornment 두 개를 늘 같은 방식으로 조립하는 폼 행 같은 것들입니다.

Material Plus는 그렇게 쌓인 것들을 꺼내어 테스트까지 붙여 둔 라이브러리입니다.

<div class="mp-why">
  <div class="mp-why-card">
    <h3>MUI는 peer이지 사본이 아닙니다</h3>
    <p><code>@mui/material</code>과 Emotion은 peer dependency입니다. 프로젝트에 이미 있는 사본을 그대로 쓰므로, 번들에 MUI가 두 벌 들어가거나 트리에 테마가 둘 생기는 일이 없습니다.</p>
  </div>
  <div class="mp-why-card">
    <h3>실제 브라우저에서 테스트합니다</h3>
    <p>모든 컴포넌트가 자체 테스트를 가지고 있고, 변경마다 세 가지 OS에서 Chromium·Firefox·WebKit으로 실행됩니다. 조합 테스트는 실제 IME 이벤트를 발생시킵니다.</p>
  </div>
  <div class="mp-why-card">
    <h3>의도적으로 작습니다</h3>
    <p>런타임 의존성은 하나뿐입니다. 컴포넌트마다 각자의 모듈로 컴파일되므로, 가져오지 않은 것은 번들에 들어가지 않습니다.</p>
  </div>
</div>

## 설치

```bash
npm install material-plus-ui
```

`@mui/material`, `@emotion/react`, `@emotion/styled`, `react`, `react-dom`은 peer dependency입니다. 다섯 개 모두 이미 가지고 계실 겁니다.

```tsx
import { MPTextField } from 'material-plus-ui';

export default function SignIn() {
  const [email, setEmail] = useState('');

  return <MPTextField label="이메일" type="email" value={email} onChange={setEmail} />;
}
```
