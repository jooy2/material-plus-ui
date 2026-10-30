---
title: MPAlert
order: 1
---

# MPAlert

<p class="mp-lede">방금 일어난 일에 대한 메시지를, 그 일이 벌어진 페이지 안에 놓습니다. 슬롯을 어디까지 채우느냐가 다를 뿐 하나의 컴포넌트입니다 — 한 줄, 글리프가 붙은 한 줄, 그리고 제목과 그 아래 상세.</p>

<Demo src="alert/hero" :minHeight="180" />

::: fw react

```tsx
import { MPAlert, MPButton } from 'material-plus-ui';

<MPAlert
  color="error"
  title="카드 결제에 실패했습니다"
  action={<MPButton variant="text">다시 시도</MPButton>}
  onClose={dismiss}
>
  은행에서 결제를 거절했습니다. 청구된 금액은 없습니다.
</MPAlert>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPAlert(
  color: MPColor.error,
  title: const Text('카드 결제에 실패했습니다'),
  action: MPButton(variant: MPVariant.text, onPressed: retry, child: const Text('다시 시도')),
  onClose: dismiss,
  child: const Text('은행에서 결제를 거절했습니다. 청구된 금액은 없습니다.'),
);
```

:::

## Props

<PropsTable name="MPAlert" />

## 스낵바가 아닌 이유

얼럿은 자신이 끼어든 페이지의 흐름에 속합니다. [스낵바](./snackbar)는 그 위를 떠다니다가 시간이 지나면 사라집니다.

이건 스타일의 차이가 아니고, 둘 중 무엇을 쓸지를 가르는 기준 전부입니다.

- 읽는 사람이 **무언가 해야 하는** 메시지는, 읽히기도 전에 사라질 수 있으면 안 됩니다.
- 페이지의 **현재 상태**에 대한 메시지는, 다시 봤을 때 여전히 거기 있어야 합니다.
- 놓쳐도 아무 일 없는 메시지라면 그건 스낵바입니다.

또 하나. 둘 중 나중에 도착해서 읽을 수 있는 건 얼럿뿐입니다. 페이지가 열리기 전에 띄운 스낵바는 아무도 못 본 스낵바입니다.

## 기본 variant가 `tonal`인 이유

이 라이브러리의 다른 컴포넌트는 대체로 가장 큰 소리를 기본값으로 두고, 버튼은 `filled`입니다. 얼럿은 그렇지 않습니다.

컨테이너 톤은 페이지 안에 놓인 메시지에 대한 MD3 자신의 답입니다. 표면에서 분리되면서도, 보통 바로 옆에 앉아 있는 주요 액션과 경쟁하지 않습니다. 채도 높은 얼럿이 세 개 놓인 화면에는, 정작 눌러야 할 것에 쓸 강조가 남아 있지 않습니다.

<Demo src="alert/variants" :minHeight="420">

::: fw react

<<< @/.vitepress/demos/alert/variants.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/alert/variants.dart

:::

</Demo>

무엇이 달라지는지 보세요. `filled`와 `tonal`에서는 컨테이너 자체가 강조 색이므로 글리프와 제목이 그 위에 한 가지 잉크로 얹힙니다. 나머지 중립적인 세 표면에서는 강조 색이 갈 데가 없으므로, 이게 어떤 종류의 얼럿인지를 말하는 딱 두 가지 — 글리프와 제목 — 에만 쓰이고 본문은 평범한 읽기 텍스트로 남습니다.

## 심각도 사다리가 아니라 네 계열

`info`, `success`, `warning`은 없습니다.

명세의 색 시스템에 그런 역할이 없고, [토큰 시트](../../design/color)가 그것들을 만들어 낼 방법도 없습니다. 계열을 셋 더 제공한다는 건 테마가 생산할 수 없는 역할을 약속하는 일이고, `primary`를 테마로 바꾼 애플리케이션은 "success" 얼럿만 그대로인 상황을 만나게 됩니다.

대신 있는 것: 머터리얼이 실제로 이름 붙인 유일한 심각도인 `error`, 그리고 나머지에 대한 강조 선택. 팔레트에 해당하는 단어가 없는 의미는 색을 빌리는 대신 **글리프**로 말합니다.

<Demo src="alert/colors" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/alert/colors.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/alert/colors.dart

:::

</Demo>

## 어느 live region에 들어가는지

메시지가 얼마나 급한지 아는 건 계열뿐이므로, 기본값은 계열이 결정합니다.

