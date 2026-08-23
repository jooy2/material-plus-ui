import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { ICONS, MPButton, MPFloatingActionButton, MPIcon } from 'material-plus-ui';
import { userEvent } from 'vitest/browser';

const Plus = <MPIcon icon={ICONS.add} />;

const styles = (screen: { container: Element }) =>
  getComputedStyle(screen.container.querySelector('.mp-fab')!);

describe('MPFloatingActionButton', () => {
  it('has a name even though it is only a glyph', async () => {
    const screen = await render(<MPFloatingActionButton icon={Plus} label="Compose" />);

    await expect.element(screen.getByRole('button', { name: 'Compose' })).toBeInTheDocument();
  });

  it('fires when pressed', async () => {
    const onClick = vi.fn();
    const screen = await render(
      <MPFloatingActionButton icon={Plus} label="Compose" onClick={onClick} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Compose' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is Material's own default FAB before anything is chosen", async () => {
    // `tonal` on `primary`, which is `primary-container` under
    // `on-primary-container` — the container the specification draws. Compared
    // against an element painted with the role rather than against the custom
    // property, which is an unresolved `oklch(from …)` expression until
    // something asks a real property for it.
    const screen = await render(
      <div>
        <MPFloatingActionButton icon={Plus} label="Compose" />
        <div
          className="reference"
          style={{
            backgroundColor: 'var(--_mp-color-primary-container)',
            color: 'var(--_mp-color-on-primary-container)'
          }}
        />
      </div>
    );
    const root = screen.container.querySelector('.mp-fab')!;
    const reference = getComputedStyle(screen.container.querySelector('.reference')!);

    expect(root).toHaveAttribute('data-mp-variant', 'tonal');
    expect(getComputedStyle(root).backgroundColor).toBe(reference.backgroundColor);
    expect(getComputedStyle(root).color).toBe(reference.color);
  });

  it('is 56dp at `md`, with the specification’s two other sizes on the ladder', async () => {
    const screen = await render(
      <div>
        <MPFloatingActionButton icon={Plus} label="Small" size="xs" className="small" />
        <MPFloatingActionButton icon={Plus} label="Plain" className="plain" />
        <MPFloatingActionButton icon={Plus} label="Large" size="xl" className="large" />
      </div>
    );
    const box = (selector: string) =>
      screen.container.querySelector(selector)!.getBoundingClientRect();

    expect(box('.small').height).toBe(40);
    expect(box('.plain').height).toBe(56);
    expect(box('.large').height).toBe(96);
  });

  it('moves the corner with the size, which is the one place this library does', async () => {
    const screen = await render(
      <div>
        <MPFloatingActionButton icon={Plus} label="Small" size="xs" className="small" />
        <MPFloatingActionButton icon={Plus} label="Plain" className="plain" />
        <MPFloatingActionButton icon={Plus} label="Large" size="xl" className="large" />
      </div>
    );
    const radius = (selector: string) =>
      getComputedStyle(screen.container.querySelector(selector)!).borderTopLeftRadius;

    // MD3: corner-medium on the small button, corner-large on the plain one and
    // corner-extra-large on the large one.
    expect(radius('.small')).toBe('12px');
    expect(radius('.plain')).toBe('16px');
    expect(radius('.large')).toBe('28px');
  });

  it('writes the label on the button when extended', async () => {
    const screen = await render(<MPFloatingActionButton icon={Plus} label="Compose" extended />);

    await expect.element(screen.getByText('Compose')).toBeInTheDocument();
    // A stadium, not a disc: as wide as the label needs and no narrower than the
    // specification's 80dp.
    expect(
      screen.container.querySelector('.mp-fab')!.getBoundingClientRect().width
    ).toBeGreaterThan(80);
  });

  it('draws no label while it is a disc, and stays square', async () => {
    // The label is in the DOM at both widths — an element that is not there has
    // no width to travel from, and travelling is what extending now does. What
    // makes a disc a disc is that its track is closed to nothing, inside a
    // button that clips. The name is unaffected either way: `aria-label` names
    // the button, and a name replaces its contents rather than adding to them.
    const screen = await render(<MPFloatingActionButton icon={Plus} label="Compose" />);
    const fab = screen.container.querySelector('.mp-fab') as HTMLElement;
    const track = fab.querySelector('span.grid') as HTMLElement;

    expect(track.getBoundingClientRect().width).toBe(0);

    const box = fab.getBoundingClientRect();

    expect(Math.round(box.width)).toBe(Math.round(box.height));
  });

  it('travels between the disc and the stadium rather than swapping one for the other', async () => {
    // MD3 draws the disc *becoming* a stadium, which is what a caller extending
    // one on a scroll is asking for. The width cannot be transitioned directly —
    // there is no interpolating a definite width towards `auto` — so the
    // distance is split: the button raises its own floor and its padding, and
    // the label's grid track carries the rest between `0fr` and `1fr`.
    //
    // Read one commit after the toggle, where the button has been told to
    // extend but has not arrived: still near its disc width, with the track
    // barely open. A component that swapped one width for the other would
    // already be at its full width here.
    function Toggling() {
      const [extended, setExtended] = useState(false);

      return (
        <>
          <MPButton onClick={() => setExtended(true)}>Extend</MPButton>
          <MPFloatingActionButton icon={Plus} label="Compose" extended={extended} />
        </>
      );
    }

    const screen = await render(<Toggling />);
    const fab = () => screen.container.querySelector('.mp-fab') as HTMLElement;
    const closed = fab().getBoundingClientRect().width;

    await screen.getByRole('button', { name: 'Extend' }).click();

    expect(fab().getBoundingClientRect().width).toBeLessThan(closed + 20);

    await expect.poll(() => fab().getBoundingClientRect().width).toBeGreaterThan(80);
  });

  it('floats over the page by default, and can be pinned to a region instead', async () => {
    const screen = await render(
      <div>
        <MPFloatingActionButton icon={Plus} label="Window" className="window" />
        <div style={{ position: 'relative' }}>
          <MPFloatingActionButton icon={Plus} label="Region" position="absolute" className="card" />
        </div>
        <MPFloatingActionButton icon={Plus} label="Flow" position="static" className="flow" />
      </div>
    );
    const position = (selector: string) =>
      getComputedStyle(screen.container.querySelector(selector)!).position;

    expect(position('.window')).toBe('fixed');
    expect(position('.card')).toBe('absolute');
    // `relative` rather than the keyword: `static` means back in the flow, and a
    // button in the flow still has a state layer that needs something to fill.
    expect(position('.flow')).toBe('relative');
  });

  it('sits in the corner it was pinned to, at the offset it was given', async () => {
    const screen = await render(
      <MPFloatingActionButton icon={Plus} label="Compose" corner="top-start" offset={32} />
    );
    const root = getComputedStyle(screen.container.querySelector('.mp-fab')!);

    expect(root.top).toBe('32px');
    expect(root.left).toBe('32px');
  });

  it('takes a length as well as a number of pixels', async () => {
    const screen = await render(
      <MPFloatingActionButton icon={Plus} label="Compose" offset="2rem" />
    );

    expect(styles({ container: screen.container }).bottom).toBe('32px');
  });

  it('stops floating while it is unavailable', async () => {
    // A button still casting a shadow while it cannot be pressed is a button
    // still claiming to be the thing to do.
    const screen = await render(<MPFloatingActionButton icon={Plus} label="Compose" disabled />);
    const root = screen.container.querySelector('.mp-fab')!;
    // `shadow-none` composites to a chain of fully transparent shadows rather
    // than to the keyword, so the assertion is that nothing in it paints.
    const colours = getComputedStyle(root).boxShadow.match(/rgba?\([^)]+\)/g) ?? [];

    expect(root).toBeDisabled();
    expect(colours.every((colour) => colour === 'rgba(0, 0, 0, 0)')).toBe(true);
  });

  it('does not submit the form around it unless it is asked to', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const screen = await render(
      <form onSubmit={onSubmit}>
        <MPFloatingActionButton icon={Plus} label="Compose" position="static" />
      </form>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Compose' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('publishes the rung it was drawn at', async () => {
    const screen = await render(
      <MPFloatingActionButton icon={Plus} label="Compose" size="lg" id="compose" />
    );
    const root = screen.container.querySelector('.mp-fab')!;

    expect(root).toHaveAttribute('data-mp-size', 'lg');
    expect(root).toHaveAttribute('id', 'compose');
  });
});
