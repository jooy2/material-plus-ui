---
title: MPAvatar
order: 4
---

# MPAvatar

<p class="mp-lede">사람이나 사물의 사진을, 아는 크기로, 절대 빈 상자가 되지 않게 그립니다. 사진이 없거나 늦으면 이니셜이 대신하고, 이니셜도 없으면 실루엣이 대신합니다.</p>

<Demo src="avatar/hero" :minHeight="140" />

::: fw react

```tsx
import { MPAvatar } from 'material-plus-ui';

<MPAvatar src="/anya.jpg" name="Anya Sol" />
<MPAvatar name="홍길동" color="tertiary" />
<MPAvatar shape="square" variant="outlined" initials="MP" />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAvatar(image: NetworkImage('/anya.jpg'), name: 'Anya Sol');
const MPAvatar(name: '홍길동', color: MPColor.tertiary);
const MPAvatar(shape: MPAvatarShape.square, variant: MPVariant.outlined, initials: 'MP');
```

:::

## Props

<PropsTable name="MPAvatar" />

::: fw react

모든 native `<span>` 속성이 그대로 전달되고, `ref`는 루트에 닿습니다.

:::

## 그릴 수 있는 것은 셋, 한 번에 하나입니다

`src`(Flutter에서는 `image`)가 있고 잘 불러와졌다면 사진. 아니면 그것을 대신할 것 — `children`(`child`), `initials`, 또는 `name`에서 파생한 이니셜. 셋 다 없으면 실루엣.

어느 것이 보일지는 React에서는 Base UI의 `Avatar`가, Flutter에서는 `Image` 위젯의 frame builder와 error builder가 정합니다. "이미지가 불러와졌는가"는 답이 넷이고 그 사이에 경합이 있는 질문이기 때문입니다. `onLoadingStatusChange`가 그 넷을 알려주고, `delay`는 캐시된 이미지가 걸리는 시간만큼 대체 표시를 붙잡아 둡니다. 그러면 어차피 곧 도착할 사진 앞에서 이니셜이 깜빡이지 않습니다.

## `name`은 세 가지 일을 합니다

사진의 이름이 되고, 이니셜이 여기서 파생되고, 스크린 리더가 그 이니셜 **대신** 듣는 문장이 됩니다.

마지막 것이 핵심입니다. `JD`를 소리 내어 읽으면 두 글자이지 사람이 아닙니다. 그래서 이름이 있으면 그 이름이 대체 표시의 접근성 이름이 되고, 이니셜은 자신이 대신하고 있는 그림으로 남습니다.

규칙은 첫 단어의 첫 글자와 마지막 단어의 첫 글자입니다.

| `name`         | 이니셜 |
| -------------- | ------ |
| `Jane Doe`     | `JD`   |
| `Ada Lovelace` | `AL`   |
| `홍길동`       | `홍`   |
| `🚀 Team`      | `🚀T`  |

한 단어면 한 글자인 것은 의도한 것입니다. 한국어·일본어·중국어 이름은 한 덩어리이고, 32px에서 두 글자는 얼룩이지만 한 글자는 이름입니다. 기본 다국어 평면 밖의 문자를 두 코드 유닛 사이에서 자르지 않고, macOS 파일 이름과 여러 API가 건네는 분해된 결합 문자도 `A`가 아니라 `Ä`로 만듭니다.

규칙이 틀렸을 때는 `initials`로 직접 씁니다.

::: fw react

## 긴 목록에서

기본값에서 그림은 페이지가 하이드레이션된 뒤 스크립트가 가져오고, 도착하면 그립니다. 깨진 그림이 보일 일은 없지만, 아바타 쉰 개가 있는 페이지는 그 대가를 치릅니다. 쉰 개 중 어느 것도 서버 마크업에 없고, 브라우저의 프리로드 스캐너가 보지 못하며, `loading="lazy"`도 무시됩니다. 페이지가 하이드레이션되는 순간 쉰 개가 페이지에서 가장 큰 그림과 함께 한꺼번에 내려받아집니다. `keepMounted`를 주면 각 아바타가 처음부터 `<img>`이고, 브라우저가 알아서 불러오며, 도착할 때까지 그 아래에 이니셜이 보입니다.

