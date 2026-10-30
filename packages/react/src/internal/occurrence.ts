/**
 * A key for each entry of a caller's list: its value, and which occurrence of
 * that value it is.
 *
 * The lists here are keyed so a value the caller repeated cannot collide —
 * `${index}:${value}` did that, and also changed every key after the first row
 * a filter dropped, so typing one letter into a long list unmounted and
 * remounted every row below the first one it hid. Counting occurrences instead
 * keeps a row's key for as long as the row is there: the first `"Seoul"` is
 * `0:Seoul` wherever it lands in the filtered list, and a second one is
 * `1:Seoul`. The count comes first, and has no colon in it, so no value can
 * spell another's key.
 *
 * Keyed by the entry object, so a list that is filtered and drawn somewhere
 * else — Base UI hands a combobox's rows back one at a time — can still look
 * each one up.
 */
export function occurrenceKeys<Entry>(
  entries: readonly Entry[],
  valueOf: (entry: Entry) => unknown
): Map<Entry, string> {
  const seen = new Map<string, number>();
  const keys = new Map<Entry, string>();

  for (const entry of entries) {
    const value = String(valueOf(entry));
    const count = seen.get(value) ?? 0;

    seen.set(value, count + 1);
    keys.set(entry, `${count}:${value}`);
  }

  return keys;
}
