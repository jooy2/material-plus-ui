# Changelog

## vNext (2026--)

A second report from the application that filed the first one, a day after upgrading to 1.6.0.

### Added

- **`data-mp-overflow` on `.mp-tabs__list`**, saying which end of a scrolled tab bar has more bar past it — `left`, `right` or `both`, and absent when everything fits. It is what the new fade at the bar's ends is drawn from, and a page that wants a different treatment reads the same fact. Physical rather than logical: it names a side of the box, on the rule the indicator's `--active-tab-left` already follows.

- **`MPAnimateSplit`**, a line arriving a word or a character at a time. `MPAnimateAppear` for a string: the same settling and the same stagger, over the pieces of a sentence rather than over children a caller wrote out.

  What it adds beyond splitting is the part that is easy to get wrong and invisible when you do. The pieces are cut with `Intl.Segmenter`, so a Japanese or Thai sentence is cut into words rather than handed back whole, and `👩‍👩‍👧` is one character rather than seven. The whole line goes to a screen reader once out of a clipped box, because a line split into characters is otherwise announced as a **list of letters**. And each word is its own inline-block with the characters inside it — a piece has to be `inline-block` to move at all, which also makes it a break opportunity, so loose characters would let a line wrap mid-word.

- **`MPAnimateFloat`**, an endless slow drift, and **`MPAnimateShake`**, the answer to something that did not work. Neither is an arrival, and that is what they have in common: a drift has no destination and a refusal is a reply rather than a state.

  So neither joins `MPAnimation`. That union is backed by three lookup tables, and an object literal is not tree-shaken key by key — every component reading one pays for the rows it will never use, and a fade has no business carrying a row for a refusal. `useAnimateElement` takes an `effectClass` now, so an effect can bring its own `@keyframes` and borrow everything else: the trigger, the rewind, the slots, the stagger.

  `MPAnimateFloat` is decoration and says so: **never on a control**, because a pointer arriving where a button used to be is the exact failure the library's rule against transforming controls exists to prevent. One per page — a second halves the effect and a sixth cancels it.

  `MPAnimateShake` is the library's **only** exception to that rule, and the argument is that the rule is about a control's resting states, where movement stands in for something colour says better. A shake is not a state; it is a reply to what the reader just did, and it is over in four hundred milliseconds. It defaults to `trigger="manual"` — the one default in the set that is not `mount` — takes no `repeat`, and its keyframe is home at both ends so an interrupted shake leaves nothing displaced.

- **`MPAnimateReveal`**, an entrance that uncovers content where it already is. The only one in the set where nothing moves and no colour changes: the element is at its final position and its final ink from the first frame, and what changes is how much of it has been disclosed.

  That is what anything whose _position_ is part of its meaning needs — a page title, a rule under a heading, a chart's plot area, a table's first row. A title that slid up from below was, for a moment, in the wrong place; a plot area that grew from 80% was, for a moment, showing the wrong values. `MPAnimateFade` is the other effect that leaves position alone, and the two differ in what they spend: a fade spends the colour, a reveal spends the extent.

  `clip-path: inset()` rather than a mask or an `overflow` wrapper. A mask needs a gradient per direction and a second one to undo itself; a wrapper puts an element into the layout that was not there before, which inside a grid or a flex row changes what the content is a child of — the very thing the effect exists to leave alone. `inset(0)` is already the spelling of "nothing is clipped", so the resting appearance is the element's own.

  `fade` is **off** by default, which is the one setting worth arguing about: a wipe that is also translucent reads as neither of the two things. It takes `stagger` and `timeline` like the rest of the six.

- **`timeline="view"` and `range` on the same seven, and on `MPAnimateAppear`.** The animation is handed to the reader's scrolling instead of to a stopwatch: its progress is the element's progress through the scrollport, so scrolling back runs it backwards and stopping halfway leaves it halfway.

  Two declarations of CSS, and every keyframe in the set gained the mode. There is no scroll-driven component and no second set of frames, because a fade tied to a scroll position is not a different effect from a fade — it is the same one on a different clock.

  Three of the props above stop meaning anything on `view`: `duration`, `delay` and `repeat` are the stopwatch's units. So does `trigger`, and the animation is **held running** for it — a paused scroll-driven animation shows nothing at all, which is what `trigger="manual"` with nothing pressing go would otherwise leave on the page. An explicit `paused` is still honoured. `range` is what replaces them, and its default of `entry 0% cover 45%` has the element finished arriving by the time it is somewhere a reader would be looking; a range running to the far edge is how most scroll-driven pages go wrong.

  A browser without `view()` falls back to the clock and plays the effect once, exactly as before. The pair is behind an `@supports` for a sharper reason than the browsers that have none of it: `animation-timeline` and `animation-range` are two properties, and taking the first without the second would give an animation a timeline and nothing to run it over.

- **`stagger`, `durationStep` and `reverse` on the single-keyframe effects** — `MPAnimateFade`, `MPAnimateGrow`, `MPAnimateZoom`, `MPAnimateSlide`, `MPAnimateRotate`, `MPAnimateBlink` and the new `MPAnimateReveal`. With a `stagger` the effect runs on each child rather than on the box, held back by its position, so what arrives is the set in the order it should be read.

  Three props rather than an `MPAnimateStagger` component, deliberately: a list settling in is not a different effect from a fade, it is the same fade told when to start, and a wrapper would be a second spelling of something these six already did.

  The box animates **nothing** while a `stagger` is set. Eight children fading in under a box that is also fading in is the same content faded twice, and what a reader sees is one opacity multiplied by the other. The play state is the one slot the box keeps, and it reaches the children by inheritance — `paused` still holds the whole set.

  `MPAnimateAppear` was where the per-child code was written, and it is now where the other six get it from rather than a seventh copy. Its own behaviour is unchanged, including that a `stagger` of `0` there still means a set arriving together: it has no box animation to fall back to.

  They are not on `MPAnimateMarquee`, `MPAnimateHeadline`, `MPAnimateTyping` or `MPAnimateLighting`. The first three read what their children _are_ — duplicating them, swapping between them, counting their characters — and cannot hand an arbitrary child an animation; the fourth puts its movement on a pseudo-element a child has no equivalent of.

- **`mp-radio__fill`** on the dot inside the ring, which had no name of its own.

### Changed

- **`internal/text.ts` is now the one answer to where a character ends.** `MPAnimateTyping` had a grapheme splitter of its own, and the effects joining it in this release — `MPAnimateSplit` and `MPAnimateScramble` — would each have needed one. Three copies would be three opinions about what a character _is_, and they would only disagree on the text nobody tests with.

  It also answers where a **word** ends, which is the harder half: a word boundary is not a space anywhere east of Myanmar, so `split(' ')` hands back a Japanese or Thai sentence as a single fragment and any effect built on it silently does nothing — in exactly the languages where nobody testing it would notice.

- **A tab bar that scrolls now says so.** It always scrolled — `overflow-x: auto`, MD3's scrollable tabs — and there was no way to know. Measured at 320px a six-tab bar reports a `scrollWidth` of 526 against a `clientWidth` of 320, and macOS draws an overlay scrollbar that does not exist until it is used: a bar with four tabs off the edge and a bar with none were the same picture. Windows drew a real one, which is a signal and also fifteen pixels of furniture under the tabs, on one platform out of two.

  The scrollbar is hidden on both now — the pair `MPCarousel`'s strip already took — and the bar fades at the end that has more bar past it, at both when a reader is in the middle, and at neither when everything fits. Fading an end already reached would be the same lie as saying nothing.

  There is still no `overflow="wrap"`, for the reason there is no `orientation`: a tab bar on two lines has stopped being a bar, and the indicator has nowhere sensible to sit.

  The divider is left whole. It is the boundary between the bar and the panel rather than part of the run, so the fade is sized to everything above it and a second, opaque mask layer covers the hairline itself.

### Documentation

- **The size table had drifted, and the row that said how many components there are was two releases out of date.** It read "All hundred and eleven" against a library that exports a hundred and sixty-seven names, and the figures beside it were the 1.5.0 build's. The claim under the table — that the numbers are printed by the build rather than remembered — was the thing that had stopped being true.

  The row is "Every export there is" now, which is the scenario `measure-bundle.mjs` actually runs and a label that cannot go stale as components are added. The figures are this build's, and the stylesheet column is computed the way a bundler would compute it: the sheets concatenated and compressed together, rather than their individual gzip sizes added up, which over-counts the utilities they repeat.

- **The class hooks, and why one of them silently does nothing in Tailwind.** `mp-list-item__label`, `mp-accordion__title` and the sixty-five others are named in BEM, and **Tailwind reads `_` inside square brackets as a space** — so `[&_.mp-accordion__title]:text-lg` compiles to `.mp-accordion title`, a `<title>` element inside an accordion, and matches nothing. No warning, no rule, no clue.

  The names are not changing: the `__` convention runs through all sixty-seven hooks, and renaming the six that were noticed would leave a library with two conventions and the same trap in the other sixty-one. `getting-started` documents both ways round it instead — `\_\_` in an arbitrary variant, or the plain name in a stylesheet, where a rule that holds for every accordion on a site arguably belonged.

- **"Nothing chosen" is `null`, on `MPSelect` and `MPCombobox`.** A `value` with no matching entry in `items` is drawn as itself, so a form holding `0` for "not picked yet" sits there reading `0` in the field a reader is being asked to fill in. That was in the types and nowhere else, and MUI's `Select` draws a blank in the same situation — which is exactly the sort of difference that survives a migration unnoticed.

  The behaviour is right and is unchanged: a field that stayed blank over a value it is holding, and will submit, is worse — and on `MPCombobox` a value the list does not have is what `allowCustom` is for. It is the sentinel that was undocumented.

### Fixed

- **`MPSpoiler` moved the page twice on the way to being read, and could cut off the button that reads it.** Two separate defects, and both are the same mistake in different clothes: something drawn in one state and not in the other, without the state that lacks it paying for the space.

  A `reversible` sheet mounted its way back out when it opened, so pressing _Reveal_ grew the sheet by a button and a track of padding — 48px — under the reader's own pointer, and pressing _Hide_ shrank it again. The row is drawn from the start now and merely `invisible` and `inert` while the sheet is covered, which is the same pair the covered content itself gets. The cover is over it, so there is no hole to look at.

  And the cover was `position: absolute`, which contributes nothing to a container's height. A sheet covering one short line with two lines of notice and a button was **shorter than its own cover** — 50px of box holding 74.5px of cover — and the sheet clips, so the button was cut off at the bottom edge. The cover is a grid item spanning every row now, and the sheet takes whichever of the two is taller.

  The rule, for anything else in the library with an overlay in it: if the overlay can outgrow what it overlays it is an item and not an `absolute`, and a control that exists in only one state reserves its place in the other.

- **`MPAvatarGroup` stacked back to front, which is the opposite of what its own page says.** "The first avatar is on top" has been a heading in the documentation since the component shipped, with the argument for it: a stack read from the start is read front to back, so the person the group is _about_ comes first rather than last. Nothing in the code said so. The overlap is a negative margin and nothing else, and later siblings paint over earlier ones — so the run was drawn last-on-top, and every face had its **leading** edge covered instead of its trailing one.

  Every avatar carries a `z-index` now, counting down from the front, with the count as the last card in the pile rather than a label floating on top of it. Explicit rather than left to the document for a second reason as well: the implicit order held only until anything in the stack — a link, a tooltip's trigger, a badge — acquired a `z-index` of its own.

  The depth arrives through the same context `size` and `shape` already do, so nothing is written onto the children a caller passed. `MPAvatar` reads it and a caller's own `style.zIndex` still wins; a child that is not one keeps the order the document gives it.

- **The build never emptied `dist/`, so a deleted module went on being published.** `tsc` only writes. It has no notion of an output file that should no longer exist, and `package.json` ships `dist/` whole — which means a component taken out of `src/` keeps resolving through `material-plus-ui/components/<name>` for every release after the one that removed it, from a file no source has produced since.

  Nothing in the working tree says so, either. The removal is in the diff, the barrel no longer names it, and the only place the truth is written down is a directory that is in `.gitignore`. Every measurement taken off the build inherits it: the `@__PURE__` count is a count of what is in `dist/`, and the bundle figures walk a module graph rooted there.

  `npm run build` now empties the directory before anything writes into it. Its own step at the front rather than a flag on `tsc`, because half of what lands there is not `tsc`'s — the two stylesheets, the ninety-five split sheets, the `"use client"` banners — and what has to be emptied is the directory rather than one compiler's share of it.

- **Eleven modules shipped without `"use client"`, and one of them took a whole site down.** A server component rendering `MPContainer` died with `Attempted to call useMPSize() from the server` — and a page layout that uses `MPContainer` makes that every page of an App Router application. `MPAspectRatio` and `MPAnimateLighting` were the same, and `MPBox`, `MPTypography` and the six `MPAnimate*` components were unmarked beside them, reaching `React.useRef` through Base UI's `useRender` instead.

  It arrived in 1.6.0 and the cause is worth writing down, because it is a judgement rather than a typo. The build marks a module by looking for markup, on the rule that **a module that renders is a client module** — and a component drawn with `useRender` writes no element down at all, so the regular expression never saw one. Those eleven had nothing to fail on until `useMPSize()` and `useMPColor()` gave them a context to read, and then all of them did at once.

  The judgement is made on the imports now: **a module that imports a hook is a module that runs where hooks run**, whatever it looks like from the outside. That also caught `useMPColorScheme`, `useMPReducedMotion` and `useMPWindowClass`, which compose client-only hooks out of `internal/` and were unmarked for a related reason. React's own hooks are still read from React's two builds rather than from the name, because that split is finer than a naming convention — `useCallback`, `useMemo` and `useId` are on the server build too, and a module using only those is not client for it.

  And because a judgement that missed once can miss again, the build now puts the question to `dist/` as well: a shipped module that imports a hook and does not say `"use client"` stops the build, before it can stop somebody else's. A re-export is deliberately not an import — `export … from` is exactly where a boundary belongs, and the barrels are built on it.

- **A chosen `MPRadio` sat half a pixel down and to the right at `sm` and `lg`.** Reported twice by one application's readers, and reproducible on any 1× screen.

  The dot was exactly half the ring at every rung, which is MD3's own proportion. But the ring has a 2dp border and the dot is centred in what is left inside it, so the gap on one side is `(ring − 4 − ring / 2) / 2` — a whole number of pixels only while the ring is a multiple of four. `sm` and `lg` are 18 and 22, the two rungs this library interpolates between MD3's own, and they came to 2.5px and 3.5px. The geometric centre was exact; the browser then rounded it outwards.

  Their fills are 10dp and 12dp now — the next even number, 1dp over half, and on the grid. `xs`, `md` and `xl` are unchanged and still exactly half. `MPCheckbox` needed nothing: its mark is drawn rather than boxed.

- **`MPGridItem` quietly ate a caller's left margin.** `.mp-grid-item` declared `margin-inline-start` for every item in every grid, resolving to `0px` for the ones that had never asked for an offset — and a declaration of nought is still a declaration. These rules are unlayered and a Tailwind utility is inside `@layer utilities`, so unlayered wins whatever the source order is: `<MPGridItem className="m-6">` came out with three sides of its margin and not the fourth, which is about the hardest thing there is to look at and see. The application that reported it found out when a thumbnail sat against the wall of the panel it was padded away from.

  `MPGridItem` writes a `data-mp-offset` attribute when an `offset` was passed, and the rule is `.mp-grid-item[data-mp-offset]` now. The arithmetic is untouched and so is every item that did ask. An explicit `offset={0}` counts as asking — naming the property is asking for it, and nought is what the declaration resolved to anyway.

## 1.6.0 (2026-08-31)

One shape, found twice.

It started as two additions of a kind — a control that had the answer to a question nobody could put to it — then a report from an application that moved off Material UI, which turned out to be the same hole in twenty more places. The calendar could already draw a grid of months and a grid of years, and there was no way to say "stop there and hand me that". Eight controls were producing keystrokes and focus changes every second they were used, and no prop took delivery of one. A row could be a link but not a router's link; a chip could be pressed but could not be a menu's trigger; a grid item could be six columns wide but not "the rest of the row".

Then the library was audited against MUI, Ant Design, Chakra, Mantine, Radix and PrimeReact — and the finding was the same sentence again, now about **the library talking to itself**. A complete calendar lived in `internal/`. So did a window-class store, a reduced-motion store, a shortcut matcher and the rule for screen-reader-only text. Nine components drew themselves with that last one and no application could reach it. Almost everything in `Added` below is a name being given to something that was already running.

The one genuinely new thing is `MPConfigProvider`, and it is the item that was costing the most — not because it was hard, but because it was costing at **every call site**: a design that runs at `size="sm"` had to say so on several hundred controls, each of them a place it could be forgotten.

Ten defects were found on the way, and finding them is the argument for auditing by _running_ rather than by reading. Four change what an existing page draws and are in `Changed` rather than `Fixed`, because that is the section people read before upgrading:

- `MPTextField` swallowed Enter on every single-line field, so a `<form>` it was dropped into stopped submitting.
- `MPTypography` painted `on-surface` when its own documentation said it inherits.
- A pressable `MPChip` was a `<span>` holding a `<button>`, so it could not be a Base UI trigger.
- An `MPAccordion` panel went on clipping its contents after it had finished opening.

The six in `Fixed` include three that had been shipping in plain sight. **A picker's chosen day was never painted at all** — two independent causes, either one enough on its own. **Base UI was never told which way the page runs**, so a slider's handle sat exactly one handle-width from the value it reported under RTL, at every value. And **forcing a region back to light did nothing**, which the documentation had been promising since the scheme switches were written. Not one of the three was visible in a class name; each took measuring a computed style.

Nothing was renamed and nothing was removed. Every existing prop still means what it meant in 1.5.0.

