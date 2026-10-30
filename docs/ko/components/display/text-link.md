---
title: MPTextLink
order: 1
---

# MPTextLink

<p class="mp-lede">문장 안에 있거나 홀로 서 있는 링크입니다. 버튼보다 의도적으로 작습니다 — 면도, 자기 높이도, 요청하지 않은 색도 없습니다. 있는 것은 밑줄 하나입니다.</p>

<Demo src="text-link/hero" :minHeight="160" />

::: fw react

```tsx
import { MPTextLink } from 'material-plus-ui';

<MPTextLink href="/docs">색 문서</MPTextLink>
<MPTextLink href="https://m3.material.io" newTab>m3.material.io</MPTextLink>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTextLink(onPressed: openColours, child: const Text('색 문서'));
MPTextLink(
  href: 'https://m3.material.io',
  newTab: true,
  onPressed: () => launchUrl(Uri.parse('https://m3.material.io')),
  child: const Text('m3.material.io'),
);
```

:::

## Props

<PropsTable name="MPTextLink" />

::: fw react

모든 native `<a>` 속성이 그대로 전달되고, `ref`는 앵커에 닿습니다.

## 맨 `<a>`가 하지 않는 세 가지

밑줄을 정해진 규칙대로 그리고, 새 탭을 여는 링크임을 눈에도 스크린 리더에도 알리고, `render`를 받아서 라우터가 주는 `Link`가 이 모든 것을 입을 수 있게 합니다.

:::

::: fw flutter

## 어디로 가는 일은 `onPressed`가 합니다

Flutter에는 주소 표시줄도 기본 내비게이션도 없어서 링크가 스스로 무언가를 열지 않습니다. 여는 일은 `onPressed`가 합니다. 라우트를 올리거나 주소를 `url_launcher`에 넘깁니다. `href`는 보조 기술에 알려 주는 주소이고, 웹에서는 엔진이 화면 낭독기용으로 그리는 링크에 들어갑니다.

링크는 버튼이 아니라 링크로 읽히고, 웹의 링크처럼 포인터나 <kbd>Enter</kbd>로만 따라갑니다. 키보드 포커스를 받으면 `secondary` 링이 그려집니다.

흐르는 글 안에서는 미리보기처럼 줄의 기준선에 맞춘 `WidgetSpan`에 넣습니다.

```dart
Text.rich(TextSpan(children: <InlineSpan>[
  const TextSpan(text: '전체 표는 '),
  WidgetSpan(
    alignment: PlaceholderAlignment.baseline,
    baseline: TextBaseline.alphabetic,
    child: MPTextLink(onPressed: openColours, child: const Text('색 문서')),
  ),
  const TextSpan(text: '에 있습니다.'),
]))
```

:::

## `color`와 `size`에는 기본값이 없습니다

문단 안의 링크는 보통 그 문단의 색에 밑줄이 그어진 것이고, 자기가 앉은 문장의 크기입니다. 미리 물들여져 도착한 컴포넌트는 페이지가 되돌려야 하는 컴포넌트입니다.

홀로 서는 링크 — 푸터, 내비게이션 바, 카드의 마지막 줄 — 에는 지정하세요.

## 예시

### underline

<Demo src="text-link/underline">

::: fw react

<<< @/.vitepress/demos/text-link/underline.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_link/underline.dart

:::

</Demo>

`always`가 기본값이고, 이유는 `color`입니다. 강조 색도 밑줄도 없으면 링크를 둘러싼 문장과 구분해 주는 것이 하나도 남지 않습니다.

이것이 불리언이 아닌 이유이기도 합니다. "밑줄 없음"은 위치가 이미 정체를 말해주는 내비게이션 바나 푸터의 링크에는 실제로 쓸 만한 선택이고, 그렇다면 흘러들어가는 것이 아니라 명시적으로 적혀야 합니다.

선은 글자 색의 45%에서 쉬다가 포인터가 오면 완전한 색이 됩니다. 그래야 물려받은 색에서도 강조 색에서도 같은 규칙이 통합니다. hover는 _글자_ 색을 일부러 건드리지 않습니다. 흐르는 본문 속에서 포인터를 따라 색이 바뀌는 링크는 읽고 있던 줄에서 독자의 눈을 끌어냅니다.

### newTab

독자 아래에서 창이 바뀌는 것은 링크에 대해 미리 볼 수 없는 유일한 일입니다.

::: fw react

그래서 `newTab`은 세 가지를 한꺼번에 합니다.

```html
<a href="…" target="_blank" rel="noopener noreferrer">
  Example
  <span>↗</span>
  <span class="visually-hidden">새 탭에서 열림</span>
</a>
```

`noopener`가 새 페이지가 `window.opener`로 되짚어 오는 것을 막고, `noreferrer`는 아직 그 쌍이 필요한 브라우저를 위해 함께 둡니다. 안내 문구 앞의 공백은 진짜 텍스트 노드라서 접근성 이름이 라벨 끝에 괄호가 붙은 모양이 아니라 두 단어로 나옵니다 — 그리고 `newTabLabel`이 그것을 독자의 언어로 적는 방법입니다.

