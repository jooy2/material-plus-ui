---
title: Prop 규약
order: 2
---

# Prop 규약

`size="md"`는 텍스트 필드에서든 버튼에서든 다이얼로그에서든 같은 것을 뜻해야 합니다. 공유 어휘는 [`src/types.ts`](https://github.com/jooy2/material-plus/blob/main/src/types.ts)에 있고, 각 컴포넌트는 자기가 필요한 축만 가져갑니다.

아래 전체를 지배하는 규칙이 두 개입니다.

1. **스펙에 단어가 있으면 스펙의 단어를 씁니다.** 색상 롤은 `primary`나 `on-surface-variant`, 모서리는 `extra-small`, 타입 롤은 `body-large`입니다. `main`/`light`/`dark`/`contrastText`가 아닙니다 — 그건 Material UI의 팔레트 모델이고 더 이전의 다른 색상 시스템이라, 그 이름을 빌려오면 이 라이브러리가 구현하지 않는 것을 설명하게 됩니다.
2. **이미 이름이 있는 개념에 두 번째 표기를 만들지 않습니다.** 다른 컴포넌트가 이미 가진 축이 필요하면 그것을 가져다 씁니다.

## 공유 타입

```ts
type MPSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type MPColor = 'primary' | 'secondary' | 'tertiary' | 'error';
type MPVariant = 'filled' | 'tonal' | 'elevated' | 'outlined' | 'text';
type MPOrientation = 'horizontal' | 'vertical';

interface MPStyleProps {
  size?: MPSize; // 기본값 'md'
  fullWidth?: boolean;
}
```

컴포넌트는 이 묶음을 확장하고 진짜로 자기 것인 것만 추가합니다.

```ts
export interface MPTextFieldProps extends MPStyleProps {
  value: string;
  // …텍스트 필드만 가진 props
}
```

`MPStyleProps`는 의도적으로 짧습니다. 축은 **두 번째** 컴포넌트가 필요해질 때 합류하고, 필요해질 것을 예상해서 미리 들어오지 않습니다 — 디자인 토큰과 같은 규칙입니다.

`variant`와 `color`는 묶음의 구성원이 아니라 공유되는 *어휘*입니다. 의미 있는 변형을 가진 컴포넌트가 `variant`를 받고 강조 색 계열을 읽는 컴포넌트가 `color`를 받지만, 둘 다 모든 컴포넌트에 있는 것은 아니고 `MPTextField`에서는 어느 쪽도 의미가 없습니다. `density`와 `elevation`은 언젠가 도착할 가능성이 높고, 아직 아무것도 읽지 않기 때문에 여기 없습니다.

## `variant`

머터리얼의 다섯 가지 버튼 스타일이고, 목소리가 작아지는 순서입니다 — `filled`, `tonal`, `elevated`, `outlined`, `text`.

버튼이 아닌 컴포넌트와 이 어휘를 공유하는 것은 의도입니다. `filled` 세그먼티드 버튼과 `filled` 버튼은 서로 다른 컨트롤이 하는 같은 강조 선언입니다. `elevated`는 예외적인 하나이고 `filled`와 분리되어 있는데, MD3가 분리해 두기 때문입니다. 그림자도 함께 드리우는 _중립_ 면이고, 같은 문제를 다른 방식으로 푸는 것입니다. 의미 있는 떠오름 상태가 없는 컴포넌트는 이 값을 아예 제공하지 않습니다.

## `size`

이 라이브러리가 스펙을 알면서 넘어서는 유일한 지점입니다.

머터리얼은 컴포넌트마다 **크기를 하나** 규정합니다 — 텍스트 필드는 56dp, 끝입니다. 제품 전체를 위한 디자인 시스템을 서술하고 있고, 그 맥락에서는 컨트롤당 높이 하나가 바로 요점이기 때문입니다. 그런데 컴포넌트 라이브러리는 디자인 시스템이 계획하지 않은 자리에 쓰입니다. 필터 바, 표 안의 인라인 편집기, 촘촘한 설정 페이지, 마케팅 히어로 같은 곳입니다. 그런 곳에는 사다리가 필요하고, 라이브러리에서 얻을 수 없으면 소비자는 `!important`로 만들어냅니다.

그래서 규칙은 이렇습니다. **`md`가 스펙의 크기이고, 나머지 네 단계가 우리 것입니다.**

| `size`   | 높이     | 입력 타입 롤     |
| -------- | -------- | ---------------- |
| `xs`     | 32px     | `body-medium`    |
| `sm`     | 40px     | `body-medium`    |
| **`md`** | **56px** | **`body-large`** |
| `lg`     | 64px     | `body-large`     |
| `xl`     | 72px     | `body-large`     |

<Demo src="text-field/sizes">

<<< @/.vitepress/demos/text-field/sizes.tsx

</Demo>

이 표에서 따라오는 것이 세 가지이고, 그것이 컴포넌트를 사다리에 올릴 때의 제약입니다.

- **사다리는 위로 늘린 것이 아니라 가운데를 맞춘 것입니다.** 아무것도 지정하지 않으면 `md`가 나오므로, 스케일이 존재한다는 사실을 몰라도 머터리얼 크기를 받게 됩니다.
- **작은 컨트롤은 머터리얼 타입 스케일을 한 단 내려갑니다.** 라이브러리가 임의로 보간한 크기가 아닙니다. `body-medium`은 스펙의 14px 롤이고, `body-large`에 0.875를 곱한 값이 아닙니다.
- **높이는 타입 스케일 더하기 패딩이고, `height`가 아닙니다.** 높이를 고정하면 multiline 필드가 자기 크기를 넘어 자라지 못합니다.

`xs`와 `xl`은 단순히 더 작고 더 큰 것이 아니라 쓸 수 있는 범위의 양 끝입니다 — `xs` 아래로 내려가면 컨트롤이 편안한 포인터 대상이 되지 못합니다. 여섯 번째 단계는 없습니다. 그것이 필요할 만큼 긴 사다리는 호출자가 커스텀 컨트롤을 원한다는 신호이기 때문입니다.

### 유일한 예외: `MPIcon`

`MPIcon`은 `size`를 사다리의 한 단이 아니라 **길이**로 받습니다 — 픽셀 수 또는 임의의 CSS 길이입니다. 그렇게 하는 유일한 컴포넌트이고, `MPStyleProps`를 확장하지 않습니다.

아이콘은 컨트롤이 아닙니다. 스케일에서 골라올 자기 높이가 없습니다. 옆의 텍스트나 놓인 박스에 맞춰 크기가 정해지고, 그래서 `size="1em"`이 이 컴포넌트가 받는 가장 유용한 값 하나이며 어떤 사다리로도 표현할 수 없습니다. 세상의 모든 아이콘 세트가 이 축을 `size`라고 부르기도 하므로, 여기서 이름을 바꾸는 비용이 이름 충돌의 비용보다 큽니다.

살아남는 규칙은 정말로 중요한 쪽입니다. **사다리 안에서는 한 단이 어디서나 같은 것을 뜻합니다.** 사다리에 없는 컴포넌트는 묶음을 확장하지 않는 것으로 그것을 말합니다.

## `color`

네 개이고, 머터리얼의 accent 집합입니다 — `primary`, `secondary`, `tertiary`, `error`.

Material UI의 여섯 개가 아닙니다. 스펙의 색상 시스템에는 `info`, `success`, `warning`이 없고, 그것을 제공하면 [토큰 시트](./color)가 파생시킬 방법이 없는 롤을 약속하는 셈이 됩니다.

임의의 색상 값은 prop으로 받지 않습니다. 롤이 *무엇인지*를 바꾸려면 토큰을 지정하세요. 그러면 호출 지점마다가 아니라 한 번의 변경이 모든 컴포넌트에 닿습니다.

## 이름 규칙

- **아이콘 슬롯은 `startIcon` / `endIcon`입니다.** `leftIcon`과 `rightIcon`은 RTL에서 의미가 뒤집힙니다.
- **불리언은 긍정형입니다.** `disabled`는 되고 `notDisabled`는 안 됩니다.
- **컨테이너를 채우는 것은 `fullWidth`입니다.**
- **이벤트 핸들러는 네이티브 이름을 유지하고** 그대로 통과시킵니다. 네이티브 이벤트를 신뢰할 수 없는 경우만 예외이고, 지금까지 정확히 한 건입니다 — `MPTextField`의 `onChange`는 문자열을 넘깁니다. 조합 중에는 이벤트의 `target.value`가 읽어서는 안 되는 임시 텍스트이기 때문입니다.

## 상태 prop

| Prop | 의미 |
| --- | --- |
| `disabled` | 사용할 수 없음. 네이티브 `disabled` 속성과 머터리얼의 disabled 처리(내용 38%, 외곽선 12%)를 씁니다 |
| `readOnly` | 존재하지만 여기서는 아님. 선택 가능한 상태를 유지하고 **탭 순서에도 남습니다** |

`readOnly`가 네이티브 `disabled`를 쓰지 않는 것은 의도적입니다. 포커스 순서에서 빠지면 키보드 사용자는 페이지의 감각을 잃고, 누군가 복사해야 할 값은 도달 가능해야 합니다.

## 상태가 DOM에 있는 곳

상태는 JavaScript에 담아두는 대신 `data-*` 속성으로 공개됩니다. 그것이 런타임 없이 스타일링할 수 있게 하는 부분입니다. 이 속성들은 Base UI에서 오므로 모든 컴포넌트에서 동일합니다.

| 속성                          | 있을 때                |
| ----------------------------- | ---------------------- |
| `data-focused`                | 컨트롤에 포커스가 있음 |
| `data-invalid` / `data-valid` | 필드의 유효성          |
| `data-disabled`               | 필드가 비활성          |
| `data-filled`                 | 필드에 값이 있음       |
| `data-touched` / `data-dirty` | 조작됨 / 값이 바뀜     |

라이브러리는 컴포넌트 루트에 `data-mp-size`도 공개하므로, 소비자가 현재 사다리 단계를 기준으로 스타일링할 수 있습니다.

```html
<!-- Tailwind가 있다면 -->
<div class="group-data-invalid:border-mp-error">…</div>
```

## 새 컴포넌트 체크리스트

1. `src/components/{소문자-이름}/`에 `{PascalCase}.tsx`와 `index.ts` 배럴
2. named export만. `export default`는 쓰지 않습니다
3. 배럴을 `src/index.ts`에서 재export
4. 동작과 접근성은 Base UI 프리미티브에 위임
5. 필요한 축은 `MPStyleProps`에서 가져오고, 진짜로 이름이 없는 것만 정의
6. 필요한 색·타입·모양·모션은 토큰에서 읽고, **컴포넌트가 읽는 경우에만 토큰을 추가**
7. `test/components/{name}/{Name}.test.tsx` — 같은 커밋에
8. `docs/{locale}/components/{group}/{name}.md` — 로케일마다 한 페이지
9. `docs/.vitepress/data/props.ts`에 행 추가, `docs/.vitepress/demos/{name}/`에 데모 추가
10. `demos/gallery/all.tsx`에 카드 추가 — [모든 컴포넌트](../components/)에 나타나게
11. `npm run typecheck && npm test && npm run lint` 전부 통과

## 다음

- [색상](./color) — 롤과 바꾸는 방법.
- [모든 컴포넌트](../components/) — 실제로 동작하는 전체 목록.