### Added

- **`MPConfigProvider` — `size`, `color` and `locale` for a whole application.** The gap that was costing the most, because it was costing at every call site: a design that runs at `size="sm"` had to say so on each of several hundred controls, and each of those was a place it could be forgotten.

  ```tsx
  <MPConfigProvider size="sm" color="tertiary" locale="ko">
    <App />
  </MPConfigProvider>
  ```

  The resolution order is **call site → group → provider → Material's own**, so an `MPButtonGroup` still beats the page and a prop still beats everything. Ninety-eight resolution sites across sixty-five components changed from a destructuring default to that chain.

  Two axes and not three. `variant` is deliberately absent: `MPButton` starts `filled`, `MPChip` `outlined`, `MPAlert` `tonal`, `MPAccordion` `outlined` — five answers to five questions about emphasis, and one global value would overwrite all of them with an arbitrary one. `size` and `color` are the only axes where every component starts from the same answer, which is what makes a single default meaningful for them.

  The same rule decides which components read it: **the provider supplies the library's default, not a component's answer.** `MPBadge` keeps `error`, `MPTooltip` keeps `sm`, and `MPDialog`, `MPPill` and `MPShortcut` keep `secondary` — those are decisions rather than unfilled defaults. A prop with no default at all, like `MPSkeleton`'s `color`, is left unset too.

  It also carries `dir`, which is the RTL wiring — see `Fixed` for what was not connected. And it carries `locale` so an application needs one provider rather than two. `MPLocaleProvider` is unchanged and still the narrow one; nesting merges per field, so an inner provider naming only a colour keeps the size from above.

  A note on the implementation, because the first version of it was wrong in a way worth recording: the resolver reads the context **unconditionally**. Written as `prop ?? React.useContext(…)` the context is only read when the prop is absent, so a control handed a `size` on one render and not on the next calls a different number of hooks. React said so out loud in the test run, and the fix was to read first and decide second.

- **`MPPopconfirm`** — the same question `useMPConfirm` asks, kept where the control is.

  The difference between the two is **where the reader's eye is**, and it is a real one. A row of twelve delete buttons is the case for this shape: a modal that covered the table would take away the row the reader was pointing at, and having to re-find it afterwards is how the wrong row gets deleted. A confirmation about the _page_ — leaving with unsaved changes — still wants the modal, because it is not about a thing on the page at all.

  It answers with a callback rather than a promise, which follows from the same difference: this one is written where the button is, so there is already a handler there to put it in. Escape, a press outside and the cancel button are all `onCancel`, on the rule the modal already follows — the safe answer to "are you sure" is no. Opening is not an answer and fires neither handler.

  It is a popover and not a dialog, so it does not trap the focus and a reader can Tab away from the question. That is the trade the shape makes, and it is why the modal is still the one for an answer that has to be given. The labels come from the `confirm` namespace added above, so both components say the same words in the same eighteen languages.

- **`MPImage`** — a picture that says what it is doing.

  A bare `<img>` has three states and shows two of them badly: while it is on its way there is a hole the size of nothing and the page jumps when it lands, and when it fails there is the browser's own broken-image mark, which is different in every browser and belongs to none of them. This draws a placeholder for the first and a `fallback` for the second, and `ratio` reserves the room so that neither one moves the page.

  **The cached case is the one that breaks**, and it is the reason this is a component rather than three lines of `useState` at a call site: an image already in the cache is `complete` _before React attaches anything_, so its `load` event has been and gone. A component that only listened would hold its placeholder over a picture that is fully drawn — on every second page view, which is the view nobody tests because the first one works. `naturalWidth` is what tells the two kinds of `complete` apart.

  `alt` is **required**, for the reason `MPIconButton`'s `label` is: a picture with no text alternative is the most common accessibility defect a library can actually help with, and the help is refusing to compile. `alt=""` is how to say _decoration_.

  `preview` makes the box a button and opens the picture over a scrim — off by default, because one that silently became pressable would be a control nobody declared, and refused outright on a picture that failed. `previewSrc` is what makes a thumbnail worth being one.

  Not a gallery and not a `next/image`: a lightbox that walked between pictures would be a component holding a collection, and `srcset` generation belongs to whatever is serving the file. One new glyph, `broken-image`.

- **`MPStepper` and `MPStep`** — the sequence a reader is _working through_, as opposed to the one `MPTimeline` shows them having finished.

  The two draw the same picture, and now from the same table: the bullet, the connector and the ladder they sit on moved to `internal/step.ts`, because a picture kept by two tables is a picture that drifts the first time one of them is edited alone. What makes them two components is that one is read and the other is pressed — and that a stepper mounts **one panel**, which is the half that matters for a form, since keeping the others would mean hidden fields that still submit.

  `linear` is on by default and going **back** is always allowed. What it refuses is jumping forward past the step the reader has actually got to — the _furthest_ step rather than the current one, so a reader who reached step three and looked back at step one can still return to three. A stepper that only knew `active` would have taken that away from them.

  Three decisions worth naming:

  - **No Next and Back.** What _next_ means is whether the current step validates, and a library that drew those buttons would have to guess that or ask for a validator per step. `onActiveChange` and two `MPButton`s is four lines the caller can read.
  - **`error` is a colour, not a fourth state.** Where a step sits in the run and what happened to it are two questions, and a sequence with a hole in it is one the reader cannot count — so a failed step keeps its place and swaps its accent family.
  - **`optional` takes a node rather than a boolean.** A boolean would mean shipping the word _Optional_ and then translating it into eighteen languages for a label only some applications draw.

  A stepper with no `onActiveChange` is unpressable — a progress indicator for a sequence the application's own buttons drive.

- **`MPConfirmProvider` and `useMPConfirm`** — "are you sure?" as a promise.

  ```tsx
  const sure = await confirm({
    title: 'Delete this project?',
    confirmLabel: 'Delete',
    color: 'error'
  });
  ```

  The dialog was never the hard part. A confirmation needs a piece of open state, a second piece for _what_ is being confirmed, two handlers, and an `MPDialog` kept mounted somewhere it does not belong — per call site. What a caller has at that moment is a click handler, and what they want back is a boolean. It is the trade `useMPSnackbar` already makes, run the other way: a snackbar is something to say, this is something to ask.

  **Every answer that is not the confirm button is `false`** — cancel, Escape, a press outside — and the promise never rejects, so a call site writes one `if` rather than a `try` and a default. `alert()` is the one-button form and resolves `void`: an acknowledgement has nothing to refuse, and a boolean nobody can vary is a value a caller would have to learn to ignore.

  One at a time rather than a queue. A second `confirm()` raised while one is open replaces it and answers the first `false`, because a queue would ask about something the reader has already moved past and the answer to a stale question is not information.

  `color` is not defaulted to `error`, deliberately: most confirmations are not destructive and a red button on every one of them stops being a warning. A new `confirm` namespace carries _Confirm_, _Cancel_ and _OK_ in all eighteen languages — a namespace of its own rather than three more entries in `common`, which is the glyph labels rather than the words on buttons.

  Calling the hook with no provider **throws**. A promise that never settles is the hardest possible way to be told a provider is missing.

- **`useMPColorScheme` and `mpColorSchemeScript`.** The stylesheet has always had the switch — `prefers-color-scheme`, and `data-mp-scheme` for a page that drives it itself — and nothing to drive it _with_. So every application wrote the same three things: a piece of state, a `localStorage` round trip, and a script in the `<head>` to stop the first paint flashing.

  ```tsx
  const { resolved, toggle } = useMPColorScheme();
  ```

  **Three states rather than two**, and the third is the point. `'system'` is the absence of a choice, not a scheme — a reader who has never touched the toggle follows their operating system _as it changes_, which is what a two-state hook stops doing at sunset. `scheme` is what was chosen and `resolved` is what is painted; bind a settings control to the first and draw with the second. `toggle` exists separately because a two-way control cannot express "follow the system", and from `'system'` it goes to the opposite of what is on the screen rather than back to the scheme the reader is already looking at.

  The choice lives in a module-level store, so a header's toggle and a settings screen's radio group are looking at the same thing rather than each holding a `useState` and neither hearing the other. `'system'` **removes** the attribute rather than writing the word, which is how the media query gets its say back. `.dark` is deliberately untouched: it is what a project's own Tailwind keys on, and moving a class this library did not put there is editing somebody else's markup.

  `mpColorSchemeScript()` returns the source for the `<head>`, because a hook runs after the browser has already painted and nothing else can run earlier. It reads the same key, writes the same attribute, does nothing when there is no stored choice, and JSON-encodes the key so one containing a quote cannot end the script early. It returns the source rather than the tag so a page under a strict CSP can add a nonce.

  Storage failing is handled rather than assumed away — it throws in a private window in some browsers and behind some cookie policies. The `typeof localStorage` guard is _inside_ the `try` for a reason worth recording: where a policy blocks storage the global is a throwing getter rather than a missing binding, so `typeof` evaluates it like anything else and a guard outside the `try` threw before the `try` could catch it. A test blocking storage is what found that.

- **`MPVisuallyHidden`.** Text for a screen reader and nobody else, which nine components here were already drawing themselves with — `MPPagination`'s live region, `MPRating`'s radios, `MPShortcut`'s key names, `MPCarousel`'s slide announcement — and which an application putting a bare glyph in a button of its own had no way to reach. The library had the rule and not the name.

  The rule is Tailwind's `sr-only` written out, and it is written out for the reason the stylesheet ships no Preflight: `sr-only` is _generated_, so a project with a Tailwind `prefix` configured generates it under another name and a component that hardcoded it would come out visible on their page. The arbitrary properties survive any prefix.

  `render` takes it to another element — a hidden `<h2>` naming a landmark is the usual reason. Everything else is passed through, `aria-live` included, which is how the components above use it.

- **Four hooks, all of which the library was already running.** `useMPWindowClass`, `useMPReducedMotion`, `useMPShortcut` and `useMPPlatform`, from `material-plus-ui` or from `material-plus-ui/hooks`.

  None of them is new code so much as a name. The window size classes decide how `MPGrid` reflows and where `MPSidebar` collapses; `prefers-reduced-motion` is consulted by all eleven `MPAnimate*` components; the shortcut matcher is what `MPShortcut` draws from and `MPCommandPalette` binds through. A consumer could name any of it in a prop and could not **ask** about any of it — so a page wanting one more decision than a prop covers wrote the breakpoints out again, in numbers that had to match the library's or the layout disagreed with itself at one width.

  `useMPWindowClass` reads the four boundaries through `matchMedia` rather than off `innerWidth`, which is the difference between agreeing with the stylesheet and agreeing with arithmetic: a classic scrollbar is counted by one and not the other, so a 615px window is `medium` to CSS and `compact` to a subtraction. It subscribes to the boundaries rather than to `resize`, so a drag from 500 to 1900 wakes it four times instead of several hundred. Where there is no window it answers its `onServer` argument, `'expanded'` by default — a guess, and an argument because an application usually knows better than the library which way its own first paint should lean.

  `useMPShortcut` takes the spelling `MPShortcut` draws, so `<MPShortcut keys="Mod+K" />` and `useMPShortcut('Mod+K', open)` cannot end up as two different combinations. `preventDefault` is on by default because a page that binds `Mod+K` has said the key is theirs; `ignoreInputs` is off by default because `Mod+K` typed into a search field still means "open the palette", and is there for the bare `/` that would otherwise be taken out of the middle of a sentence.

  `WINDOW_CLASSES` moved out of `MPGrid` on the way, so the grid and the hook read one table.

- **`MPCalendar`, the calendar without the picker in front of it.**

  The grid `MPDatePicker` opens was always the larger half of that component — three views on one footprint, a roving tab stop, arrow keys that step the month at an edge, a header where the month name and the year are each a button into a grid of their own — and there was no way to put it on a page. A booking page that shows the month it is talking about, a dashboard with the calendar beside the list it filters, a form with room for it: in all three the popup is the part that is in the way.

  It is a wrapper rather than a re-export, and the wrapper is the whole of the work. `internal/Calendar` is fully controlled and takes its `labels` already resolved, because the four callers it was written for had each decided those things; a consumer has not, so `MPCalendar` is where the value, the month on screen and the translation are put back. The internal component gave up the `MP` prefix in the process — it belongs to what a consumer can import.

  Three decisions that are not the picker's, each for a reason:

  - **`variant` defaults to `'text'`** and paints no surface at all. A standalone calendar almost always lands somewhere that is already one — a card, a panel, a popover of your own — and a default that painted a second would be a box inside a box in the common case. The other four are the container ladder, and they take the popup's padding table so that a calendar standing alone and the identical calendar inside a picker are not one track apart.
  - **The month on screen stays where the reader left it.** The picker resets it every time the popup opens, because opening says _start again_; a calendar that is always on screen has no such moment, and one that snapped back to July while somebody was reading September would be undoing a navigation they meant. `month` and `onMonthChange` drive it for the cases that want to.
  - **`onValueChange` never hands over `null`.** There is no × on a calendar, and a control that unchose itself on a second press would lose a value to a double-click.

  `autoFocus` is `false` here and `true` inside a picker, which is the difference between the two in one prop: a popup that has just opened is the reader's current business, and a calendar sitting in a page is not.

  Not a range calendar and not an event calendar — the first is `MPDateRangePicker`'s question, and the second wants a per-cell rendering hook that would stop a cell being a 40dp target.

- **`precision` on `MPDatePicker`** — `'day'`, `'month'` or `'year'`. A card's expiry, a fiscal year, the month a report covers: the questions where a day is not something the reader has to give, and where a control that asked for one anyway would be recording an answer nobody meant.

  It stops the calendar by **leaving the finer views out** rather than by refusing them. A month picker opens on the twelve months and has no day grid to reach through, so a press there is the answer instead of a way down; a year picker opens on the years. The view _above_ the one it answers with stays, because that is how the other years are reached — pressing the year on a month picker opens the page of years, and choosing one comes back to the months.

  Everything downstream follows the same word, which is the part worth having in a table:

  |                         | `'day'`         | `'month'`                | `'year'`      |
  | ----------------------- | --------------- | ------------------------ | ------------- |
  | The value               | the day pressed | the **1st** of the month | **1 January** |
  | The trigger, by default | `Jul 15, 2026`  | `July 2026`              | `2026`        |
  | `name` submits          | `2026-07-15`    | `2026-07`                | `2026`        |
  | The footer's shortcut   | Today           | This month               | This year     |

  The value is trimmed to the unit because it stands for the unit: a picker whose trigger says _July 2026_ and whose form submits the 31st is printing one thing and sending another. The time of day survives, exactly as it already did at day precision.

  `minDate` and `maxDate` are read at the precision too, which is the rule the month grid and the year grid were each already spelling out for themselves — `isUnitOutside` in `internal/date.ts` states it once and both now ask it. A minimum of 10 July leaves July pickable on a month picker, because there the bound is about which months exist. `shouldDisableDate` is the one thing that does **not** carry over: it is asked about days, and a rule written about weekends has no answer for "is July available". Inventing one out of the 1st would block whichever months happened to start on a Sunday, so a coarser picker never calls it.

  Two new strings, `thisMonth` and `thisYear`, in the `picker` namespace and in all eighteen translations.

- **`MPControlEventProps`, on the eight controls that could not take an event handler at all.** `onKeyDown`, `onKeyUp`, `onFocus`, `onBlur`, `onClick`, `onDoubleClick` and `onContextMenu`, on `MPTextField`, `MPNumberField`, `MPSelect`, `MPCombobox` and the four date and time pickers.

  Seventy-four of the hundred and fourteen exported prop types already accepted every one of these, by extending `React.ComponentPropsWithoutRef` and spreading the rest onto an element they own. The forty that did not are the same shape of component `className` was missing from in 1.5.0, and for the same reason: a control that draws a box, a label, an input and a supporting line has four elements a handler could land on, and spreading would pick one of them by accident.

  So the rule is written down instead, and it is **the opposite of where a class goes**. A class describes the whole component and lands on its outermost element; an event came from one element and lands on the control that produced it. On an `MPTextField` that means `onKeyDown` is a keystroke that landed in the field and never one that landed on the reveal toggle beside it, and `onFocus` is the input taking focus rather than anything in the row taking it. Each props table names the element.

  The other half is ordering. **Yours runs first**, and a control with its own answer for a key checks `defaultPrevented` before giving it:

  ```tsx
  <MPTextField
    value={draft}
    onChange={setDraft}
    rows={4}
    onSubmit={send} // plain Enter
    onKeyDown={(event) => {
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault(); // ⌘Enter is yours — and no newline is inserted
        sendAndClose();
      }
    }}
  />
  ```

  A `<div onKeyDown>` wrapped around the control gets the keystroke by bubbling, which is what a caller had to write before. What it cannot do is go first.

  `MPTextField`'s composition rule is unchanged: the Enter that commits a syllable is reported to a caller, because interpreting it is theirs to do, and is still never turned into a submission.

  `MPOtpField` is deliberately not among the eight. It is six inputs rather than one, and a `blur` that fired every time the caret moved between two of its boxes would be reporting something that did not happen.

  `MPDialog` joins them, and it is the one that is not a control. Its props are a closed set rather than a spread, so there was no element a caller could reach at all — a Ctrl+A that belongs to the dialog's own body had to be caught on a wrapper outside the component. The handlers land on the **sheet**, which is where a keystroke inside the dialog arrives by bubbling; the trigger that opened it and the page behind it are both somewhere else. Base UI's own handling of the keys it owns, Escape included, runs alongside rather than being replaced.

