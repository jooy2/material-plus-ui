---
title: MPPopconfirm
order: 13
---

# MPPopconfirm

<p class="mp-lede">컨트롤이 있는 자리에 그대로 머무는 확인.</p>

<Demo src="popconfirm/hero" :minHeight="220">

<<< @/.vitepress/demos/popconfirm/hero.tsx

</Demo>

```tsx
import { MPPopconfirm } from 'material-plus-ui';

<MPPopconfirm
  trigger={<MPButton color="error">Delete</MPButton>}
  title="Delete this row?"
  confirmLabel="Delete"
  color="error"
  onConfirm={() => remove(id)}
/>;
```

## Props

<PropsTable name="MPPopconfirm" />

## `useMPConfirm` 대신 이걸 쓸 때

둘은 같은 질문을 합니다. 다른 것은 **읽는 사람의 눈이 어디에 있는가**이고, 그건 취향이 아니라 실재하는 차이입니다.

|             | `MPPopconfirm` | [`useMPConfirm`](./confirm.md) |
| ----------- | -------------- | ------------------------------ |
| 나타나는 곳 | 컨트롤 옆      | 화면 한가운데                  |
| 뒤의 페이지 | 그대로         | 스크림 아래로                  |
| 비용        | 엘리먼트 하나  | 프로바이더                     |
| 답하는 방식 | 콜백           | promise                        |

**삭제 버튼 열두 개가 늘어선 행**이 이쪽의 경우입니다. 표를 덮는 모달은 읽는 사람이 가리키고 있던 행을 빼앗고, 그 뒤에 다시 찾아야 하는 것이 바로 엉뚱한 행이 지워지는 방식입니다.

**페이지**에 관한 확인 — 저장하지 않고 떠나기, 되돌릴 수 없는 계정 작업 — 은 모달을 원합니다. 애초에 페이지 위의 어떤 것에 관한 질문이 아니기 때문입니다.

## 나가는 나머지 길은 전부 *아니오*입니다

Escape, 바깥 누름, 취소 버튼 셋 다 확인 없이 닫고 `onCancel`을 부릅니다. [`useMPConfirm`](./confirm.md)이 따르는 그 규칙이고 이유도 같습니다 — "정말인가요"의 안전한 답은 아니오입니다.

여는 것은 답이 **아니므로** 두 핸들러 모두 호출되지 않습니다.

## 다이얼로그가 아니라 팝오버입니다

포커스를 가두지 않고, 뒤의 페이지는 살아 있습니다. 그게 이 모양의 요점입니다 — 동시에 읽는 사람이 Tab으로 질문에서 걸어 나갈 수 있다는 뜻이기도 하고, 모달이라면 허용하지 않을 일입니다.

답이 정말로 주어져야만 하는 곳에서는 모달을 쓰세요.

## 날카로운 모서리

- **트리거는 ref를 받고 prop을 spread할 수 있어야 합니다.** Material Plus 컴포넌트는 전부 그렇습니다. 직접 만든 맨 함수 컴포넌트는 아닐 수 있습니다.
- **`color`는 "예" 버튼만 칠하고**, `error`는 기본이 아닙니다 — [`useMPConfirm`](./confirm.md)이 대는 이유와 같습니다.
- **버튼 문구는 번역되고 질문은 되지 않습니다.** *Confirm*과 *Cancel*은 유효한 언어에서 오고, `title`과 `description`은 여러분의 카피입니다.

## 다음

- [useMPConfirm](./confirm.md) — 화면 한가운데의 같은 질문.
- [MPPopover](./popover.md) — 질문이 아닌 팝업을 위한, 아래에 깔린 컴포넌트.
