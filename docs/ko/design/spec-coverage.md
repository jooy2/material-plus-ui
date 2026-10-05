---
title: 명세 지원 범위
order: 5
---

# 명세 지원 범위

<p class="mp-lede">이 라이브러리가 어느 머터리얼 디자인을 구현하는지, 그중 얼마나 구현하는지, 어디서 더 나아가는지, 그리고 Material UI와 비교하면 어떤지 정리합니다. 모든 행은 Material Plus 1.10.0의 소스에서 읽었고, 2026년 10월에 공개된 명세와 Material UI의 API 페이지로 확인했습니다.</p>

## 요약

- **Material Design 3의 기본 명세를 구현합니다.** 토큰의 이름과 값이 M3의 것입니다. 소스 색 하나에서 만드는 색 역할 29개, 타입 역할 15개 중 13개, 모서리 단계, 다섯 단계의 높이, 상태 레이어 불투명도, standard와 emphasized 이징 곡선이 들어 있습니다. 명세가 정의한 컴포넌트는 대부분 있습니다. 일부만 구현한 것과 아예 없는 것도 있으며, 둘 다 아래에 적었습니다.
- **M3 Expressive는 구현하지 않습니다.** Expressive의 기반은 하나도 없습니다. 스프링 기반 모션, emphasized 타입, 확장된 모서리 단계, 도형 라이브러리, 도형 모핑이 모두 빠져 있습니다. Expressive가 새로 낸 컴포넌트도 없습니다. split button, FAB 메뉴, 툴바, loading indicator, 물결 모양 진행 표시기가 그렇습니다. 우연히 겹치는 부분은 몇 가지 있습니다. 버튼 높이 32, 40, 56px은 Expressive의 XS, S, M과 같고, 토글 버튼이 있으며, 버튼 그룹은 connected 형태로 그립니다.
- **명세보다 두 방향으로 더 나아갑니다.** 명세에 있는 컴포넌트에는 다섯 단계 크기 사다리, 밀도 단계, 더 많은 `variant`, 강조 색 계열 네 개, `loading` 같은 상태가 붙습니다. 그 옆에 명세에 없는 컴포넌트가 아흔 개쯤 있고, 차트와 데이터 테이블과 커맨드 팔레트가 여기에 들어갑니다.
- **Material UI는 Material Design 2를 구현합니다.** 공식 문서가 그렇게 밝히고 있고, 2021년에 열린 M3 도입 이슈는 보류 상태로 아직 열려 있습니다. 그래서 아래 표의 Material UI 열은 이 라이브러리의 예전 버전이 아니라, 다른 디자인 시스템이 같은 필요에 내놓은 답입니다.

구글도 Expressive를 지원하는 웹 구현은 내놓지 않았습니다. Material Web은 2024년 6월부터 유지보수 모드이고, 명세의 웹 페이지는 Expressive가 웹에 구현되어 있지 않다고 밝힙니다.

## 표 읽는 법

**정의한 곳** 열은 기능이 어디서 왔는지 알려 줍니다.

| 정의한 곳                  | 뜻                                                      |
| -------------------------- | ------------------------------------------------------- |
| `M3`                       | Expressive 이전에 공개된 Material Design 3 명세입니다.  |
| `Expressive`               | 2025년 5월부터 M3 Expressive가 더하거나 바꾼 것입니다.  |
| `M3 (Expressive에서 대체)` | 명세에 아직 있지만 Expressive가 더는 권장하지 않습니다. |
| `Material Plus`            | 명세에 없고, 이 라이브러리가 더한 것입니다.             |

마지막 두 열은 체크리스트입니다. **✓**는 지원, **부분**은 빠진 것을 함께 적은 부분 지원, **—**는 미지원입니다. Material UI는 `@mui/material` 9.4.0을 뜻합니다. 답이 MUI X에 있는 경우에는 행에 그렇게 적고 라이선스 등급도 밝혔습니다. 날짜 범위 선택기, 히트맵, 데이터 그리드의 일부 기능이 유료이기 때문입니다.

`M3` 행인데 Material Plus 열이 **—**이면 이 라이브러리에 빠진 기능입니다. `Material Plus` 행은 이 라이브러리가 더한 기능입니다.

## 기반

### 색

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 소스 색 하나로 배색 전체를 생성 | M3 | ✓ `--mp-source-color` | — (색마다 `main`을 정하고 `light`, `dark`를 거기서 띄움) |
| HCT 톤 팔레트 | M3 | 부분: M3 기본 배색에 맞춘 OKLCh 근사 | — |
| 라이트와 다크를 한 팔레트의 두 톤으로 읽기 | M3 | ✓ | 부분: 스킴마다 팔레트를 따로 두는 `colorSchemes` |
| `primary`, `secondary`, `tertiary`와 `-container`, `on-` 역할 | M3 | ✓ | 부분: `primary`, `secondary`만 있고 tertiary와 container가 없음 |
| 소스와 무관하게 고정된 `error` 계열 | M3 | ✓ | ✓ `error` |
| `surface`와 surface container | M3 | 부분: `surface`, `-low`, 기본, `-high`, `-highest`. `-lowest`, `-dim`, `-bright`는 없음 | — (`background.default`, `background.paper`) |
| `outline`, `outline-variant` | M3 | ✓ | — (`divider`) |
| `inverse-surface`, `inverse-on-surface`, `inverse-primary` | M3 | ✓ | — |
| `scrim` | M3 | ✓ | — |
| fixed, fixed-dim 역할 | M3 | — | — |
| 배색 변형(tonal spot, vibrant, expressive 등) | M3 | — | — |
| standard, medium, high 대비 단계 | M3 | — | 부분: 9.1부터 `enhanceHighContrast` 헬퍼 |
| 이미지에서 뽑는 동적 색 | M3 | — | — |
| 페이지에 이미 있는 `--md-sys-color-*` 토큰 읽기 | Material Plus | ✓ | — |
| 하위 트리 하나만 다른 소스 색이나 스킴으로, CSS만으로 | Material Plus | ✓ | 부분: `ThemeProvider` 중첩 |
| 차트 팔레트: 범주 슬롯 8개, 5단계 순차 램프 | Material Plus | ✓ | 부분: MUI X Charts에 자체 팔레트 |

