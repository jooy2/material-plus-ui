---
title: MPCarousel
order: 6
---

# MPCarousel

<p class="mp-lede">슬라이드가 늘어선 띠이고, 그중 하나가 화면에 들어와 있습니다. 스와이프로도, 트랙패드 드래그로도, 화살표 키로도 움직이고, 오른쪽에서 왼쪽으로 쓰는 글에서는 반대로 흐릅니다.</p>

<Demo src="carousel/hero" :minHeight="260" />

::: fw react

```tsx
import { MPCarousel } from 'material-plus-ui';

<MPCarousel label="숲길">
  <img src="/forest-trail.jpg" alt="키 큰 나무 사이로 난 오솔길" />
  <img src="/snowy-cabin.jpg" alt="얼어붙은 개울 옆 눈 덮인 오두막" />
</MPCarousel>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPCarousel(
  label: '숲길',
  children: <Widget>[
    Image(image: AssetImage('forest-trail.jpg'), semanticLabel: '키 큰 나무 사이로 난 오솔길'),
    Image(image: AssetImage('snowy-cabin.jpg'), semanticLabel: '얼어붙은 개울 옆 눈 덮인 오두막'),
  ],
);
```

:::

## Props

<PropsTable name="MPCarousel" />

::: fw react

## 스크롤 컨테이너인 이유

이 컴포넌트의 좋은 점은 거의 전부 한 가지 선택에서 따라 나옵니다. 띠는 옮겨지는(translate) 트랙이 아니라 `scroll-snap-type`이 걸린 진짜 스크롤 컨테이너입니다.

- **스와이프와 트랙패드 드래그가 동작합니다.** 흉내가 아니라 브라우저 자신의 스크롤이기 때문입니다.
- **RTL에서 알아서 반대로 흐릅니다.** 스크롤에는 방향이 있고 `translate`에는 없기 때문입니다.
- **화살표 키가 동작합니다.** 역시 브라우저의 것이고, RTL에서도 올바릅니다. <kbd>→</kbd>를 "다음"에 대응시킨 핸들러였다면 그렇지 않았을 겁니다.
- **변형되는 것이 없습니다.** 표면을 움직이지 않는다는 이 라이브러리의 규칙이 공짜로 지켜집니다.

움직임은 `scroll-behavior: smooth`입니다. 즉 움직임을 줄여 달라고 한 사람은 그 사람을 기억하려고 따로 쓴 두 번째 코드 경로가 아니라 같은 경로에서 즉시 전환을 얻습니다.

:::

::: fw flutter

## 띠가 움직이는 방식

슬라이드는 프레임 너비 그대로 나란히 놓이고, 띠가 프레임 아래로 미끄러집니다. 프레임은 가장 키 큰 슬라이드만큼 높으므로, 캐러셀에 따로 높이를 줄 필요가 없습니다.

- **스와이프, 트랙패드 드래그, 마우스 드래그**로 모두 움직입니다. 빠르게 튕기면 다음 슬라이드로 넘어가고, 짧고 느린 드래그는 제자리로 돌아옵니다.
- **RTL에서는 반대로 흐릅니다.** 드래그와 화살표 키도 마찬가지입니다.
- **화살표 키가 동작합니다.** 띠에 포커스가 있으면 쓰기 방향을 따르고, <kbd>Home</kbd>과 <kbd>End</kbd>로 양 끝에 갑니다.
- **띠 말고는 변형되는 것이 없습니다.** 표면을 움직이지 않는다는 이 라이브러리의 규칙이 지켜집니다.

`MediaQuery.disableAnimations`가 켜져 있으면 모든 이동이 즉시 전환입니다.

:::

## <Fw react="최상위 자식" flutter="자식" /> 하나가 슬라이드 하나

`MPCarouselSlide`는 없습니다. <Fw react="`<MPCarousel><img /><img /></MPCarousel>`" flutter="`MPCarousel(children: <Widget>[photo, photo])`" />이 API의 전부입니다.

컴포넌트가 각 자식을 감싸는 래퍼가 너비와 스크린 리더에 필요한 이름을 들고 있습니다. 사진 한 장에 그것들을 잊지 않고 붙이는 일을 호출자에게 시킬 이유는 없습니다.

::: fw react

래퍼는 스냅 포인트와 `role="group"`/`aria-roledescription="slide"` 짝도 들고 있습니다. 조건부 슬라이드가 남긴 `null`이나 `false`는 걸러지고, 살아남은 것에는 안정적인 key가 붙습니다.

알아 둘 만한 결과가 하나 있습니다. **컴포넌트**는 안에서 무엇을 렌더링하든 슬라이드 하나입니다. 슬라이드 셋은 자식 셋이므로, 배열을 반환하는 `.map()`은 셋이고 셋을 렌더링하는 `<Group />`은 하나입니다.

:::

## autoPlay는 꺼져 있고, 핑계만 있으면 멈춥니다

읽고 있는 동안 움직이는 캐러셀은 웹에서 가장 많은 불만을 받는 패턴이므로, 요청받기 전에는 아무것도 저절로 넘어가지 않습니다. 요청받은 뒤에도 이렇습니다.

