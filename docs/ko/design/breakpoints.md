---
title: 브레이크포인트
order: 4
---

# 브레이크포인트

<p class="mp-lede">Material Plus는 Tailwind의 breakpoint가 아니라 머터리얼의 다섯 가지 <strong>윈도우 크기 클래스</strong>에서 바뀝니다. 그리드, 본문 폭, 사이드바의 접힘, <code>MPShow</code>, 그리고 훅이 모두 하나의 사다리를 읽습니다 — 그래서 페이지가 어느 한 너비에서 자기 자신과 어긋나는 일이 없습니다.</p>

## 사다리

| 클래스        | 시작   | 보통 무엇인지                 | MD3 열 수 |
| ------------- | ------ | ----------------------------- | --------- |
| `compact`     | 0      | 세로로 든 휴대폰              | 4         |
| `medium`      | 600dp  | 세로로 든 태블릿              | 12        |
| `expanded`    | 840dp  | 가로로 든 태블릿, 작은 노트북 | 12        |
| `large`       | 1200dp | 데스크톱                      | 12        |
| `extra-large` | 1600dp | 넓은 데스크톱                 | 12        |

각 클래스는 자기 바닥에서 다음 클래스의 바닥까지이고, 조건을 만족하는 가장 넓은 클래스가 이깁니다. `compact`가 0에서 시작하는 것은 창이 없는 것보다 좁은 창은 없기 때문입니다.

::: fw flutter

Dart에서 클래스는 `MPWindowClass`의 값이고, `extra-large`는 `MPWindowClass.extraLarge`입니다. 바닥값의 단위는 논리 픽셀이고, dp가 뜻하는 것이 바로 그것입니다. 숫자 자체가 필요하면 `mpWindowClassMinimums`에 있습니다.

:::

::: fw react

## 왜 Tailwind의 것이 아닌가

Tailwind는 640, 768, 1024, 1280, 1536에서 바뀝니다. 같은 아이디어를 다른 숫자로 말한 것이고, 두 사다리가 한 페이지에 있으면 눈으로 알아채기 아주 어려운 방식으로 틀립니다. `MPGrid`는 600에서 재배치되는데 그 옆의 `md:` 유틸리티는 768에서 재배치된다면, 그 사이 구간을 뺀 모든 너비에서는 맞고 그 구간에서만 한 레이아웃의 두 절반이 어긋납니다.

사다리가 둘 있을 때 이 라이브러리는 명세가 정의한 쪽을 택합니다. 그리고 그것을 공개하므로, 직접 쓰는 유틸리티도 경쟁하는 대신 같은 사다리에 올라탈 수 있습니다:

```tsx
<div className="mp-medium:flex mp-below-expanded:hidden">
```

등록된 variant는 여덟 개입니다 — `mp-medium`, `mp-expanded`, `mp-large`, `mp-extra-large`, 그리고 각각의 `mp-below-*`. 두 설치 경로 모두에서 동작합니다. `mp-compact`는 없습니다. 모든 창이 최소한 그만큼은 넓으니까요.

:::

## 클래스를 쓰는 곳

::: fw react

