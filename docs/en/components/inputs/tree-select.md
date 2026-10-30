---
title: MPTreeSelect
order: 17
---

# MPTreeSelect

<p class="mp-lede">A value chosen from a tree rather than from a list. The gap between a select and a tree view: a hierarchy that folds away behind a field.</p>

<Demo src="tree-select/hero" :minHeight="420" />

::: fw react

```tsx
import { MPTreeSelect } from 'material-plus-ui';

<MPTreeSelect
  label="Region"
  searchable
  items={[
    {
      value: 'asia',
      label: 'Asia',
      children: [{ value: 'seoul', label: 'Seoul' }]
    }
  ]}
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTreeSelect(
  label: const Text('Region'),
  searchable: true,
  items: const <MPTreeSelectItem>[
    MPTreeSelectItem(
      value: 'asia',
      label: Text('Asia'),
      children: <MPTreeSelectItem>[MPTreeSelectItem(value: 'seoul', label: Text('Seoul'))],
    ),
  ],
  value: regions,
  onChanged: (List<Object> next) => setState(() => regions = next),
);
```

:::

## Props

<PropsTable name="MPTreeSelect" />

::: fw flutter

### `items`

<PropsTable name="MPTreeSelectItem" />

The value is always a list, one entry long unless `multiple`. Given, the select is controlled; left out, it keeps its own, starting at `initialValue`. What does not carry across from the React package is in [differences from the React build](#differences-from-the-react-build).

:::

## Why not a select with indented options

Because indentation in a flat list is a picture of a hierarchy rather than the thing itself. Nothing folds, so a taxonomy of two hundred nodes arrives two hundred rows long; nothing says which rows belong to the one above them once you have scrolled past it; and there is no way to say that a row groups the rows under it without being one of them.

[MPSelect](select) is the right control for a list of answers. This is the one for answers that live somewhere.

## Branches are not answers

`selectableBranches` is off by default, because that is the shape most of these trees have: the branches are the taxonomy and the leaves are the answers. A "Europe" that can be chosen alongside "France" is usually a data model nobody meant — and the day it _is_ meant, turning one prop on says so.

An item's own `selectable` overrules the rule either way, which is how a tree with exactly one selectable branch states it.

A branch that cannot be chosen is **not a disabled row**. It looks like every other row, it takes focus, and it opens and shuts — a taxonomy whose branches do not open is a list with extra steps. What it does not do is answer: its press is intercepted before the tree sees it, so pressing "Europe" opens Europe and leaves the "France" you had chosen exactly where it was.

## A search keeps the ancestors

`searchable` puts a field above the tree. What it filters to is every match **and every ancestor of one** — filtered to bare matches, a tree is a list, and a list of leaves is exactly what a tree was chosen over. "Seoul" under nothing at all does not say which Seoul, or which taxonomy it came from.

Two rules follow from the same reasoning:

- **A node that matches keeps all of its children**, not only the ones that matched. Having found the branch the reader asked for, hiding what is inside it is the opposite of helpful.
- **Every branch the filter kept is opened.** A match folded inside a shut parent is a match the reader was not shown.

While a search is on, the tree's open branches are the search's answer rather than the reader's, so `onExpandedChange` is quiet. Clearing the field — or shutting the popup, which clears it — gives the reader's own back.

::: fw react

Matching is [MPCombobox](combobox)'s: Base UI's collator, in the language of `locale`, which leaves case, accents and punctuation out of the comparison — "malaga" finds "Málaga" and "saint etienne" finds "Saint-Étienne". `searchLabel` is what a node is matched against when its `label` is not a plain string.

:::

::: fw flutter

Matching is [MPCombobox](combobox)'s: a node stays while its text contains the query, with case set aside. Accents and punctuation are not folded — Dart has no collator and this package has no dependencies — so "malaga" does not find "Málaga"; give such a node a `searchLabel` that spells it both ways. `searchLabel` is also what a node is matched against when its `label` is not a `Text`.

:::

The field's own word is [MPTransfer](transfer)'s "Search", which is the same field doing the same job — one more spelling of it would be one more thing to translate in eighteen locales, and one more chance for the two to disagree.

## What the trigger writes

The chosen labels, comma-joined. `format` replaces that with anything else, and a multi-select of a hundred nodes is the case it exists for.

::: fw react

``format={(chosen) => `${chosen.length} chosen`}`` says more in less room than the ninety-nine labels that would not have fitted.

:::

::: fw flutter

`format: (List<MPTreeSelectItem> chosen) => '${chosen.length} chosen'` says more in less room than the ninety-nine labels that would not have fitted. It returns a `String`, which is also what a screen reader reads as the trigger's value.

:::

## `name`

::: fw react

One `<input type="hidden">` per value, all under the same name, so a form reads a multi-select as a repeated field. That is the shape `FormData.getAll` expects and the one a select with `multiple` already submits.

:::

::: fw flutter

Inside an `MPForm`, the list of values is filed under `name`, a required select holding nothing holds the submit back and takes the focus, and an error the form hands back under that name shows under the trigger.

## Accessibility

- The trigger is one button node, named by the label in the notch, carrying what the trigger writes as its value and saying whether the popup is expanded.
- The focus goes into the popup as it opens: into the search field when there is one, and the down arrow goes on from there into the tree; otherwise into the tree itself.
- The tree is one focus stop. Up and down walk the rows that show, right opens a branch and then steps into it, left shuts it and then steps out to its parent, Home and End go to the ends, and Enter or Space presses the row. The ring is drawn inside the row the keys are on.
- Each row says whether it is chosen and, for a branch, whether it is expanded. A disabled row says it is unavailable.
- Escape or a press outside closes the popup and hands the focus back to the trigger, and Tab out of the popup closes it too.

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| `value` (`value \| value[] \| null`) | `value` (`List<Object>?`) | Always a list, which is what `onValueChange` already hands back. `null` makes the select keep its own. |
| `onValueChange` | `onChanged` | Flutter's name for a plain change. `onExpandedChange` and `onOpenChange` keep theirs. |
| `defaultValue`, `defaultExpanded`, `defaultOpen` | `initialValue`, `initialExpanded`, `initialOpen` | Flutter's names. |
| `format` (returns `ReactNode`) | `format` (returns `String`) | The trigger's words are also its value for a screen reader, and only a string can be both. |
| The collator's match | Case set aside, accents kept | Dart has no collator and this package has no dependencies. |
| `color` | — | Deprecated in React, with no visible effect. |
| `labels` (`Partial<MPPickerLabels>`) | `labels` (`Map<String, String>?`) | The `clear` key, as a map. |
| `id`, `className`, `style`, `classNames` | — | There is nothing to pass them through to. |
| `onKeyDown`, `onKeyUp`, `onFocus`, `onBlur` | `onKeyEvent`, `onFocusChange` | One callback each. |
| — | `semanticLabel`, `focusNode`, `autofocus` | A name for a select with no visible label, and the trigger's focus from outside. |

The tree's rows are drawn by the select itself: the row heights, the indent, the arrow, the stadium tint of a chosen row and the inset ring are the React tree view's.

:::
