---
title: A2UI catalog
order: 4
---

# A2UI catalog

<p class="mp-lede">An agent describes an interface, and Material Plus draws it. <a href="https://a2ui.org">A2UI</a> is a protocol for exactly that: the agent sends JSON naming components from a <em>catalog</em>, a renderer resolves it on the client, and <code>material-plus-ui/a2ui</code> is that catalog implemented as Material Design 3.</p>

The point of a catalog is that the agent never writes markup. It writes `{ "component": "Button", "variant": "primary" }`, and what that draws is the client's decision — so the same agent renders as Material here, and as something else in an application that registered a different catalog. Nothing in the payload can reach past the vocabulary the catalog declares.

There are two catalogs here. `mpA2uiCatalog` implements A2UI's own **basic catalog**, all eighteen components, under the basic catalog's own id — so an agent already targeting it needs no change. `mpA2uiExtendedCatalog` is those eighteen plus five of this library's own, under an id of ours, for the surfaces the basic vocabulary cannot express: a table, three charts and a figure.

## Install

The protocol's SDK is two packages, and this library declares both as optional peer dependencies — install them alongside it.

```bash
npm install material-plus-ui @a2ui/react @a2ui/web_core
```

They are optional because they are substantial: Lit, signals, Zod, a date library and a Markdown parser arrive with them, against the two runtime dependencies the rest of this package has. Nothing outside this subpath imports either one, so a project that renders no agent interfaces downloads none of it.

What it costs a project that does is measured in the build, beside every other figure in this documentation:

| Bundle                  | This library | With the SDK |
| ----------------------- | ------------ | ------------ |
| `mpA2uiCatalog`         | 38.9 kB      | 77.3 kB      |
| `mpA2uiExtendedCatalog` | 60.6 kB      | 98.9 kB      |

Gzipped, with React and Base UI external. The difference between the two rows is the data table and the three charts, which is why the basic catalog is its own export rather than a subset of the other: import the one you register and the rest is dropped.

## Render a surface

```tsx
import { A2uiSurface } from '@a2ui/react/v0_9';
import { MessageProcessor } from '@a2ui/web_core/v0_9';
import { mpA2uiCatalog } from 'material-plus-ui/a2ui';
import 'material-plus-ui/styles.css';

const processor = new MessageProcessor([mpA2uiCatalog], (action) => {
  // What the reader did, on its way back to the agent.
  void send(action);
});

processor.processMessages(messagesFromTheAgent);

function Surfaces() {
  const surfaces = Array.from(processor.model.surfacesMap.values());

  return surfaces.map((surface) => <A2uiSurface key={surface.id} surface={surface} />);
}
```

Three things are worth naming in that snippet. `mpA2uiCatalog` is what decides how the payload is drawn. The second argument to `MessageProcessor` is where a press, a keystroke or a choice leaves for the agent. And `material-plus-ui/styles.css` is the only stylesheet involved — the catalog adds no CSS of its own, because it draws with components this library already styles.

The catalog id the agent has to send is exported, so it does not have to be retyped on either side:

```ts
import { A2UI_BASIC_CATALOG_ID } from 'material-plus-ui/a2ui';
// 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json'
```

A client announces the same string in `supportedCatalogIds`, and `processor.getClientCapabilities()` produces that for you.

## What each component draws

| A2UI | Drawn as | Notes |
| --- | --- | --- |
| `Text` | `MPTypography` | `h1`–`h5` are the type scale's headings, `caption` its small print |
| `Image` | `MPImage` | `variant` is a box; a loading and an error state come with it |
| `Icon` | `MPIcon` | The protocol's 59 names, mapped to lucide glyphs |
| `Video` | `<video controls>` | The browser's player, with Material's corner |
| `AudioPlayer` | `<audio controls>` | The same, with the description drawn above it |
| `Row`, `Column` | `MPFlex` | An 8px gap, which the agent cannot set |
| `List` | `MPFlex` as `<ul>` / `<ol>` | A real list element, and `<li>` per child |
| `Card` | `MPCard` | One child, on a sheet |
| `Tabs` | `MPTabs` | Keyed by child id, so a streamed payload can add a tab |
| `Modal` | `MPDialog` | Scrim, focus trap, Escape, focus restored |
| `Divider` | `MPDivider` | Both axes |
| `Button` | `MPButton` | `primary` filled, `default` outlined, `borderless` text |
| `TextField` | `MPTextField`, `MPNumberField` | `number` is the numeric field, with steppers |
| `CheckBox` | `MPCheckbox` | Label tied to the box |
| `ChoicePicker` | `MPCombobox`, `MPRadioGroup`, `MPCheckbox`, `MPChip` | See below |
| `Slider` | `MPSlider` | The value is always shown |
| `DateTimeInput` | `MPDatePicker`, `MPTimePicker`, `MPDateTimePicker` | Chosen by the two switches |

Every component also carries the protocol's two shared props. `weight` becomes a flex share inside a `Row` or a `Column`, and `accessibility` becomes the element's accessible name and its `title` — except on a labelled control, where the payload's own `label` is what the reader sees and an `aria-label` beside it would replace the visible label with an invisible one.

### ChoicePicker is four controls

The protocol describes one component along three axes — one choice or several, boxes or chips, filterable or not — and Material has a different control for most of the combinations:

- **Filterable** is `MPCombobox`, single or multiple. Filtering is a control of its own in Material rather than a text box above a list: the field belongs to the list, it announces its matches, its empty state is already translated, and a long list does not have to be on the page to be searched.
- **One choice, boxes** is `MPRadioGroup`, which is what "exactly one of these" means to a screen reader, and brings arrow-key movement with it.
- **Anything else** is an `MPFieldset` of checkboxes, or of chips when the agent asked for chips. The legend is what ties the group together.