| 어디 | prop | 무엇이 푸는가 |
| --- | --- | --- |
| [`MPGrid`](../components/layout/grid) | `columns`, `spacing`, `rowSpacing`, `columnSpacing` | CSS |
| [`MPGridItem`](../components/layout/grid) | `span`, `offset` | CSS |
| [`MPContainer`](../components/layout/container), [`MPHeader`](../components/layout/header), [`MPFooter`](../components/layout/footer) | `maxWidth` | CSS |
| [`MPShow`](../components/layout/show) | `from`, `until`, `only` | CSS |
| [`MPPageLayout`](../components/layout/page-layout), [`MPSidebar`](../components/layout/sidebar) | `collapseBelow` | 자바스크립트 |
| [`useMPWindowClass`](../guide/hooks#usempwindowclass) | — | 자바스크립트 |

:::

::: fw flutter

여기에는 CSS 열이 없습니다. 모두 Dart에서, `MediaQuery`가 알려 주는 창 너비를 같은 사다리에 대어 결정합니다.

| 어디 | 파라미터 |
| --- | --- |
| 그리드 항목의 `span`이나 컨테이너의 `maxWidth` 같은 반응형 파라미터 | `MPResponsive` |
| [`MPPageLayout`](../components/layout/page-layout), [`MPSidebar`](../components/layout/sidebar) | `collapseBelow` |
| 직접 만든 위젯 | `MPConfigProvider.of(context).windowClassOf(width)` |

Flutter 패키지에 그 컴포넌트가 있는지는 각 컴포넌트 페이지에 있습니다.

클래스는 위젯이 받은 상자가 아니라 창에서 읽습니다. 미디어 쿼리가 재는 것도 그쪽입니다. 그래서 나란히 놓인 그리드 둘은 각자 얼마나 넓어졌든 같은 클래스에 있습니다. 자기 상자를 재고 싶은 위젯은 `LayoutBuilder`를 씁니다.

:::

## 클래스별 값

::: fw react

모든 반응형 prop은 값 하나, 또는 클래스를 키로 하는 맵을 받습니다. 각 항목은 자기 클래스**부터 위로** 적용되므로, 보통 두 항목이면 레이아웃 전체를 설명하고 지정하지 않은 클래스는 아래 클래스가 말한 것을 그대로 유지합니다:

```tsx
<MPGridItem span={{ compact: 12, medium: 6, expanded: 4 }} />
<MPContainer maxWidth={{ compact: 'none', expanded: 'lg' }} />
```

휴대폰에서는 전체 폭, 600dp부터는 절반, 840dp부터는 3분의 1입니다.

지정한 클래스만 실제로 기록됩니다 — `expanded` 하나만 지정한 `span`은 엘리먼트에 커스텀 프로퍼티 하나이지 다섯 개가 아닙니다 — 그리고 빈 칸은 스타일시트가 아래 클래스로 되돌려 채웁니다. 그 엘리먼트가 200행짜리 목록의 한 행일 때 이 차이가 드러납니다.

:::

::: fw flutter

Dart에서 클래스별 값은 `MPResponsive`입니다. TypeScript는 prop 하나가 값 하나와 맵을 모두 받게 할 수 있지만 Dart에는 그런 합집합 타입이 없어서, 생성자가 둘입니다.

```dart
const MPResponsive<int>(12, medium: 6, expanded: 4) // 가장 좁은 창부터
const MPResponsive<int>.from(expanded: 4) // 840dp부터. 그 아래는 파라미터 자신의 기본값
```

첫 번째는 휴대폰에서 전체 폭, 600dp부터 절반, 840dp부터 3분의 1입니다. 각 항목은 자기 클래스**부터 위로** 적용되므로, 보통 두 항목이면 레이아웃 전체를 설명하고 지정하지 않은 클래스는 아래 클래스가 말한 것을 그대로 유지합니다.

`compact` 없는 `MPResponsive.from`은 `compact` 키가 없는 React 맵과 같은 뜻입니다. "그 아래는 없음"이 아니라 "여기서부터 위로는 이것"입니다.

:::

::: fw react

## CSS냐 훅이냐

둘 다 쓸 수 있고, 서로 바꿔 쓸 수 있는 것은 아닙니다.

**CSS** — 위의 반응형 prop들, `MPShow`, 그리고 `mp-*` variant. 미디어 쿼리는 브라우저가 **무엇을 그리기 전에** 결정하며 서버가 보낸 마크업에 대해서도 그렇습니다. 그래서 첫 프레임이 이미 맞고, 클래스가 바뀌어도 리렌더링 비용이 없습니다. 대신 두 갈래 모두 DOM에 존재합니다.

**훅** — [`useMPWindowClass`](../guide/hooks#usempwindowclass). 진짜 자바스크립트라서 선택되지 않은 갈래는 아예 렌더링되지 않습니다. 대신 하이드레이션 전에는 답할 수 없습니다. 첫 페인트는 추측(`onServer`)이고 교정은 두 번째 렌더입니다.

```tsx
// 어느 배치가 화면에 있느냐 → CSS
<MPShow until="expanded">
  <MPBottomNavigation items={nav} />
</MPShow>;

// 비싼 것을 아예 만들 것이냐 → 훅
const size = useMPWindowClass();
{
  size !== 'compact' && <RevenueChart />;
}
```

기준: 화면 밖 갈래가 싸다면, 애초에 첫 렌더가 틀릴 일이 없는 쪽을 택하세요.

:::

::: fw flutter

## 직접 만든 위젯에서

Flutter에는 무엇보다 먼저 답하는 스타일시트가 없으므로 묻는 방법은 하나이고, 첫 프레임이 틀릴 일도 없습니다. 위젯이 빌드될 때 창 너비는 이미 알려져 있습니다.

```dart
final MPWindowClass windowClass =
    MPConfigProvider.of(context).windowClassOf(MediaQuery.sizeOf(context).width);

if (windowClass == MPWindowClass.compact) {
  return MPBottomNavigation(/* … */);
}
```

`windowClassOf`는 가장 가까운 `MPConfigProvider`에서 경계를 읽으므로, 경계를 옮기면 이 답도 나머지와 함께 옮겨집니다. `MediaQuery.sizeOf`는 크기만 구독하므로, 위젯은 창 크기가 바뀔 때 다시 빌드되고 키보드 인셋이 바뀔 때는 다시 빌드되지 않습니다.

직접 만든 클래스별 값도 같은 방식으로 풉니다.

```dart
const MPResponsive<int> columns = MPResponsive<int>(1, medium: 2, expanded: 3);

final int count = columns.resolve(windowClass, 1);
```

:::

## 옮기기

::: fw react

경계는 상수가 아니라 기본값입니다. 다만 서로를 읽을 수 없는 두 곳에 살고 있고, **둘 다 함께 옮겨야 합니다**.

미디어 쿼리는 자바스크립트가 실행되기 전에 결정되고 커스텀 프로퍼티를 이름으로 부를 수도 없습니다. 그래서 너비는 스타일시트에 등록으로 한 번, 라이브러리의 자바스크립트에 한 번 존재합니다. 한쪽만 옮긴 페이지는 옛 경계와 새 경계 사이 구간에서 틀립니다.

### 스타일시트

Tailwind 경로에서만 가능합니다 — `material-plus-ui/tailwind.css`를 자기 빌드에 import하는 프로젝트입니다. import한 뒤에 양쪽을 다시 선언하면 나중 정의가 이깁니다:

```css
@import 'tailwindcss';
@import 'material-plus-ui/tailwind.css';

@custom-variant mp-medium (@media (width >= 700px));
@custom-variant mp-below-medium (@media (width < 700px));
```

둘 다 선언해야 합니다. 하나의 경계에서 쌍이 파생되는 것이 아니라 서로 다른 두 개의 등록이기 때문입니다. 이렇게 하면 그리드, 본문 폭, 표시/숨김 규칙, 그리고 직접 쓰는 `mp-medium:` 유틸리티가 함께 옮겨집니다.

컴파일된 `material-plus-ui/styles.css`를 쓰는 프로젝트는 이렇게 할 수 없습니다. 그 파일은 Tailwind의 출력이고 그 안의 쿼리는 이미 숫자입니다.

### 자바스크립트

```tsx
<MPConfigProvider breakpoints={{ medium: 700 }}>
```

부분적이고, MD3의 값 위에 덮어쓰며, 단위는 CSS 픽셀입니다. `compact`는 무엇을 주든 항상 0입니다.

이 prop은 경계의 **출처가 아닙니다**. CSS에서 이미 한 일을 자바스크립트 쪽에 알려 주는 것입니다. 이것만 설정하면 레이아웃의 절반만 옮겨집니다. 자세한 것은 [`MPConfigProvider`](../guide/config#윈도우-크기-클래스-옮기기)에 있습니다.

:::

::: fw flutter

경계는 기본값이고, Flutter에서는 한 곳에 있습니다.

```dart
MPConfigProvider(
  breakpoints: const <MPWindowClass, double>{MPWindowClass.medium: 700},
  child: child,
)
```

부분적이고, MD3의 값 위에 덮어쓰며, 단위는 논리 픽셀입니다. `compact`는 무엇을 주든 항상 0입니다.

프로바이더 아래의 모든 것이 함께 옮겨집니다. 모든 반응형 파라미터, 모든 `collapseBelow`, 직접 부르는 `windowClassOf`까지입니다. 경계가 미리 컴파일된 스타일시트에 묶여 있지 않으므로 함께 옮길 나머지 절반이 없습니다. 나머지는 [`MPConfigProvider`](../guide/config#윈도우-크기-클래스-옮기기)에 있습니다.

:::

## 라이브러리는 둘을 어떻게 맞춰 두는가

::: fw react

자기 자신의 두 사본도 믿는 대신 검사합니다. `test/styles/breakpoints.test.tsx`가 `src/styles.css`에서 등록을, `src/internal/window-class.ts`에서 숫자를 읽어 서로 어긋나면 실패합니다. 그리고 스타일시트 안 다른 곳에 너비가 직접 적히면 그것도 실패시키므로, 다섯 번째 경계가 조용히 생길 수 없습니다.

:::

::: fw flutter

Flutter 패키지 안에는 맞춰 둘 것이 없습니다. 숫자의 사본은 `mpWindowClassMinimums` 하나이고, 패키지의 모든 반응형 판단이 `MPConfigProvider`를 거쳐 그 값을 읽습니다. 다른 곳에 경계가 적힌다면 그것은 두 번째 사본이 아니라 버그입니다.

:::

## 다음

- [`MPGrid`](../components/layout/grid) — 레이아웃 그리드와 열 하나 뒤에 있는 산술.
- [`MPShow`](../components/layout/show) — 어떤 너비에서 보이고 어떤 너비에서 보이지 않기.
- [`useMPWindowClass`](../guide/hooks#usempwindowclass) — 같은 질문에 대한 자바스크립트 쪽 답.
- [`MPConfigProvider`](../guide/config) — 애플리케이션이 기본값을 정하는 곳.
