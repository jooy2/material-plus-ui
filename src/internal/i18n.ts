/**
 * The words the library says on its own behalf.
 *
 * Almost nothing in Material Plus writes text a reader sees — a button says
 * whatever it was handed, a dialog's title is the caller's. The exceptions are
 * the strings a component has to invent because there is nowhere else for them
 * to come from: the name on a calendar's back arrow, the word on the button that
 * empties a picker, the label a screen reader hears for a column of minutes.
 *
 * Those are collected here rather than defaulted inside each component, because
 * they are a *set*. A product in Korean does not want four pickers each
 * defaulting to English and each needing eighteen override props; and the next
 * component that needs a word should get it from the same place rather than
 * starting a second table beside this one.
 *
 * What is *not* in here is anything `Intl` already knows. Month names, weekday
 * names, AM/PM and number formats come from the platform, which speaks more
 * languages than this file ever will — see `internal/date.ts`. This is only for
 * the words the platform has no opinion about.
 *
 * Every component that reads this takes a `locale` and an override prop for the
 * strings themselves, so an unsupported language is never a dead end: `locale`
 * gets you a translation, `MPLocaleProvider` gets you one for the whole
 * application at once, and the prop gets you one for anything else.
 *
 * ## Where the words themselves are
 *
 * Not here. This file is the shape of the table, the registry a translation
 * arrives through, and the merge — no strings.
 *
 * The eighteen translations live under `src/locales/`, and nothing in the
 * library imports them. They used to be here, and being here is what made them
 * cost something: a component that says one word — `MPButton` says *Loading* —
 * held a static import chain down to a table of every string in every language,
 * and a bundler cannot drop data that something imports. Twenty kilobytes, on
 * every consumer, for a word. So the table arrives from the outside instead:
 * `registerMPMessages` below is how, `material-plus-ui/locales` is where from,
 * and the only thing that changed for a reader is that the application now names
 * the languages it speaks. Once it has, `locale="ko"` resolves through exactly
 * the path it always did.
 *
 * English left too, for the same reason one step smaller. It is thirteen modules
 * under `internal/messages/`, one per namespace, because a bundler that can drop
 * a module it can also drop an export — and cannot drop a property. Held as one
 * object, English was 1.75 kB that every component carried whole: `MPButton`
 * shipped the calendar's eighteen strings to say *Loading*. `resolveNamespace`
 * is handed the namespace it should merge, so a component pays for the words it
 * speaks and no others.
 *
 * The public surface is `registerMPMessages`, `MPLocaleProvider` and the
 * per-component `labels` props; `resolveNamespace` and `fillMessage` stay
 * internal.
 */

/**
 * One namespace per component, rather than one flat list of keys.
 *
 * A namespace is what makes a partial translation possible: a locale supplies
 * whatever it has and the rest falls back to English one namespace at a time, so
 * adding a namespace here does not silently blank the strings in every language
 * that has not caught up with it yet.
 */