- **`span="grow"` on `MPGridItem`.** The one width that is not a number of columns: whatever the row has left after everybody else has taken theirs.

  A thumbnail beside a body of text is the layout it exists for, and the reason a `span` could not express it is that the remainder is only known once the other items in _that_ row have been laid out. `span={3}` and `span={9}` is the same picture right up until the thumbnail's column count changes and the two stop adding up. Two growing items split the remainder equally rather than in proportion to their contents, and it is responsive like any other value — `{ compact: 12, medium: 'grow' }`.

  The arithmetic is a switch rather than a second rule, because a custom property cannot choose between two of those: the width declaration multiplies by `1 - grow`, so a growing item measures nought and is handed the row's remainder by `flex-grow`, which is the only place that remainder is known. A `span` that never mentions `'grow'` emits no extra property, so the common case is the one inline value it always was.

- **`marks` on `MPSlider`.** The ticks on the track, and optionally what is written under them. `true` puts one at every `step`, which is MD3's discrete slider; an array names them instead and is the form that can carry labels — `[{ value: 1990, label: '1990' }, …]` for the decade markings under a year range.

  A tick over the filled part of the track takes the accent's own ink and one over the groove takes `on-surface-variant`, which is the specification's pairing and the reason a tick stays visible as the handle passes it. That needs the current value, so the slider now mirrors it — an uncontrolled slider's value lives inside Base UI, and a tick that could not see it would be drawn in the groove's colour on top of the accent, which is the one place a 3px dot disappears entirely.

  Three limits, all of them stated rather than silent. The boolean form draws nothing past **fifty** ticks, at which point they are a dotted line built out of one DOM node each and say less than no ticks would. A mark outside `min`…`max` is dropped rather than clamped, because two pinned to the same end read as one. And labels are laid out from each tick's centre and are not measured, so two that would collide overlap.

- **`filter` on `MPCombobox`.** Which rows survive the query, in place of the matching the component does on its own — and **`null` turns the filtering off entirely**.

  That is the value the prop exists for. A list fetched per keystroke has been matched by a server that knows things this does not — synonyms, transliteration, the rule that strips a punctuation mark out of a tag before comparing it — and a second pass here can only remove rows that server decided were hits. A row the reader can see the reason for, disappearing as they type the next character, is what that looks like. A function is the middle ground. The row that offers what was typed is exempt either way: its label _is_ the query, so a filter that hid it would be hiding the answer to the question it was asked.

- **`chipVariant` and `chipColor` on `MPCombobox`**, and **`content` on `MPComboboxOption`.**

  The chips in a `multiple` field were `tonal` in `primary` with no way to say otherwise, and a field holding six of those reads as a row of buttons rather than as a value — which is why Material UI's own autocomplete draws them outlined. The defaults are unchanged; there are now two props instead of a stylesheet override.

  `content` is what a row draws when that is more than its label: a thumbnail, a glyph, a second line. It replaces the label **in the popup only** — the input still receives `label` when the row is chosen, the chip still shows `label`, and the filter still matches against it. That is why it is a second prop rather than `label` being loosened to a `ReactNode`: a text input's value is a string, and a row that could not say what its own string is would have nothing to put there.

- **`render` on `MPButton`**, which its own documentation had been recommending since 1.0 and which `MPButtonProps` did not have. A link wearing a button is what it is for, and it is three props rather than one:

  ```tsx
  <MPButton render={<a href="/pricing" />} nativeButton={false} role="link">
    Pricing
  </MPButton>
  ```

  `nativeButton` is Base UI's, passed through, and `role` puts back the one thing it then assumes: `false` is taken to mean the element is _acting_ as a button, so Base UI gives it `role="button"` to say so. For an anchor that is one assumption too many, and without the third prop the link is announced as a button — exactly the lie the component's "no `href`" rule exists to prevent. The rule's own paragraph now spells all three out instead of pointing at a prop that was not there.

- **`render`, `target` and `rel` on `MPListItem` and `MPBottomNavigationItem`.** Both drew a plain `<a>` with no way to reach it, so a Next or React Router application could not have a client-side navigation or a prefetch on a row, and an external link could not open in a new tab without being turned into a button.

  `render` on a list row is **the one `render` in the library that is not the outermost element**, and that is worth stating rather than discovering. A row's shell is an `<li>` because it is inside a `<ul>`, and swapping that makes the list stop being a list; what a caller wants to replace is the `<a>` inside it, which is the element a router has to own. `target` brings the `rel` a new tab needs, and a `rel` of your own replaces it rather than extending it — the bargain the other four link components already documented.

- **`nativeButton` on `MPMenu`.** For the trigger that is deliberately not a `<button>`: an avatar, a card, a row of text. Base UI then supplies the role, the tab stop and the Enter/Space handling, so the trigger is still a button to a screen reader and to a keyboard. It is a prop rather than something inferred because what a trigger renders is only known once it has rendered, and by then the wiring has been decided.

- **`hideLabel` on the three progress indicators.** The name stays in the accessibility tree and stops taking a line, which is what the `aria-label` it replaced used to do.

  There were two options before this and both were wrong for the indicator that is already labelled by what is around it — a spinner inside a card whose heading says what is loading. Drawing the name a second time is noise a sighted reader has to skip; _removing_ it leaves a `progressbar` announced as "63%" and nothing else, which is a number with no subject.

- **`type="search"` on `MPTextField`.** For the keyboard it summons and the autofill it declines: iOS labels the return key "search" for it, and a browser keeps its own history of what was typed into one. It draws exactly as `text` does, and WebKit's own × inside it is suppressed — that mark sits outside the adornment row, is not in the tab order, and empties a controlled value without telling React.

- **`position` and `className` per snackbar.** `position` was a property of the provider, so a message that had to be somewhere else because of _what it is_ — an error at the top of a page whose bottom corner is a toolbar — had nowhere to go.

  All six stacks are now on the page from the first render whether or not anything is in them, and that is the part worth knowing: a stack is its own `aria-live` region, and a region added to the document at the same instant as the message inside it is one a screen reader has nothing to compare against and does not read. An empty stack is a `pointer-events-none` flex column with no children.

- **Class hooks on the labels that had none.** `mp-list-item__label`, `mp-list-item__description`, `mp-list-item__text`, `mp-accordion__title`, `mp-accordion__subtitle` and `mp-accordion__text`. A page that wanted to resize a row's title had `.truncate` to aim at, which is a utility on hundreds of other elements.

### Changed

- **`MPTextField` no longer swallows Enter on every single-line field.** It swallows it when there is an `onSubmit` to have answered it, or when `disableEnterKey` says so outright, and otherwise leaves the key to the browser — which inside a `<form>` is the native submit an `<input>` has always done.

  The old behaviour was defensible one field at a time and indefensible in aggregate: the comment explaining it says "so a surrounding form is not submitted on top of whatever `onSubmit` just did", which is a good reason that applied whether or not there was an `onSubmit`. A page that already wrote `<form onSubmit>` — the ordinary way to write a form — got a field that silently stopped it. No type error, no console warning, and nothing to see until somebody pressed Enter.

  `disableEnterKey` now means the same sentence on both shapes of field: take the key away from whatever would otherwise have it. The newline with `rows`, the form's submit without. Multiline behaviour is otherwise unchanged, including that `onSubmit` there reports the keystroke without deciding what the field does with it.

- **`MPTypography` declares no colour at all unless `color` is passed.** Which is what its own prop documentation has said since it shipped — "no default: prose inherits the surface's own ink unless a role is asked for" — and not what it did.

  It wrote `[&.mp-typography]:text-mp-on-surface`, and `caption` and `overline` got `on-surface-variant`. The doubled selector is two classes, so a page could not win: prose dropped into a dark hero section with `text-white` on it came out `on-surface`, and the way out was to stop using the component. "No default" has to mean no declaration, because a default written at that specificity is not a default, it is a decision.

  What goes with it: `caption` and `overline` are no longer muted for you. That was a choice about what the text _is_ rather than something a size can decide, and it is a `className="text-mp-on-surface-variant"` away — which now works, for the same reason the rest of this entry does.

- **A pressable `MPChip` is a `<button>` rather than a `<span>` holding one.** One element, one tab stop, and one thing for a parent to hang `aria-expanded` on.

  The old shape was there for a real reason and it still is: a chip with `onDelete` has two controls, and a `<button>` inside a `<button>` is markup the browser un-nests on parse. So a chip with both keeps the span shell and two sibling buttons. Everything else — which is the common case — collapses to one.

  What it fixes is the chip as a trigger. Base UI's `render` merges its handlers and its ARIA onto the element the component returns, so `aria-haspopup`, `aria-expanded`, `id` and `tabindex` were landing on a `<span>` that was not focusable while the real button underneath was a second tab stop carrying none of it — and Base UI logged that it expected a native `<button>`. `<MPMenu trigger={<MPChip>Filter</MPChip>}>` now works, and is less markup than it was.

  The surface is unchanged at every variant, size and state: `appearance-none` takes the browser's button styling off, and the variant table is still the only thing painting a chip.

- **An `MPAccordion` panel stops clipping once it has finished opening.** `overflow: hidden` is the animation's, not the panel's — it exists so a body mid-open is a window rather than a squashed copy of itself.

  A settled panel that went on clipping cut the top off the first thing in it that draws outside its own box. A text field's floating label is exactly that: it sits _on_ the field's top edge, which is the panel's top edge, so a form in an accordion arrived with its first label sliced in half and nothing in the console said so. A select's popup, a tooltip and a focus ring are the same bug with different pixels.

  Three signals decide it, because no one of them covers every way a panel arrives. `onOpenChange` puts the clip back _before_ the height moves, which is the only one early enough to. The height's `transitionend` takes it off again — Base UI's `transitionStatus` cannot, because it marks the first frame and the last rather than the stretch between them. And a callback ref covers the two panels that never transition at all, a section that started open and any section under reduced motion, both of which would otherwise wait for an end that is not coming.

### Fixed

- **A month cell told a Korean reader `7월 2026`.** The month grid's cells were named by sticking the year on the end of a month name, which is the order English uses and one that Korean and Japanese do not. They are `Intl`'s now — `2026년 7월`, `January 2026` — which is the ordering the header's two buttons have always been put in and for the reason they are: a date in the wrong order reads as broken to exactly the readers it is wrong for.

  Tolerable while that grid was the middle of a day picker's journey. Not tolerable now: on a picker whose `precision` is a month, those twelve strings are everything a reader hears.

- **The month grid and the year grid were announced as "grid" and nothing else.** They are named by the year and by the page of years they show, the way the day grid has always been named by its month.

- **Base UI was never told which way the page runs.** Every padding, margin, corner and icon slot here is already a logical property, so the _stylesheet_ half of RTL has worked from a `dir` anywhere above a component since the beginning. Base UI answers the same question from a React context, and nothing in this library was providing one — so all seven of its parts that read it (the slider, menu, select, combobox, navigation menu, OTP field and scroll area) were being told the page ran left to right, whatever the DOM said.

  The slider is where it showed. Its thumb is placed with `inset-inline-start` and a **physical** `translate: -50%`: under RTL the inset measures from the right and the translate still moves left, so the handle sat exactly one handle-width from the value it was reporting — at every value, and off the end of the track at 0 and at 100. That is the shape the direction test file's own preamble warns about: RTL decays one physical value at a time, and the only thing that holds it is asking.

  `dir` on `MPConfigProvider` is the wiring, and it sets **both** halves: the attribute on a `display: contents` element, which takes part in no layout, and the same value in Base UI's own `DirectionProvider`. Left out, nothing is rendered and nothing is claimed.

- **Forcing a region back to light did nothing.** The dark block applies to any element carrying the attribute, so a dark section inside a light page has always been one attribute — and the documentation said the reverse worked too. It did not: the light scheme's tone stops lived on `:root` alone, so under a system preference of dark a `[data-mp-scheme='light']` on a section matched no rule at all. The media query had already retuned `:root`, the section inherited that, and nothing put the light stops back.

  The light stops now sit on `:root, [data-mp-scheme='light']`, which makes the two directions symmetrical. `--mp-source-color` stays on `:root` alone and above them, deliberately: repeated on the light block it would override a consumer's own scoped source colour on any element that also asked for light.

- **A picker's chosen day was never painted.** The filled circle MD3 puts under the selected date, the tonal band across a chosen range, and today's outlined ring are all drawn from `--_mp-accent` — and none of the three arrived. Two independent causes, either of which was enough on its own:

  The popup is a **portal** into `document.body`, and `MPPickerShell` declared the four accent slots on its root only. Nothing the shell sets reaches a portal, so inside the popup `--_mp-accent` resolved to nothing at all. `MPMenu` had always put them on its own popup; the pickers had not.

  And the cell's base carried `bg-transparent` to clear the native button background, in the same class list as the state's `bg-(--_mp-accent)`. Two utilities of equal specificity resolve by their order in the **generated stylesheet**, not by the order they are written in the attribute, and Tailwind emits `.bg-transparent` after `.bg-(--_mp-accent)` — so even where the property did resolve, the reset won. This is the exact hazard the cell's own comment describes and the reason its states are an `if`/`else` chain; the base was a third utility in a race the chain was built to avoid. Every branch now names its own background, including the four that paint none.

  `MPDatePicker`, `MPDateRangePicker`, `MPDateTimePicker` and `MPTimePicker` are all affected, and the clock columns had the second bug too. Three tests now assert the computed background rather than the class list, which is the difference between checking that a rule was written and checking that it applies.

- **A nested `MPGridItem` resolved the outer item's span.** The slots an item lays itself out from are inherited custom properties, which is deliberate — a media query can change one without React hearing about it — but a grid inside an item sits inside that item's `--_mp-span-large`, so an inner item that only declared `compact` resolved the outer one at every class above it. A `span={12}` came out a sixth of the row it was actually in, and the archive card whose title wrapped one letter at a time was 26px inside a 157px box.

  A grid is where a span stops meaning anything, so a grid is where the slots go back to nothing: `.mp-grid` resets the five span slots and the five offset slots to `initial`. Fifteen declarations once per grid, and the arithmetic under them is unchanged. The documentation site's own nesting example was affected by this.

### The measurements

`npm run measure`, against a build of this release and a build of `af10fcc` for the baseline, so the difference is the change and not drift.

| Scenario        | 1.5.0   | 1.6.0   |
| --------------- | ------- | ------- |
| `MPBox`         | 0.4 kB  | 0.4 kB  |
| `MPButton`      | 2.9 kB  | 3.0 kB  |
| `MPTextField`   | 4.3 kB  | 4.4 kB  |
| Five components | 7.4 kB  | 7.5 kB  |
| Ten components  | 11.2 kB | 11.6 kB |
| Everything      | 76.1 kB | 81.5 kB |

Just under two and a half kilobytes across the whole library, and it is spread rather than concentrated: the calendar's `precision`, the slider's ticks, the combobox's filter adapter, the accordion's three transition signals, and a `useRender` call in each of two list components. `MPButton` and `MPTextField` move a tenth each — the button for `render` and `nativeButton`, the field for one conditional class — which is what a minifier leaves of a handful of new names.

The last 5.4 kB is this report's own — `MPCalendar`, the five hooks, `MPVisuallyHidden`, `MPConfigProvider`, `MPConfirmProvider`, `MPStepper`, `MPImage`, `MPPopconfirm`, and the cell's four extra `bg-transparent` branches. Three of those four are close to free, because the grid the calendar draws and the machinery the hooks name were both already in `everything` and what they cost is a wrapper each: `material-plus-ui/hooks` is 0.3 kB imported on its own, and `MPVisuallyHidden` is one class string.

`MPConfigProvider` is the one that is not free anywhere, and it is worth being explicit about why. Every component that resolves a `size` or a `color` now imports `internal/config`, so the module reaches any bundle holding any of them — which is what moves ten components from 11.2 kB to 11.6 kB, a shade under a tenth of a kilobyte per component and one shared module rather than a per-component cost. `MPButton` alone goes from 23 modules to 24. A page that renders one control pays about 40 bytes for the ability to configure several hundred.

The stylesheet grew from 113.5 kB to 114.6 kB, and 16.2 kB to 16.4 kB gzipped. Fifteen reset declarations on `.mp-grid`, one `overflow-visible`, one search-cancel-button rule and a tick's five sizes are the whole of it; the crossover at about thirty-one components is unchanged. The split sheets go from eighty-eight to ninety-one — `MPCalendar`, `MPVisuallyHidden` and `MPConfigProvider` get one each, and none of the three holds a hand-written rule.

The suite goes from 1644 tests to 1924. Nineteen are the date picker's two new units and the raw events, as before. Twenty-seven are `MPCalendar`'s, forty-five the hooks', ten `MPVisuallyHidden`'s, seventeen `MPConfigProvider`'s, eight the scheme switches, six the direction wiring, fifteen `useMPConfirm`'s, nineteen `MPStepper`'s, twenty `MPImage`'s, eleven `MPPopconfirm`'s, and three more the picker's chosen day — those last ones read a computed background rather than a class list, which is the difference between checking that a rule was written and checking that it applies. The other eighty are this report, and the ones worth naming are the ones that would have caught the defects rather than described them: a nested grid item measuring 200px instead of 33px, a form actually submitting on Enter, a panel's `overflow` read at four points across its animation in both the controlled and uncontrolled cases, and a chip trigger asserting there is exactly one tab stop rather than two.

## 1.5.0 (2026-08-30)

Twelve components could not be handed a `className`, and ten of them were the form controls — the ones a page is most likely to want to place. That is this release: the prop, the props tables that never mentioned it, and a section saying what passing one actually does. The last of those turned out to be worth measuring rather than reasoning about, and the measurement corrected the first thing written about it.

Nothing was renamed and nothing was removed. `MPBox`, `MPButton` and `MPTextField` weigh what they weighed in 1.4.0, to the byte.

### Added

