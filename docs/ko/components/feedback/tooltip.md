---
title: MPTooltip
order: 3
---

# MPTooltip

<p class="mp-lede">포인터가 무언가 위에 머물면 나타나는 짧은 라벨입니다. 컴포넌트 전체가 래퍼입니다 — 레이아웃에 엘리먼트를 더하지 않고, 자식은 원래 그것 그대로 남습니다.</p>

<Demo src="tooltip/hero" :minHeight="140" />

::: fw react

```tsx
import { MPTooltip, MPTooltipProvider } from 'material-plus-ui';

<MPTooltip content="클립보드에 복사">
  <MPButton aria-label="복사">
    <MPIcon icon={ICONS.copy} />
  </MPButton>
</MPTooltip>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTooltip(
  content: const Text('클립보드에 복사'),
  child: MPButton(
    semanticLabel: '복사',
    startIcon: copyIcon,
    onPressed: copy,
  ),
);
```

판을 트리 밖으로 들어 올려 그리므로 위쪽에 `Overlay`가 있어야 합니다. 내비게이터가 있는 `WidgetsApp`과 `MaterialApp`은 둘 다 하나를 둡니다.

:::

## Props

<PropsTable name="MPTooltip" />

## `color`에 기본값이 없고, 여기서 그것이 가장 중요합니다

MD3의 plain tooltip은 `inverse-on-surface` 아래의 `inverse-surface`입니다. 중립 팔레트를 스킴의 **반대쪽** 끝에서 읽은 것이라, 밝은 페이지에서는 판이 어둡고 어두운 페이지에서는 밝습니다.

그것이 툴팁을 애초에 고려된 적 없는 내용 위에서도 읽히게 만드는 것이고 — 툴팁이 나타나는 곳은 언제나 그런 내용 위입니다 — 라이브러리에서 그 두 역할을 읽는 유일한 자리입니다.

`color`를 주면 강조 색 채움으로 바뀝니다. 툴팁 자체가 경고인 경우에는 그럴 만하지만 나머지 아흔아홉 번은 틀립니다. 삭제 버튼 위의 빨간 툴팁은 툴팁이 알지 못하는 것을 말하고 있는 것입니다.

## 그림자가 없습니다

MD3는 plain tooltip을 elevation 0에 둡니다. 여기서도 그것을 따릅니다. 판을 페이지에서 떼어내는 것은 그것이 _반전된_ 면이라는 사실 — 밝은 페이지 위의 어두운 카드 — 이고, 이미 배경에서 그만큼 떨어진 것 아래의 그림자는 높이가 아니라 두 번째의 더 부드러운 가장자리로 읽힙니다.

::: fw react

## Base UI가 가진 것과 여기서 더한 것

정말 어려운 부분은 Base UI가 가집니다. 지연과 그룹 타임아웃, 포커스에는 열리되 클릭에서 온 포커스에는 열리지 않기, Escape로 닫기, 창 가장자리를 피해 팝업을 두기.

Base UI가 일부러 열어 둔 하나는 툴팁이 스크린 리더에 의미를 갖게 하는 부분입니다 — 판의 `role="tooltip"`과 트리거에서 그것을 가리키는 `aria-describedby` — 팝업은 여러 가지일 수 있고 어느 것인지는 호출자만 알기 때문입니다. 여기서는 언제나 툴팁이므로 둘 다 연결하고, 닫혀 있는 동안에는 문서에 없는 엘리먼트를 가리키는 대신 참조를 떼어냅니다.

:::

::: fw flutter

## 하는 일

포인터가 자식 위에 머물 때, 키보드가 자식에 포커스를 줄 때, 그리고 길게 누를 때 열립니다. 길게 누르기는 터치 화면의 입구입니다. 셋은 각자 툴팁을 붙들고 있어서, 포인터가 스치고 지나가도 키보드가 연 툴팁은 닫히지 않습니다. 누르면서 들어온 포커스로는 열리지 않고, 자식을 누르면 닫힙니다. <kbd>Escape</kbd>로도 닫힙니다.

포인터는 자식에서 판으로 옮겨 가 머물 수 있으므로, 한눈에 읽기 어려운 구절도 읽을 수 있습니다. 길게 눌러 연 툴팁은 손가락을 뗀 뒤에도 1.5초 동안 남습니다. 손가락을 떼는 순간은 읽는 사람이 막 읽기 시작한 순간이기 때문입니다.

판이 하는 말은 자식이 자기 툴팁으로 지니고, 화면 낭독기는 그것을 거기서 읽습니다. 판은 시맨틱 트리에서 빠지므로 같은 구절을 두 번 읽지 않습니다.

:::

## `MPTooltipProvider`

한 묶음이 지연을 공유합니다. 하나가 열리고 나면 이웃들은 즉시 열리고, 잠시 쉬면 기다림이 돌아옵니다.

::: fw react

```tsx
<MPTooltipProvider>
  <MPTooltip content="굵게">
    <MPButton>B</MPButton>
  </MPTooltip>
  <MPTooltip content="기울임">
    <MPButton>I</MPButton>
  </MPTooltip>
</MPTooltipProvider>
```

:::

::: fw flutter