export interface MPMessages {
  /**
   * The handful of words that are not any one component's.
   *
   * A namespace for the words rather than one per component that says them,
   * because they are the same word: the × on a dialog, on a drawer, on a
   * popover and on a snackbar is *close* four times, and four namespaces would
   * be four chances for a translation to disagree with itself about it.
   *
   * Every one of these is drawn as a glyph and read out as a word, which is why
   * they belong in this table at all — see the note at the top of the file. The
   * components that use them each keep their own override prop for the case
   * where a particular × means something more specific than "close".
   */
  common: {
    /** The × in the corner of anything that can be dismissed. */
    close: string;
    /** The × that empties a control without closing it. */
    clear: string;
    /** The chevron that opens a list. */
    open: string;
    /** The × that takes one thing out of a set — a chip, a file, a tag. */
    remove: string;
    /**
     * The same, named for what it removes. `{label}` is filled in by
     * `fillMessage`.
     *
     * A second string rather than the bare verb with the name stuck on the end,
     * because where the name goes is not the same in every language: German and
     * Korean put it first, English and Spanish put it last. A row of five
     * remove buttons all called "Remove" is a row a screen reader cannot tell
     * apart, which is the whole reason this one exists.
     */
    removeNamed: string;
    /** The spinner that replaces a button's leading glyph while it waits. */
    loading: string;
  };
  /**
   * MPTextField.
   *
   * Only the reveal toggle, which is the one part of a text field that has a
   * name of its own to invent — everything else in it is the caller's.
   */
  textField: {
    showPassword: string;
    hidePassword: string;
  };
  /**
   * MPEmpty.
   *
   * The one string in this table that is **drawn** rather than read out, which
   * makes it the one that was most obviously wrong to leave in English: a
   * Korean page with an empty list said "Nothing here" in the middle of it.
   */
  empty: {
    title: string;
  };
  /**
   * The four pickers.
   *
   * One namespace for all of them rather than one each, because they are one
   * vocabulary: a caller who has translated "Previous month" for the date picker
   * has translated it for the range picker in the same breath, and the clock's
   * column names are shared by two components outright.
   */
  picker: {
    /** The calendar's steppers, in day view. */
    previousMonth: string;
    nextMonth: string;
    /** The same steppers in month view, where they move by a year. */
    previousYear: string;
    nextYear: string;
    /** And in year view, where they move by a page of twelve. */
    previousYears: string;
    nextYears: string;
    /** The two header buttons that open the month grid and the year grid. */
    chooseMonth: string;
    chooseYear: string;
    /**
     * The footer's actions.
     *
     * `today` has two coarser spellings rather than one word doing all three
     * jobs: the shortcut lands on whatever unit the picker asks for, and a
     * button that said *Today* on a year picker would be naming a day the
     * control has no way to choose.
     */
    today: string;
    thisMonth: string;
    thisYear: string;
    now: string;
    clear: string;
    done: string;
    /** The clock's columns, which are otherwise unlabelled lists of numbers. */
    hour: string;
    minute: string;
    second: string;
    meridiem: string;
    /** Which end of a range the calendar is currently asking for. */
    start: string;
    end: string;
  };
  /**
   * MPNumberField.
   *
   * The two steppers, which are a plus and a minus and have no words of their
   * own — the same case the pagination's chevrons and the chat's delivery marks
   * are in. They are read out and never drawn.
   */
  numberField: {
    increase: string;
    decrease: string;
  };
  /**
   * MPCarousel.
   *
   * Every string here is read out and never drawn: the strip is pictures, the
   * arrows are chevrons and the marks under it are dots. `{index}` and
   * `{total}` are filled in by `fillMessage`, and they are named rather than
   * positional for the reason the pagination's are — a language that counts the
   * total first is not a language this table can serve with an argument order.
   */
  carousel: {
    /** The name of the `region` the strip is inside. */
    label: string;
    /** The two arrows. */
    previous: string;
    next: string;
    /** One slide, and its own position mark. `Slide 2 of 5`. */
    slide: string;
  };
  /**
   * MPScrollZone.
   *
   * Read out and never drawn, like the carousel's above — but a namespace of
   * its own rather than three more keys in that one, because the words differ
   * where it matters. A carousel's arrow moves to the *slide* before this one
   * and there is a countable thing on the other side of the press; a scroll
   * zone's moves the strip along and lands wherever the content happens to
   * start. A translation that reused *Previous slide* for it would be naming a
   * slide the reader is not being taken to.
   */
  scroll: {
    /** What the strip is called when the caller has not said what is in it. */
    label: string;
    /** The two buttons, named by which way they travel. */
    previous: string;
    next: string;
  };
  /**
   * MPAnchor.
   *
   * One string, and it is read out rather than drawn: the rows are the page's
   * own headings, and the only thing the component says on its own behalf is
   * what the `<nav>` around them is called. A page with a table of contents and
   * a menu in it has two navigation landmarks, and a screen reader that offers
   * both of them as "navigation" has told the reader nothing.
   */
  anchor: {
    /** The name of the `<nav>` the list of headings is inside. */
    label: string;
  };
  /**
   * MPBreadcrumb.
   *
   * Both read out and never drawn: a trail's steps are the caller's words, and
   * these are the two things around them that are not.
   */
  breadcrumb: {
    /** The name of the `<nav>` the trail is inside. */
    label: string;
    /** The `…` that puts the folded middle back. */
    expand: string;
  };
  /**
   * MPCombobox.
   *
   * Both **drawn**, which is what makes them belong here rather than in a prop:
   * a Korean page whose search box says *No matches* has answered in a language
   * the reader did not ask a question in. `{label}` is the text they typed, and
   * is filled in by `fillMessage`.
   */
  combobox: {
    /** The line where the rows would be, when nothing matched. */
    empty: string;
    /** The row that offers what was typed as a value of its own. */
    add: string;
  };
  /**
   * MPTable.
   *
   * One string, drawn across the whole width where the rows would be. A table
   * that says *No data* in the middle of a translated page is the one part of it
   * that was not translated.
   */
  table: {
    empty: string;
  };
  /**
   * MPFilePicker.
   *
   * The line inside the box, and the largest piece of text this table holds. It
   * is drawn, it is an instruction, and it is the whole of what the component
   * tells a reader to do.
   */
  filePicker: {
    prompt: string;
  };
  /**
   * MPTextLink.
   *
   * The sentence after a link that takes over the window. Read out and never
   * drawn — the arrow says it to a reader who can see it, and this says it to
   * everybody else.
   */
  textLink: {
    newTab: string;
  };
  /**
   * MPOverlay.
   *
   * The name of a modal region that may hold nothing readable at all — a bare
   * spinner, a `clear` sheet. Without it a screen reader announces the region as
   * nothing, which is why the component defaults it rather than requiring it.
   */
  overlay: {
    label: string;
  };
  /** MPAlert. */
  alert: {
    /** The × in the corner, which has no text of its own. */
    dismiss: string;
  };
  /**
   * MPChatBubble.
   *
   * Every string here is read out and never drawn: a delivery state is a mark
   * on the bubble, and the word behind it is for the readers the mark says
   * nothing to. That is exactly why they belong in this table rather than in a
   * prop — a thread is a column of forty of these, and a caller who had to hand
   * over five words per message would hand over the English ones.
   */
  chat: {
    /** On its way. */
    sending: string;
    /** It left. */
    sent: string;
    /** It arrived on their device. */
    delivered: string;
    /** They opened it. */
    read: string;
    /** It did not go — the one step that is not on the ladder. */
    failed: string;
    /** The three dots, which are a picture of somebody writing. */
    typing: string;
  };
  /**
   * MPPagination.
   *
   * Every string here is read out and never drawn: what a page button shows is a
   * number, and what the two steppers show is a chevron. The words behind them
   * are for the readers those say nothing to — which is exactly why they belong
   * in this table rather than in props. A row of nine buttons whose caller had to
   * supply nine names is a row of nine English names.
   *
   * `{page}` and `{total}` are filled in by `fillMessage`.
   */
  pagination: {
    /** The name of the `<nav>` the row is inside. */
    label: string;
    /** One page button — the number is drawn, this is what is heard. */
    page: string;
    /** Announced after a move: where the reader now is, and how far it goes. */
    status: string;
    /** The two steppers that move by one page. */
    previous: string;
    next: string;
    /** And the two that jump to an end. */
    first: string;
    last: string;
  };
  /**
   * MPRating.
   *
   * Read out and never drawn, like the pagination's: a score is a row of stars,
   * and the sentence behind it is the whole of what a reader who cannot see them
   * gets. `{value}` and `{max}` are filled in by `fillMessage`.
   */
  rating: {
    /** The name of the control itself. */
    label: string;
    /** A score — what one star is called, and what a read-only row announces. */
    value: string;
    /** Nothing chosen yet, which is not the same as a score of nought. */
    empty: string;
  };
  /**
   * MPSpoiler.
   *
   * The one namespace whose strings are *drawn* rather than only announced —
   * they are the words on the cover, and a cover written in a language the page
   * is not in is a cover nobody reads.
   */
  spoiler: {
    /** The button that uncovers the content. */
    reveal: string;
    /** The button that covers it again, when the spoiler is reversible. */
    hide: string;
    /** The line above the button, saying why the content is covered. */
    notice: string;
  };
  /**
   * MPPageLayout, and the parts of a page it arranges.
   *
   * One namespace for the skeleton rather than one per component, for the reason
   * the pickers share theirs: they are one vocabulary, written by whoever
   * translates a page's chrome, and a caller who has translated the word for a
   * sidebar has translated the button that opens it in the same breath.
   */
  layout: {
    /**
     * The link that jumps past the navigation, drawn only while it holds the
     * focus.
     *
     * Drawn rather than only announced, which makes it one of the few strings
     * here that a sighted keyboard reader actually sees — and the one it would
     * be least forgivable to leave in English, because the readers it exists for
     * are the ones who cannot skip it.
     */
    skipToContent: string;
    /**
     * What an `MPSidebar` is called when nothing named it.
     *
     * Read out and never drawn. Every `<aside>` needs a name and a page with two
     * of them *must* have one each, or a screen reader offers two regions called
     * "complementary" — which is exactly why this is a default rather than a
     * required prop.
     */
    sidebar: string;
    /** The hamburger, which is a drawing and has no word of its own. */
    openSidebar: string;
    /** The same button once the drawer is open. */
    closeSidebar: string;
    /** The handle on a resizable column's inner edge. */
    resizeSidebar: string;
  };
  /**
   * MPTransfer.
   *
   * Every string here is **drawn**, which is unusual in this table and is what
   * makes the namespace necessary: the two headings, the filter's placeholder
   * and the line an empty list shows are all read off the screen, and a Korean
   * page with a column headed *Available* is a page the component broke.
   *
   * The two arrows are the exception and are read out rather than drawn, for the
   * reason the pagination's steppers are.
   */
  transfer: {
    /** The heading over the list of things that have not been chosen. */
    source: string;
    /** And over the list of things that have. */
    target: string;
    /** The arrow that sends the ticked rows across. */
    toTarget: string;
    /** And the one that brings them back. */
    toSource: string;
    /** The filter above each list. */
    search: string;
    /** What a list with nothing in it says. */
    empty: string;
  };
  /**
   * MPCommandPalette.
   *
   * Three strings, two of them drawn: a palette that says *Type a command or
   * search…* to a Korean reader is a palette that has told them, in the first
   * thing they see, that it is not for them.
   */
  command: {
    /** The dialog's accessible name. It has no visible title to take one from. */
    label: string;
    /** The placeholder in the field. */
    search: string;
    /** The line where the rows would be, when nothing matched. */
    empty: string;
  };
  /**
   * MPColorPicker.
   *
   * The one control in the library whose parts have **nowhere to take a name
   * from**: a saturation square, a hue rail and an opacity rail are three
   * draggable rectangles, and without these they are three draggable rectangles
   * to a screen reader too.
   *
   * `empty` is the exception and is drawn — it is what the trigger reads before
   * a colour has been chosen.
   */
  colorPicker: {
    /** The saturation/brightness square. */
    area: string;
    /** The hue rail beside it. */
    hue: string;
    /** The opacity rail, when `alpha` is on. */
    alpha: string;
    /** The field the value can be typed into. */
    value: string;
    /** The grid of ready-made colours. */
    swatches: string;
    /** The × that empties the control. */
    clear: string;
    /** What the trigger reads before anything has been chosen. */
    empty: string;
  };
  /**
   * The two buttons on a confirmation, and the one on an acknowledgement.
   *
   * A namespace of its own rather than three more entries in `common`, because
   * `common` is the glyph labels — the × that is read out as *close* — and these
   * are the words on the buttons themselves. A caller who wants *Delete* rather
   * than *Confirm* passes a label; these are what is drawn when they do not.
   */
  confirm: {
    /** The button that says yes. */
    confirm: string;
    /** The button that says no, and what a dismissal counts as. */
    cancel: string;
    /** The single button on an acknowledgement, which has nothing to refuse. */
    ok: string;
  };
}

