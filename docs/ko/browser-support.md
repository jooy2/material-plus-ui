---
title: 브라우저 지원
order: 2
---

# 브라우저 지원

<p class="mp-lede">Material Plus는 데스크톱과 모바일의 <strong>Chrome·Edge 111, Firefox 113, Safari 16.4</strong> 이상에서 동작합니다. 이 버전들의 엔진으로 이 사이트의 데모를 전부 실행해 확인했습니다. 오래된 버전에서는 몇몇 효과가 줄어들고, 무엇이 줄어드는지는 아래 표에 정리했습니다.</p>

## 최소 버전

| 브라우저                   | 최소 버전 | 출시       |
| -------------------------- | --------- | ---------- |
| Chrome, Android용 Chrome   | 111       | 2023년 3월 |
| Edge                       | 111       | 2023년 3월 |
| Firefox, Android용 Firefox | 113       | 2023년 5월 |
| Safari, iOS Safari         | 16.4      | 2023년 3월 |
| 삼성 인터넷                | 22        | 2023년 7월 |

두 설치 방식의 하한은 같습니다. `material-plus-ui/styles.css`와 `material-plus-ui/tailwind.css`에 같은 토큰 시트가 들어 있습니다.

## 하한을 정하는 것

| 요구 사항 | Chrome, Edge | Firefox | Safari | 이것에 기대는 부분 |
| --- | --- | --- | --- | --- |
| Base UI 1 | 111 | 113 | 16.4 | 포커스, 키보드, 팝업 동작. Base UI의 브라우저 목록 기준입니다 |
| `oklch()` 색상 | 111 | 113 | 15.4 | 아래에서 설명하는 폴백 롤을 포함한 모든 색상 토큰 |
| `@layer` | 99 | 97 | 15.4 | 토큰이 들어 있는 캐스케이드 레이어 |
| 패키지의 JavaScript | 85 | 79 | 14.1 | ES2021까지의 문법. 트랜스파일하지 않고 배포합니다 |

하한은 열마다 가장 큰 숫자입니다. React 18과 19는 마지막 행보다 새로운 기능을 요구하지 않습니다.

Tailwind CSS v4는 등록된 커스텀 프로퍼티에 기대기 때문에 자체 하한을 Firefox 128로 밝힙니다. 그 프로퍼티를 쓰는 유틸리티에는 폴백이 들어 있고, 데모는 Firefox 113에서 다음 절의 차이만 보이고 렌더됩니다.

하한보다 낮은 브라우저는 지원하지 않습니다. Chrome 111, Firefox 113, Safari 15.4보다 오래된 브라우저에서는 색상 토큰이 아예 그려지지 않습니다. 토큰이 `oklch()` 색상이기 때문입니다.

## 오래된 버전에서 줄어드는 것

아래 항목은 모두 계속 동작합니다. 보이거나 움직이는 모습만 달라지고, 적힌 버전에서만 그렇습니다.