::: fw react

| 멈추는 때 | 이유 |
| --- | --- |
| 포인터가 위에 있을 때 | 누군가 이 슬라이드를 보고 있습니다 |
| 안쪽 어딘가에 포커스가 있을 때 | 키보드 사용자가 슬라이드로 들어와 읽고 있습니다 |
| 탭이 백그라운드일 때 | 아무도 아무것도 읽고 있지 않습니다 |
| 스크롤되어 화면 밖에 있을 때 | 아무도 못 보는 곳에서 넘긴 슬라이드는 놓친 슬라이드입니다 |
| `prefers-reduced-motion`이 켜져 있을 때 | 읽는 사람이 바로 이것을 하지 말아 달라고 했습니다 |

:::

::: fw flutter

| 멈추는 때 | 이유 |
| --- | --- |
| 포인터가 위에 있을 때 | 누군가 이 슬라이드를 보고 있습니다 |
| 안쪽 어딘가에 포커스가 있을 때 | 키보드 사용자가 슬라이드로 들어와 읽고 있습니다 |
| 앱이 백그라운드일 때 | 아무도 아무것도 읽고 있지 않습니다 |
| 화면 밖 라우트처럼 티커가 꺼져 있을 때 | 아무도 못 보는 곳에서 넘긴 슬라이드는 놓친 슬라이드입니다 |
| `MediaQuery.disableAnimations`가 켜져 있을 때 | 읽는 사람이 바로 이것을 하지 말아 달라고 했습니다 |

:::

live region도 같이 조용해집니다. 5초마다 새 슬라이드 이름을 읽는 영역은 그 페이지에서 스크린 리더를 쓸 수 없게 만듭니다. 그래서 `autoPlay` 중에는 <Fw react="`aria-live=&quot;off&quot;`" flutter="라이브 영역이 아니게 되고" />, 읽는 사람은 스스로 움직였을 때만 위치를 듣습니다.

## 화살표는 85%로 앉습니다

MD3에는 화살표가 없습니다. MD3의 캐러셀은 읽는 사람이 끌어서 넘기는 띠이고, 사양은 컨테이너와 아이템 폭과 패딩과 모서리까지만 다룹니다. 그래서 이것은 토큰을 따른 것이 아니라 이 라이브러리가 내린 결정입니다.

슬라이드는 대개 사진이고, 그 위에 강조색 원반 두 개가 꽉 차게 앉아 있는 것은 옮겨 주려는 대상을 향해 소리치는 장식입니다. 그래서 **컨테이너**를 85%로 내리고 글리프는 그대로 둡니다. 알파를 버튼이 아니라 배경에 거는 이유는, `opacity`는 글리프까지 함께 내리는데 살아남아야 할 대비가 바로 원반 위 글리프의 대비이기 때문입니다.

85는 재서 고른 값입니다. 최악의 경우는 흰 슬라이드입니다. 강조색이 사진 쪽으로 섞이면서 흰 글리프에 남는 여유가 가장 적어집니다. 기본 소스 색 기준으로 완전 불투명이 6.45:1, 88%가 5.04, 85%가 4.73, 80%가 4.26입니다. 4.5:1을 넘기는 가장 낮은 단계이고, 4.5:1은 _본문 글자_ 기준입니다. 글리프가 지켜야 할 값은 3:1입니다. 직접 지정한 소스 색은 이 수치를 바꾸고, 여유는 그것을 위해 남겨 둔 것입니다.

호버와 포커스와 누름은 원반을 다시 불투명하게 되돌립니다. 비활성 화살표는 사양의 처리를 그대로 지킵니다. 이미 `on-surface` 12%의 옅은 칠입니다.

## loop

기본은 켜짐입니다. 끄면 화살표가 양 끝에서 감기는 대신 `disabled`가 되는데, 시작과 끝이 있는 묶음에는 그쪽이 정직합니다. 사진 세 장의 갤러리에는 시작과 끝이 있고, 돌아가는 배너에는 없습니다.

<Demo src="carousel/controlled" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/carousel/controlled.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/carousel/controlled.dart

:::

</Demo>

<Fw react="`onValueChange`" flutter="`onChanged`" />는 인덱스가 움직이는 **모든** 경로에서 호출됩니다. 화살표, 표시점, 키, 새 슬라이드에 안착한 드래그까지. 그래서 프레임 옆의 무언가가, 아무도 핸들러를 쓰지 않은 제스처에도 발을 맞출 수 있습니다.

## MD3의 언어로 이것이 무엇인지

명세는 캐러셀 레이아웃을 네 가지로 설명합니다. 그중 셋 — hero, multi-browse, uncontained — 은 항목이 프레임 가장자리를 지나갈 때 크기를 바꿉니다. **이건 네 번째**입니다. 한 화면에 한 항목, 스냅.

