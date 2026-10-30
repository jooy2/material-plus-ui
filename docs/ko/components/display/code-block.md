---
title: MPCodeBlock
order: 27
---

# MPCodeBlock

<p class="mp-lede">코드 한 줄이든 천 줄이든 보여 주는 뷰어. 색, 줄 번호, 표시, 복사가 각각 prop 하나입니다. 같은 컴포넌트가 문장 속 조각이기도 하고 README 맨 위의 전체 기록이기도 해야 하기 때문입니다.</p>

<Demo src="code-block/hero" :minHeight="420" />

::: fw react

```tsx
import { MPCodeBlock } from 'material-plus-ui';

<MPCodeBlock code={source} language="ts" title="src/index.ts" lineNumbers />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPCodeBlock(code: source, language: 'ts', title: const Text('src/index.ts'), lineNumbers: true);
```

:::

## Props

<PropsTable name="MPCodeBlock" />

## <Fw react="색은 따로 도착합니다" flutter="색은 호출자의 몫입니다" />

::: fw flutter

Flutter 패키지에는 의존성이 없고, 서른네 개 언어의 문법을 손으로 쓰겠다는 건 지킬 수 없는 약속입니다. 그래서 블록은 나머지 — 바, 번호, 프롬프트, 표시, 팔레트 네 가지 — 를 직접 그리고, 코드는 테마의 잉크 한 가지로 그립니다. `highlighter`를 넘기면 달라집니다. 코드와 언어를 받아 줄마다 런의 목록을 돌려주는 함수이고, 각 런에는 테마가 칠하는 열두 슬롯 중 하나가 붙습니다.

```dart
List<MPCodeLine>? highlightWithMyPackage(String code, String language) {
  // 쓰고 있는 하이라이터의 결과를 런으로 바꿉니다.
  return <MPCodeLine>[
    <MPCodeToken>[const MPCodeToken('const', MPCodeTokenKind.keyword), const MPCodeToken(' a = 1;')],
  ];
}

MPCodeBlock(code: source, language: 'dart', highlighter: highlightWithMyPackage);
```

모르는 언어에는 `null`을 돌려주면 블록이 맨몸으로 그립니다. `highlight: false`는 하이라이터를 무시하고, `rawToggle`은 둘 사이를 오가는 버튼을 그립니다. 위의 미리보기는 갤러리가 패턴 몇 줄로 칠한 것이고, Dart용 하이라이터 패키지라면 무엇이든 같은 방식으로 연결할 수 있습니다.

:::

::: fw react

highlight.js가 칠하고, 이 라이브러리에서 동적 import로 불러오는 유일한 것입니다. 문법은 40킬로바이트씩 서른네 개라서 자기 청크로 옵니다. 한 번에 한 언어씩, 그리고 칠해 달라고 한 블록에만.

페이지 입장에서 그 말은 이렇습니다.

- `highlight={false}`는 아무것도 받아 오지 않습니다. 색을 칠하지 않는 블록은 그 안의 글자 이상을 쓰지 않습니다.
- TypeScript를 칠하는 블록은 코어와 TypeScript만 받고 나머지 서른셋은 받지 않습니다.
- 블록은 첫 프레임에 맨몸으로 그려지고 청크가 도착하면 스스로 색을 입습니다. 코드가 있어야 할 자리가 비어 있는 순간은 없습니다.

`npm run measure`가 그 비용을 따로 찍는 이유도 같습니다. 아직 아무 블록도 칠하지 않은 라이브러리는 49.7 kB 더 가볍습니다.

### 목록에 없는 언어

문법 서른네 개는 문서 사이트가 실제로 쓰는 여섯 개가 무엇일지에 대한 추측입니다. 그 밖의 것은 등록해서 씁니다.

```ts
import { registerMPLanguage } from 'material-plus-ui';
import elixir from 'highlight.js/lib/languages/elixir';

registerMPLanguage('elixir', elixir);
```

모듈 스코프에서 호출하세요. 이미 그려진 블록은 나중에 등록한 언어로 다시 칠해지지 않습니다. 여기서 스스로 다시 렌더되는 것은 없습니다. 다만 그 뒤에 마운트되는 블록은 모두 그것을 봅니다.

아무도 모르는 언어는 거부되는 대신 맨몸으로 그려집니다.

:::

### 이미 손에 있는 철자

`language`는 흔한 별칭과 파일 확장자를 알아듣습니다. 그래서 펜스 코드 블록이나 파일 이름에서 복사한 값이 그대로 동작합니다. `ts`, `tsx`, `yml`, `sh`, `docker`, `c++`, `psql`. 바에는 그것이 해석된 정식 이름이 적힙니다.<Fw flutter=" `highlighter`가 받는 것도 그 이름입니다." />

