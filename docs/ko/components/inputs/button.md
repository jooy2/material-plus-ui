---
title: MPButton
order: 1
---

# MPButton

<p class="mp-lede">머터리얼의 다섯 가지 버튼 — filled, tonal, elevated, outlined, text — 을 네 가지 강조 색 계열과 이 라이브러리의 크기 사다리 위에서 그립니다. 스테이트 레이어, 비활성 불투명도, 알약 모양이 모두 Material Design 3의 컴포넌트 토큰에서 옵니다.</p>

<Demo src="button/hero" :minHeight="64" />

```tsx
import { MPButton } from 'material-plus-ui';

<MPButton onClick={save}>저장</MPButton>;
```

## Props

<PropsTable name="MPButton" />

## 예시

### variant

다섯 가지이고, 한 가지의 다섯 가지 농도가 아닙니다. 각각은 같은 질문 — 이 동작이 페이지에서 어떻게 자기를 구분하는가 — 에 대한 서로 다른 대답입니다.

<Demo src="button/variants" :minHeight="300">

<<< @/.vitepress/demos/button/variants.tsx

</Demo>

알아 둘 만한 것은 `elevated`입니다. 색이 아니라 그림자로 자기를 구분하는 **중립** 면이라서, 사진이나 색이 있는 패널 위에서 쓸 수 있는 유일한 변형입니다. 거기서는 tonal 계열이 앉을 만큼 조용한 자리가 없습니다.

::: tip 화면당 filled 버튼 하나

머터리얼의 규칙이고, 실제 화면에서도 살아남는 규칙입니다. `filled`는 이 화면이 존재하는 이유 하나입니다. filled 버튼이 세 개 있는 화면은 무엇을 눌러야 하는지 아무 말도 하지 않은 화면입니다.

:::

### color

네 가지 강조 계열입니다 — `primary`, `secondary`, `tertiary`, `error`. Material UI의 여섯 가지가 아닙니다. 스펙의 색상 시스템에는 `info`, `success`, `warning`이 없고, 그것을 제공하면 [토큰 시트](../../design/color)가 만들어 낼 방법이 없는 롤을 약속하는 셈이 됩니다.

```tsx
<MPButton color="error">계정 삭제</MPButton>
```

여기서 `error`는 다른 계열과 완전히 똑같이 취급됩니다. 의도한 것입니다. 파괴적인 버튼과 기본 버튼의 차이는 어떤 팔레트를 읽느냐뿐이고, 오류 색만 특별 취급하는 컴포넌트는 "다른 모든 것과 똑같아 보여야 하는" 그 한 경우를 위해 두 번째 코드 경로를 갖게 됩니다.

임의의 색상값은 받지 않습니다. `primary`가 _무엇인지_ 바꾸려면 토큰을 설정하세요. 그러면 한 번의 변경이 모든 호출부가 아니라 모든 컴포넌트에 한꺼번에 닿습니다.

### loading

`startIcon` 자리를 스피너로 바꾸고 클릭을 막습니다.

<Demo src="button/states" :minHeight="64">

<<< @/.vitepress/demos/button/states.tsx

</Demo>

의도적으로 `disabled`가 **아닙니다**. 누르는 순간 탭 순서에서 사라지는 버튼은 키보드 포커스를 함께 가져가 버립니다. 방금 보낸 요청이 아직 처리 중인데 읽는 사람은 문서 맨 위로 되돌아가 있게 됩니다. 그래서 버튼은 자기 자리를 지키고, `aria-busy`와 `aria-disabled`를 말하고, 클릭만 삼킵니다.

### startIcon과 endIcon

라벨 양쪽에 놓이는 내용이고, 버튼과 같은 단계의 크기로 그려집니다.

```tsx
<MPButton startIcon={<MPIcon icon={ICONS.check} size={20} />}>저장</MPButton>
```

`children`이 아예 없으면 버튼이 정사각형이 되어 아이콘 버튼이 됩니다. 그럴 때는 `aria-label`을 주세요. 이름이 될 텍스트가 남아 있지 않습니다.

```tsx
<MPButton aria-label="검색" startIcon={<MPIcon icon={ICONS.search} size={20} />} />
```

### size

다섯 단계이고 라이브러리의 컨트롤 사다리를 그대로 씁니다 — 32, 40, 56, 64, 72픽셀. 앞의 세 단계는 머터리얼 자신의 extra-small, small, medium 버튼 높이입니다. `lg`와 `xl`은 이 라이브러리의 것인데, 스펙의 값이 96과 136이고 64px 필드 옆의 96px 버튼은 한 줄이 아니기 때문입니다. [Prop 규약](../../design/prop-conventions#size)을 참고하세요.

<Demo src="button/sizes" :minHeight="330">

<<< @/.vitepress/demos/button/sizes.tsx

</Demo>

라벨의 타입 스케일과 그 주위의 여백도 같은 단계에서 나옵니다. 더 큰 버튼이 그저 더 큰 알약이 아닌 이유가 그것입니다.

## 이 컴포넌트에 없는 것

**`href`가 없습니다.** 이동하는 버튼은 링크이고, 그 차이는 겉모습이 아닙니다. 링크는 링크로 읽히고, 가운데 버튼으로 새 탭에서 열리고, 상태 표시줄에 목적지를 보여 줍니다. 그래서 버튼처럼 보이는 링크는 링크로 씁니다.

```tsx
<MPButton render={<a href="/pricing" />} nativeButton={false} role="link">
  요금제
</MPButton>
```

셋 다 필요합니다. `render`는 Base UI의 탈출구이고 표면 전체를 그대로 가져옵니다. `nativeButton={false}`는 이 엘리먼트가 `<button>`이 아니라고 Base UI에게 알리는 것으로, 알리지 않으면 콘솔에 그렇게 적힙니다. 그리고 `role="link"`는 `nativeButton={false}`가 대신 가정하는 한 가지를 되돌립니다. Base UI는 그것을 "이 엘리먼트가 버튼처럼 _동작한다_"는 뜻으로 받아들여 `role="button"`을 붙이기 때문입니다. 이 마지막 prop이 없으면 앵커가 버튼으로 안내되는데, 그것이 바로 이 절이 말하는 거짓말입니다.

**리플이 없습니다.** MD3가 걷어냈습니다. 스테이트 레이어가 그 자리를 대신하고, 같은 말을 하면서도 "애니메이션이 끝나야 화면이 바뀐다"는 문제를 만들지 않습니다.

## 접근성

- 포커스 표시는 `secondary` 색이고 버튼 **바깥쪽**에 그려집니다. MD3의 규칙인데, filled 버튼 안쪽에 그린 링은 그 링이 구분되어야 할 바로 그 면 위에 그린 링이기 때문입니다.
- `type`의 기본값은 native의 `submit`이 아니라 `button`입니다. 폼 안의 관계없는 버튼이 폼을 제출하지 않습니다.
- `loading`은 `aria-busy`로 자기 상태를 알리고 버튼을 포커스 가능한 상태로 둡니다.
- 아이콘만 있는 버튼에는 `aria-label`이 필요합니다. 이름이 될 다른 것이 없습니다.

## 함께 보기

- [MPButtonGroup](./button-group) — 여러 개를 한 줄로 묶을 때.
- [MPSegmentedButton](./segmented-button) — 여럿 중 하나를 고를 때. 버튼 묶음은 그것이 아닙니다.
- [Base UI Button](https://base-ui.com/react/components/button) — 아래에 깔린 동작.