| `color`                            | `live`      | 하는 일                                   |
| ---------------------------------- | ----------- | ----------------------------------------- |
| `error`                            | `assertive` | 스크린 리더가 읽던 문장을 끊고 끼어듭니다 |
| `primary`, `secondary`, `tertiary` | `polite`    | 다음 쉬는 지점까지 기다립니다             |

"실패했습니다"는 끼어들 만하고 "저장했습니다"는 그렇지 않습니다.

`live`로 덮어쓸 수 있고, 알아둘 만한 값은 세 번째입니다. **live region은 _도착하는_ 내용을 위한 것입니다.** 페이지가 열릴 때 이미 마크업에 있던 알림은 도착한 게 아니라 페이지의 일부이고, 그걸 읽으려고 끼어드는 건 독자가 어차피 도달할 문장 때문에 끼어드는 것입니다.

::: fw react

```tsx
// 서버가 렌더한 오류 요약. 화면에는 여전히 알림이지만, 공지는 아닙니다.
<MPAlert color="error" live="off">
  세 개 항목을 확인해 주세요.
</MPAlert>
```

:::

::: fw flutter

```dart
// 화면이 만들어질 때부터 있던 오류 요약. 여전히 알림이지만, 공지는 아닙니다.
const MPAlert(
  color: MPColor.error,
  live: MPAlertLive.off,
  child: Text('세 개 항목을 확인해 주세요.'),
);
```

:::

반대 방향도 있습니다 — 계열은 조용하지만 실제로는 급한 메시지:

::: fw react

```tsx
<MPAlert live="assertive">1분 후 세션이 종료됩니다.</MPAlert>
```

:::

::: fw flutter

```dart
const MPAlert(live: MPAlertLive.assertive, child: Text('1분 후 세션이 종료됩니다.'));
```

Flutter의 live region은 공손함 단계가 하나뿐이고, 그 단계는 polite입니다. 그래서 웹이 아닌 곳에서는 assertive 얼럿도 polite 얼럿처럼 다음 쉬는 지점에 읽힙니다. 웹 엔진은 노드의 역할도 읽으므로, 웹에서는 assertive 얼럿이 React 빌드처럼 `role="alert"`가 됩니다. `MPAlertLive.off`는 어느 쪽에서도 live region이 아닙니다.

:::

## 예시

### title

제목이 있으면 두 부분이 되고, 없으면 전체가 한 줄입니다. 제목 아래의 본문은 `on-surface-variant`로 한 걸음 물러납니다. 필드의 보조 텍스트가 쓰는 것과 같은 역할입니다. 제목이 없으면 본문이 곧 얼럿이므로 읽기 텍스트 그대로 남습니다.

::: fw react

```tsx
<MPAlert>한 줄.</MPAlert>

<MPAlert title="두 부분">그리고 그 아래의 상세.</MPAlert>
```

:::

::: fw flutter

```dart
const MPAlert(child: Text('한 줄.'));

const MPAlert(title: Text('두 부분'), child: Text('그리고 그 아래의 상세.'));
```

:::

### icon

`color`에 맞는 글리프가 기본값입니다. 기본값이 둘뿐인 이유는 정직한 게 둘뿐이기 때문입니다. error 계열은 오류 글리프를, 나머지는 정보 글리프를 받습니다.

::: fw react

```tsx
<MPAlert icon={false}>글리프 없이.</MPAlert>

<MPAlert icon={<MPIcon icon={ICONS.success} size={20} />}>더 구체적인 의미로.</MPAlert>
```

:::

::: fw flutter

```dart
const MPAlert(showIcon: false, child: Text('글리프 없이.'));

MPAlert(icon: MPIcon(icon: mySet.success, size: 20), child: const Text('더 구체적인 의미로.'));
```

Dart에는 `null`도 위젯도 아닌 값이 없으므로, "빼 달라"는 `icon`의 세 번째 값이 아니라 `showIcon: false`로 말합니다.

:::

글리프는 메시지 전체가 아니라 **첫 줄**에 맞춰 중앙에 놓입니다. 그래서 한 줄짜리 얼럿은 가운데 정렬로 보이고, 세 줄짜리도 글리프는 여전히 맨 위에 있습니다.

### action과 onClose

`action`은 메시지가 줄바꿈되어도 첫 줄에 남도록 `children`과 분리했습니다. `onClose`는 그것을 넘기는 일 자체가 ×를 만드는 일입니다. `dismissible` boolean이 없는 이유는, 호출할 대상이 없는 닫기 버튼은 아무 일도 하지 않는 버튼이기 때문입니다.

