import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPTimeline, MPTimelineItem } from 'material-plus-ui';

describe('MPTimeline', () => {
  describe('the sequence', () => {
    it('is an ordered list, because the order is the content', async () => {
      const screen = await render(
        <MPTimeline>
          <MPTimelineItem title="Ordered" />
        </MPTimeline>
      );
      const element = screen.getByRole('list').element();

      expect(element.tagName).toBe('OL');
      expect(element).toHaveAttribute('role', 'list');
    });

    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(
        <MPTimeline className="my-own-class">
          <MPTimelineItem title="Ordered" />
        </MPTimeline>
      );
      const element = screen.getByRole('list').element();

      expect(element).toHaveClass('my-own-class');
      expect(element).toHaveClass('mp-timeline');
    });

    it('runs across when horizontal', async () => {
      const screen = await render(
        <MPTimeline orientation="horizontal">
          <MPTimelineItem title="Ordered" />
        </MPTimeline>
      );

      expect(screen.getByRole('list').element()).toHaveClass('flex-row');
    });
  });

  describe('active', () => {
    it('leaves everything upcoming when it is not given', async () => {
      const screen = await render(
        <MPTimeline>
          <MPTimelineItem title="One" />
          <MPTimelineItem title="Two" />
        </MPTimeline>
      );

      for (const item of screen.getByRole('listitem').elements()) {
        expect(item).toHaveAttribute('data-status', 'upcoming');
      }
    });

    it('splits the sequence into done, now and to come', async () => {
      const screen = await render(
        <MPTimeline active={1}>
          <MPTimelineItem title="One" />
          <MPTimelineItem title="Two" />
          <MPTimelineItem title="Three" />
        </MPTimeline>
      );
      const items = screen.getByRole('listitem').elements();

      expect(items[0]).toHaveAttribute('data-status', 'complete');
      expect(items[1]).toHaveAttribute('data-status', 'current');
      expect(items[2]).toHaveAttribute('data-status', 'upcoming');
    });

    it('marks the whole sequence done at the item count', async () => {
      const screen = await render(
        <MPTimeline active={2}>
          <MPTimelineItem title="One" />
          <MPTimelineItem title="Two" />
        </MPTimeline>
      );

      for (const item of screen.getByRole('listitem').elements()) {
        expect(item).toHaveAttribute('data-status', 'complete');
      }
    });

    it('counts only the steps that are actually on the page', async () => {
      // `toArray` drops the `null`s a conditional step leaves behind.
      const show = false;
      const screen = await render(
        <MPTimeline active={1}>
          <MPTimelineItem title="One" />
          {show ? <MPTimelineItem title="Hidden" /> : null}
          <MPTimelineItem title="Two" />
        </MPTimeline>
      );
      const items = screen.getByRole('listitem').elements();

      expect(items).toHaveLength(2);
      expect(items[1]).toHaveAttribute('data-status', 'current');
    });

    it('announces the current step', async () => {
      const screen = await render(
        <MPTimeline active={0}>
          <MPTimelineItem title="One" />
          <MPTimelineItem title="Two" />
        </MPTimeline>
      );
      const items = screen.getByRole('listitem').elements();

      expect(items[0]).toHaveAttribute('aria-current', 'step');
      expect(items[1]).not.toHaveAttribute('aria-current');
    });

    it('eases the line and the title along with the bullet', async () => {
      // The same three parts `MPStepper` asserts on, out of the same table. A
      // timeline is read rather than pressed, but `active` still moves down it
      // and the connector is what carries the eye from one item to the next.
      const screen = await render(
        <MPTimeline active={1}>
          <MPTimelineItem title="One" />
          <MPTimelineItem title="Two" />
          <MPTimelineItem title="Three" />
        </MPTimeline>
      );
      // The middle one, because the last item draws no connector: its line
      // would run off the end of the sequence into nothing.
      const current = screen.getByRole('listitem').elements()[1];
      const parts = [
        current.querySelector('.mp-timeline__bullet')!,
        current.querySelector('.mp-timeline__connector')!,
        current.querySelector('.mp-timeline__title')!
      ];

      for (const part of parts) {
        expect(getComputedStyle(part).transitionDuration).toBe('0.2s');
        expect(getComputedStyle(part).transitionTimingFunction).toBe(
          getComputedStyle(parts[0]).transitionTimingFunction
        );
      }
    });
  });

  describe('MPTimelineItem', () => {
    it('overrides its computed status', async () => {
      const screen = await render(
        <MPTimeline active={2}>
          <MPTimelineItem title="One" />
          <MPTimelineItem title="Two" status="upcoming" />
        </MPTimeline>
      );

      expect(screen.getByRole('listitem').elements()[1]).toHaveAttribute('data-status', 'upcoming');
    });

    it('draws no connector after the last step', async () => {
      // The last item's line would run off the end of the sequence into
      // nothing.
      const screen = await render(
        <MPTimeline>
          <MPTimelineItem title="One" />
          <MPTimelineItem title="Two" />
        </MPTimeline>
      );
      const items = screen.getByRole('listitem').elements();

      expect(items[0].querySelectorAll('.absolute')).toHaveLength(1);
      expect(items[1].querySelectorAll('.absolute')).toHaveLength(0);
    });

    it('takes a connector style of its own', async () => {
      const screen = await render(
        <MPTimeline>
          <MPTimelineItem title="One" connector="dashed" />
          <MPTimelineItem title="Two" />
        </MPTimeline>
      );

      expect(screen.getByRole('listitem').elements()[0].querySelector('.absolute')).toHaveClass(
        'border-dashed'
      );
    });

    it('leaves the gap open on none', async () => {
      const screen = await render(
        <MPTimeline>
          <MPTimelineItem title="One" connector="none" />
          <MPTimelineItem title="Two" />
        </MPTimeline>
      );

      expect(screen.getByRole('listitem').elements()[0].querySelectorAll('.absolute')).toHaveLength(
        0
      );
    });

    it('puts what it was given inside the bullet', async () => {
      const screen = await render(
        <MPTimeline>
          <MPTimelineItem title="One" bullet="1" />
        </MPTimeline>
      );

      expect(screen.getByText('1').query()).not.toBeNull();
    });

    it('shows a title, a time and a body', async () => {
      const screen = await render(
        <MPTimeline>
          <MPTimelineItem title="Shipped" meta="2 days ago">
            Left the warehouse.
          </MPTimelineItem>
        </MPTimeline>
      );

      expect(screen.getByText('Shipped').query()).not.toBeNull();
      expect(screen.getByText('2 days ago').query()).not.toBeNull();
      expect(screen.getByText('Left the warehouse.').query()).not.toBeNull();
    });

    it('overrides the timeline’s accent family for one step', async () => {
      const screen = await render(
        <MPTimeline color="primary">
          <MPTimelineItem title="Failed" color="error" />
        </MPTimeline>
      );
      const item = screen.getByRole('listitem').element() as HTMLElement;

      expect(item.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-error)');
    });

    it('renders on its own, outside a timeline', async () => {
      const screen = await render(<MPTimelineItem title="Alone" />);

      expect(screen.getByText('Alone').query()).not.toBeNull();
    });
  });
});
