import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { Field } from '@base-ui/react/field';
import { MPSupportingText } from '../../src/internal/SupportingText';

/**
 * The line under a control, on its own.
 *
 * Ten components draw it and none of them owns it, so it is asserted here
 * rather than through whichever of them happened to be convenient — the same
 * argument `keys.test.ts` makes about the shortcut vocabulary. `Field.Root` is
 * the only scaffolding it needs: `Field.Error` and `Field.Description` read
 * their wiring off it.
 */
function Line({ description, error }: { description?: string; error?: string }) {
  return (
    <Field.Root invalid={Boolean(error)}>
      <MPSupportingText description={description} errorMessage={error} />
    </Field.Root>
  );
}

/** A line whose message a button changes, so a change is a change and not a mount. */
function Changing({
  from,
  to
}: {
  from?: { description?: string; error?: string };
  to: { description?: string; error?: string };
}) {
  const [message, setMessage] = useState(from ?? {});

  return (
    <>
      <Line {...message} />
      <button type="button" onClick={() => setMessage(to)}>
        change
      </button>
    </>
  );
}

const reveal = () => document.querySelector('.mp-supporting-text__reveal') as HTMLElement | null;

describe('MPSupportingText', () => {
  describe('what it draws', () => {
    it('says the error rather than the description when it has both', async () => {
      // Material gives supporting text one slot, not two. Pushing the
      // description down a line to make room leaves the reader reading a
      // sentence that has just stopped applying.
      const screen = await render(<Line description="We will not share it." error="Not valid." />);

      await expect.element(screen.getByText('Not valid.')).toBeInTheDocument();
      expect(screen.container.textContent).not.toContain('We will not share it.');
    });

    it('draws nothing at all for a control with nothing to say', async () => {
      await render(<Line />);

      expect(reveal()).toBeNull();
      expect(document.querySelector('.mp-supporting-text')).toBeNull();
    });
  });

  describe('the line arriving', () => {
    it('opens the space rather than shoving the page down', async () => {
      // A field that turned invalid grew by a line of text between one frame
      // and the next, and everything under it moved by that much. On a form
      // validated on blur that is the whole page stepping as the reader tabs
      // through it.
      const screen = await render(<Changing to={{ error: 'Not valid.' }} />);

      expect(reveal()).toBeNull();

      await screen.getByRole('button', { name: 'change' }).click();

      await expect.poll(() => reveal()?.dataset.mpReveal).toBe('open');
      expect(getComputedStyle(reveal()!).animationName).toBe('mp-supporting-text-open');
    });

    it('only fades when one message replaces another', async () => {
      // The space is already there. Opening a row that is already open would
      // collapse the line and re-open it, which is a flinch rather than a
      // change of message.
      const screen = await render(
        <Changing from={{ description: 'We will not share it.' }} to={{ error: 'Not valid.' }} />
      );

      expect(reveal()).not.toHaveAttribute('data-mp-reveal');

      await screen.getByRole('button', { name: 'change' }).click();

      await expect.poll(() => reveal()?.dataset.mpReveal).toBe('swap');
      expect(getComputedStyle(reveal()!).animationName).toBe('mp-supporting-text-swap');
    });

    it('treats a page load as nothing having changed', async () => {
      // A server-rendered form would otherwise grow six description lines out
      // of nothing the moment it hydrated, which is a page assembling itself in
      // front of a reader who asked for a form.
      await render(<Line description="We will not share it." />);

      expect(reveal()).not.toBeNull();
      expect(reveal()).not.toHaveAttribute('data-mp-reveal');
      expect(getComputedStyle(reveal()!).animationName).toBe('none');
    });

    it('travels the row rather than a height it would have to guess', async () => {
      // A message is one line or three depending on what it says and how wide
      // the field is, and neither the stylesheet nor the component knows which.
      await render(<Line error="Not valid." />);

      expect(getComputedStyle(reveal()!).display).toBe('grid');
      expect(getComputedStyle(reveal()!).overflow).toBe('hidden');
    });
  });
});