/** A translation may fill in as much or as little of the table as it has. */
export type MPPartialMessages = {
  [Namespace in keyof MPMessages]?: Partial<MPMessages[Namespace]>;
};

/**
 * One language, ready to be handed to `registerMPMessages`.
 *
 * The tag travels with the table rather than beside it, so registering is
 * `registerMPMessages(ko)` and not `registerMPMessages('ko', ko)` — one
 * argument that cannot disagree with itself, and a shape an application can
 * write by hand for a language this library does not ship.
 */
export interface MPLocale {
  /**
   * The BCP 47 tag this table answers to, lowercased on the way in.
   *
   * Broad rather than narrow: `pt` serves a reader who asked for `pt-BR`, and a
   * table registered as `pt-BR` would not serve one who asked for `pt`.
   */
  locale: string;
  /**
   * Other tags that should resolve to this same table.
   *
   * What `zh-hant` uses to answer for `zh-TW`, `zh-HK` and `zh-MO`: the same
   * characters under three names, held once. An alias is registered with the
   * table and disappears with it.
   */
  aliases?: string[];
  /** The strings. Anything left out falls back to English, a namespace at a time. */
  messages: MPPartialMessages;
}

/**
 * One namespace's English strings, carrying the name they answer to.
 *
 * The thirteen of them live in `internal/messages/`, one to a module, and a
 * component imports the one it speaks. That is the whole reason this type
 * exists: `resolveNamespace` below is handed the English table rather than
 * looking it up, so the twelve tables a component does not use are twelve modules
 * nothing imports.
 *
 * The name travels with the strings rather than beside them, so a call site is
 * `useMPMessages(PICKER, locale)` and cannot name one namespace while passing
 * another's words.
 */
