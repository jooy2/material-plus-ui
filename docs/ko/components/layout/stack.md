---
title: MPStack
order: 19
---

# MPStack

<p class="mp-lede">서로 겹쳐 쌓인 것들. 아바타 더미, 카드 덱, 문서 뭉치, 겹쳐 놓은 썸네일 — 컴포넌트 하나입니다. "이것들 여러 개, 겹쳐서"가 하나의 발상이기 때문입니다.</p>

<Demo src="stack/hero" :minHeight="360" />

```tsx
import { MPStack } from 'material-plus-ui';

<MPStack ring max={4} total={people.length} overflow={(n) => <MPAvatar initials={`+${n}`} />}>
  {people.slice(0, 4).map((person) => (
    <MPAvatar key={person.id} name={person.name} src={person.avatar} />
  ))}
</MPStack>;
```

## Props

<PropsTable name="MPStack" />

## MPAvatarGroup에서 옮기기

`MPAvatarGroup`은 **사라졌습니다**. 그것이 원래 무엇이었는지가 이것입니다. 얼굴에 관한 것이 되어 버린, 겹쳐 쌓기의 특수 사례였습니다. 쌓기도, 숫자도, 링도 전부 여기 있고 그중 어느 것도 애초에 아바타에 관한 것이 아니었습니다.

```tsx
// 이전
<MPAvatarGroup max={4} total={40} size="sm" shape="square" variant="filled">
  {faces}
</MPAvatarGroup>

// 이후
<MPStack ring max={4} total={40} overflow={(n) => <MPAvatar initials={`+${n}`} />}>
  {faces}
</MPStack>
```

옮기기 전에 알아야 할 것이 셋 있습니다.

**숫자는 이제 직접 그립니다.** `overflow`는 들어가지 못한 개수를 받는 **함수**입니다. 그 개수가 마지막 항목이 할 말의 전부이기 때문이고, 범용 스택은 나머지 항목들이 어떻게 생겼는지 모르므로 어울리는 것을 만들어 낼 수 없기 때문입니다. 넘기지 않으면 나머지는 그냥 그려지지 않습니다.

**`ring`의 기본값은 꺼짐입니다.** 페이지 자신의 `surface` 색 실선은 비슷한 톤의 두 원 사이에 경계를 만드는 것이고, 이미 테두리가 있는 카드 덱에는 정확히 틀린 것입니다.

**공유되던 외형은 사라졌고, 이것이 진짜 비용입니다.** `MPAvatarGroup`은 `size`, `shape`, `variant`, `color`를 줄 전체에 한 번에 설정했습니다. `MPStack`은 자기 자식이 _무엇인지_ 모르므로 그럴 수 없습니다. 여기서 `size`는 기본 `overlap`을 고르는 데만 쓰이고 전달되지 않습니다.

항목들이 공유하는 것은 [MPConfigProvider](../../guide/config)에 설정하세요. 페이지 전체의 `size`와 `color`를 덮습니다. 그리고 `shape`와 `variant`는 아바타에 직접 두세요.

```tsx
<MPConfigProvider size="sm">
  <MPStack ring>
    {faces.map((face) => (
      <MPAvatar key={face.id} {...face} shape="square" variant="filled" />
    ))}
  </MPStack>
</MPConfigProvider>
```

## 겹침이 `translate`가 아니라 마진인 이유

이것이 더미 구현의 거의 전부가 틀리는 지점이고, 옆에 무언가를 놓아 보기 전까지는 보이지 않습니다.

항목을 `translate`로 옮기면 각 항목은 여전히 **자기 폭 전체를 차지합니다**. 상자는 전부를 끝에서 끝까지 늘어놓은 크기 그대로이고, 더미는 그 바깥에 그려지며, 페이지에서 스택 뒤에 오는 모든 것이 틀린 측정값에 맞춰 배치됩니다. 문장 안에 넣을 수 없습니다.

음수 마진은 그 공간을 되돌려받으므로, 상자는 정확히 그려지는 것의 크기가 됩니다. 32px 항목 다섯 개, 겹침 10px:

| direction    | 상자   |
| ------------ | ------ |
| `horizontal` | 120×32 |
| `vertical`   | 32×120 |
| `diagonal`   | 120×72 |

마진은 **논리적**이라서, 가로 더미는 RTL에서 아무도 시키지 않아도 반대로 겹칩니다.

## `diagonal`이 가로 흐름인 이유

흐름은 자기가 흐르는 축에서만 항목을 겹치기 때문입니다. `diagonal`은 `flex-row`이고 — X 전진은 `horizontal`과 똑같이 흐름의 몫입니다 — 세로 오프셋은 항목마다 그 항목의 **인덱스**를 곱한 마진으로 적힙니다.

행에서 고정된 `margin-block-start`는 누적되지 않습니다. 모든 항목을 같은 오프셋에 놓고, 부채꼴은 생기지 않습니다.

## 45°가 아니고, 그런 척하지도 않습니다

