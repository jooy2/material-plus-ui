import { describe, expect, it } from 'vitest';
import {
  compareValues,
  csvField,
  keysBetween,
  nextSort,
  pageBounds,
  searchHaystack,
  toCsv
} from '../../src/internal/data-table';

const collator = new Intl.Collator('en-US', { numeric: true, sensitivity: 'base' });

describe('compareValues', () => {
  it('reads a run of digits as a number inside a string', () => {
    // Without `numeric` the collator puts item10 before item2, which is the
    // order nobody means and everybody has seen.
    expect(compareValues('item2', 'item10', collator)).toBeLessThan(0);
  });

  it('puts an empty value last whichever way the column runs', () => {
    // A blank is not the smallest value, it is the absence of one.
    expect(compareValues(null, 5, collator)).toBeGreaterThan(0);
    expect(compareValues(null, 5, collator, true)).toBeGreaterThan(0);
    expect(compareValues(5, null, collator, true)).toBeLessThan(0);
  });

  it('treats NaN as empty, because it compares false against everything', () => {
    // Left to the subtraction, the order would depend on which rows happened to
    // be next to each other.
    expect(compareValues(Number.NaN, 1, collator)).toBeGreaterThan(0);
  });
});

describe('nextSort', () => {
  it('cycles one column through three states', () => {
    // The order the rows arrived in is a state a reader cannot get back to by
    // pressing anything if the cycle only has two.
    expect(nextSort([], 'a', false)).toEqual([{ key: 'a', direction: 'asc' }]);
    expect(nextSort([{ key: 'a', direction: 'asc' }], 'a', false)).toEqual([
      { key: 'a', direction: 'desc' }
    ]);
    expect(nextSort([{ key: 'a', direction: 'desc' }], 'a', false)).toEqual([]);
  });

  it('leaves an added column where it already is in the list', () => {
    // Moving it to the end would quietly make the second key of a two-key sort
    // the first.
    const current = [
      { key: 'a', direction: 'asc' },
      { key: 'b', direction: 'asc' }
    ] as const;

    expect(nextSort(current, 'a', true)).toEqual([
      { key: 'a', direction: 'desc' },
      { key: 'b', direction: 'asc' }
    ]);
  });
});

describe('pageBounds', () => {
  it('moves a page that no longer exists to the last one that does', () => {
    // A search that cuts twenty pages to three leaves the caller's page at
    // fourteen, and an empty screen reads as "nothing matched".
    expect(pageBounds(25, 14, 10)).toEqual({ pages: 3, page: 3, start: 20, end: 25 });
  });

  it('is one page even with nothing on it', () => {
    expect(pageBounds(0, 1, 10)).toEqual({ pages: 1, page: 1, start: 0, end: 0 });
  });
});

describe('keysBetween', () => {
  it('covers the same rows dragged either way', () => {
    expect(keysBetween(['a', 'b', 'c', 'd'], 'c', 'b')).toEqual(['b', 'c']);
    expect(keysBetween(['a', 'b', 'c', 'd'], 'b', 'c')).toEqual(['b', 'c']);
  });

  it('answers nothing for a key the list no longer holds', () => {
    // An index of -1 would silently produce a range from one end.
    expect(keysBetween(['a', 'b'], 'a', 'z')).toEqual([]);
  });
});

describe('searchHaystack', () => {
  it('cannot be matched across the seam between two values', () => {
    // Joined on a character no keyboard produces, so a query cannot find a row
    // on text that is not next to itself.
    expect(searchHaystack(['Ada', 'Seoul']).includes('adaseoul')).toBe(false);
    expect(searchHaystack(['Ada', 'Seoul']).includes('seoul')).toBe(true);
  });
});

