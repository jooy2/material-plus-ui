import type * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPDatePicker, MPPane, MPPanes, MPSwitch, MPTextField } from 'material-plus-ui';

/**
 * What the library does when the page runs the other way.
 *
 * Nothing here is a new capability. Every one of these components was *written*
 * to be direction-aware — the chevrons turn, the paddings are `ps`/`pe`, the
 * badges sit at the `end`, and the files say so at length — and four of them
 * were not, in ways nobody could see because no test ever set `dir`.
 *
 * That is the gap this file exists for. RTL is not a feature a component either
 * has or has not; it is a property that decays one physical value at a time, and
 * the only thing that holds it is asking.
 *
 * The direction is set on a wrapper rather than on `<html>`, deliberately: a
 * `dir="rtl"` section inside an otherwise LTR page is a real arrangement, and it
 * is the one that catches a component reading the document instead of itself.
 */
function Rtl({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" style={{ width: 640 }}>
      {children}
    </div>
  );
}

function Ltr({ children }: { children: React.ReactNode }) {
  return (
    <div dir="ltr" style={{ width: 640 }}>
      {children}
    </div>
  );
}

/** Where an element's own box sits inside its offset parent, from each edge. */
function insets(element: HTMLElement) {
  const box = element.getBoundingClientRect();
  const parent = element.offsetParent as HTMLElement;
  const around = parent.getBoundingClientRect();

  return { start: box.left - around.left, end: around.right - box.right };
}

describe('under RTL', () => {
  describe('the field shell', () => {
    /*
     * The `<legend>` that cuts the notch is laid out by the writing direction,
     * so the gap in the outline opens on the right. The label was pinned `left`,
     * which left it sitting on an unbroken stretch of outline with a hole beside
     * it — on every control drawn on this shell, which is most of the form ones.
     */
    it('rests the floating label at the reading edge', async () => {
      const rtl = await render(
        <Rtl>
          <MPTextField value="" label="이름" />
        </Rtl>
      );
      const ltr = await render(
        <Ltr>
          <MPTextField value="" label="Name" />
        </Ltr>
      );

      const inRtl = rtl.container.querySelector('label') as HTMLElement;
      const inLtr = ltr.container.querySelector('label') as HTMLElement;

      // Mirrored: whatever the label's inset is on one side in LTR, it is on the
      // other in RTL.
      expect(insets(inRtl).end).toBeCloseTo(insets(inLtr).start, 0);
    });
  });

  describe('the switch', () => {
    // The one control whose entire meaning is which end the thumb is at, so a
    // thumb that always travelled left to right pointed backwards on half the
    // world's pages.
    it('rests its thumb at the reading edge and travels away from it', async () => {
      const off = await render(
        <Rtl>
          <MPSwitch label="알림" />
        </Rtl>
      );
      const on = await render(
        <Rtl>
          <MPSwitch label="알림" defaultChecked />
        </Rtl>
      );

      const thumbOff = off.container.querySelector('.mp-switch__thumb') as HTMLElement;
      const thumbOn = on.container.querySelector('.mp-switch__thumb') as HTMLElement;

      expect(insets(thumbOff).end).toBeLessThan(insets(thumbOff).start);
      expect(insets(thumbOn).start).toBeLessThan(insets(thumbOn).end);
    });
  });

  describe('the calendar', () => {
    /*
     * A grid in an RTL container flows right to left, so the cell to the right
     * of today is yesterday. The header's chevrons already turned and the page
     * animation already flipped; only the keyboard did not, which left an Arabic
     * reader with a control whose buttons ran one way and whose arrow keys ran
     * the other.
     *
     * The direction goes on the document here rather than on a wrapper, and the
     * difference is the point: a picker's popup is portalled to the end of
     * `<body>`, so it is laid out in the *document's* direction whatever the
     * trigger happens to sit inside. Reading the direction off the cell the key
     * arrived on — rather than off the trigger, or off a context — is what makes
     * the keyboard agree with what was actually drawn.
     */
    async function dayAfter(key: string, dir: 'ltr' | 'rtl') {
      const previous = document.documentElement.dir;

      document.documentElement.dir = dir;

      try {
        const screen = await render(
          <MPDatePicker label="Day" locale="en-GB" defaultValue={new Date(2026, 6, 15)} />
        );

        await screen.getByRole('button', { name: 'Day' }).click();
        await expect.element(screen.getByRole('grid')).toBeInTheDocument();

        const cell = screen
          .getByRole('grid')
          .element()
          .querySelector('[data-focus-target="true"]') as HTMLElement;

        cell.focus();
        cell.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

        // The cursor is React state and the focus follows it in a layout effect,
        // so the move lands a tick after the key rather than during it.
        await new Promise((resolve) => setTimeout(resolve, 0));

        return Number((document.activeElement as HTMLElement).textContent);
      } finally {
        document.documentElement.dir = previous;
      }
    }

    /*
     * One render to a test. The popup is portalled to the end of `<body>` rather
     * than into the container, so two pickers opened inside one `it` leave two
     * calendars in the document and every query becomes ambiguous.
     */
    it('moves the day cursor to the right of the 15th where the week runs that way', async () => {
      expect(await dayAfter('ArrowRight', 'ltr')).toBe(16);
    });

    it('moves it to the 14th where the week runs the other way', async () => {
      expect(await dayAfter('ArrowRight', 'rtl')).toBe(14);
    });

    // Down is down in every writing direction — the weeks stack, and nothing
    // about the direction turns a calendar on its side.
    it('leaves the vertical arrows alone', async () => {
      expect(await dayAfter('ArrowDown', 'rtl')).toBe(22);
    });
  });

  describe('the panes', () => {
    /*
     * A split in an RTL container has its first pane on the right, so "toward
     * the end" runs leftwards. `beginDrag` already knew; the arrow keys did not,
     * so the pointer went the way it was pushed and the keyboard went the other
     * — on the same handle.
     */
    it('nudges a handle the way the arrow points', async () => {
      async function widthAfter(key: string, dir: 'ltr' | 'rtl') {
        const Wrapper = dir === 'rtl' ? Rtl : Ltr;
        const screen = await render(
          <Wrapper>
            <div style={{ height: 120 }}>
              <MPPanes>
                <MPPane defaultSize={50}>One</MPPane>
                <MPPane defaultSize={50}>Two</MPPane>
              </MPPanes>
            </div>
          </Wrapper>
        );

        const handle = screen.container.querySelector('.mp-panes__handle') as HTMLElement;
        const first = screen.container.querySelector('.mp-pane') as HTMLElement;
        const before = first.getBoundingClientRect().width;

        handle.focus();
        handle.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 30));

        return first.getBoundingClientRect().width - before;
      }

      // ArrowRight makes the leading pane wider in LTR, where it is on the left,
      // and narrower in RTL, where it is on the right. Both are "the boundary
      // went where the key pointed".
      expect(await widthAfter('ArrowRight', 'ltr')).toBeGreaterThan(0);
      expect(await widthAfter('ArrowRight', 'rtl')).toBeLessThan(0);
    });
  });
});