- **`className` and `style` on the twelve components that took neither.** `MPTextField`, `MPSelect`, `MPCheckbox`, `MPSwitch`, `MPSlider`, `MPRadioGroup`, `MPRadio`, `MPNumberField`, `MPFilePicker`, `MPSegmentedButton`, `MPMenubarMenu` and `MPNavigationMenuItem`. A hundred of the hundred and seventeen exported prop types already accepted both, by extending `React.ComponentPropsWithoutRef`; these twelve did not, because they do not spread rest props onto an element they own. It is a hundred and twelve now, and the five that still do not are the two mixins and the three providers that render no element at all.

  It was less an oversight than a question nobody had answered. A control that draws a box, a label, an input and a supporting line has four elements a class could land on, where the other seventy-odd components have one. The answer is the outermost element in every case, and each prop says which element that is in its own words, because it is a different element each time: the box around the control and its supporting line for a field, the box around the tick for a checkbox, the **word on the bar** for an `MPMenubarMenu`, and for an `MPNavigationMenuItem` the word in the row — the link, or the trigger that opens the panel — never the panel itself, which is portalled out of the element entirely.

  `style` is the half that carries more weight than it looks. It is inline, so a `--mp-sys-*` token handed to one instance beats every stylesheet no matter how the sheets were ordered, which is what makes it the answer below rather than a convenience. Where a root already carried `accentSlots()` — the checkbox, the switch, the slider, the radio group — the caller's object is spread last, the way every other component in the library already does it, so an accent family survives being given a margin.

  `MPMenuGroup` and `MPMenuRadioGroup` took a `className` and no `style`, which was the same pair half-finished. Both take it now.

### Changed

- **`className` and `style` are in the props tables, on all hundred and five components that accept them.** Neither appeared anywhere before, so the only way to find out whether a component took one was to try. The two rows are derived rather than typed out a hundred and five times — the mechanism the shared `size` and `color` rows already use — and a table describing something with no element behind it is left alone: the two providers, and the three plain objects that are entries in somebody else's array.

  Twelve components get a different sentence, collected in one map. Eleven of them are portalled, and that is the whole reason the map exists: what a reader sees of an `MPTooltip` is its plate, and the plate is not inside the element the trigger sits in, so _the outermost element it draws_ would be naming a box nobody can point at. The twelfth is `MPSegmentedButton`, where the class goes to the set and not to a segment.

### What passing a class actually does

The class is concatenated, not merged. Yours is appended to the component's own and nothing is removed to make room for it, so two classes setting the same property both land on the element at equal specificity and the winner is whichever one the stylesheet put last.

A class for something the component does not already set always applies, and that is most of what a class is for. Past that it depends on the **pair**, which was the surprise. Measured by rendering the components and reading the computed value back, on an `MPButton` at the default size:

| You pass                    | It sets                | Result  |
| --------------------------- | ---------------------- | ------- |
| `px-8`                      | `px-6`                 | applies |
| `px-2`                      | `px-6`                 | ignored |
| `h-20`                      | `h-14`                 | applies |
| `h-8`                       | `h-14`                 | ignored |
| `text-lg`, `text-xs`        | `text-mp-title-medium` | applies |
| `bg-red-500`                | `bg-(--_mp-accent)`    | applies |
| `rounded-lg`                | `rounded-mp-full`      | ignored |
| `shadow-lg`                 | `shadow-mp-1`          | ignored |
| `p-8`                       | `px-6`                 | ignored |
| any of the above with a `!` | —                      | applies |

The first four rows are the ones to read. `px-8` works and `px-2` does not, on one component and one property, because Tailwind emits a scale in scale order and the larger step is therefore later — so **making a control bigger tends to work and making it smaller tends not to**. The rest is which of two theme keys sorted first: the library's `--text-mp-*` land before Tailwind's own, so any `text-*` wins; `--radius-mp-*` and `--shadow-mp-*` land after, so `rounded-*` and `shadow-*` do not.

None of it is a promise. It is what one version of Tailwind emits, it is per pair rather than per property, and it moves when either side adds a token. To take something over there are three answers that do hold: the token through `style`, the prop that owns the axis — `size` is a height and a type scale and a set of paddings — and Tailwind's `!`, which took all three of the losing pairs above.

The library ships no class merger of its own, and that is a decision rather than an omission. `tailwind-merge` is the right tool for this and a good one, but it would be a runtime dependency on every component, against 2.9 kB for a button on its own, and its class groups would have to be taught every `mp-` token this package adds, in step with adding them. Merging at the call site is one line and costs the projects that do not need it nothing.

### The measurements

esbuild, gzip, React and `@base-ui/react` external — this library's own contribution, on the same harness as 1.4.0, and with 1.4.0 rebuilt from its own commit rather than quoted, so the difference is the change and not drift.

| Scenario        | 1.4.0   | 1.5.0   |
| --------------- | ------- | ------- |
| `MPBox`         | 0.4 kB  | 0.4 kB  |
| `MPButton`      | 2.9 kB  | 2.9 kB  |
| `MPTextField`   | 4.3 kB  | 4.3 kB  |
| Five components | 7.3 kB  | 7.4 kB  |
| Ten components  | 11.1 kB | 11.2 kB |
| Everything      | 74.1 kB | 74.2 kB |

A hundred grams of destructuring spread over twelve components. The three single-component rows do not move at all, because none of the twelve is among them.

Every stylesheet figure is unchanged — 113.5 kB whole, 16.2 kB gzipped, eighty-eight split sheets, the crossover still at about thirty-one components. The release added props, not classes, so there was nothing new for Tailwind to generate.

The suite goes from 1633 tests to 1644: one `passthrough` block per component, in the shape `MPEmpty`, `MPTooltip` and `MPShortcut` already used. Four of them assert that the accent slots survive the caller's `style` object, two that a container's class does not leak onto the option or the word inside it, and one that a set's class did not land on a segment.

## 1.4.0 (2026-08-30)

Seventeen new components, and five of them are one thing: the skeleton a page is hung on. The library could draw a text field and could not draw the page the field was on — there was no `<header>`, no `<nav>`, no `<aside>`, no `<main>` and therefore no way to build a page whose regions a screen reader can list, a reader mode can find or a crawler can tell apart. That is what the first half of this release is. The second half is what kept turning up next to it: two strips of navigation, two form primitives, a toggle, a transfer, a command palette and a stack of faces.

The floor did not move. A project that renders one component pays what it paid in 1.3.1, to the byte — see the measurements at the end.

### Added

- **`MPPageLayout`, and the four parts that hang off it: `MPHeader`, `MPFooter`, `MPSidebar` and `MPSidebarTrigger`.** The layout contributes exactly one element of its own — a `<div>` with no meaning — plus the `<main>` and the skip link that jumps to it. Every other landmark comes from whatever was handed to a slot, which is why the other three are real `<header>`, `<footer>` and `<aside>` elements rather than styled boxes.

  Everything that decides where a column goes is flexbox and a media query, so the arrangement is right in the first frame the browser paints and right on a page whose JavaScript never arrives. Two things are measured and only two — the header's height and the footer's — because a column that holds its place has to start below a bar whose height nobody but the bar knows, and those numbers are written straight onto the root as custom properties rather than held in state, since a `setState` per resize would re-render the page to change a `top`.

  `collapseBelow` is **`MPWindowClass` rather than a pixel width**, and it defaults to `expanded`, because that is MD3's own answer: the specification gives a standard navigation drawer to an expanded window and puts the same destinations behind a modal drawer below one. An `MPSidebar` is therefore one component in both shapes — a column above the line and an `MPDrawer` below it — with the children existing once either way, so nothing inside is put into the document twice for a screen reader to read twice. Which of the two is showing is answered in CSS for the first paint and by `matchMedia` from then on, because a modal drawer is a portal into `document.body` and there is no body to portal into while the markup is being rendered.

  The sidebar's width ladder is `MPDrawer`'s to the pixel — `md` is MD3's own 360dp navigation drawer — so a column is exactly as wide as the drawer it becomes.

- **`MPNavigationMenu` and `MPMenubar`**, which are the same strip and differ in what a row _is_. The navigation menu holds links, so it is a `<nav>` full of real `<a>` elements — which is what puts a destination in a screen reader's link list, on the status bar, on the middle-click menu and in a crawler's index. The menu bar holds actions, so it is Base UI's `menubar` role with one tab stop for the whole strip. The rule is short: a menu when the row **does** something, this when the row **goes** somewhere.

  Both draw no surface. A menu bar sits _on_ an `MPHeader` or a title bar, and a sheet under a strip that is already on a sheet is two sheets. The navigation menu's panel is MD3's menu surface — `surface-container` at elevation 2 under `corner-extra-small`, the same three decisions `MPMenu` and `MPSelect` make — and it animates its width and height as well as its opacity, because Base UI resizes one open panel into the next rather than closing and reopening it, and animating that is what makes crossing the row read as one surface rather than three sheets flashing.

- **`MPForm` and `MPFieldset`.** The form owns the part that has to live above the fields: a submit collects every field's validity at once, focus lands on the first that failed, and `errors` puts a server's answer back on the field it belongs to rather than in a banner at the top of the page. It is not a form _library_ — there is no schema here and no resolver — because every one of those can already produce `{ [name]: message }`, which is the seam this is built around.

  The fieldset owns the one thing only a real `<fieldset>` can do: `disabled` reaches every control inside it, including ones a component three levels down rendered and never heard of it. That is not something a React context could promise, and it is the whole reason it is a component rather than a `<div>` with a heading over it. Neither draws a surface; a group of fields is a grouping and not a sheet.

- **`MPToggle` and `MPToggleGroup`.** A button that stays down, and the rule that decides how it is drawn is that **off is neutral**. A toggle has to be readable at a glance in a row of eight, and the axis a reader can judge in isolation is hue rather than saturation — a set where off is a paler accent and on is a stronger one is a set nobody can read without holding two of them side by side. It is also what leaves `color` meaning something: on a button the family says what kind of action this is, here it says what "on" looks like.

  The group cuts the corners that face a neighbour out of `MPButtonGroup`'s own table, and it holds the value, so `variant`, `size`, `color` and `disabled` are set once for the run.

- **`MPTransfer`** — two lists and the arrows between them, for a choice long enough that a combobox with forty chips in its field stops being readable and a column of forty checkboxes gives no answer to "what did I pick". The interaction is one sentence: **ticking is not choosing.** `value` is which side a row is on; a tick is a mark saying it should move next time an arrow is pressed. So `onValueChange` fires on the arrow and never on a tick, moving drops the ticks on what moved and keeps the rest, and a press moves only what the filter is still showing — a row that was ticked and then hidden was never part of it.

- **`MPCommandPalette`.** Everything an application can do behind one field, for the point where a product has more actions than a menu bar can hold. What comes back from an `MPCombobox` is a value the caller then does something with; what comes back from here is _something happening_. Its surface is MD3's docked search view — `surface-container-high` at `corner-extra-large` under elevation 3 — which happens to be the same three decisions `MPDialog` makes, and it is pinned near the top of the window rather than centred, because it is opened by somebody who is about to type.

  `Mod+K` is bound on the window and is written in exactly the vocabulary `MPShortcut` **draws**, which is the point: a shortcut a component displays and one it binds have to be spelled the same way, or the label on the screen is a claim nobody checked. A command's own `shortcut` is a label for a binding the application already has — the palette deliberately does not bind it, since a palette that did would be competing with the editor underneath it.

- **`MPAvatarGroup`.** A stack of faces with the ones that did not fit as a count, and the ring between them is not decoration: two circles of similar tone laid over each other have no edge at all and the stack reads as one smeared shape. It is drawn in the page's own `surface`, so what separates the faces is the background showing through rather than a white line on top of them, and it goes dark with the scheme without anybody saying so. `total` is the prop worth reaching for — a list of forty people that ships four `<img>` tags and a number.

- **Four message namespaces and one glyph.** `layout`, `transfer`, `command` and `colorPicker` bring the table to thirteen, each still its own module under `internal/messages/` so a component pays for the words it speaks and no others, and each translated into all eighteen languages. Eight of the new strings are **drawn** rather than only announced — the skip link, the transfer's two headings and its empty line, both placeholders, and the word each of the two pickers shows when there is nothing yet — which is the class of string it would be least forgivable to leave in English. `ICONS` gains a thirtieth glyph, three lines: the one drawing in the set that is a picture of a menu rather than a picture of what pressing it does, and the one shape thirty years have made legible with no word beside it.

### Fixed

- **`MPColorPicker` could not say its own names in anything but English.** Its seven strings — the saturation square, the two rails, the value field, the swatch grid, the ×, and the word the trigger shows before a colour is chosen — were defaults kept inside the component, with no `locale` prop and no route into the message table. Every other component in the library that has to invent a word takes `locale`, and the localisation guide says so, so this was the documentation being wrong about one component rather than a deliberate exception. They are the `colorPicker` namespace now: `locale` gets a translation, `MPLocaleProvider` gets one for a whole application, and `labels` still wins over both. `MPColorPickerLabels` is now an alias of `MPMessages['colorPicker']` and is structurally what it always was.

  One behaviour change, and it is the point of the fix: a picker inside an `MPLocaleProvider` whose language has a registered table now speaks it. English is unchanged to the string.

- **A field could not show an error it had been handed from outside.** Every field here renders its supporting line from its own `errorMessage` prop, and only from that — so an error arriving through Base UI's `Field`, which is how `MPForm`'s `errors` reaches a field, set the outline red and printed nothing at all. A control that is visibly wrong with no explanation of why is the exact failure `errorMessage` exists to prevent, arriving through the other door.

  `MPTextField` and `internal/SupportingText.tsx` now render an empty `Field.Error` in the slot when they have nothing of their own to say. Base UI draws it only when the field is genuinely invalid, so it is inert until something says otherwise: a required field in a plain `<form>` with no `MPForm` around it still shows nothing and is still not marked invalid — checked, not assumed.

### Changed

- **The measure ladder and the connected-group corners moved into `internal/`.** `MEASURE` was `MPContainer`'s and is now `internal/scale.ts`'s, because `MPHeader` and `MPFooter` take a `maxWidth` too and a bar that lined up with the article under it at every width but one would be worse than no `maxWidth` at all. `GROUP_JOIN` was `MPButtonGroup`'s and is now `internal/button-group.ts`'s, so a run of toggles is cut exactly like the run of buttons beside it. Neither is public and neither changes what anything renders.

- **`MPAvatar` reads a group.** `size`, `shape`, `variant` and `color` fall back to an `MPAvatarGroup` above it, on `MPButton`'s arrangement and with `MPButton`'s rule: the group is a _fallback_, so "not set on the group" keeps meaning "use the avatar's own default" rather than turning into one, and an avatar's own prop still wins. Outside a group nothing changes.

- **`MPMenu` passes `modal` through instead of defaulting it.** Base UI's own default is the same `true`, so nothing renders differently. What it stops is a warning: a menu on an `MPMenubar` is a _nested_ menu, where the prop has no meaning, and Base UI reported a `modal` it had been handed and could not honour on every menu of every bar.

### A pass over every one of the eighty-eight

A survey of the whole public surface — performance, accessibility, security, duplication, correctness and test coverage, one component at a time. Most of it came back clean. What follows is what did not.

**Two of them crashed.** `MPTimePicker` and `MPDateTimePicker` handed `hourStep`, `minuteStep` and `secondStep` straight to `Array.from` as the divisor that decides how many rows a column has, and `Math.ceil(60 / 0)` is `Infinity`, which `Array.from` refuses: `RangeError: Invalid array length`, thrown during render, taking the picker and everything above it down. A negative step was quieter and worse — an empty column with nothing said about why. And `MPTable` threw _Objects are not valid as a React child_ on any cell holding a `Date`, an object or an array, from inside a `.map()` in a `<tbody>`, which is a blank page for one unexpected column in an API response.

**A clock was not a listbox.** `MPTimeGrid`'s columns carried `role="listbox"` and `role="option"` and none of the behaviour either word commits to: every row was an ordinary `<button>`, so a 12-hour clock with seconds was a hundred and fifty-eight tab stops and the arrow keys did nothing at all. The file's own comment said the rows were "a real listbox that arrow keys already reach", which is not something a role does for you — only a native `<select>` gets that free. Each column now takes one tab stop and moves inside it, with the tab stop starting on the chosen row and following the reader after that.

**Four components had one physical value left in.** Every one of them was _written_ to run both ways — the chevrons turn, the paddings are `ps`/`pe`, the badges sit at the `end` — and nothing caught the exceptions because no test had ever set `dir`. The floating label was pinned `left` on every control drawn on the field shell, so under RTL it sat on an unbroken stretch of outline with the notch open beside it. `MPSwitch` moved its thumb along `left`, so the control whose entire meaning is which end the thumb is at pointed backwards. The calendar's arrow keys moved the day cursor against what was drawn. And `MPPanes` flipped for the pointer and not for the keyboard, so one handle answered a drag and an arrow key differently. `test/styles/direction.test.tsx` is the thing that was actually missing: RTL is not a feature a component either has or has not, it is a property that decays one physical value at a time.

**A link could be a script.** `MPChatBubble`'s `preview` is the one shape in this library whose contents typically come from somebody else — a card attached to a message another person sent — and its `url` went straight into an `href`. React renders a `javascript:` href with a development warning and nothing more, so on a page built out of user-generated content that was a one-click script execution in the middle of a thread. `safeHref` allows `http:`, `https:`, `mailto:`, `tel:` and anything with no scheme at all; everything else draws the card with no link. The preview's picture is loaded lazily now, with the referrer withheld and its box declared.

**`MPNavigationMenu` was the one link in the library with no `rel`.** `MPMenuItem`, `MPTextLink` and `MPChatBubble` had each worked out `noopener noreferrer` separately and each written the same pair; the fourth component — the one whose whole purpose is a page's outbound navigation — had been left out of a rule that existed in three copies. It is `internal/link.ts` now, and all four call it.

