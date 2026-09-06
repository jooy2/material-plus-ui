---
layout: home

title: Material Plus
titleTemplate: React를 위한 Material Design 3 컴포넌트
description: Material Design 3 사양에서 직접 옮기고, 사양이 멈춘 곳부터는 더 넓힌 React 컴포넌트 라이브러리입니다. 사양에 없는 차트와 데이터 테이블과 커맨드 팔레트가 들어 있습니다. CSS 커스텀 프로퍼티로 테마를 다루고, 타입 정의가 포함되어 있으며 ESM 전용입니다.

hero:
  name: Material Plus
  text: 머터리얼 스펙을 준수하면서도 확장시킬 수 있는 컴포넌트 라이브러리
  tagline: 'Material Design의 최신 사양 그대로, 대신 더 넓은 범위의 컴포넌트와 개선된 디자인을 사용합니다. 여러 가지 사용자 지정 옵션으로 조금 더 컴팩트하게 쓰거나, 더 넓은 폭의 기기를 지원하세요.'
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

Material Design 3에는 문서로 적힌 사양이 있습니다. 컴포넌트 라이브러리는 그 문서에서 출발할 수도 있고, 문서를 먼저 읽은 다른 라이브러리에서 출발할 수도 있습니다. 여기서는 문서에서 출발했습니다. 색상 롤과 타입 스케일과 모양 토큰이 사양이 부르는 이름 그대로인 이유입니다.

그리고 사양이 멈추는 자리에서 화면은 멈추지 않습니다. 버튼의 크기 단계가 그 예입니다. `xs`·`sm`·`md`는 사양의 32·40·56px이고, `lg`와 `xl`은 이 라이브러리의 64·72px입니다. 사양이 그다음으로 정한 값은 96px인데, 64px 입력 필드 옆에 선 96px 버튼은 한 줄이 되지 않습니다. 차트와 데이터 테이블과 커맨드 팔레트도 같은 이야기입니다. 사양에는 없지만 애플리케이션에는 있습니다.

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

## 주요 기능

<ul class="mp-feature-list">
  <li>Material Design 3 색상·타입·모양 토큰</li>
  <li>소스 색상 하나로 생성되는 색상 스킴</li>
  <li>라이트·다크 스킴 전환</li>
  <li>한국어·일본어·중국어 IME 입력</li>
  <li>18개 언어 번역</li>
  <li>RTL 레이아웃</li>
  <li>반응형 브레이크포인트와 창 크기 클래스</li>
  <li>xs부터 xl까지의 크기 단계</li>
  <li>차트 10종</li>
  <li>날짜·시간 선택기</li>
  <li>데이터 테이블과 트리 뷰</li>
  <li>커맨드 팔레트와 키보드 단축키</li>
  <li>모션 컴포넌트 17종</li>
  <li>레이아웃 프리미티브와 페이지 레이아웃</li>
  <li>훅 9종</li>
  <li>TypeScript 타입 정의 포함</li>
  <li>ESM 전용, 트리 셰이킹</li>
  <li>컴포넌트별로 나뉘는 스타일시트</li>
  <li>Next.js 서버 컴포넌트 지원</li>
  <li>Tailwind CSS v4 토큰 시트</li>
  <li>Chromium·Firefox·WebKit 테스트</li>
</ul>

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

## 미리보기

여섯 개만 꺼내 왔습니다. 카드 안의 것은 그림이 아니라 이 페이지에서 돌고 있는 컴포넌트입니다.

<Demo src="home/preview" plain :minHeight="420" />

나머지는 [모든 컴포넌트](/ko/components/)에 있습니다.
