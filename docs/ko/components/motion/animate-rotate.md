---
title: MPAnimateRotate
order: 5
---

# MPAnimateRotate

<p class="mp-lede">한 점을 중심으로 도는 내용. 각도가 하나가 아니라 둘이라서, 한 컴포넌트가 제자리로 들어오는 회전과 끝나지 않는 회전 둘 다가 됩니다.</p>

<Demo src="animate-rotate/hero" :minHeight="240" />

```tsx
import { MPAnimateRotate } from 'material-plus-ui';

// 도착
<MPAnimateRotate>
  <MPIcon icon={ICONS['chevron-down']} />
</MPAnimateRotate>

// 회전
<MPAnimateRotate from={0} to={360} repeat="infinite" easing="linear" fade={false}>
  <MPIcon icon={ICONS.spinner} />
</MPAnimateRotate>
```

## Props

<PropsTable name="MPAnimateRotate" />

## 각도 둘, 효과 둘

`from` 하나만 있으면 **도착**입니다. 무언가가 제자리로 돌아 들어와 멈춥니다. 기본값이 그것입니다 — 반 바퀴 뒤에서 시작해 0도에서 끝납니다.

`from`과 `to`를 함께 주고 `repeat="infinite"`에 `easing="linear"`를 더하면 **회전**입니다. 끝나는 곳에서 시작하므로 착지하지도, 튀지도 않습니다. 이때는 `fade`를 꺼 두세요. 반복되는 불투명도 경사는 깜빡임으로 읽힙니다.

한 컴포넌트가 둘 다를 덮는 이유는, 두 번째 컴포넌트라는 것이 결국 같은 키프레임에 다른 이름을 붙인 것이기 때문입니다.

## 이것을 쓰면 안 되는 곳

**텍스트.** 회전한 단어는 길이 전체에 걸쳐 다시 샘플링되고, 90의 배수가 아닌 각도에서는 모든 획이 픽셀 사이에 떨어집니다. 회전은 이 라이브러리가 **글리프**에 이견 없이 허용하는 유일한 움직임이지만 — 셰브런은 컴포넌트 전체에서 다시 그려지는 대신 돌려집니다. 돌아간 화살표도 같은 화살표니까요 — 그 허용이 문장까지 이어지지는 않습니다.

**로딩 표시기.** 도는 표시는 무언가 움직이고 있다고 말하지만, 불확정 표시기는 무엇을 기다리는지 말하고 결과가 차지할 자리를 잡아 두어야 합니다. 그것이 [MPProgressCircular](../feedback/progress-circular)이고, `prefers-reduced-motion`에서도 계속 도는 유일한 것이기도 합니다 — 멈춘 스피너는 무언가 일어나고 있는지에 대해 거짓말을 하지만, 돌지 않은 장식은 잃은 것이 없기 때문입니다.

## 여기서는 `duration`이 더 깁니다

`long2` — 500ms — 로, 페이드의 `medium2`나 슬라이드의 `medium4`보다 깁니다. 반 바퀴는 불투명도 한 축보다 먼 여정이고, 같은 숫자에서는 서두르는 것으로 읽힙니다. duration 표에 하나의 숫자가 아니라 효과마다 한 줄이 있는 이유가 바로 이것입니다.

## 예제

### origin

CSS `transform-origin`이면 무엇이든 됩니다. 기본값은 한가운데이고, 경첩이 달린 것 — 자기 위쪽 가장자리를 축으로 열리는 패널, 밑동에서 도는 바늘 — 에는 다른 곳에 고정하세요.

[MPAnimateGrow](./animate-grow)처럼 `transform-origin`을 통해 독립 `rotate` 속성에 닿으므로, 효과는 `transform` 단축 속성을 건드리지 않고 호출자의 transform은 살아남습니다.

### fade

도착에는 켜고, 회전에는 끄세요. prop 하나를 따로 둘 만한 세 번째 답은 없습니다.

## 하나의 효과를 집합 전체에

`stagger`는 효과를 자식 단위로 바꿉니다. 상자가 도는 대신 자식 하나하나가 자기 순서만큼 늦게 그렇게 합니다. `durationStep`은 각 자식에게 앞의 것보다 길거나 짧은 시간을 주고, `reverse`는 집합을 끝에서부터 재생합니다.

```tsx
<MPAnimateRotate stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateRotate>
```

`stagger`가 설정되면 상자 자신은 아무것도 재생하지 않습니다. 같은 내용을 두 번 재생하면 아무도 요청하지 않은 세 번째 곡선이 되기 때문입니다. 세 prop의 근거는 [MPAnimateFade](./animate-fade#하나의-효과를-집합-전체에)에 자세히 적혀 있고, [MPAnimateAppear](./animate-appear)는 `stagger`가 이미 켜져 있는 이것입니다.

## 접근성

- `prefers-reduced-motion`에서는 아무것도 돌지 않고 내용이 `to` 각도에 놓입니다 — 기본값이면 똑바로 선 상태이고, 회전이면 호출자가 끝이라고 말한 자리입니다.
- 끝없는 회전은 누군가 읽고 있는 페이지 구석에서 멈추지 않는 움직임입니다. 이 라이브러리가 다른 곳에서는 거부하는 종류의 움직임이므로, 작고 장식적이어야 하며 메시지를 혼자 짊어져서는 안 됩니다.
- 회전은 레이아웃 박스를 바꾸지 않으므로 도는 요소 주변의 어떤 것도 움직이지 않습니다.

## 함께 보기

- [MPProgressCircular](../feedback/progress-circular) — 도는 것이 장식이 아니라 기다림에 대한 것일 때.
- [MPAnimateGrow](./animate-grow) — `origin`을 받는 또 하나의 효과.
- [MPAnimateBlink](./animate-blink) — 또 하나의 무한 효과이고, 같은 주의가 그대로 적용됩니다.
