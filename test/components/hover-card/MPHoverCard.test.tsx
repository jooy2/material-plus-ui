import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { MPHoverCard, MPTextLink } from 'material-plus-ui';
import { parkPointer } from '../../support/pointer';

const card = () => document.querySelector('.mp-hover-card') as HTMLElement | null;

/**
 * The trigger is written out at each call site rather than wrapped in a
 * component of its own, and that is the component's contract rather than a
 * style: Base UI clones the element to attach its ref and its handlers, and a
 * plain function component in the way swallows both — the card then never
 * opens, with nothing to say why.
 */
const trigger = <MPTextLink href="#priya">Priya Raman</MPTextLink>;

/**
 * The card opens on a rest rather than on a move, so every test that wants it
 * open hovers the trigger and then waits for the delay Base UI keeps.
 */
async function openIt(): Promise<void> {
  await userEvent.hover(document.querySelector('a[href="#priya"]')!);
  await vi.waitFor(() => expect(card()).not.toBeNull(), { timeout: 3000 });
}

describe('MPHoverCard', () => {
  it('draws nothing until the pointer rests on the trigger', async () => {
    await parkPointer();
    await render(<MPHoverCard trigger={trigger} title="Priya Raman" />);

    expect(card()).toBeNull();
  });

  it('opens on a rest and closes when the pointer leaves', async () => {
    await render(<MPHoverCard trigger={trigger} title="Priya Raman" delay={0} closeDelay={0} />);

    await openIt();

    expect(card()!.textContent).toContain('Priya Raman');

    await parkPointer();

    await vi.waitFor(() => expect(card()).toBeNull(), { timeout: 3000 });
  });

  it('names itself with its title and describes itself with its line', async () => {
    // Base UI's preview card has no `Title` or `Description` part, so a card
    // whose name was not wired by hand is a sheet a screen reader reads cold.
    await render(
      <MPHoverCard trigger={trigger} title="Priya Raman" description="Platform team" delay={0} />
    );

    await openIt();

    const named = document.getElementById(card()!.getAttribute('aria-labelledby')!);
    const described = document.getElementById(card()!.getAttribute('aria-describedby')!);

    expect(named!.textContent).toBe('Priya Raman');
    expect(described!.textContent).toBe('Platform team');
  });

  it('carries neither name when it was given neither', async () => {
    await render(
      <MPHoverCard trigger={trigger} delay={0}>
        Just a body
      </MPHoverCard>
    );

    await openIt();

    expect(card()).not.toHaveAttribute('aria-labelledby');
    expect(card()).not.toHaveAttribute('aria-describedby');
  });

  it('draws no header when there is nothing to put in it', async () => {
    await render(
      <MPHoverCard trigger={trigger} delay={0}>
        Just a body
      </MPHoverCard>
    );

    await openIt();

    expect(card()!.querySelector('.mp-hover-card__title')).toBeNull();
    expect(card()!.textContent).toBe('Just a body');
  });

  it('is reachable: the pointer can cross into it', async () => {
    // This is the whole difference from a tooltip, which the pointer never
    // reaches — a link in here can be followed.
    await render(
      <MPHoverCard trigger={trigger} title="Priya" delay={0} closeDelay={200}>
        <a href="#team">Platform team</a>
      </MPHoverCard>
    );

    await openIt();
    await userEvent.hover(card()!.querySelector('a')!);

    // Still open with the pointer off the trigger and inside the card.
    expect(card()).not.toBeNull();
    expect(card()!.querySelector('a')).toHaveAttribute('href', '#team');
  });

  it('opens where it is told to, and flips when there is no room', async () => {
    // Rendered well down the page, so `top` has somewhere to go. Against the top
    // of the viewport it would flip, which is Base UI's doing and is right.
    const screen = await render(
      <div style={{ marginTop: 400 }}>
        <MPHoverCard trigger={trigger} title="Priya" side="top" delay={0} />
      </div>
    );

    await openIt();

    expect(card()!.closest('[data-side]')).toHaveAttribute('data-side', 'top');

    await screen.rerender(
      <div style={{ marginTop: 0 }}>
        <MPHoverCard trigger={trigger} title="Priya" side="top" delay={0} />
      </div>
    );

    await vi.waitFor(() =>
      expect(card()!.closest('[data-side]')).toHaveAttribute('data-side', 'bottom')
    );
  });

  it('says when it opens and closes', async () => {
    const onOpenChange = vi.fn();
    await render(
      <MPHoverCard
        trigger={trigger}
        title="Priya"
        delay={0}
        closeDelay={0}
        onOpenChange={onOpenChange}
      />
    );

    await openIt();

    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await parkPointer();

    await vi.waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(false), { timeout: 3000 });
  });

  it('holds open when it is told to, whatever the pointer does', async () => {
    await parkPointer();
    await render(<MPHoverCard trigger={trigger} title="Priya Raman" open />);

    await vi.waitFor(() => expect(card()).not.toBeNull());
    expect(card()!.textContent).toContain('Priya Raman');
  });

  it('takes a width over the one `size` implies', async () => {
    await parkPointer();
    await render(<MPHoverCard trigger={trigger} title="Priya" open width={240} />);

    await vi.waitFor(() => expect(card()).not.toBeNull());
    expect(getComputedStyle(card()!).maxWidth).toBe('240px');
  });

  it('draws the wedge only when it is asked for', async () => {
    await parkPointer();

    const screen = await render(<MPHoverCard trigger={trigger} title="Priya" open />);

    await vi.waitFor(() => expect(card()).not.toBeNull());
    expect(card()!.querySelector('svg')).toBeNull();

    await screen.rerender(<MPHoverCard trigger={trigger} title="Priya" open arrow />);

    expect(card()!.querySelector('svg')).not.toBeNull();
  });

  it('tightens the room inside with `density`', async () => {
    await parkPointer();

    const screen = await render(<MPHoverCard trigger={trigger} title="Priya" open />);

    await vi.waitFor(() => expect(card()).not.toBeNull());

    const loose = Number.parseFloat(getComputedStyle(card()!).paddingTop);

    await screen.rerender(<MPHoverCard trigger={trigger} title="Priya" open density={-2} />);

    expect(Number.parseFloat(getComputedStyle(card()!).paddingTop)).toBeLessThan(loose);
  });
});