가로 전진량은 `항목 폭 − overlap`인데, 라이브러리는 항목의 폭을 갖고 있지 않습니다. 그것은 여러분이 넣은 것입니다. 그래서 세로 낙차는 별도 prop인 `drop`이고, 기본값은 `overlap`입니다. 진짜 대각선이 아니라 얕은 부채꼴입니다.

45°를 원한다면 여러분은 항목의 폭을 알고 있으므로 `drop={width - overlap}`이라고 쓸 수 있습니다.

## 항목마다 두 겹

각 항목은 두 번 감싸집니다. 바깥 span이 오프셋과 `z-index`와 등장을 지고, 안쪽이 `scaleStep`과 `opacityStep`을 만드는 정적 `scale`과 `opacity`를 집니다.

둘이 분리된 이유는 `grow`와 `zoom` keyframe이 개별 `scale` 속성을 애니메이션하기 때문입니다. 같은 요소에 애니메이션과 정지 상태의 깊이가 함께 있으면 keyframe이 이깁니다. 무언가 애니메이션되는 순간 깊이가 사라집니다.

래퍼는 이것이 여러분의 자식에 손대지 않게 하는 것이기도 합니다. `className`을 붙이려고 자식을 클론하면 **모든** 자식이 그것을 받아야 하는데, 라우터의 링크나 툴팁 트리거로 감싼 얼굴에는 그럴 의무가 없습니다. 여러분의 요소는 손대지 않은 채 통과합니다.

`ring`이 유일한 예외이고 그 대가에 대해 정직합니다. 고정 깊이의 descendant selector라서 이 스택이 감싼 요소에 얹힙니다. 자식 자체가 래퍼라면 링은 래퍼에 걸리고, `<span>` 안의 원형 아바타라면 사각 링이 됩니다.

## 예제

### front

더미의 어느 끝이 읽는 사람에게 가장 가까운지. 기본은 `first`라서, 시작부터 읽는 더미는 앞에서 뒤로 읽히고 그 더미가 *무엇에 관한 것인지*를 말하는 항목이 먼저 옵니다.

문서에 맡기지 않고 `z-index`로 말합니다. 문서는 뒤에 오는 형제를 위에 그립니다. 암묵적인 순서는 더미 안의 무언가가 자기 `z-index`를 갖는 순간까지만 유지되기도 합니다.

### scaleStep과 opacityStep

앞의 항목에 대해 곱해집니다. 그래서 맨 앞 항목은 건드려지지 않고, `scaleStep={0.94}`에서 다섯 번째 카드는 4분의 3쯤이 됩니다.

둘 다 **그려지는 것**을 바꾸고 측정되는 것은 바꾸지 않으므로, 더미의 간격은 어느 쪽이든 같습니다. 축소된 카드가 뒤의 것들을 끌어당기지 않고, 그것이 덱을 조정하는 동안 레이아웃을 안정적으로 유지합니다.

### transition

각 항목의 등장이고, `MPAnimate*` 컴포넌트가 도는 일곱 효과에서 고릅니다. `stagger`, `durationStep`, `reverse`가 더미 전체에 걸립니다. `reverse`는 뒤에서부터 나눠 줍니다.

바깥에서 조합하지 않고 스택에 둔 이유는 하나입니다. 항목들은 이 컴포넌트가 만든 래퍼 안에 있으므로, 바깥의 무엇도 거기 닿을 수 없습니다.

`MPStack`이 레이아웃만으로 계산되는 0.9 kB가 아니라 2.1 kB인 이유이기도 합니다. `MPAnimateFade`가 읽는 것과 같은 효과 테이블을 읽습니다. 그것은 실제 비용이고, 나중에 발견되게 두는 대신 여기 적어 둡니다. `transition` 없이 얼굴 넷을 쌓은 스택은 절대 돌리지 않을 효과 여섯 개의 값을 치르고 있습니다.

## 접근성

- 스택에는 **역할이 없습니다**. 프로젝트 제목 옆의 얼굴 더미는 옆 문장을 위한 장식입니다. 그렇지 않을 때는 이름을 붙여 주는 것으로 감싸세요.
- 래퍼는 의미가 없는 순수한 `<span>`이라서, 스택 안의 링크 목록은 여전히 링크 목록입니다.
- `front`는 그리는 순서만 바꾸고 문서 순서는 바꾸지 않습니다. 스크린 리더가 읽는 것은 여러분이 적은 순서입니다.

```tsx
<div role="group" aria-label="이 프로젝트 참여자">
  <MPStack ring max={4} total={12}>
    …
  </MPStack>
</div>
```

## 함께 보기

- [MPAvatar](../display/avatar) — 가장 자주 쌓이는 것.
- [MPConfigProvider](../../guide/config) — 그룹이 설정하던 `size`와 `color`를 위해.
- [MPAnimateAppear](../motion/animate-appear) — 겹치지 않는 집합이 도착할 때.
