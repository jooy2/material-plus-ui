---
layout: home

title: Material Plus
titleTemplate: React를 위한 Material Design 3 컴포넌트
description: Material Design 3를 구현한 React 컴포넌트 라이브러리입니다. 다른 머터리얼 라이브러리가 제공하지 않는 컴포넌트와, 제공하더라도 기능을 더 넓힌 컴포넌트를 모았습니다. CSS 커스텀 프로퍼티로 테마를 다루고, 타입 정의가 포함되어 있으며 ESM 전용입니다.

hero:
  name: Material Plus
  text: 매번 직접 만들게 되는 머터리얼 컴포넌트들
  tagline: 'Material Design 3를 스펙에서 직접 따랐습니다. 테마가 CSS 커스텀 프로퍼티라, 이미 머터리얼을 쓰는 프로젝트에 두 번째 디자인 시스템을 들이지 않고 들어갑니다.'
  image:
    src: /logo-large.png
    alt: Material Plus
  actions:
    - theme: brand
      text: 시작하기
      link: /ko/guide/getting-started
    - theme: alt
      text: 모든 컴포넌트
      link: /ko/components/

features:
  - title: 테마는 한 줄
    details: --mp-source-color 하나를 지정하면 모든 색상 롤이 따라옵니다. 머터리얼이 소스 색상에서 스킴을 생성하는 방식 그대로입니다. provider도 테마 객체도 리렌더도 없고, 페이지에 이미 있는 --md-sys-color-* 토큰을 읽을 수도 있습니다.
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

어느 머터리얼 라이브러리를 쓰더라도 프로젝트마다 같은 컴포넌트 네다섯 개를 매번 다시 쓰게 됩니다. 조합(composition)을 제대로 처리하는 입력 필드, 쓰는 아이콘 세트와 맞아떨어지는 아이콘 wrapper, 라벨과 보조 텍스트와 adornment 두 개를 늘 같은 방식으로 조립하는 폼 행 같은 것들입니다.

Material Plus는 그렇게 쌓인 것들을 꺼내어 테스트까지 붙여 둔 라이브러리입니다.

<div class="mp-why">
  <div class="mp-why-card">
    <h3>공존합니다</h3>
    <p>페이지 수준으로 개입하는 것이 하나도 없습니다. reset도, provider도, 전역 스타일링도 없습니다. 테마는 cascade layer 안의 CSS 커스텀 프로퍼티라서, 이미 머터리얼을 돌리는 프로젝트는 자기 설정을 유지하고 이쪽이 그것을 따라갑니다.</p>
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

`@base-ui/react`, `react`, `react-dom`은 peer dependency입니다. 스타일시트는 CSS 한 줄로 연결합니다.

```css
@import 'material-plus-ui/styles.css';
```

```tsx
import { MPTextField } from 'material-plus-ui';

export default function SignIn() {
  const [email, setEmail] = useState('');

  return <MPTextField label="이메일" type="email" value={email} onChange={setEmail} />;
}
```