`success`, `info`, `warning` 계열은 일부러 두지 않았습니다. M3에 그런 역할이 없어서 토큰 시트가 만들어 낼 방법이 없기 때문입니다. [색상](./color.md)을 참고하세요.

### 타이포그래피, 모양, 높이

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| display부터 label까지 타입 역할 15개 | M3 | 부분: 13개. `display-large`, `display-medium`은 없음 | — (MD2 단계: `h1`–`h6`, `subtitle`, `body`, `caption`) |
| emphasized 타입 역할 15개 | Expressive | — | — |
| 컨트롤이 작아지면 타입 단계도 내려감 | Material Plus | ✓ | — |
| 모서리 단계: extra-small 4, small 8, medium 12, large 16, extra-large 28, full | M3 | ✓ | 부분: `shape.borderRadius` 하나, 기본 4px |
| 모서리 large-increased 20, extra-large-increased 32, extra-extra-large 48 | Expressive | — | — |
| 도형 35개 라이브러리와 도형 모핑 | Expressive | — | — |
| 하위 트리 단위의 `rounded`, `sharp` 모서리 프리셋 | Material Plus | ✓ `data-mp-shape` | — |
| 높이 0–5단계 | M3 | ✓ | 부분: MD2의 0–24 |
| 높이에 따라 그림자와 함께 표면 톤도 바뀜 | M3 | ✓ | — (다크 모드에서 MD2식 흰 오버레이) |

### 상태, 모션, 레이아웃

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 상태 레이어: hover 8%, focus 10%, pressed 10% | M3 | ✓ | 부분: MD2 불투명도 |
| dragged 16% | M3 | 부분: 슬라이더에만 | — |
| 누를 때의 리플 | M3 | — (평평한 10% 레이어) | ✓ |
| 비활성: 내용 38%, 컨테이너 12% | M3 | ✓ | ✓ |
| standard, emphasized 이징 곡선 | M3 | ✓ 여섯 개 모두와 linear | — (MD2 곡선) |
| 지속 시간 토큰 | M3 | 부분: 16개 중 6개 | 부분: MD2 지속 시간 |
| 스프링 모션: spatial과 effects, expressive와 standard 스킴 | Expressive | — | — |
| 모든 컴포넌트에서 `prefers-reduced-motion` 반영 | Material Plus | ✓ | ✓ 9.1부터 |
| 창 크기 클래스 compact, medium, expanded | M3 | ✓ 600, 840 | — (자체 기준 600, 900, 1200, 1536) |
| 창 크기 클래스 large, extra-large | M3 | ✓ 1200, 1600 | — |
| 밀도 0부터 −3까지 | M3 | ✓ 컨테이너에 | 부분: 컴포넌트마다 `dense`, `size="small"` |
| 모든 컨트롤에 다섯 크기, `md`는 명세 크기 | Material Plus | ✓ `xs`부터 `xl`까지 | 부분: `small`, `medium`, 일부에 `large` |

## 액션

### 버튼

[`MPButton`](../components/inputs/button)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| elevated, filled, tonal, outlined, text | M3 | ✓ | 부분: `contained`, `outlined`, `text` |
| 앞뒤 아이콘 | M3 | ✓ `startIcon`, `endIcon` | ✓ |
| 높이 40dp | M3 | ✓ `sm` | — (약 37px) |
| 크기 XS 32, S 40, M 56 | Expressive | ✓ `xs`, `sm`, `md`(기본값은 `md`) | — |
| 크기 L 96, XL 136 | Expressive | — (`lg`, `xl`은 64와 72) | — |
| 둥근 모양과 각진 모양 | Expressive | — | — |
| 누를 때와 선택될 때의 모양 모핑 | Expressive | — | — |
| 토글 버튼 | Expressive | ✓ [`MPToggle`](../components/inputs/toggle) | 부분: MD2 모양의 `ToggleButton` |
| 크기 64, 72 | Material Plus | ✓ `lg`, `xl` | 부분: `small`, `medium`, `large`(31–42px) |
| `secondary`, `tertiary`, `error` 계열 | Material Plus | ✓ | 부분: `secondary`, `error`와 `success`, `info`, `warning` |
| `loading` | Material Plus | ✓ | ✓ 6.4부터 |
| 링크나 라우터 컴포넌트로 렌더링 | Material Plus | ✓ `render` | ✓ `href`, `component` |

### 아이콘 버튼

[`MPIconButton`](../components/inputs/icon-button). 토글 형태는 아이콘만 넣은 [`MPToggle`](../components/inputs/toggle)입니다.

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| standard, filled, tonal, outlined | M3 | ✓ (`text`가 standard) | 부분: 스타일 하나에 `color`로 색만 바꿈 |
| 토글(선택) 아이콘 버튼 | M3 | ✓ `MPToggle`로 | 부분: `ToggleButton` |
| 크기 32, 40, 56 | Expressive | ✓ `xs`, `sm`, `md` | — |
| 크기 96, 136 | Expressive | — | — |
| 너비 narrow, default, wide | Expressive | — | — |
| 둥근 모양과 각진 모양, 누를 때 모핑 | Expressive | — | — |
| 크기 64, 72와 `elevated` 스타일 | Material Plus | ✓ | — |
| `loading` | Material Plus | ✓ | ✓ |

