import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPBottomNavigationItem, MPFloatingBottomNavigation } from 'material-plus-ui';

const bar = () => document.querySelector('.mp-floating-bottom-navigation') as HTMLElement;
const items = () =>
  Array.from(document.querySelectorAll('.mp-bottom-navigation__item')) as HTMLElement[];

const Dot = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 24, height: 24 }}>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
  </svg>
);

const Destinations = () => (
  <>
    <MPBottomNavigationItem value="home" icon={<Dot />}>
      Home
    </MPBottomNavigationItem>
    <MPBottomNavigationItem value="search" icon={<Dot />}>
      Search
    </MPBottomNavigationItem>
    <MPBottomNavigationItem value="saved" icon={<Dot />}>
      Saved
    </MPBottomNavigationItem>
  </>
);

describe('MPFloatingBottomNavigation', () => {
  it('is a named `nav` of ordinary buttons', async () => {
    // Deliberately not a tab list: a bottom navigation changes what the page is,
    // not which panel of one is showing.
    const screen = await render(
      <MPFloatingBottomNavigation label="Main" defaultValue="home">
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    await expect.element(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(bar()).not.toHaveAttribute('role');
    expect(items()[0].tagName).toBe('BUTTON');
  });

  it('marks the destination the reader is on as the page', async () => {
    await render(
      <MPFloatingBottomNavigation defaultValue="search">
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    expect(items()[1]).toHaveAttribute('aria-current', 'page');
    expect(items()[0]).not.toHaveAttribute('aria-current');
  });

  it('moves when a destination is pressed, and says so', async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <MPFloatingBottomNavigation defaultValue="home" onValueChange={onValueChange}>
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    await screen.getByRole('button', { name: 'Saved' }).click();

    expect(onValueChange).toHaveBeenCalledWith('saved');
    expect(items()[2]).toHaveAttribute('aria-current', 'page');
  });

  it('says what it is told when it is controlled', async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <MPFloatingBottomNavigation value="home" onValueChange={onValueChange}>
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    await screen.getByRole('button', { name: 'Saved' }).click();

    expect(onValueChange).toHaveBeenCalledWith('saved');
    // Still on `home`, because nothing told it otherwise.
    expect(items()[0]).toHaveAttribute('aria-current', 'page');
  });

  it('names only the destination the reader is on', async () => {
    // Five drawn names would stretch the lozenge across the screen, and it would
    // stop being a lozenge.
    const screen = await render(
      <MPFloatingBottomNavigation defaultValue="home">
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    // The label is the item's last direct child — `querySelector` would reach
    // into the indicator and find a span that is not it.
    const label = (element: HTMLElement) => element.lastElementChild!;
    const drawn = (element: HTMLElement) => label(element).className.includes('truncate');

    expect(drawn(items()[0])).toBe(true);
    expect(drawn(items()[1])).toBe(false);

    // Undrawn is not unsaid: the name a glyph has no other way of carrying stays
    // in the document.
    await expect.element(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('draws every name when it is asked to', async () => {
    await render(
      <MPFloatingBottomNavigation defaultValue="home" labels="all">
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    for (const item of items()) {
      expect(item.lastElementChild!.className).toContain('truncate');
    }
  });

  it('is only as wide as what is in it', async () => {
    // The whole difference from the full-width bar, and what makes the
    // destinations `shrink-0` rather than `flex-1`.
    await render(
      <div style={{ width: 800 }}>
        <MPFloatingBottomNavigation defaultValue="home" position="static">
          <Destinations />
        </MPFloatingBottomNavigation>
      </div>
    );

    expect(bar().getBoundingClientRect().width).toBeLessThan(400);
  });

  it('is a stadium rather than a sheet with cut corners', async () => {
    await render(
      <MPFloatingBottomNavigation defaultValue="home" position="static">
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    const box = bar().getBoundingClientRect();

    expect(Number.parseFloat(getComputedStyle(bar()).borderTopLeftRadius)).toBeGreaterThanOrEqual(
      box.height / 2 - 1
    );
  });

  it('floats above the bottom edge by `offset`', async () => {
    const screen = await render(
      <MPFloatingBottomNavigation defaultValue="home" offset={24} safeArea={false}>
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    expect(getComputedStyle(bar()).bottom).toBe('24px');

    await screen.rerender(
      <MPFloatingBottomNavigation defaultValue="home" offset="2rem" safeArea={false}>
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    expect(getComputedStyle(bar()).bottom).toBe('32px');
  });

  it('lifts the whole sheet clear of the home indicator', async () => {
    // Unlike the full-width bar, which moves only the row inside it: there is
    // nothing under a floating bar that has to stay covered.
    await render(
      <MPFloatingBottomNavigation defaultValue="home" offset={16}>
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    expect(bar().style.getPropertyValue('--_mp-nav-offset')).toContain(
      'env(safe-area-inset-bottom)'
    );
    expect(getComputedStyle(bar()).paddingBottom).toBe('0px');
  });

  it('sits where `position` says', async () => {
    const screen = await render(
      <MPFloatingBottomNavigation defaultValue="home">
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    expect(getComputedStyle(bar()).position).toBe('fixed');

    await screen.rerender(
      <MPFloatingBottomNavigation defaultValue="home" position="static">
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    expect(getComputedStyle(bar()).position).toBe('static');
  });

  it('is raised, because a flat lozenge reads as a mistake', async () => {
    const screen = await render(
      <MPFloatingBottomNavigation defaultValue="home">
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    expect(getComputedStyle(bar()).boxShadow).toMatch(/rgba\(0, 0, 0, 0\.\d/);

    await screen.rerender(
      <MPFloatingBottomNavigation defaultValue="home" elevation={0}>
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    expect(getComputedStyle(bar()).boxShadow).not.toMatch(/rgba\(0, 0, 0, 0\.\d/);
  });

  it('stops every destination answering when it is disabled', async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <MPFloatingBottomNavigation defaultValue="home" disabled onValueChange={onValueChange}>
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    expect(screen.getByRole('button', { name: 'Saved' }).element()).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('stays neutral whatever weight it paints', async () => {
    // What carries the accent is the one destination that is current, not the
    // sheet the destinations sit on.
    await render(
      <MPFloatingBottomNavigation defaultValue="home" variant="filled">
        <Destinations />
      </MPFloatingBottomNavigation>
    );

    expect(bar().className).not.toContain('_mp-accent');
  });
});
