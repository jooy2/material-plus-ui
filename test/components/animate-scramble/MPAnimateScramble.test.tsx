import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateScramble } from 'material-plus-ui';

const visible = (element: Element) => element.querySelector('[aria-hidden="true"]') as HTMLElement;

describe('MPAnimateScramble', () => {
  it('settles on the text it was given', async () => {
    const screen = await render(
      <MPAnimateScramble duration={80} data-testid="scramble">
        SETTLED
      </MPAnimateScramble>
    );
    const element = screen.getByTestId('scramble').element();

    await vi.waitFor(() => expect(visible(element).textContent).toBe('SETTLED'));
  });

  /*
   * The reason to reach for this over a typewriter. A typed line grows a
   * character at a time, so everything beside it on the page moves while it
   * runs; this one is its finished length from the first frame.
   */
  it('is its finished length from the first frame', async () => {
    const screen = await render(
      <MPAnimateScramble trigger="manual" data-testid="scramble">
        SETTLED
      </MPAnimateScramble>
    );

    expect(visible(screen.getByTestId('scramble').element()).textContent).toHaveLength(7);
  });

  it('waits as noise rather than as the answer', async () => {
    const screen = await render(
      <MPAnimateScramble trigger="manual" data-testid="scramble">
        SETTLED
      </MPAnimateScramble>
    );
    const element = screen.getByTestId('scramble').element();

    expect(element).toHaveAttribute('data-mp-state', 'paused');
    // A heading that has already resolved while it waits to be scrolled to has
    // given away the thing it was about to do.
    expect(visible(element).textContent).not.toBe('SETTLED');
  });

  it('holds that noise still, rather than churning before it has been triggered', async () => {
    const screen = await render(
      <MPAnimateScramble trigger="manual" data-testid="scramble">
        SETTLED
      </MPAnimateScramble>
    );
    const element = screen.getByTestId('scramble').element();
    const first = visible(element).textContent;

    await new Promise((resolve) => setTimeout(resolve, 120));

    expect(visible(element).textContent).toBe(first);
  });

  it('gives a screen reader the words rather than the noise', async () => {
    const screen = await render(
      <MPAnimateScramble trigger="manual" data-testid="scramble">
        SETTLED
      </MPAnimateScramble>
    );
    const element = screen.getByTestId('scramble').element();
    const [hidden, shown] = [...element.children] as HTMLElement[];

    expect(hidden!.textContent).toBe('SETTLED');
    expect(shown!).toHaveAttribute('aria-hidden', 'true');
  });

  it('counts characters rather than code points', async () => {
    const screen = await render(
      <MPAnimateScramble trigger="manual" data-testid="scramble">
        a👩‍👩‍👧b
      </MPAnimateScramble>
    );

    // Three characters of noise, not nine. A splitter working in code points
    // would replace the family with three unrelated glyphs.
    expect([...visible(screen.getByTestId('scramble').element()).textContent!]).toHaveLength(3);
  });

  it('takes the text as a prop as well as as children', async () => {
    const screen = await render(
      <MPAnimateScramble text="SETTLED" duration={80} data-testid="scramble" />
    );

    await vi.waitFor(() =>
      expect(visible(screen.getByTestId('scramble').element()).textContent).toBe('SETTLED')
    );
  });
});
