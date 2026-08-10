---
title: MPTimeline
order: 9
---

# MPTimeline

<p class="mp-lede">일이 벌어진 순서대로 놓인 단계들입니다. prop 하나가 현실이 어디까지 왔는지 말하면, 모든 동그라미와 선과 제목이 거기서 따라 나옵니다.</p>

<Demo src="timeline/hero" :minHeight="300" />

```tsx
import { MPTimeline, MPTimelineItem } from 'material-plus-ui';

<MPTimeline active={2}>
  <MPTimelineItem title="주문" meta="8월 9일" bullet="1" />
  <MPTimelineItem title="포장" meta="8월 9일" bullet="2" />
  <MPTimelineItem title="배송 중" meta="지금" bullet="3" />
</MPTimeline>;
```

## Props

<PropsTable name="MPTimeline" />

### MPTimelineItem

<PropsTable name="MPTimelineItem" />

## `active`는 값이 아니라 인덱스입니다

타임라인에는 선택이 없습니다. 여기서 고른 것은 아무것도 없고, 유일한 질문은 현실이 목록의 어디까지 닿았는가입니다. `active` 앞은 완료, `active` 자신은 진행 중, 그 뒤는 아직입니다.

생략하면 스스로 말하지 않는 한 모든 항목이 `upcoming`이고, 항목 개수를 넘기면 전체가 완료로 표시됩니다.

자식의 번호는 각 항목의 prop이 아니라 타임라인이 훑으면서 매깁니다. 자기 위치를 남이 알려줘야 하는 항목은 호출자가 잘못 놓을 수 있는 항목이고, 중간에 단계를 끼워 넣으면 뒤의 번호를 전부 다시 매겨야 합니다. 조건부 단계는 세기 전에 걸러지므로 `active={2}`는 실제로 페이지에 있는 단계를 셉니다.

## 세 상태, 세 축

절대 세 가지 투명도가 아닙니다.

- **`complete`** — 채워진 동그라미. 강조 색과 그 잉크.
- **`current`** — 같은 채움에 container 색 후광.
- **`upcoming`** — 페이지 자신의 면 위에 그은 가는 테두리.

색을 구분하지 못하는 독자에게도 채워진 모양, 후광이 있는 모양, 빈 모양이 남습니다. 진행 중인 단계는 `aria-current="step"`도 함께 갖습니다.

항목의 `status`는 `active`가 계산한 것을 덮어씁니다. 실패해서 흐름을 멈춘 단계에 필요한 것입니다.

## 연결선은 그것이 떠나는 단계의 것입니다

선은 도착지가 아니라 떠나는 단계에 닿았는지로 색이 정해집니다 — 그래서 `connector`는 항목의 prop이고, 마지막 항목은 절대 선을 그리지 않습니다. 그 선은 흐름의 끝에서 아무것도 없는 곳으로 이어지게 됩니다.

선은 채워진 `<div>`가 아니라 절대 위치 상자의 테두리 한 변으로 그려집니다. 그래야 `dashed`와 `dotted`가 브라우저 자신의 점선이 되고, 라이브러리의 다른 모든 가장자리와 같은 방식으로 기기 픽셀 격자에 앉습니다.

## 예시

### orientation

`vertical`이 기본값이고, 임의의 개수의 단계와 각 단계마다 임의의 분량을 담을 수 있는 쪽입니다. `horizontal`은 결제 화면 위쪽의 스테퍼이고, 라벨이 전부 짧을 때만 정직합니다.

<Demo src="timeline/horizontal">

<<< @/.vitepress/demos/timeline/horizontal.tsx

</Demo>

### color

전체 흐름에는 타임라인에, 한 단계만 바꾸려면 항목에 설정합니다 — 멀쩡한 흐름 안에서 실패한 단계에 필요한 것입니다.

```tsx
<MPTimeline color="primary" active={2}>
  <MPTimelineItem title="빌드" />
  <MPTimelineItem title="배포" color="error" status="current" />
</MPTimeline>
```

## `<ol>`입니다

이 컴포넌트가 존재하는 이유 그대로입니다. 순서가 **곧** 내용입니다. 순서 없는 목록 위에서 스크린 리더가 "항목 5개 목록"이라고 읽는다면 다른 것을 설명하고 있는 셈입니다.

아래에 Base UI 프리미티브가 없고, 있어서도 안 됩니다 — 타임라인에는 선택도, roving focus도, 키보드 계약도 없습니다. 복합 프리미티브를 꺼내 들면 사용자의 사건 기록에 위젯의 의미를 쥐여주게 됩니다.

## 함께 보기

- [MPList](./list) — 순서가 요점이 아닐 때.
- [MPBreadcrumb](./breadcrumb) — 벌어진 일의 기록이 아니라 되짚어 올라갈 수 있는 길.
