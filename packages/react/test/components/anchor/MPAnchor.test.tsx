import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import * as React from 'react';
import { MPAnchor } from 'material-plus-ui';
import type { MPAnchorItem } from 'material-plus-ui';

const ITEMS: MPAnchorItem[] = [
  { href: '#install', label: 'Install' },
  { href: '#usage', label: 'Usage' },
  { href: '#options', label: 'Options', depth: 1 }
];

/**
 * A page with the three headings the list points at, each tall enough that only
 * one of them is at the top of the scrollport at a time.
 */
function Page({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      {ITEMS.map((item) => (
        <section key={item.href} id={item.href.slice(1)} style={{ height: 1500 }}>
          {item.href}
        </section>
      ))}
    </div>
  );
}

const links = () => document.querySelectorAll('.mp-anchor__link');
const marked = () => document.querySelector('[aria-current="location"]');

describe('MPAnchor', () => {
  it('is a named `nav` of real links', async () => {
    // Which is what makes it work before any of the tracking runs: the rows jump
    // with JavaScript off, and they are in the link list a screen reader offers.
    const screen = await render(<MPAnchor items={ITEMS} />);

    await expect
      .element(screen.getByRole('navigation', { name: 'On this page' }))
      .toBeInTheDocument();
    expect(links()).toHaveLength(3);
    expect(links()[0]).toHaveAttribute('href', '#install');
  });

  it('takes the caller’s name for the landmark', async () => {
    const screen = await render(<MPAnchor items={ITEMS} label="Sections" />);

    await expect.element(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
  });

  it('marks nothing until the first heading has been reached', async () => {
    // The rule is the last heading whose top has passed the line, and at the top
    // of a page none of them has. Marking the first one anyway would tell a
    // reader they are in a section they have not got to yet.
    await render(
      <Page>
        <MPAnchor items={ITEMS} />
      </Page>
    );

    window.scrollTo(0, 0);

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(marked()).toBeNull();
  });

  it('marks the row the reader is in with `location`', async () => {
    // `location` rather than `true`: this is where the reader is within a set of
    // links, which is exactly what a table of contents reports. `true` would say
    // the row is the current page.
    await render(
      <Page>
        <MPAnchor items={ITEMS} />
      </Page>
    );

    document.getElementById('install')!.scrollIntoView();

    await vi.waitFor(() => expect(marked()).toHaveAttribute('href', '#install'));

    window.scrollTo(0, 0);
  });

  it('follows the scroll down the page', async () => {
    await render(
      <Page>
        <MPAnchor items={ITEMS} />
      </Page>
    );

    document.getElementById('install')!.scrollIntoView();

    await vi.waitFor(() => expect(marked()).toHaveAttribute('href', '#install'));

    document.getElementById('usage')!.scrollIntoView();

    await vi.waitFor(() => expect(marked()).toHaveAttribute('href', '#usage'));

    // And back up again. The rule is the last heading whose top has passed the
    // line, which is the only one that reads correctly in both directions.
    document.getElementById('install')!.scrollIntoView();

    await vi.waitFor(() => expect(marked()).toHaveAttribute('href', '#install'));

    window.scrollTo(0, 0);
  });

  it('reports every change to the caller', async () => {
    const onActiveChange = vi.fn();

    await render(
      <Page>
        <MPAnchor items={ITEMS} onActiveChange={onActiveChange} />
      </Page>
    );

    document.getElementById('install')!.scrollIntoView();

    await vi.waitFor(() => expect(onActiveChange).toHaveBeenCalledWith('#install'));

    document.getElementById('usage')!.scrollIntoView();

    await vi.waitFor(() => expect(onActiveChange).toHaveBeenCalledWith('#usage'));

    window.scrollTo(0, 0);
  });

  it('stops watching the scroll once it is told what is active', async () => {
    await render(
      <Page>
        <MPAnchor items={ITEMS} activeHref="#options" />
      </Page>
    );

    document.getElementById('usage')!.scrollIntoView();

    // Given the prop, the list says what it is told and nothing else — a
    // controlled component that also tracked would fight its own caller.
    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(marked()).toHaveAttribute('href', '#options');

    window.scrollTo(0, 0);
  });

  it('accepts `null` as “no row is marked”', async () => {
    await render(<MPAnchor items={ITEMS} activeHref={null} />);

    expect(marked()).toBeNull();
  });

  it('sets a deeper heading in without nesting the list', async () => {
    // A nested `<ul>` in a table of contents is announced as a list inside a
    // list, which tells a reader nothing they needed.
    const screen = await render(<MPAnchor items={ITEMS} />);

    expect(screen.container.querySelectorAll('ul')).toHaveLength(1);
    expect(getComputedStyle(links()[2]).marginInlineStart).toBe('12px');
    expect(getComputedStyle(links()[0]).marginInlineStart).toBe('0px');
  });

  it('draws the rail unless it is turned off', async () => {
    const screen = await render(<MPAnchor items={ITEMS} />);
    const list = screen.container.querySelector('.mp-anchor__list')!;

    expect(getComputedStyle(list).borderInlineStartWidth).toBe('1px');

    await screen.rerender(<MPAnchor items={ITEMS} rail={false} />);

    expect(getComputedStyle(list).borderInlineStartWidth).toBe('0px');
  });

  it('tightens the rows with `density` and leaves the type alone', async () => {
    const screen = await render(<MPAnchor items={ITEMS} />);
    const row = () => links()[0].getBoundingClientRect().height;
    const text = () => getComputedStyle(links()[0]).fontSize;

    const loose = row();
    const typeSize = text();

    await screen.rerender(<MPAnchor items={ITEMS} density={-2} />);

    expect(row()).toBeLessThan(loose);
    // The words are the same size in less room, which is what a reader of a
    // dense screen actually wants.
    expect(text()).toBe(typeSize);
  });

  it('watches a container rather than the document when it is given one', async () => {
    function Probe() {
      const box = React.useRef<HTMLDivElement>(null);

      return (
        <div>
          <MPAnchor items={ITEMS} container={box} />
          <div ref={box} data-testid="scroller" style={{ height: 200, overflowY: 'auto' }}>
            {ITEMS.map((item) => (
              <section key={item.href} id={item.href.slice(1)} style={{ height: 600 }}>
                {item.href}
              </section>
            ))}
          </div>
        </div>
      );
    }

    const screen = await render(<Probe />);

    screen.getByTestId('scroller').element().scrollTop = 620;

    await vi.waitFor(() => expect(marked()).toHaveAttribute('href', '#usage'));
  });

  /*
   * A fragment link needs no handler of its own: the browser scrolls whatever
   * scrollport holds the target, writes the hash and adds the history entry.
   * What none of that survives is a router — VitePress, Docusaurus, Astro and
   * Nuxt all claim same-page hash clicks, cancel them, and scroll the *window*
   * instead, which inside a `container` is the one scrollport they cannot mean.
   */
  describe('pressing a row a router has cancelled', () => {
    function Probe({ offset }: { offset?: number }) {
      const box = React.useRef<HTMLDivElement>(null);

      return (
        <div>
          <MPAnchor items={ITEMS} container={box} offset={offset} />
          <div ref={box} data-testid="scroller" style={{ height: 200, overflowY: 'auto' }}>
            {ITEMS.map((item) => (
              <section key={item.href} id={item.href.slice(1)} style={{ height: 600 }}>
                {item.href}
              </section>
            ))}
          </div>
        </div>
      );
    }

    /**
     * A router's own listener, cut down to the part that matters: it runs on
     * `window` in the capture phase, ahead of the component's, and it cancels
     * the navigation.
     *
     * The click is dispatched rather than driven through the browser, for two
     * reasons — a cancelled click is not something to hand back to the runner
     * that issued it, and a real one would move the runner's own URL.
     */
    function pressUnderRouter(name: string) {
      const link = [...document.querySelectorAll('.mp-anchor__link')].find(
        (row) => row.textContent === name
      )!;
      const router = (event: MouseEvent) => {
        if ((event.target as Element | null)?.closest('.mp-anchor__link')) {
          event.preventDefault();
        }
      };

      window.addEventListener('click', router, { capture: true });

      try {
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      } finally {
        window.removeEventListener('click', router, { capture: true });
      }
    }

    it('scrolls the container to the heading', async () => {
      const screen = await render(<Probe />);

      pressUnderRouter('Usage');

      await vi.waitFor(() => expect(screen.getByTestId('scroller').element().scrollTop).toBe(600));
    });

    it('lands the heading `offset` below the top, as the tracking measures it', async () => {
      const screen = await render(<Probe offset={40} />);

      pressUnderRouter('Options');

      await vi.waitFor(() => expect(screen.getByTestId('scroller').element().scrollTop).toBe(1160));
    });

    it('marks the row it scrolled to', async () => {
      await render(<Probe />);

      pressUnderRouter('Usage');

      await vi.waitFor(() => expect(marked()).toHaveAttribute('href', '#usage'));
    });

    /*
     * The other half of the contract, and the more important one. A press
     * nobody cancelled is the browser's to answer: it scrolls the container,
     * writes the hash and adds the history entry, all of which this component
     * would only be doing a second time.
     */
    it('leaves an uncancelled press to the browser', async () => {
      /*
       * `offset` is what tells the two apart. The browser puts the heading at
       * the very top of the scrollport; the component puts it `offset` below,
       * where the tracking reads it. So a press that lands at 600 rather than
       * 560 is the browser's own, and the component stayed out of it — which is
       * the whole of what this contract promises.
       */
      const screen = await render(<Probe offset={40} />);
      const link = [...document.querySelectorAll('.mp-anchor__link')].find(
        (row) => row.textContent === 'Usage'
      )!;
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });

      link.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
      await vi.waitFor(() => expect(screen.getByTestId('scroller').element().scrollTop).toBe(600));
    });

    it('binds nothing at all without a container', async () => {
      // The document case is the browser's, and a router's own scroll is
      // already right there.
      await render(<MPAnchor items={ITEMS} />);

      expect(
        (document.querySelector('.mp-anchor__link') as HTMLElement | null)?.onclick
      ).toBeFalsy();
    });
  });

  it('marks the last heading once the page has run out', async () => {
    // The last section on a page often has less under it than a viewport, so its
    // top never reaches the line — without this it is the one heading that can
    // never be marked however far the reader scrolls.
    await render(
      <div>
        <MPAnchor items={ITEMS} />
        {ITEMS.map((item) => (
          <section key={item.href} id={item.href.slice(1)} style={{ height: 900 }}>
            {item.href}
          </section>
        ))}
        <div style={{ height: 10 }}>The end</div>
      </div>
    );

    window.scrollTo(0, document.documentElement.scrollHeight);

    await vi.waitFor(() => expect(marked()).toHaveAttribute('href', '#options'));

    window.scrollTo(0, 0);
  });
});