export interface MPNamespace<Name extends keyof MPMessages> {
  /** The key this namespace occupies in `MPMessages` and in a translation. */
  readonly name: Name;
  /** English, which every other language is merged over. */
  readonly en: MPMessages[Name];
}

/**
 * The translations the application has handed over, keyed by the lowercased tag
 * they answer to.
 *
 * Empty until `registerMPMessages` is called, and that emptiness is the point.
 * The eighteen tables under `src/locales/` used to live in this file, which
 * meant a static import chain — `MPButton` → `useMPMessages` → here — put every
 * string in every language into the bundle of anyone who rendered a button. A
 * table is data, not behaviour, and the only way a bundler can leave data out is
 * for nothing to import it: so the direction is reversed, and an application
 * that speaks Korean says so.
 *
 * See `src/locales/index.ts` for what registering looks like from the outside.
 */
const registry = new Map<string, MPPartialMessages>();

/**
 * Teaches the library a language.
 *
 * Variadic because registering one is the common case and registering four is
 * the next one, and neither should need a loop at the call site. Call it once,
 * at startup, before anything renders: it is module-level state, and a table
 * that arrives after a component has already resolved its strings would be a
 * table that only takes effect at the next re-render.
 *
 * Registering a tag that is already registered replaces it, which is what makes
 * `registerMPMessages({ locale: 'ko', messages: { common: { close: '나가기' } } })`
 * a workable way to correct one word without forking a file — although a
 * component's own `labels` prop is the lighter tool for that.
 */