**Eight components could not say their own words in the page's language.** `numberField`, `carousel`, `breadcrumb`, `combobox`, `table`, `filePicker`, `textLink` and `overlay` are new namespaces, translated into all eighteen languages. Four of them were _drawn_ rather than only announced, which is the half that is hard to defend: a Korean page had a table saying _No data_ through the middle of it and a dropzone giving its one instruction in a language nobody had asked for. `test/locales/completeness.test.ts` now asserts that every table answers every key with the placeholders it was written with — a missing namespace is not a type error and not a runtime error, which is exactly why it went unnoticed.

**Two components spoke about shortcuts and disagreed.** `MPShortcut` draws one and `MPCommandPalette` matches one, both files said at length that the two had to be spelled the same way, and each then answered separately. The palette sniffed `navigator.userAgent` alone where the label reads `userAgentData.platform` first, so a page could draw `⌘K` and bind Ctrl+K. And `Mod` was tested as a fifth modifier when it is a _name for a key_, which meant **`Ctrl+K` matched nothing except on a Mac**. One vocabulary now, in `internal/keys.ts`.

Smaller, in one line each: a carousel's hover-pause and focus-pause shared one boolean, so moving focus out put it back in motion under a pointer that had never left; `MPButton` squared itself for two glyphs and no label; `MPAnimateMarquee` left its `aria-hidden` copies in the tab order where `inert` was called for; `MPSidebar`'s resize handle was a focusable `separator` with no value to read back; `MPTextField`'s reveal toggle indicated focus by colour alone; `MPPageLayout`'s `<main>` could not take the focus its own skip link sent there; `MPSlider`'s description was pointed at by nothing; all three progress indicators reported an `aria-valuenow` on a bar they had just drawn indeterminate; and `MPTransfer` never dropped a tick, so a re-fetched list came back with selections the reader had not made.

**Three things were being done more often than they could matter.** `MPColorPicker` re-rendered its panel once per pointer event where a screen can show one per frame; `MPCommandPalette` lower-cased every command's label, group and keywords on every keystroke; and `MPCombobox` asked the same question of its whole option list twice per character typed. The two caches in `internal/date.ts` also grew without a ceiling, keyed on a `format` that is a caller's prop.

**Some things are one thing now that were several.** `internal/length.ts` states the library's rule about a length — a number is pixels, a string is already a length — which sixteen places had each written out; `internal/link.ts` holds the `rel`; `internal/keys.ts` holds the platform and the shortcut grammar; and `MPTextField` draws its supporting line with the component that was extracted from it.

**`MPAlert` grew a `live` prop and `MPTransfer` learned to stack.** An alert derived its live region from `color` and stopped, so an error summary rendered by the server interrupted a screen reader to say something the reader was about to reach anyway. And a transfer laid itself out as three columns at every width, which on a 375px screen is two lists of 150px each; it now stacks below MD3's medium boundary with the arrows turned a quarter.

**`MPButtonGroup` and `MPToggleGroup` had no tests at all** — the only two of the eighty-eight. Neither of the two things a group does is loud when it breaks: a run that lost its joins is still a run of buttons, and a group whose fourth member is a rung out is still a row.

### One class name worth knowing about

A sticky `MPSidebar`'s height is an arbitrary `calc()` reading two custom properties, and the first way to write it does not work:

```
[height:calc(100dvh-var(--_mp-layout-header,0px)-var(--_mp-layout-footer,0px))]
```

Tailwind normalises the operators in a `calc()` it has to space itself, and doing that puts a space after the leading `--` as well — so the declaration comes out as `var(-- mp-layout-header,0px)`, which is invalid, and the column silently keeps its whole-window height. Nothing about the markup changes when that happens. Spacing the operators in the source (`100dvh_-_var(…)`) leaves nothing to normalise, `npm run build` now compiles the stylesheet with no warnings, and there is a test that reads the computed height rather than the class list, because the class list looked correct the whole time.

### The measurements

esbuild, gzip, React and `@base-ui/react` external — this library's own contribution, on the same harness as 1.3.1.

| Scenario        | 1.3.1   | 1.4.0   |
| --------------- | ------- | ------- |
| `MPBox`         | 0.4 kB  | 0.4 kB  |
| `MPButton`      | 2.9 kB  | 2.9 kB  |
| `MPTextField`   | 4.1 kB  | 4.3 kB  |
| Five components | 7.3 kB  | 7.3 kB  |
| Ten components  | 11.1 kB | 11.1 kB |
| Everything      | 64.1 kB | 74.1 kB |

Two rows move. The last moves by roughly what seventeen components weigh, plus about 1.4 kB for the audit's eight new message namespaces and its three shared modules. `MPTextField` moves 200 bytes, and it is the one figure here that went up for a _good_ reason: it now draws its supporting line with `internal/SupportingText`, which it had a fifth copy of.

Everything else is unchanged to the byte, which is the shape this release was supposed to have: `sideEffects`, the build's `@__PURE__` annotations and a message table per namespace are between them why adding a fifth of the library again costs a project using one component exactly nothing.

The whole stylesheet goes from 109 kB to 113.5 kB — 15.6 kB to 16.2 kB gzipped — and the split sheets from 75 to 88. The point the split stops being the smaller download moves from about thirty components to about thirty-one, which `npm run build` measures rather than remembers.

The suite goes from 1281 tests to 1633 across sixteen new files, and the library from ninety-four components to a hundred and eleven.

## 1.3.1 (2026-08-29)

### Fixed

- **The package could not be imported by webpack, or by Node.** `package.json` says `"type": "module"`, which makes every `.js` in `dist/` a strict ES module — and a strict ES module has to name the file it imports. `tsconfig.json` compiles with `module: "Preserve"`, which emits each specifier exactly as the source wrote it, and the source writes them the way TypeScript's own `bundler` resolution reads them: `export * from './components/button'`, no extension. Bundling `MPButton` with webpack 5 produced **78 `Module not found` errors**, one for every specifier it reached, each of them the `fully specified` breaking-change notice — that is Next.js, Rspack and every Create React App descendant. `import('material-plus-ui')` in Node threw `ERR_MODULE_NOT_FOUND` on the first line of `dist/index.js`, which is any server-side render that does not go through a bundler first.

  It survived a release because Vite, esbuild and Rollup-with-`node-resolve` all guess the missing extension, and the documentation site, the test suite and 1.3.0's own measurements are Vite. `scripts/specify-imports.mjs` now rewrites the 884 specifiers in `dist/` — the `.d.ts` files too, which had the same problem for a consumer on `moduleResolution: node16` — and reads the output back afterwards rather than trusting itself, because what this guards against is not a build that crashes. It is a package that installs, type-checks and cannot be imported. webpack goes to zero errors, Node imports all 131 exports, and the three bundlers that already worked produce what they produced before.

- **The package broke a Next.js App Router build the moment a server component imported it.** Not a warning and not a runtime nuisance — the build stopped:

  ```
  Error: Failed to collect page data for /
  cause: TypeError: e.createContext is not a function
  ```

  from a `page.jsx` whose only line was `import { MPButton } from 'material-plus-ui'`. React ships two builds and the one a server component renders against has no `createContext`, no `useState`, no `useContext`, no `useRef` and no `useEffect`; a module that reaches for one has to say `"use client"`, and no module here said it. That is every App Router project, on the component a page starts as.

  `scripts/mark-client.mjs` now derives the set and writes it into `dist/`: **76 of the 200 modules**, which is every module that renders. It runs after `terser`, because `terser` deletes the directive — `compress.directives` is on by default and reads `"use client"` as a redundant prologue.

  Two things it deliberately does not mark. The **barrels**: `dist/index.js` re-exports the whole library, and a directive there would make one import of `MPBox` pull all of it across the boundary — a re-export of a client module from a server one is exactly what a boundary is, and every bundler follows it. And the **data**: `internal/i18n.ts`, the nine message tables and the eighteen locales, so `registerMPMessages` can be called from wherever an application does its setup.

  Verified rather than reasoned: twenty-eight pages, one per component and every one of them a server component, now prerender through a real `next build`. The directive costs nothing — a bundler removes it, and the gzipped figures below are the same to the byte with it and without.

### Changed

- **English is nine modules instead of one object, and a component carries the namespace it speaks.** 1.3.0 moved the eighteen translations out of the library so that a component saying one word did not hold every word in every language. English stayed, as one `MPMessages` object with a namespace per component in it — and one object is indivisible. A bundler can drop a module nobody imports and an export nobody reads; it cannot drop a _property_. So `MPButton`, which says _Loading_, went on shipping the calendar's eighteen strings, the pager's seven and the chat bubble's six: **1.75 kB of table for the 130 bytes of it that got rendered.**

  The strings are `src/internal/messages/`, one module per namespace, and `resolveMessages(locale)[namespace]` is now `resolveNamespace(namespace, locale)` — handed the English table rather than looking it up, which is the whole of why the other eight can be left out. A call site reads `useMPMessages(COMMON, locale)`, and the namespace object carries its own name so it cannot say one namespace while passing another's words. All of this is internal: `registerMPMessages`, `MPLocale`, `MPPartialMessages`, `MPLocaleProvider`, every `labels` prop and every registered translation behave exactly as they did, and the merge is still a namespace at a time so a partial language still falls back to English one namespace at a time.

- **The icons are two modules now, and that is what makes `ICONS` work in a server component.** A component handed to a client component _as a prop_ has to be a client reference — otherwise `<MPIcon icon={CheckIcon} />` in a server component fails with _Functions cannot be passed directly to Client Components_, pointing at a `forwardRef` object, because `lucide-react` marks its `Icon` module and not its icons. But `ICONS` is read with a property access, and a server component cannot read a property off a _client_ module's namespace either: it gets `undefined` and React reports an invalid element type. Whichever way the single file was marked, one of its two halves broke.

  So `constants/glyphs.ts` is the twenty-nine renamed lucide exports and carries the directive, and `constants/icons.ts` re-exports them and holds the table without one — a plain server-side object whose values are client references. `material-plus-ui/constants/icons` is still the path, the named exports are still what the components import, and both halves now work from a server component. Bundles are unchanged: `MPButton` is the same 23 modules and the same 2.9 kB, because `ICONS` is still an export nobody reads.

- **The build marks a class list pure as well as a `forwardRef`.** A long list of Tailwind utilities is written here as an array of lines joined with a space, which is a readable way to spell a hundred characters and — to a bundler — a method call on an array. `['a', 'b'].join(' ')` cannot be proved harmless any more than `forwardRef(fn)` can, so every such constant in a module was kept the moment anything in that module was imported. `internal/surface.ts` is where it showed: `MPBox` renders a `<div>` and reads one export from it, and was carrying `FADE` and `SHEET_MOTION` — the motion classes for the portalled surfaces, which an `MPBox` has none of — for 60% of its bundle. `scripts/annotate-pure.mjs` annotates the 24 of them, finding the array by matching brackets rather than by a pattern, since `[&>svg]:size-full` inside a string would end a naive one in the wrong place. It refuses to annotate an array with a call in it, so the day one has a side effect it is not quietly marked away.

### Added

- **`npm run measure`, and the build runs it.** `scripts/measure-bundle.mjs` bundles `dist/` with esbuild for six fixed scenarios and prints the gzipped size of each, the way `build-split-styles.mjs` already prints where the split stylesheet stops paying. The reason it is a bundler and not `unpackedSize` is 1.3.0: a package with no `sideEffects` field shipped a 62.3 kB bundle for an `MPBox`, and nothing about the published files said so. It also checks that `material-plus-ui/components/button` still costs what the barrel costs — the subpath exports are documented as insurance rather than as a recommendation, and that is only true while the two are the same.

### The measurements

esbuild, gzip, React and `@base-ui/react` external — this library's own contribution, measured on the same harness before and after. Rollup and webpack 5 were run beside it and agree within a few hundred bytes; webpack could not be run against 1.3.0 at all, which is the first entry above.

| Scenario        | 1.3.0   | 1.3.1   |
| --------------- | ------- | ------- |
| `MPBox`         | 0.5 kB  | 0.4 kB  |
| `MPButton`      | 3.4 kB  | 2.9 kB  |
| `MPTextField`   | 4.6 kB  | 4.1 kB  |
| `MPDatePicker`  | 10.0 kB | 9.6 kB  |
| Five components | 7.8 kB  | 7.3 kB  |
| Ten components  | 11.5 kB | 11.1 kB |
| Everything      | 64.2 kB | 64.1 kB |

The last row barely moves, and that is the shape of the whole release: nothing was removed, so a project using all of it pays what it paid. What changed is the floor — what a project pays before it has used anything in particular.

### What a server component still cannot do

Two things, and both of them are React's rules rather than this library's. **Hooks** — `useMPSnackbar`, `useMPLocale` — only run in a client component; the providers they belong to render from a server layout perfectly well. And **a callback cannot cross the boundary**: `<MPButton onClick={…} />` needs `"use client"` on the file that writes it, exactly as a bare `<input onChange>` does.

Consumers on a bare Rollup build will see `MODULE_LEVEL_DIRECTIVE` warnings, one per marked module. Every library that supports React Server Components produces them, and `onwarn` filters them. Vite, esbuild, webpack and Next.js emit nothing — checked, not assumed.

### Measured and left alone

- **The six motion tables in `internal/animate.ts`.** `ANIMATION_CLASS`, `DURATION_TOKEN` and `EASING_TOKEN` are keyed by effect, so an `MPAnimateFade` carries all six effects' rows and reads one. Split per effect it is 1.39 kB against 1.29 kB — 102 bytes, on seven components and on nothing else. The three tables are the one place the specification's reasoning is legible as a set: _five of the six decelerate_, _`grow` and `zoom` share a keyframe_. That reasoning is worth more than the hundred bytes.
- **`lucide-react`'s shared runtime**, which is 1.44 kB on every bundle that draws a glyph — `Icon`, `createLucideIcon`, the context and five case-conversion helpers, for an `MPButton` that draws one spinner. Vendoring the twenty-nine glyphs this library uses would take `MPButton` to 2.2 kB and remove the only runtime dependency there is. It would also mean shipping somebody else's artwork under their notice, and this library's position is that it draws no icons of its own.

## 1.3.0 (2026-08-27)

### Changed

- **The package now says `sideEffects`, and that one line is most of this release.** Without the field a bundler has to assume every module in a package might do something on import, so a barrel of `export *` — which is what `src/index.ts` is — pulls all 172 of them in and keeps whatever it cannot prove inert. Measured with esbuild and with Rollup, against React and `@base-ui/react` as externals: importing `MPBox`, which renders a `<div>` with three classes on it, produced a **203-module, 62.3 kB gzipped** bundle. So did importing `MPButton`. So did importing five components, and ten. Using one component out of ninety-four cost 86% of using all of them, which is another way of saying the library was not tree-shakeable at all and had been telling people it was. It is `["**/*.css"]` rather than `false`, because a bare `false` is what lets a bundler drop `import 'material-plus-ui/styles.css'` on the grounds that nothing reads its exports.
- **The build marks every `React.forwardRef` and `React.createContext` call pure** — 86 of them — and `terser.config.json` keeps the annotations rather than consuming them. `sideEffects` lets a bundler drop a whole module; this is what lets it drop one export from a module that has several. Nine files hold more than one component, and `MPTab` on its own went from 4.48 kB to 2.19 kB. It is `scripts/annotate-pure.mjs` over the emitted JavaScript rather than a comment in the source, because the annotation sits in the middle of a declaration line that is already 87 columns against a limit of 100 — written in `src/`, Prettier's answer to the overflow re-indents thirty component bodies, which is four thousand lines of diff and the blame history of every file it touches in exchange for a comment that says the same thing sixty-eight times. The script counts what it annotated against what the source declares and fails the build if the two disagree.
- **`resolveMessages` reads a registry instead of a built-in table, and the eighteen translations moved to `src/locales/`.** This is the breaking change. A component that says a single word — `MPButton` says _Loading_ — held a static import chain down to every string in every language, and a bundler cannot drop data that something imports: 32 kB of the 38 kB an `MPButton` bundle weighed was Thai, Hindi and sixteen others. The tables are modules now and nothing in the library imports them, so an application hands over the ones it speaks:

  ```ts
  import { registerMPMessages } from 'material-plus-ui';
  import { ko } from 'material-plus-ui/locales';

  registerMPMessages(ko);
  ```

  After that call `locale="ko"` resolves exactly as it did before, on a provider or on a component, because it is the same table. `registerMPMessages(...LOCALES)` restores the old behaviour in one line and costs exactly what the old behaviour cost. A tag nobody registered falls back to English the way an unsupported tag always has, so the failure mode of forgetting the line is English words and never a broken render — and `MPLocale` is a plain object, so a language this library does not ship is now a supported case rather than eighteen `labels` props.

### Added