## 언제나 줄 단위로 그려집니다

번호도 프롬프트도 없을 때조차 그렇습니다. 번호와 프롬프트와 스크롤 속 위치를 지니는 것이 줄이고, 두 가지 렌더링을 오가는 컴포넌트는 맞춰 둬야 할 줄바꿈 동작을 두 벌 갖게 됩니다.

거기서 두 가지가 따라옵니다.

**번호와 프롬프트는 생성된 콘텐츠입니다.** 선택할 수 없고, <Fw react="페이지 내 찾기에 걸리지 않으며, " />복사 버튼이 클립보드에 넣는 것도 아닙니다. 기록은 기록으로 남고, 그대로 셸에 붙여 넣어집니다.

::: fw react

```tsx
<MPCodeBlock code={commands} language="bash" prompt="$" />
```

:::

::: fw flutter

```dart
MPCodeBlock(code: commands, language: 'bash', prompt: r'$');
```

:::

**표시된 줄은 띠가 아니라 행입니다.** 가로 여백이 줄에 붙어 있어서, 코드가 상자보다 좁든 옆으로 스크롤돼 있든 색이 블록의 양 끝에 닿습니다.

::: fw react

```tsx
<MPCodeBlock code={source} markLines="1,4-9,12" />
```

:::

::: fw flutter

```dart
MPCodeBlock(code: source, markLines: '1,4-9,12');
```

:::

`markLines`는 <Fw react="숫자, 줄과 범위를 적은 문자열, 또는 그 둘의 배열을" flutter="줄과 범위를 적은 문자열을" /> 받습니다. 거꾸로 적은 범위도 같은 범위이고, 해석할 수 없는 것은 던지지 않고 버립니다. 표시된 줄은 주석이고, 거기 난 오타는 코드가 아니라 주석을 잃는 것으로 끝나야 합니다. 표시는 gutter가 세는 방식으로 셉니다. `startLine`이 286이면 288에 단 표시는 288로 적힌 줄을 표시합니다.

## 블록은 페이지의 강조 색을 쓰지 않습니다

자기 팔레트를 가지고 있고, 이것은 빠뜨린 것이 아니라 결정입니다. 코드는 코드를 위해 고른 바탕 위에서 읽히고, 키워드와 문자열과 숫자를 서로 갈라 놓는 데 필요한 열두 가지 색조는 MD3가 가진 강조 계열 네 개가 아닙니다. `primary`로 물들인 블록은 색이 아무 정보도 나르지 않는 블록입니다.

| `theme` |  |
| --- | --- |
| `auto` | 페이지 자신의 스킴. 밝은 페이지에서는 밝게, 어두운 페이지에서는 어둡게. 기본값이고, 여기 다른 모든 면이 하는 일이 그것이기 때문입니다 |
| `dark` | 페이지가 무엇이든 어둡게 고정. 문서 사이트가 대개 원하는 쪽입니다 |
| `light` | 밝게 고정 |
| `mono` | 색조 없음. 구조를 굵기와 흐림의 정도로만 나릅니다. 종이에 인쇄된 블록, 또는 위의 색조들을 구분하지 못하는 사람에게 남는 것이 그것입니다 |

### 자기 테마 가져오기

::: fw flutter

`customTheme`은 `MPCodeTheme`을 받습니다. 바탕, 잉크, 열두 슬롯을 합쳐 색 열네 개입니다. 나머지 다섯 — `dim`, `rule`, `hover`, `mark`, `markEdge` — 은 바탕과 잉크에서 섞여 나오므로, 다시 적지 않아도 여러분이 쓴 것을 따라갑니다.

```dart
MPCodeBlock(
  code: source,
  customTheme: const MPCodeTheme(
    background: Color(0xFF1B1B1F),
    foreground: Color(0xFFE6E6E9),
    keyword: Color(0xFFC792EA),
    string: Color(0xFFC3E88D),
    // 그리고 comment, number, function, type, variable, tag, attribute, meta, addition, deletion
  ),
);
```

서드파티 팔레트는 여기 들어 있지 않습니다. One Dark, Dracula, Nord 같은 것들은 각자의 라이선스 아래 발표된 다른 프로젝트의 작업물이고, 그것을 이 패키지에 옮겨 넣는 것은 남의 디자인을 이 이름으로 배포하는 일입니다.

:::

::: fw react

`theme`는 아무 문자열이나 받습니다. 여기서 테마란 `[data-mp-code-theme]` 선택자 아래의 `--mp-code-*` 커스텀 프로퍼티 묶음이고, 그 이상은 아무것도 아닙니다.

