---
title: Hooks
order: 2
---

# Hooks

<p class="mp-lede">The machinery the library was already running, with a name you can import. Every one of these existed inside the components first; what is new is that your own code can ask the same question and get the same answer.</p>

That is the whole of why they are exported. A page that wants one more decision than a prop covers had to write out breakpoints, platform detection or a media query again — in numbers that had to match the library's, or the layout disagreed with itself at one width and nobody could find out why.

| Hook | Answers |
| --- | --- |
| [`useMPColorScheme`](#usempcolorscheme) | The page's colour scheme, and how to change it |
| [`useMPWindowClass`](#usempwindowclass) | Which of Material's five window size classes the window is in |
| [`useMPReducedMotion`](#usempreducedmotion) | Whether the reader asked for less motion |
| [`useMPShortcut`](#usempshortcut) | Runs something when a keystroke arrives |
| [`useMPPlatform`](#usempplatform) | Which keyboard the reader is on |
| [`useMPLocale`](../design/localization.md#3-nothing-at-all) | The language in force at this point in the tree |
| [`useMPSnackbar`](../components/feedback/snackbar.md) | Raises snackbars from anywhere under the provider |

The last two live with the provider they read, the way a hook that reads a context should. The five above have no component of their own.

## `useMPColorScheme`

```tsx
const { resolved, toggle } = useMPColorScheme();

<MPIconButton
  icon={<MPIcon icon={resolved === 'dark' ? SunIcon : MoonIcon} />}
  label="Switch theme"
  onClick={toggle}
/>;
```

<Demo src="hooks/color-scheme" :minHeight="260">

<<< @/.vitepress/demos/hooks/color-scheme.tsx

</Demo>

The stylesheet has always had the switch — `prefers-color-scheme`, and `data-mp-scheme` for a page that drives it itself. What it did not have was anything to drive it _with_, so every application wrote the same three things: a piece of state, a `localStorage` round trip, and a script in the `<head>` to stop the first paint flashing.

| Returns     | Type                            | Meaning                        |
| ----------- | ------------------------------- | ------------------------------ |
| `scheme`    | `'light' \| 'dark' \| 'system'` | What was **chosen**            |
| `resolved`  | `'light' \| 'dark'`             | What is **painted**            |
| `isSystem`  | `boolean`                       | Whether the choice is `system` |
| `setScheme` | `(scheme) => void`              | Chooses one                    |
| `toggle`    | `() => void`                    | The other of the two           |

| Argument             | Type     | Default             | Meaning                        |
| -------------------- | -------- | ------------------- | ------------------------------ |
| `options.storageKey` | `string` | `'mp-color-scheme'` | Where the choice is remembered |

### Three states, not two

`'system'` is the **absence of a choice** rather than a third scheme, and keeping it is the point. A reader who has never touched the toggle should follow their operating system _as it changes_ — including at sunset, which is when a two-state hook stops tracking and a page goes light in a dark room.

Bind a settings control to `scheme` and draw with `resolved`. A two-way toggle bound to `scheme` cannot express "follow the system" at all, which is why `toggle` exists separately: from `'system'` it goes to the opposite of what is currently painted, never back to the scheme the reader is already looking at.

### One page, one answer

The choice lives in a module-level store rather than in each caller's state, so a header's toggle and a settings screen's radio group are looking at the same thing. Two components each holding `useState` would show what they last set and neither would hear about the other.

### What it writes

`data-mp-scheme` on `<html>` — and `'system'` **removes** the attribute rather than writing the word, which is how the media query gets its say back.

It deliberately does not touch `.dark`. That class is what a project's own Tailwind keys on, and a library reaching in to toggle a class it did not put there is a library editing somebody else's markup. A page that wants both is one line of its own:

```tsx
useEffect(() => {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}, [resolved]);
```

### The first paint

A hook runs **after** the browser has painted, so a reader who chose dark gets a white page for a frame. The only thing that can run earlier is a synchronous script in the `<head>`:

```tsx
import { mpColorSchemeScript } from 'material-plus-ui';

<head>
  <script dangerouslySetInnerHTML={{ __html: mpColorSchemeScript() }} />
</head>;
```

It reads the same key the hook does, writes the same attribute, and does nothing at all when the stored value is absent or `system` — leaving the media query to answer, which it does before the first paint anyway.

Pass it the **same** `storageKey` you pass the hook. Two different keys is a page that paints one scheme and then corrects itself to the other, which is the flash this exists to remove.

It returns the source rather than the tag, so a page under a Content Security Policy without `unsafe-inline` can give the tag a nonce of its own. It cannot be a `<script src>`: a fetch is exactly the delay being avoided.

### Sharp edges

- **Storage can fail and that is handled.** Reading and writing `localStorage` throws in a private window in some browsers and behind some cookie policies. Both are caught — the toggle works for the visit and the choice is simply not remembered.
- **An attribute already on the page wins over storage.** A page that ran the script, or rendered `data-mp-scheme` from a cookie on the server, is already painting a scheme; that is the true one, and reporting storage instead would disagree with the screen.
- **It sets the scheme for the whole document.** For a _region_ — a dark editor panel in a light page — put `data-mp-scheme` on that element yourself. Both directions work; see [Colour](../design/color.md#dark-mode).

## `useMPWindowClass`

```tsx
import { useMPWindowClass } from 'material-plus-ui';

const size = useMPWindowClass();

return size === 'compact' ? <MPDrawer>{nav}</MPDrawer> : <MPSidebar>{nav}</MPSidebar>;
```

<Demo src="hooks/window-class" :minHeight="140" />

The five are [`MPWindowClass`](../design/prop-conventions.md) — Material's own ladder, at 600, 840, 1200 and 1600dp. The same axis `MPGrid` reflows along and `MPResponsive` is written in terms of, so a layout switched by this hook and a grid switched by a prop change at the same width.

| Argument   | Type            | Default      | Meaning                                            |
| ---------- | --------------- | ------------ | -------------------------------------------------- |
| `onServer` | `MPWindowClass` | `'expanded'` | What to answer where there is no window to measure |

**It reads the media queries, not the width.** `innerWidth` counts a classic scrollbar and a media query does not, so a 615px window with a 15px scrollbar is `medium` to CSS and `compact` to arithmetic. A layout whose JavaScript and whose stylesheet part company at exactly one width is the hardest kind of bug to be shown, so the hook stays on the stylesheet's side of it.

It also subscribes to the four boundaries rather than to `resize`. A window dragged from 500 to 1900 wakes this four times; a `resize` listener wakes several hundred, for the same four answers.

### Where there is no window

A server has no width, so there is no true answer — and there is no way for a library to guess well. `onServer` is that guess, and it is an argument because an application usually knows better: a marketing site's first paint is mostly phones, an internal dashboard's is not.

```tsx
const size = useMPWindowClass('compact');
```

The client corrects it on hydration, and `useSyncExternalStore` underneath is what makes that correction legitimate rather than a mismatch React complains about. **But the correction is a second render**, so a component that swaps a whole navigation pattern on this does so visibly on a first load. Where that matters, prefer the answer that has no first render to be wrong — [`MPShow`](../components/layout/show), `MPGrid`'s responsive props and Tailwind's own variants are all resolved by the browser before anything paints.

### Where the boundaries come from

MD3's own, unless an [`MPConfigProvider`](./config#moving-the-window-size-classes) above it moved them. That prop is the JavaScript half of a page that has moved the stylesheet's boundaries too; moving one without the other is worse than moving neither, and the provider says why.

## `useMPReducedMotion`

```tsx
const still = useMPReducedMotion();

<video autoPlay={!still} />;
```

`prefers-reduced-motion: reduce`, which every `MPAnimate*` component already consults on its own — a fade becomes an appearance, a typewriter prints its sentence, a marquee stops. Exported so your own motion is held to the preference the library is already holding itself to, rather than the two asking separately and one of them forgetting.

`false` where there is no reader to have a preference. The alternative would be a first paint that suppressed animation for everybody and then started it a moment later for most of them, which is a flash rather than a preference.

## `useMPShortcut`

```tsx
useMPShortcut('Mod+K', () => setOpen(true));
```

<Demo src="hooks/shortcut" :minHeight="140">

<<< @/.vitepress/demos/hooks/shortcut.tsx

</Demo>

The same matcher [`MPShortcut`](../components/display/shortcut.md) draws from and [`MPCommandPalette`](../components/inputs/command-palette.md) binds through. That is not a tidiness point: the two used to answer _what platform is this_ separately, and disagreed — a page could draw `⌘K` and listen for `Ctrl+K`. Written once, they cannot.

| Argument | Type | Default | Meaning |
| --- | --- | --- | --- |
| `keys` | `string \| string[]` | — | `'Mod+K'` or `['Mod', 'K']`. The array form is for a combination containing a literal `+` |
| `handler` | `(event: KeyboardEvent) => void` | — | Run on a match |
| `options.enabled` | `boolean` | `true` | Turns the binding off without unmounting what holds it |
| `options.preventDefault` | `boolean` | `true` | Claims the keystroke from the browser |
| `options.ignoreInputs` | `boolean` | `false` | Holds off while the focus is in a field |
| `options.target` | `EventTarget \| null` | the window | What the listener is attached to |

**`Mod` is a name for a key, not a fifth modifier.** It resolves to Command on a Mac and Control everywhere else, which is what lets one string be both the binding and the label:

```tsx
<MPShortcut keys="Mod+K" />;
useMPShortcut('Mod+K', open);
```

Modifiers are matched in **both** directions. `Mod+K` does not fire when Shift is also held, because that combination may belong to something else — a shortcut that ignored extra modifiers would be quietly taking keystrokes it was never given.

**`preventDefault` is on by default** because some browsers put their own search bar on `Mod+K`, and a page that binds a combination has said the key is theirs. Switch it off for a shortcut meant to run _alongside_ the browser's.

**`ignoreInputs` is off by default** because the shortcut most pages bind has a modifier, and `Mod+K` typed into a search field still means "open the palette". Switch it on for a **bare** key — `/` to focus search, `?` for help — which would otherwise be taken out of the middle of somebody's sentence.

### Sharp edges

- **The handler is not a dependency.** It is read from a ref at the moment the key arrives, so an inline arrow is fine and does not rebind the listener every render. What does rebind is `keys`, `enabled`, `preventDefault`, `ignoreInputs` and `target`.
- **It does not stop propagation.** Two hooks bound to one combination both run. That is a collision for the page to resolve, not something a hook can guess at.
- **It listens on the window** unless you pass a `target`. A shortcut that belongs to one panel should be given that panel's element.

## `useMPPlatform`

```tsx
const os = useMPPlatform(); // 'mac' | 'windows' | 'linux'
```

The same detection `MPShortcut` prints its key caps from, for an application drawing a key cap of its own. Three sources are matched at once — `userAgentData.platform`, `navigator.platform` and the user agent string — because the question is coarse and browsers freeze or lie about each of them separately.

`'windows'` where there is no navigator, corrected on hydration.

## Next

- [Prop conventions](../design/prop-conventions.md) — the vocabulary the props are written in.
- [MPShortcut](../components/display/shortcut.md) — the other half of the shortcut story.
