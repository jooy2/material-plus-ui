---
title: 색상
order: 1
---

# 색상

Material Plus는 **하나의 소스 색상**에서 스킴 전체를 생성합니다. Material Design이 하는 방식 그대로입니다. 그것만 지정하면 모든 롤이 따라오고, 결과가 마음에 들지 않는 롤만 따로 지정합니다.

::: fw react

```css
:root {
  --mp-source-color: #7c3aed;
}
```

provider도 테마 객체도 없습니다. 컴포넌트가 그리는 모든 색이 CSS 커스텀 프로퍼티이므로 테마 설정이 곧 CSS입니다. 그리고 그것이 이미 자체 머터리얼 토큰을 가진 프로젝트 안에 들어갈 수 있게 하는 부분입니다.

:::

::: fw flutter

```dart
MPTheme(sourceColor: const Color(0xFF7C3AED), child: const App())
```

먼저 설치할 것은 없습니다. 위에 `MPTheme`이 없으면 컴포넌트는 기본 스킴을 플랫폼의 밝기로 그립니다. `MPTheme`은 커스텀 프로퍼티를 Flutter식으로 쓴 것입니다. 그 아래 서브트리에 테마를 적용하는 위젯이라서, 화면 일부만 나머지와 다르게 둘 수 있습니다.

:::

두 패키지는 같은 계산과 같은 수치로 롤을 파생하므로, 같은 소스 색상은 어느 패키지가 그리든 같은 스킴이 됩니다. Flutter 패키지의 `test/theme/color_scheme_test.dart`는 기본 스킴을 React 스타일시트의 값과 롤마다, 두 밝기 모두에서 대조하고 채널마다 255 기준 1단계 안으로 맞춥니다. 반올림만큼의 차이입니다.

## 팔레트

브라우저가 실제로 계산한 값을 읽어온 것이고, 두 스킴을 동시에 보여줍니다. 페이지는 언제나 한쪽 스킴에만 있으므로 각 스와치가 어느 쪽에서 측정된 것인지 표시합니다.

<Demo src="color/palette" plain />

::: fw flutter

팔레트는 React 패키지의 스타일시트에서 읽은 것이고, Flutter 패키지도 같은 값을 냅니다. Dart에서 값을 읽으려면 스킴을 직접 생성합니다.

```dart
final MPColorScheme light = MPColorScheme.fromSource();
final MPColorScheme dark = MPColorScheme.fromSource(brightness: Brightness.dark);

// light.primary, dark.onSurfaceVariant, light.chart[0], …
```

:::

## 50개가 아니라 29개

머터리얼은 색상 롤을 약 50개 정의합니다. 이 라이브러리의 컴포넌트가 읽는 것은 그중 29개이고, 여기 있는 것도 그 29개뿐입니다.

의도적이고, 토큰 전체가 따르는 같은 규칙입니다 — **아무도 읽지 않는 토큰은 그 이름을 계속 지원하겠다는 약속입니다.** 여기 있는 롤은 모두 어떤 컴포넌트가 읽기 때문에 있습니다. fixed 롤, `surface-dim`, `surface-bright`, `surface-container-lowest` 같은 나머지는 아직 그것으로 그리는 것이 없어서 없고, 그 빈자리는 정직합니다. 명세와 하나씩 맞춘 목록은 [명세 지원 범위](./spec-coverage.md)에 있습니다.

이것이 이 라이브러리가 머터리얼을 완전히 재현하려 하지 않는 이유이기도 합니다. 페이지가 이미 돌리고 있는 머터리얼 구현을 대체하는 게 아니라 **공존**해야 하므로, 주장하는 표면은 컴포넌트가 필요로 하는 만큼만 유지합니다.

::: fw flutter

Dart에서는 `MPColorScheme`의 필드이고, 이름은 camelCase입니다. `on-surface-variant`는 `onSurfaceVariant`입니다. 그 옆에 차트 팔레트 두 개, `chart`와 `chartScale`이 있습니다.

:::

## 롤이 파생되는 방식

각 롤은 소스 색상의 명도와 채도를 바꾸고 hue는 그대로 둔 것입니다.

::: fw react

스타일시트는 CSS 상대 색상 문법으로 이렇게 합니다.

```css
oklch(from var(--mp-source-color) var(--tone) var(--chroma) h)
```