### FAB와 확장 FAB

[`MPFloatingActionButton`](../components/inputs/floating-action-button)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| FAB, 56dp | M3 | ✓ `md` | ✓ 기본값인 `size="large"` |
| 큰 FAB, 96dp | M3 | ✓ `xl` | — |
| 작은 FAB, 40dp | M3 (Expressive에서 대체) | ✓ `xs` | ✓ `size="small"` |
| 중간 FAB, 80dp | Expressive | — (`lg`는 72) | — |
| 확장 FAB | M3 | ✓ `extended`, 애니메이션 포함 | ✓ `variant="extended"` |
| 확장 FAB 소·중·대(56, 80, 96) | Expressive | 부분: 모든 단계에서 `extended` 가능, 80dp 단계는 없음 | — (34–48px) |
| 컨테이너 색: primary, secondary, tertiary | M3 | ✓ `tonal` | — |
| 단색: primary, secondary, tertiary | Expressive | ✓ `filled` | 부분: `primary`, `secondary`, MD2 의도 색 |
| surface FAB | M3 (Expressive에서 대체) | ✓ `elevated` | — |
| lowered FAB | M3 | — | — |
| FAB 메뉴 | Expressive | — | 부분: MD2 패턴인 `SpeedDial` |
| 모서리에 고정, 오프셋, RTL 대응 | Material Plus | ✓ `position`, `corner`, `offset` | — |

### 버튼 그룹

[`MPButtonGroup`](../components/inputs/button-group). 선택할 수 있는 형태는 [`MPToggleGroup`](../components/inputs/toggle)입니다.

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| connected 그룹: 2dp 간격, 안쪽 모서리를 깎음 | Expressive | ✓ | 부분: 테두리를 공유하는 `ButtonGroup` |
| standard 그룹: 누르면 이웃이 자리를 내줌 | Expressive | — | — |
| 안쪽 모서리 모핑, 선택되면 둥글어짐 | Expressive | — | — |
| 단일 선택과 다중 선택 | Expressive | ✓ `MPToggleGroup` | ✓ `ToggleButtonGroup` |
| 선택 필수 | Expressive | — | — |
| 세로 방향 | Material Plus | ✓ | ✓ |
| 자식 전체에 `variant`, `size`, `color` 한 번에 적용 | Material Plus | ✓ | ✓ |

### 세그먼트 버튼

[`MPSegmentedButton`](../components/inputs/segmented-button). Expressive는 이 컴포넌트를 더는 권장하지 않고, 위의 connected 버튼 그룹을 쓰라고 안내합니다.

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 단일 선택과 다중 선택 | M3 (Expressive에서 대체) | ✓ | ✓ `ToggleButtonGroup` |
| 아이콘, 레이블, 선택 시 체크 표시 | M3 (Expressive에서 대체) | ✓ `showCheck` | 부분: 체크 표시 없음 |
| 높이 40dp | M3 (Expressive에서 대체) | ✓ `md` | — |
| 밀도 | M3 (Expressive에서 대체) | — | 부분: `size` |
| 다섯 크기 | Material Plus | ✓ | 부분: 세 크기 |

## 커뮤니케이션

### 배지

[`MPBadge`](../components/display/badge)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 작은 배지, 6dp 점 | M3 | ✓ `dot` | ✓ `variant="dot"` |
| 숫자를 담는 큰 배지, `+`로 상한 표시 | M3 | ✓ `max`, 기본 99 | ✓ `max`, 기본 99 |
| 다섯 `variant`와 다섯 크기 | Material Plus | ✓ | — |
| 네 계열 중 아무것이나, 기본값은 `error` | Material Plus | ✓ | ✓ |
| 네 모서리 배치, 사각형·원형 겹침 | Material Plus | ✓ `placement`, `overlap` | ✓ `anchorOrigin`, `overlap` |

### 진행 표시기

[`MPProgressLinear`](../components/feedback/progress-linear), [`MPProgressCircular`](../components/feedback/progress-circular)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 선형과 원형 | M3 | ✓ | ✓ |
| 확정과 불확정 | M3 | ✓ | ✓ |
| 4dp 트랙 | M3 | ✓ `md` | ✓ |
| 표시기와 트랙 사이 간격, 끝 정지점(2023년) | M3 | — | — |
| `secondary-container` 색 트랙 | M3 | — (12%의 `on-surface`) | — |
| 물결 모양 | Expressive | — | — |
| 트랙 두께를 따로 설정 | Expressive | 부분: `size`를 따라감 | 부분: 원형에 `thickness` |
| 다섯 크기, 레이블, 서식을 적용한 값 | Material Plus | ✓ | 부분: 원형에 `size` |

### 스낵바

[`MPSnackbar`](../components/feedback/snackbar)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 48dp 한 줄, inverse 표면 | M3 | ✓ `md` | 부분: MD2 모양 |
| 두 줄 | M3 | 부분: 글이 줄바꿈될 뿐 68dp 단계는 없음 | ✓ |
| 액션 하나 | M3 | ✓ `actionLabel` | ✓ `action` |
| 닫기 아이콘 | M3 | ✓ 기본으로 켜짐 | 부분: `action`으로 |
| 긴 액션을 별도 줄에 배치 | M3 | — | — |
| 대기열, 화면에 최대 세 개 | Material Plus | ✓ `limit` | — (문서가 notistack을 안내) |
| 위치 여섯 곳 | Material Plus | ✓ | ✓ `anchorOrigin` |
| 강조 색, `promise`, `update` | Material Plus | ✓ | — |

### 툴팁

