import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPCodeBlock } from 'material-plus-ui';

const block = () => document.querySelector('.mp-code') as HTMLElement;
const lines = () => Array.from(document.querySelectorAll('.mp-code-line')) as HTMLElement[];
const scroller = () => document.querySelector('.mp-code__scroller') as HTMLElement;

const TS = ['const answer = 42;', '', 'export function ask() {', '  return answer;', '}'].join(
  '\n'
);

/**
 * The clipboard, replaced for the length of a test.
 *
 * `navigator.clipboard.writeText` needs a permission the test browser has not
 * granted, and the component's own fallback — an off-screen textarea and
 * `execCommand` — is what would run instead. Both paths are the component's, so
 * the one under test is chosen here rather than left to the browser's mood.
 */
function stubClipboard(writeText: (text: string) => Promise<void>) {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText }
  });

  return () => {
    if (original) {
      Object.defineProperty(navigator, 'clipboard', original);
    } else {
      Reflect.deleteProperty(navigator as object, 'clipboard');
    }
  };
}

let restoreClipboard: (() => void) | null = null;

afterEach(() => {
  restoreClipboard?.();
  restoreClipboard = null;
});

describe('MPCodeBlock', () => {
  it('draws the code as lines, always', async () => {
    // Even with no numbers and no prompt: a line is what carries a number, a
    // prompt and a place in the scroll, and a component that switched between
    // two renderings would have two sets of wrapping behaviour to keep in step.
    await render(<MPCodeBlock code={TS} />);

    expect(lines()).toHaveLength(5);
    expect(lines()[0].textContent).toBe('const answer = 42;');
  });

  it('keeps a blank line a line high', async () => {
    await render(<MPCodeBlock code={TS} />);

    // A flex row with nothing in it is zero pixels tall, and a block that closed
    // up its own paragraph breaks would be reflowing the reader's file.
    expect(lines()[1].getBoundingClientRect().height).toBeGreaterThan(8);
  });

  it('trims the trailing newline a template literal leaves, and no indentation', async () => {
    await render(<MPCodeBlock code={'  indented\nlast\n\n  '} />);

    expect(lines()).toHaveLength(2);
    expect(lines()[0].textContent).toBe('  indented');
  });

  it('normalises the line endings a file written on Windows brought', async () => {
    // Split on `\n`, each line would keep a carriage return the reader cannot
    // see, the highlighter reads as part of the last token, and the clipboard
    // hands straight to a shell.
    await render(<MPCodeBlock code={'one\r\ntwo\r\nthree'} />);

    expect(lines()).toHaveLength(3);
    expect(lines()[0].textContent).toBe('one');
  });

  it('colours the code once the grammar has landed', async () => {
    await render(<MPCodeBlock code={TS} language="ts" />);

    // Drawn plain on the first frame, coloured when the chunk arrives — there is
    // never a blank space where the code should be.
    expect(block().textContent).toContain('const answer');

    await vi.waitFor(() =>
      expect(block().querySelectorAll('.hljs-keyword').length).toBeGreaterThan(0)
    );
  });

  it('reads a language written as an extension or an alias', async () => {
    await render(<MPCodeBlock code={TS} language="tsx" />);

    await vi.waitFor(() =>
      expect(block().querySelectorAll('.hljs-keyword').length).toBeGreaterThan(0)
    );
    // The canonical name is what the bar reports, not the spelling handed in.
    expect(document.querySelector('.mp-code__language')!.textContent).toBe('typescript');
  });

  it('draws a language nothing knows plain rather than refusing it', async () => {
    await render(<MPCodeBlock code={TS} language="brainfuck" />);

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(block().querySelectorAll('.hljs-keyword')).toHaveLength(0);
    expect(lines()).toHaveLength(5);
  });

  it('fetches nothing at all when the colouring is off', async () => {
    await render(<MPCodeBlock code={TS} language="ts" highlight={false} />);

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(block().querySelectorAll('span[class^="hljs-"]')).toHaveLength(0);
  });

  it('numbers the lines from wherever it is told to start', async () => {
    const screen = await render(<MPCodeBlock code={TS} lineNumbers />);

    expect(lines()[0]).toHaveAttribute('data-line', '1');

    await screen.rerender(<MPCodeBlock code={TS} lineNumbers startLine={286} />);

    expect(lines()[0]).toHaveAttribute('data-line', '286');
    expect(lines()[4]).toHaveAttribute('data-line', '290');
  });

  it('keeps the numbers and the prompt out of the text', async () => {
    // Generated content, so they cannot be selected, cannot be found by
    // find-in-page and are not what the copy button puts on the clipboard: a
    // transcript stays a transcript and still pastes into a shell.
    await render(<MPCodeBlock code={'npm install\nnpm run dev'} lineNumbers prompt="$" />);

    expect(block().textContent).not.toContain('$');
    expect(block().textContent).not.toContain('1');
  });

  it('puts no prompt in front of a blank line', async () => {
    await render(<MPCodeBlock code={TS} prompt="$" />);

    expect(lines()[0]).toHaveAttribute('data-prompt', '$');
    expect(lines()[1]).not.toHaveAttribute('data-prompt');
  });

  it('marks a line, a range, and a list of both', async () => {
    const screen = await render(<MPCodeBlock code={TS} markLines={2} />);
    const marks = () => lines().map((line) => line.hasAttribute('data-mark'));

    expect(marks()).toEqual([false, true, false, false, false]);

    await screen.rerender(<MPCodeBlock code={TS} markLines="2-4" />);

    expect(marks()).toEqual([false, true, true, true, false]);

    await screen.rerender(<MPCodeBlock code={TS} markLines={['1', '3-4']} />);

    expect(marks()).toEqual([true, false, true, true, false]);
  });

  it('reads a range written the wrong way round', async () => {
    // The reader who typed `4-2` meant the same three lines.
    await render(<MPCodeBlock code={TS} markLines="4-2" />);

    expect(lines().map((line) => line.hasAttribute('data-mark'))).toEqual([
      false,
      true,
      true,
      true,
      false
    ]);
  });

  it('drops an unparseable mark rather than throwing', async () => {
    // A marked line is an annotation, and a typo in one should cost the
    // annotation rather than the code.
    await render(<MPCodeBlock code={TS} markLines="two, 3" />);

    expect(lines().map((line) => line.hasAttribute('data-mark'))).toEqual([
      false,
      false,
      true,
      false,
      false
    ]);
  });

  it('counts the marks the way the gutter counts', async () => {
    await render(<MPCodeBlock code={TS} lineNumbers startLine={286} markLines={288} />);

    expect(lines()[2]).toHaveAttribute('data-mark');
    expect(lines()[2]).toHaveAttribute('data-line', '288');
  });

  it('draws no bar when the toolbar is off, whatever the rest say', async () => {
    await render(
      <MPCodeBlock code={TS} language="ts" toolbar={false} copyable rawToggle title="a.ts" />
    );

    expect(document.querySelector('.mp-code__bar')).toBeNull();
  });

  it('draws no bar when there is nothing to put in it', async () => {
    await render(<MPCodeBlock code={TS} copyable={false} showLanguage={false} />);

    expect(document.querySelector('.mp-code__bar')).toBeNull();
  });

  it('names the file and the language in the bar', async () => {
    const screen = await render(<MPCodeBlock code={TS} language="ts" title="src/index.ts" />);

    await expect.element(screen.getByText('src/index.ts')).toBeInTheDocument();
    expect(document.querySelector('.mp-code__language')!.textContent).toBe('typescript');
  });

  it('copies the code and says so', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    const onCopy = vi.fn();

    restoreClipboard = stubClipboard(writeText);

    const screen = await render(<MPCodeBlock code={TS} onCopy={onCopy} />);

    await screen.getByRole('button', { name: 'Copy' }).click();

    expect(writeText).toHaveBeenCalledWith(TS);
    expect(onCopy).toHaveBeenCalledWith(TS);
    await expect.element(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('says so when the browser refused', async () => {
    // Both paths are real: the async API needs a secure context, and a component
    // library is used on `http://192.168.1.4:3000` more often than anyone admits.
    restoreClipboard = stubClipboard(() => Promise.reject(new Error('denied')));

    const screen = await render(<MPCodeBlock code={TS} />);
    const before = document.execCommand;

    document.execCommand = () => false;

    try {
      await screen.getByRole('button', { name: 'Copy' }).click();

      await expect
        .element(screen.getByRole('button', { name: 'Could not copy' }))
        .toBeInTheDocument();
    } finally {
      document.execCommand = before;
    }
  });

  it('drops the colouring when the raw toggle is pressed', async () => {
    const screen = await render(<MPCodeBlock code={TS} language="ts" rawToggle />);

    await vi.waitFor(() =>
      expect(block().querySelectorAll('.hljs-keyword').length).toBeGreaterThan(0)
    );

    await screen.getByRole('button', { name: 'Plain text' }).click();

    expect(block().querySelectorAll('.hljs-keyword')).toHaveLength(0);
    expect(block().textContent).toContain('const answer');
  });

  it('offers no raw toggle when there is no colouring to drop', async () => {
    await render(<MPCodeBlock code={TS} language="ts" rawToggle highlight={false} />);

    expect(document.querySelector('[aria-label="Plain text"]')).toBeNull();
  });

  it('is a focusable region with a name', async () => {
    // A scrollable region has to be reachable by a keyboard that has no pointer
    // to drag with, and a focusable region has to have a name.
    const screen = await render(<MPCodeBlock code={TS} language="ts" />);

    await expect.element(screen.getByRole('region', { name: 'typescript' })).toBeInTheDocument();
    expect(scroller().tabIndex).toBe(0);
  });

  it('takes the file name for that name when there is one', async () => {
    const screen = await render(<MPCodeBlock code={TS} language="ts" title="src/index.ts" />);

    await expect.element(screen.getByRole('region', { name: 'src/index.ts' })).toBeInTheDocument();
  });

  it('scrolls sideways, or wraps when it is told to', async () => {
    const long = 'const sentence = "' + 'word '.repeat(80) + '";';
    const screen = await render(<MPCodeBlock code={long} style={{ width: 300 }} />);

    expect(scroller().scrollWidth).toBeGreaterThan(scroller().clientWidth);

    await screen.rerender(<MPCodeBlock code={long} wrap style={{ width: 300 }} />);

    expect(scroller().scrollWidth).toBe(scroller().clientWidth);
  });

  it('bounds the block with `maxHeight`', async () => {
    await render(<MPCodeBlock code={'line\n'.repeat(60)} maxHeight={120} />);

    expect(scroller().getBoundingClientRect().height).toBe(120);
    expect(scroller().scrollHeight).toBeGreaterThan(120);
  });

  it('wears the theme it was given', async () => {
    const screen = await render(<MPCodeBlock code={TS} />);

    expect(block()).toHaveAttribute('data-mp-code-theme', 'auto');

    await screen.rerender(<MPCodeBlock code={TS} theme="mono" />);

    expect(block()).toHaveAttribute('data-mp-code-theme', 'mono');
  });

  it('takes a theme name the library has never heard of', async () => {
    // A theme is a set of `--mp-code-*` properties under a selector and nothing
    // else, so a consumer who writes one in their own stylesheet has a theme.
    await render(<MPCodeBlock code={TS} theme="ours" />);

    expect(block()).toHaveAttribute('data-mp-code-theme', 'ours');
  });
});