```tsx
<MPAvatar src={person.photo} name={person.name} keepMounted imageProps={{ loading: 'lazy' }} />
```

`@base-ui/react` 1.8 이상이 필요합니다.

:::

::: fw flutter

## 긴 목록에서

사진은 파일 크기가 아니라 상자 크기에 맞춰 디코딩합니다. 목록의 아바타마다 수백 킬로바이트와 수 메가바이트의 차이가 납니다. `ListView.builder` 안이라면 행이 가까이 스크롤되어 와야 아바타가 만들어지므로, 쉰 개짜리 목록이 사진 쉰 장을 한꺼번에 요청하지 않습니다.

:::

## 예시

### size

컨트롤 높이입니다. 그래서 툴바에서 아바타와 그 옆 버튼의 높이가 같습니다.

<Demo src="avatar/sizes" :minHeight="160">

::: fw react

<<< @/.vitepress/demos/avatar/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/avatar/sizes.dart

:::

</Demo>

이니셜은 행이 아니라 상자를 기준으로 크기가 정해집니다 — 지름의 약 40%인데, 두 글자가 가장자리에 닿지 않으면서 너비를 채우는 지점입니다. 각 단계는 여전히 보간한 크기가 아니라 머터리얼의 역할입니다.

### shape

`circle`이 기본값이고 머터리얼이 그리는 모양입니다. `square`는 대신 모서리를 깎습니다. `md`부터는 `corner-medium`, 그보다 작은 두 단계는 `corner-extra-small`과 `corner-small`입니다. 로고나 저장소 아이콘이 원하는 모양인데, 그것들은 사각형의 가장자리까지 그려져 있어서 둥근 크롭이 잘라 먹습니다.

### variant

`tonal`이 기본값인 이유는 MD3가 모노그램을 올리는 면이 그것이기 때문입니다. 강조 색 계열의 container 색과 짝이 되는 `on-` 잉크입니다. `filled` 아바타로 채운 페이지는 아무도 이름을 읽어낼 수 없는 진한 원들의 페이지입니다.

## 상태 점은 없습니다

초록 점이 붙은 아바타는 아바타를 담은 [MPBadge](./badge)입니다. 그것을 위한 두 번째 표기를 만들면 라이브러리에 같은 것이 둘 생깁니다.

::: fw react

```tsx
<MPBadge dot color="tertiary" overlap="circle" placement="bottom-end" label="접속 중">
  <MPAvatar name="홍길동" />
</MPBadge>
```

:::

::: fw flutter

```dart
const MPBadge(
  dot: true,
  color: MPColor.tertiary,
  overlap: MPBadgeOverlap.circle,
  placement: MPCorner.bottomEnd,
  label: '접속 중',
  child: MPAvatar(name: '홍길동'),
)
```

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `src`, `srcSet` | `ImageProvider`인 `image` | Flutter의 사진은 모두 provider입니다. 해상도 고르기는 provider가 맡고, `AssetImage`는 기기의 픽셀 비율을 읽습니다. |
| `alt` | `semanticLabel` | 화면 낭독기가 읽는 이름을 Flutter에서 부르는 이름입니다. |
| 밀리초 단위의 `delay` | `Duration?` | Flutter에서 시간 길이를 나타내는 타입입니다. |
| `keepMounted`, `imageProps` | — | 둘 다 브라우저가 `<img>`를 가져오는 방식에 관한 것입니다. Flutter의 사진은 provider가 가져오고, 아바타가 만들어질 때 비로소 요청합니다. |
| 분해된 결합 문자로 온 이름 | 첫 코드 포인트 | Dart에는 유니코드 정규화가 기본으로 없어서 `A`와 결합 부호는 `A`가 됩니다. 중요하면 `initials`를 줍니다. |
| `transition` | — | 등장 효과는 아바타를 감싸는 애니메이션 위젯이 맡습니다. |
| `className`, `style`, `ref` | — | 넘길 클래스 목록, style 속성, 엘리먼트가 없습니다. |

:::

## 함께 보기

- [MPBadge](./badge) — 모서리에 붙는 표시.
- [MPList](./list) — 아바타가 보통 도착하는 곳, `startIcon`.
