---
title: MPHoverCard
order: 15
---

# MPHoverCard

<p class="mp-lede">포인터가 무언가 위에 머물면 열리는 카드. 그 너머에 무엇이 있는지 미리 보여 줍니다. 툴팁처럼 부르지 않았는데 오고, 팝오버처럼 손이 닿습니다.</p>

<Demo src="hover-card/hero" :minHeight="260" />

::: fw react

```tsx
import { MPHoverCard, MPTextLink } from 'material-plus-ui';

<MPHoverCard
  trigger={<MPTextLink href="/people/priya">Priya Raman</MPTextLink>}
  title="Priya Raman"
  description="Platform team"
>
  2023년 합류. 배포 파이프라인 담당.
</MPHoverCard>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPHoverCard(
  trigger: MPTextLink(onPressed: openProfile, child: const Text('Priya Raman')),
  title: const Text('Priya Raman'),
  description: const Text('Platform team'),
  child: const Text('2023년 합류. 배포 파이프라인 담당.'),
);
```

카드를 트리 밖으로 들어 올려 그리므로 위쪽에 `Overlay`가 있어야 합니다. 내비게이터가 있는 `WidgetsApp`과 `MaterialApp`은 둘 다 하나를 둡니다.

:::

## Props

<PropsTable name="MPHoverCard" />

## 다른 두 팝업 사이의 자리

양쪽 모두와 거리가 가깝습니다. 셋 중 잘못 고르는 실수를 피하게 하려고 있는 컴포넌트입니다.

|  | 무엇이 여는지 | 포인터가 닿는지 | 무엇이 들어가는지 |
| --- | --- | --- | --- |
| [MPTooltip](./tooltip) | 호버, 부르지 않았는데 | 아니오 | 레이블. 한 줄 |
| **MPHoverCard** | 호버, 부르지 않았는데 | 예 | 미리 보기. 제목, 한 줄, 그림, 링크 |
| [MPPopover](./popover) | 누름, 불러서 | 예 | 패널. 폼, 메뉴, 무엇이든 |

## 부르지 않았는데 오므로, 무언가에 이르는 유일한 길이 될 수 없습니다

포인터가 없는 터치스크린은 트리거 자신의 경로로 도착하고, 스크린 리더는 카드가 열려도 그 안으로 안내되지 않습니다. 그러니 카드 안에 있는 것은 트리거가 데려가는 페이지에도 있어야 합니다.

지름길로 보세요. 사실이 사는 자리로는 절대 쓰지 마세요.

키보드 포커스에서도 열립니다. 포인터와 같은 `delay`만큼 기다린 뒤입니다<Fw react=". Base UI의 동작입니다" />. 링크가 늘어선 문단을 탭으로 지나가도 링크마다 카드가 열리지 않는 것도 그 지연 덕분입니다. 포커스가 머문 링크만 카드를 보여 줍니다. 누르면서 들어온 포커스로는 열리지 않습니다.

::: fw react

## 트리거는 ref를 받는 엘리먼트 하나여야 합니다

Base UI가 ref와 핸들러를 붙이려고 그 엘리먼트를 복제합니다. 사이에 낀 평범한 함수 컴포넌트는 둘 다 삼켜 버리고, 그러면 카드는 영영 열리지 않으면서 이유도 말해 주지 않습니다.

```tsx
// 틀림: `Person`이 ref와 핸들러를 삼킵니다.
const Person = () => <MPTextLink href="/people/priya">Priya Raman</MPTextLink>;
<MPHoverCard trigger={<Person />} />;

// 맞음.
<MPHoverCard trigger={<MPTextLink href="/people/priya">Priya Raman</MPTextLink>} />;
```

Material Plus의 모든 컴포넌트는 ref를 받고 props를 펼치므로 어느 것이든 그대로 씁니다.

## 스스로 이름을 답니다