- **`material-plus-ui/locales`, and `material-plus-ui/locales/<tag>` for one language at a time.** Named exports under their tags, hyphenated ones camel-cased (`zhHans`, `zhHant`), plus `LOCALES` for all eighteen as an array. English is about a kilobyte and each language after it about six hundred bytes gzipped.
- **`registerMPMessages`, `MPLocale` and `MPPartialMessages` are public.** The first is the whole of the new API; the other two are what you write a table of your own against. `aliases` on an `MPLocale` is how one table answers to several tags — it is what `zh-hant` uses for `zh-TW`, `zh-HK` and `zh-MO`, and it replaces the alias map that used to live in `internal/i18n.ts`.
- **`material-plus-ui/components/<name>` reaches a component without going through the barrel.** `import { MPButton } from 'material-plus-ui/components/button'` and the root import now produce byte-identical bundles, so this is insurance rather than a recommendation: a bundler that gets tree-shaking wrong, or a build that does not read `sideEffects`, has a path that cannot go wrong.
- **`material-plus-ui/styles/tokens.css` and a sheet per component.** `dist/styles.css` is unchanged and is still the right answer for most projects, but it is 109 kB whether a page renders one component or all of them, because Tailwind generates from a file scan and not from an import graph. The same rules are now also cut along the seams the components are: the tokens once, and `material-plus-ui/styles/button.css` beside it. One component is 3.8 kB gzipped against 15.6 kB for the whole sheet, five is 5.5 kB, ten is 8.0 kB. The sheets repeat each other's utilities, so the total climbs faster than the whole sheet's does and passes it at around thirty components — `npm run build` measures where that crossing is and prints it, so the figure in the docs cannot quietly stop being true.
- **`scripts/build-split-styles.mjs`, which fails the build rather than trusting itself.** A component's sheet is decided from its own import graph and from which `mp-` class names its files spell, both read out of the source. Two things are then checked: that every selector a scan of all the sources produces exists in some split sheet, and that no sheet reads a custom property neither it nor `tokens.css` defines. Both failures would otherwise be invisible — the component renders, the page is merely wrong — and neither can survive a build now.

### Notes on the measurements

Every figure above is gzip, from a real bundler over a real install, with React external. The marginal column is what this library costs on top of `@base-ui/react`; the total column adds Base UI in.

| Scenario        | Before  | After   | Before, with Base UI | After, with Base UI |
| --------------- | ------- | ------- | -------------------- | ------------------- |
| `MPBox`         | 62.3 kB | 0.5 kB  | 153.2 kB             | 2.3 kB              |
| `MPButton`      | 62.3 kB | 3.4 kB  | 153.3 kB             | 6.2 kB              |
| Five components | 63.1 kB | 7.4 kB  | 154.1 kB             | 33.6 kB             |
| Ten components  | 64.0 kB | 11.8 kB | 161.6 kB             | 81.1 kB             |
| All ninety-four | 72.4 kB | 64.3 kB | 202.1 kB             | 193.6 kB            |

The last row is the one that did not move much, and that is the point: nothing was removed. What changed is that the bill is now itemised.

## 1.2.0 (2026-08-23)

A pass over every component asking one question: when this thing changes, does it _change_, or does it cut? Fourteen places cut. The list below is what each of them does now, and the reasoning where the answer was not simply "add a transition".

### Fixed

- **`MPSelect`'s popup appeared with no animation at all.** Every other portalled surface in the library — the menu, the popover, the combobox's list, the dialog, the drawer, the overlay, the snackbar, the colour picker's panel — wears `FADE` from `internal/surface.ts`. The select's list was written with a positioner class of its own and never picked it up, so a control that is otherwise `MPTextField`'s shell wearing a chevron snapped its list onto the page while the field around it eased. Its positioner also takes `PORTAL_LAYER` now, which is the same three utilities plus the `mp-portal` hook every other portalled element carries for a host to hang its own reset off.
- **The keyboard cursor was invisible on the chosen row of `MPSelect` and `MPCombobox`.** Both wrote it as `data-highlighted:bg-mp-on-surface/8` straight on the row, where `MPMenu` — the same object with the same rows — puts an `MPStateLayer` under it. A background can only be replaced, and a chosen row already has one, so the highlight and `data-selected:bg-mp-secondary-container` were two `background-color` utilities of equal specificity with the winner decided by the order Tailwind sorted them in. The selected fill won: the list gave the arrow keys nothing to follow on the row it opens on. A layer composites instead — and, unlike a background, fades.
- **`MPSwitch`'s and `MPSegmentedButton`'s glyphs swapped with `display`, which cannot be animated at all.** The switch thumb travels its groove and changes size over 200ms and the glyph riding in it cut from a cross to a tick partway through; a segment's container and ink cross to the selected treatment over the same 200ms and the tick was stamped on top of that. Both pairs cross-fade on `opacity` now, stacked rather than laid out side by side, because for the length of a fade both are drawn. It also retires the hazard the old wrappers existed for: `hidden` and `MPIcon`'s own `inline-flex` are both display utilities, so which won came down to stylesheet order.
- **`MPColorPicker`'s tick jumped between swatches and its hover elevation had nothing to arrive on.** Choosing a swatch does not change the swatch, so the mark moving _is_ the feedback, and a mark that arrived in one frame read as a flicker. It is drawn on every swatch now and transparent on all but one — the only arrangement it can fade from, since a mark that is not in the DOM has nothing to travel out of.

### Changed

- **The checkbox's mark and the radio's dot grow in.** Both containers already eased and the half of the control that says what the answer _is_ was the half that snapped. They start from different places, and the difference is what each of them is: a tick is a stroke, and from zero it spends its first frames as a smudge too small to read as a tick, so it starts at 60%; a disc at any size is still a disc, so the dot grows out of the middle of the ring the way MD3 draws it. Base UI holds each indicator mounted until its transition finishes, which is what gives them an exit as well as an entrance.
- **A modal `MPDrawer` comes in from the edge it is attached to, and `MPDialog` grows as it fades.** These are the two surfaces that take the whole page, and they now share `SHEET_MOTION`: `medium4` on `emphasized-decelerate` arriving, `short4` on `emphasized-accelerate` leaving, which is MD3's own pair. The rule the other floating surfaces follow — a box full of text should not travel — is about opening _at_ something the reader is aiming for, and neither of these does. A drawer arrives at an edge, which is the one part of the window nobody is reading; a dialog arrives at nothing. What a bare fade cost them was direction: a left drawer and a right one were the same event, and a dialog that faded was indistinguishable from a dialog that had always been there. The dialog grows from 95% rather than the specification's 80%, because growing is the one transition here that resamples text and 80% of a 560dp sheet starts it 56px narrower than it ends. A full-screen dialog has no middle to grow out of and only fades.
- **`MPSnackbar` comes in from the edge its stack is pinned to.** The same argument, and the position is a fact the component already knew and was not saying while it mattered. One duration in both directions rather than the sheets' asymmetric pair: a snackbar often arrives behind two others, and an entrance long enough to read as an arrival makes a queue of three feel like it is buffering. The travel is `translate` rather than `transform`, because Base UI writes a swiped plate's offset onto the inline `transform` and a travel spelled the same way would be wiped out by the first flick.
- **`MPBottomNavigation`'s active indicator widens out of a circle** instead of one fill switching off as another switches on. The slot the glyph sits in cannot be the thing that grows — it is what holds the destination in place, and a row of five would shuffle sideways every time the reader moved between them — so the fill is a layer inside it, travelling between the slot's full width and a circle exactly as wide as the slot is tall. `width` rather than `scale-x`, because a `corner-full` circle stretched horizontally is an ellipse where one that widens is a pill at every frame.
- **An arriving `MPTabPanel` fades in.** The indicator slid under the labels and the content it points at cut, so the bar animated its own decoration and snapped the thing the decoration is for. There is no matching fade out, and that is structural: Base UI keeps a leaving panel in the layout until its transition finishes, so an exit would put both panels in the flow and grow the page to hold the pair before collapsing onto the new one.
- **`MPFloatingActionButton` travels between its two widths.** `extended` is a prop callers change, most often on a scroll, and MD3 draws the disc _becoming_ a stadium. There is no interpolating a definite width towards `auto`, so the distance is split: the button raises its own `min-width`, padding and gap, and the label's track is a single grid column travelling between `0fr` and `1fr` — which resolves to exactly the width the label needs at one end and to nothing at the other, rather than to a `max-width` guess large enough for the longest label anyone might pass. The label therefore stays in the DOM while the button is a disc, clipped to nothing; `aria-label` names the button either way, so nothing is announced twice.
- **`MPSlider`'s handle travels to a value it was not dragged to.** A slider moves in two ways and only one of them wants a transition: an arrow key or a click on the track is a jump, and a drag is the handle being held. Both parts travel on `short2` and both switch the transition off while the control is being dragged, or the handle would trail the pointer by its own duration.
- **`MPBadge` grows in and shrinks back out.** A count that simply appeared is a count nobody saw change, which is the whole event a badge exists to report. `visibility` stays as what hides it, joined by the scale rather than replaced by it: a badge parked at `opacity: 0` is still visible to find-on-page, and `visibility` happens to interpolate in exactly the shape this needs — visible from the first frame on the way in, visible until the last on the way out. That is what lets an `invisible` badge keep its count in the DOM, and it has to, because an element with nothing inside it has no size to shrink from.
- **Stepping a month turns the calendar's page.** A grid that swapped in place said which month it was in the header and nothing about which way the reader had gone, on a control whose whole job is moving between them. A keyframe rather than a transition, because what changed is the _content_ of six rows and there are no two states to interpolate; restarted by clearing `animation-name` rather than by keying the rows, because a `key` would unmount the cell a reader's focus is standing on in the middle of an arrow-key walk across a month boundary. Only the weeks turn — the weekday names above them are the same seven whatever month it is — so the header row and the weeks are separate `rowgroup`s now, which is the arrangement a table has anyway.
- **The reduced-motion answer is a decision per component, as it is for the `MPAnimate*` effects.** Where a travel would be the only thing lost, it is simply not declared — the drawer, the dialog and the snackbar ask for it with `motion-safe:` rather than negating it with `motion-reduce:`, which also avoids four pairs of classes of equal specificity settling their argument by stylesheet order. What is left in each case is exactly the fade those surfaces had before. The calendar's page turn is switched off in the same unlayered block the loading indicators use, leaving the swap. Controls that resize in place — a tick growing inside an 18dp box, a navigation pill widening, a FAB extending — are left alone, which is the line the switch thumb and the tab indicator already drew.

### Added

- **`--mp-sys-motion-duration-short2`, at MD3's own 100ms.** The first duration token here shorter than 200ms, added under the rule the token block states — the ones something in the library actually reads. Its one reader is an `MPSlider` handle catching up with a value the keyboard moved: an arrow key held down repeats faster than 200ms, so a handle on `short4` would never finish one step before the next began.

## 1.1.0 (2026-08-16)

### Fixed

- **A refused pointer capture took `MPPanes` down with it, and took the page's text selection with it.** `beginDrag` captured the pointer before anything else, and `setPointerCapture` throws `NotFoundError` for an id that is not an active pointer — which is reachable whenever the press is over before React's handler runs, and is what a synthesised `pointerdown` produces in Firefox every time. The exception abandoned the rest of the function: no `data-dragging`, no move listeners, and `document.body` left `user-select: none` with no drag on screen to explain why and no `end` coming to hand it back. The capture is attempted and allowed to fail now. It is genuinely load-bearing — the listeners are on the handle, so without it a boundary stops following a pointer that has moved off it — but a drag that only works over the handle is a smaller problem than a page nobody can select.

### Added

- **Eleven motion components: `MPAnimateFade`, `MPAnimateGrow`, `MPAnimateZoom`, `MPAnimateSlide`, `MPAnimateRotate`, `MPAnimateBlink`, `MPAnimateAppear`, `MPAnimateLighting`, `MPAnimateMarquee`, `MPAnimateHeadline` and `MPAnimateTyping`.** Every one of them is a wrapper around content that was already going to be there, and every duration and curve it does not take is a Material motion token rather than a number — `medium2` for an arrival, `short4` for an exit, `long2` for half a turn, the emphasized set for anything entering or leaving a screen. They share one set of props (`duration`, `delay`, `easing`, `repeat`, `alternate`, `paused`, and a `trigger` of `mount` / `visible` / `hover` / `manual`), so learning one is learning all eleven.
- **The machinery is `internal/animate.ts` and one `@keyframes` per effect in `src/styles.css`, and it generates no CSS.** Each effect runs from a from-state written entirely in `--_mp-anim-*` custom properties to the element's natural one; the module fills slots and the stylesheet decides what they mean. That is the split `accentSlots()` already makes for colour, forced by the same constraint — Tailwind only ever sees class names that appear literally in the source, so a class per duration would not survive the first prop. A duration nobody sets resolves to `var(--mp-sys-motion-duration-medium4)` rather than to `400ms`, because only one of those two moves when a page retunes its motion tokens.
- **`mode="out"` is free, and correct.** Because the from-state is in the keyframe rather than in a second class, running an effect backwards is `animation-direction: reverse` and nothing else — so all five of the effects that take a `mode` get an exit without a second rule. CSS mirrors the timing function along with the frames, which means an entrance eased on `emphasized-decelerate` comes back accelerating: exactly the pair MD3 asks for, supplied by the browser. `fill-mode: both` throughout, so a faded-out element stays out instead of snapping back the moment the animation ends, and an untriggered one sits paused on its own first frame without a second class to describe waiting.
- **`MPAnimateAppear` writes the animation onto the children themselves, never onto wrappers.** That is the whole design constraint rather than an implementation detail: a component that wrapped each child would break every layout that cares what its children are — flex and grid, `<ul>`/`<li>`, a table, a primitive that walks its own children — and would break them silently, the moment somebody added an animation to a list that had been fine. Only a bare string has no element to write onto, and that one gets a `<span>`. The stagger is per child, which makes grouping the way to opt part of a list out, and the travel is `0.75rem` — a settling rather than an entrance, because a long travel repeated down eight rows turns the block into something moving and leaves a reader chasing the row they wanted.
- **The four continuous effects each solve the problem that stops them being a keyframe and a number.** `MPAnimateLighting` animates a conic gradient's `from` angle — only animatable because the angle is a registered custom property with a type — rather than rotating the pseudo-element, since a rectangle spun about its centre is wider than the rectangle and swings its corners out on every quarter turn; the light sits at `z-index: -1` in an isolated stacking context so it reads as a glow escaping from under the edges rather than a border drawn around them. `MPAnimateMarquee` lays the content down twice and travels each copy its own length plus the gap, so there is no seam and nothing is measured — a percentage `translate` resolves against the element's own box. `MPAnimateHeadline` puts every line in the same grid cell and hides the ones not showing with `visibility` rather than `display`, so the reel is as large as its longest line from the first frame and never resizes the page under itself. `MPAnimateTyping` advances by grapheme rather than by code point, because `👩‍👩‍👧` is seven code points and a `한` typed on a Korean keyboard can be three.
- **A marquee takes a speed, not a duration.** A duration would put a strip of four logos and a strip of forty across the same box in the same time, with the long one arriving as a blur; pixels per second moves both at the pace of a reader. The strip is re-measured through a `ResizeObserver`, and the gap is read back off the computed style rather than parsed from the prop, since `'2rem'` is only a number once a font size has been resolved. `pauseOnHover` is on by default and is not decoration: content moving past a pointer cannot be clicked, and a link inside a marquee that never stops is a link nobody can follow.
- **Every effect answers `prefers-reduced-motion`, and each answer is a decision rather than "off".** The CSS ones are switched off wholesale in the stylesheet; the two written in JavaScript read the query through `useSyncExternalStore`, because a media query is an external store and reading it in an effect would start a typewriter for one render in front of a reader who asked not to see it. Where stopping would destroy the message the effect stops in a state that still carries it: a lighting arc becomes an even glow that still marks the live row, a marquee holds still because a row of logos that has stopped is still a row of logos, and a typewriter simply shows its text, caret included.
- **`MPAnimateBlink` is documented with the argument against it.** It is the one kind of motion this library otherwise refuses — a reduced-motion reader sees none of it, and `min={0}` makes the element genuinely absent for half of every cycle — so the docs say plainly that the pulse must never be the only thing carrying the message. Its cycle is symmetric (full, faint, full) so that however many times it runs it ends where it started; a keyframe that stopped at faint would leave the element permanently half drawn, which reads as a rendering fault rather than as an effect that has finished. It is also the only effect whose `repeat` defaults to `infinite`, because a single blink is a flicker and nobody asks for a flicker.
- **Two of them exist because a rotation and a zoom are each two gestures, and one of them is deliberately not built.** `MPAnimateRotate` takes `from` and `to`, so one component covers both an arrival that swings into place and an endless spin that starts where it ends — a second component for the second case would be the same keyframe under another name. `MPAnimateZoom` and `MPAnimateGrow` share one keyframe for the same reason, and differ only in distance and anchor: `0.4` about the centre against `0.8` about wherever a caller points. `MPAnimateZoom` has no `origin` on purpose, and writes the centre onto the element rather than leaving it to the stylesheet, because a zoom anchored to a corner _is_ a grow and an inherited `transform-origin` should not be able to quietly turn one into the other. What is not here is MD3's container transform: the specification's version morphs one element's bounds into another's, which needs both elements and a shared identity between them, and a wrapper can only honestly offer the half one component can do alone.
- **A Motion group in the docs and the gallery, and the shared `MPAnimateProps` rows in the props table.** Added with the first of the eleven and joined by the ten after it.
- **Seven components: `MPGrid`, `MPGridItem`, `MPContainer`, `MPTabs`, `MPFloatingActionButton`, `MPBottomNavigation` and `MPPagination`, plus `MPRating`.** Where MD3 defines the component the specification is followed to the number — a primary tab is 48dp with a rounded 3dp indicator under its label and 64dp once a glyph sits above it, a floating button is 56dp at `corner-large` under `primary-container`, a navigation bar is an 80dp `surface-container` with a 64×32dp `secondary-container` pill behind the glyph of the destination you are on, a container's margin is the specification's 16dp — and where it does not, the component is built out of the specification's own roles and this library's own ladders rather than out of sizes invented for it. This is the layout half of the library arriving at once: until now there was a sheet (`MPBox`) and a splitter (`MPPanes`) and nothing that answered "how wide is the page" or "how does the content divide itself up".
- **The grid changes at Material's window size classes, not at Tailwind's breakpoints.** `span`, `offset`, `columns` and the gutters all take either a value or a map keyed by `compact` / `medium` / `expanded` / `large` / `extra-large` — 0, 600, 840, 1200 and 1600dp, which is the axis MD3's layout grid is actually described along. Tailwind changes at 640/768/1024/1280, which is a different set of numbers for the same idea, and a grid reflowing at one set while the `md:` utility beside it reflows at the other is a layout that is subtly wrong at exactly one width and impossible to reason about at every other. Given two ladders the library takes the specification's, and documents how to line the other one up with it.
- **The column arithmetic is real CSS in `src/styles.css`, driven by inline `--_mp-*` slots.** A column is `(100% + gutter) * span / columns - gutter`, recomputed at four widths, on an element whose column count is declared on its **parent** — none of which Tailwind can spell, because it finds classes by scanning source text and `columns` is a number a caller picks at runtime. So the count and the two gutters are declared on the grid and _inherited_ by the items rather than passed through a React context, which is not a shortcut: a media query can change an inherited custom property without React hearing about it, so the count an item lays itself out against is always the one that is on screen. A context would have to re-render the subtree at every window class to say the same thing. Every slot cascades upward, so a `span` naming only `expanded` writes one custom property and not five.
- **`MPTabs` is MD3's `primary` and `secondary`, and there is no third.** They are not two levels of emphasis, they are two depths — primary tabs are the top level of a screen, secondary tabs divide the content inside one of its panels — and the specification separates them three ways, all of which are here: a 3dp rounded indicator under the label against a 2dp square one across the whole tab, the accent on the chosen label against the plain ink, and the glyph above the label against before it. A `variant` ladder like the buttons' would be an emphasis axis, and a tab bar has nothing to be emphatic about: it is the map of a screen, not an action on it. The indicator insets itself by exactly the tab's own inline padding, carried as one declaration on the root so the two cannot disagree.
- **There is no `orientation` on the tabs, and the omission is the specification's.** MD3 has no vertical tabs: a column of destinations down the side of a screen is a **navigation rail**, which is a different component with different behaviour — it switches what the _screen_ is rather than which panel of one is showing, and it is not one tab stop with arrow keys inside it. A tab bar turned on its side would claim the tab contract while looking like the other thing.
- **No speed dial on the floating button.** A FAB that fans out into three or four smaller ones is a Material **2** pattern and MD3 dropped it: the actions are unlabelled discs in the corner of the screen, they cover the content the reader was looking at, and a fan of buttons claiming `role="menu"` without the keyboard contract of one is worse for a keyboard reader than something that never claimed anything. Several actions behind one press belong in an `MPMenu` — which _is_ a menu, with the roving focus, the typeahead and the escape behaviour that word promises — opened from this button.
- **The floating button is the one component in the library whose corner rides the size ladder**, and it is on it because the specification puts it there: `corner-medium` on the 40dp small button, `corner-large` on the 56dp one, `corner-extra-large` on the 96dp large one. Everywhere else a radius is a statement about what kind of object something is rather than a size to taste and stays fixed across the rungs; here the _object_ changes with the rung, which is MD3's own reading of it — a 96dp disc and a 40dp one are two different pieces of furniture, not one at two sizes.
- **`MPBottomNavigation` is a `<nav>` of ordinary buttons and links, not a tab list.** A tab list owes a keyboard reader one tab stop for the whole set and arrow keys within it, and owes a screen reader a panel per tab; a navigation bar changes what the **page** is. Claiming the role without the behaviour is worse than never claiming it, because a reader will reach for arrow keys that do nothing. What is claimed instead is `aria-current="page"`, which is the honest statement. Its `labels` prop drops names from the pixels and never from the document — a glyph on its own has no accessible name at all. MD3 calls this the navigation bar; the export keeps the name the pattern is still known by, and the docs say so.
- **Neither the navigation bar nor the segmented button takes a `color`.** The active indicator is `secondary-container` because the specification says it is, and for the reason that component already gave: a mark saying _where you are_ is not an accent statement, and `primary` is what a screen reserves for the action it is about. A navigation bar does nothing.
- **`MPPagination` and `MPRating` are not in the specification, and are built out of it anyway.** What is Material about the pagination is everything around the decision — cells on the library's control-height ladder, the current page filled with the accent under its own ink, the state layer MD3 uses in place of a hover colour — and the row is pinned to a constant number of slots so that stepping from page 1 to page 2 does not relayout it under the pointer that just pressed one. A gap of exactly one page is filled with that page rather than with an ellipsis wider than the number it replaced. `getPageHref` turns the numbers into real links so a crawler can follow them, while `onPageChange` still cancels the navigation for a client-side router; the page being read and a spent stepper stay buttons, because neither is somewhere to go and `disabled` is not something an `<a>` can be.
- **The rating is a radio group of real inputs, one per choosable score.** A rating _is_ "exactly one of these", so the browser hands over everything a row of `<button>`s would have to reimplement: one tab stop for the set, the arrow keys within it, `aria-checked`, a value in a form submission and `required` validation. Each input is visually hidden under the half of a star it stands for, so a pointer presses a star and a keyboard presses a radio. `precision` bounds what can be _chosen_ and nothing else — a `4.3` is drawn as four stars and a third at every setting, because an average is not a choice and rounding it would be reporting a different number from the one the component was handed. The fraction is a clip over the star beside it rather than a transform, so nothing is scaled and it fills from the right under RTL with nothing being told to.
- **`readOnly` on the rating is the one in this library that does not drain the saturation.** It is not a control being held still: there are no inputs left at all, only a `role="img"` carrying the score as a sentence — twenty focusable radios on a page that was only reporting a number is twenty tab stops nobody asked for — and a row of grey stars would say the score itself was unavailable. `disabled` is the other thing and does drain it, exactly as on every other control.
- **The stars are not amber, and cannot be.** MD3 defines four accent families and a fifth colour hardcoded here would be one the token sheet has no name for, a theme has no way to change, and a page could not restyle — the only such colour in the library. A product whose stars must be gold sets `--mp-sys-color-tertiary` and asks for `color="tertiary"`, which is the answer this library gives everywhere else.
- **Two more message namespaces, `pagination` and `rating`,** in the same eighteen languages as the pickers, and `fillMessage` for the four strings that interpolate. Both components are read out and never drawn — what a page cell shows is a digit, what a stepper shows is a chevron, what a star shows is a shape — so every word they say is one only a screen reader hears, which is exactly why they belong in the table rather than in props. A row of nine cells whose caller had to supply nine names is a row of nine English names. The placeholders are named rather than positional, because the order of two numbers in a sentence is not the same in every language: English counts "page 3 of 20" and Turkish counts the total first.
- **`MPWindowClass`, `MPResponsive` and `MPPosition`** in the public type vocabulary. The first two are the grid's, and the third arrived under the rule the file states — an axis arrives when a _second_ component needs it, and the floating button and the navigation bar both pin themselves to an edge. It is CSS's own four values, because this is CSS's own question and a second spelling for `fixed` is a word a caller has to translate.
- **Three glyphs: the two double chevrons and a star.** The pager's jump-to-an-end steppers and the rating's mark, named in `src/constants/icons.ts` like every other glyph the library draws. The star is drawn as an outline and _filled_ by the component — lucide draws it `fill="none"` and a CSS `fill` outranks a presentation attribute — so one drawing covers both states rather than the set shipping two.

