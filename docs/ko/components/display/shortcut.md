---
title: MPShortcut
order: 11
---

# MPShortcut

<p class="mp-lede">키보드의 키, 또는 그 조합입니다. 이것을 그냥 꾸민 상자 이상으로 만드는 두 가지는 모두 상자가 아니라 라벨에 관한 것입니다.</p>

<Demo src="shortcut/hero" :minHeight="180" />

::: fw react

```tsx
import { MPShortcut } from 'material-plus-ui';

<MPShortcut keys="Mod+K" />
<MPShortcut keys="Mod+Shift+P" os="windows" />
<MPShortcut keys={['Ctrl', '+']} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPShortcut(keys: 'Mod+K');
const MPShortcut(keys: 'Mod+Shift+P', os: MPShortcutOS.windows);
const MPShortcut(keys: <String>['Ctrl', '+']);
```

:::

## Props

<PropsTable name="MPShortcut" />

::: fw react

모든 native `<span>` 속성이 그대로 전달되고, `ref`는 루트에 닿습니다.

:::

::: fw flutter

Dart에는 유니언 타입이 없어 `keys`는 `Object`로 받습니다. `String`이나 `List<String>`이어야 하며 디버그에서 확인합니다. 이 컴포넌트는 키를 그리기만 합니다. 키에 반응하는 일은 앱의 `Shortcuts`나 `CallbackShortcuts`가 맡습니다.

:::

## `Mod`이 이것이 존재하는 이유입니다

`Ctrl+K`로 적은 단축키는 모든 맥 사용자에게 틀렸고, `⌘K`로 적은 것은 나머지 모두에게 틀렸습니다. `Mod`은 "단축키가 기반하는 수정 키"를 뜻하는 토큰이고 — 맥에서는 Command, 나머지에서는 Control — 플랫폼에 따라 결정됩니다.

<Demo src="shortcut/platforms">

::: fw react

<<< @/.vitepress/demos/shortcut/platforms.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/shortcut/platforms.dart

:::

</Demo>

`auto`는 React에서는 브라우저에, Flutter에서는 `defaultTargetPlatform`에 물어봅니다. 사용자가 지금 누르려는 단축키라면 그것이 맞습니다. 나머지 세 값은 사용자의 플랫폼이 아니라 특정 플랫폼을 명시해야 하는 문서를 위한 것입니다 — 윈도우 빌드를 설명하는 지원 페이지, 둘을 비교하는 표.

:::: fw react

::: tip 서버 렌더링

플랫폼은 렌더 중이 아니라 `useSyncExternalStore`로 읽습니다. 서버의 답과 브라우저의 답이 _달라야 한다_ 고 React에 말해주는 유일한 API입니다. `Ctrl`로 하이드레이션하고 `⌘`로 다시 렌더링하는데, 맥 사용자가 실제로 보는 순서가 그것입니다. 렌더 중에 `navigator`를 읽는 것은 하이드레이션 불일치입니다.

:::

::::

## `⌘`는 단어가 아닙니다

스크린 리더는 그것을 "place of interest sign"으로 읽습니다. 아무의 키보드에도 없는 키입니다.

::: fw react

그래서 글리프로 그려지는 모든 키는 잘려 있는 상자 안에 자기 이름을 함께 지니고, 읽히는 것은 "Command K" — 이 단축키의 실제 이름 — 입니다.

이음쇠가 `aria-hidden`인 것도 같은 이유입니다. "Ctrl 더하기 K"는 구두점을 읽는 것입니다.

:::

::: fw flutter

그래서 조합 전체가 의미 노드 하나이고, 각 키를 부르는 이름으로 이름이 붙습니다. 읽히는 것은 정류장 세 개, 그것도 첫 번째가 기호인 정류장이 아니라 "Command Shift P", 이 단축키의 실제 이름입니다.

이음쇠를 그 이름에서 빼는 것도 같은 이유입니다. "Ctrl 더하기 K"는 구두점을 읽는 것입니다.

:::

## 각 토큰이 무엇이 되는지