`title`이 카드의 접근성 이름이 되고 `description`이 설명이 됩니다. 손으로 연결한 것입니다. Base UI의 preview card에는 popover와 달리 `Title`이나 `Description` 파트가 없어서, 그것 없이는 스크린 리더가 아무 설명 없이 시트를 읽습니다.

:::

::: fw flutter

## 어떤 위젯이든 트리거가 됩니다

카드는 트리거 안으로 손을 넣지 않고 트리거 바깥에서 신호를 듣습니다. 그래서 텍스트 링크든 아바타든 문단 한가운데 `WidgetSpan`에 든 `Text`든 트리거가 될 수 있습니다. 트리거는 쓰인 자리에 그대로 그려지고, 카드는 레이아웃에 상자를 더하지 않습니다.

## 자기가 무엇인지 말합니다

카드는 시맨틱 트리에서 제목, 한 줄, 본문을 담은 노드 하나이고, `title`은 제목으로 알려집니다. 그래서 카드에 들어온 화면 낭독기는 안의 문단보다 카드가 무엇인지를 먼저 읽습니다.

키보드로 카드 안에 들어갈 수 있고, 포커스가 안에 있는 동안 카드는 열려 있습니다. 미리 보기 안의 링크에 포인터 없이도 닿습니다. <kbd>Escape</kbd>로 닫힙니다.

:::

## 트리거와 카드 사이의 틈은 건널 수 있습니다

`closeDelay`가 그것을 위한 것입니다. 포인터가 트리거를 떠난 뒤에도 카드가 잠시 붙들려 있어서, 포인터가 그 사이 8픽셀을 건널 시간이 생깁니다. 이 값을 줄이면 들어가던 손 밑에서 카드가 닫힙니다.

`delay`는 나머지 절반입니다. 무언가가 열리기까지 포인터가 얼마나 머물러야 하는지. 기본값은 링크가 늘어선 문단을 훑고 지나갈 때 카드 네 개가 따라 열리지 않을 만큼 깁니다.

## 받지 않는 것

`variant`도 `color`도 `elevation`도 없습니다. [MPPopover](./popover)와 같은 이유입니다. 다섯 무게는 "이 면이 페이지에 얼마나 자기를 주장하는가"에 답하는데 부르지 않았는데 온 카드는 이미 답이 나와 있고, 무언가에 붙는 작은 시트에 대한 MD3의 답은 중립인 `surface-container`이며, 물들일 수 있는 카드는 그 안의 미리 보기를 물들입니다. 그리고 페이지 위에 떠 있는 것이 이 카드의 전부라서, 평평하게 앉힐 수 있는 prop은 그것을 없던 일로 만듭니다.

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| ref를 받는 엘리먼트 하나인 `trigger` | 아무 위젯 | 카드가 트리거 바깥에서 신호를 들으므로 복제할 것도 삼켜질 것도 없습니다. |
| `children` | `child` | 래퍼가 감싸는 위젯 하나를 Flutter는 이렇게 부릅니다. |
| 밀리초 숫자인 `delay`, `closeDelay` | `Duration?` | 시간 길이를 나타내는 Dart의 타입입니다. `null`이면 Base UI의 600밀리초와 300밀리초입니다. |
| `defaultOpen` | `initialOpen` | Flutter가 시작값에 붙이는 이름입니다. |
| 숫자나 CSS 길이인 `width` | `double?` | Flutter의 길이는 논리 픽셀 하나뿐입니다. |
| 카드의 `aria-labelledby`와 `aria-describedby` | 노드 하나 안의 제목 | 가리킬 id가 없습니다. 화면 낭독기가 카드에서 가장 먼저 만나는 것이 제목입니다. |
| 두 축 모두의 충돌 처리 | 넘어가기만 하고 미끄러지지 않음 | 미끄러지려면 매 프레임 창을 기준으로 위치를 다시 계산해야 합니다. |
| `className`, `style`, 네이티브 속성 | — | 넘겨줄 클래스 목록도 스타일 속성도 없습니다. |

:::
