---
title: MPPagination
order: 15
---

# MPPagination

<p class="mp-lede">페이지들의 행이고, 그중 하나가 지금 읽고 있는 페이지입니다. 머터리얼에는 페이지네이션 컴포넌트가 없으므로, 여기서 머터리얼인 것은 그 결정을 둘러싼 모든 것입니다 — 라이브러리의 컨트롤 높이를 따르는 알약 모양, 자기 잉크 아래 강조 색으로 채워진 현재 페이지, 그리고 명세가 hover 색 대신 쓰는 스테이트 레이어입니다.</p>

<Demo src="pagination/hero" :minHeight="140" />

::: fw react

```tsx
import { MPPagination } from 'material-plus-ui';

const [page, setPage] = useState(1);

<MPPagination count={20} page={page} onPageChange={setPage} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

int page = 1;

MPPagination(count: 20, page: page, onChanged: (int next) => setState(() => page = next));
```

:::

페이지가 둘보다 적으면 컨트롤 전체가 아무것도 렌더링하지 않습니다. 한 페이지는 페이지의 묶음이 아니고, 비활성 "1" 하나만 든 행은 할 일이 없다고 광고하는 컨트롤입니다.

## Props

<PropsTable name="MPPagination" />

## 창(window)

<Demo src="pagination/window" :minHeight="380">

::: fw react

<<< @/.vitepress/demos/pagination/window.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/pagination/window.dart

:::

</Demo>

규칙은 셋이고, 대부분의 페이지네이션이 틀리는 것은 세 번째입니다.

1. `boundaryCount`만큼의 페이지가 어느 페이지에 있든 양 끝에 고정됩니다.
2. `siblingCount`만큼의 페이지가 현재 페이지 양옆에 남습니다.
3. **정확히 한 페이지짜리 빈틈은 줄임표가 아니라 그 페이지로 채웁니다.** `1 … 3 … 9`는 숫자 하나를, 그 숫자보다 넓은 기호 뒤에 숨긴 것입니다.

행의 칸 수도 일정하게 고정됩니다. 창은 가까운 끝에서 잘리는 대신 그쪽으로 미끄러지므로, 1페이지에서는 `1 2 3 4 5 … 20`이 되고 10페이지에서는 `1 … 9 10 11 … 20`이 됩니다. 어느 칸이 숫자이고 어느 칸이 줄임표인지는 바뀌어도 칸의 개수는 바뀌지 않습니다. 그러지 않으면 1페이지에서 2페이지로 갈 때 행이 다시 배치되고, 방금 누른 손가락 아래에서 모든 칸이 자리를 옮깁니다.

:::: fw react

## getPageHref

이것이 없으면 행은 버튼이고, 크롤러는 버튼을 누를 수 없습니다. 그러면 글, 상품, 검색 결과의 페이지 목록은 사람에게만 존재하고 나머지 모두에게는 1페이지에서 끝납니다.

::: fw react

```tsx
<MPPagination
  count={20}
  page={page}
  onPageChange={setPage}
  getPageHref={(n) => `/blog/page/${n}`}
/>
```

:::

이것이 있으면 숫자들은 진짜 `<a href>`가 되고, 두 스테퍼는 `rel="prev"`와 `rel="next"`를 달고, 브라우저 자신의 동작이 돌아옵니다. 새 탭에서 열기, 주소 복사, 누르기 전에 어디로 가는지 보기.

`onPageChange`는 그대로 호출되고 이동은 먼저 취소되므로, 클라이언트 라우터는 이미 가진 페이지를 유지합니다. ⌘, Ctrl, Shift, Alt를 누른 채로 한 클릭은 절대 취소하지 않습니다. 그건 사용자가 브라우저에게 새 탭을 요청한 것이고, 우리가 빼앗을 것이 아닙니다.

그래도 두 칸은 버튼으로 남습니다. **지금 읽고 있는 페이지** — 이미 있는 페이지는 갈 곳이 아니기 때문 — 와 **행 끝의 스테퍼** — `disabled`는 `<a>`가 가질 수 있는 상태가 아니기 때문입니다. 보기에만 사용 불가인 링크는 키보드가 여전히 밟고 크롤러가 여전히 따라갑니다.

::::

::: fw flutter

## 링크

Flutter 화면에는 링크를 따라갈 크롤러도, 링크를 보여 줄 주소창도 없습니다. 그래서 줄은 언제나 버튼이고 `getPageHref`도 `renderLink`도 없습니다. 라우터는 `onChanged`에서 그 페이지로 옮겨 갑니다.

:::

## 지역화

이 행에서 그려지는 것은 숫자뿐이므로, 이 컴포넌트가 말하는 모든 단어는 스크린 리더만 듣고 아무도 보지 않는 것입니다. 그 단어들은 라이브러리 자신의 표에서 옵니다.

::: fw react

```tsx
<MPPagination count={20} locale="ko" />
```

:::

