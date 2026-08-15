import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButton, MPLocaleProvider, MPSpoiler } from 'material-plus-ui';

describe('MPSpoiler', () => {
  describe('covered', () => {
    it('blurs the content rather than removing it', async () => {
      // A reader can see that there is something there, and roughly how much of
      // it. What they cannot do is read it by accident.
      const screen = await render(<MPSpoiler>She was his sister.</MPSpoiler>);
      const content = screen.container.querySelector('[inert]') as HTMLElement;

      expect(content.textContent).toBe('She was his sister.');
      expect(content.style.filter).toBe('blur(10px)');
    });

    it('takes the content out of reach entirely', async () => {
      // `inert` rather than `aria-hidden`: not tabbable, not readable by a
      // screen reader, and not selectable by a drag across the page.
      const screen = await render(
        <MPSpoiler>
          <a href="#somewhere">A link nobody should reach yet</a>
        </MPSpoiler>
      );
      const content = screen.container.querySelector('[inert]') as HTMLElement;

      expect(content).not.toBeNull();
      expect(content.className).toContain('select-none');
    });

    /*
     * The attribute, not the prop.
     *
     * React 18 and React 19 want opposite values for `inert` — a boolean in 19,
     * an empty string in 18 — and each drops the other's spelling with only a
     * console warning to say so. The DOM is therefore the only honest place to
     * assert it, and the silence is worth asserting too: a warning here is the
     * signal that the value has gone the wrong way round.
     */
    it('lands the attribute on the element itself, quietly', async () => {
      const warn = vi.spyOn(console, 'error').mockImplementation(() => {});

      const screen = await render(
        <MPSpoiler>
          <a href="#somewhere">A link nobody should reach yet</a>
        </MPSpoiler>
      );
      const content = screen.container.querySelector('.mp-spoiler > div') as HTMLElement;

      expect(content.hasAttribute('inert')).toBe(true);
      // The IDL property, which is what actually takes the subtree out of reach.
      expect(content.inert).toBe(true);
      expect(warn).not.toHaveBeenCalled();

      warn.mockRestore();
    });

    it('writes the notice and the button on the cover', async () => {
      const screen = await render(<MPSpoiler>Hidden</MPSpoiler>);

      await expect
        .element(screen.getByText('Hidden so it is not read by accident'))
        .toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: 'Reveal' })).toBeInTheDocument();
    });

    it('takes a cover with nothing written on it', async () => {
      const screen = await render(<MPSpoiler description={false}>Hidden</MPSpoiler>);

      expect(screen.container.querySelector('p')).toBeNull();
    });

    it('clamps a long spoiler when told a height', async () => {
      const screen = await render(<MPSpoiler maxHeight={80}>Hidden</MPSpoiler>);
      const content = screen.container.querySelector('[inert]') as HTMLElement;

      expect(content.style.maxHeight).toBe('80px');
      expect(content.style.overflow).toBe('hidden');
    });
  });

  describe('revealing', () => {
    it('uncovers the content when the button is pressed', async () => {
      const screen = await render(<MPSpoiler>She was his sister.</MPSpoiler>);

      await screen.getByRole('button', { name: 'Reveal' }).click();

      const content = screen.container.querySelector(
        `#${CSS.escape(screen.container.querySelector('.mp-spoiler > div')!.id)}`
      ) as HTMLElement;

      expect(content.hasAttribute('inert')).toBe(false);
      expect(content.style.filter).toBe('');
      expect(screen.container.querySelector('.mp-spoiler')).toHaveAttribute(
        'data-mp-revealed',
        'true'
      );
    });

    it('reports the change', async () => {
      const onRevealedChange = vi.fn();
      const screen = await render(
        <MPSpoiler onRevealedChange={onRevealedChange}>Hidden</MPSpoiler>
      );

      await screen.getByRole('button', { name: 'Reveal' }).click();

      expect(onRevealedChange).toHaveBeenCalledWith(true);
    });

    it('stays where a controlled caller put it', async () => {
      const screen = await render(<MPSpoiler revealed={false}>Hidden</MPSpoiler>);

      await screen.getByRole('button', { name: 'Reveal' }).click();

      expect(screen.container.querySelector('[inert]')).not.toBeNull();
    });

    it('releases the clamp once it is open', async () => {
      // Revealing something and leaving it in a box with a scrollbar is
      // answering the wrong question.
      const screen = await render(
        <MPSpoiler defaultRevealed maxHeight={80}>
          Hidden
        </MPSpoiler>
      );
      const content = screen.container.querySelector('.mp-spoiler > div') as HTMLElement;

      expect(content.style.maxHeight).toBe('');
    });

    it('offers no way back until it is reversible', async () => {
      const screen = await render(<MPSpoiler defaultRevealed>Revealed</MPSpoiler>);

      expect(screen.container.querySelectorAll('button')).toHaveLength(0);
    });

    it('covers it again when it is', async () => {
      const screen = await render(
        <MPSpoiler defaultRevealed reversible>
          Revealed
        </MPSpoiler>
      );

      await screen.getByRole('button', { name: 'Hide' }).click();

      expect(screen.container.querySelector('[inert]')).not.toBeNull();
    });
  });

  describe('the words on the cover', () => {
    it('says them in the locale it was given', async () => {
      const screen = await render(<MPSpoiler locale="ko">가려진 내용</MPSpoiler>);

      await expect.element(screen.getByRole('button', { name: '보기' })).toBeInTheDocument();
      await expect
        .element(screen.getByText('실수로 읽지 않도록 가려 두었습니다'))
        .toBeInTheDocument();
    });

    it('follows a provider when it has no locale of its own', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ja">
          <MPSpoiler>隠された内容</MPSpoiler>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: '表示する' })).toBeInTheDocument();
    });

    it('takes words of its own', async () => {
      const screen = await render(
        <MPSpoiler label="Show the ending" description="Spoilers for chapter 12">
          Hidden
        </MPSpoiler>
      );

      await expect
        .element(screen.getByRole('button', { name: 'Show the ending' }))
        .toBeInTheDocument();
      await expect.element(screen.getByText('Spoilers for chapter 12')).toBeInTheDocument();
    });

    it('takes a control of its own instead', async () => {
      const onReveal = vi.fn();
      const screen = await render(
        <MPSpoiler action={<MPButton onClick={onReveal}>Unlock</MPButton>}>Hidden</MPSpoiler>
      );

      await screen.getByRole('button', { name: 'Unlock' }).click();

      expect(onReveal).toHaveBeenCalled();
      // The replacement is the caller's to wire up, so the content is untouched.
      expect(screen.container.querySelector('[inert]')).not.toBeNull();
    });
  });

  describe('the button', () => {
    it('says what it controls, and whether it is open', async () => {
      const screen = await render(<MPSpoiler>Hidden</MPSpoiler>);
      const button = screen.container.querySelector('.mp-spoiler button')!;
      const contentId = button.getAttribute('aria-controls')!;

      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(screen.container.querySelector(`#${CSS.escape(contentId)}`)).not.toBeNull();
    });
  });
});
