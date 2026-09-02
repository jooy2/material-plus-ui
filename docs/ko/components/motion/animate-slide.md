---
title: MPAnimateSlide
order: 4
---

# MPAnimateSlide

<p class="mp-lede">한쪽 가장자리에서 이동해 들어오는 내용. 요소가 움직일 뿐 레이아웃은 움직이지 않습니다 — 도는 동안 페이지의 어떤 것도 다시 흐르지 않습니다.</p>

<Demo src="animate-slide/hero" :minHeight="360" />

```tsx
import { MPAnimateSlide } from 'material-plus-ui';

<MPAnimateSlide from="left">
  <MPCard title="From behind the edge" />
</MPAnimateSlide>;
```

## Props

<PropsTable name="MPAnimateSlide" />

## 방향은 관계입니다

이것은 하나의 래퍼가 제공할 수 있는 규모의 MD3 **shared axis** 전환입니다. 서로 관련된 것들은 같은 선을 따라 움직이고, 읽는 사람은 그 방향을 관계로 읽습니다. 앞으로 가는 단계는 끝 쪽 가장자리에서 오고, 뒤로 가는 단계는 시작 쪽에서 오며, 위 바에 속한 패널은 위에서 내려옵니다.

그러니 `from`은 취향의 결정이 아니라 내용이 어디에서 왔는지에 대한 진술입니다. 한 화면에 네 개의 슬라이드가 각각 다른 가장자리에서 들어온다면 아무 말도 하지 않는 것입니다.

## 기본 이동 거리가 왜 `100%`인가

`100%`는 요소 **자신의** 너비 또는 높이라서, 정확히 화면 밖에서 시작합니다 — 있어서는 안 될 자리에 반쯤 그려지는 일이 없고, 무엇을 측정할 필요도 없습니다.

`overflow: hidden`인 컨테이너 안에 넣으면 그 컨테이너의 가장자리 뒤에서 패널이 나타나는 효과가 됩니다. 없으면 내용이 요소 하나 너비만큼 떨어진 곳에서 시작해 들어옵니다.

짧은 `distance`는 다른 몸짓입니다. 이미 대체로 제자리에 있는 내용을 위한, 자리잡음입니다.

## 가장자리는 물리적입니다

`from`은 `MPSide`를 받고, 이 값은 RTL에서도 `top` / `right` / `bottom` / `left` 그대로입니다 — [MPTooltip](../feedback/tooltip)과 팝업들이 하는 것과 같은 선택입니다. 여기에는 뒤집을 읽기 순서가 없고 화면 가장자리만 있습니다. 창 위쪽에서 내려오는 것은 어떤 언어에서든 위에서 옵니다.

뒤집혀야 _하는_ 이동 — 흐름에서 앞으로 가는 단계 — 이라면, 흐름의 방향을 아는 코드에서 문서 방향에 맞는 쪽을 넘기세요.

## 예제

<Demo src="animate-slide/axis" :minHeight="320">

<<< @/.vitepress/demos/animate-slide/axis.tsx

</Demo>

### distance

CSS 길이 또는 픽셀 숫자입니다. `'100%'`는 화면 밖이고, `'1.5rem'` 같은 짧은 값은 제자리에서의 자리잡음입니다 — 두 화면 사이의 shared axis 단계가 보통 원하는 쪽입니다.

### mode

`out`은 들어왔을 가장자리로 되돌아 나갑니다. 왼쪽에서 도착한 패널은 왼쪽으로 갑니다. 또한 더 짧습니다. 머터리얼이 퇴장에 그렇게 요구하기 때문입니다.

## 하나의 효과를 집합 전체에

`stagger`는 효과를 자식 단위로 바꿉니다. 상자가 이동하는 대신 자식 하나하나가 자기 순서만큼 늦게 그렇게 합니다. `durationStep`은 각 자식에게 앞의 것보다 길거나 짧은 시간을 주고, `reverse`는 집합을 끝에서부터 재생합니다.

```tsx
<MPAnimateSlide stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateSlide>
```

`stagger`가 설정되면 상자 자신은 아무것도 재생하지 않습니다. 같은 내용을 두 번 재생하면 아무도 요청하지 않은 세 번째 곡선이 되기 때문입니다. 세 prop의 근거는 [MPAnimateFade](./animate-fade#하나의-효과를-집합-전체에)에 자세히 적혀 있고, [MPAnimateAppear](./animate-appear)는 `stagger`가 이미 켜져 있는 이것입니다.

## 접근성

- `prefers-reduced-motion`에서는 아무것도 이동하지 않고 내용이 최종 위치에 그대로 있습니다.
- 애니메이션은 `translate`이므로 레이아웃 안에서 요소의 박스는 전혀 움직이지 않습니다. 슬라이드가 도는 동안 아래에 있는 것이 밀리지 않고, 페이지 중간을 읽던 사람이 흔들리지 않습니다.
- 슬라이드는 글자를 확대하지는 않지만 _움직이기는_ 합니다. 움직이는 글자는 멈춘 글자보다 읽기 어렵습니다. 문단 위를 길게 이동하는 것은 줌과 같은 이유로 피하는 편이 좋고, 본문에 안전한 래퍼는 [MPAnimateFade](./animate-fade)입니다.
- 내용은 첫 프레임부터 최종 크기로 문서 안에 있으므로 스크린 리더가 애니메이션을 기다리지 않습니다.

## 함께 보기

- [MPAnimateAppear](./animate-appear) — 같은 이동을 훨씬 짧게, 목록의 자식마다 차례로.
- [MPDrawer](../layout/drawer) — 들어오는 것이 스크림과 포커스 트랩과 Escape 키를 가진 진짜 패널일 때.
- [MPAnimateFade](./animate-fade) — 전혀 움직이면 안 되는 내용에.
