---
title: MPCodeBlock
order: 27
---

# MPCodeBlock

<p class="mp-lede">A viewer for one line of code or a thousand. Coloured, numbered, marked, copied — each off one prop, because the same component has to be a snippet inside a sentence and the full transcript at the top of a README.</p>

<Demo src="code-block/hero" :minHeight="420" />

```tsx
import { MPCodeBlock } from 'material-plus-ui';

<MPCodeBlock code={source} language="ts" title="src/index.ts" lineNumbers />;
```

## Props

<PropsTable name="MPCodeBlock" />

## The colouring arrives separately

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

### The spelling you already have

`language` understands the common aliases and file extensions, so a value copied off a fenced code block or a filename works as it stands: `ts`, `tsx`, `yml`, `sh`, `docker`, `c++`, `psql`. The bar reports the canonical name it resolved to.

## It is drawn as lines, always

Even with no numbers and no prompt. A line is what carries a number, a prompt and a place in the scroll, and a component that switched between two renderings would have two sets of wrapping behaviour to keep in step.

Two things follow from that.

**The numbers and the prompt are generated content.** They cannot be selected, cannot be found by find-in-page, and are not what the copy button puts on the clipboard. A transcript stays a transcript and still pastes into a shell:

```tsx
<MPCodeBlock code={commands} language="bash" prompt="$" />
```

**A marked line is a row rather than a stripe.** The horizontal padding is on the line, so the tint reaches both edges of the block whether the code is narrower than the box or scrolled sideways inside it.

```tsx
<MPCodeBlock code={source} markLines="1,4-9,12" />
```

`markLines` takes a number, a string of lines and ranges, or an array of either. A range written backwards is still that range, and anything unparseable is dropped rather than thrown — a marked line is an annotation, and a typo in one should cost the annotation, not the code. Marks are counted the way the gutter counts, so with `startLine={286}` a `markLines={288}` marks the line labelled 288.

## The block does not take the page's accent

It has a palette of its own, and that is a decision rather than an oversight. Code is read against a ground chosen for code, and the twelve hues it needs to keep a keyword apart from a string apart from a number are not the four accent families MD3 has. A block dyed with `primary` would be a block whose colours carry no information.

| `theme` |  |
| --- | --- |
| `auto` | The page's own scheme, light on a light page and dark on a dark one. The default, because that is what every other surface here does. |
| `dark` | Pinned dark, whatever the page is doing. What a documentation site usually wants. |
| `light` | Pinned light. |
| `mono` | No hue at all: structure carried by weight and by how far a run is muted. What a block printed on paper, or read by somebody who cannot separate the hues, is left with. |

### Bringing your own

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

## The bar

`toolbar` is the master switch: with it off there is no bar, and none of `showLanguage`, `copyable` or `rawToggle` draws anything whatever they say. That is the snippet-inside-a-sentence case.

The buttons on it are plain elements rather than `MPIconButton`s, and that is not a shortcut. A control in this library reads the page's colour roles; the bar sits on a sheet that has deliberately refused them, so an icon button here would be a light control on a black bar. What they keep is the house treatment: the corner ladder, the duration token, the focus ring.

`copyable` works without a secure context. The async Clipboard API needs one, and a component library is used on `http://192.168.1.4:3000` more often than anyone admits, so there is a fallback — and the button says which of the three things happened.

## Selecting inside it

The code is a focusable region, so a reader who tabbed to it and pressed the select-all shortcut every editor has meant _this_ code. They get it, rather than the article around it. The numbers and the prompts fall outside the selection for the same reason they fall outside the clipboard: there is nothing there to select.
