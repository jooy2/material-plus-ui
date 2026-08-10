---
title: MPSnackbar
order: 9
---

# MPSnackbar

<p class="mp-lede">이미 일어난 일에 대한 짧은 메시지이고, 애플리케이션 어디에서든 띄울 수 있습니다. 트리를 <code>MPSnackbarProvider</code>로 한 번 감싸면, 이후 모든 호출 지점은 무슨 일이 있었는지를 말하는 한 줄이 됩니다.</p>

<Demo src="snackbar/hero" :minHeight="80" />

```tsx
import { MPSnackbarProvider, useMPSnackbar } from 'material-plus-ui';

// 애플리케이션 바깥에서 한 번
<MPSnackbarProvider>
  <App />
</MPSnackbarProvider>;

// 그 아래 어디에서든
const snackbar = useMPSnackbar();

snackbar.add({ message: '메시지를 보관했습니다', actionLabel: '실행 취소', onAction: restore });
```

## 왜 이름이 Toast가 아닌가

머터리얼에는 이 컴포넌트의 이름이 있고, 그것은 snackbar입니다. "Toast"는 안드로이드의 더 오래된, 상호작용하지 않는 알림입니다 — 액션이 없고, 닫을 수 없으며, Material Design 3의 일부가 아닙니다 — 그래서 여기서 `Toast`라는 이름은 명세가 여전히 제공하는 컴포넌트의 이름을 다른 컴포넌트가 입고 있는 꼴이 됩니다.

## 컴포넌트가 아니라 hook

메시지가 필요해진 순간 호출자가 손에 쥐고 있는 것은 트리 안의 자리가 아니라 클릭 핸들러입니다. 계속 마운트해 두어야 하고 메시지마다 상태를 하나씩 두어야 하는 `<MPSnackbar open={…}/>`이야말로 이 컴포넌트가 피하려고 존재하는 모양입니다.

## `MPSnackbarProvider`

<PropsTable name="MPSnackbarProvider" />

## `useMPSnackbar()`

| 메서드                                          | 하는 일                                 |
| ----------------------------------------------- | --------------------------------------- |
| `add(options)`                                  | 스낵바를 띄우고 id를 돌려줍니다.        |
| `update(id, options)`                           | 화면에 이미 있는 것을 바꿉니다.         |
| `close(id?)`                                    | 하나를, 인자 없이 부르면 전부 닫습니다. |
| `promise(promise, { loading, success, error })` | 하나의 스낵바가 promise를 따라갑니다.   |
| `snackbars`                                     | 지금 스택에 있는 전부. 최신순입니다.    |

### `add(options)`

<PropsTable name="MPSnackbarOptions" />

## 예시

### message

제목과 본문이 아니라 한 칸입니다. MD3의 스낵바에는 보조 텍스트 한 줄(최대 두 줄)뿐이고 그 외에는 없습니다. 제목이 필요한 메시지는 스낵바가 아니라, 아직 보여주지 않은 대화상자입니다.

### actionLabel과 onAction

액션은 많아야 하나입니다. 이름만 아닐 뿐 text 버튼이고, `primary`가 아니라 `inverse-primary`를 읽습니다. 토큰이 존재하는 이유가 그것입니다 — `primary`는 **페이지**와 대비되도록 유도된 색이라, 페이지를 뒤집은 판 위에서는 읽히지 않도록 보장된 유일한 색입니다.

```tsx
snackbar.add({ message: '메시지를 보관했습니다', actionLabel: '실행 취소', onAction: restore });
```

### timeout

`0`이면 닫힐 때까지 남습니다. 사용자가 행동해야 하는 것에는 그쪽이 맞습니다 — 읽히기 전에 사라지는 스낵바는 아무 말도 하지 않은 것입니다.

### id

같은 id를 다시 쓰면 그 스낵바를 제자리에서 갱신하고 타이머를 다시 시작합니다. "업로드 중… / 업로드됨"이 원하는 것이 그것입니다. 겹쳐 쌓인 둘이 아니라 마음을 바꾼 하나.

### position

<Demo src="snackbar/position" :minHeight="120">

<<< @/.vitepress/demos/snackbar/position.tsx

</Demo>

`bottom-start`가 MD3의 배치입니다. 두 조각을 한 단어로 쓴 것은 둘이 독립이 아니기 때문입니다. 스낵바 스택은 언제나 위나 아래에 붙지, 옆에 붙지 않습니다.

### color

**기본값이 없고**, [MPTooltip](./tooltip)이 같은 이유로 내린 것과 같은 결정입니다. MD3의 스낵바는 `inverse-on-surface` 아래의 `inverse-surface`입니다. 중립 팔레트를 스킴의 _반대쪽_ 끝에서 읽은 것이라, 밝은 페이지에서는 판이 어둡고 어두운 페이지에서는 밝습니다.

값을 주면 강조 계열의 container로 바뀝니다. 메시지가 전부 한 종류인 애플리케이션이라면 그럴 만하지만, "이건 오류"라고 말하는 방법으로는 틀렸습니다. 오류가 있을 자리는 스낵바가 아닙니다.

## 접근성

- live region, 타이머와 hover·창 blur에서의 일시정지, limit, 스와이프, 스택으로 포커스를 옮기는 F6 단축키는 Base UI가 가집니다.
- `priority: 'high'`는 스크린 리더를 끊고 `low`는 쉬는 지점을 기다립니다. 오류는 끊을 만하고 저장 확인은 아닙니다.
- ×는 스택에 포커스가 오기 전까지 `aria-hidden`입니다. live region을 듣고 있는 사람이 지나가는 메시지마다 닫기 버튼을 듣지 않게 하기 위한 것이고, 포인터에게는 여전히 진짜 버튼입니다.

## 함께 보기

- [MPDialog](./dialog) — 일어난 일이 아니라 결정할 것이 있을 때.
- [MPTooltip](./tooltip) — 같은 이유로 `color`에 기본값이 없는 또 하나.
