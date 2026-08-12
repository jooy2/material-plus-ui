---
title: MPBox
order: 4
---

# MPBox

<p class="mp-lede">내용이 놓인 한 장의 시트입니다. 이 라이브러리에서 가장 단순한 표면으로, 무언가를 묶어 주는 일만 합니다.</p>

<Demo src="box/hero" :minHeight="180" />

```tsx
import { MPBox } from 'material-plus-ui';

<MPBox variant="elevated">묶였고, 페이지에서 분리되었습니다.</MPBox>;
```

## Props

<PropsTable name="MPBox" />

## 절대 물들지 않고, `color`도 받지 않는 이유

박스가 담는 것은 남의 내용이고, 그 내용은 자기 색을 가지고 도착합니다. 본문, 링크, 버튼, 필드. 강조 색으로 채운 면 위에서는 그 하나하나가 강조 색 위에서의 처리를 따로 필요로 하게 되는데, 이건 컨테이너가 존재하는 이유와 정반대입니다.

<Demo src="box/variants" :minHeight="420">

<<< @/.vitepress/demos/box/variants.tsx

</Demo>

그래서 사다리는 **중립** 표면 역할들을 따라 올라가고, 다섯 중 셋은 MD3 자신의 카드 variant 그대로입니다.

| `variant`  | 표면                               | MD3           |
| ---------- | ---------------------------------- | ------------- |
| `filled`   | `surface-container-highest`        | filled 카드   |
| `tonal`    | `surface-container`                | —             |
| `elevated` | `surface-container-low` + 레벨 1   | elevated 카드 |
| `outlined` | `surface` + `outline-variant` 실선 | outlined 카드 |
| `text`     | 없음                               | —             |

특히 첫 줄을 보세요. 이 라이브러리의 다른 곳에서 `filled`는 강조 색 위에 그에 맞는 잉크를 얹은 것이지만, 컨테이너에서는 중립 표면입니다. 명세 자신의 filled 카드가 그렇기 때문입니다. 스스로가 칠해지는 대상인 컴포넌트는 `color`를 받는 것으로 그렇다고 말합니다 — 메시지라면 [MPAlert](../feedback/alert), 토큰이라면 [MPChip](../display/chip), 액션이라면 [MPButton](../inputs/button)입니다.

## `size`는 여백이고, 그것뿐입니다

이 라이브러리에서 단계가 높이도 타입 스케일도 정하지 않는 유일한 컴포넌트입니다.

<Demo src="box/sizes" :minHeight="320">

<<< @/.vitepress/demos/box/sizes.tsx

</Demo>

박스는 담고 있는 것만큼 높고, 그 자식들은 자기 타이포그래피를 가지고 옵니다. 타입 스케일을 다시 정하는 컨테이너는 같은 문단을 무엇으로 감쌌느냐에 따라 두 가지 크기로 그리게 만듭니다.

**모서리**도 사다리에 없고, 여기서 이 라이브러리는 대부분의 다른 라이브러리와 갈라집니다. 머터리얼에서 반지름은 취향에 따른 크기가 아니라 이것이 어떤 종류의 물건인지에 대한 진술입니다. 텍스트 필드는 `corner-extra-small`의 우물, 버튼은 `corner-full`의 알약, 다이얼로그는 `corner-extra-large`의 물건입니다. 박스는 시트이므로 어느 단계에서나 `corner-medium`이고, 척도 전체를 옮기는 일은 [`data-mp-shape`](../../guide/getting-started#shape) — 박스 하나가 아니라 페이지에 대한 결정 — 입니다.

## `elevation`이 없는 이유

이 라이브러리 어디에도 `elevation` prop은 없고, 그 부재를 가장 메우고 싶어지는 곳이 박스입니다.

없는 채로 두는 이유는 MD3가 높이를 자유로운 축으로 다루지 않기 때문입니다. 올라간 표면은 레벨 1 그림자 아래의 `surface-container-low`입니다. 톤과 그림자는 함께 내려진 하나의 결정입니다. 올라간 면은 빛을 더 받기 때문입니다. `filled` 박스를 들어 올리는 prop은 명세에 이름도 없고 짝이 되는 `on-` 역할도 없는 표면을 만들어 냅니다.

`variant="elevated"`가 그 결정을, 한 번에 내린 것입니다.

## 예시

### padded

가장자리까지 닿아야 하는 내용에는 꺼 두세요.

```tsx
<MPBox padded={false}>
  <img src="/cover.jpg" alt="" style={{ display: 'block', width: '100%' }} />
</MPBox>
```

모서리는 여전히 사진을 잘라냅니다. 모서리를 가진 쪽이 시트이기 때문입니다.

### render

Base UI 자신의 탈출구입니다. 표면을 포기하지 않고도 문서에 실제로 필요한 엘리먼트가 될 수 있습니다.

```tsx
<MPBox render={<section />} aria-labelledby="totals">…</MPBox>

<MPBox render={<li />} variant="text">…</MPBox>
```

### 중첩

박스 안의 박스에는 `text`나, 부모보다 한 단계 조용한 것을 쓰세요. 사각형 안의 사각형은 사각형 두 개입니다.

```tsx
<MPBox>
  <MPBox variant="text" padded={false}>
    …
  </MPBox>
</MPBox>
```

## 접근성

박스는 표면을 가진 `<div>`입니다. 역할도, 상태도, 키보드 계약도 없고, 일부러 아무것도 더하지 않습니다. 스크린 리더가 알려야 할 영역에는 이름과 그 이름을 받을 엘리먼트가 필요하고, 그것이 `render`가 있는 이유입니다.

```tsx
<MPBox render={<section />} aria-label="주문 요약">
  …
</MPBox>
```

## 함께 보기

- [MPCard](./card) — 이 박스 위에 제목, 푸터, 구분선을 배치한 것.
- [MPCollapsible](./collapsible) — 접히는 이 박스.
- [MPAlert](../feedback/alert) — 스스로가 메시지여서 강조 색을 실제로 받는 시트.