끝의 `h`는 소스 자신의 hue를 그대로 유지한다는 뜻입니다.

:::

::: fw flutter

Dart에서는 `MPColorScheme.fromSource`가 같은 일을 합니다. 소스를 OKLCh로 한 번 변환한 뒤, 롤마다 그 롤의 명도와 채도로 소스의 hue 위에 색을 만듭니다. 롤별 톤과 채도는 React 스타일시트의 수치입니다.

:::

즉 롤은 씨앗과 같은 색 계열을 다른 톤에서 본 것이고, 그것이 바로 머터리얼 톤 팔레트입니다.

### 라이트와 다크는 하나의 팔레트를 두 번 읽은 것

머터리얼의 두 스킴은 서로 다른 두 색 집합이 아닙니다. 같은 톤 팔레트를 **다른 톤에서** 읽은 것입니다 — 라이트 `primary`는 톤 40, 다크 `primary`는 톤 80입니다.

여기서도 그렇게 동작하므로, 다크 스킴은 모든 값을 다시 쓴 두 번째 사본이 아니라 톤 번호의 재배정입니다. 소스 색상을 바꾸면 두 스킴이 함께 움직이고, 따로 동기화할 것이 없습니다.

### 숫자의 출처

톤과 채도 값은 눈대중이 아니라 머터리얼 자신의 baseline 레퍼런스 팔레트를 OKLCh로 변환해 읽어온 것입니다. 스펙의 baseline 소스 색상을 넣으면 파생 결과가 스펙의 baseline 스킴에 도달합니다.

|           | `primary`  | `on-surface` | `on-surface-variant` | `outline` | `error`    |
| --------- | ---------- | ------------ | -------------------- | --------- | ---------- |
| 라이트 ΔE | **0.0000** | 0.0026       | 0.0041               | 0.0038    | **0.0000** |
| 다크 ΔE   | 0.0072     | 0.0046       | 0.0047               | 0.0036    | **0.0000** |

`primary`와 `error`는 두 스킴 모두 레퍼런스 hex와 정확히 일치하고, 중성 롤은 전부 0.02(차이가 보이지 않는 임계값) 아래입니다.

알려진 차이 하나는 인정하고 갑니다. 모든 파생 롤이 소스 색상의 hue를 유지하는데, 머터리얼의 중성 팔레트는 거기서 10–20° 떨어져 있습니다. 채도 0.01–0.02에서 그것은 a/b 기준 수천분의 몇 차이이고 — 지각 한계 아래이며, 회색에 그만큼 가까우면 hue 자체가 거의 결정되지 않으므로 이를 쫓는 것은 노이즈에 맞추는 일이 됩니다.

### sRGB 안으로

팔레트의 채도는 램프 양 끝이 담을 수 있는 것보다 큽니다. `on-primary`의 톤에서는 sRGB에 남은 채도가 아예 없고, 컨테이너의 톤에서는 팔레트 채도의 일부만 남습니다. 브라우저는 이런 색을 명도와 hue를 유지한 채 안으로 들여오지 않고, 채널마다 따로 잘라 냅니다. 그래서 Chromium, Firefox, WebKit 모두에서 기본 `on-primary`가 흰색이 아니라 `#b8ffff`로, `error-container`는 연어색으로 그려졌습니다.

그래서 accent 롤과 error 롤은 색을 직접 sRGB 안으로 들여옵니다. 먼저 명도와 hue는 그대로 두고, 그 자리에서 sRGB가 담을 수 있는 채도를 추정해 OKLab에서 채도를 줄입니다. 그래도 남는 부분은 선형 sRGB 공간에서 같은 명도의 회색 쪽으로 옮깁니다. 이미 범위 안에 있는 색은 그대로 나옵니다. 기준 소스를 넣으면 컨테이너와 `on-` 롤이 머터리얼 값과 ΔE 0.02 안에 들어오고, `on-primary`, `on-secondary`, `on-tertiary`는 정확히 흰색이 됩니다.

::: fw react

`--mp-sys-color-*`로 직접 지정한 롤은 적은 그대로 씁니다.

:::

::: fw flutter

Flutter에는 중간에 브라우저가 없지만, Flutter 패키지도 Dart에서 같은 두 단계를 거쳐 스타일시트와 같은 색에 도달합니다. `copyWith`로 지정한 롤은 적은 그대로 씁니다.

