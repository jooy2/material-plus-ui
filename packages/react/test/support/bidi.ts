/**
 * Where each character of [text] is drawn, left to right, as the string a
 * sighted reader sees on the screen.
 *
 * What a bidi test has to compare: the DOM holds the characters in the order
 * they were written whatever order they are drawn in.
 */
export function drawnOrder(element: Element): string {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const glyphs: { character: string; left: number }[] = [];

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? '';

    for (let index = 0; index < text.length; index += 1) {
      range.setStart(node, index);
      range.setEnd(node, index + 1);

      const box = range.getBoundingClientRect();

      if (box.width > 0) {
        glyphs.push({ character: text[index], left: box.left });
      }
    }
  }

  return glyphs
    .sort((a, b) => a.left - b.left)
    .map((glyph) => glyph.character)
    .join('');
}