::: fw flutter

```dart
const MPPagination(count: 20, locale: 'ko');
```

:::

`MPLocaleProvider`는 애플리케이션 전체에 한 번에 설정하고, `labels`는 나머지 번역을 잃지 않고 한 문자열씩 덮어씁니다. [지역화](../../design/localization)를 보세요.

행은 또한 이동할 때마다 "20페이지 중 7페이지"를 말하는 polite 라이브 영역을 가지고 있습니다. `aria-current`는 어느 페이지가 선택되었는지 말하고, 이쪽은 전부 몇 페이지인지 말합니다. 줄임표가 들어간 순간 리스트의 길이는 더 이상 그걸 말해 주지 않습니다.

## 크기

칸들은 다른 모든 것과 같은 컨트롤 높이 사다리 위에 있으므로, `sm` 페이지네이션은 옆의 `sm` 버튼과 줄이 맞습니다. 테이블 푸터에는 보통 `sm`이 맞습니다 — 56dp 원 아홉 개의 행은 넓은 행이고, `md`는 폼 컨트롤의 크기입니다.

칸은 숫자가 더 넓어질 때까지는 정사각형이고 그 뒤로는 좌우 패딩만큼 늘어나므로, 네 자리 페이지도 잘리지 않고 읽힙니다.

## 이게 틀린 컴포넌트일 때

**결과 수가 정해지지 않았거나 알 수 없을 때**는 "더 보기" [MPButton](../inputs/button)이나 무한 목록이 정직하고 이건 아닙니다. 페이지들의 행은 총 개수를 안다는 약속입니다.

**하나씩 넘겨 가는 것** — 사진, 레코드, 단계 — 이라면 [MPIconButton](../inputs/icon-button) 두 개를 쓰세요. 페이지네이션은 묶음의 지도이고, 스테퍼는 그 안을 걷는 일입니다.

## 접근성

::: fw react

- `<nav>` 랜드마크이고, 이름은 로케일이 "페이지 매기기"라고 부르는 말입니다. 그 안에 `<ul>`이 있고, 리스트의 길이가 페이지가 어디까지 가는지 말합니다.
- `aria-current="page"`가 지금 읽고 있는 페이지를 표시하고, 무언가를 주장하는 칸은 그것뿐입니다.
- 모든 칸에 말로 된 이름이 있습니다 — "4페이지", "다음 페이지". 그려지는 것은 숫자 하나거나 꺾쇠 하나이기 때문입니다.
- 줄임표는 비활성 버튼이 아니라 `<span>`입니다. 사용할 수 없는 컨트롤이 아니라 문장 부호입니다. `aria-hidden`인 이유는 숫자 둘 사이에서 읽히는 "가로 줄임표"가 소음이기 때문입니다.

:::

::: fw flutter

- 로캘의 "페이지 매기기" 단어로 이름이 붙은 컨테이너 노드 하나이고, 그 값은 "20페이지 중 7페이지" 같은 문장이며 움직일 때마다 다시 알립니다. 칸은 그 안에서 저마다 노드가 됩니다.
- 읽고 있는 페이지는 선택됨으로 표시합니다. Flutter에서 `aria-current`에 가장 가까운 것이며, 무언가를 주장하는 칸은 이것 하나입니다. 눌러도 아무 일도 하지 않지만, 사용자가 서 있는 자리이므로 정지점으로는 남습니다.
- 칸마다 "4페이지", "다음 페이지" 같은 읽을 이름이 있습니다. 그려지는 것은 숫자나 꺾쇠이기 때문입니다. 오른쪽에서 왼쪽으로 쓰는 화면에서는 이동 버튼이 반대쪽을 가리킵니다.
- 생략 표시는 비활성 버튼이 아니라 문장 부호이고, 읽지 않습니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `defaultPage` | `initialPage` | Flutter는 시작 값을 `initialX`로 부릅니다. |
| `onPageChange` | `onChanged` | 컨트롤의 값이 바뀔 때 Flutter가 쓰는 이름입니다. |
| `getPageHref`, `renderLink` | — | 크롤러도 주소창도 없습니다. 이동은 `onChanged`로 합니다. |
| `labels: Partial<MPPaginationLabels>` | `labels: Map<String, String>` | 같은 키를 맵으로 받습니다. |
| 목록을 담은 `<nav>`와 라이브 리전 | 값이 바뀌면 알리는 이름 붙은 컨테이너 | 같은 세 가지를 노드 하나에서 말합니다. |
| `className`, `style`, `ref` | — | 클래스 목록도 style 속성도 엘리먼트도 없습니다. |

:::

## 함께 보기

- [MPBreadcrumb](./breadcrumb) — 또 하나의 탐색 행이자, "지금 여기" 규칙이 온 곳.
- [MPTable](./table) — 페이지네이션이 보통 그 아래에 놓이는 것.
- [지역화](../../design/localization) — 단어들이 오는 곳.