:::

### `error`는 여러분의 색에서 파생되지 않습니다

머터리얼의 error 팔레트는 씨앗이 무엇이든 고정된 빨강이고, 여기서도 그렇습니다. 브랜드에 따라 hue가 움직이는 오류색은 오류로 읽히지 않게 됩니다.

## 기본값

기본 소스 색상은 깊은 azure, `#00639b`입니다.

머터리얼 자신의 baseline은 `#6750a4`인데, 라이브러리가 그것을 기본값으로 두는 것은 보기보다 큰 주장입니다. 보라는 누구도 우연히 도달하지 않는 유일한 hue라서, 아직 색을 정하지 않은 애플리케이션이 그 색을 **고른 것처럼** 보이게 됩니다.

azure는 hue만큼이나 **채도** 때문에 선택했습니다 — 0.118로 baseline의 0.130에 가깝고, 모든 롤이 채도를 거기서 가져가기 때문입니다. 더 선명한 파랑(구글의 `#0b57d0`은 0.199)은 스킴 전체를 어떤 레퍼런스 머터리얼 팔레트보다 밝게 끌어올려, 머터리얼이 아니라 브랜드로 읽히게 됩니다.

::: warning 소스 색상은 회색에 가까우면 안 됩니다

채도가 대략 0.05 아래로 내려가면 파생된 `primary`가 `outline`과 구분되지 않고, 포커스 링이 아무 변화도 아닌 것으로 읽힙니다. `#4a5c6a` 같은 슬레이트는 그럴듯한 중성 브랜드 색으로 보이지만 씨앗으로는 쓸 수 없습니다.

:::

## 바꾸기

### 소스 색상

::: fw react

`@theme` 안이 아니라 평범한 `:root`에 한 줄입니다. 라이브러리 기본값은 cascade layer 안에 선언되어 있고 레이어에 든 규칙은 레이어에 들지 않은 모든 규칙에 지므로, 여러분의 override는 `@import` 앞에 있든 뒤에 있든 이기고 순서를 신경 쓸 필요가 없습니다.

```css
@import 'material-plus-ui/styles.css';

:root {
  --mp-source-color: #7c3aed;
}
```

:::

::: fw flutter

위젯 하나입니다. 앱 위에 두거나, 앱의 어느 부분 위에 둡니다.

```dart
MPTheme(
  sourceColor: const Color(0xFF7C3AED),
  child: const App(),
)
```

스킴은 소스 색상과 밝기마다 한 번 생성해 재사용하므로, 서브트리가 다시 빌드돼도 파생을 다시 돌리지 않습니다.

:::

### 롤 하나

::: fw react

```css
:root {
  --mp-sys-color-outline: #d0d0d8;
}
```

:::

::: fw flutter

`colors`는 스킴 전체를 받고, 그 안의 롤 하나는 `copyWith`로 바꿉니다.

```dart
final Brightness brightness = MediaQuery.platformBrightnessOf(context);

return MPTheme(
  colors: MPColorScheme.fromSource(
    sourceColor: const Color(0xFF7C3AED),
    brightness: brightness,
  ).copyWith(outline: const Color(0xFFD0D0D8)),
  child: child,
);
```

`colors`로 넘긴 스킴은 받은 그대로 쓰이므로 밝기도 그 스킴이 정합니다. 라이트용으로 만든 스킴은 기기가 다크로 바뀌어도 라이트로 남습니다. 위처럼 `MediaQuery.platformBrightnessOf`로 만들면 플랫폼을 계속 따릅니다.

:::

일부 토큰 시스템과 달리 여기서 롤 하나를 덮는 것은 나머지 열한 개를 낡은 값으로 남기지 **않습니다.** 롤들은 서로에게서 파생된 트리가 아니라 씨앗에서 파생된 형제이기 때문입니다. `outline`을 지정하면 `outline`만 바뀝니다.

<Demo src="color/override" :flutter="false">

<<< @/.vitepress/demos/color/override.tsx

</Demo>

::: fw flutter

위 미리보기는 그 아래 소스로 React 패키지가 그린 것입니다. 같은 override를 Dart로 쓰면 위의 `copyWith` 호출입니다.

:::

### 루트만이 아니라 어디에나

:::: fw react