::: fw react

```tsx
<MPAlert action={<MPButton variant="text">다시 시도</MPButton>} onClose={() => setShown(false)}>
  업로드에 실패했습니다.
</MPAlert>
```

:::

::: fw flutter

```dart
MPAlert(
  action: MPButton(variant: MPVariant.text, onPressed: retry, child: const Text('다시 시도')),
  onClose: () => setState(() => shown = false),
  child: const Text('업로드에 실패했습니다.'),
);
```

:::

`onClose`는 ×를 누른 순간이 아니라 얼럿이 다 빠져나간 뒤에 호출됩니다. 얼럿은 페이지의 흐름 안에 있으므로, 누르면 먼저 자기 높이를 접고 그 아래 내용이 빈자리를 메웁니다. `onClose`를 받았을 때 얼럿을 빼면 됩니다. 동작 줄이기 설정이나 Flutter의 `MediaQuery.disableAnimations`가 켜져 있으면 바로 호출됩니다.

### locale

×에는 자기 텍스트가 없으므로, 그 접근성 이름은 이 라이브러리가 지어내야 하는 단어입니다. `locale`에서, 또는 가장 가까운 [`MPLocaleProvider`](../../design/localization)에서, 둘 다 맞지 않으면 `closeLabel`에서 옵니다.

::: fw react

```tsx
<MPAlert locale="ko" onClose={dismiss}>
  저장했습니다.
</MPAlert>
```

:::

::: fw flutter

```dart
MPAlert(locale: 'ko', onClose: dismiss, child: const Text('저장했습니다.'));
```

:::

## 접근성

::: fw react

- 얼럿 전체가 live region이므로, 페이지가 로드된 뒤에 나타난 메시지도 읽힙니다. 어느 종류인지는 위 표를 보세요.
- ×는 이름이 있는 진짜 버튼이고, 행의 처음이 아니라 마지막에 있습니다. 그래서 읽는 사람은 나가는 방법보다 메시지를 먼저 듣습니다.
- 기본 글리프는 장식이라 접근성 트리에서 빠집니다. 그것이 가리키는 계열은 이미 문장 안에 있습니다.

:::

::: fw flutter

- 얼럿은 시맨틱 노드 하나이고, `live`가 `MPAlertLive.off`가 아니면 live region입니다. 그래서 화면이 만들어진 뒤에 나타난 메시지도 읽힙니다.
- ×는 이름을 가진 별도의 버튼 노드이고 메시지 뒤에 있습니다. 그래서 읽는 사람은 나가는 방법보다 메시지를 먼저 듣습니다. <kbd>Tab</kbd>으로 닿고 <kbd>Enter</kbd>나 <kbd>Space</kbd>로 누릅니다. 포커스 링은 `secondary`이고, 키보드로 포커스가 왔을 때만 버튼 바깥에 그려집니다.
- 누른 순간부터 사라질 때까지 얼럿은 시맨틱 트리와 포커스 순서와 포인터에서 빠집니다. 나가는 중인 얼럿에는 아무것도 들어갈 수 없습니다.
- 기본 글리프는 스크린 리더에 아무것도 말하지 않습니다. 그것이 가리키는 계열은 이미 문장 안에 있습니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `children` | `child` | Flutter의 이름입니다. |
| `icon={false}` | `showIcon: false` | Dart에는 `null`도 위젯도 아닌 값이 없습니다. |
| 문자열 `live` | `MPAlertLive` 값의 `live` | 세 값은 같습니다. Flutter의 live region은 단계가 하나뿐이라, 웹이 아닌 곳에서는 assertive 얼럿도 polite로 읽힙니다. |
| `onClose(event)` | `onClose()` | 돌려줄 이벤트 객체가 없습니다. 얼럿이 다 빠져나간 뒤에 호출되는 것은 같습니다. |
| `transition` | — | 등장 효과는 얼럿을 `MPAnimateFade`나 그 형제 컴포넌트로 감싸서 줍니다. |
| `className`, `style`, 네이티브 속성 | — | 넘겨줄 곳이 없습니다. |

:::

## 함께 보기

- [MPSnackbar](./snackbar) — 놓쳐도 되는 메시지.
- [MPDialog](./dialog) — 다른 무엇보다 먼저 대답해야 하는 메시지.
- [MPEmpty](./empty) — 내용이 없는 영역. 이건 다른 문제입니다.
