---
title: MPShortcut
order: 11
---

# MPShortcut

<p class="mp-lede">A keyboard key, or a combination of them. Two things make it more than a styled <code>&lt;kbd&gt;</code>, and both are about the label rather than the box around it.</p>

<Demo src="shortcut/hero" :minHeight="180" />

```tsx
import { MPShortcut } from 'material-plus-ui';

<MPShortcut keys="Mod+K" />
<MPShortcut keys="Mod+Shift+P" os="windows" />
<MPShortcut keys={['Ctrl', '+']} />;
```

## Props

<PropsTable name="MPShortcut" />

Every native `<span>` attribute passes through, and a `ref` reaches the root.

## `Mod` is the reason this exists

A shortcut written as `Ctrl+K` is wrong for every Mac reader and one written as `⌘K` is wrong for everybody else. `Mod` is the token that means "the modifier shortcuts are built on" — Command on a Mac, Control everywhere else — and it resolves per platform.

<Demo src="shortcut/platforms">

<<< @/.vitepress/demos/shortcut/platforms.tsx

</Demo>

`auto` asks the browser, which is right for a shortcut a reader is about to press. The three explicit values are for documentation that has to name a platform rather than the reader's own — a support page describing the Windows build, a table comparing the two.

::: tip Server rendering

The platform is read through `useSyncExternalStore`, not during render. That is the one API that tells React the server's answer and the browser's are _meant_ to differ: it hydrates with `Ctrl` and re-renders with `⌘`, which is exactly the sequence a Mac reader sees. Reading `navigator` during render would be a hydration mismatch.

:::

## `⌘` is not a word

A screen reader reads it as "place of interest sign", which is not a key anybody has on their keyboard. Every key drawn as a glyph therefore carries its name beside it in a clipped box, so what is announced is "Command K" — which is what the shortcut is called.

The joiner is `aria-hidden` for the same reason: "Ctrl plus K" is reading the punctuation.

## What each token becomes

| Token                            | mac    | windows     | linux       |
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

The aliases are deliberate rather than generous: `Cmd`, `Command` and `Meta` are three names one key already has, and a component that accepted only one of them would be a component every caller has to look up.

Arrows are drawn as arrows everywhere, not just on a Mac. An arrow is not a Mac convention — it is what is printed on the key.

Anything not in the table is printed as it was written, with the one courtesy that a single letter is capitalised: `keys="mod+k"` draws a K, because that is what is on the key.

## `separator`

Omit it for the platform's own convention: a `+` on Windows and Linux, and nothing at all on macOS, where a shortcut is written as a run of symbols — `⇧⌘P`, never `⇧+⌘+P`.

## The keys are real `<kbd>` elements

The wrapper around them is a `<span>`. Nesting `<kbd>` inside `<kbd>` is allowed and would also be defensible, but a `kbd` wrapper is a second box for a host stylesheet to reach into for no gain — the semantics are carried by the keys themselves either way.

The cap is `corner-extra-small`, deliberately as far from `corner-full` as the shape scale goes: nothing here is pressable.

## See also

- [MPTooltip](../feedback/tooltip) — where a shortcut usually ends up, next to what it does.
- [MPList](./list) — a shortcut in a row's `action` is a menu.
