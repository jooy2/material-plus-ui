---
title: MPAccordion
order: 3
---

# MPAccordion

<p class="mp-lede">한 번에 하나만 열리는 구획의 묶음입니다. 다음을 열면 이전 것이 닫히는데, 이것이 콜랩서블을 그냥 쌓아 둔 것과 다른 이유의 전부입니다.</p>

<Demo src="accordion/hero" :minHeight="280" />

```tsx
import { MPAccordion, MPAccordionItem } from 'material-plus-ui';

<MPAccordion defaultValue={['delivery']}>
  <MPAccordionItem value="delivery" title="배송" subtitle="영업일 기준 3~5일">
    일반 배송은 가격에 포함되어 있습니다.
  </MPAccordionItem>
  <MPAccordionItem value="returns" title="반품">
    30일 이내, 배송비는 저희가 부담합니다.
  </MPAccordionItem>
</MPAccordion>;
```

## Props

<PropsTable name="MPAccordion" />

### MPAccordionItem

<PropsTable name="MPAccordionItem" />

## 콜랩서블을 쌓은 것이 아닌 이유

`multiple` 때문입니다.

[MPCollapsible](./collapsible)은 자기 `open`을 가지고 누구에게도 답하지 않습니다. 아코디언은 **집합**을 소유합니다. 다음 구획이 열릴 때 이전 것을 닫는 것은 페이지가 읽는 사람 밑에서 자라나지 않게 하는 일이고, 그 규칙은 자기 자신만 아는 컴포넌트 안에 있을 수 없습니다.

그래서 기준은 구획들이 서로 관계가 있느냐입니다.

- **관계없음** — 폼의 "고급 설정", 결과 아래의 "원본 응답 보기". 콜랩서블 두 개입니다. 여기에 아코디언을 쓰면 하나가 열렸다고 다른 하나를 닫는데, 그런 관계는 이 페이지에 없습니다.
- **서로 대안** — FAQ 묶음, 설정 페이지의 분류, 사이드바의 패널들. 아코디언입니다.

한 묶음에 들어갈 만큼 관계는 있지만 읽는 사람이 둘을 동시에 열어 두고 싶을 법하다면 `multiple`을 켜세요.

<Demo src="accordion/multiple" :minHeight="300">

<<< @/.vitepress/demos/accordion/multiple.tsx

</Demo>

`onValueChange`는 움직인 구획이 아니라 **열려 있는 집합 전체**를 알려 줍니다. "이것만 남기고 전부 닫기"가 diff가 아니라 대입 한 줄이 되는 이유입니다.

## 공유되는 값이 어디에 사는지

`size`, `variant`, `dividers`는 **묶음**의 것이지 구획의 것이 아닙니다.

구획은 무언가 _의_ 구획이므로, 단계를 항목마다 넘기면 항목마다 틀릴 기회가 하나씩 생깁니다. 게다가 실패가 조용합니다 — 네 번째 구획만 위의 셋보다 한 단계 큰 아코디언. `MPAccordionItem`은 이 값들을 컨텍스트에서 읽고, 그래서 호출자가 데이터를 `.map()`하거나 구획을 자기 컴포넌트로 감싸도 값이 그대로 닿습니다.

항목에 남는 것은 진짜로 그 항목의 것뿐입니다. `value`, 슬롯들, 그리고 `disabled`.

## 선으로 나눌지, 타일로 놓을지

<Demo src="accordion/dividers" :minHeight="360">

<<< @/.vitepress/demos/accordion/dividers.tsx

</Demo>

`dividers`는 기본이 켜짐이고, 이건 [MPList](../display/list)와 반대입니다. 타일의 목록은 목록이지만, 타일의 아코디언은 접히기도 하는 카드 더미입니다. 선은 이 구획들이 한 물건의 부분이라고 말해 줍니다.

두 설정의 차이는 선이 생기고 마는 것이 아닙니다.

|  | `dividers` 켬 | 끔 |
| --- | --- | --- |
| 시트 | 잘라내고, 선이 양 끝까지 닿도록 자기 여백을 내놓습니다 | 여백을 아주 조금 남깁니다 |
| 구획 | 각지게 — 행이니까요 | `corner-small`, 시트보다 한 단계 아래 — 타일이니까요 |

## 표면은 중립으로 남습니다

`filled`에서도 그렇습니다. 여기서 `filled`는 강조 색이 아니라 MD3 자신의 filled 카드 표면인 `surface-container-highest`입니다. 아코디언은 남의 내용을 담는 상자이고, 상자를 물들이면 그 내용의 배경이 물듭니다.

