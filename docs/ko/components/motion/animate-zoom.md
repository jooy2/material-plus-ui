---
title: MPAnimateZoom
order: 3
---

# MPAnimateZoom

<p class="mp-lede">자기가 자리잡을 곳의 한가운데에서 도착하는 내용. 화면에서 끼어들어야 하는 단 하나를 위한 효과입니다 — 확인, 결과, 방금 도착한 숫자.</p>

<Demo src="animate-zoom/hero" :minHeight="360" />

```tsx
import { MPAnimateZoom } from 'material-plus-ui';

<MPAnimateZoom>
  <MPCard title="Payment received" />
</MPAnimateZoom>;
```

## Props

<PropsTable name="MPAnimateZoom" />

## 한 번만 쓰세요

줌은 끼어드는 것이고, 한 화면에서 세 번 일어나는 끼어듦은 레이아웃입니다. 여러 개가 도착해야 한다면 **묶음**으로 도착해야 합니다 — 그것이 [MPAnimateAppear](./animate-appear)이고, 거기서 효과는 그룹의 것이며 읽는 사람의 눈을 읽어야 할 순서대로 끌고 내려갑니다.

## `origin`이 없습니다

일부러입니다. 모서리에 고정된 줌은 [그로우](./animate-grow)이고, 이 라이브러리는 하나의 생각을 두 가지로 쓰지 않습니다.

한가운데는 스타일시트의 기본값에 맡기지 않고 요소에 직접 씁니다. 호출자의 규칙에서 상속된 `transform-origin`이 한 효과를 슬그머니 다른 효과로 바꾸지 못하도록.

## 그로우와 같은 키프레임

둘 다 크기의 변화이므로 둘 다 `mp-anim-scale`을 돕니다. 똑같은 `@keyframes`가 하나 더 있으면 버그를 고칠 곳이 하나 더 생길 뿐입니다.

둘을 가르는 것은 거리와 고정점입니다. 줌은 한가운데를 중심으로 `0.4`에서, 그로우는 지정한 곳을 중심으로 `0.8`에서 시작합니다. 몸짓은 둘, 계산은 하나입니다.

## 예제

<Demo src="animate-zoom/distance" :minHeight="300">

<<< @/.vitepress/demos/animate-zoom/distance.tsx

</Demo>

### from

`1`보다 작으면 한가운데에서 앞으로 나옵니다. `1`보다 크면 크게 도착해 뒤로 물러앉는데, 읽는 사람 **쪽으로** 밀려오는 것으로 읽힙니다.

너무 낮은 값 — 대략 `0.2` 아래 — 은 이동 거리가 너무 길어서 애니메이션 대부분 동안 내용을 읽을 수 없습니다. 그것은 등장이 아니라 스플래시입니다.

### fade

기본으로 켜져 있고, 도착에는 켜 두는 편이 좋습니다. 첫 프레임들이 *작다*가 아니라 *아직 없다*로 읽히게 만드는 것이 불투명도이기 때문입니다.

## 하나의 효과를 집합 전체에

`stagger`는 효과를 자식 단위로 바꿉니다. 상자가 도착하는 대신 자식 하나하나가 자기 순서만큼 늦게 그렇게 합니다. `durationStep`은 각 자식에게 앞의 것보다 길거나 짧은 시간을 주고, `reverse`는 집합을 끝에서부터 재생합니다.

```tsx
<MPAnimateZoom stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateZoom>
```

`stagger`가 설정되면 상자 자신은 아무것도 재생하지 않습니다. 같은 내용을 두 번 재생하면 아무도 요청하지 않은 세 번째 곡선이 되기 때문입니다. 세 prop의 근거는 [MPAnimateFade](./animate-fade#하나의-효과를-집합-전체에)에 자세히 적혀 있고, [MPAnimateAppear](./animate-appear)는 `stagger`가 이미 켜져 있는 이것입니다.

## 접근성

- `prefers-reduced-motion`에서는 아무것도 확대되지 않고 내용이 최종 크기 그대로 있습니다.
- 줌은 긴 거리에 걸쳐 안의 모든 것을 다시 샘플링하므로 문단을 감싸기에는 맞지 않습니다. 읽는 것이 아니라 보는 것 — 표제, 그림, 카드 — 에 두르고, 본문에는 [MPAnimateFade](./animate-fade)를 쓰세요.
- 내용은 첫 프레임부터 최종 레이아웃 크기를 차지하므로, 애니메이션이 도는 동안 주변이 움직이지 않습니다.
- 도착하는 것이 주의를 요구하는 것 — 확인, 오류 — 이라면 내용에도 그렇게 쓰세요. 움직임은 메시지가 아니고, 모션 감소를 설정한 사람은 그것을 영영 보지 못합니다.

## 함께 보기

- [MPAnimateGrow](./animate-grow) — 같은 계산을, 고정점을 두고, 절반도 안 되는 거리에서.
- [MPAnimateAppear](./animate-appear) — 여러 개가 묶음으로 도착할 때.
- [MPDialog](../feedback/dialog) — 끼어듦이 페이지까지 가져가야 할 때.