### Dates keep their day

`DateTimeInput` carries ISO 8601 strings and every picker here works in `Date`, so the two are converted at that boundary — by hand, rather than through `new Date(value)`. The reason is the shape an agent sends most: `new Date('2026-03-01')` is midnight in Greenwich, which is the 28th of February anywhere west of it, and a calendar that opens on the wrong day is a bug nobody can explain. The value is written back at the precision that was asked for, as a local wall clock, so reading it and writing it never moves it.

### Markdown is off until you turn it on

The specification says `body` text may carry simple Markdown. Rendering Markdown means turning a string an agent wrote into HTML, and this library ships no parser and no sanitizer. So the protocol's own arrangement is used: configure a renderer through `@a2ui/react`'s Markdown context — `@a2ui/markdown-it`, or your own — and formatted text renders. With none configured, an agent's string is drawn as the characters it contains, `**like this**`.

That is the safe default rather than the tidy one. A renderer's contract is that it must sanitize what it returns, and until there is one to hold to that, nothing is treated as HTML.

## What the agent can and cannot do

A surface is JSON from a language model, so the boundary is worth stating plainly.

- **The catalog is the allowlist.** A component name the registered catalog does not hold never resolves, and no payload can reach a component of yours unless you put it there.
- **Props are validated against the schemas** by the SDK's binder before anything is drawn, so a malformed surface is refused rather than rendered halfway.
- **Text is text**, unless you configured a Markdown renderer, as above.
- **URLs are the agent's.** `Image`, `Video` and `AudioPlayer` load what the payload names, so a surface from an agent you do not control belongs behind a Content Security Policy that says where media may come from.

## This library's own catalog

Five components the basic vocabulary has no way to describe, which is what an agent reporting numbers needs first:

| Component | Drawn as | For |
| --- | --- | --- |
| `DataTable` | `MPDataTable` | Rows and columns, with sorting, searching, paging and selection |
| `BarChart` | `MPBarChart` | A value across categories, stacked or side by side |
| `LineChart` | `MPLineChart` | A value over a sequence, with a curve that is a claim about the data |
| `PieChart` | `MPPieChart` | Parts of one whole, as a pie, a donut or a half |
| `Statistic` | `MPStatistic` | One figure, with what it is and how it has changed |

```tsx
import { mpA2uiCatalog, mpA2uiExtendedCatalog } from 'material-plus-ui/a2ui';

const processor = new MessageProcessor([mpA2uiCatalog, mpA2uiExtendedCatalog]);
```

Register both and the agent chooses per surface: the basic id for anything another renderer might also have to draw, and `MP_A2UI_CATALOG_ID` when the surface is a table or a chart. Its schema is published at that id — [material-plus.cdget.com/a2ui/v0_9/catalog.json](https://material-plus.cdget.com/a2ui/v0_9/catalog.json) — generated from the same Zod schemas the renderer enforces, so the description an agent reads and the contract a payload is checked against cannot drift apart.

### The data lives in the data model

A table's `rows` and a chart's `series` take a literal array or a path, like every other value in the protocol:

```json
{
  "id": "sales",
  "component": "BarChart",
  "series": { "path": "/monthly" },
  "categories": ["Jan", "Feb", "Mar"],
  "label": "Orders by month"
}
```

Bound to a path, the numbers arrive — and keep arriving — without the chart being resent. That is also the case worth knowing about: a path is resolved rather than validated. The schema checked the _binding_, and what comes back is whatever the data model holds, which may be half-written or not what the agent intended. So a value that is not a number is a gap, a series that is not a list is an empty chart, and a cell holding an object is written out as JSON rather than taking the surface down.

### What is deliberately not there

No per-row action. An A2UI action carries a context resolved from data paths when it fires, which cannot say _which_ row was pressed — a row callback would be one that could not report what it happened to. Selection says it instead: bind `selectedKeys`, and the reader's choice is in the data model for the next message to read.

No `Intl` options, no cell renderers, no column accessors. Those are the props that make these components flexible in a page and they are functions, so an agent has no way to send one. What replaces them is a narrower question — `align`, `compact`, `curve` — that an agent can answer from JSON.

## Your own catalog

A project that wants its own vocabulary — its own components, its own names — needs an id of its own, because that is a different contract. `createMPA2uiCatalog` is where that starts:

```ts
import { createMPA2uiCatalog } from 'material-plus-ui/a2ui';

const catalog = createMPA2uiCatalog({
  id: 'https://example.com/catalogs/orders/v1/catalog.json',
  components: [OrderTable]
});
```

The eighteen come along, and a name given twice is the later one — so passing an implementation called `Button` replaces the one here without rebuilding the list. Pass `MP_A2UI_EXTENDED_COMPONENTS` as well to start from all twenty-three. The individual implementations are exported too (`MPA2uiButton`, `MPA2uiText`, and so on), along with the five schemas (`DataTableApi`, `BarChartApi`, …), for a catalog assembled by hand.

## Where this stops

Twenty-three components of a hundred and thirty. The command palette, the calendar, the tour, the animations and the rest are not reachable from a payload, because an agent can only ask for what a catalog names — and a component becomes nameable by being given a schema an agent can fill in from JSON alone, which is a decision per component rather than a switch.

The protocol is also young: v0.9.1 is current, v1.0 is a candidate, and the SDK is at 0.11. This subpath targets v0.9 and will follow the breaking changes the protocol makes; the components it draws with will not move underneath it.