### Changed

- **The label floats.** Material's outlined text field starts with its label resting on the control's own line, at the control's own type scale, reading as the placeholder, and lifts it into the notch the moment there is something to make room for. This library drew it in the notch from the first paint — which was a deliberate choice, and the one place its field visibly disagreed with the specification it is built out of. All six notched shells now float it: `MPTextField`, `MPSelect`, `MPNumberField`, `MPCombobox`, `MPColorPicker` and the four pickers, each with a `floatingLabel` prop defaulting to `true`. `floatingLabel={false}` is the old drawing, and it is worth having for the one thing the default costs: a field with a label and one without sit at the same height only while the label is up.
- **A `startIcon` holds the label in the notch, and the `placeholder` waits its turn.** Two things cannot share one spot. A leading glyph is already standing where a resting label would be, so a control that has one keeps its label up — the same rule MUI's `InputLabel` follows for a start adornment, and the reason a picker's label stays in the notch unless `startIcon={null}` asks the calendar glyph away. The placeholder is withheld for as long as the label is resting in its place and comes back with focus, which is also when it is of any use: two greyed strings in one box is not a hint. `MPColorPicker` is the one exception in the other direction — its swatch is the value drawn rather than an affordance, so with no colour in the picker it comes down with the label and returns with it.
- **`startIcon={null}` on a picker now means no glyph.** The default was resolved with `??`, which cannot tell "not given" from "given `null`", so there was no way to ask the calendar or the clock away. It hangs off `undefined` alone now.

## 1.0.0 (2026-08-12)

### Fixed

- **`MPTextField`'s `onFormReset` was skipped for the one change an IME makes.** It is documented as running "before every change, ahead of `onChange`", and it did — from the `input` handler. But a committed composition reaches `onChange` down its own path, from `compositionend`, and browsers disagree on which of the two fires first: where the composition ends before the `input` event, `compositionend` was the only announcement the parent ever got, and it carried no reset with it. A form-level error a further edit had made stale therefore cleared itself for somebody typing `abc` and stayed on screen for somebody typing 안녕 — the callback's whole purpose, withheld from exactly the readers this library keeps a composition path for. `compositionend` now resets ahead of its change like every other route does.

- **A focus ring that arrived a fifth of a second late.** The text field's outline was transitioning its `border-width` from 1px to 2px, and an interpolated width is rounded to whole device pixels at paint — so the ring rendered as 1px for the whole animation and then jumped. Measured: the focus state itself landed in 4ms, `data-focused`, the label colour and the outline colour all changed at 4ms, and the width did not move until **197ms**. The width now snaps and only the colour eases, which puts the ring on screen at 5ms. Anything sub-pixel in extent should not be transitioned; that is the general lesson and it is written next to the rule.

### Changed

- **`CONTAINER_SURFACE` in `src/internal/surface.ts` is now the one container ladder.** `MPEmpty`, `MPList` and `MPTable` each carried their own copy of the five neutral surface roles a container paints itself at, and the copies had already drifted — two of them folded `text-mp-on-surface` into every row and the third did not. Nine components read it now. The ink is deliberately left out of the shared table: most callers want `on-surface` and say so once beside it, but a table sets its ink per cell, so a ladder that decided for them would be a ladder they had to undo. No class name, rendered attribute or prop changed.
- **`@keyframes mp-progress-segment-wave` is now `mp-wave`,** and serves `MPChatBubble`'s typing dots as well as `MPProgressBox`'s segments. The two differ only in speed and stagger, which is what the two classes set; a second keyframe saying the same thing is a second chance for them to drift. No class name changed, so no component changed with it.

- **The documentation's component groups are now `inputs`, `display` and `feedback`,** grouped by what a component _does_ rather than by what it looks like. `actions/` is gone — a button collects an intent the same way a field collects a value, and splitting the two put `MPButton` and `MPSegmentedButton` in a different section from the controls they sit beside in a form. `navigation/` is gone for the same reason: a breadcrumb and a link show something and nothing more, which is what `display` means. Every page moved; no URL outside `/components/` changed, and the pages themselves are unchanged apart from their cross-links.

- **The default source colour is a deep azure, `#00639b`, rather than Material's baseline purple.** A library defaulting to `#6750a4` makes a louder statement than it looks — purple is the one hue nobody arrives at by accident, so an application that has not chosen a colour ends up looking like it chose that one. The azure was picked for its chroma as much as its hue (0.118, against the baseline's 0.130), because every role takes its saturation from the seed and a more vivid blue pulls the whole scheme brighter than any reference Material palette. The tone table itself is unchanged and is still calibrated against the baseline palette.
- **`MPTextField`'s notched outline moved into `src/internal/FieldOutline.tsx`** and is now shared with `MPSelect` and `MPNumberField`. No prop, no class name and no rendered attribute changed; the outline gained `group-focus-within` alongside `group-data-focused`, so focus inside the shell — a number field's steppers, the password toggle — lights the ring too.
- **`--_mp-tone-primary` is now `--_mp-tone-accent`.** It was never the primary family's alone: MD3 reads all three source-derived palettes at the same tones. Private, and not a name to set — the supported way to disagree with a colour is still to set the role.
- **`MPTextField`'s `large` boolean is now `size`,** taking `xs | sm | md | lg | xl` at 32/40/56/64/72px. `md` is Material's own 56px and the default, so the ladder is centred rather than extended upward — nobody has to know the scale exists to be handed the specification's size.

### Added