모든 토큰은 평범한 상속되는 커스텀 프로퍼티이고, 파생 롤은 `:root`가 아니라 `*`에 선언되어 있어서 각 엘리먼트가 자기 자리의 스코프로 다시 해석합니다.

```html
<section style="--mp-source-color: #00696d">…</section>
```

그것이 스코프 override가 애초에 동작하는 이유입니다. `var()`는 그 프로퍼티를 **선언한** 엘리먼트에서 치환되므로, `:root`에 한 번 선언된 롤은 거기서 확정됩니다 — 트리 아래에서 지정한 소스 색상이 조상의 값을 되돌릴 수 없고, `<html>`이 아니라 `<body>`에 붙은 `.dark`도 마찬가지입니다.

사용자가 런타임에 고른 색도 같은 메커니즘이고, 리렌더도 테마 재생성도 없습니다.

```tsx
<div style={{ '--mp-source-color': userColour } as React.CSSProperties}>
  <MPTextField … />
</div>
```

::: tip 값에 대한 주의사항 하나

파생에 상대 색상 문법을 쓰므로 소스는 **완전한 색상**이어야 합니다. `#7c3aed`, `oklch(0.49 0.24 292)`, `rgb(124 58 237)` 같은 것들입니다. 채널만 담은 디자인 토큰은 감싸야 합니다 — `var(--brand)`가 아니라 `hsl(var(--brand))`입니다.

:::

::::

::: fw flutter

`MPTheme`이 생략한 파라미터는 모두 위쪽 테마에서 물려받으므로, 안쪽 테마는 바꿀 것만 말하면 됩니다. 자기 브랜드 색을 가진 영역은 위젯 하나이고, 그 안의 테마는 색을 다시 말하지 않고 밝기만 바꿀 수 있습니다.

```dart
MPTheme(
  sourceColor: const Color(0xFF00696D),
  child: MPTheme(
    brightness: Brightness.dark,
    child: const PromoBanner(), // 영역의 청록색을 다크 스킴으로
  ),
)
```

사용자가 런타임에 고른 색은 새 `sourceColor`로 다시 빌드하면 됩니다. 최근에 생성한 스킴 32개를 보관하므로, 전에 쓴 색으로 돌아가면 다시 파생하지 않습니다.

:::

## 롤 값을 읽어 쓰기

::: fw react

직접 만든 마크업에 이 색을 쓰려면 Tailwind 쪽 이름을 읽거나, Tailwind를 쓴다면 유틸리티를 씁니다.

```css
.my-hint {
  color: var(--color-mp-on-surface-variant);
}
```

```html
<p class="text-mp-on-surface-variant">…</p>
```

비대칭에 주의하세요. **쓸 때는** `--mp-sys-color-*`, **읽을 때는** `--color-mp-*`입니다. 쓰는 쪽 이름은 기본적으로 비어 있는 override 슬롯이라 읽어도 아무것도 나오지 않고, 읽는 쪽 이름에 계산된 값이 담깁니다.

앞의 절반은 분명히 말해 둘 값이 있습니다. 읽었을 때 비어 있다는 사실이 사람을 엉뚱한 길로 보내기 때문입니다. **`--mp-sys-color-*`가 공개 API입니다.** 손대지 않은 페이지에서 `getComputedStyle(document.documentElement).getPropertyValue('--mp-sys-color-outline')`은 빈 문자열을 돌려줍니다. 덮어쓰라고 있는 슬롯인데 아무도 덮어쓰지 않았기 때문입니다. 그리고 빈 값으로 읽히는 토큰은 없는 토큰처럼 보입니다.

그때 손이 가는 잘못된 길이 `--color-mp-outline` 쪽인데, 그건 어디에 써도 되지 않습니다. 파생된 롤은 범위를 좁힌 override가 닿을 수 있도록 모든 엘리먼트에 선언되고, 그 말은 모든 엘리먼트가 자기 사본을 다시 선언한다는 뜻입니다. `:root { --color-mp-outline: … }`은 무엇이 읽기도 전에 그 아래 모든 엘리먼트에서 덮어써집니다. `--mp-sys-color-*` 슬롯에 쓰면 파생이 그 값을 아래로 실어 나릅니다.

:::

::: fw flutter

