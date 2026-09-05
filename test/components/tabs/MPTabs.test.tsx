import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPTab, MPTabPanel, MPTabs } from 'material-plus-ui';
import { userEvent } from 'vitest/browser';

function Bar(props: React.ComponentProps<typeof MPTabs>) {
  return (
    <MPTabs aria-label="Sections" {...props}>
      <MPTab value="overview">Overview</MPTab>
      <MPTab value="pricing">Pricing</MPTab>
      <MPTab value="faq" disabled>
        FAQ
      </MPTab>

      <MPTabPanel value="overview">What it is</MPTabPanel>
      <MPTabPanel value="pricing">What it costs</MPTabPanel>
      <MPTabPanel value="faq">Everything else</MPTabPanel>
    </MPTabs>
  );
}

describe('MPTabs', () => {
  it('shows the panel belonging to the chosen tab, and only that one', async () => {
    const screen = await render(<Bar defaultValue="overview" />);

    await expect.element(screen.getByText('What it is')).toBeInTheDocument();
    expect(screen.container.textContent).not.toContain('What it costs');
  });

  it('sorts tabs into the bar and panels into the body', async () => {
    const screen = await render(<Bar defaultValue="overview" />);
    const list = screen.container.querySelector('.mp-tabs__list')!;

    expect(list.querySelectorAll('[role="tab"]')).toHaveLength(3);
    expect(list.querySelector('[role="tabpanel"]')).toBeNull();
  });

  /*
   * A fragment is the one thing between the tags that is neither a tab nor a
   * panel and is not a mistake either: a pair that comes and goes together is
   * written that way. Compared by identity alone it fell to the bar, and the
   * panel inside it was laid out *as a tab*.
   */
  it('sorts through a fragment holding a pair', async () => {
    const screen = await render(
      <MPTabs aria-label="Sections" defaultValue="a">
        <MPTab value="a">A</MPTab>
        <MPTabPanel value="a">First panel</MPTabPanel>
        <>
          <MPTab value="b">B</MPTab>
          <MPTabPanel value="b">Second panel</MPTabPanel>
        </>
      </MPTabs>
    );
    const list = screen.container.querySelector('.mp-tabs__list')!;

    expect(list.querySelectorAll('[role="tab"]')).toHaveLength(2);
    expect(list.querySelector('[role="tabpanel"]')).toBeNull();

    await screen.getByRole('tab', { name: 'B' }).click();

    await expect.element(screen.getByText('Second panel')).toBeInTheDocument();
  });

  it('keeps two fragments’ children apart', async () => {
    // `React.Children.toArray` numbers each call from scratch, so two fragments
    // would each hand back a `.0` and React would reconcile the two panels as
    // one. A warning here is the signal that the keys collided.
    const warn = vi.spyOn(console, 'error').mockImplementation(() => {});

    const screen = await render(
      <MPTabs aria-label="Sections" defaultValue="a">
        <>
          <MPTab value="a">A</MPTab>
          <MPTabPanel value="a">First panel</MPTabPanel>
        </>
        <>
          <MPTab value="b">B</MPTab>
          <MPTabPanel value="b">Second panel</MPTabPanel>
        </>
      </MPTabs>
    );

    expect(screen.container.querySelectorAll('[role="tab"]')).toHaveLength(2);
    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });

  it('wires each tab to its panel', async () => {
    const screen = await render(<Bar defaultValue="pricing" />);
    const chosen = screen.container.querySelector('[role="tab"][aria-selected="true"]')!;
    const panel = screen.container.querySelector('[role="tabpanel"]')!;

    expect(chosen).toHaveAttribute('aria-controls', panel.getAttribute('id'));
    expect(chosen.textContent).toContain('Pricing');
  });

  it('names the bar', async () => {
    const screen = await render(<Bar defaultValue="overview" />);

    expect(screen.container.querySelector('.mp-tabs__list')).toHaveAttribute(
      'aria-label',
      'Sections'
    );
  });

  it('changes panel when a tab is pressed', async () => {
    const onValueChange = vi.fn();
    const screen = await render(<Bar defaultValue="overview" onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Pricing' }));

    await expect.element(screen.getByText('What it costs')).toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledWith('pricing');
  });

  it('fades the arriving panel in', async () => {
    // The bar's indicator already slid and the content it points at cut, which
    // left the decoration animating and the thing it is for snapping. MD3 fades
    // the content through.
    //
    // There is no exit to match, and that is structural rather than a matter of
    // taste: Base UI keeps a leaving panel in the layout until its transition
    // finishes, so a panel that faded out would put both in the flow and grow
    // the page to hold the pair before collapsing onto the new one. It is not
    // asserted here because it cannot honestly be — with no transition to wait
    // for, the leaving panel is unmounted on the *next frame* rather than in the
    // commit the click produced, and how many frames that takes is the engine's
    // business. WebKit was still holding it where Chromium was not.
    const screen = await render(<Bar defaultValue="overview" />);
    const arriving = () => screen.getByText('What it costs').element();

    // Nothing on the first paint: a bar that faded its own content in on page
    // load would be answering a question nobody asked.
    expect(getComputedStyle(screen.getByText('What it is').element()).opacity).toBe('1');

    await userEvent.click(screen.getByRole('tab', { name: 'Pricing' }));

    // Partway rather than at a named frame. The fade is 200ms wide and every
    // engine lands somewhere different inside it — Firefox was already at 0.12
    // where Chromium was still at 0. What is being asked is whether the panel
    // arrived at less than full strength, not which frame it was on when asked.
    expect(Number(getComputedStyle(arriving()).opacity)).toBeLessThan(1);
    expect(getComputedStyle(arriving()).transitionProperty).toBe('opacity');
    expect(getComputedStyle(arriving()).transitionDuration).toBe('0.2s');

    await expect.poll(() => getComputedStyle(arriving()).opacity).toBe('1');
    await expect.poll(() => screen.container.querySelectorAll('.mp-tabs__panel').length).toBe(1);
  });

  it('leaves a controlled bar where the caller put it', async () => {
    const onValueChange = vi.fn();
    const screen = await render(<Bar value="overview" onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Pricing' }));

    expect(onValueChange).toHaveBeenCalledWith('pricing');
    await expect.element(screen.getByText('What it is')).toBeInTheDocument();
  });

  it('is one tab stop with the arrow keys inside it', async () => {
    const screen = await render(<Bar defaultValue="overview" />);

    await userEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowRight}');

    // `activateOnFocus` is off by default, so the arrow moves focus and the
    // panel stays until the tab is actually chosen.
    await expect.element(screen.getByRole('tab', { name: 'Pricing' })).toHaveFocus();
    await expect.element(screen.getByText('What it is')).toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByText('What it costs')).toBeInTheDocument();
  });

  it('chooses the tab an arrow key lands on when told to', async () => {
    const screen = await render(<Bar defaultValue="overview" activateOnFocus />);

    await userEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowRight}');

    await expect.element(screen.getByText('What it costs')).toBeInTheDocument();
  });

  it('skips a disabled tab', async () => {
    const screen = await render(<Bar defaultValue="overview" />);

    await expect.element(screen.getByRole('tab', { name: 'FAQ' })).toBeDisabled();
  });

  it('draws MD3 primary tabs by default', async () => {
    const screen = await render(<Bar defaultValue="overview" />);
    const root = screen.container.querySelector('.mp-tabs')!;
    const tab = screen.container.querySelector('.mp-tabs__tab')!;

    expect(root).toHaveAttribute('data-mp-variant', 'primary');
    // 48dp, which is the specification's tab height.
    expect(getComputedStyle(tab).height).toBe('48px');
  });

  it('gives a primary indicator a rounded 3dp bar inset to the label', async () => {
    const screen = await render(<Bar defaultValue="overview" />);
    const indicator = getComputedStyle(screen.container.querySelector('.mp-tabs__indicator')!);
    const tab = screen.container.querySelector('.mp-tabs__tab')!.getBoundingClientRect();

    expect(indicator.height).toBe('3px');
    expect(indicator.borderTopLeftRadius).not.toBe('0px');
    // The tab's own inline padding, taken off both ends.
    expect(Number.parseFloat(indicator.width)).toBeCloseTo(tab.width - 32, 0);
  });

  it('gives a secondary indicator a square 2dp bar across the whole tab', async () => {
    const screen = await render(<Bar defaultValue="overview" variant="secondary" />);
    const indicator = getComputedStyle(screen.container.querySelector('.mp-tabs__indicator')!);
    const tab = screen.container.querySelector('.mp-tabs__tab')!.getBoundingClientRect();

    expect(indicator.height).toBe('2px');
    expect(indicator.borderTopLeftRadius).toBe('0px');
    expect(Number.parseFloat(indicator.width)).toBeCloseTo(tab.width, 0);
  });

  it('stacks a primary tab’s glyph and inlines a secondary one’s', async () => {
    const screen = await render(
      <div>
        <MPTabs defaultValue="a" className="primary">
          <MPTab value="a" icon={<span>★</span>}>
            Stacked
          </MPTab>
        </MPTabs>
        <MPTabs defaultValue="a" variant="secondary" className="secondary">
          <MPTab value="a" icon={<span>★</span>}>
            Inline
          </MPTab>
        </MPTabs>
      </div>
    );
    const tabIn = (bar: string) =>
      getComputedStyle(screen.container.querySelector(`.${bar} .mp-tabs__tab`)!);

    expect(tabIn('primary').flexDirection).toBe('column');
    // 64dp with a glyph above the label, which is again the specification's.
    expect(tabIn('primary').height).toBe('64px');
    expect(tabIn('secondary').flexDirection).toBe('row');
    expect(tabIn('secondary').height).toBe('48px');
  });

  it('lets the glyph be moved against the variant', async () => {
    const screen = await render(
      <MPTabs defaultValue="a" iconPosition="start">
        <MPTab value="a" icon={<span>★</span>}>
          Inline
        </MPTab>
      </MPTabs>
    );

    expect(getComputedStyle(screen.container.querySelector('.mp-tabs__tab')!).flexDirection).toBe(
      'row'
    );
  });

  it('rules the bar off from the content, and stops when told to', async () => {
    const screen = await render(
      <div>
        <MPTabs defaultValue="a" className="ruled">
          <MPTab value="a">A</MPTab>
        </MPTabs>
        <MPTabs defaultValue="a" divider={false} className="bare">
          <MPTab value="a">A</MPTab>
        </MPTabs>
      </div>
    );
    const border = (bar: string) =>
      getComputedStyle(screen.container.querySelector(`.${bar} .mp-tabs__list`)!).borderBottomWidth;

    expect(border('ruled')).toBe('1px');
    expect(border('bare')).toBe('0px');
  });

  it('divides the bar evenly when told to fill it', async () => {
    const screen = await render(
      <div style={{ width: 600 }}>
        <MPTabs defaultValue="a" fullWidth>
          <MPTab value="a">A</MPTab>
          <MPTab value="b">A much longer label</MPTab>
        </MPTabs>
      </div>
    );
    const [first, second] = Array.from(screen.container.querySelectorAll('.mp-tabs__tab'));

    expect(first.getBoundingClientRect().width).toBeCloseTo(
      second.getBoundingClientRect().width,
      0
    );
  });

  it('takes the panel out of the DOM unless it is told to stay', async () => {
    const screen = await render(
      <MPTabs defaultValue="a">
        <MPTab value="a">A</MPTab>
        <MPTab value="b">B</MPTab>
        <MPTabPanel value="a">First</MPTabPanel>
        <MPTabPanel value="b" keepMounted>
          Second
        </MPTabPanel>
      </MPTabs>
    );
    const kept = screen.container.querySelector('[role="tabpanel"][hidden]');

    expect(kept).not.toBeNull();
    expect(kept!.textContent).toBe('Second');
  });

  /**
   * The bar has always scrolled — `overflow-x: auto` and MD3's scrollable tabs.
   * What it could not do was say so: macOS draws an overlay scrollbar that is
   * invisible until it is used, so a bar with four tabs off the edge and a bar
   * with none were the same picture on the platform this is written on.
   *
   * These are about the attribute rather than about the mask. The gradient is
   * the stylesheet's business and it reads exactly this.
   */
  describe('when there are more tabs than room', () => {
    const NAMES = ['Overview', 'Activity', 'Settings', 'Members', 'Billing', 'Integrations'];

    function Narrow({ width = 320, dir }: { width?: number; dir?: 'ltr' | 'rtl' }) {
      return (
        <div dir={dir} style={{ width }}>
          <MPTabs defaultValue="Overview" aria-label="Sections">
            {NAMES.map((name) => (
              <MPTab key={name} value={name}>
                {name}
              </MPTab>
            ))}
          </MPTabs>
        </div>
      );
    }

    it('is already scrolling, which is the thing that had no signal', async () => {
      const screen = await render(<Narrow />);
      const list = screen.container.querySelector('.mp-tabs__list') as HTMLElement;

      expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
      // Hidden on both platforms rather than left as a signal on one of them.
      expect(getComputedStyle(list).scrollbarWidth).toBe('none');
    });

    it('says which end has more bar past it', async () => {
      const screen = await render(<Narrow />);
      const list = screen.container.querySelector('.mp-tabs__list') as HTMLElement;

      // Standing at the start: everything left to see is to the right.
      expect(list).toHaveAttribute('data-mp-overflow', 'right');

      list.scrollLeft = 40;
      await vi.waitFor(() => expect(list).toHaveAttribute('data-mp-overflow', 'both'));

      list.scrollLeft = list.scrollWidth;
      await vi.waitFor(() => expect(list).toHaveAttribute('data-mp-overflow', 'left'));
    });

    it('answers in the terms the mask is written in, whichever way the page runs', async () => {
      const screen = await render(<Narrow dir="rtl" />);
      const list = screen.container.querySelector('.mp-tabs__list') as HTMLElement;

      // The bar starts at its own start, which under RTL is the right-hand edge
      // — so the rest of it is to the left. A logical answer here would have the
      // stylesheet fading the end the reader is already standing at.
      expect(list).toHaveAttribute('data-mp-overflow', 'left');
    });

    it('says nothing at all when everything fits', async () => {
      const screen = await render(<Narrow width={1200} />);
      const list = screen.container.querySelector('.mp-tabs__list') as HTMLElement;

      expect(list).not.toHaveAttribute('data-mp-overflow');
      // And carries no mask, rather than one that happens to fade nothing.
      expect(getComputedStyle(list).maskImage).toBe('none');
    });

    it('answers again when the room changes under the same tabs', async () => {
      const screen = await render(<Narrow width={1200} />);
      const box = screen.container.firstElementChild as HTMLElement;
      const list = screen.container.querySelector('.mp-tabs__list') as HTMLElement;

      box.style.width = '320px';

      await vi.waitFor(() => expect(list).toHaveAttribute('data-mp-overflow', 'right'));
    });

    it('keeps the divider whole where the tabs fade', async () => {
      const screen = await render(<Narrow />);
      const list = screen.container.querySelector('.mp-tabs__list') as HTMLElement;
      const mask = getComputedStyle(list);

      // Two layers: the fade over everything above the hairline, and an opaque
      // one over the hairline itself. The divider is the boundary between the
      // bar and the panel and runs the full width whatever the bar is doing.
      expect(mask.maskSize).toBe('100% calc(100% - 1px), 100% 1px');

      // Every layer, rather than the string `mask-repeat` serialises to. The
      // sheet declares one `no-repeat` for both layers; Chromium expands that
      // to one value per layer and the other two engines leave it as written,
      // so asserting the joined string was asserting Chromium's serialisation
      // rather than the component's behaviour.
      expect(mask.maskRepeat.split(',').every((layer) => layer.trim() === 'no-repeat')).toBe(true);
    });
  });

  it('publishes the rung it was drawn at', async () => {
    const screen = await render(<Bar defaultValue="overview" size="sm" />);

    expect(screen.container.querySelector('.mp-tabs')).toHaveAttribute('data-mp-size', 'sm');
  });

  it('passes through the attributes a div takes', async () => {
    const screen = await render(<Bar defaultValue="overview" id="sections" />);

    expect(screen.container.querySelector('.mp-tabs')).toHaveAttribute('id', 'sections');
  });
});
