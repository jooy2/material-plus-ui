import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { MPButton, MPTour } from 'material-plus-ui';
import type { MPTourStep } from 'material-plus-ui';

const STEPS: MPTourStep[] = [
  { target: '#one', title: 'The first', content: 'What it does.' },
  { target: '#two', title: 'The second', content: 'What that does.' },
  { title: 'The last', content: 'And you are done.' }
];

/** A page for the tour to stand over, with two things it can point at. */
function Page(props: Record<string, unknown>) {
  return (
    <>
      <MPButton id="one">One</MPButton>
      <MPButton id="two">Two</MPButton>
      <MPTour steps={STEPS} locale="en-US" defaultOpen {...props} />
    </>
  );
}

const card = () => document.querySelector('.mp-tour') as HTMLElement | null;
const scrim = () => document.querySelector('.mp-tour__scrim') as HTMLElement | null;

describe('MPTour', () => {
  it('stands over the page on the step it was given', async () => {
    const screen = await render(<Page />);

    await vi.waitFor(() => expect(card()).not.toBeNull());
    expect(card()?.textContent).toContain('The first');
    await expect.element(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('draws nothing at all when there are no steps', async () => {
    // Not an empty card: a tour with nothing to say is a tour that should not
    // have been rendered, and drawing its chrome would say otherwise.
    await render(<MPTour steps={[]} defaultOpen locale="en-US" />);

    expect(card()).toBeNull();
    expect(scrim()).toBeNull();
  });

  describe('the way through', () => {
    it('walks forward and back, and only offers what there is', async () => {
      const screen = await render(<Page />);

      await vi.waitFor(() => expect(card()).not.toBeNull());

      // Nothing to go back to on the first step.
      expect(screen.getByRole('button', { name: 'Back' }).query()).toBeNull();

      await screen.getByRole('button', { name: 'Next' }).click();
      await vi.waitFor(() => expect(card()?.textContent).toContain('The second'));

      await screen.getByRole('button', { name: 'Back' }).click();
      await vi.waitFor(() => expect(card()?.textContent).toContain('The first'));
    });

    it('turns Next into Done on the last step, and drops Skip with it', async () => {
      // There is nothing left to skip past, so a Skip button beside Done would
      // be two words for closing the same card.
      const screen = await render(<Page defaultStep={2} />);

      await vi.waitFor(() => expect(card()).not.toBeNull());

      expect(screen.getByRole('button', { name: 'Next' }).query()).toBeNull();
      expect(screen.getByRole('button', { name: 'Skip' }).query()).toBeNull();
      await expect.element(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    });

    it('reports Done before it closes', async () => {
      const onFinish = vi.fn();
      const onOpenChange = vi.fn();
      const screen = await render(
        <Page defaultStep={2} onFinish={onFinish} onOpenChange={onOpenChange} />
      );

      await vi.waitFor(() => expect(card()).not.toBeNull());
      await screen.getByRole('button', { name: 'Done' }).click();

      expect(onFinish).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      await vi.waitFor(() => expect(card()).toBeNull());
    });

    it('reports the step rather than keeping it, when it is controlled', async () => {
      const onStepChange = vi.fn();
      const screen = await render(<Page step={0} onStepChange={onStepChange} />);

      await vi.waitFor(() => expect(card()).not.toBeNull());
      await screen.getByRole('button', { name: 'Next' }).click();

      expect(onStepChange).toHaveBeenCalledWith(1);
      expect(card()?.textContent).toContain('The first');
    });

    it('clamps a step past the end rather than drawing nothing', async () => {
      await render(<Page defaultStep={9} />);

      await vi.waitFor(() => expect(card()).not.toBeNull());
      expect(card()?.textContent).toContain('The last');
    });
  });

  describe('the dimming', () => {
    it('never takes the pointer, which is the whole difference from a dialog', async () => {
      // A reader can use the control being pointed at while the card is up.
      await render(<Page />);

      await vi.waitFor(() => expect(scrim()).not.toBeNull());

      expect(getComputedStyle(scrim() as HTMLElement).pointerEvents).toBe('none');
    });

    it('is one element with a hole in it, sized to the target', async () => {
      // Four rectangles around the target would show their seams as hairlines
      // the moment the dimming is anything but opaque, and at 32% it is not.
      const screen = await render(<Page />);

      await vi.waitFor(() => expect(scrim()).not.toBeNull());

      const target = screen.container.querySelector('#one') as HTMLElement;
      const rect = target.getBoundingClientRect();
      const hole = (scrim() as HTMLElement).getBoundingClientRect();

      // Six pixels of air around it by default.
      expect(Math.round(hole.width)).toBe(Math.round(rect.width) + 12);
      expect(Math.round(hole.height)).toBe(Math.round(rect.height) + 12);
    });

    it('shows the card on a step that points at nothing', async () => {
      // Base UI holds an unanchored popup at the top-left corner at `opacity: 0`,
      // so a welcome step given no anchor at all is a step nobody sees.
      await render(<Page defaultStep={2} />);

      await vi.waitFor(() => expect(card()).not.toBeNull());

      const positioner = card()?.closest('.mp-portal') as HTMLElement;
      const rect = (card() as HTMLElement).getBoundingClientRect();

      expect(getComputedStyle(positioner).opacity).not.toBe('0');
      expect(rect.top).toBeGreaterThan(0);
      expect(rect.width).toBeGreaterThan(0);
    });

    it('covers everything on a step that points at nothing', async () => {
      // Which is what a welcome step and a closing step are.
      await render(<Page defaultStep={2} />);

      await vi.waitFor(() => expect(scrim()).not.toBeNull());

      const hole = (scrim() as HTMLElement).getBoundingClientRect();

      expect(Math.round(hole.width)).toBe(window.innerWidth);
    });

    it('takes the air the step asks for', async () => {
      const screen = await render(
        <Page steps={[{ target: '#one', title: 'Tight', padding: 0 }, ...STEPS.slice(1)]} />
      );

      await vi.waitFor(() => expect(scrim()).not.toBeNull());

      const rect = (screen.container.querySelector('#one') as HTMLElement).getBoundingClientRect();
      const hole = (scrim() as HTMLElement).getBoundingClientRect();

      expect(Math.round(hole.width)).toBe(Math.round(rect.width));
    });

    it('is not drawn at all when it is turned off', async () => {
      await render(<Page scrim={false} />);

      await vi.waitFor(() => expect(card()).not.toBeNull());
      expect(scrim()).toBeNull();
    });
  });

  describe('the ways out', () => {
    it('is not ended by a press on the page it is pointing at', async () => {
      // Using the page is exactly what a tour is for.
      const screen = await render(<Page />);

      await vi.waitFor(() => expect(card()).not.toBeNull());
      await screen.getByRole('button', { name: 'One' }).click();

      expect(card()).not.toBeNull();
    });

    it('is ended by Escape', async () => {
      await render(<Page />);

      await vi.waitFor(() => expect(card()).not.toBeNull());
      await userEvent.keyboard('{Escape}');

      await vi.waitFor(() => expect(card()).toBeNull());
    });

    it('is not ended by Escape when it says it may not be', async () => {
      // Rendered fresh rather than by a rerender: the tour above is
      // uncontrolled, so `defaultOpen` has nothing left to say once it has shut.
      await render(<Page dismissible={false} />);

      await vi.waitFor(() => expect(card()).not.toBeNull());
      await userEvent.keyboard('{Escape}');

      expect(card()).not.toBeNull();
    });

    it('offers no × when it says it may not be dismissed', async () => {
      // A × that did nothing would be worse than none, and one that worked would
      // make `dismissible={false}` a lie.
      const screen = await render(<Page dismissible={false} />);

      await vi.waitFor(() => expect(card()).not.toBeNull());
      expect(screen.getByRole('button', { name: 'Close' }).query()).toBeNull();
    });

    it('ends on Skip without reporting a finish', async () => {
      // Skipping is not finishing, and an onboarding flow that marked itself
      // complete when somebody left it would never show again.
      const onFinish = vi.fn();
      const screen = await render(<Page onFinish={onFinish} />);

      await vi.waitFor(() => expect(card()).not.toBeNull());
      await screen.getByRole('button', { name: 'Skip' }).click();

      await vi.waitFor(() => expect(card()).toBeNull());
      expect(onFinish).not.toHaveBeenCalled();
    });
  });

  it('says its own words in the language it was given', async () => {
    const screen = await render(<Page locale="ko" />);

    await vi.waitFor(() => expect(card()).not.toBeNull());

    await expect.element(screen.getByRole('button', { name: '다음' })).toBeInTheDocument();
    await expect.element(screen.getByText('3단계 중 1단계')).toBeInTheDocument();
  });

  it('takes an override for one word without losing the rest', async () => {
    const screen = await render(<Page labels={{ next: 'Show me' }} />);

    await vi.waitFor(() => expect(card()).not.toBeNull());

    await expect.element(screen.getByRole('button', { name: 'Show me' })).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
  });

  it('follows a target that has moved', async () => {
    // A tour runs over a live page: something below can load and the hole would
    // be left over a piece of empty background.
    function Moving() {
      const [tall, setTall] = useState(false);

      return (
        <>
          <div style={{ height: tall ? 120 : 0 }} />
          <MPButton id="one" onClick={() => setTall(true)}>
            One
          </MPButton>
          <MPTour steps={[STEPS[0]]} locale="en-US" defaultOpen scrollIntoView={false} />
        </>
      );
    }

    const screen = await render(<Moving />);

    await vi.waitFor(() => expect(scrim()).not.toBeNull());

    const before = (scrim() as HTMLElement).getBoundingClientRect().top;

    // Exact, because the card's own "Done" contains "one".
    await screen.getByRole('button', { name: 'One', exact: true }).click();

    await vi.waitFor(() =>
      expect((scrim() as HTMLElement).getBoundingClientRect().top).toBeGreaterThan(before + 100)
    );
  });
});