`MPTheme.of(context)`는 트리의 그 지점에서 적용 중인 테마를 모든 롤이 해석된 상태로 돌려줍니다.

```dart
final MPColorScheme colors = MPTheme.of(context).colors;

return Text('저장됨', style: TextStyle(color: colors.onSurfaceVariant));
```

`null`을 돌려주는 일은 없습니다. 위에 `MPTheme`이 없으면 플랫폼 밝기의 기본 스킴이고, 값을 물어본 위젯은 기기가 라이트와 다크를 오갈 때 다시 빌드됩니다. 누가 테마를 지정했는지 알아야 하는 위젯이라면 `null`을 돌려줄 수 있는 `MPTheme.maybeOf(context)`를 씁니다.

라이브러리 컴포넌트처럼 `color`를 받는 위젯을 직접 만든다면, `colors.accent(MPColor.tertiary)`가 그 계열의 롤 네 개를 한 번에 돌려줍니다. 색, 그 위의 잉크, 컨테이너, 컨테이너 위의 잉크입니다.

:::

## 이미 있는 머터리얼 환경과의 공존

::: fw react

[Material Web](https://material-web.dev)을 쓰는 프로젝트에는 이미 페이지에 `--md-sys-color-*`가 있습니다. Material Plus는 **그것을 읽기만 하고 절대 쓰지 않으므로**, 설정 없이 기존 스킴을 따르고 자기가 소유하지 않은 테마를 덮어쓸 수 없습니다.

| 지정한 것                            | 결과                         |
| ------------------------------------ | ---------------------------- |
| `--mp-sys-color-primary`             | 무조건 승리                  |
| `--md-sys-color-primary`가 이미 있음 | 그 값을 그대로 사용          |
| 둘 다 없음                           | `--mp-source-color`에서 파생 |

섞어 쓰는 것이 정상입니다. 가지고 있는 롤은 고정하고 나머지는 파생시키면 됩니다.

<Demo src="color/coexist" :flutter="false">

<<< @/.vitepress/demos/color/coexist.tsx

</Demo>

:::

::: fw flutter

Flutter 패키지는 Material을 import하지 않으므로 `MaterialApp`의 `ThemeData`에서 아무것도 읽지 않고, 거기에 쓰지도 않습니다. 이미 Material `ColorScheme`이 있는 앱이 둘을 맞추고 싶다면, 앱 코드에서 롤을 이름으로 한 번 넘겨줍니다.

```dart
final ColorScheme scheme = Theme.of(context).colorScheme; // 앱의 Material 스킴

return MPTheme(
  colors: MPColorScheme.fromSource(
    sourceColor: scheme.primary,
    brightness: scheme.brightness,
  ).copyWith(
    primary: scheme.primary,
    onPrimary: scheme.onPrimary,
    surface: scheme.surface,
  ),
  child: child,
);
```

웹과 같은 방식입니다. 고정한 롤은 무조건 이기고, 나머지는 소스 색상에서 파생됩니다.

:::

## 다크 모드

::: fw react

설정할 것이 없습니다 — `prefers-color-scheme`을 스스로 따릅니다. 직접 제어하려면 아무 엘리먼트에나 속성이나 클래스를 붙입니다.

```html
<html data-mp-scheme="dark">
  <!-- … -->
</html>
```

Tailwind의 `dark:` 변형이 기준으로 삼는 `.dark`도 동작합니다. `[data-mp-scheme='light']`는 시스템 설정이 다크인 페이지 안에서도 해당 서브트리를 라이트로 되돌립니다.

:::

::: fw flutter

설정할 것이 없습니다. 위쪽 어디에도 `brightness`가 없으면 컴포넌트는 `MediaQuery.platformBrightness`를 따르고, 그 값이 바뀌면 다시 그려집니다. 직접 제어하려면 테마에 지정합니다. `MPTheme`이 정하는 다른 모든 것처럼 서브트리에 적용됩니다.

```dart
MPTheme(brightness: Brightness.dark, child: const EditorPanel())
```

`brightness: Brightness.light`는 다크 안에서도 해당 서브트리를 라이트로 되돌립니다.

:::

## 다음

- [Prop 규약](./prop-conventions) — `size`와 나머지 공유 prop이 뜻하는 것.
- [시작하기](../guide/getting-started) — 설치, 스타일시트, 그리고 나머지 토큰.
