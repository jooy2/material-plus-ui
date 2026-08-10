---
title: MPOverlay
order: 5
---

# MPOverlay

<p class="mp-lede">페이지 전체를 덮어 쓰지 못하게 하는 시트입니다. 대화상자와 다른 점은 여기에 <em>없는</em> 것들입니다. 면도, 외곽선도, 제목도, 액션도 없습니다 — 스크림 그 자체와, 그 위에 호출자가 올려놓는 것뿐입니다.</p>

<Demo src="overlay/hero" :minHeight="80" />

```tsx
import { MPOverlay, MPProgressCircular } from 'material-plus-ui';

<MPOverlay open={saving} label="저장 중">
  <MPProgressCircular size="lg" />
</MPOverlay>;
```

## Props

<PropsTable name="MPOverlay" />

## `dismissible`이 꺼져 있고, 두 번 읽을 prop은 그것입니다

[MPDialog](./dialog)와 반대입니다. 대화상자는 질문을 하고 Escape는 보편적인 "아니오"입니다. 오버레이는 아무것도 묻고 있지 않습니다 — **기다리라**고 말하고 있습니다 — 그리고 스치는 클릭으로 사라질 수 있는 저장은 사용자가 끝났다고 믿게 되는 저장입니다.

무언가의 바깥 클릭을 받아내는 것이 일인 오버레이라면 켜세요.

## 예시

### tone

한 축의 네 단계입니다. 뒤에 있는 것이 얼마나 읽히는가. alpha만큼이나 blur 반경으로 조율되어 있습니다 — 16px쯤을 넘으면 배경이 납작한 색으로 뭉개져서, alpha를 아무리 낮춰도 시트가 불투명하게 읽힙니다.

<Demo src="overlay/tones" :minHeight="80">

<<< @/.vitepress/demos/overlay/tones.tsx

</Demo>

- `scrim` — MD3의 스크림이자 `MPDialog`가 자기 뒤에 두는 것과 같습니다. 페이지는 여전히 거기 있고 여전히 읽히며, 닿을 수 없게 되었을 뿐입니다.
- `blur` — 서리 유리. 페이지가 형태와 색으로는 남고 글자로는 남지 않습니다. "이것은 교체되는 중"을 위한 것.
- `solid` — 페이지 자신의 `surface`, 불투명. 정말로 사라진 화면을 위한 것.
- `clear` — 아무것도 그리지 않고도 뷰포트를 덮습니다. 이것을 고르는 이유가 바로 그것입니다. 클릭을 받아내는 보이지 않는 시트.

### label

기본값이 있고, 라이브러리에서 그런 것은 거의 없습니다. 읽을 것이 없는 오버레이 — 맨 스피너, `clear` 시트 — 도 자신이 무엇인지는 말해야 하고, 그러지 않으면 스크린 리더가 아무 이름 없이 읽는 모달 영역이 됩니다.

### modal

`'trap-focus'`는 페이지를 스크롤·클릭 가능하게 두면서 포커스만 안에 잡아 둡니다. `clear` 오버레이가 보통 원하는 쪽입니다.

### align과 size

`align`은 내용을 뷰포트의 위·가운데·아래 중 어디에 둘지 정하고, `size`는 내용과 가장자리 사이의 여백입니다. 여기서 `size`가 정하는 것은 그것뿐입니다 — 오버레이에는 크기를 잴 면이 없습니다.

## 접근성

- 오버레이는 `label`로 이름이 붙은 모달 영역입니다.
- 포털, 스크롤 잠금, 안에 잡아 두는 포커스, 뒤 페이지의 inert 처리, 닫힐 때 원래 자리로 돌아가는 포커스는 Base UI가 가집니다.
- `clear` 오버레이는 보이지 않을 뿐 없는 것이 아닙니다. 여전히 포인터를 막고 포커스를 가두므로, 뒤에 있는 것은 숨겨진 것이 아니라 실제로 닿을 수 없습니다.

## 함께 보기

- [MPProgressCircular](./progress-circular) — 그 위에 보통 놓이는 것.
- [MPDialog](./dialog) — 읽을 것이 있고 답할 것이 있을 때.