```css
[data-mp-code-theme='ours'] {
  --mp-code-bg: #1b1b1f;
  --mp-code-fg: #e6e6e9;
  --mp-code-keyword: #c792ea;
  --mp-code-string: #c3e88d;
  /* 그리고 comment, number, function, type, variable, tag, attr, meta, add, del */
}
```

선언 열두 개입니다. 나머지 다섯 슬롯 — `dim`, `rule`, `hover`, `mark`, `mark-edge` — 은 여러분이 준 바탕과 잉크에서 섞여 나오므로, 다시 적지 않아도 여러분이 쓴 것을 따라갑니다.

서드파티 팔레트는 여기 들어 있지 않습니다. One Dark, Dracula, Nord 같은 것들은 각자의 라이선스 아래 발표된 다른 프로젝트의 작업물이고, 그것을 이 패키지에 옮겨 넣는 것은 남의 디자인을 이 이름으로 배포하는 일입니다. 매일 읽는 그 테마를 가져오는 방법이 위의 블록입니다.

:::

## 바

`toolbar`가 주 스위치입니다. 끄면 바가 없고, `showLanguage`나 `copyable`이나 `rawToggle`이 무엇이라 하든 아무것도 그리지 않습니다. 문장 속 조각인 경우가 그것입니다.

바 위의 버튼은 `MPIconButton`이 아니라 평범한 <Fw react="엘리먼트" flutter="위젯" />이고, 이것은 지름길이 아닙니다. 이 라이브러리의 컨트롤은 페이지의 색 역할을 읽습니다. 바가 얹힌 시트는 그 역할을 일부러 거부했으므로, 여기 아이콘 버튼을 두면 검은 바 위의 밝은 컨트롤이 됩니다. 대신 지키는 것은 집안의 처리입니다. 모서리 사다리, 지속 시간 토큰, 포커스 링.

::: fw react

`copyable`은 보안 컨텍스트가 없어도 동작합니다. 비동기 Clipboard API는 그것을 요구하고, 컴포넌트 라이브러리는 다들 인정하는 것보다 자주 `http://192.168.1.4:3000`에서 쓰입니다. 그래서 대체 경로가 있고, 버튼은 셋 중 무엇이 일어났는지 말합니다.

:::

::: fw flutter

`copyable`은 코드를 시스템 클립보드에 넣고, 버튼이 성공했는지를 말합니다. 스크린 리더도 같은 단어를 듣습니다. 자기 라벨을 바꾸는 버튼은 따로 알리지 않으면 읽히지 않기 때문입니다.

:::

## 안에서 선택하기

::: fw react

코드는 포커스를 받는 region입니다. 그리로 탭해 들어와 어느 에디터에나 있는 전체 선택 단축키를 누른 독자는 _이_ 코드를 뜻한 것이고, 주변 문서가 아니라 그것을 얻습니다. 번호와 프롬프트가 선택 밖에 있는 이유는 클립보드 밖에 있는 이유와 같습니다. 거기에는 선택할 것이 없습니다.

:::

::: fw flutter

코드는 선택할 수 있고, 안에서 전체 선택을 하면 주변 화면이 아니라 코드가 선택됩니다. 번호와 프롬프트가 선택 밖에 있는 이유는 클립보드 밖에 있는 이유와 같습니다. 선택은 손잡이를 `Overlay`에 그리므로, 위에 오버레이가 없는 블록(어떤 `WidgetsApp`에도 들어 있지 않은 맨 위젯 트리)은 그려지기는 하지만 선택되지는 않습니다. 코드에 스크롤할 곳이 있는 동안 블록은 포커스 정지점이 되고, 화살표 키와 Page Up, Page Down, Home, End로 스크롤됩니다.

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 필요할 때 불러오는 highlight.js | `highlighter` | 패키지에 의존성이 없어서, 색은 넘겨받은 하이라이터에서 옵니다. |
| `registerMPLanguage` | — | 언어는 여러분의 하이라이터가 압니다. |
| 아무 문자열인 `theme` | `theme` enum과 `customTheme` | 테마를 정의할 스타일시트가 없으므로, 직접 만든 팔레트는 색으로 넘깁니다. |
| 숫자나 배열인 `markLines` | 문자열인 `markLines` | Dart에는 유니언 타입이 없고, `'4'`, `'4-9'`, `'1,4-9,12'`로 같은 것을 말할 수 있습니다. |
| CSS 길이인 `maxHeight`, `fontSize` | 논리 픽셀 | 해석할 CSS 길이가 없습니다. |
| 화면 가까이 와야 칠함 | 빌드될 때 칠함 | 넘겨받은 하이라이터는 동기로, 텍스트와 언어마다 한 번 돕니다. |
| `className`, `style` | — | 넘길 클래스 목록이나 style 속성이 없습니다. |

:::