export function registerMPMessages(...locales: MPLocale[]): void {
  for (const entry of locales) {
    registry.set(entry.locale.toLowerCase(), entry.messages);

    for (const alias of entry.aliases ?? []) {
      registry.set(alias.toLowerCase(), entry.messages);
    }
  }

  /*
   * The resolved cache is keyed by the tag that was asked for, so a tag that
   * resolved to English before this call would go on resolving to English. Drop
   * the lot rather than try to work out which entries a new table invalidates:
   * this runs once at startup, and the merge it throws away is cheap.
   */
  resolved.clear();
}

/**
 * A BCP 47 tag, broadest match last.
 *
 * `zh-Hant-TW` asks for `zh-hant`, then `zh-tw`, then `zh`; `pt-BR` asks for
 * `pt-br` and then `pt`. The subtags are found by shape rather than by position,
 * because a tag can carry an extension or a variant between them and
 * `split('-')[1]` would take that for the script.
 */
function candidates(locale: string): string[] {
  const subtags = locale.toLowerCase().split(/[-_]/).filter(Boolean);
  const language = subtags[0];

  if (!language) {
    return [];
  }

  const rest = subtags.slice(1);
  const script = rest.find((subtag) => /^[a-z]{4}$/.test(subtag));
  const region = rest.find((subtag) => /^([a-z]{2}|\d{3})$/.test(subtag));

  return [
    script ? `${language}-${script}` : '',
    region ? `${language}-${region}` : '',
    language
  ].filter(Boolean);
}