```dart
MPTooltipProvider(
  child: Row(
    children: <Widget>[
      MPTooltip(
        content: const Text('굵게'),
        child: MPButton(onPressed: bold, child: const Text('B')),
      ),
      MPTooltip(
        content: const Text('기울임'),
        child: MPButton(onPressed: italic, child: const Text('I')),
      ),
    ],
  ),
);
```

<PropsTable name="MPTooltipProvider" />

:::

툴바를 감쌀 만합니다. 이것이 없으면 아이콘 버튼 줄을 따라 움직일 때마다 매 정거장에서 지연을 온전히 기다려야 하고, 그것이 툴팁이 포인터와 싸우는 느낌을 만듭니다.

## 예시

### side와 align

<Demo src="tooltip/sides">

::: fw react

<<< @/.vitepress/demos/tooltip/sides.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/tooltip/sides.dart

:::

</Demo>

자리가 없으면 반대쪽으로 넘어갈 수 있습니다. <Fw react="Base UI가 하는 일이고, 그것이 옳은 동작입니다." flutter="넘어갈 뿐 가장자리를 따라 미끄러지지는 않습니다. 트리거가 가장자리에 가까워질수록 옆으로 밀리는 판은 쐐기가 아무것도 가리키지 않게 됩니다." />

### disabled

트리거는 그대로 두고 툴팁만 열리지 않게 합니다 — 라벨이 잘렸을 때만 존재해야 하는 툴팁을 위한 것입니다.

::: fw react

```tsx
<MPTooltip content={label} disabled={!isTruncated}>
  <span className="truncate">{label}</span>
</MPTooltip>
```

:::

::: fw flutter

```dart
MPTooltip(
  content: Text(label),
  disabled: !isTruncated,
  child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis),
);
```

꺼져 있는 동안에는 자식이 화면 낭독기에 줄 말도 지니지 않으므로, 잘리지 않은 라벨을 두 번 읽지 않습니다.

:::

## 툴팁은 컨테이너가 아닙니다

터치 화면에서는 포인터로 닿을 수 없고, 주의가 옮겨가는 순간 사라지며, 그 안에 클릭할 수 있는 것을 넣어도 클릭할 수 없습니다. 둘 중 하나가 필요한 내용은 팝오버의 몫이지 이것의 몫이 아닙니다.

트리거가 여전히 자기 접근성 이름을 가져야 하는 이유이기도 합니다. 툴팁은 **설명**하지, 이름 붙이지 않습니다.

::: fw react

```tsx
// ✅ aria-label이 이름을 주고, 툴팁이 설명합니다
<MPTooltip content="클립보드에 복사">
  <MPButton aria-label="복사">
    <MPIcon icon={ICONS.copy} />
  </MPButton>
</MPTooltip>
```

:::

::: fw flutter

```dart
// semanticLabel이 이름을 주고, 툴팁이 설명합니다.
MPTooltip(
  content: const Text('클립보드에 복사'),
  child: MPButton(
    semanticLabel: '복사',
    startIcon: copyIcon,
    onPressed: copy,
  ),
);
```

자식과 툴팁의 말은 한 노드가 됩니다. 툴팁 아래의 버튼은 자기 이름과 동작으로 읽히고, 툴팁의 말이 함께 붙습니다. 자식 전체를 합치므로 자식은 툴팁이 설명하는 컨트롤이나 텍스트 하나여야 합니다. 버튼 여러 개를 툴팁 하나로 감싸면 한 덩어리로 읽힙니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `children` | `child` | 래퍼가 감싸는 위젯 하나를 Flutter는 이렇게 부릅니다. |
| 아무 노드나 받는 `content` | 위젯을 받는 `content`와 `semanticLabel` | 위젯은 소리 내어 읽을 수 없습니다. `Text`는 글자를 스스로 내주고, 그 밖의 위젯은 무슨 뜻인지 따로 말해야 합니다. |
| 밀리초 숫자인 `delay`, `closeDelay` | `Duration?` | 시간 길이를 나타내는 Dart의 타입입니다. `null`이면 프로바이더를, 그다음 기본값을 따릅니다. |
| `defaultOpen` | `initialOpen` | Flutter가 시작값에 붙이는 이름입니다. |
| 열려 있는 동안의 `role="tooltip"`과 `aria-describedby` | 늘 자식 자신의 툴팁 | Flutter는 설명을 노드 자체에 둡니다. 가리킬 id가 없고, 판은 트리에서 빠지므로 구절을 한 번만 읽습니다. |
| 두 축 모두의 충돌 처리 | 넘어가기만 하고 미끄러지지 않음 | 미끄러지려면 매 프레임 창을 기준으로 위치를 다시 계산해야 하고, 트리거에서 밀려난 쐐기는 아무것도 가리키지 않습니다. |
| 묶음 안에서 옮겨 갈 때 페이드 없음 | 평소의 짧은 페이드 | 판의 페이드는 공용 앵커 레이어가 맡고, 그 레이어에는 즉시 모드가 없습니다. |
| `className`, `style` | — | 넘겨줄 클래스 목록도 스타일 속성도 없습니다. |
| — | 길게 눌러 열기 | 터치 화면에는 머물러 있을 포인터가 없습니다. |

:::

## 함께 보기

- [MPShortcut](../display/shortcut) — `content` 안의 자연스러운 이웃.
- [MPIcon](../display/icon) — 툴팁이 가장 자주 설명하는 것.
