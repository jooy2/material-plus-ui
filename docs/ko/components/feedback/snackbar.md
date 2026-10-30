---
title: MPSnackbar
order: 9
---

# MPSnackbar

<p class="mp-lede">이미 일어난 일에 대한 짧은 메시지이고, 애플리케이션 어디에서든 띄울 수 있습니다. 트리를 <code>MPSnackbarProvider</code>로 한 번 감싸면, 이후 모든 호출 지점은 무슨 일이 있었는지를 말하는 한 줄이 됩니다.</p>

<Demo src="snackbar/hero" :minHeight="80" />

::: fw react

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

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

// 앱 안에서 한 번
WidgetsApp(
  // …
  builder: (BuildContext context, Widget? child) => MPSnackbarProvider(child: child!),
);

// 그 아래 어디에서든
MPSnackbarProvider.of(context).add(
  MPSnackbarOptions(
    message: const Text('메시지를 보관했습니다'),
    actionLabel: const Text('실행 취소'),
    onAction: restore,
  ),
);
```

provider는 앱 바깥이 아니라 앱 안에 둡니다. 앱 바깥에는 아직 `Directionality`가 없기 때문입니다. 스택은 provider가 감싼 것 위에 그려지므로 `Overlay`가 필요 없습니다. `builder` 안에 두면 navigator 위에 놓이고, navigator가 여는 모든 페이지와 대화상자가 스택 아래에 들어갑니다.

:::

## 왜 이름이 Toast가 아닌가

머터리얼에는 이 컴포넌트의 이름이 있고, 그 이름은 snackbar입니다. "Toast"는 안드로이드의 더 오래된 알림으로, 액션이 없고 닫을 수 없으며 Material Design 3에 들어 있지 않습니다. 그래서 여기서 `Toast`라는 이름을 쓰면, 명세가 여전히 제공하는 컴포넌트의 이름을 다른 컴포넌트가 빌려 입는 셈이 됩니다.

::: fw react

## 컴포넌트가 아니라 hook

메시지가 필요해진 순간 호출자 손에 있는 것은 트리 안의 자리가 아니라 클릭 핸들러입니다. 계속 마운트해 두고 메시지마다 상태를 하나씩 두어야 하는 `<MPSnackbar open={…}/>`가 바로 이 컴포넌트가 피하려는 모양입니다.

:::

::: fw flutter

## 위젯이 아니라 컨트롤러

메시지가 필요해진 순간 호출자 손에 있는 것은 트리 안의 자리가 아니라 콜백입니다. 계속 마운트해 두고 메시지마다 상태를 하나씩 두어야 하는 `MPSnackbar(open: …)`가 바로 이 컴포넌트가 피하려는 모양입니다.

`MPSnackbarProvider.of(context)`는 `MPSnackbarController`를 돌려줍니다. `Navigator.of`와 같은 방식의 조회입니다. context 위에 provider가 없으면 assert로 멈추고, `MPSnackbarProvider.maybeOf`는 그 대신 `null`을 돌려줍니다.

:::

## `MPSnackbarProvider`

<PropsTable name="MPSnackbarProvider" />

::: fw react

## `useMPSnackbar()`

| 메서드                                          | 하는 일                                 |
| ----------------------------------------------- | --------------------------------------- |
| `add(options)`                                  | 스낵바를 띄우고 id를 돌려줍니다.        |
| `update(id, options)`                           | 화면에 이미 있는 것을 바꿉니다.         |
| `close(id?)`                                    | 하나를, 인자 없이 부르면 전부 닫습니다. |
| `promise(promise, { loading, success, error })` | 하나의 스낵바가 promise를 따라갑니다.   |
| `snackbars`                                     | 지금 스택에 있는 전부. 최신순입니다.    |

### `add(options)`

:::

::: fw flutter

## `MPSnackbarController`

| 메서드 | 하는 일 |
| --- | --- |
| `add(options)` | 스낵바를 띄우고 id를 돌려줍니다. |
| `update(id, options)` | 화면에 이미 있는 것을 바꿉니다. 주지 않은 필드는 값이 그대로입니다. |
| `close([id])` | 하나를, 인자 없이 부르면 전부 닫습니다. |
| `promise(future, loading:, success:, error:)` | 스낵바 하나가 future를 따라가고, 그 값이나 오류를 넘겨줍니다. |
| `snackbars` | 부른 순간 스택에 있는 전부. 최신순입니다. |

`success`와 `error`는 결과를 옵션으로 바꾸는 함수입니다. `snackbars`는 그 순간의 사본이라, 스택이 바뀌어도 무엇을 다시 빌드하지는 않습니다.

### `MPSnackbarOptions`

`add`와 `update` 모두 이것을 받습니다. 메시지를 설명하는 값이고 위젯이 아니며, 호출자가 트리에 넣는 일은 없습니다.

:::

<PropsTable name="MPSnackbarOptions" />

## 예시

### message

제목과 본문이 아니라 한 칸입니다. MD3의 스낵바에는 보조 텍스트 한 줄(최대 두 줄)만 있습니다. 제목이 필요한 메시지는 스낵바가 아니라, 아직 보여주지 않은 대화상자입니다.

### actionLabel과 onAction

액션은 많아야 하나입니다. 이름만 다를 뿐 text 버튼이고, `primary`가 아니라 `inverse-primary`를 씁니다. 그 토큰이 있는 이유가 이것입니다. `primary`는 **페이지**와 대비되도록 만든 색이라, 페이지를 뒤집은 판 위에서는 오히려 읽히지 않습니다.

::: fw react

```tsx
snackbar.add({ message: '메시지를 보관했습니다', actionLabel: '실행 취소', onAction: restore });
```

:::

::: fw flutter

```dart
snackbar.add(
  MPSnackbarOptions(
    message: const Text('메시지를 보관했습니다'),
    actionLabel: const Text('실행 취소'),
    onAction: restore,
  ),
);
```

:::

액션을 눌러도 스낵바는 닫히지 않습니다. 닫고 싶다면 액션이 id로 직접 닫습니다.

### timeout

<Fw react="`0`" flutter="`Duration.zero`" />이면 닫힐 때까지 남습니다. 사용자가 행동해야 하는 메시지에는 그쪽이 맞습니다. 읽히기 전에 사라지는 스낵바는 아무 말도 하지 않은 셈입니다.

포인터가 스낵바 위에 머무는 동안, 키보드 포커스가 액션이나 ×에 있는 동안, 애플리케이션이 백그라운드에 있거나 창이 포커스를 잃은 동안에는 시계가 멈춥니다. 다시 움직일 때는 멈춘 자리에서 이어갑니다.

### id

같은 id를 다시 쓰면 그 스낵바를 제자리에서 갱신하고 타이머를 다시 시작합니다. "업로드 중… / 업로드됨"에 필요한 동작이 이것입니다. 둘이 겹쳐 쌓이는 대신, 하나가 내용을 바꿉니다.

### position

<Demo src="snackbar/position" :minHeight="120">

::: fw react

<<< @/.vitepress/demos/snackbar/position.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/snackbar/position.dart

:::

</Demo>

<Fw react="`bottom-start`" flutter="`MPSnackbarPosition.bottomStart`" />가 MD3의 배치입니다. 두 조각을 한 단어로 쓴 것은 둘이 독립이 아니기 때문입니다. 스낵바 스택은 언제나 위나 아래에 붙고, 옆에는 붙지 않습니다.

이 값은 판이 움직이는 방향도 정합니다. 스낵바는 스택이 붙은 가장자리에서 200ms 동안 들어오고, 같은 쪽으로 나갑니다.

::: fw react

어느 쪽으로 밀어 없앨 수 있는지도 같은 사실에서 정해지고, 둘은 일치해야 합니다. 위에서 내려왔는데 위로만 밀어낼 수 있는 판은 되돌려 달라고 하는 것처럼 보입니다.

움직임을 줄여 달라고 설정한 사용자에게는 이동 없이 페이드만 남습니다.

:::

::: fw flutter

스낵바는 옆으로 밀어서 없앨 수 있습니다. 움직임을 줄여 달라고 설정한 사용자에게는 페이드도 이동도 없이 바로 나타납니다.

:::

스낵바 하나만 provider가 고른 스택을 벗어날 수 있고, `add`에 같은 이름의 값을 주면 됩니다.

::: fw react

```tsx
snackbar.add({ message: '저장하지 못했습니다', position: 'top-center' });
```

:::

::: fw flutter

```dart
snackbar.add(
  const MPSnackbarOptions(
    message: Text('저장하지 못했습니다'),
    position: MPSnackbarPosition.topCenter,
  ),
);
```

:::

아래쪽 구석이 툴바인 페이지의 오류처럼, _무엇인지 때문에_ 자리가 달라져야 하는 메시지를 위한 값입니다. 취향을 위한 값은 아닙니다. 스낵바가 전부 같은 엉뚱한 자리에 뜬다면 provider를 옮기세요.

::: fw react

여섯 스택은 `aria-live` 영역 하나를 함께 쓰고, 그 영역은 안이 비어 있어도 첫 렌더부터 페이지에 있습니다. 숨겨 둘 만한 구현 세부가 아닙니다. 안의 메시지와 같은 순간에 문서에 들어온 영역은 스크린 리더가 비교할 대상이 없어 읽지 않습니다. 영역은 창 전체를 덮되 포인터를 모두 통과시키고, 각 모서리의 스택은 그 모서리에 메시지가 생기면 영역 안에 그려집니다. 영역이 여섯이 아니라 하나라서 우선순위가 높은 메시지도 한 번만 읽힙니다.

:::

::: fw flutter

스택은 판 옆을 누른 입력을 모두 애플리케이션으로 넘기고, 메시지마다 자기 live region을 가집니다(접근성 참고).

:::

### color

**기본값이 없습니다.** [MPTooltip](./tooltip)이 같은 이유로 내린 결정과 같습니다. MD3의 스낵바는 `inverse-surface` 바탕에 `inverse-on-surface` 글자입니다. 중립 팔레트를 스킴의 _반대쪽_ 끝에서 읽은 색이라, 밝은 페이지에서는 판이 어둡고 어두운 페이지에서는 밝습니다.

값을 주면 그 강조 계열의 container로 바뀝니다. 메시지가 전부 한 종류인 애플리케이션이라면 그럴 만하지만, "이건 오류"라고 말하는 방법으로는 맞지 않습니다. 오류가 있을 자리는 스낵바가 아닙니다.

## 접근성

::: fw react

- live region, 타이머와 hover·창 blur에서의 일시정지, limit, 스와이프, 스택으로 포커스를 옮기는 F6 단축키는 Base UI가 맡습니다.
- `priority: 'high'`는 스크린 리더를 끊고 `low`는 쉬는 지점을 기다립니다. 오류는 끊을 만하고 저장 확인은 아닙니다.
- ×는 스택에 포커스가 오기 전까지 `aria-hidden`입니다. live region을 듣는 사람이 지나가는 메시지마다 닫기 버튼을 듣지 않게 하려는 것이고, 포인터에게는 여전히 진짜 버튼입니다.

:::

::: fw flutter

- live region은 메시지 하나뿐입니다. 스크린 리더는 사용자가 그쪽으로 옮겨 가지 않아도 메시지를 읽고, 지나가는 메시지마다 "닫기"를 덧붙여 읽지 않습니다.
- 액션과 ×는 따로 떨어진 노드이고, 판 위의 평범한 포커스 정지점입니다. ×의 이름은 `closeLabel`이거나 `locale`의 "닫기"입니다.
- 두 우선순위 모두 사용자가 쉬는 지점에서 읽힙니다. Flutter의 live region에는 공손한 단계 하나뿐이라, React 빌드처럼 `high`가 말을 끊지는 못합니다.
- 포인터가 판 위에 머물거나, 손가락이 판을 누르고 있거나, 키보드 포커스가 스택 안에 있거나, 애플리케이션이 전면에서 벗어나면 시계가 멈춥니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `useMPSnackbar()` | `MPSnackbarProvider.of(context)` | 위에 있는 것을 찾는 Flutter의 방식입니다. |
| `MPSnackbarData` | `MPSnackbarOptions`에 포함 | Base UI는 모양을 자기 필드 옆의 `data` 칸에 두지만, 여기서는 클래스 하나입니다. |
| 밀리초 단위의 `timeout` | `Duration` | 시간의 길이를 나타내는 Dart의 타입입니다. |
| `promise(…, { success, error })`의 객체 | 함수만 | Dart에는 값과 함수의 합집합 타입이 없고, `(_) => options`가 같은 뜻입니다. |
| 스낵바의 `className` | 없음 | 클래스를 걸 스타일시트가 없습니다. |
| 말을 끊는 `priority: 'high'` | 공손하게 읽힘 | Flutter의 live region에는 공손한 단계 하나뿐입니다. |
| 스택으로 포커스를 옮기는 F6 | 없음 | 액션과 ×는 평범한 포커스 정지점이라 다른 것처럼 순회로 닿습니다. |
| 가장자리 쪽이나 옆으로 밀어 없애기 | 옆으로만 | `Dismissible`은 한 축만 받고, 엄지가 먼저 닿는 쪽은 가로입니다. |
| 움직임을 줄이면 페이드 | 움직임 없음 | Flutter의 `disableAnimations`는 움직임을 없애 달라는 뜻이고, 모든 컴포넌트가 그렇게 따릅니다. |
| 숫자나 CSS 길이인 `width` | `double` | 길이는 논리 픽셀 하나뿐입니다. |

:::

## 함께 보기

- [MPDialog](./dialog) — 일어난 일이 아니라 결정할 것이 있을 때.
- [MPTooltip](./tooltip) — 같은 이유로 `color`에 기본값이 없는 또 하나의 컴포넌트.
