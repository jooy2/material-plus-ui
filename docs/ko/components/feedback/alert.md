---
title: MPAlert
order: 1
---

# MPAlert

<p class="mp-lede">방금 일어난 일에 대한 메시지를, 그 일이 벌어진 페이지 안에 놓습니다. 슬롯을 어디까지 채우느냐가 다를 뿐 하나의 컴포넌트입니다 — 한 줄, 글리프가 붙은 한 줄, 그리고 제목과 그 아래 상세.</p>

<Demo src="alert/hero" :minHeight="180" />

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

<<< @/.vitepress/demos/alert/variants.tsx

</Demo>

무엇이 달라지는지 보세요. `filled`와 `tonal`에서는 컨테이너 자체가 강조 색이므로 글리프와 제목이 그 위에 한 가지 잉크로 얹힙니다. 나머지 중립적인 세 표면에서는 강조 색이 갈 데가 없으므로, 이게 어떤 종류의 얼럿인지를 말하는 딱 두 가지 — 글리프와 제목 — 에만 쓰이고 본문은 평범한 읽기 텍스트로 남습니다.

## 심각도 사다리가 아니라 네 계열

`info`, `success`, `warning`은 없습니다.

명세의 색 시스템에 그런 역할이 없고, [토큰 시트](../../design/color)가 그것들을 만들어 낼 방법도 없습니다. 계열을 셋 더 제공한다는 건 테마가 생산할 수 없는 역할을 약속하는 일이고, `primary`를 테마로 바꾼 애플리케이션은 "success" 얼럿만 그대로인 상황을 만나게 됩니다.

대신 있는 것: 머터리얼이 실제로 이름 붙인 유일한 심각도인 `error`, 그리고 나머지에 대한 강조 선택. 팔레트에 해당하는 단어가 없는 의미는 색을 빌리는 대신 **글리프**로 말합니다.

<Demo src="alert/colors" :minHeight="320">

<<< @/.vitepress/demos/alert/colors.tsx

</Demo>

## 어느 live region에 들어가는지

메시지가 얼마나 급한지 아는 건 계열뿐이므로, 계열이 결정합니다.

| `color`                            | Role     | 하는 일                                   |
| ---------------------------------- | -------- | ----------------------------------------- |
| `error`                            | `alert`  | 스크린 리더가 읽던 문장을 끊고 끼어듭니다 |
| `primary`, `secondary`, `tertiary` | `status` | 다음 쉬는 지점까지 기다립니다             |

"실패했습니다"는 끼어들 만하고 "저장했습니다"는 그렇지 않습니다. 더 잘 아는 호출자가 이깁니다 — `role`은 계산된 값 뒤에 spread되기 때문입니다.

```tsx
<MPAlert role={undefined}>알림이 아니라, 처음부터 페이지의 일부인 문장.</MPAlert>
```

## 예시

### title

제목이 있으면 두 부분이 되고, 없으면 전체가 한 줄입니다. 제목 아래의 본문은 `on-surface-variant`로 한 걸음 물러납니다. 필드의 보조 텍스트가 쓰는 것과 같은 역할입니다. 제목이 없으면 본문이 곧 얼럿이므로 읽기 텍스트 그대로 남습니다.

```tsx
<MPAlert>한 줄.</MPAlert>

<MPAlert title="두 부분">그리고 그 아래의 상세.</MPAlert>
```

### icon

`color`에 맞는 글리프가 기본값입니다. 기본값이 둘뿐인 이유는 정직한 게 둘뿐이기 때문입니다. error 계열은 오류 글리프를, 나머지는 정보 글리프를 받습니다.

```tsx
<MPAlert icon={false}>글리프 없이.</MPAlert>

<MPAlert icon={<MPIcon icon={ICONS.success} size={20} />}>더 구체적인 의미로.</MPAlert>
```

글리프는 메시지 전체가 아니라 **첫 줄**에 맞춰 중앙에 놓입니다. 그래서 한 줄짜리 얼럿은 가운데 정렬로 보이고, 세 줄짜리도 글리프는 여전히 맨 위에 있습니다.

### action과 onClose

`action`은 메시지가 줄바꿈되어도 첫 줄에 남도록 `children`과 분리했습니다. `onClose`는 그것을 넘기는 일 자체가 ×를 만드는 일입니다. `dismissible` boolean이 없는 이유는, 호출할 대상이 없는 닫기 버튼은 아무 일도 하지 않는 버튼이기 때문입니다.

```tsx
<MPAlert action={<MPButton variant="text">다시 시도</MPButton>} onClose={() => setShown(false)}>
  업로드에 실패했습니다.
</MPAlert>
```

### locale

×에는 자기 텍스트가 없으므로, 그 접근성 이름은 이 라이브러리가 지어내야 하는 단어입니다. `locale`에서, 또는 가장 가까운 [`MPLocaleProvider`](../../design/localization)에서, 둘 다 맞지 않으면 `closeLabel`에서 옵니다.

```tsx
<MPAlert locale="ko" onClose={dismiss}>
  저장했습니다.
</MPAlert>
```

## 접근성

- 얼럿 전체가 live region이므로, 페이지가 로드된 뒤에 나타난 메시지도 읽힙니다. 어느 종류인지는 위 표를 보세요.
- ×는 이름이 있는 진짜 버튼이고, 행의 처음이 아니라 마지막에 있습니다. 그래서 읽는 사람은 나가는 방법보다 메시지를 먼저 듣습니다.
- 기본 글리프는 장식이라 접근성 트리에서 빠집니다. 그것이 가리키는 계열은 이미 문장 안에 있습니다.

## 함께 보기

- [MPSnackbar](./snackbar) — 놓쳐도 되는 메시지.
- [MPDialog](./dialog) — 다른 무엇보다 먼저 대답해야 하는 메시지.
- [MPEmpty](./empty) — 내용이 없는 영역. 이건 다른 문제입니다.