/**
 * Merged namespaces, keyed by the namespace and the tag that was asked for.
 *
 * A module-level cache rather than a `useMemo` per component: the merge is the
 * same work for every picker on a page, and a filter bar is where this gets
 * called half a dozen times with the same tag.
 *
 * Keyed by both halves because the table is no longer resolved all at once —
 * `picker` in French and `common` in French are two entries, and a page that
 * renders a date picker beside a button asks for exactly those two.
 */
const resolved = new Map<string, unknown>();

/**
 * One namespace's strings for a locale, merged over English.
 *
 * `undefined` is English rather than the runtime's own locale, and that is
 * deliberate: `navigator.language` differs between the server that renders the
 * markup and the browser that hydrates it, and text that changes between those
 * two is a hydration mismatch in the one part of the page a reader is looking
 * at. A component that should follow the reader is *told* which language to
 * follow — by its own `locale` prop, or by an `MPLocaleProvider` above it.
 *
 * A namespace at a time, so a language that has one and not another keeps
 * English for the rest rather than losing both. That was already how the merge
 * worked; what changed is that the namespaces are no longer merged all at once,
 * because a component that reads one of them should not carry the other twelve.
 *
 * Note that this is only about the words in the table. The dates themselves are
 * formatted by `Intl` against the same tag, and `Intl` speaks every language the
 * platform does whether or not there is an entry here.
 */
export function resolveNamespace<Name extends keyof MPMessages>(
  namespace: MPNamespace<Name>,
  locale?: string
): MPMessages[Name] {
  const tag = locale?.trim() ?? '';
  /* `\0` cannot appear in a BCP 47 tag, so no pair of (namespace, tag) can
     collide with another by spelling. */
  const key = `${namespace.name}\0${tag}`;
  const cached = resolved.get(key) as MPMessages[Name] | undefined;

  if (cached) {
    return cached;
  }

  const match = candidates(tag)
    .map((candidate) => registry.get(candidate))
    .find(Boolean);
  const translated = match?.[namespace.name];
  const messages = translated ? { ...namespace.en, ...translated } : namespace.en;

  resolved.set(key, messages);

  return messages;
}

/**
 * A message with its placeholders filled in.
 *
 * `{page}`, `{total}`, `{value}` — named rather than positional, because the
 * order of two numbers in a sentence is not the same in every language: English
 * counts "page 3 of 20" and Turkish counts the total first. A translation that
 * had to keep the arguments in one order would be a translation that reads
 * wrongly in half of them.
 *
 * A placeholder with nothing to put in it is left as it was written rather than
 * blanked. A visible `{page}` is a bug report; a sentence with a hole in it is a
 * sentence somebody has to guess at.
 */
export function fillMessage(message: string, values: Record<string, string>): string {
  return message.replace(/\{(\w+)\}/g, (placeholder, key: string) => values[key] ?? placeholder);
}