| 토큰                             | mac    | windows     | linux       |
| -------------------------------- | ------ | ----------- | ----------- |
| `Mod`, `CmdOrCtrl`               | `⌘`    | `Ctrl`      | `Ctrl`      |
| `Meta`, `Cmd`, `Command`, `Win`  | `⌘`    | `Win`       | `Super`     |
| `Ctrl`, `Control`                | `⌃`    | `Ctrl`      | `Ctrl`      |
| `Alt`, `Option`, `Opt`           | `⌥`    | `Alt`       | `Alt`       |
| `Shift`                          | `⇧`    | `Shift`     | `Shift`     |
| `Enter`, `Return`                | `↩`    | `Enter`     | `Enter`     |
| `Escape`, `Esc`                  | `⎋`    | `Esc`       | `Esc`       |
| `Backspace`                      | `⌫`    | `Backspace` | `Backspace` |
| `Delete`, `Del`                  | `⌦`    | `Del`       | `Del`       |
| `Up` / `Down` / `Left` / `Right` | `↑↓←→` | `↑↓←→`      | `↑↓←→`      |

별칭은 인심이 아니라 의도입니다. `Cmd`, `Command`, `Meta`는 하나의 키가 이미 가진 세 이름이고, 그중 하나만 받는 컴포넌트는 호출자가 매번 찾아봐야 하는 컴포넌트입니다.

화살표는 맥에서만이 아니라 어디서나 화살표로 그려집니다. 화살표는 맥의 관례가 아니라 키에 인쇄되어 있는 것입니다.

표에 없는 것은 쓴 그대로 인쇄됩니다. 한 글자는 대문자로 바꾸는 배려 하나만 있습니다. `keys="mod+k"`는 K를 그립니다. 키에 그렇게 적혀 있으니까요.

## `separator`

생략하면 플랫폼의 관례를 따릅니다. 윈도우와 리눅스는 `+`, macOS는 아무것도 없습니다 — 맥에서 단축키는 기호의 나열로 적힙니다. `⇧⌘P`이지 `⇧+⌘+P`가 아닙니다.

::: fw react

## 키는 진짜 `<kbd>` 엘리먼트입니다

감싸는 것은 `<span>`입니다. `<kbd>` 안에 `<kbd>`를 넣는 것도 허용되고 그것대로 옹호할 만하지만, `kbd` 래퍼는 호스트 스타일시트가 손을 뻗을 상자가 하나 더 생기는 것뿐입니다 — 의미는 어느 쪽이든 키 자신이 나릅니다.

:::

캡은 `corner-extra-small`이고, 모양 스케일에서 `corner-full`로부터 가장 먼 곳입니다. 여기에는 누를 수 있는 것이 없습니다.

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `string \| string[]`인 `keys` | `Object` | Dart에는 유니언 타입이 없습니다. `String`이나 `List<String>`이며 디버그에서 확인합니다. |
| 브라우저를 읽는 `auto` | `defaultTargetPlatform` | macOS와 iOS는 `mac`, Windows는 `windows`, 나머지는 `linux`입니다. |
| 잘린 이름을 품은 `<kbd>` | 조합 전체에 노드 하나 | 이름을 실을 엘리먼트가 없습니다. 조합에 이름 하나를 붙이면 단축키의 이름으로 읽힙니다. |
| 이음쇠를 없애는 `separator={null}` | `SizedBox.shrink()` | Dart에서는 `null`이 이미 "플랫폼의 관례"를 뜻합니다. |
| `font-mono` | `fontFamily: 'monospace'` | 브라우저는 이 일반 글꼴군을 풀어 주고, 다른 플랫폼에서는 엔진의 기본 글꼴로 돌아갑니다. |
| `className`, `style`, `ref` | — | 넘길 클래스 목록, style 속성, 엘리먼트가 없습니다. |

:::

## 함께 보기

- [MPTooltip](../feedback/tooltip) — 단축키가 보통 도착하는 곳, 그것이 하는 일 옆.
- [MPList](./list) — 행의 `action`에 놓인 단축키는 곧 메뉴입니다.
