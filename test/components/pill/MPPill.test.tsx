import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPPill } from 'material-plus-ui';

describe('MPPill', () => {
  describe('rendering', () => {
    it('renders the headline and the line under it', async () => {
      const screen = await render(<MPPill title="Recording" description="00:42" />);

      await expect.element(screen.getByText('Recording')).toBeInTheDocument();
      await expect.element(screen.getByText('00:42')).toBeInTheDocument();
    });

    it('renders both slots and whatever else the middle was given', async () => {
      const screen = await render(
        <MPPill
          title="Uploading"
          startIcon={<span data-testid="glyph">●</span>}
          endIcon={<button type="button">Stop</button>}
        >
          <span data-testid="readout">3 of 8</span>
        </MPPill>
      );

      await expect.element(screen.getByTestId('glyph')).toBeInTheDocument();
      await expect.element(screen.getByTestId('readout')).toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
    });

    it('publishes the rung and the variant it was drawn at', async () => {
      const screen = await render(<MPPill size="lg" variant="tonal" title="On air" />);
      const root = screen.container.querySelector('.mp-pill');

      expect(root).toHaveAttribute('data-mp-size', 'lg');
      expect(root).toHaveAttribute('data-mp-variant', 'tonal');
    });
  });

  describe('the shape', () => {
    it('is a stadium while it is collapsed', async () => {
      const screen = await render(<MPPill title="On air" />);

      expect(screen.container.querySelector('.mp-pill')!.className).toContain('rounded-mp-full');
    });

    it('moves to the sheet corner once it has grown', async () => {
      // `corner-full` on a box six lines tall is a corner a third of its height,
      // which eats the first two words of every line.
      const screen = await render(<MPPill title="On air" details="Two people" expanded />);
      const root = screen.container.querySelector('.mp-pill')!;

      expect(root.className).toContain('rounded-mp-xl');
      expect(root).toHaveAttribute('data-mp-expanded', 'true');
    });
  });

  describe('details', () => {
    it('is closed to zero height and taken out of reach', async () => {
      const screen = await render(
        <MPPill title="On air" details={<a href="#somewhere">A link in the details</a>} />
      );
      const panel = screen.container.querySelector('[inert]') as HTMLElement;

      expect(panel).not.toBeNull();
      expect(panel.style.height).toBe('0px');
    });

    it('opens to the height it measured', async () => {
      const screen = await render(<MPPill title="On air" details="Two people" expanded />);
      const panel = screen.container.querySelector('.mp-pill > div:last-child') as HTMLElement;

      expect(panel.hasAttribute('inert')).toBe(false);
      expect(Number.parseFloat(panel.style.height)).toBeGreaterThan(0);
    });

    /*
     * React 18 and React 19 want opposite values for `inert`, and each drops the
     * other's spelling with only a console warning to say so — so the DOM is the
     * only honest place to assert it, and the silence is part of the assertion.
     */
    it('lands the attribute on the element itself, quietly', async () => {
      const warn = vi.spyOn(console, 'error').mockImplementation(() => {});

      const screen = await render(<MPPill title="On air" details="Two people" />);
      const panel = screen.container.querySelector('.mp-pill > div:last-child') as HTMLElement;

      expect(panel.hasAttribute('inert')).toBe(true);
      // The IDL property, which is what actually takes the subtree out of reach.
      expect(panel.inert).toBe(true);
      expect(warn).not.toHaveBeenCalled();

      warn.mockRestore();
    });

    it('draws no panel at all when there is nothing to reveal', async () => {
      const screen = await render(<MPPill title="On air" />);

      expect(screen.container.querySelector('[inert]')).toBeNull();
    });

    it('says whether the details are showing, and what they are', async () => {
      // A control that changes what is on screen without saying so leaves a
      // screen reader to find out by accident.
      const screen = await render(
        <MPPill title="On air" details="Two people" onClick={() => {}} />
      );
      const button = screen.getByRole('button', { name: /On air/ }).element();

      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(
        screen.container.querySelector(`#${CSS.escape(button.getAttribute('aria-controls')!)}`)
      ).not.toBeNull();
    });

    it('turns that over when they open', async () => {
      const screen = await render(
        <MPPill title="On air" details="Two people" onClick={() => {}} expanded />
      );

      expect(screen.getByRole('button', { name: /On air/ }).element()).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });

    it('claims neither when the pill has no details', async () => {
      const screen = await render(<MPPill title="On air" onClick={() => {}} />);
      const button = screen.getByRole('button', { name: /On air/ }).element();

      expect(button).not.toHaveAttribute('aria-expanded');
      expect(button).not.toHaveAttribute('aria-controls');
    });
  });

  describe('pressing', () => {
    it('is not a button until there is something to call', async () => {
      const screen = await render(<MPPill title="On air" />);

      expect(screen.container.querySelectorAll('button')).toHaveLength(0);
    });

    it('makes the middle a real button, and calls back', async () => {
      const onClick = vi.fn();
      const screen = await render(<MPPill title="Back to the call" onClick={onClick} />);

      await screen.getByRole('button', { name: 'Back to the call' }).click();

      expect(onClick).toHaveBeenCalled();
    });

    it('keeps `endIcon` outside that button', async () => {
      // A `<button>` holding whatever control somebody put in `endIcon` is markup
      // the browser rewrites on parse.
      const onEnd = vi.fn();
      const screen = await render(
        <MPPill
          title="On a call"
          onClick={() => {}}
          endIcon={
            <button type="button" onClick={onEnd}>
              Hang up
            </button>
          }
        />
      );
      const middle = screen.container.querySelector('.mp-pill button')!;

      expect(middle.querySelector('button')).toBeNull();

      await screen.getByRole('button', { name: 'Hang up' }).click();

      expect(onEnd).toHaveBeenCalled();
    });
  });

  describe('position', () => {
    it('sits in the flow by default', async () => {
      const screen = await render(<MPPill title="On air" />);
      const root = screen.container.querySelector('.mp-pill')!;

      expect(root.className).not.toContain('fixed');
      expect(root.className).not.toContain('sticky');
    });

    it('pins itself to the viewport and centres itself with auto margins', async () => {
      // `mx-auto` rather than a translate: auto margins are direction-agnostic,
      // so the lozenge stays centred under RTL and nothing is transformed.
      const screen = await render(<MPPill title="On air" position="fixed" side="bottom" />);
      const root = screen.container.querySelector('.mp-pill')!;

      expect(root.className).toContain('fixed');
      expect(root.className).toContain('bottom-3');
      expect(root.className).toContain('mx-auto');
    });
  });
});