describe('the CSV', () => {
  it('quotes only a field that has to be quoted', () => {
    expect(csvField('plain', ',')).toBe('plain');
    expect(csvField('a,b', ',')).toBe('"a,b"');
    expect(csvField('a;b', ',')).toBe('a;b');
    expect(csvField('a;b', ';')).toBe('"a;b"');
    expect(csvField('line\nbreak', ',')).toBe('"line\nbreak"');
  });

  it('doubles a quote inside a quoted field', () => {
    expect(csvField('say "hi"', ',')).toBe('"say ""hi"""');
  });

  it('writes nothing for nothing, rather than the word', () => {
    // `String(null)` in a spreadsheet cell is the word "null".
    expect(csvField(null, ',')).toBe('');
    expect(csvField(undefined, ',')).toBe('');
  });

  it('leads with a byte-order mark, because Excel needs one', () => {
    // Without it Excel reads a UTF-8 file as the local code page, and every
    // non-ASCII name in it arrives as mojibake.
    expect(toCsv([['a']])).toBe('\uFEFFa');
    expect(toCsv([['a']], { bom: false })).toBe('a');
  });

  it('ends its rows the way RFC 4180 says', () => {
    expect(toCsv([['a'], ['b']], { bom: false })).toBe('a\r\nb');
  });
});

/**
 * The half of a CSV that RFC 4180 says nothing about.
 *
 * A spreadsheet does not read a CSV as data. A cell beginning `=` or `@` or `+`
 * is a formula, and the rows in a data table are usually things other people
 * typed — so a file written straight out is one click from running somebody
 * else's input on the reader's machine. Nothing at render time can reach that;
 * the file is where it has to be stopped.
 */
describe('a cell a spreadsheet would run', () => {
  const field = (value: unknown) => csvField(value, ',');

  it('defuses every character a spreadsheet leads a formula with', () => {
    expect(field('=1+1')).toBe("'=1+1");
    expect(field('@SUM(A1)')).toBe("'@SUM(A1)");
    expect(field("+cmd|'/c calc'!A0")).toBe("'+cmd|'/c calc'!A0");
    expect(field("-2+3+cmd|'/c calc'!A0")).toBe("'-2+3+cmd|'/c calc'!A0");
  });

  /*
   * A leading tab or carriage return is thrown away before the scan, so a cell
   * beginning with one still leads with whatever follows it. The second of these
   * also has to come back quoted, because a CR in a field always did.
   */
  it('is not walked past by the whitespace a parser discards', () => {
    expect(field('\t=1+1')).toBe("'\t=1+1");
    expect(field('\r=1+1')).toBe(`"'\r=1+1"`);
  });

  it('quotes the result when the formula also holds a separator', () => {
    expect(field('=HYPERLINK("https://e.example","x")')).toBe(
      `"'=HYPERLINK(""https://e.example"",""x"")"`
    );
  });

  /*
   * The whole reason the check is two rules rather than one. A table of negative
   * figures whose every cell had been prefixed would be a fix more annoying than
   * the thing it fixed.
   */
  it('leaves a number its sign', () => {
    expect(field(-5)).toBe('-5');
    expect(field('-5')).toBe('-5');
    expect(field('+3.25')).toBe('+3.25');
    expect(field('-1e5')).toBe('-1e5');
    expect(field('-1,234.5')).toBe('"-1,234.5"');
  });

  it('leaves alone a cell that leads with nothing special', () => {
    expect(field('Ada Lovelace')).toBe('Ada Lovelace');
    expect(field('a=b')).toBe('a=b');
    expect(field('')).toBe('');
  });

  /*
   * What the allowance for numbers must not become. Everything here begins the
   * way a number does and goes on to be a formula, so the rule that lets `-5`
   * through has to refuse all of them.
   */
  it('is not opened up by the allowance a number gets', () => {
    expect(field('-1+1')).toBe("'-1+1");
    expect(field('+1-cmd')).toBe("'+1-cmd");
    expect(field('-1;=1+1')).toBe("'-1;=1+1");
    expect(field('- =1+1')).toBe("'- =1+1");
  });

  it('is on by default and can be turned off', () => {
    expect(toCsv([['=1+1']], { bom: false })).toBe("'=1+1");
    expect(toCsv([['=1+1']], { bom: false, escapeFormulas: false })).toBe('=1+1');
    // A file going to a parser rather than to a person goes out byte for byte.
    expect(csvField('=1+1', ',', false)).toBe('=1+1');
  });
});
