/**
 * A name reduced to the letters that stand in for it.
 *
 * The first character of the first word plus the first of the last — "Jane Doe"
 * is `JD`, "Acme Supply Co" is `AC`, and "홍길동" is `홍`.
 *
 * One word gives one character on purpose. Korean, Japanese and Chinese names
 * are a single token, and two of their characters at 32px is a smudge where one
 * of them is a name.
 *
 * `Array.from` rather than indexing, and that is the whole reason this is a
 * function rather than a `slice(0, 1)` at each call site: a string index is a
 * UTF-16 code unit, so `name[0]` on a name beginning with an emoji or any
 * character outside the basic plane returns half of it, and half a surrogate
 * pair renders as the replacement glyph. `normalize('NFC')` is the other half
 * of the same care — a decomposed "Å" would otherwise give the bare A, with the
 * ring left behind on the next character.
 *
 * The rule is wrong for some names, which is what every caller's own `initials`
 * prop is for. It is not wrong often enough to be worth a locale-aware guess
 * that would be wrong differently.
 *
 * A file of its own because two components need it and neither should import
 * the other. `MPAvatar` derives a person's initials and `MPAppLogo` derives a
 * product's, and a page carrying both would otherwise be able to disagree with
 * itself about what a two-word name comes to.
 */
export function initialsOf(name: string): string {
  const words = name.normalize('NFC').trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '';
  }

  const first = Array.from(words[0])[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';

  return (first + last).toLocaleUpperCase();
}