| 기능 | 줄어드는 버전 | 그 버전에서 보이는 모습 |
| --- | --- | --- |
| `--mp-source-color`로 바꾸는 테마 | 119 미만 Chrome·Edge, 128 미만 Firefox, 18 미만 Safari | 기본 스킴이 라이트든 다크든 그대로 그려집니다. `--mp-sys-color-*`로 지정한 롤은 적용됩니다 |
| [`MPAnimateCounter`](./components/transitions/animate-counter)의 숫자 세기 | 128 미만 Firefox | 숫자가 세어 올라가지 않고 값으로 바로 바뀝니다 |
| [`MPAnimateLighting`](./components/transitions/animate-lighting)의 움직이는 빛 | 128 미만 Firefox, Safari 16.4 | 빛은 그려지지만 테두리를 따라 움직이지 않습니다 |
| [`MPRating`](./components/inputs/rating)의 포커스 링 | 121 미만 Firefox | 키보드로 도착한 별뿐 아니라 포인터로 누른 별에도 링이 그려집니다 |
| 텍스트 효과가 글자와 단어를 나누는 방식 | 125 미만 Firefox | 코드 포인트와 공백으로 나누므로, 합쳐진 이모지가 쪼개지고 공백 없는 문장은 한 단어로 취급됩니다 |
| [`MPPill`](./components/display/pill)의 한 단계 옅은 설명 | 17 미만 Safari | 설명이 제목과 같은 색으로 그려집니다 |
| 스크롤 기반 애니메이션, [Animate 컴포넌트](./components/transitions/animate-fade#스크롤이-곧-시계입니다)의 `timeline="view"` | 115 미만 Chrome·Edge, Firefox, 26 미만 Safari | 효과가 시간 기준으로 한 번 재생됩니다 |
| `Intl.Locale`의 주 정보 | 153 미만 Firefox | `weekStartsOn`을 지정하지 않으면 달력이 일요일부터 시작합니다 |

## 색상 롤이 오래된 브라우저에 도달하는 방식

`primary` 같은 롤은 고정된 색이 아닙니다. 브라우저가 요소마다, 그 위치에서 유효한 `--mp-source-color`로 계산합니다:

```css
oklch(from var(--mp-source-color) var(--tone) var(--chroma) h)
```

그래서 섹션 하나에 `--mp-source-color`를 지정하면 그 섹션의 테마만 바뀌고, 인라인 스타일로 런타임에 바꿀 수도 있습니다. 파생 방식은 [색상](./design/color#롤이-파생되는-방식)에, accent 롤과 error 롤을 sRGB 안으로 들여오는 방식은 [sRGB 안으로](./design/color#srgb-안으로)에 있습니다. 두 번째 단계는 상대 색상의 채널에 `clamp()`와 `min()`을 쓰고, 이것이 스타일시트가 기대는 가장 새로운 기능입니다. 그래서 이 기능이 없는 브라우저(119 미만 Chrome·Edge, 128 미만 Firefox, 18 미만 Safari)를 위해 기본 스킴 전체를 평범한 색으로 한 번 더 적어 둡니다. Safari 16.4부터 17.6까지는 명세의 이전 초안을 따른 상대 색상 문법을 지원하지만, 그 초안은 둘 다 받지 않습니다.

이 브라우저들에서는 색이 라이트든 다크든 기본 스킴 그대로이고, 직접 지정한 `--mp-source-color`는 아무것도 바꾸지 않습니다. 색에서 hue를 읽어 내는 일이 바로 이 브라우저들이 못 하는 일이기 때문입니다. 현재 문법을 지원하는 브라우저는 그 사본을 건너뜁니다. MDN 데이터로는 Chrome·Edge 119부터 121까지도 지원하지만, 이 세 버전은 측정에 쓴 macOS에서 시작되지 않아 실행하지 못했습니다.

### 오래된 브라우저에서 테마 바꾸기

직접 지정한 롤은 모든 브라우저에서 이깁니다. 각 롤은 파생이나 폴백보다 먼저 `--mp-sys-color-*`를, 그다음 Material Web의 `--md-sys-color-*`를 읽기 때문입니다:

```css
:root {
  --mp-sys-color-primary: #00639b;
  --mp-sys-color-on-primary: #ffffff;
  /* …바꾸려는 나머지 롤 */
}
```

그러니 Chrome 111부터 118, Firefox 113부터 127, Safari 16.4부터 17.6에서도 브랜드 색이 보여야 한다면 롤을 이렇게 지정하고, 쓰는 스킴마다 한 번씩 적어 줍니다. 변수 이름은 [롤 하나](./design/color#롤-하나)에 있습니다.

## 숫자를 찾은 방법

이 사이트의 데모를 전부 한 페이지에 각각 에러 바운더리로 감싸 렌더하고, Playwright가 빌드한 Chromium 111, Firefox 113·127·128, WebKit 16.4·17.4·18.0과 Chrome for Testing 122에서 열었습니다. 버전마다 렌더 오류와 페이지 오류를 확인하고, 두 스킴의 색상 롤 29개를 현재 Chromium의 값과 비교했습니다. 가장 오래된 세 버전에서는 select부터 command palette까지 팝업 아홉 개를 열어 봤고, 카운터와 조명 효과, 별점 포커스 링은 표에 적힌 버전에서 확인했습니다. WebKit 빌드는 Safari 자체가 아니라, 이름에 붙은 Safari 버전 시점의 엔진을 Playwright가 빌드한 것입니다.

그 사이의 버전은 실행하지 않았습니다. 그 버전들과, 위의 요구 사항과 기능이 각각 어느 버전에서 들어왔는지는 [MDN 브라우저 호환성 데이터](https://github.com/mdn/browser-compat-data)와 Base UI, Tailwind CSS가 직접 밝힌 내용에서 가져왔습니다. 테스트 스위트는 Linux, Windows, macOS에서 Chromium, Firefox, WebKit의 현재 릴리스로 실행합니다.

## 다음

- [색상](./design/color) — 롤이 파생되는 방식과 롤을 직접 지정하는 방법.
- [시작하기](./guide/getting-started) — 설치와 설정.
- [변경 기록](./changelog) — 릴리스마다 바뀐 것.
