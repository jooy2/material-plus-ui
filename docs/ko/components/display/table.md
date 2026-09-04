---
title: MPTable
order: 8
---

# MPTable

<p class="mp-lede">데이터 격자를, 행마다 적는 대신 열로 서술합니다. 열이 몇 개인지 말하는 곳이 하나뿐이므로 헤더와 셀이 어긋날 수 없습니다.</p>

<Demo src="table/hero" />

```tsx
import { MPTable } from 'material-plus-ui';
import type { MPTableColumn } from 'material-plus-ui';

const columns: MPTableColumn<Build>[] = [
  { key: 'id', label: '#', width: 72 },
  { key: 'branch', label: '브랜치' },
  { key: 'duration', label: '소요', align: 'end', render: (row) => `${row.duration}초` }
];

<MPTable headers={columns} items={builds} getRowKey={(row) => row.id} striped hoverable />;
```

## Props

<PropsTable name="MPTable" />

### MPTableColumn

<PropsTable name="MPTableColumn" />

## 마크업이 아니라 데이터를 받는 이유

행마다 적은 `<td>`는 위의 `<th>`와 개수나 순서를 두고 조용히 어긋날 수 있습니다. 열 목록은 그럴 수 없습니다. 그것이 이 맞바꿈의 전부이고, `render`가 표가 아니라 열에 있는 이유입니다. 셀을 그리는 것은 여전히 당신 몫이지만, 격자의 _형태_ 는 한 번만 말합니다.

## 셀 패딩은 인라인으로 쓰이고, 그래야만 합니다

라이브러리에서 클래스 대신 인라인 스타일을 쓰는 유일한 컴포넌트입니다.

버튼은 자기 `<button>`을 소유합니다. 아무도 그것을 건드리지 않습니다. `<td>`는 다릅니다 — VitePress의 `.vp-doc td`, Tailwind Typography의 `.prose td`, 그리고 세상의 모든 CSS 프레임워크가 표 셀을 **태그 이름으로** 스타일링하고, 그 특이도는 클래스 하나짜리 Tailwind 유틸리티가 이길 수 없는 두 클래스입니다. 이것이 없으면 패딩·정렬·테두리가 전부 호스트에 조용히 집니다.

인라인이 _아닌_ 것은 행의 배경입니다. hover 상태가 있는데 인라인 스타일에는 `:hover`가 없기 때문입니다. 대신 커스텀 프로퍼티를 읽습니다 — 호스트 스타일시트에 보이지 않으므로 클래스 하나짜리 variant가 다툼 없이 이깁니다.

## 행 높이는 MD3의 52dp입니다

`body-medium`의 줄 상자는 20px이고, 20에 위아래 `1rem`을 더하면 정확히 52입니다. 열 제목은 `title-small` — 같은 크기에서 굵기만 한 단계 위인 14px/500 — 이므로 열의 너비를 바꾸지 않으면서 제목으로 읽힙니다.

`striped`와 `hoverable`은 물들인 색이 아니라 중립 면 두 단계입니다. 흰색과 연한 파랑을 번갈아 칠한 표는 데이터의 절반에 색을 입힌 표입니다.

`density`는 그 행을 52, 48, 44, 40으로 걷게 합니다. 한 단계에 4px이고, 숫자 크기는 그대로입니다. 마지막이 핵심입니다. 표를 조밀하게 만드는 이유는 행을 더 보기 위해서인데, 그러자고 글자를 줄이면 볼 것이 많아진 바로 그 순간에 읽기 어려워집니다.

```tsx
<MPTable headers={columns} items={rows} density={-2} />
```

셀 여백은 인라인으로 쓰이기 때문에 표 조회가 아니라 계산입니다. 한 단계마다 각 면에서 2px씩, 곧 행에서 4px씩 빠집니다. 두 축의 바닥은 다릅니다. 가로는 두 열이 붙기 시작하는 6px, 세로는 가장 낮은 행을 24px 바닥에 붙들어 두는 4px입니다.

## `onRowClick`은 행을 키보드로 도달 가능하게 만듭니다

누르면 반응하는 행은 키보드에도 반응해야 하므로, 각 행이 탭 순서에 들어가고 Enter와 Space를 받습니다. 행은 `role="button"`을 주장하는 대신 `role="row"`를 유지합니다. 자신이 버튼이라고 말하는 행은 스크린 리더가 읽어주는 표 안에서의 위치를 잃는데, 그것이야말로 버튼에는 없고 셀에만 있는 것이기 때문입니다.

셀 **안에서** 눌린 키는 그 셀 안의 것에게 맡깁니다. 표 안의 필드에 입력한 Space가 주변 행을 활성화하지 않습니다.

대가도 알아둘 만합니다. 행이 이백 개인 표는 탭 정지점이 이백 개가 됩니다. 행의 역할이 **이동**이라면 첫 셀에 링크를 넣으십시오. 행마다 탭 정지점 하나, 이미 링크로 안내되며, 새 탭으로 열 수도 있습니다.

```tsx
<MPTable
  headers={[
    {
      key: 'name',
      label: 'Name',
      render: (row) => <MPTextLink href={row.href}>{row.name}</MPTextLink>
    },
    { key: 'qty', label: 'Qty', align: 'end' }
  ]}
  items={rows}
/>
```

## 너비는 `<col>`의 것입니다

`<th>`에 준 너비는 브라우저가 다른 모든 행과 다시 협상해도 되는 너비입니다. 한 번만 말하는 것은 열 엘리먼트뿐입니다.

다만 "기본"은 말 그대로입니다. 표는 여전히 너비를 채우도록 열을 조정하므로 `width`는 보장이 아니라 출발 비율입니다.

## 예시

### empty

`empty`는 무엇이든 받습니다. [MPEmpty](../feedback/empty)가 그대로 들어가는 이유입니다.

<Demo src="table/empty">

<<< @/.vitepress/demos/table/empty.tsx

</Demo>

### caption

표 위에 놓이고 표의 접근성 이름으로 읽힙니다. `<caption>`이 있는 이유가 그것입니다. 한 페이지에 표가 여럿인데 캡션이 없으면, 스크린 리더 사용자는 세어 가며 지나가야 합니다.

## `React.forwardRef`가 아닙니다

`Row`에 대해 제네릭인데, `forwardRef` 컴포넌트의 타입은 그것을 지웁니다. 래퍼가 타입 매개변수를 가진 함수가 아니라 하나의 컴포넌트로 타이핑되므로 `headers`와 `items`가 서로 검사되지 않고 `column.render`는 `unknown`을 돌려주게 됩니다.

그 검사를 잃는 비용이 스크롤 컨테이너의 ref보다 큽니다 — ref가 필요한 호출자는 이것을 감싸는 `<div>`에 직접 달면 됩니다.

## 함께 보기

- [MPList](./list) — 행에 열이 없을 때.
- [MPEmpty](../feedback/empty) — `empty`에 들어가는 것.
- [MPSkeleton](../feedback/skeleton) — 행이 아직 오는 중일 때 그 자리에 놓는 것.