[`MPTooltip`](../components/feedback/tooltip)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| plain 툴팁 | M3 | ✓ | ✓ |
| rich 툴팁: 제목, 본문, 액션 최대 두 개 | M3 | — ([`MPHoverCard`](../components/feedback/hover-card)와 [`MPPopover`](../components/feedback/popover)가 대신함) | 부분: `title`에 아무 노드나 넣을 수 있음 |
| 화살표 | Material Plus | ✓ 기본으로 켜짐 | ✓ `arrow` |
| 다섯 크기, 강조 색 판 | Material Plus | ✓ | — |

## 컨테이너

### 카드

[`MPCard`](../components/layout/card)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| elevated, filled, outlined | M3 | ✓ | 부분: `elevation`과 `outlined`, filled는 없음 |
| 12dp 모서리 | M3 | ✓ | — (4px) |
| 미디어, 헤드라인, 서브헤드, 보조 텍스트, 액션 | M3 | ✓ 슬롯으로 | ✓ `CardMedia`, `CardHeader`, `CardContent`, `CardActions` |
| 상태가 있는 누를 수 있는 카드 | M3 | — (설계상 누를 수 없음) | ✓ `CardActionArea` |
| `tonal`, `text` 변형, 밀도, 높이 0–5 | Material Plus | ✓ | 부분: 높이 0–24 |

### 캐러셀

[`MPCarousel`](../components/layout/carousel)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| multi-browse, uncontained, hero, center-aligned hero | M3 | — | — |
| full-screen: 한 화면에 항목 하나 | M3 | ✓ | — |
| 항목 모서리 28dp, 간격 8dp, 패럴랙스 | M3 | — | — |
| 화살표, 점, 자동 재생, 반복 | Material Plus | ✓ | — |

### 다이얼로그

[`MPDialog`](../components/feedback/dialog)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 기본 다이얼로그: 아이콘, 헤드라인, 보조 텍스트, 액션 | M3 | ✓ | 부분: 아이콘 슬롯 없음 |
| 모서리 28dp, 높이 3, 너비 280–560dp | M3 | 부분: `md`에서 560, 최소 280은 없음 | — (MD2 모서리와 너비) |
| 전체 화면 다이얼로그 | M3 | 부분: 닫기와 확인이 있는 상단 바 없음 | ✓ `fullScreen` |
| 너비 사다리, 닫기 버튼, 닫을 수 없는 다이얼로그 | Material Plus | ✓ | ✓ `maxWidth` |

### 시트

[`MPDrawer`](../components/layout/drawer)가 가장자리 한쪽에서 두 종류의 시트를 모두 그립니다. 이름이 시트인 컴포넌트는 없습니다.

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 모달 바텀 시트 | M3 | 부분: `side="bottom"`. 드래그 핸들, 스와이프, 640dp 상한이 없음 | 부분: 아래쪽에 붙인 `Drawer`나 `SwipeableDrawer` |
| 스탠더드 바텀 시트 | M3 | — | 부분: persistent `Drawer` |
| 모달 사이드 시트 | M3 | 부분: `side="right"` | 부분: `Drawer anchor="right"` |
| 스탠더드 사이드 시트 | M3 | 부분: `mode="standard"` | 부분: persistent `Drawer` |
| 위쪽 가장자리에서 나오는 시트 | Material Plus | ✓ | ✓ `anchor="top"` |

### 리스트

[`MPList`](../components/display/list)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 한 줄, 두 줄 항목 | M3 (Expressive에서 대체) | ✓ (`md`에서 두 줄 행은 72가 아니라 76px) | ✓ |
| 세 줄 항목 | M3 (Expressive에서 대체) | — | 부분: 보조 텍스트가 줄바꿈됨 |
| 앞쪽 아이콘이나 아바타, 뒤쪽 아이콘이나 컨트롤 | M3 (Expressive에서 대체) | ✓ `startIcon`, `endIcon`, `action` | ✓ |
| 오버라인, 뒤쪽 보조 텍스트 | M3 (Expressive에서 대체) | — | 부분: `secondaryAction` |
| Expressive 리스트: segmented 스타일, 선택 모드, 모양 모핑, 펼치기 | Expressive | — | — |
| 링크나 버튼인 행, 밀도, 구분선 | Material Plus | ✓ | ✓ `selected`, `dense`, `divider` |

### 구분선

[`MPDivider`](../components/display/divider)

| 기능                | 정의한 곳     | Material Plus | Material UI                     |
| ------------------- | ------------- | ------------- | ------------------------------- |
| 전체 너비           | M3            | ✓             | ✓                               |
| inset, middle-inset | M3            | —             | ✓ `variant="inset"`, `"middle"` |
| 세로                | M3            | ✓             | ✓                               |
| 선 가운데 레이블    | Material Plus | ✓             | ✓                               |

## 내비게이션

### 앱 바

[`MPHeader`](../components/layout/header)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| small 앱 바, 64dp | M3 | ✓ `md` | 부분: `AppBar`와 `Toolbar`, 56 또는 64px |
| 가운데 정렬 제목 | M3 | ✓ `align="center"` | — |
| medium(112dp), large(152dp) 앱 바 | M3 (Expressive에서 대체) | — | 부분: "prominent" 데모 |
| 스크롤하면 표면이 채워지고, 바가 접힘 | M3 | — (`tonal`이 늘 스크롤된 상태의 색) | 부분: `useScrollTrigger` 데모 |
| 부제목 | Expressive | — | — |
| medium, large flexible 앱 바 | Expressive | — | — |
| 검색 앱 바 | Expressive | — | 부분: 검색 필드 데모 |
| 다섯 높이, 가운데 슬롯, 최대 너비 | Material Plus | ✓ | 부분: `variant="dense"` |

### 내비게이션 바