- **The documentation site publishes an [`llms.txt`](https://llmstxt.org)** — `/llms.txt`, and `/ko/llms.txt` for the Korean docs. One Markdown file naming every page, linking it, and carrying the same one-line summary the page's `<meta description>` does, so a language model asked about this library reads the map instead of guessing a prop name. It is generated at build time from the sidebar, next to `robots.txt` and for the same reason: the sidebar is the only structure that already knows the reading order, the titles and the links at once, and a hand-kept list of sixty pages goes wrong the first week nobody remembers to touch it — wrong in the way that is hardest to notice, a component whose page still loads under a name it no longer has. The changelog page gained a `description` of its own with it, being the one page whose opening paragraph is not about the page but about whichever release is newest.
- **Ten components: `MPBox`, `MPCard`, `MPCollapsible`, `MPAccordion`, `MPCarousel`, `MPDrawer`, `MPPopover`, `MPChatBubble`, `MPPill` and `MPSpoiler`.** Where MD3 defines the component the specification is followed to the number — a card is `corner-medium` with `filled`, `elevated` and `outlined` as the specification's own three variants, a modal navigation drawer is `surface-container-low` at 360dp with `corner-large` on its free edge, a popover is the menu's `surface-container` at elevation 2 — and where it does not, the component is built out of the specification's own roles rather than out of sizes of the library's own. Four of them take a Base UI primitive underneath (`Collapsible`, `Accordion`, `Dialog`, `Popover`); the rest have no state to delegate.
- **`filled` on a container is neutral, and every container refuses `color`.** This is the one place the `variant` vocabulary means two things, and it is deliberate: on a component that _is_ the thing being coloured `filled` is the accent, and on a box holding somebody else's content it is MD3's own filled card — `surface-container-highest`. Dyeing a container dyes their content's background, so every link, field and button inside it would need an on-accent treatment of its own. `MPBox`, `MPCard`, `MPCollapsible`, `MPAccordion` and `MPCarousel`'s frame therefore take no `color` at all: a prop that reaches nothing is a prop that has to be supported forever.
- **`corner-large`, the sixth shape token.** The sheet said there was no `large` "because nothing reads one"; a drawer's free edge now does, which is MD3's own corner for a navigation drawer — 12px is barely a corner on a 360dp panel and 28px is the bottom sheet's, which is a different object. Both shape presets gain the rung.
- **Two more message namespaces, `chat` and `spoiler`,** in the same eighteen languages as the pickers. A chat bubble's five delivery marks are read out and never drawn, and a thread is a column of forty of them — a caller handing five words over per message would hand over the English ones. A spoiler's are the opposite and belong here for the opposite reason: they are the words _on the cover_, and a cover in a language the page is not in is a cover nobody reads.
- **`MPPill` and `MPChatBubble` are the library's own two shapes here, and neither is in the specification.** A pill is the state a page has that is not about any one control — a call in progress, an upload still going — which is neither a snackbar (it happened and left), an alert (it is in the flow) nor a badge (it counts something on a control). Its stadium corner is the one place a sheet in this library is allowed `corner-full`, because it is not a sheet lying on the page but an object hovering over it; opening its details moves the corner to `corner-extra-large`, because `corner-full` on a box six lines tall eats the first two words of every line. A chat bubble's tail is a cut corner rather than a drawn triangle, written as the logical corner so an Arabic thread squares the other one without being told.
- **Eight components: `MPAlert`, `MPIconButton`, `MPDatePicker`, `MPDateRangePicker`, `MPDateTimePicker`, `MPTimePicker`, `MPAspectRatio` and `MPPanes`.** The pickers are drawn on MD3's own docked date-picker numbers — a 40dp cell, a filled circle for the chosen day, an **outlined** one for today — and their trigger is `MPTextField`'s notched shell, so a date field in a form is the same object as the fields around it. `MPIconButton` adds almost nothing to `MPButton` on purpose: an icon-only button is already square and already `corner-full`, so the disc falls out of the button's own tokens, and what the component actually contributes is a **required** `label`.
- **A time picker made of columns rather than MD3's dial**, which is the largest deliberate departure in the library and is documented as one. A dial is a pointer control with no keyboard or screen-reader path, which is exactly why the specification also ships a separate "time input" mode for those readers — leaving a component with two implementations of one question, of which the accessible one is the one nobody sees. Columns answer both readers with one control, in the library's own shapes. The bounds are checked at the granularity of the column being drawn, so a `minTime` of 09:30 leaves the hour `9` available and greys out the minutes before it; the naive whole-instant check hides the 9 and makes half past nine unreachable.
- **`MPLocaleProvider`, and the localisation split behind it.** Month names, weekday initials, AM/PM, date order and which day the week starts on come from `Intl`, which speaks every language the platform does; the handful of words the platform has no opinion about — "Previous month", "Today", "Hour", "Dismiss" — come from a table in `src/internal/i18n.ts` translated into eighteen languages. A tag the table does not carry is therefore not a dead end: the calendar is still in that language and only those words fall back to English. `navigator.language` is deliberately never consulted, because a value that differs between the server rendering the markup and the browser hydrating it is a hydration mismatch in the one part of the page a reader is looking at.
- **No date library, and no typing into a picker's trigger.** The whole of the arithmetic is `Date` and lives in `src/internal/date.ts`; every name comes from `Intl`. Quietly adding `date-fns` — or worse, picking a side in the dayjs/luxon/Temporal argument on a consumer's behalf — would be a decision that was not this package's to make, and it still has one runtime dependency. Typing goes with it: parsing a date out of free text cannot be done honestly without such a library, and a field that understands `27/7/26` in one browser and not the next is worse than one that never claimed to. Every picker submits through a hidden input in the shape its native counterpart submits, in **local** time — `toISOString()` on a `Date` standing for 15 July in Seoul reports the 14th, which is the single most expensive bug a date picker can ship.
- **`MPWeekday`**, the only new entry in the public type vocabulary. It is `Date`'s numbering (`0` is Sunday) rather than CLDR's, because every calendar here is built out of `getDay()` and a second numbering would be a conversion at every comparison.
- **Eleven components: `MPHighlight`, `MPDialog`, `MPOverlay`, `MPSnackbar`, `MPProgressLinear`, `MPProgressCircular`, `MPProgressBox`, `MPColorPicker`, `MPCombobox`, `MPMenu` and `MPOtpField`.** Where MD3 defines the component the specification is followed to the number — a dialog is `surface-container-high` at `corner-extra-large` and elevation 3, a menu is `surface-container` at elevation 2 with 48dp rows, a snackbar is `inverse-surface` with its action in `inverse-primary`, a linear indicator is a 4dp groove and a circular one is a 48dp ring — and where it does not, the component is built out of the specification's own roles rather than out of sizes of the library's own.
- **The component is called `MPSnackbar`, not `MPToast`.** Material has a name for it and that is the name. "Toast" is Android's older, non-interactive notification — no action, not dismissible, not part of Material Design 3 — so a `Toast` here would be a different component wearing the name of one the specification still ships. It is a provider plus a `useMPSnackbar()` hook rather than a component to keep mounted, because what a caller has at the moment a message is warranted is a click handler, not a place in the tree.
- **`MPProgressBox` is the library's own third shape, and is not in the specification.** MD3 has a bar and a ring and stops there. A bar and a ring both say "this much is done" — a quantity a reader measures; a row of four segments says "this is step three", which is a quantity they count, and counting is faster than measuring for any number small enough to count. It is drawn out of the specification's own parts all the same, so a row of them sits in a Material page without announcing that it is extra.
- **Four more colour roles**, taking the sheet to twenty-nine: `surface` (read by an overlay's `solid` tone), `surface-container-high` (a dialog's sheet), `inverse-primary` (a snackbar's action) and `scrim`. `inverse-primary` is the accent palette read at the _other_ scheme's tone — which is not an approximation of MD3's role but the definition of it, so the two numbers behind it are the accent stops above and below, swapped. `scrim` is the one colour in the sheet that is the same in both schemes, because a scrim is not a surface that has to be legible against the page: it is the absence of the page.
- **`corner-extra-large` and elevation level 3.** Both are read by exactly one thing, the dialog, which is MD3's own answer for it: 28px is the loudest radius in the system, and a sheet that has taken the page is allowed to look like an object rather than like a panel. There is no `large` between `medium` and `extra-large`, because nothing reads one.
- **The first keyframes in the stylesheet**, and they all belong to the progress indicators. An indeterminate indicator is a _loop_, which is the one thing a utility cannot be. All of them stop under `prefers-reduced-motion` and rest on a **partial** frame rather than a full one — an indicator that has stopped must not read as an indicator that has finished.
- **`src/internal/color.ts`, a hundred lines of colour arithmetic written out rather than installed.** `MPColorPicker` is the only component that has to compute a colour rather than name one, and this is the whole of what it needs — three representations, the conversions between them, one parser and one formatter. HSV is the model the panel is drawn in and it never leaves: round-tripping through RGB would lose the hue of every greyscale colour, and the rail would snap to red the moment the pointer reached a corner. The package still has one runtime dependency.

- **Fifteen components: `MPTypography`, `MPDivider`, `MPTextLink`, `MPBlockquote`, `MPAvatar`, `MPBadge`, `MPChip`, `MPSkeleton`, `MPEmpty`, `MPList`, `MPTable`, `MPTimeline`, `MPBreadcrumb`, `MPShortcut` and `MPTooltip`.** Where MD3 defines the component the specification is followed to the number — a chip is 32dp at `corner-small`, a badge is `error` under `on-error`, a list row is 56dp, a data-table row is 52dp, a plain tooltip is `inverse-surface` at elevation 0 — and where it does not, the component is built out of the specification's own roles rather than out of sizes of the library's own. Four of them take no primitive underneath on purpose: a divider, a badge, a quote and a timeline have no state and no keyboard contract, and reaching for a widget primitive to draw one hands a consumer's plain markup the semantics of a widget.
- **`MPTypography` brings the display and headline half of the type scale.** Every `level` is one of MD3's own roles at the specification's size, leading, tracking **and weight** — which means the headings are weight 400, because Material's are. It is deliberately not on the size ladder: `MPSize` is a control ladder, and a paragraph has no height to pick from a scale.
- **`inverse-surface` and `inverse-on-surface`**, taking the colour sheet to twenty-five roles. The neutral palette read at the other end of the scheme, and read by exactly one thing — a plain tooltip, whose whole job is to be legible over content it was never designed against.
- **Eight more type roles** — `display-small`, `headline-large`/`-medium`/`-small`, `title-large`/`-small`, `label-medium`/`-small` — every one of them read by a component, none added in anticipation. `label-small` at 11px is the smallest role in the specification and is why a badge's count is legible at all.
- **`MPAlign`, `MPSide` and `MPCorner`** in `src/types.ts`. The first and last are logical (`start`/`end`, not `left`/`right`), because a divider's label and a badge's corner both move with the writing direction; `MPSide` is physical, because it is the axis a popup travels along and a tooltip above its trigger is above it in every language.
- **A shared `VISUALLY_HIDDEN`, and `SHEET_*` on the scale.** Five components now put a sentence where a mark stands — the name behind an avatar's initials, "opens in a new tab", `⌘` announced as Command — and four share one sheet padding ladder, because `md` has to mean 16px of padding on every sheet in the library.
- **Ten components: `MPButton`, `MPButtonGroup`, `MPSegmentedButton`, `MPSelect`, `MPNumberField`, `MPCheckbox`, `MPRadioGroup`, `MPSwitch`, `MPSlider` and `MPFilePicker`.** Each is drawn from Material Design 3's own component tokens and delegates its behaviour to a Base UI primitive, so what is written here is the surface: the colours per variant and state, the shape, the state layer, and the parts of a control that are always assembled by hand. Three of them — the select, the number field and the text field — now share one notched-outline shell, because a form where the quantity box is a different height or radius from the boxes around it is a form that looks assembled rather than designed.
- **Material's state layer, as a component.** MD3 does not express hover, focus and press as more colours; it puts a translucent wash of the _content_ colour over the container, 8% hovered and 10% focused or pressed. That is why it is an element rather than a `hover:bg-…`: a background can only be replaced, and replacing it is what makes a text button's hover state opaque and an outlined button's cover its own border. A layer composites, so whatever was underneath is still there.
- **Eighteen more colour roles**, taking the sheet to twenty-three — the four accent families in full (`on-*`, `*-container`, `on-*-container`), three surface containers, and `outline-variant`. The three source-derived families are one palette generation read three times, so there is one accent tone stop rather than three and a chroma multiplier per family. The container and `on-` roles pass the palette's chroma through unmodified and let the browser's own gamut mapping do the clipping, at constant lightness and hue, exactly as HCT's does — which lands twelve of them within 0.01 of Material's baseline scheme from one number each.
- `label-large` and `title-medium` on the type scale, `corner-small`/`medium`/`full` on the shape scale, elevation levels 1 and 2, and the `standard` easing curve. Every one of them is read by a component; none was added in anticipation.
- **`MPVariant` and `MPOrientation`** in `src/types.ts`, and a `variant` section in [Prop conventions](https://material-plus.cdget.com/design/prop-conventions). `variant` and `color` are shared vocabulary rather than members of `MPStyleProps`: a component takes them when they mean something on it, and neither means anything on a text field.
- **A size ladder, as the shared vocabulary.** `MPSize` and a new `MPStyleProps` bundle in `src/types.ts`. This is the one place the library knowingly goes beyond the specification: Material defines a single size per component because it describes a design system for whole products, and a component library gets used in places a design system does not plan for. A smaller control moves _down the Material type scale_ rather than to an interpolated size of the library's own, which is why `body-medium` joined the token sheet.
- **A `design/` section in the documentation, in both locales.** [Colour](https://material-plus.cdget.com/design/color) — the roles, the derivation, the ΔE against Material's reference palette, and the three levels of override — and [Prop conventions](https://material-plus.cdget.com/design/prop-conventions), which defines the shared vocabulary and the rule each axis follows.
- **The colour page's palette table reads its values back out of the browser.** Both schemes at once, from two off-screen probes. Half of what it documents is an `oklch(from …)` expression whose declared value tells a reader nothing, and a hardcoded table would go stale the first time `src/styles.css` was touched.
- **[All components](https://material-plus.cdget.com/components/) is a gallery of running previews** rather than a table of links. Each card holds the real component, in whichever scheme the frame's switch is set to.
- `--mp-sys-typescale-body-medium-*`, read by the field at `xs` and `sm`.

---

**Material UI is gone.** The library now implements Material Design 3 directly instead of building on `@mui/material`, which changes what it is: an implementation of the specification rather than an extension of somebody else's. Everything about how a component is used stays the same — no prop was renamed or removed — but the install, the theming and the styling model are all different.

### Breaking

- **Peer dependencies are one instead of three.** `@mui/material`, `@emotion/react` and `@emotion/styled` are no longer peers; `@base-ui/react` 1 is. It is a peer rather than a dependency because it carries React context — a consumer's `Form` has to be able to see a field from here, and that only works with one copy in the tree.
- **There is no provider, and no MUI theme is read.** A `ThemeProvider` around these components no longer does anything to them. Colours, type, shape and motion come from CSS custom properties instead, so theming moved from JavaScript to CSS.
- **`CssBaseline` is no longer assumed.** The library adds no page-level styling of any kind and no longer expects the page to have a reset: each component resets what it owns on the element it owns — a `<button>`'s browser-default background, a control's font, which a native form control does not inherit.
- `MPColor` is MD3's four accent roles (`primary`, `secondary`, `tertiary`, `error`) rather than Material UI's six. The specification's colour system has no `info`, `success` or `warning`, and offering them would promise roles the token sheet cannot derive.
- `--mp-duration` became `--mp-sys-motion-duration-short4`, and is 200ms rather than 250ms — MD3's `short4`, which is what a text field's label and outline transition on.

### Added

- **Theming from a single source colour.** `--mp-source-color` generates every colour role the way Material generates a scheme from a source colour. The tone stops are read off MD3's own baseline ref palette rather than chosen by eye: fed the baseline source, the derivation lands on the baseline scheme — `primary` and `error` on its exact hex in both schemes, the near-grey roles within a ΔE of 0.008, below anything visible. What the default source colour changes is the hue and chroma the ramp is applied to, never the ramp.
- **Coexistence with an existing Material setup.** Each role reads `--md-sys-color-*` before falling back to its own derivation, and the library never writes that namespace. A project running Material Web is picked up with no configuration. The full order is `--mp-sys-color-*` (an explicit override) → `--md-sys-color-*` (the page's own) → derived.
- **Dark mode with nothing to configure.** `prefers-color-scheme` is followed by default, and `data-mp-scheme="dark"` or `.dark` on any element drives it explicitly. Both schemes are the same tonal palettes read at different tones, which is how MD3 defines them — so a source colour moves light and dark together and there is no second set of values to keep in sync.
- **Scoped and runtime theming.** Every token is an ordinary inherited custom property, and the derived roles are declared on `*` rather than on `:root` so each element re-resolves them against whatever is in scope where it sits. A section with its own source colour works, a `.dark` on `<body>` works, and a colour a reader picks at runtime is an inline style with no re-render.

### Changed

- `MPTextField` is Base UI's `Field` plus the notch, the adornments and the password toggle. The notched outline is a `<legend>` interrupting a `<fieldset>`'s top border, which is a native behaviour, so the gap is sized to the label with no measuring in JavaScript. State styling reads the `data-focused`, `data-invalid` and `data-disabled` attributes Base UI emits, which keeps it in CSS.
- The IME composition handling — the reason the component exists — is unchanged.
- Token names follow MD3 (`primary`, `on-surface-variant`, `corner-extra-small`, `body-large`) rather than Material UI's palette model (`main`/`light`/`dark`/`contrastText`), which is a different and earlier colour system.
- Only the tokens a component actually reads exist. MD3 defines around fifty colour roles; an outlined text field reads five, and the rest are absent until something needs them.

### Removed

- No CSS-in-JS runtime. Styling is a stylesheet, so there is nothing to inject on render and no hydration pass for theme styles.

## 0.0.1 (2026-08-06)

The first release. Two components, and the scaffolding the rest will be built on.

### Added

- `MPTextField` — a Material UI text field that survives an IME. A controlled `<input>` is rendered from its `value`, and while an input method is composing the browser is holding a provisional string that has not been committed yet; writing `value` back over it in that moment throws the syllable away and jumps the caret. Anything the parent does in its `onChange` — trimming, upper-casing, validating, or simply re-rendering slowly — is enough to cause it. So the field stops rendering `value` for the duration of a composition and shows its own copy of what the element actually contains, while `onChange` keeps firing for every keystroke. This is why `value` and `onChange` are a plain string rather than an event: an event's `target` is the element mid-composition, which is precisely the value that must not be trusted.
- **The field is `@mui/material`'s own `OutlinedInput`,** so the notched outline, the palette, the sizes and every theme override still belong to MUI. What is added around it is the assembly a form needs anyway: `label`, `errorMessage` as helper text, `startIcon` as a leading adornment, and a password reveal toggle that cancels both `mousedown` and `mouseup` so the caret stays where it was left. `rows` renders a `<textarea>`; `resizable` lets the reader drag it taller, vertically only. `onSubmit` fires on Enter, and Enter is then swallowed on a single-line field so a surrounding form is not also submitted natively — `disableEnterKey` extends that to a multiline field. `large` is MUI's `medium` and the default is its `small`: two heights rather than a ladder, because those are the two `@mui/material` has.
- `MPIcon` — a glyph at a known size in a known colour, from whichever icon set you use. The glyph is the `icon` prop rather than `children`, which is what lets the component set the size and colour of an element it did not draw. Two forms are accepted: a **component**, which is what `lucide-react` and most sets export and what allows the size and colour to be passed _into_ the glyph, and an **element**, already drawn and scaled by the box it is laid into. The two are told apart with `React.isValidElement` alone, so the `forwardRef` objects modern icon sets actually export are correctly treated as components.
- **`size` is a length, not a ladder.** A number is CSS pixels and a string is any CSS length. Icon sets are drawn on a pixel grid at specific sizes, and a wrapper inventing five steps of its own would be a second opinion about a decision the set already made; left unset, the glyph draws at whatever size it was authored at. The length is written to the box _and_ to its `font-size`, which is what makes an `<svg>` carrying its own `width` and an `<svg>` sized in `em` come out the same. `color` behaves the same way — unset, the icon inherits whatever it sits in, and the glyph is told `currentColor` so a set with a hardcoded default follows too. Without a `label` the icon is `aria-hidden` and leaves the accessibility tree; with one it is a named `role="img"`.
- **One file imports `lucide-react`,** and it is `src/constants/icons.ts`. Every glyph the library draws is named there under the role it plays (`visibility`) rather than the drawing lucide happens to ship (`Eye`), so the artwork can be swapped without touching a component. It leaves by two doors: named exports, which the library's own components use and which a bundler can tree-shake one at a time, and `ICONS`, a name-keyed table for an application that wants one — an object literal cannot be shaken property by property, so importing it pulls in the whole set, and that trade is the reason the components never reach for it.

### Package

- `@mui/material` 6 through 9, `@emotion/react`, `@emotion/styled`, `react` and `react-dom` 18 or 19 are peer dependencies — the copy already in your project is the copy that is used, so there is never a second MUI in the bundle or a second theme in the tree. Only MUI 9 is exercised in CI.
- `lucide-react` is the one runtime dependency.
- ESM only, TypeScript declarations included. Every component compiles to its own module, so what is not imported is not shipped.
- Four entry points besides the barrel: `material-plus-ui/types`, `material-plus-ui/constants/icons`, `material-plus-ui/styles.css` and `material-plus-ui/tailwind.css`.

### Styles

- **The stylesheet carries no reset, on either path.** Tailwind's Preflight is a page reset and every project using this library already has one in `CssBaseline` — and the two disagree visibly, since Preflight flattens the heading sizes, list markers and link colours MUI's typography sets up, and its `border: 0 solid` restyles every `@mui/material` component on the page rather than only the ones from here. Nothing in this library depends on Preflight.
- `material-plus-ui/styles.css` is finished CSS for a project with no Tailwind of its own; `material-plus-ui/tailwind.css` is the token sheet for a project that has it. Both carry the `@source '.'` that registers the package's compiled files, so a consumer never writes an `@source` whose correctness would depend on where their own CSS file sits.

### Documentation

- A VitePress site in English and Korean at [material-plus.cdget.com](https://material-plus.cdget.com), with live previews that are the components running in the page rather than screenshots. Each preview carries a theme switch of its own, so a component can be read in the theme the page is not in.
- A page per component with its full props table, a getting-started guide covering the peer dependencies and both stylesheet paths, and a component index.

### Testing

- Every component carries its own tests, run in a real browser rather than a DOM emulator — Material UI measures real layout, and a composition cannot be simulated by a synthetic helper. The suite drives genuine `compositionstart` / `compositionupdate` / `compositionend` events through the field and asserts on what the element is actually showing.
- CI runs them across Chromium, Firefox and WebKit on Ubuntu, Windows and macOS, alongside lint, formatting and three separate typecheck passes for `src/`, `test/` and `docs/`.