나머지 셋은 스크롤 위치로 구동되는 항목별 변형이고, 그건 다른 컴포넌트이며 이 라이브러리가 아직 제공하지 않습니다. 여기 있는 것은 명세 자신의 부품으로 그렸습니다. 양옆의 filled 아이콘 버튼, 그리고 더 큰 점이 아니라 짧은 **막대**인 선택 표시자입니다. 후자는 이웃을 움직이지 않는 유일한 처리이기도 합니다. 표시가 확대되는 대신 자기 행을 따라 길어지기 때문입니다.

## 예시

### 사진이 아닌 슬라이드

무엇이든 슬라이드가 될 수 있습니다. 카드, 폼 단계, 차트.

::: fw react

```tsx
<MPCarousel variant="text" arrows={false} label="설정">
  <MPCard title="1단계">…</MPCard>
  <MPCard title="2단계">…</MPCard>
</MPCarousel>
```

:::

::: fw flutter

```dart
const MPCarousel(
  variant: MPVariant.text,
  arrows: false,
  label: '설정',
  children: <Widget>[
    MPCard(title: Text('1단계'), child: Text('…')),
    MPCard(title: Text('2단계'), child: Text('…')),
  ],
);
```

:::

<Fw react="`variant=&quot;text&quot;`" flutter="`MPVariant.text`" />는 프레임을 아예 그리지 않습니다. 슬라이드가 이미 자기 테두리를 가지고 있을 때 쓰세요.

### slideLabel

스크린 리더가 듣는 문장이자 각 표시점의 이름입니다. 위치와 전체 개수를 받으므로 어떤 언어로든 쓸 수 있습니다.

::: fw react

```tsx
<MPCarousel slideLabel={(index, count) => `${count}장 중 ${index}번째`}>…</MPCarousel>
```

:::

::: fw flutter

```dart
MPCarousel(slideLabel: (int index, int count) => '$count장 중 $index번째', children: slides);
```

:::

## 접근성

::: fw react

- 컴포넌트 전체가 `aria-roledescription="carousel"`을 가진 `region`이고, 이름은 `label`에서 옵니다.
- 슬라이드 하나하나가 `aria-roledescription="slide"`를 가진 `group`이고, 이름은 `slideLabel`에서 옵니다.
- 화면 밖 슬라이드는 `aria-hidden`이 **아닙니다**. 띠는 스크롤되므로 그 안의 모든 것에 실제로 닿을 수 있고, 탭 순서에는 남아 있는데 `aria-hidden`인 서브트리는 키보드 사용자가 스크린 리더는 설명을 거부하는 곳에 도착하는 바로 그 버그의 모양입니다.
- 띠 자체가 포커스를 받으므로 화살표 키가 닿습니다. 브라우저 자신의 스크롤 컨테이너 처리이고, RTL에서도 이미 올바릅니다.
- 표시점은 이름이 있는 진짜 버튼이며, 현재 것은 `aria-current`를 가집니다.

:::

::: fw flutter

- 컴포넌트 전체가 `label`을 이름으로 가진 노드이고, 슬라이드 하나하나가 `slideLabel`을 이름으로 가진 노드입니다.
- 화면 밖 슬라이드도 semantics 트리에 남습니다. 모든 슬라이드가 빌드되어 있어 그 안의 모든 것에 실제로 닿을 수 있고, 키보드로는 닿는데 스크린 리더는 설명을 거부하는 서브트리야말로 숨겼을 때 생길 버그입니다.
- 띠 자체가 포커스 정지점이므로 화살표 키가 닿고, 쓰기 방향을 따릅니다.
- 화살표와 표시점은 이름이 있는 버튼이며, 현재 표시점은 선택된 것으로 읽힙니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 스냅 포인트가 있는 스크롤 컨테이너 | 캐러셀이 직접 끄는 띠 | Flutter에는 CSS 스크롤 스냅이 없어서, 띠가 스스로 재고 끌리고 자리를 잡습니다. |
| `defaultValue` | `initialValue` | 위젯이 받아서 이후 스스로 들고 있는 시작값을 Flutter는 이렇게 부릅니다. |
| `onValueChange` | `onChanged` | 값이 바뀌는 콜백의 Flutter 이름입니다. |
| 밀리초로 주는 `interval` | `Duration`으로 주는 `interval` | 시간의 길이를 나타내는 Dart의 타입입니다. |
| 아무 자식 | `children: List<Widget>` | 목록 안의 위젯 하나가 슬라이드 하나입니다. |
| 스크롤되어 화면 밖 | 티커가 꺼짐 | Flutter에는 뷰포트 관찰자가 없어서, 티커가 꺼진 캐러셀을 보이지 않는 것으로 봅니다. |
| `className`, `style` | — | 넘길 클래스 목록이나 style 속성이 없습니다. |

:::

## 함께 보기

- [MPPanes](./panes) — 넘기는 대신 읽는 사람이 크기를 조절하는 내용.
- [MPAccordion](./accordion) — 하나만 열려 있다는 점이 핵심인 구획들.
- [MPProgressBox](../feedback/progress-box) — "네 단계 중 세 번째"를 컨트롤이 아니라 표시로 말하는 것.
