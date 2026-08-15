---
title: 관리자 대시보드
order: 3
aside: false
---

# 관리자 대시보드

<p class="mp-lede">존재하지 않는 상점 Grange의 백오피스입니다. 레일, 필터 줄, 네 개의 수치, 행마다 동작이 달린 표, 그리고 그 아래 크기를 바꿀 수 있는 분할 — 전부 한 화면에, 전부 같은 크기로. 크기 체계가 실제로 성립하는지 드러나는 배치입니다.</p>

<Demo src="concepts/dashboard" :minHeight="960" />

소스는 파일 하나입니다: `docs/.vitepress/demos/concepts/dashboard.tsx`. 표는 살아 있습니다. 검색하고, 채널로 거르고, 행 몇 개를 체크하면 일괄 동작이 나타납니다.

## 무엇으로 만들어졌나

| 블록 | 사용된 컴포넌트 | 볼 만한 것 |
| --- | --- | --- |
| 레일 | `MPDrawer` `MPList` `MPChip` `MPCard` `MPProgressLinear` | `mode="standard"`는 같은 패널을 위가 아니라 레이아웃 안에 둡니다. 사이드바가 햄버거로 바뀌는 것이 prop 하나인 이유입니다 |
| 앱 바 | `MPBreadcrumb` `MPBadge` `MPTooltip` `MPIconButton` `MPAvatar` | 레일 토글의 `label`은 그것이 무엇인지가 아니라 무엇을 할지를 말합니다 |
| 알림 | `MPAlert` | `variant="tonal"`에 `action` 하나 — 처리할 일과 처리하는 방법 |
| 수치 | `MPCard` `MPChip` `MPIcon` | 떨어진 환불률이 초록으로 나옵니다. 타일은 부호가 아니라 어느 방향이 좋은 소식인지를 듣습니다 |
| 필터 | `MPTextField` `MPSelect` `MPDateRangePicker` | 서로 다른 세 컨트롤, 하나의 높이. 라이브러리 전체에서 `size="sm"`이 뜻하는 것입니다 |
| 일괄 동작 | `MPPill` `MPButton` `MPDialog` `MPSnackbarProvider` | 선택이 있을 때만 나타나고, 파괴적인 것은 다이얼로그로 확인한 뒤 스낵바로 알립니다 |
| 표 | `MPTabs` `MPTable` `MPCheckbox` `MPChip` `MPMenu` `MPContextMenu` `MPPagination` `MPEmpty` | 전체 선택은 머리글 셀의 `indeterminate` 체크박스이고, 행마다 자기 메뉴가, 표 전체에는 컨텍스트 메뉴가 있습니다 |
| 분할 | `MPPanes` `MPPane` `MPProgressBox` `MPProgressCircular` `MPTimeline` `MPSwitch` | 어느 쪽을 읽을지는 읽는 사람이 정하므로, 둘 사이의 경계는 끌 수 있습니다 |
| 새 주문 | `MPFloatingActionButton` | `position="absolute"`는 창이 아니라 이 시트에 버튼을 고정합니다. FAB이 미리보기 안에 담길 수 있는 이유입니다 |

## 메모

- `stickyHeader`가 행이 아래로 흐르는 동안 열 머리글을 붙잡아 둡니다.
- 행 메뉴의 트리거는 `label`에 주문 번호를 담습니다. 그래서 각 행의 동작이 "어느 행의 것인지" 말하는 접근성 이름을 갖습니다.
- 필터링은 평범한 React 상태입니다. 표는 건네받은 것을 그리고, 그것이 아무것도 아닐 때 `MPEmpty`를 보여 줍니다. 빈 상태는 분기해서 문장을 찍는 자리가 아니라 컴포넌트입니다.
- 열 정의는 모듈 스코프가 아니라 컴포넌트 안에서 `useMemo`로 만듭니다. 여섯 셀 중 셋이 상태를 읽기 때문입니다 — 전체 선택 상자, 각 행의 상자, 그리고 자기 행을 알아야 하는 메뉴.
