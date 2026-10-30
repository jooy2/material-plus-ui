---
title: MPCodeBlock
order: 27
---

# MPCodeBlock

<p class="mp-lede">A viewer for one line of code or a thousand. Coloured, numbered, marked, copied — each off one prop, because the same component has to be a snippet inside a sentence and the full transcript at the top of a README.</p>

<Demo src="code-block/hero" :minHeight="420" />

::: fw react

```tsx
import { MPCodeBlock } from 'material-plus-ui';

<MPCodeBlock code={source} language="ts" title="src/index.ts" lineNumbers />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPCodeBlock(code: source, language: 'ts', title: const Text('src/index.ts'), lineNumbers: true);
```

:::

## Props

<PropsTable name="MPCodeBlock" />

## The colouring <Fw react="arrives separately" flutter="is the caller's" />

::: fw flutter

The Flutter package has no dependencies, and a hand-written grammar for thirty-four languages is a promise it could not keep. So the block draws everything else itself (the bar, the numbers, the prompt, the marks, the four palettes) and draws the code in the theme's ink, unless it is handed a `highlighter`: a function from the code and its language to lines of runs, each run tagged with one of the twelve slots a theme colours.

```dart
List<MPCodeLine>? highlightWithMyPackage(String code, String language) {
  // Turn whatever your highlighter returns into runs:
  return <MPCodeLine>[
    <MPCodeToken>[const MPCodeToken('const', MPCodeTokenKind.keyword), const MPCodeToken(' a = 1;')],
  ];
}

MPCodeBlock(code: source, language: 'dart', highlighter: highlightWithMyPackage);
```

Return `null` for a language the highlighter does not know, and the block draws it plain. `highlight: false` ignores the highlighter, and `rawToggle` draws the button that switches between the two. The gallery's own demo uses a few lines of patterns, which is how the preview above is coloured; any real highlighter package for Dart can be wired in the same way.

:::

::: fw react

highlight.js does it, and it is the one thing in this library reached through a dynamic import. The grammars are forty kilobytes and there are thirty-four of them, so they arrive as their own chunk — one language at a time, and only for a block that asked to be coloured.

What that means for a page:

- `highlight={false}` fetches nothing at all. A block that does not colour itself costs no more than the text in it.
- A block that colours TypeScript fetches the core and TypeScript, not the other thirty-three.
- The block draws plain on the first frame and colours itself when the chunk lands. There is never a blank space where the code should be.

`npm run measure` prints that cost separately for the same reason — the whole library is 49.7 kB lighter before a block has coloured anything.

### A language the set does not have

Thirty-four grammars is a guess at which six a documentation site uses. Anything else registers:

```ts
import { registerMPLanguage } from 'material-plus-ui';
import elixir from 'highlight.js/lib/languages/elixir';

registerMPLanguage('elixir', elixir);
```

Call it at module scope. A language registered after a block has drawn does not repaint that block — nothing here re-renders on its own — but every block mounted after it sees it.

A language nothing knows is drawn plain rather than refused.

:::

### The spelling you already have

`language` understands the common aliases and file extensions, so a value copied off a fenced code block or a filename works as it stands: `ts`, `tsx`, `yml`, `sh`, `docker`, `c++`, `psql`. The bar reports the canonical name it resolved to<Fw flutter=", and that name is what a `highlighter` is handed" />.

## It is drawn as lines, always

Even with no numbers and no prompt. A line is what carries a number, a prompt and a place in the scroll, and a component that switched between two renderings would have two sets of wrapping behaviour to keep in step.

Two things follow from that.

**The numbers and the prompt are generated content.** They cannot be selected, <Fw react="cannot be found by find-in-page, " />and are not what the copy button puts on the clipboard. A transcript stays a transcript and still pastes into a shell:

::: fw react

```tsx
<MPCodeBlock code={commands} language="bash" prompt="$" />
```

:::

::: fw flutter

```dart
MPCodeBlock(code: commands, language: 'bash', prompt: r'$');
```

:::

**A marked line is a row rather than a stripe.** The horizontal padding is on the line, so the tint reaches both edges of the block whether the code is narrower than the box or scrolled sideways inside it.

::: fw react

```tsx
<MPCodeBlock code={source} markLines="1,4-9,12" />
```

:::

::: fw flutter

```dart
MPCodeBlock(code: source, markLines: '1,4-9,12');
```

:::

`markLines` takes <Fw react="a number, a string of lines and ranges, or an array of either" flutter="a string of lines and ranges, which covers one line, a range and a list of both" />. A range written backwards is still that range, and anything unparseable is dropped rather than thrown — a marked line is an annotation, and a typo in one should cost the annotation, not the code. Marks are counted the way the gutter counts, so with a `startLine` of 286 a mark on 288 marks the line labelled 288.

## The block does not take the page's accent

