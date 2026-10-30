---
layout: home

title: Material Plus
titleTemplate: React와 Flutter를 위한 Material Design 3 컴포넌트
description: Material Design 3 사양에서 직접 옮기고, 사양이 멈춘 곳부터는 더 넓힌 React·Flutter 컴포넌트 라이브러리입니다. 사양에 없는 차트와 데이터 테이블과 커맨드 팔레트가 들어 있습니다. 소스 색상 하나로 모든 색상 롤을 만들고, 같은 색이면 두 패키지에서 같은 스킴이 나옵니다.

hero:
  name: Material Plus
  text: 머터리얼 스펙을 준수하면서도 확장시킬 수 있는 컴포넌트 라이브러리
  tagline: 'Material Design의 최신 사양 그대로, React와 Flutter 모두에서 더 넓은 범위의 컴포넌트와 개선된 디자인을 사용합니다. 여러 가지 사용자 지정 옵션으로 조금 더 컴팩트하게 쓰거나, 더 넓은 폭의 기기를 지원하세요.'
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
    details: 소스 색상 하나를 지정하면 모든 색상 롤이 따라옵니다. 머터리얼이 소스 색상에서 스킴을 생성하는 방식 그대로입니다. React는 --mp-source-color에서 읽고 provider도 리렌더도 없으며, 페이지에 이미 있는 --md-sys-color-* 토큰도 읽습니다. Flutter는 MPTheme(sourceColor:)에서 읽습니다.
    link: /ko/components/
    linkText: 둘러보기
  - title: 구조적으로 IME에 안전합니다
    details: 한국어, 일본어, 중국어 조합을 견디는 controlled 입력이고, 두 패키지 모두 그렇습니다. 변경 핸들러에서 값을 어떻게 다루든 음절이 사라지거나 커서가 튀지 않습니다.
    link: /ko/components/inputs/text-field
    linkText: MPTextField
  - title: 두 언어 모두 타입이 있습니다
    details: React 패키지에는 TypeScript 타입 정의가 함께 들어 있고, Flutter의 파라미터는 모두 Dart 타입입니다. prop 이름과 받을 수 있는 값을 에디터가 먼저 알려줍니다.
  - title: 아이콘은 원하는 것으로
    details: MPIcon은 어떤 아이콘 세트의 글리프든 받습니다. React에서는 컴포넌트나 엘리먼트를, Flutter에서는 IconData나 위젯을 받습니다. React 패키지에는 lucide-react가 기본 포함되며, 한눈에 읽을 수 있는 단일 constants 파일에 모여 있습니다.
    link: /ko/components/display/icon
    linkText: MPIcon
---

## Material Plus를 만든 이유

Material Design 3에는 문서로 적힌 사양이 있습니다. 컴포넌트 라이브러리는 그 문서에서 출발할 수도 있고, 문서를 먼저 읽은 다른 라이브러리에서 출발할 수도 있습니다. 여기서는 문서에서 출발했습니다. 색상 롤과 타입 스케일과 모양 토큰이 사양이 부르는 이름 그대로인 이유입니다.

그리고 사양이 멈추는 자리에서 화면은 멈추지 않습니다. 버튼의 크기 단계가 그 예입니다. `xs`·`sm`·`md`는 사양의 32·40·56px이고, `lg`와 `xl`은 이 라이브러리의 64·72px입니다. 사양이 그다음으로 정한 값은 96px인데, 64px 입력 필드 옆에 선 96px 버튼은 한 줄이 되지 않습니다. 차트와 데이터 테이블과 커맨드 팔레트도 같은 이야기입니다. 사양에는 없지만 애플리케이션에는 있습니다.

::: fw react

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
    <p>런타임 의존성은 둘이고, 두 번째의 문법 파일은 필요할 때 내려받습니다. CSS-in-JS 런타임은 없습니다. 스타일은 스타일시트입니다. 컴포넌트마다 각자의 모듈로 컴파일되므로, 가져오지 않은 것은 번들에 들어가지 않습니다.</p>
  </div>
</div>

:::

::: fw flutter