[`MPBottomNavigation`](../components/layout/bottom-navigation), [`MPFloatingBottomNavigation`](../components/layout/floating-bottom-navigation)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 80dp 바, 64×32dp 알약 표시기 | M3 (Expressive에서 대체) | ✓ `md` | 부분: 알약 없는 `BottomNavigation` |
| 레이블을 모두, 선택된 항목만, 또는 숨김 | M3 (Expressive에서 대체) | ✓ `labels` | 부분: `showLabels` |
| 항목의 배지 | M3 (Expressive에서 대체) | — (배지 슬롯 없음) | 부분: 아이콘을 `Badge`로 감쌈 |
| flexible 바: 64dp, medium 창에서 항목을 가로로 배치 | Expressive | — | — |
| 가장자리에서 떨어져 뜬 바 | Material Plus | ✓ `MPFloatingBottomNavigation` | — |
| 다섯 크기, safe area 여백, 라우터 링크 | Material Plus | ✓ | — |

### 내비게이션 드로어

[`MPSidebar`](../components/layout/sidebar), [`MPDrawer`](../components/layout/drawer). 둘 사이의 전환은 [`MPPageLayout`](../components/layout/page-layout)이 맡습니다.

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 스탠더드 드로어, 360dp | M3 (Expressive에서 대체) | ✓ `md`의 `MPSidebar` | ✓ `permanent`나 `persistent` `Drawer` |
| 모달 드로어 | M3 (Expressive에서 대체) | ✓ `MPDrawer`, 또는 브레이크포인트 아래의 `MPSidebar` | ✓ `variant="temporary"` |
| 안쪽의 활성 표시기, 섹션 제목, 배지 | M3 (Expressive에서 대체) | 부분: `MPList`처럼 넣은 내용으로 구성 | 부분: `List`로 구성 |
| 창 크기 클래스 아래에서 모달로 전환 | Material Plus | ✓ `collapseBelow` | 부분: "responsive drawer" 데모 |
| 크기 조절, 앞쪽이나 뒤쪽에 배치 | Material Plus | ✓ | — |

### 탭

[`MPTabs`](../components/layout/tabs)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| primary, secondary 탭 | M3 | ✓ `variant` | — (스타일 하나) |
| 고정, 스크롤 | M3 | ✓ `fullWidth`, 기본은 스크롤 | ✓ `variant` |
| 레이블 위나 옆의 아이콘 | M3 | ✓ `iconPosition` | ✓ `iconPosition` |
| 탭의 배지 | M3 | — (탭 밖으로 나온 부분이 잘림) | 부분: 레이블을 감쌈 |
| 다섯 크기, 네 계열 | Material Plus | ✓ | 부분: `primary`, `secondary` |

## 선택

### 체크박스

[`MPCheckbox`](../components/inputs/checkbox)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 선택, 해제, 미정 | M3 | ✓ | ✓ |
| 오류 상태 | M3 | ✓ `errorMessage`로 | 부분: `color="error"` |
| 18dp 상자, 40dp 상태 레이어 | M3 | ✓ `md` | 부분: MD2 크기 |
| 레이블과 설명 내장 | Material Plus | ✓ | 부분: `FormControlLabel`, `FormHelperText` |
| 다섯 크기, 네 계열 | Material Plus | ✓ | 부분: 두 크기 |

### 라디오 버튼

[`MPRadioGroup`](../components/inputs/radio-group)

| 기능                           | 정의한 곳     | Material Plus | Material UI                   |
| ------------------------------ | ------------- | ------------- | ----------------------------- |
| 20dp 라디오, 40dp 상태 레이어  | M3            | ✓ `md`        | 부분: MD2 크기                |
| 레이블, 오류, 방향을 가진 그룹 | Material Plus | ✓             | ✓ `RadioGroup`, `FormControl` |
| 다섯 크기, 네 계열             | Material Plus | ✓             | 부분: 두 크기                 |

### 스위치

[`MPSwitch`](../components/inputs/switch)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 52×32dp 트랙, 16에서 24dp로 커지는 핸들 | M3 | ✓ `md` | — (MD2: 얇은 트랙 위 20px 썸) |
| 핸들 안의 아이콘 | M3 | 부분: 두 상태 모두에만, 선택 상태에만 넣는 구성은 없음 | 부분: `icon`, `checkedIcon`이 썸을 대체 |
| 누르는 동안 핸들이 28dp로 커짐 | M3 | — | — |
| 오류 상태, 레이블 좌우 배치, 다섯 크기 | Material Plus | ✓ | 부분: 두 크기 |

### 칩

[`MPChip`](../components/display/chip)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| assist, filter, input, suggestion | M3 | 부분: 컴포넌트 하나를 `onClick`, `selected`, `onDelete`로 구분 | 부분: `Chip` 하나를 `clickable`, `onDelete`로 구분 |
| 높이 32dp, 모서리 8dp | M3 | ✓ `md` | 부분: 32px이지만 완전한 알약 모양 |
| elevated 칩 | M3 | ✓ `elevated` | — |
| 선택된 filter 칩의 체크 표시 | M3 | ✓ (`startIcon`이 없을 때) | — |
| 아바타와 삭제 버튼이 있는 input 칩 | M3 | 부분: `startIcon`과 `onDelete`, 아바타 크기 조정은 없음 | ✓ `avatar`, `onDelete` |
| 다섯 크기, `filled`, `tonal`, `text`, 숫자 | Material Plus | ✓ | 부분: 두 크기, `filled`, `outlined` |

### 날짜 선택기

