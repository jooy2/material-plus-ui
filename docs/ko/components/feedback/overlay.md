---
title: MPOverlay
order: 5
---

# MPOverlay

<p class="mp-lede">페이지 전체를 덮어 쓰지 못하게 하는 시트입니다. 대화상자와 다른 점은 여기에 <em>없는</em> 것들입니다. 면도, 외곽선도, 제목도, 액션도 없습니다 — 스크림 그 자체와, 그 위에 호출자가 올려놓는 것뿐입니다.</p>

<Demo src="overlay/hero" :minHeight="80" />

::: fw react

```tsx
import { MPOverlay, MPProgressCircular } from 'material-plus-ui';

<MPOverlay open={saving} label="저장 중">
  <MPProgressCircular size="lg" />
</MPOverlay>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPOverlay(
  open: saving,
  label: '저장 중',
  child: const MPProgressCircular(size: MPSize.lg),
);
```

오버레이는 트리 밖으로 들려 올라가므로 위쪽에 `Overlay`가 있어야 합니다. 내비게이터가 있는 `WidgetsApp`이 하나를 줍니다. 어디에 쓰든 상관없고, 쓴 자리는 차지하지 않습니다.

:::

## Props

<PropsTable name="MPOverlay" />

## `dismissible`이 꺼져 있고, 두 번 읽을 prop은 그것입니다

[MPDialog](./dialog)와 반대입니다. 대화상자는 질문을 하고 Escape는 보편적인 "아니오"입니다. 오버레이는 아무것도 묻고 있지 않습니다 — **기다리라**고 말하고 있습니다 — 그리고 스치는 클릭으로 사라질 수 있는 저장은 사용자가 끝났다고 믿게 되는 저장입니다.

무언가의 바깥 클릭을 받아내는 것이 일인 오버레이라면 켜세요.

::: fw flutter

`onOpenChange`는 `dismissible`이 켜져 있을 때만 불립니다. 그 밖에는 오버레이를 닫아 달라고 청할 수 있는 것이 없습니다. 꺼져 있고 `modal`이 켜져 있으면 시스템 뒤로 가기는 페이지로 넘어가지 않고 거절됩니다. 오버레이가 기다리는 일을 중간에 버리고 떠날 수 없게 하려는 것입니다.

:::

## 예시

### tone

한 축의 네 단계입니다. 뒤에 있는 것이 얼마나 읽히는가. alpha만큼이나 blur 반경으로 조율되어 있습니다 — 16px쯤을 넘으면 배경이 납작한 색으로 뭉개져서, alpha를 아무리 낮춰도 시트가 불투명하게 읽힙니다.

<Demo src="overlay/tones" :minHeight="80">

::: fw react

<<< @/.vitepress/demos/overlay/tones.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/overlay/tones.dart

:::

</Demo>

- `scrim` — MD3의 스크림이자 `MPDialog`가 자기 뒤에 두는 것과 같습니다. 페이지는 여전히 거기 있고 여전히 읽히며, 닿을 수 없게 되었을 뿐입니다.
- `blur` — 서리 유리. 페이지가 형태와 색으로는 남고 글자로는 남지 않습니다. "이것은 교체되는 중"을 위한 것.
- `solid` — 페이지 자신의 `surface`, 불투명. 정말로 사라진 화면을 위한 것.
- `clear` — 아무것도 그리지 않고도 뷰포트를 덮습니다. 이것을 고르는 이유가 바로 그것입니다. 클릭을 받아내는 보이지 않는 시트.

### label

기본값이 있고, 라이브러리에서 그런 것은 거의 없습니다. 읽을 것이 없는 오버레이 — 맨 스피너, `clear` 시트 — 도 자신이 무엇인지는 말해야 하고, 그러지 않으면 스크린 리더가 아무 이름 없이 읽는 모달 영역이 됩니다.

### modal

<Fw react="`'trap-focus'`는" flutter="`modal: false`는" /> 페이지를 스크롤·클릭 가능하게 두면서 포커스만 안에 잡아 둡니다. `clear` 오버레이가 보통 원하는 쪽입니다.

### align과 size

`align`은 내용을 뷰포트의 위·가운데·아래 중 어디에 둘지 정하고, `size`는 내용과 가장자리 사이의 여백입니다. 여기서 `size`가 정하는 것은 그것뿐입니다 — 오버레이에는 크기를 잴 면이 없습니다.

## 접근성

- 오버레이는 `label`로 이름이 붙은 모달 영역입니다.
- <Fw react="포털, 스크롤 잠금, 안에 잡아 두는 포커스, 뒤 페이지의 inert 처리, 닫힐 때 원래 자리로 돌아가는 포커스는 Base UI가 가집니다." flutter="레이어가 자신만의 포커스 범위라서 포커스는 들어가면 안에 머물고, 뒤 페이지에는 포인터도 키보드도 화면 낭독기도 닿지 못합니다. 오버레이가 닫히면 포커스는 원래 가지고 있던 곳으로 돌아갑니다." />
- `clear` 오버레이는 보이지 않을 뿐 없는 것이 아닙니다. 여전히 포인터를 막고 포커스를 가두므로, 뒤에 있는 것은 숨겨진 것이 아니라 실제로 닿을 수 없습니다.

::: fw flutter

- 레이어는 화면 낭독기에 대화상자(`SemanticsRole.dialog`)로 알려지고, 여는 경로의 이름을 `label`로 붙입니다. 화면 낭독기는 이것으로 화면이 바뀌었다는 것을 압니다.
- 시스템 뒤로 가기(Android의 뒤로 버튼과 제스처, TalkBack의 뒤로, VoiceOver의 escape 문지르기)는 `dismissible` 오버레이를 <kbd>Escape</kbd>처럼 닫습니다. `modal: false`이면 뒤로 가기는 아직 쓰이는 페이지로 넘어갑니다.
- 운영체제에서 애니메이션을 끄면 오버레이가 바로 나타나고 바로 사라집니다.

## React 빌드와 다른 점

- **`modal`은 `bool`입니다.** `false`가 React의 `'trap-focus'`에 해당합니다. 페이지는 포인터로 쓸 수 있고 포커스는 레이어 안에 남습니다. 포커스까지 내보내는 React의 `false`에 맞는 값은 없습니다. 이 레이어는 언제나 자신만의 포커스 범위이기 때문입니다.
- **`defaultOpen`은 `initialOpen`**, `children`은 `child`입니다. Flutter의 이름입니다.
- **`blur`는 채도를 올리지 않습니다.** React의 서리 유리는 `blur(14px) saturate(1.4)`인데, Flutter 레이어는 blur 하나만 받으므로 뒤 페이지는 자기 색을 그대로 둡니다.
- **스크림 조절 값이 없습니다.** `--mp-scrim-blur`는 CSS 사용자 정의 속성이고, 여기서 스크림의 blur는 2px로 고정입니다.
- **스크롤 잠금이 없습니다.** 잠글 문서가 없습니다. 장벽이 이미 포인터를 받아 내므로 뒤의 스크롤 영역에는 닿을 수 없습니다.
- **`className`, `style`이 없습니다.** 넘겨줄 클래스 목록도 style 속성도 없습니다.

:::

## 함께 보기

- [MPProgressCircular](./progress-circular) — 그 위에 보통 놓이는 것.
- [MPDialog](./dialog) — 읽을 것이 있고 답할 것이 있을 때.
