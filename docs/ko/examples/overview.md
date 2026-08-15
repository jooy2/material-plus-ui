---
title: 한눈에 보기
order: 1
aside: false
---

# 한눈에 보기

<p class="mp-lede">라이브러리의 모든 부분을 한 화면에 담았습니다. 컴포넌트를 낱개로 늘어놓는 대신 실제 애플리케이션이 배치하는 방식으로 놓아서, 나란히 두었을 때 크기와 기준선과 표면이 서로 맞는지 볼 수 있게 했습니다.</p>

<Demo src="showcase/app" :minHeight="2000" />

## 이 페이지에서 볼 것

| 블록 | 사용된 컴포넌트 | 볼 만한 것 |
| --- | --- | --- |
| 앱 바 | `MPIcon` `MPTextField` `MPBadge` `MPTooltip` `MPIconButton` `MPMenu` `MPAvatar` | 바 자체는 `bg-mp-surface-container`를 얹은 `<header>`입니다 — 컴포넌트가 아닌 부분에게는 토큰이 곧 API입니다 |
| 경로 | `MPBreadcrumb` `MPPill` | 어느 컨트롤에도 속하지 않는 상태는 필에 담깁니다. 그 안의 스피너는 `xs` 크기의 `MPProgressCircular`입니다 |
| 알림 | `MPAlert` | 살펴야 할 것 하나를, 한 번만, 맨 위에서, 자기 `action`과 함께 |
| 수치 | `MPGrid` `MPGridItem` `MPCard` `MPChip` | `MPGrid`는 Tailwind의 브레이크포인트가 아니라 머터리얼의 윈도우 크기 클래스(600·840·1200dp)로 나뉩니다 |
| 컨트롤 줄 | `MPSegmentedButton` `MPSelect` `MPButtonGroup` `MPButton` | `size="sm"`에서 넷은 모두 같은 높이라, 마진을 한 줄도 적지 않고 한 줄의 기준선이 유지됩니다 |
| 새 소식 | `MPCarousel` | scroll snap 기반이라 모바일에서 스와이프가 되고 RTL에서 방향이 뒤집힙니다 |
| 배포 | `MPTabs` `MPTable` `MPChip` `MPPagination` | 표는 열 목록으로 그려지므로 머리글과 셀이 서로 어긋날 수 없습니다 |
| 폼 | `MPCard` `MPTextField` `MPDivider` `MPChip` `MPCheckbox` `MPRadioGroup` `MPSwitch` `MPSlider` | 모든 컨트롤이 `label`을 받고, 덧붙일 말이 있는 것은 `description`을 받습니다 — 전부 같은 두 자리입니다 |
| 릴리스 | `MPTimeline` `MPHighlight` `MPShortcut` `MPBlockquote` `MPProgressLinear` `MPList` `MPRating` | 위쪽 검색 필드에 타이핑해 보세요. `MPHighlight`가 곧 검색이고, 릴리스 노트의 표시가 입력에 따라 나타납니다 |
| 하단 바 | `MPBottomNavigation` | `position="static"`은 창이 아니라 레이아웃 안에 두는 값이고, 그래서 미리보기 안에 담길 수 있습니다 |

메시지는 화면 전체를 감싼 `MPSnackbarProvider` 하나에서 나옵니다. 메시지를 띄우는 버튼들은 무슨 일이 일어났는지만 말합니다.

## 다음으로

- 같은 부품으로 만든 화면 셋: [랜딩 페이지](./concept-landing), [관리자 대시보드](./concept-dashboard), [회원 가입 페이지](./concept-signup).
- 컴포넌트 하나하나의 prop과 예시는 [컴포넌트](../components/) 문서에 있습니다.
- 공유 prop이 뜻하는 것은 [Prop 규약](../design/prop-conventions)에 있습니다.