<div class="mp-why">
  <div class="mp-why-card">
    <h3>공존합니다</h3>
    <p>패키지는 Flutter의 widgets 라이브러리만으로 만들었고 Material도 Cupertino도 import하지 않습니다. <code>MaterialApp</code>이든 <code>CupertinoApp</code>이든 맨 <code>WidgetsApp</code>이든 그 안에 넣어도 머터리얼 구현을 하나 더 끌고 오지 않습니다.</p>
  </div>
  <div class="mp-why-card">
    <h3>변경마다 테스트합니다</h3>
    <p>모든 컴포넌트가 자체 위젯 테스트를 가지고 있고, 변경마다 Linux·Windows·macOS에서 Flutter 3.41과 현재 stable 릴리스로 실행됩니다. 텍스트 필드 테스트는 입력기의 조합 구간을 직접 만들어 확인합니다.</p>
  </div>
  <div class="mp-why-card">
    <h3>더 설치할 것이 없습니다</h3>
    <p>패키지는 Flutter 말고는 의존성이 없고, 폰트도 이미지도 싣지 않습니다. 연결할 스타일시트도, 앱을 감쌀 provider도 없습니다.</p>
  </div>
</div>

:::

## 주요 기능

::: fw react

<ul class="mp-feature-list">
  <li>Material Design 3 색상·타입·모양 토큰</li>
  <li>소스 색상 하나로 생성되는 색상 스킴</li>
  <li>라이트·다크 스킴 전환</li>
  <li>한국어·일본어·중국어 IME 입력</li>
  <li>18개 언어 번역</li>
  <li>RTL 레이아웃</li>
  <li>반응형 브레이크포인트와 창 크기 클래스</li>
  <li>xs부터 xl까지의 크기 단계</li>
  <li>차트 9종</li>
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

:::

::: fw flutter

<ul class="mp-feature-list">
  <li>Material Design 3 색상·타입·모양 토큰</li>
  <li>소스 색상 하나로 생성되는 색상 스킴</li>
  <li>라이트·다크 스킴 전환</li>
  <li>한국어·일본어·중국어 IME 입력</li>
  <li>18개 언어 번역</li>
  <li>RTL 레이아웃</li>
  <li>반응형 브레이크포인트와 창 크기 클래스</li>
  <li>xs부터 xl까지의 크기 단계</li>
  <li>차트 9종</li>
  <li>날짜·시간 선택기</li>
  <li>데이터 테이블과 트리 뷰</li>
  <li>커맨드 팔레트와 키보드 단축키</li>
  <li>모션 컴포넌트 17종</li>
  <li>레이아웃 프리미티브와 페이지 레이아웃</li>
  <li>React 패키지와 같은 컴포넌트 이름과 수치</li>
  <li>Flutter 외 의존성 없음</li>
  <li>Material·Cupertino import 없음</li>
  <li>Flutter가 빌드하는 모든 플랫폼</li>
  <li>Linux·Windows·macOS 테스트</li>
</ul>

:::

## 설치

패키지는 둘이고 컴포넌트 이름은 같습니다. React는 npm의 `material-plus-ui`, Flutter는 pub.dev의 `material_plus_ui`입니다. 이 페이지를 뺀 모든 페이지에서 사이드바 맨 위의 전환기로 문서가 보여 줄 쪽을 고릅니다.

::: fw react

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

:::

::: fw flutter

```bash
flutter pub add material_plus_ui
```

Flutter 3.41 이상이 필요합니다. 스타일시트도 provider도 없습니다. 라이브러리를 import해서 위젯을 쓰면 됩니다.

```dart
import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class SignIn extends StatefulWidget {
  const SignIn({super.key});

  @override
  State<SignIn> createState() => _SignInState();
}

class _SignInState extends State<SignIn> {
  String _email = '';

  @override
  Widget build(BuildContext context) {
    return MPTextField(
      label: const Text('이메일'),
      type: MPTextFieldType.email,
      value: _email,
      onChanged: (String next) => setState(() => _email = next),
    );
  }
}
```

:::

## 미리보기

여섯 개만 꺼내 왔습니다. 카드 안의 것은 그림이 아니라 이 페이지에서 돌고 있는 컴포넌트입니다.

::: fw flutter

미리보기는 React 빌드입니다. Flutter 미리보기 여섯 개는 한 페이지에 엔진 여섯 개를 띄우는 일이라, Flutter 미리보기는 각 컴포넌트 페이지에 있습니다.

:::

<Demo src="home/preview" plain :minHeight="420" />

나머지는 [모든 컴포넌트](/ko/components/)에 있습니다.
