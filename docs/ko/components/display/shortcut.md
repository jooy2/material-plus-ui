---
title: MPShortcut
order: 11
---

# MPShortcut

<p class="mp-lede">키보드의 키, 또는 그 조합입니다. 이것을 그냥 꾸민 <code>&lt;kbd&gt;</code> 이상으로 만드는 두 가지는 모두 상자가 아니라 라벨에 관한 것입니다.</p>

<Demo src="shortcut/hero" :minHeight="180" />

```tsx
import { MPShortcut } from 'material-plus-ui';

<MPShortcut keys="Mod+K" />
<MPShortcut keys="Mod+Shift+P" os="windows" />
<MPShortcut keys={['Ctrl', '+']} />;
```

## Props

<PropsTable name="MPShortcut" />

모든 native `<span>` 속성이 그대로 전달되고, `ref`는 루트에 닿습니다.

## `Mod`이 이것이 존재하는 이유입니다

`Ctrl+K`로 적은 단축키는 모든 맥 사용자에게 틀렸고, `⌘K`로 적은 것은 나머지 모두에게 틀렸습니다. `Mod`은 "단축키가 기반하는 수정 키"를 뜻하는 토큰이고 — 맥에서는 Command, 나머지에서는 Control — 플랫폼에 따라 결정됩니다.

<Demo src="shortcut/platforms">

<<< @/.vitepress/demos/shortcut/platforms.tsx

</Demo>

`auto`는 브라우저에 물어봅니다. 사용자가 지금 누르려는 단축키라면 그것이 맞습니다. 나머지 세 값은 사용자의 플랫폼이 아니라 특정 플랫폼을 명시해야 하는 문서를 위한 것입니다 — 윈도우 빌드를 설명하는 지원 페이지, 둘을 비교하는 표.

::: tip 서버 렌더링

플랫폼은 렌더 중이 아니라 `useSyncExternalStore`로 읽습니다. 서버의 답과 브라우저의 답이 _달라야 한다_ 고 React에 말해주는 유일한 API입니다. `Ctrl`로 하이드레이션하고 `⌘`로 다시 렌더링하는데, 맥 사용자가 실제로 보는 순서가 그것입니다. 렌더 중에 `navigator`를 읽는 것은 하이드레이션 불일치입니다.

:::

## `⌘`는 단어가 아닙니다

스크린 리더는 그것을 "place of interest sign"으로 읽습니다. 아무의 키보드에도 없는 키입니다. 그래서 글리프로 그려지는 모든 키는 잘려 있는 상자 안에 자기 이름을 함께 지니고, 읽히는 것은 "Command K" — 이 단축키의 실제 이름 — 입니다.

이음쇠가 `aria-hidden`인 것도 같은 이유입니다. "Ctrl 더하기 K"는 구두점을 읽는 것입니다.

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

## 키는 진짜 `<kbd>` 엘리먼트입니다

감싸는 것은 `<span>`입니다. `<kbd>` 안에 `<kbd>`를 넣는 것도 허용되고 그것대로 옹호할 만하지만, `kbd` 래퍼는 호스트 스타일시트가 손을 뻗을 상자가 하나 더 생기는 것뿐입니다 — 의미는 어느 쪽이든 키 자신이 나릅니다.

캡은 `corner-extra-small`이고, 모양 스케일에서 `corner-full`로부터 가장 먼 곳입니다. 여기에는 누를 수 있는 것이 없습니다.

## 함께 보기

- [MPTooltip](../feedback/tooltip) — 단축키가 보통 도착하는 곳, 그것이 하는 일 옆.
- [MPList](./list) — 행의 `action`에 놓인 단축키는 곧 메뉴입니다.
