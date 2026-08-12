---
title: MPPopover
order: 10
---

# MPPopover

<p class="mp-lede">자기를 연 것 옆에 열리는 시트입니다. 툴팁과 달리 손이 닿습니다 — 닫힐 때까지 떠 있고, 안에 든 것을 누르고 입력할 수 있습니다.</p>

<Demo src="popover/hero" :minHeight="140" />

```tsx
import { MPPopover, MPPopoverClose, MPButton } from 'material-plus-ui';

<MPPopover trigger={<MPButton variant="outlined">이름 변경</MPButton>} title="이 뷰의 이름">
  <MPTextField label="이름" value={name} onChange={setName} fullWidth />
  <MPPopoverClose render={<MPButton>저장</MPButton>} />
</MPPopover>;
```

## Props

<PropsTable name="MPPopover" />

## 셋 중 무엇이 필요한지

팝오버, [툴팁](./tooltip), [다이얼로그](./dialog)는 모두 화면에 작은 시트를 올립니다. 서로 바꿔 쓸 수 없고, 차이는 읽는 사람이 그다음에 무엇을 _할 수 있는가_ 입니다.

|  | [툴팁](./tooltip) | **팝오버** | [다이얼로그](./dialog) |
| --- | --- | --- | --- |
| 열리는 계기 | 호버 또는 포커스 | 누름 | 누름 |
| 안으로 들어갈 수 있는지 | 아니요 — 다가가면 사라집니다 | 예 | 예 |
| 컨트롤을 담는지 | 아니요 | 예 | 예 |
| 뒤쪽 페이지 | 동작함 | 동작함 | 가져감 |
| 닫는 방법 | 벗어나기 | Escape, 바깥 클릭 | Escape, 스크림, 액션 |

툴팁은 이미 거기 있는 것에 붙는 **라벨**입니다. 팝오버는 페이지 **옆의 상세**입니다. 다이얼로그는 페이지 **대신 던지는 질문**입니다.

## 표면

레벨 2의 `surface-container`와 `corner-medium`입니다. MD3가 메뉴와 rich tooltip에 주는 값이고, 명세에서 이것 — 컨트롤에 붙은 작은 시트 — 에 해당하는 것이 그 둘입니다.

일부러 다이얼로그의 레벨 3 `surface-container-high`가 **아닙니다**. 팝오버는 페이지를 가져가지 않았고, 마찬가지로 가져가지 않은 메뉴들보다 위에 앉아서도 안 됩니다.

`variant`도 `color`도 없는데, 다이얼로그가 대는 이유와 같습니다. 다섯 무게는 "이 표면이 페이지에 대해 스스로를 얼마나 주장하는가"에 답하고, 요청을 받아야만 나타난 팝업은 이미 답했습니다. 그리고 물들 수 있는 팝오버는 누군가 그 안에 넣은 폼을 물들이게 됩니다.

## 배치

<Demo src="popover/placement" :minHeight="120">

<<< @/.vitepress/demos/popover/placement.tsx

</Demo>

`side`는 지시가 아니라 **선호**입니다. 자리가 없으면 Base UI가 팝업을 반대편으로 뒤집는데, 그게 옳은 동작입니다. 화면 밖으로 절반 걸친 팝업은 트리거 반대편에 놓인 팝업보다 나쁩니다.

`side`는 물리적(`top`, `right`, `bottom`, `left`)입니다. 팝업이 이동하는 축이기 때문입니다 — 트리거 위에 뜬 팝오버는 어느 표기 방향에서든 위에 있습니다. `align`은 논리적(`start`, `center`, `end`)입니다. 한 변을 따라가는 위치이고, 그 변은 RTL에서 반대로 흐르기 때문입니다.

### arrow

기본은 꺼짐이고, MD3가 메뉴와 rich tooltip 양쪽에 하는 것도 그렇습니다. 자기를 연 컨트롤에서 8픽셀 떨어진 팝업은 자기가 무엇에 속하는지 따로 말할 필요가 없습니다. 트리거가 그 말이 필요할 만큼 멀 때 켜세요.

## 예시

### MPPopoverClose

uncontrolled 팝오버에는 Cancel 버튼이 부를 `setOpen`이 없고, 모든 팝오버를 controlled로 만드는 건 버튼 하나에 답하려고 팝오버마다 상태를 두는 일입니다.

```tsx
<MPPopoverClose render={<MPButton variant="text">취소</MPButton>} />
```

### modal

기본은 `false`이고, 그것이 팝오버와 다이얼로그를 가릅니다. 뒤쪽 페이지는 계속 스크롤되고 눌립니다. 페이지 옆의 상세가 페이지를 멈춰 세워서는 안 되기 때문입니다.

`'trap-focus'`는 스크롤을 잠그지 않고 포커스만 팝업 안에 붙잡아 둡니다. 폼 컨트롤이 가득한 팝오버가 보통 원하는 것입니다.

### dismissible

스스로 나갈 길을 가진 팝업에서만 끄세요. 다른 길이 없어집니다. Escape, 바깥 클릭, 포커스 이탈이 모두 취소됩니다. `MPPopoverClose`와 코드에 의한 닫기는 그대로 동작하고, 그래서 `dismissible={false}`가 덫이 되지 않습니다.

### width

`size`가 함의하는 상한을 덮어씁니다. _내용_ 이 너비를 정하는 팝오버 — 폼, 도움말 한 줄 — 를 위한 것입니다.

```tsx
<MPPopover width={420} title="이름 변경">
  …
</MPPopover>
```

클래스가 아니라 인라인 스타일인 이유는, Tailwind가 소스 텍스트를 훑어 클래스를 찾기 때문에 prop으로 만든 `max-w-[420px]`은 아무 규칙도 만들어 내지 않기 때문입니다.

## 접근성

- `title`과 `description`은 `aria-labelledby`·`aria-describedby`로 연결되어, 팝업이 이름 없는 그룹으로 읽히지 않고 스스로를 알립니다.
- 어떤 방식으로 닫혔든 포커스는 트리거로 돌아갑니다.
- 트리거는 `aria-expanded`와 팝업의 id를 가집니다. 전부 Base UI의 것입니다.
- ×는 이름이 있는 진짜 버튼이고 헤더의 처음이 아니라 마지막에 있습니다. 그래서 읽는 사람은 나가는 방법보다 팝업이 무엇에 대한 것인지를 먼저 듣습니다.
- 팝오버는 live region이 **아닙니다**. 누군가 무언가를 눌러서 나타난 것이고, 그렇게 한 사람은 이미 알고 있습니다.

## 함께 보기

- [MPTooltip](./tooltip) — 읽는 사람이 들어갈 수 없는 라벨.
- [MPDialog](./dialog) — 먼저 대답해야 하는 질문.
- [MPMenu](../inputs/menu) — 액션 목록. 자기만의 키보드 동작이 있습니다.