[`MPDatePicker`](../components/inputs/date-picker), [`MPDateRangePicker`](../components/inputs/date-range-picker), [`MPCalendar`](../components/inputs/calendar)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| docked 날짜 선택기 | M3 | ✓ | ✓ `DesktopDatePicker`(MUI X, 무료) |
| 모달 날짜 선택기 | M3 | — | ✓ `MobileDatePicker`(MUI X, 무료) |
| 모달 입력: 날짜를 직접 입력 | M3 | — (설계상 입력 없음) | ✓ `DateField`(MUI X, 무료) |
| 범위 선택 | M3 | 부분: 전체 화면 모달이 아닌 두 달짜리 docked 팝업 | 부분: `DateRangePicker`(MUI X Pro, 유료) |
| 월, 연도 보기 | M3 | ✓ | ✓ |
| 일, 월, 연 단위 정밀도 | Material Plus | ✓ `precision` | ✓ `views` |
| 범위 프리셋 | Material Plus | ✓ `presets` | 부분: 유료 범위 선택기의 shortcuts |
| 날짜와 시간을 한 팝업에서 | Material Plus | ✓ [`MPDateTimePicker`](../components/inputs/date-time-picker) | ✓ `DateTimePicker`(MUI X, 무료) |
| 페이지에 바로 놓는 달력 | Material Plus | ✓ `MPCalendar` | ✓ `DateCalendar`(MUI X, 무료) |

### 시간 선택기

[`MPTimePicker`](../components/inputs/time-picker)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 다이얼(시계 판) | M3 | — (설계상 스크롤 열로 대신함) | ✓ `TimeClock`(MUI X, 무료) |
| 입력: 시와 분을 직접 입력 | M3 | — | ✓ `TimeField`(MUI X, 무료) |
| 12시간제와 24시간제, 오전·오후 | M3 | ✓ 로캘에서 결정 | ✓ |
| 세로, 가로 배치 | M3 | — | ✓ `orientation` |
| 초, 간격, 최솟값과 최댓값 | Material Plus | ✓ | ✓ |

### 메뉴

[`MPMenu`](../components/inputs/menu)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| 너비 112–280dp, 모서리 4dp, 높이 2, 행 48dp | M3 | ✓ `md` | 부분: MD2 메뉴 |
| 앞뒤 아이콘, 단축키 텍스트, 구분선 | M3 | ✓ | 부분: 단축키 슬롯 없음 |
| 하위 메뉴 | M3 | ✓ `MPMenuSubmenu` | — (열린 이슈) |
| 선택 항목: 체크와 라디오 | Expressive | ✓ | 부분: `MenuItem`의 `selected` |
| 세로 메뉴: 모서리 16dp, standard와 vibrant, 간격으로 묶은 그룹 | Expressive | — | — |
| 컨텍스트 메뉴 | Material Plus | ✓ `MPContextMenu` | 부분: 데모 |
| 다섯 크기 | Material Plus | ✓ | 부분: `dense` |

### 슬라이더

[`MPSlider`](../components/inputs/slider)

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| standard(연속), stops(불연속), 범위 | M3 | ✓ | ✓ |
| 핸들 위의 값 표시기 | M3 | — (레이블 옆에 값을 표시) | ✓ `valueLabelDisplay` |
| 가운데 기준 슬라이더 | M3 | — | — |
| 간격을 둔 막대 핸들, 16dp 트랙(2023년) | M3 | — (설계상 둥근 핸들) | — |
| 세로 | Expressive | ✓ | ✓ |
| 크기 XS–XL(트랙 16–96dp) | Expressive | — (트랙 2–8px) | — |
| 안쪽 아이콘 | Expressive | — | — |
| 눈금 레이블, 서식을 적용한 값, 다섯 크기 | Material Plus | ✓ | 부분: 눈금 레이블, 두 크기 |

## 텍스트 입력

### 텍스트 필드

[`MPTextField`](../components/inputs/text-field). select, combobox, 숫자 필드, 색 선택기, 각종 선택기가 같은 outlined 껍데기를 씁니다.

| 기능 | 정의한 곳 | Material Plus | Material UI |
| --- | --- | --- | --- |
| outlined | M3 | ✓ | ✓ |
| filled | M3 | — | ✓ |
| 56dp, 떠오르는 레이블 | M3 | ✓ `md` | ✓ |
| 보조 텍스트 | M3 | 부분: `MPTextField`에는 `errorMessage`만 있고, 다른 필드는 `description`도 받음 | ✓ `helperText` |
| 글자 수 카운터 | M3 | — | — |
| 접두사, 접미사 | M3 | — | ✓ `InputAdornment` |
| 앞쪽 아이콘 | M3 | ✓ `startIcon` | ✓ |
| 뒤쪽 아이콘 | M3 | 부분: 비밀번호 보기 토글만 | ✓ |
| 오류, 읽기 전용, 필수 | M3 | ✓ | ✓ |
| 여러 줄, 텍스트 영역 | M3 | ✓ `rows` | ✓ `multiline` |
| `onChange`가 값을 바꿔도 IME 조합이 깨지지 않음 | Material Plus | ✓ | — |
| 다섯 크기 | Material Plus | ✓ | 부분: `small`, `medium` |

### 드롭다운 메뉴 필드

[`MPSelect`](../components/inputs/select), [`MPCombobox`](../components/inputs/combobox)

| 기능                       | 정의한 곳     | Material Plus           | Material UI      |
| -------------------------- | ------------- | ----------------------- | ---------------- |
| 옵션 메뉴를 여는 필드      | M3            | ✓ `MPSelect`            | ✓ `Select`       |
| 입력하면서 거르기          | Material Plus | ✓ `MPCombobox`          | ✓ `Autocomplete` |
| 칩으로 보여 주는 다중 선택 | Material Plus | ✓ `MPCombobox multiple` | ✓                |
| 옵션 그룹                  | Material Plus | —                       | ✓ `groupBy`      |
| 목록에 없는 값             | Material Plus | ✓ `allowCustom`         | ✓ `freeSolo`     |

## 구현하지 않은 것

명세에는 있지만 이 라이브러리에 해당 컴포넌트가 없는 것입니다.

