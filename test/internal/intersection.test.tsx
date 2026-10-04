import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  MPAnimateFade,
  MPAnimateLighting,
  MPProgressLinear,
  useMPOnScreen
} from 'material-plus-ui';
import { useRef } from 'react';

/**
 * One observer for every element that asks the same question.
 *
 * Counted at the constructor, which is the cost being saved: each observer is
 * one more thing the browser checks on every frame the page scrolls.
 */
const RealObserver = window.IntersectionObserver;

afterEach(() => {
  window.IntersectionObserver = RealObserver;
});

function counted() {
  const made = vi.fn();

  window.IntersectionObserver = class extends RealObserver {
    constructor(...args: ConstructorParameters<typeof IntersectionObserver>) {
      super(...args);
      made(args[1]);
    }
  };

  return made;
}

function Watcher() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useMPOnScreen(ref, { once: false });

  return <div ref={ref}>{seen ? 'seen' : 'unseen'}</div>;
}

describe('watching whether something is on screen', () => {
  it('shares one observer between elements asking the same question', async () => {
    const made = counted();
    const screen = await render(
      <>
        {Array.from({ length: 12 }, (_, index) => (
          <MPAnimateFade key={index} trigger="visible">
            <p>Card {index}</p>
          </MPAnimateFade>
        ))}
      </>
    );

    expect(made).toHaveBeenCalledTimes(1);
    await vi.waitFor(() =>
      expect(screen.container.querySelectorAll('[data-mp-state="running"]')).toHaveLength(12)
    );
  });

  it('keeps a separate one for a different question', async () => {
    const made = counted();

    await render(
      <>
        <MPAnimateFade trigger="visible" threshold={0.5}>
          <p>Half</p>
        </MPAnimateFade>
        <MPAnimateFade trigger="visible" threshold={0.9}>
          <p>Most</p>
        </MPAnimateFade>
        <Watcher />
      </>
    );

    expect(made).toHaveBeenCalledTimes(3);
  });

  it('still tells each element about itself', async () => {
    const screen = await render(
      <>
        <Watcher />
        <div style={{ marginTop: 5000 }}>
          <Watcher />
        </div>
      </>
    );

    await vi.waitFor(() => expect(screen.container.textContent).toBe('seenunseen'));
  });

  describe('an endless animation off screen', () => {
    it('is held, and runs again on screen', async () => {
      const screen = await render(
        <>
          <MPProgressLinear label="Near" />
          <MPAnimateLighting>Glow</MPAnimateLighting>
          <div style={{ marginTop: 5000 }}>
            <MPProgressLinear label="Far" />
            <MPAnimateLighting>Far glow</MPAnimateLighting>
          </div>
        </>
      );
      const [near, far] = screen.container.querySelectorAll('.mp-progress-linear-lead');
      const [lit, dark] = screen.container.querySelectorAll('.mp-anim-lighting');

      await vi.waitFor(() => expect(getComputedStyle(far).animationPlayState).toBe('paused'));
      expect(getComputedStyle(near).animationPlayState).toBe('running');
      await vi.waitFor(() =>
        expect(getComputedStyle(dark, '::before').animationPlayState).toBe('paused')
      );
      expect(getComputedStyle(lit, '::before').animationPlayState).toBe('running');
    });

    it('lets a finished bar go', async () => {
      const screen = await render(
        <div style={{ marginTop: 5000 }}>
          <MPProgressLinear label="Done" value={100} />
        </div>
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(screen.container.querySelector('[data-mp-offscreen]')).toBeNull();
    });
  });
});
