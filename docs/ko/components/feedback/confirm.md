---
title: useMPConfirm
order: 12
---

# useMPConfirm

<p class="mp-lede">"정말 하시겠어요?"를 promise로. 클릭 핸들러가 묻고 boolean을 돌려받습니다.</p>

<Demo src="confirm/hero" :minHeight="200">

<<< @/.vitepress/demos/confirm/hero.tsx

</Demo>

```tsx
import { MPConfirmProvider, useMPConfirm } from 'material-plus-ui';

// 애플리케이션을 한 번 감싸고
<MPConfirmProvider>
  <App />
</MPConfirmProvider>;

// 그 아래 어디서든
const { confirm } = useMPConfirm();

async function remove() {
  const sure = await confirm({
    title: 'Delete this project?',
    description: 'Everything in it goes too, and it cannot be undone.',
    confirmLabel: 'Delete',
    color: 'error'
  });

  if (sure) {
    await api.delete(id);
  }
}
```

## Props

<PropsTable name="MPConfirmProvider" />

### 옵션

<PropsTable name="MPConfirmOptions" />

## 왜 직접 만든 다이얼로그가 아닌가

다이얼로그가 어려운 부분이 아니기 때문입니다. "정말 하시겠어요"에는 열림 상태 하나, _무엇을_ 확인하는지에 대한 상태 하나, 핸들러 둘, 그리고 있어야 할 자리가 아닌 곳에 마운트해 둔 [`MPDialog`](./dialog.md)가 필요합니다 — **호출 지점마다**. 그 순간 호출자가 실제로 가진 것은 클릭 핸들러이고, 돌려받고 싶은 것은 boolean입니다.

[`useMPSnackbar`](./snackbar.md)가 하는 거래를 반대 방향으로 돌린 것입니다. 스낵바는 할 말이고, 이건 물을 것입니다.

## 나머지 전부가 `false`입니다

| 읽는 사람이 한 것      | 무엇으로 resolve되는가 |
| ---------------------- | ---------------------- |
| 확인 버튼을 누름       | `true`                 |
| 취소를 누름            | `false`                |
| Escape                 | `false`                |
| 다이얼로그 바깥을 누름 | `false`                |

세 번째 결과가 없고 **promise는 절대 reject하지 않습니다**. 그래서 호출자는 `try`와 기본값이 아니라 `if` 하나를 씁니다. 모양이 boolean인 이유가 그것입니다 — 던지기도 하는 confirm은 모든 호출 지점이 두 번 처리해야 하는 confirm입니다.

## `alert`은 버튼 하나짜리입니다

```tsx
const { alert } = useMPConfirm();

await alert({ title: 'Saved', description: 'Your changes are on the server.' });
```

확인되면 `void`로 resolve합니다. 승인에는 거절할 것이 없고, 아무도 바꿀 수 없는 boolean은 호출자가 무시하는 법을 배워야 하는 값입니다. 같은 이유로 Escape도 resolve합니다.

## 애플리케이션 전체의 기본값

```tsx
<MPConfirmProvider defaults={{ size: 'sm', cancelLabel: 'Not now' }}>
  <App />
</MPConfirmProvider>
```

각 호출은 필요한 것을 여전히 말하고, 그쪽이 이깁니다.

## 색은 기본값이 아니라 결정입니다

`color`는 확인 버튼을 칠하고, `'error'`는 **파괴적인** 확인이 원하는 것입니다. 일부러 기본값이 아닙니다 — 대부분의 확인은 파괴적이지 않고, 전부에 빨간 버튼을 달면 그건 더 이상 경고가 아닙니다.

라벨도 같습니다. *Confirm*과 *Cancel*은 아무도 다르게 말하지 않을 때 그려지는 것이고 열여덟 개 언어로 번역돼 있습니다 — 다만 **Delete**라고 적힌 버튼은 읽는 사람에게 지금 무엇을 하려는지 말해 주고, *Confirm*이라고 적힌 버튼은 기억해 내라고 요구합니다.

## 날카로운 모서리

- **위에 `MPConfirmProvider`가 필요합니다.** 없으면 훅이 **throw**합니다. 조용히 영원히 resolve되지 않는 함수를 돌려주지 않습니다. 끝내 정착하지 않는 promise는 프로바이더가 빠졌다는 사실을 알리는 가장 어려운 방법입니다.
- **한 번에 하나입니다.** 하나가 열려 있는 동안 올린 두 번째 `confirm()`은 그것을 **대체**하고, 첫 번째 promise는 `false`로 resolve합니다. 일부러 큐가 아닙니다 — 큐는 읽는 사람이 이미 지나간 것에 대해 묻게 되고, 철 지난 질문의 답은 정보가 아닙니다.
- **`dismissible: false`는 나가는 길이 둘뿐인 다이얼로그**를 만들고, 둘 다 당신의 버튼입니다. 그 질문이 정말로 답해져야만 하는지 확인하세요.
- **렌더 중에 `await`하지 마세요.** 클릭 핸들러의 도구입니다.

## 다음

- [MPDialog](./dialog.md) — 이 모양이 맞지 않는 질문을 위한, 아래에 깔린 컴포넌트.
- [MPSnackbar](./snackbar.md) — 묻는 대신 말하는 쪽의 같은 발상.