| 컴포넌트 | 정의한 곳 | 가장 가까운 것 | Material UI |
| --- | --- | --- | --- |
| 내비게이션 레일 | M3 (Expressive에서 대체) | — | 부분: "mini variant" 드로어 데모 |
| 접힌 레일과 펼친 레일 | Expressive | — | — |
| 검색 바와 검색 뷰 | M3 | 모달 검색인 [`MPCommandPalette`](../components/inputs/command-palette) | 부분: 데모 |
| 하단 앱 바 | M3 (Expressive에서 대체) | — | 부분: 데모 |
| docked 툴바와 floating 툴바 | Expressive | 컨트롤을 늘어놓는 평범한 바인 [`MPToolbar`](../components/layout/toolbar) | — |
| split button | Expressive | — | 부분: `ButtonGroup` 데모 |
| FAB 메뉴 | Expressive | FAB에서 여는 [`MPMenu`](../components/inputs/menu) | 부분: `SpeedDial` |
| loading indicator | Expressive | [`MPProgressCircular`](../components/feedback/progress-circular) | — |

## 명세에 없는 컴포넌트

각각 전체 props 표가 있는 페이지가 따로 있습니다.

### 입력

| 컴포넌트 | Material UI |
| --- | --- |
| [`MPNumberField`](../components/inputs/number-field) | 부분: 문서 안의 Base UI 조합 예제, 내보내지 않음 |
| [`MPOtpField`](../components/inputs/otp-field) | — |
| [`MPColorPicker`](../components/inputs/color-picker) | — |
| [`MPFilePicker`](../components/inputs/file-picker) | — (업로드 버튼 데모) |
| [`MPTransfer`](../components/inputs/transfer) | 부분: 데모, 내보내지 않음 |
| [`MPTreeSelect`](../components/inputs/tree-select) | — |
| [`MPCommandPalette`](../components/inputs/command-palette) | — |
| [`MPRating`](../components/inputs/rating) | ✓ `Rating` |
| [`MPMenubar`](../components/inputs/menubar) | 부분: 문서 안의 Base UI 조합 예제 |
| [`MPFieldset`](../components/inputs/fieldset) | 부분: `FormControl`, `FormGroup`, `FormLabel` |
| [`MPForm`](../components/inputs/form) | — |

### 표시

| 컴포넌트 | Material UI |
| --- | --- |
| [`MPAvatar`](../components/display/avatar) | ✓ `Avatar`, `AvatarGroup` |
| [`MPBreadcrumb`](../components/display/breadcrumb) | ✓ `Breadcrumbs` |
| [`MPPagination`](../components/display/pagination) | ✓ `Pagination` |
| [`MPStepper`](../components/display/stepper) | ✓ `Stepper` |
| [`MPTable`](../components/display/table) | ✓ `Table` |
| [`MPDataTable`](../components/display/data-table) | ✓ `DataGrid`(MUI X. 무료, 유료인 Pro와 Premium 등급이 따로 있음) |
| [`MPTreeView`](../components/display/tree-view) | ✓ `SimpleTreeView`, `RichTreeView`(MUI X. 무료, Pro는 유료) |
| [`MPTimeline`](../components/display/timeline) | ✓ `Timeline`(`@mui/lab`) |
| [`MPTypography`](../components/display/typography) | 부분: MD2 단계의 `Typography` |
| [`MPIcon`](../components/display/icon) | ✓ `Icon`, `SvgIcon` |
| [`MPTextLink`](../components/display/text-link) | ✓ `Link` |
| [`MPVisuallyHidden`](../components/display/visually-hidden) | 부분: `@mui/utils`의 `visuallyHidden` 스타일 |
| [`MPAnchor`](../components/display/anchor) | — |
| [`MPAppLogo`](../components/display/app-logo) | — |
| [`MPBlockquote`](../components/display/blockquote) | — |
| [`MPChatBubble`](../components/display/chat-bubble) | — (`@mui/x-chat`은 알파) |
| [`MPCodeBlock`](../components/display/code-block) | — |
| [`MPDataList`](../components/display/data-list) | — |
| [`MPHighlight`](../components/display/highlight) | — |
| [`MPImage`](../components/display/image) | — |
| [`MPPill`](../components/display/pill) | — |
| [`MPShortcut`](../components/display/shortcut) | — |
| [`MPSpoiler`](../components/display/spoiler) | — |
| [`MPStatistic`](../components/display/statistic) | — |

### 피드백

| 컴포넌트 | Material UI |
| --- | --- |
| [`MPAlert`](../components/feedback/alert) | ✓ `Alert` |
| [`MPPopover`](../components/feedback/popover) | ✓ `Popover` |
| [`MPOverlay`](../components/feedback/overlay) | ✓ `Backdrop` |
| [`MPSkeleton`](../components/feedback/skeleton) | ✓ `Skeleton` |
| [`MPHoverCard`](../components/feedback/hover-card) | 부분: 상호작용할 수 있는 내용을 넣은 `Tooltip` |
| [`MPPopconfirm`](../components/feedback/popconfirm) | — |
| [`MPMeter`](../components/feedback/meter) | — |
| [`MPProgressBox`](../components/feedback/progress-box) | — |
| [`MPEmpty`](../components/feedback/empty) | — |
| [`MPTour`](../components/feedback/tour) | — |
| [`useMPConfirm`](../components/hooks/confirm) | — |

### 레이아웃