It has a palette of its own, and that is a decision rather than an oversight. Code is read against a ground chosen for code, and the twelve hues it needs to keep a keyword apart from a string apart from a number are not the four accent families MD3 has. A block dyed with `primary` would be a block whose colours carry no information.

| `theme` |  |
| --- | --- |
| `auto` | The page's own scheme, light on a light page and dark on a dark one. The default, because that is what every other surface here does. |
| `dark` | Pinned dark, whatever the page is doing. What a documentation site usually wants. |
| `light` | Pinned light. |
| `mono` | No hue at all: structure carried by weight and by how far a run is muted. What a block printed on paper, or read by somebody who cannot separate the hues, is left with. |

### Bringing your own

::: fw flutter

`customTheme` takes an `MPCodeTheme`: fourteen colours, the ground, the ink and the twelve slots. The other five — `dim`, `rule`, `hover`, `mark` and `markEdge` — are mixed from the ground and the ink, so they follow whatever you wrote without being restated.

```dart
MPCodeBlock(
  code: source,
  customTheme: const MPCodeTheme(
    background: Color(0xFF1B1B1F),
    foreground: Color(0xFFE6E6E9),
    keyword: Color(0xFFC792EA),
    string: Color(0xFFC3E88D),
    // …and comment, number, function, type, variable, tag, attribute, meta, addition, deletion
  ),
);
```

No third-party palettes ship here. One Dark, Dracula, Nord and the rest are other projects' published work under their own licences, and porting them into this package would be shipping somebody else's design under this one's name.

:::

::: fw react

`theme` takes any string. A theme here is a set of `--mp-code-*` custom properties under a `[data-mp-code-theme]` selector and nothing else:

```css
[data-mp-code-theme='ours'] {
  --mp-code-bg: #1b1b1f;
  --mp-code-fg: #e6e6e9;
  --mp-code-keyword: #c792ea;
  --mp-code-string: #c3e88d;
  /* …and comment, number, function, type, variable, tag, attr, meta, add, del */
}
```

Twelve declarations. The other five slots — `dim`, `rule`, `hover`, `mark` and `mark-edge` — are mixed from the ground and the ink you gave, so they follow whatever you wrote without being restated.

No third-party palettes ship here. One Dark, Dracula, Nord and the rest are other projects' published work under their own licences, and porting them into this package would be shipping somebody else's design under this one's name. The block above is how to bring the one you read in all day.

:::

## The bar

`toolbar` is the master switch: with it off there is no bar, and none of `showLanguage`, `copyable` or `rawToggle` draws anything whatever they say. That is the snippet-inside-a-sentence case.

The buttons on it are plain <Fw react="elements" flutter="widgets" /> rather than `MPIconButton`s, and that is not a shortcut. A control in this library reads the page's colour roles; the bar sits on a sheet that has deliberately refused them, so an icon button here would be a light control on a black bar. What they keep is the house treatment: the corner ladder, the duration token, the focus ring.

::: fw react

`copyable` works without a secure context. The async Clipboard API needs one, and a component library is used on `http://192.168.1.4:3000` more often than anyone admits, so there is a fallback — and the button says which of the three things happened.

:::

::: fw flutter

`copyable` puts the code on the system clipboard, and the button says whether it worked; a screen reader hears the same word, because a button that changes its own label is not announced otherwise.

:::

## Selecting inside it

::: fw react

The code is a focusable region, so a reader who tabbed to it and pressed the select-all shortcut every editor has meant _this_ code. They get it, rather than the article around it. The numbers and the prompts fall outside the selection for the same reason they fall outside the clipboard: there is nothing there to select.

:::

::: fw flutter

The code is selectable, and select-all inside it selects the code rather than the screen around it. The numbers and the prompts fall outside the selection for the same reason they fall outside the clipboard. A selection draws its handles in an `Overlay`, so a block with no overlay above it (a bare widget tree outside any `WidgetsApp`) is drawn but not selectable. While the code has anywhere to scroll, the block is a focus stop the arrow keys, Page Up, Page Down, Home and End scroll.

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| highlight.js, loaded on demand | `highlighter` | The package has no dependencies; the colouring comes from the highlighter you hand it. |
| `registerMPLanguage` | — | Your highlighter knows its own languages. |
| `theme` as any string | `theme` enum and `customTheme` | There is no stylesheet to define a theme in, so a palette of your own is passed as colours. |
| `markLines` as a number or an array | `markLines` as a string | Dart has no union type; `'4'`, `'4-9'` and `'1,4-9,12'` say the same things. |
| `maxHeight`, `fontSize` as CSS lengths | logical pixels | There is no CSS length to parse. |
| colouring deferred until near the screen | coloured when built | A highlighter you hand in runs synchronously, once per text and language. |
| `className`, `style` | — | There is no class list or style attribute to pass through. |

:::
