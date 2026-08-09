import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPBlockquote } from 'material-plus-ui';

describe('MPBlockquote', () => {
  describe('markup', () => {
    it('wraps a bare quote in a div', async () => {
      // A `<figure>` with no `<figcaption>` in it is a figure of nothing.
      const screen = await render(<MPBlockquote>Said a thing</MPBlockquote>);
      const quote = screen.getByText('Said a thing').element();

      expect(quote.tagName).toBe('BLOCKQUOTE');
      expect(quote.parentElement!.tagName).toBe('DIV');
    });

    it('becomes a figure once there is an attribution', async () => {
      // The HTML specification is explicit that the attribution goes *outside*
      // the blockquote — a name inside it claims the speaker said their own.
      const screen = await render(<MPBlockquote author="Ada">Said a thing</MPBlockquote>);
      const quote = screen.getByText('Said a thing').element();

      expect(quote.parentElement!.tagName).toBe('FIGURE');
      expect(quote.parentElement!.querySelector('figcaption')).not.toBeNull();
    });

    it('puts the author outside the quote', async () => {
      const screen = await render(<MPBlockquote author="Ada">Said a thing</MPBlockquote>);
      const caption = screen.getByText('Ada').element().closest('figcaption');

      expect(caption).not.toBeNull();
      expect(caption!.closest('blockquote')).toBeNull();
    });

    it('renders a source inside a cite element', async () => {
      // `<cite>` is for the title of a work and, per the specification, never
      // for the name of a person.
      const screen = await render(
        <MPBlockquote source="A Paper on Analytical Engines">Said a thing</MPBlockquote>
      );

      expect(screen.getByText('A Paper on Analytical Engines').element().tagName).toBe('CITE');
    });

    it('writes a cite URL onto the blockquote itself', async () => {
      const screen = await render(
        <MPBlockquote cite="https://example.com/paper">Said a thing</MPBlockquote>
      );

      expect(screen.getByText('Said a thing').element()).toHaveAttribute(
        'cite',
        'https://example.com/paper'
      );
    });

    it('draws nothing on the blockquote element itself', async () => {
      // A host stylesheet styles `blockquote` by name at a specificity a
      // one-class utility cannot outrank, so the surface and the rule live on
      // the wrapper.
      const screen = await render(<MPBlockquote variant="tonal">Said a thing</MPBlockquote>);
      const quote = screen.getByText('Said a thing').element();

      expect(quote).not.toHaveClass('border-s-2');
      expect(quote.parentElement).toHaveClass('border-s-2');
    });
  });

  describe('the mark', () => {
    it('draws the house quotation mark by default', async () => {
      const screen = await render(<MPBlockquote>Said a thing</MPBlockquote>);

      expect(screen.getByText('Said a thing').element().querySelector('svg')).not.toBeNull();
    });

    it('takes it away when told to', async () => {
      const screen = await render(<MPBlockquote icon={false}>Said a thing</MPBlockquote>);

      expect(screen.getByText('Said a thing').element().querySelector('svg')).toBeNull();
    });

    it('takes a mark of its own', async () => {
      const screen = await render(
        <MPBlockquote icon={<span data-testid="mark">❝</span>}>Said a thing</MPBlockquote>
      );

      expect(screen.getByTestId('mark').query()).not.toBeNull();
    });
  });

  describe('variant', () => {
    it('is a margin rule and nothing else by default', async () => {
      const screen = await render(<MPBlockquote>Said a thing</MPBlockquote>);
      const shell = screen.getByText('Said a thing').element().parentElement!;

      expect(shell).toHaveAttribute('data-mp-variant', 'text');
      expect(shell).toHaveClass('bg-transparent');
    });

    it('keeps a painted quote’s ruled edge square', async () => {
      // A 2px rule that curves away from the text it marks is a bracket, not a
      // margin rule.
      const screen = await render(<MPBlockquote variant="tonal">Said a thing</MPBlockquote>);
      const shell = screen.getByText('Said a thing').element().parentElement!;

      expect(shell).toHaveClass('rounded-s-none');
    });

    it('leaves the sheet neutral on outlined', async () => {
      const screen = await render(<MPBlockquote variant="outlined">Said a thing</MPBlockquote>);
      const shell = screen.getByText('Said a thing').element().parentElement!;

      expect(shell).toHaveClass('border-mp-outline-variant');
    });
  });

  describe('color', () => {
    it('puts the accent family in the rule', async () => {
      const screen = await render(<MPBlockquote color="tertiary">Said a thing</MPBlockquote>);
      const shell = screen.getByText('Said a thing').element().parentElement! as HTMLElement;

      expect(shell.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-tertiary)');
    });
  });

  describe('passthrough', () => {
    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(
        <MPBlockquote className="my-own-class">Said a thing</MPBlockquote>
      );
      const shell = screen.getByText('Said a thing').element().parentElement!;

      expect(shell).toHaveClass('my-own-class');
      expect(shell).toHaveClass('mp-blockquote');
    });

    it('publishes the size on the root', async () => {
      const screen = await render(<MPBlockquote size="lg">Said a thing</MPBlockquote>);
      const shell = screen.getByText('Said a thing').element().parentElement!;

      expect(shell).toHaveAttribute('data-mp-size', 'lg');
    });
  });
});