세 가지 모두 이 prop이 아니라 `target` **속성**을 따릅니다. `target="_blank"`를 직접 적든, 그것을 지닌 라우터의 `Link`를 넘기든 같은 `rel`, 같은 표시, 같은 안내를 받습니다. 어느 쪽이든 같은 창이기 때문입니다.

직접 준 `rel`은 기본값에 더해지는 것이 아니라 대체합니다. `rel="noopener noreferrer nofollow"`가 가능한 이유입니다.

:::

::: fw flutter

그래서 `newTab`은 라벨 뒤에 상자를 벗어나는 화살표를 그리고, 화면 낭독기가 라벨 다음에 듣는 힌트로 "새 탭에서 열림"을 붙입니다. `newTabLabel`로 그 문구를 독자의 언어로 적습니다. 창을 열지는 않습니다. 앱이 어떻게 바깥으로 나가는지 아는 `onPressed`가 엽니다.

:::

### icon

생략하면 `newTab`을 따릅니다. 이것이 기본값 `false`인 평범한 불리언이 아닌 이유 전부입니다. 창을 가져가는 링크는 그렇다고 말해야 하고, 조용한 버전은 호출자가 요청해야 합니다.

::: fw react

```tsx
<MPTextLink href="…" newTab />                  // 상자를 벗어나는 화살표
<MPTextLink href="…" />                         // 없음
<MPTextLink href="…" icon />                     // 사슬
<MPTextLink href="…" icon={<MyMark />} />        // 직접
<MPTextLink href="…" newTab icon={false} />      // 눈에는 조용하게, 스크린 리더에는 그대로
```

### render

```tsx
import Link from 'next/link';

<MPTextLink href="/docs" render={<Link href="/docs" />}>
  문서
</MPTextLink>;
```

## 호스트 스타일시트에서 살아남습니다

`<a>`는 `<td>`와 함께 호스트 스타일시트가 여전히 태그 이름으로 스타일링하는 두 태그 중 하나입니다 — `.prose a`, `.vp-doc a`, 세상의 모든 CSS 프레임워크 — 그리고 그 전부가 클래스 하나에 타입 하나로, 맨 유틸리티를 이깁니다.

그래서 색과 밑줄은 컴포넌트 자신의 클래스를 선택자에 두 번 넣어 두 클래스로 만든 뒤에 쓰입니다. `.prose` 블록 안에서 색과 선을 잃은 링크는 링크의 전부를 잃은 것입니다.

:::

::: fw flutter

```dart
MPTextLink(newTab: true, onPressed: open, child: label)              // 상자를 벗어나는 화살표
MPTextLink(onPressed: open, child: label)                            // 없음
MPTextLink(icon: true, onPressed: open, child: label)                // 사슬
MPTextLink(icon: const MyMark(), onPressed: open, child: label)      // 직접
MPTextLink(newTab: true, icon: false, onPressed: open, child: label) // 눈에는 조용하게, 화면 낭독기에는 그대로
```

Dart에는 유니언 타입이 없어 `icon`은 `Object?`로 받습니다. `bool`이나 위젯이어야 하며 디버그에서 확인합니다.

:::

## `href`를 가진 버튼이 아닙니다

[MPButton](../inputs/button)에는 일부러 `href`가 없고, 이것이 그 결정의 나머지 절반입니다. 링크는 링크로 읽히고, 가운데 버튼으로 새 탭에서 열리고, 상태 표시줄에 목적지를 보여줍니다. 버튼은 그중 어느 것도 하지 않고, 하는 척해서도 안 됩니다.

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 페이지를 여는 `href` | 따라가는 일은 `onPressed` | Flutter에는 기본 내비게이션이 없습니다. `href`는 여전히 보조 기술에 알립니다. |
| `target`, `rel` | — | 열 창도 닫을 opener도 없습니다. 앱이 바깥으로 나가는 방법은 `onPressed`가 정합니다. |
| 숨긴 글자로 된 새 탭 안내 | 의미 트리의 힌트 | 숨긴 글자처럼 라벨 다음에 읽힙니다. |
| `text-underline-offset`, `0.08em` 굵기 | 글꼴 자체의 밑줄을 조금 굵게 | Flutter는 글꼴이 정한 자리에 밑줄을 긋고, `em` 대신 글꼴의 굵기에 배율을 곱합니다. |
| `render` | — | 엘리먼트를 바꿀 수 없습니다. 라우터의 이동은 `onPressed`에서 부릅니다. |
| `children` | `child` | Flutter의 이름입니다. |
| `className`, `style`, `ref` | — | 넘길 클래스 목록, style 속성, 엘리먼트가 없습니다. |

:::

## 함께 보기

- [MPButton](../inputs/button) — 목적지가 아니라 동작일 때.
- [MPBreadcrumb](./breadcrumb) — 그런 링크들의 한 줄.
