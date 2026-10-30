---
title: MPEmpty
order: 2
---

# MPEmpty

<p class="mp-lede">내용이 있었어야 할 자리에 서는 것입니다. 글리프 하나, 제목 하나, 문장 하나, 그리고 빠져나갈 길. <a href="./skeleton">MPSkeleton</a>의 나머지 절반입니다 — 그쪽이 오는 중인 것의 모양이라면 이쪽은 오지 않는 것의 모양입니다.</p>

<Demo src="empty/hero" :minHeight="280" />

::: fw react

```tsx
import { MPEmpty, MPButton } from 'material-plus-ui';

<MPEmpty title="“oklch”에 대한 결과 없음" action={<MPButton size="sm">필터 지우기</MPButton>}>
  이 저장소에는 일치하는 것이 없습니다.
</MPEmpty>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPEmpty(
  title: const Text('“oklch”에 대한 결과 없음'),
  action: MPButton(size: MPSize.sm, onPressed: clear, child: const Text('필터 지우기')),
  child: const Text('이 저장소에는 일치하는 것이 없습니다.'),
);
```

:::

## Props

<PropsTable name="MPEmpty" />

::: fw react

모든 native `<div>` 속성이 그대로 전달되고, `ref`는 루트에 닿습니다.

:::

## 제목에 기본값이 있는 것은 의도한 것입니다

라이브러리에서 컴포넌트가 본문 크기로 지어내는 유일한 글입니다. 필수가 아니라 기본값인 이유는 하나입니다. 쓸모없는 말을 하는 버전이 결국 출시되는 버전이기 때문입니다.

`Nothing here`는 바닥이고, 그 위의 모든 자리 — 글리프, 문장, 동작 — 는 실제로 무엇이 없는지로 채우라고 있는 것입니다. 결과 없는 검색, 아무도 쓰지 않은 받은 편지함, 첫 파일 이전의 폴더는 서로 다른 세 가지이고, 어느 것인지는 호출자만 압니다.

<Demo src="empty/slots" :minHeight="720">

::: fw react

<<< @/.vitepress/demos/empty/slots.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/empty/slots.dart

:::

</Demo>

React의 `title={false}`, Flutter의 `showTitle: false`는 제목을 완전히 없앱니다. 글리프와 문장만 있고 그 위에 제목이 없는 상태를 위한 것입니다. 그러면 문장이 곧 _상태_ 가 되므로 `on-surface-variant`로 내려가지 않고 읽는 글로 남습니다.

## 쟁반, 그리고 왜 쟁반인지

비어 있는 _이유_ 전부를 덮어야 하기 때문입니다. 폴더, 돋보기, 문서는 각각 하나씩을 지목합니다 — 아무것도 정리되지 않음, 아무것도 찾지 못함, 아무것도 쓰지 않음 — 그리고 이 컴포넌트는 셋 모두에 쓰입니다.

::: fw react

```tsx
<MPEmpty />                                 // 쟁반
<MPEmpty icon={false} />                    // 없음
<MPEmpty icon={<MyIllustration />} />       // 직접
```

글리프는 상자가 아니라 `em`으로 크기가 정해집니다. 그래야 호출자가 건네는 무엇이든 주변 타입을 기준으로 재어지고, 다른 세트의 아이콘도 우리 것과 같은 무게로 내려앉습니다.

:::

::: fw flutter

```dart
const MPEmpty();                            // 쟁반
const MPEmpty(showIcon: false);             // 없음
const MPEmpty(icon: MyIllustration());      // 직접
```

글리프 자리는 상태의 글리프 크기(`md`에서 36)와 `onSurfaceVariant` 색으로 `IconTheme`을 둡니다. 그래서 어느 세트의 `Icon`이든 쟁반과 같은 크기와 색으로 그려집니다. 그림은 받은 크기 그대로입니다.

:::

## `variant`의 기본값은 `text`입니다

라이브러리에서 여기만 그렇습니다. 빈 상태는 거의 언제나 이미 무언가 안에 있습니다 — 카드의 본문, 헤더 아래의 표, 패널 — 그리고 첫 사각형 안에 그린 두 번째 사각형은 사각형 하나가 더 많은 것입니다. 나머지 넷은 그렇지 않은 경우를 위한 것입니다.

어느 쪽이든 면은 **중립**으로 남습니다. `action`은 남의 버튼이고 자기 색을 가지고 도착했습니다.

## `color`가 없습니다

여기 있는 거의 모든 컴포넌트가 가진 것을 일부러 두지 않았습니다. 강조 색으로 칠해진 빈 상태는 존재하지 않는 내용에 대해 주장을 하고 있는 것입니다. "이건 문제다"라고 말하는 방법은 `action` 안의 `color="error"` 버튼입니다 — 그것이 실제로 누를 수 있는 것이기 때문입니다.

## 스스로를 알립니다

독자 아래에서 비어 버린 목록은 그렇다고 말해야 하고, 다른 방법이 없습니다. 페이지에서 무언가 사라진 것이 아니라 무언가 **더해진** 것이기 때문입니다.

::: fw react

`role="status"`는 끼어들지 않고 알립니다. "결과 없음"은 방금 던진 질문에 대한 답이기 때문입니다. 도착할 때부터 페이지의 일부인 상태라면 `role={undefined}`로 끕니다.

:::

::: fw flutter

상태는 polite live region이라 끼어들지 않고 알립니다. "결과 없음"은 방금 던진 질문에 대한 답이기 때문입니다. 화면이 만들어질 때부터 그 일부인 상태라면 `liveRegion: false`로 끕니다.

:::

::: fw react

## `render`

가장 쓸모 있는 경우는 표 셀입니다.

```tsx
<tr>
  <MPEmpty render={<td colSpan={5} />} title="아직 빌드가 없습니다" />
</tr>
```

[MPTable](../display/table)의 `empty` prop이 이 컴포넌트를 통째로 받으므로 보통은 그쪽이 더 쉽습니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `children` | `child` | Flutter의 이름입니다. |
| `title={false}`, `icon={false}` | `showTitle: false`, `showIcon: false` | Dart에는 `null`도 위젯도 아닌 값이 없습니다. |
| `action`이 버튼 여러 개를 받아 줄바꿈해 줍니다 | `action`은 위젯 하나를 받습니다 | 함께 줄바꿈될 버튼들은 `alignment: WrapAlignment.center`, 간격 8의 `Wrap`으로 묶어 넘깁니다. |
| `role={undefined}` | `liveRegion: false` | 지울 role 속성이 없습니다. 알리는 일은 live region이 합니다. |
| `render` | — | 바꿔 끼울 엘리먼트가 없습니다. 표 셀은 상태를 넣은 위젯이 곧 셀입니다. |
| `transition` | — | 등장 효과는 상태를 `MPAnimateFade`나 그 형제 컴포넌트로 감싸서 줍니다. |
| `className`, `style`, 네이티브 속성 | — | 넘겨줄 곳이 없습니다. |

:::

## 함께 보기

- [MPSkeleton](./skeleton) — 나머지 절반.
- [MPTable](../display/table) — `empty`가 이것을 받는 곳.
