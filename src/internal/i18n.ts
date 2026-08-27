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
 * ## Why English is the only table in this file
 *
 * The other eighteen live under `src/locales/`, and nothing in the library
 * imports them. They used to be here, and being here is what made them cost
 * something: a component that says one word — `MPButton` says *Loading* — held a
 * static import chain down to a table of every string in every language, and a
 * bundler cannot drop data that something imports. Twenty kilobytes, on every
 * consumer, for a word.
 *
 * So the table arrives from the outside instead. `registerMPMessages` below is
 * how, `material-plus-ui/locales` is where from, and the only thing that changed
 * for a reader is that the application now names the languages it speaks. Once
 * it has, `locale="ko"` resolves through exactly the path it always did.
 *
 * The public surface is `registerMPMessages`, `MPLocaleProvider` and the
 * per-component `labels` props; `resolveMessages` and `fillMessage` stay
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
    /** The footer's actions. */
    today: string;
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
 * English is the base, and the only entry that is complete by construction —
 * every other locale is merged over it, so a missing string is an English one
 * rather than an empty box.
 */
const base: MPMessages = {
  common: {
    close: 'Close',
    clear: 'Clear',
    open: 'Open',
    remove: 'Remove',
    removeNamed: 'Remove {label}',
    loading: 'Loading'
  },
  textField: {
    showPassword: 'Show the password',
    hidePassword: 'Hide the password'
  },
  empty: {
    title: 'Nothing here'
  },
  picker: {
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    previousYears: 'Previous years',
    nextYears: 'Next years',
    chooseMonth: 'Choose a month',
    chooseYear: 'Choose a year',
    today: 'Today',
    now: 'Now',
    clear: 'Clear',
    done: 'Done',
    hour: 'Hour',
    minute: 'Minute',
    second: 'Second',
    meridiem: 'AM/PM',
    start: 'Start',
    end: 'End'
  },
  alert: {
    dismiss: 'Dismiss'
  },
  chat: {
    sending: 'Sending',
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Read',
    failed: 'Not sent',
    typing: 'Typing'
  },
  spoiler: {
    reveal: 'Reveal',
    hide: 'Hide',
    notice: 'Hidden so it is not read by accident'
  },
  pagination: {
    label: 'Pagination',
    page: 'Page {page}',
    status: 'Page {page} of {total}',
    previous: 'Previous page',
    next: 'Next page',
    first: 'First page',
    last: 'Last page'
  },
  rating: {
    label: 'Rating',
    value: '{value} out of {max}',
    empty: 'Not rated'
  }
};

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
  resolved.set('', base);
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
 * Resolved tables, keyed by the tag that was asked for.
 *
 * A module-level cache rather than a `useMemo` per component: the merge is the
 * same work for every picker on a page, and a filter bar is where this gets
 * called half a dozen times with the same tag.
 */
const resolved = new Map<string, MPMessages>([['', base]]);

/**
 * The strings for a locale, merged over English.
 *
 * `undefined` is English rather than the runtime's own locale, and that is
 * deliberate: `navigator.language` differs between the server that renders the
 * markup and the browser that hydrates it, and text that changes between those
 * two is a hydration mismatch in the one part of the page a reader is looking
 * at. A component that should follow the reader is *told* which language to
 * follow — by its own `locale` prop, or by an `MPLocaleProvider` above it.
 *
 * Note that this is only about the words in the table. The dates themselves are
 * formatted by `Intl` against the same tag, and `Intl` speaks every language the
 * platform does whether or not there is an entry here.
 */
export function resolveMessages(locale?: string): MPMessages {
  const key = locale?.trim() ?? '';
  const cached = resolved.get(key);

  if (cached) {
    return cached;
  }

  const match = candidates(key)
    .map((candidate) => registry.get(candidate))
    .find(Boolean);

  /*
   * Merged a namespace at a time, so a language that has one and not another
   * keeps English for the rest rather than losing both.
   *
   * Every namespace in `MPMessages` has to appear here — the type is what
   * enforces it, and it is the reason adding one is a compile error until it is
   * wired rather than a namespace that silently resolves to nothing.
   */
  const messages: MPMessages = match
    ? {
        common: { ...base.common, ...match.common },
        textField: { ...base.textField, ...match.textField },
        empty: { ...base.empty, ...match.empty },
        picker: { ...base.picker, ...match.picker },
        alert: { ...base.alert, ...match.alert },
        chat: { ...base.chat, ...match.chat },
        pagination: { ...base.pagination, ...match.pagination },
        rating: { ...base.rating, ...match.rating },
        spoiler: { ...base.spoiler, ...match.spoiler }
      }
    : base;

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
