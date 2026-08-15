import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { ICONS, MPBottomNavigation, MPBottomNavigationItem, MPIcon } from 'material-plus-ui';
import { userEvent } from 'vitest/browser';

function Bar(props: React.ComponentProps<typeof MPBottomNavigation>) {
  return (
    <MPBottomNavigation label="Main" position="static" {...props}>
      <MPBottomNavigationItem value="home" icon={<MPIcon icon={ICONS.info} />}>
        Home
      </MPBottomNavigationItem>
      <MPBottomNavigationItem value="search" icon={<MPIcon icon={ICONS.search} />}>
        Search
      </MPBottomNavigationItem>
      <MPBottomNavigationItem value="saved" icon={<MPIcon icon={ICONS.check} />} disabled>
        Saved
      </MPBottomNavigationItem>
    </MPBottomNavigation>
  );
}

const items = (screen: { container: Element }) =>
  Array.from(screen.container.querySelectorAll('.mp-bottom-navigation__item'));

describe('MPBottomNavigation', () => {
  it('is a named landmark holding the destinations', async () => {
    const screen = await render(<Bar defaultValue="home" />);

    await expect.element(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(items({ container: screen.container })).toHaveLength(3);
  });

  it('marks the destination the reader is on as a page rather than as a tab', async () => {
    const screen = await render(<Bar defaultValue="search" />);
    const [home, search] = items({ container: screen.container });

    expect(search).toHaveAttribute('aria-current', 'page');
    expect(home).not.toHaveAttribute('aria-current');
    // The honest claim: no `tab` role anywhere, because there are no panels and
    // no roving focus to go with it.
    expect(screen.container.querySelector('[role="tab"]')).toBeNull();
  });

  it('moves when a destination is pressed', async () => {
    const onValueChange = vi.fn();
    const screen = await render(<Bar defaultValue="home" onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(onValueChange).toHaveBeenCalledWith('search');
    expect(items({ container: screen.container })[1]).toHaveAttribute('aria-current', 'page');
  });

  it('leaves a controlled bar where the caller put it', async () => {
    const onValueChange = vi.fn();
    const screen = await render(<Bar value="home" onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(onValueChange).toHaveBeenCalledWith('search');
    expect(items({ container: screen.container })[0]).toHaveAttribute('aria-current', 'page');
  });

  it("marks the current destination with Material's own active indicator", async () => {
    const screen = await render(<Bar defaultValue="home" />);
    const reference = await render(
      <div
        className="reference"
        style={{ backgroundColor: 'var(--_mp-color-secondary-container)' }}
      />
    );
    const indicator = (index: number) =>
      getComputedStyle(items({ container: screen.container })[index].firstElementChild!);

    expect(indicator(0).backgroundColor).toBe(
      getComputedStyle(reference.container.querySelector('.reference')!).backgroundColor
    );
    expect(indicator(1).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('is 80dp tall, which is the specification’s own', async () => {
    const screen = await render(<Bar defaultValue="home" />);
    const row = screen.container.querySelector('.mp-bottom-navigation')!.firstElementChild!;

    expect(row.getBoundingClientRect().height).toBe(80);
  });

  it('divides the width evenly between the destinations', async () => {
    const screen = await render(
      <div style={{ width: 360 }}>
        <Bar defaultValue="home" />
      </div>
    );
    const widths = items({ container: screen.container }).map(
      (item) => item.getBoundingClientRect().width
    );

    expect(widths[0]).toBeCloseTo(widths[1], 0);
    expect(widths[1]).toBeCloseTo(widths[2], 0);
  });

  it('keeps an undrawn name in the document', async () => {
    // Undrawn is not unsaid: a glyph on its own has no accessible name at all.
    const screen = await render(<Bar defaultValue="home" labels="none" />);

    await expect.element(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(
      items({ container: screen.container })[1].querySelector('[class*="clip-path"]')
    ).not.toBeNull();
  });

  it('names only the current destination when asked to', async () => {
    const screen = await render(<Bar defaultValue="home" labels="selected" />);
    const drawn = (index: number) =>
      items({ container: screen.container })[index].lastElementChild!.getBoundingClientRect().width;

    expect(drawn(0)).toBeGreaterThan(1);
    expect(drawn(1)).toBe(1);
  });

  it('swaps the glyph for the destination the reader is on', async () => {
    const screen = await render(
      <MPBottomNavigation position="static" defaultValue="home" label="Main">
        <MPBottomNavigationItem
          value="home"
          icon={<span>outline</span>}
          activeIcon={<span>filled</span>}
        >
          Home
        </MPBottomNavigationItem>
        <MPBottomNavigationItem
          value="search"
          icon={<span>outline</span>}
          activeIcon={<span>filled</span>}
        >
          Search
        </MPBottomNavigationItem>
      </MPBottomNavigation>
    );
    const glyph = (index: number) =>
      items({ container: screen.container })[index].firstElementChild!.textContent;

    expect(glyph(0)).toBe('filled');
    expect(glyph(1)).toBe('outline');
  });

  it('renders a real link when it is given somewhere to go', async () => {
    const screen = await render(
      <MPBottomNavigation position="static" defaultValue="home" label="Main">
        <MPBottomNavigationItem value="home" href="/home">
          Home
        </MPBottomNavigationItem>
        <MPBottomNavigationItem value="saved" href="/saved" disabled>
          Saved
        </MPBottomNavigationItem>
      </MPBottomNavigation>
    );
    const [home, saved] = items({ container: screen.container });

    expect(home.tagName).toBe('A');
    expect(home).toHaveAttribute('href', '/home');
    // A link with nowhere to go is not a link: `disabled` is not something an
    // `<a>` can be, so the destination is taken away instead.
    expect(saved).not.toHaveAttribute('href');
    expect(saved).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not move for a disabled destination', async () => {
    const onValueChange = vi.fn();
    const screen = await render(<Bar defaultValue="home" onValueChange={onValueChange} />);

    await expect.element(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('stops the whole bar answering when the bar is disabled', async () => {
    const screen = await render(<Bar defaultValue="home" disabled />);

    for (const item of items({ container: screen.container })) {
      expect(item).toBeDisabled();
    }
  });

  it('holds itself against the bottom of the window by default', async () => {
    const screen = await render(
      <MPBottomNavigation label="Main" defaultValue="home">
        <MPBottomNavigationItem value="home">Home</MPBottomNavigationItem>
      </MPBottomNavigation>
    );
    const bar = getComputedStyle(screen.container.querySelector('.mp-bottom-navigation')!);

    expect(bar.position).toBe('fixed');
    expect(bar.bottom).toBe('0px');
  });

  it('separates itself by tone rather than by a rule, unless it is asked to', async () => {
    const screen = await render(
      <div>
        <Bar defaultValue="home" className="plain" />
        <Bar defaultValue="home" divider className="ruled" />
      </div>
    );
    const border = (selector: string) =>
      getComputedStyle(screen.container.querySelector(selector)!).borderTopWidth;

    expect(border('.plain')).toBe('0px');
    expect(border('.ruled')).toBe('1px');
  });

  it('publishes the rung it was drawn at', async () => {
    const screen = await render(<Bar defaultValue="home" size="sm" id="main" />);
    const bar = screen.container.querySelector('.mp-bottom-navigation')!;

    expect(bar).toHaveAttribute('data-mp-size', 'sm');
    expect(bar).toHaveAttribute('id', 'main');
  });
});