`color`가 없는 이유도 같습니다. 읽을 것이 없습니다. 표면은 구조적으로 중립이고 포커스 링은 모든 컨트롤에서 `secondary`입니다.

## 무엇이 움직이는지

각 패널의 높이는 Base UI가 직접 잰 값 — `--accordion-panel-height` — 에서 애니메이션됩니다. 변형되는 것이 없고 글자가 다시 샘플링되지도 않습니다. 패널은 가만히 있는 내용 위로 열리는 창입니다. 지속 시간과 커브는 명세의 `short4`와 `standard`이고, `prefers-reduced-motion`에서는 전환이 사라집니다.

**잘라내기는 애니메이션의 것이지 패널의 것이 아닙니다.** `overflow: hidden`은 열리는 중인 본문을 눌린 복사본이 아니라 창으로 만들어 주는 것이고, 높이가 도착하는 순간 걷힙니다. 다 열린 뒤에도 계속 자르는 패널은 자기 상자 밖으로 그리는 첫 번째 것의 윗부분을 잘라냅니다. 텍스트 필드의 떠 있는 라벨은 필드의 위 테두리 _위에_ 앉고 그 선이 곧 패널의 위 테두리라서, 아코디언 안의 폼은 첫 라벨이 반쯤 잘린 채로 나왔고 콘솔에는 아무 말도 없었습니다. select의 팝업, 툴팁, 포커스 링이 픽셀만 다른 같은 버그입니다.

닫힐 때는 높이가 움직인 뒤가 아니라 그 전에 다시 자르므로, 내려가는 중인 패널이 줄어드는 상자 밖으로 그리는 일이 없습니다. 처음부터 열려 있는 섹션과 `prefers-reduced-motion`인 섹션은 첫 페인트부터 잘리지 않습니다. 기다릴 전환이 없고, 기다렸다면 영영 잘린 채로 있었을 것입니다.

## 예시

### action

헤더 끝에 고정되는 컨트롤이고, 트리거 **바깥**입니다.

```tsx
<MPAccordionItem value="address" title="주소" action={<MPButton variant="text">수정</MPButton>}>
  서울특별시 중구 세종대로 12
</MPAccordionItem>
```

겉모습이 아니라 구조의 문제입니다. 접히기도 하고 버튼도 들고 있는 헤더에는 누를 것이 두 개 있는데, `<button>` 안의 `<button>`은 브라우저가 파싱하면서 고쳐 쓰는 마크업입니다. 액션을 눌러도 자기가 앉아 있는 구획은 접히지 않습니다.

### disabled

묶음에 주면 모든 구획이 한 번에 꺼지고, 구획에 주면 그 하나만 꺼지며 나머지는 계속 동작합니다.

```tsx
<MPAccordion disabled>…</MPAccordion>

<MPAccordionItem value="b" title="아직" disabled>…</MPAccordionItem>
```

### hiddenUntilFound

닫힌 패널을 `hidden="until-found"`로 DOM에 남겨, 브라우저의 페이지 검색이 텍스트를 찾아 접힘을 열어 줄 수 있게 합니다. `keepMounted`보다 우선하며, `keepMounted`는 다른 이유 — 만드는 비용이 크거나 폼 상태를 담은 내용 — 로 엘리먼트를 남깁니다.

```tsx
<MPAccordion hiddenUntilFound>…</MPAccordion>
```

## 접근성

- 각 헤더는 제목 행 안의 진짜 `<button>`이고, `aria-expanded`와 자기 패널을 가리키는 `aria-controls`를 가집니다. 전부 Base UI가 연결합니다.
- 헤더 사이 이동은 화살표 키가 아니라 Tab입니다. 아코디언 패턴에서 roving focus를 없앤 [APG 자신의 개정](https://github.com/w3c/aria-practices/pull/3434)을 따른 것으로, Base UI가 현행 지침을 구현하고 있고 이 컴포넌트는 그 위에 두 번째 규칙을 얹지 않습니다.
- `action`은 트리거 바깥에 있으므로, 키보드 사용자는 접힘과 그 위의 컨트롤을 별개의 정지점 두 개로 만납니다.
- 호버·포커스·프레스는 머터리얼의 state layer라서, 다섯 표면 어디에서나 헤더가 똑같이 읽힙니다.
- 선으로 나뉜 아코디언에서 포커스 링은 **안쪽**으로 그려집니다. 패널이 창이 될 수 있도록 시트가 자식을 잘라내기 때문입니다.

## 함께 보기

- [MPCollapsible](./collapsible) — 누구에게도 답하지 않는 접힘 하나.
- [MPList](../display/list) — 접히지 않는 행의 묶음.
- [MPCard](./card) — 모든 구획이 한꺼번에 보이는 시트.