| 컴포넌트 | Material UI |
| --- | --- |
| [`MPBox`](../components/layout/box) | ✓ `Box`, `Paper` |
| [`MPContainer`](../components/layout/container) | ✓ `Container` |
| [`MPGrid`](../components/layout/grid) | ✓ `Grid` |
| [`MPFlex`](../components/layout/flex) | ✓ `Stack` |
| [`MPAccordion`](../components/layout/accordion) | ✓ `Accordion` |
| [`MPPortal`](../components/layout/portal) | ✓ `Portal` |
| [`MPCollapsible`](../components/layout/collapsible) | 부분: `Collapse` 트랜지션 |
| [`MPToolbar`](../components/layout/toolbar) | 부분: 앱 바 안의 한 줄인 `Toolbar` |
| [`MPShow`](../components/layout/show) | 부분: `useMediaQuery` |
| [`MPStack`](../components/layout/stack) | — (Material UI의 `Stack`은 겹쳐 쌓기가 아니라 flex 줄) |
| [`MPAspectRatio`](../components/layout/aspect-ratio) | — |
| [`MPFooter`](../components/layout/footer) | — |
| [`MPNavigationMenu`](../components/layout/navigation-menu) | — |
| [`MPPageLayout`](../components/layout/page-layout) | — |
| [`MPPanes`](../components/layout/panes) | — |
| [`MPScrollArea`](../components/layout/scroll-area) | — |
| [`MPScrollZone`](../components/layout/scroll-zone) | — |
| [`MPMockup`](../components/layout/mockup) | — |

### 모션

| 컴포넌트 | Material UI |
| --- | --- |
| [`MPAnimateFade`](../components/transitions/animate-fade), [`MPAnimateGrow`](../components/transitions/animate-grow), [`MPAnimateSlide`](../components/transitions/animate-slide), [`MPAnimateZoom`](../components/transitions/animate-zoom) | ✓ `Fade`, `Grow`, `Slide`, `Zoom` |
| 나머지 열세 개: [`MPAnimateAppear`](../components/transitions/animate-appear), [`MPAnimateBlink`](../components/transitions/animate-blink), [`MPAnimateCounter`](../components/transitions/animate-counter), [`MPAnimateFloat`](../components/transitions/animate-float), [`MPAnimateHeadline`](../components/transitions/animate-headline), [`MPAnimateLighting`](../components/transitions/animate-lighting), [`MPAnimateMarquee`](../components/transitions/animate-marquee), [`MPAnimateReveal`](../components/transitions/animate-reveal), [`MPAnimateRotate`](../components/transitions/animate-rotate), [`MPAnimateScramble`](../components/transitions/animate-scramble), [`MPAnimateShake`](../components/transitions/animate-shake), [`MPAnimateSplit`](../components/transitions/animate-split), [`MPAnimateTyping`](../components/transitions/animate-typing) | — |

### 차트

| 컴포넌트 | Material UI |
| --- | --- |
| [`MPLineChart`](../components/charts/line-chart) | ✓ `LineChart`(MUI X, 무료) |
| [`MPAreaChart`](../components/charts/area-chart) | ✓ 영역을 채운 `LineChart`(MUI X, 무료) |
| [`MPBarChart`](../components/charts/bar-chart) | ✓ `BarChart`(MUI X, 무료) |
| [`MPPieChart`](../components/charts/pie-chart) | ✓ `PieChart`(MUI X, 무료) |
| [`MPScatterChart`](../components/charts/scatter-chart) | ✓ `ScatterChart`(MUI X, 무료) |
| [`MPSparkline`](../components/charts/sparkline) | ✓ `SparkLineChart`(MUI X, 무료) |
| [`MPGaugeChart`](../components/charts/gauge-chart) | ✓ `Gauge`(MUI X, 무료) |
| [`MPHeatmapChart`](../components/charts/heatmap-chart) | 부분: `Heatmap`(MUI X Pro, 유료) |
| [`MPTimelineChart`](../components/charts/timeline-chart) | — |

## Material UI에는 있고 이 라이브러리에는 없는 것

filled 텍스트 필드, inset 구분선, 누를 수 있는 카드, 모달 선택기는 위 표에 이미 적었습니다. 그 밖에는 다음과 같습니다.

- `success`, `info`, `warning` 의도 색. M3에 그 색을 만들어 낼 역할이 없어서 일부러 뺐습니다.
- 세로 탭, 그리고 스크롤되는 탭 바의 스크롤 버튼.
- 선형 진행 표시기의 `buffer`, `query` 모드.
- 내용에 맞춰 높이가 늘어나는 여러 줄 필드.
- `ImageList`, 그리고 `@mui/lab`의 `Masonry`.

## 출처

- [m3.material.io](https://m3.material.io/components)의 M3 명세. 2026년 9월 23일 공개본입니다. 웹 지원 현황은 [웹 페이지](https://m3.material.io/develop/web)에 있습니다.
- [Compose Material 3 릴리스 노트](https://developer.android.com/jetpack/androidx/releases/compose-material3). Expressive 중 어디까지 출시됐고 어디까지가 아직 실험 단계인지 보여 줍니다.
- Material Web의 [유지보수 모드 공지](https://github.com/material-components/material-web/discussions/5642).
- Material UI의 [개요](https://mui.com/material-ui/getting-started/)와 [컴포넌트 목록](https://mui.com/material-ui/all-components/), 9.4.0의 API 페이지, [M3 도입 이슈](https://github.com/mui/material-ui/issues/29345), [MUI X 라이선스 페이지](https://mui.com/x/introduction/licensing/).

이 페이지는 손으로 관리합니다. 컴포넌트에 기능이 생기거나 빠지면 같은 풀 리퀘스트에서 이 페이지의 해당 행도 고쳐야 합니다.

## 다음

- [디자인 언어](./design-language.md) — 이 라이브러리가 명세를 따르는 이유와, 알면서 명세를 넘어서는 곳.
- [색상](./color.md) — 역할과 테마 설정 방법.
- [Prop 규약](./prop-conventions.md) — 크기 사다리, 밀도, 높이를 축별로.
- [모든 컴포넌트](../components/) — 컴포넌트마다 한 페이지씩.
