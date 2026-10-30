import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateAppear } from 'material-plus-ui';

describe('MPAnimateAppear', () => {
  /*
   * The animation goes onto the children, not onto wrappers around them.
   *
   * A row of `<li>`s has to stay a row of `<li>`s, and a grid's cells have to
   * stay its direct children — otherwise animating a list quietly changes what
   * the list *is*.
   */
  it('writes the animation onto the children themselves', async () => {
    const screen = await render(
      <MPAnimateAppear render={<ul />} data-testid="appear">
        <li>One</li>
        <li>Two</li>
      </MPAnimateAppear>
    );
    const root = screen.getByTestId('appear').element() as HTMLElement;

    expect(root.tagName).toBe('UL');
    expect(root.children).toHaveLength(2);
    expect(root.children[0].tagName).toBe('LI');
    expect(root.children[0]).toHaveClass('mp-anim');
    expect(root.children[0]).toHaveClass('mp-anim-slide');
  });

  it('wraps a bare string, which has no element to write onto', async () => {
    const screen = await render(
      <MPAnimateAppear data-testid="appear">
        {'One'}
        {'Two'}
      </MPAnimateAppear>
    );
    const root = screen.getByTestId('appear').element() as HTMLElement;

    expect(root.children[0].tagName).toBe('SPAN');
    expect(root.children[0].textContent).toBe('One');
  });

  describe('stagger', () => {
    it('holds each child back by its position', async () => {
      const screen = await render(
        <MPAnimateAppear data-testid="appear">
          <div>One</div>
          <div>Two</div>
          <div>Three</div>
        </MPAnimateAppear>
      );
      const children = screen.getByTestId('appear').element().children;

      expect((children[0] as HTMLElement).style.getPropertyValue('--_mp-anim-delay')).toBe('0ms');
      expect((children[1] as HTMLElement).style.getPropertyValue('--_mp-anim-delay')).toBe('80ms');
      expect((children[2] as HTMLElement).style.getPropertyValue('--_mp-anim-delay')).toBe('160ms');
    });

    it('adds the component’s own `delay` before the first step', async () => {
      const screen = await render(
        <MPAnimateAppear delay={200} stagger={50} data-testid="appear">
          <div>One</div>
          <div>Two</div>
        </MPAnimateAppear>
      );
      const children = screen.getByTestId('appear').element().children;

      expect((children[0] as HTMLElement).style.getPropertyValue('--_mp-anim-delay')).toBe('200ms');
      expect((children[1] as HTMLElement).style.getPropertyValue('--_mp-anim-delay')).toBe('250ms');
    });

    /*
     * The stagger is per child, which is what makes grouping the way to opt
     * part of a list out: eight children are eight steps, and one child holding
     * eight things is one step.
     */
    it('counts children rather than descendants', async () => {
      const screen = await render(
        <MPAnimateAppear data-testid="appear">
          <div>
            <span>One</span>
            <span>Two</span>
          </div>
          <div>Three</div>
        </MPAnimateAppear>
      );
      const children = screen.getByTestId('appear').element().children;

      expect(children).toHaveLength(2);
      expect((children[1] as HTMLElement).style.getPropertyValue('--_mp-anim-delay')).toBe('80ms');
    });
  });

  it('runs the list backwards', async () => {
    const screen = await render(
      <MPAnimateAppear reverse data-testid="appear">
        <div>One</div>
        <div>Two</div>
        <div>Three</div>
      </MPAnimateAppear>
    );
    const children = screen.getByTestId('appear').element().children;

    expect((children[0] as HTMLElement).style.getPropertyValue('--_mp-anim-delay')).toBe('160ms');
    expect((children[2] as HTMLElement).style.getPropertyValue('--_mp-anim-delay')).toBe('0ms');
  });

  it('drifts a short way, not from off screen', async () => {
    // A settling, not an entrance: a long travel over a list of eight turns
    // the whole block into something moving.
    const screen = await render(
      <MPAnimateAppear data-testid="appear">
        <div>One</div>
      </MPAnimateAppear>
    );
    const child = screen.getByTestId('appear').element().children[0] as HTMLElement;

    expect(child.style.getPropertyValue('--_mp-anim-y')).toBe('0.75rem');
  });

  it('keeps a child’s own class and style', async () => {
    const screen = await render(
      <MPAnimateAppear data-testid="appear">
        <div className="mine" style={{ color: 'rgb(1, 2, 3)' }}>
          One
        </div>
      </MPAnimateAppear>
    );
    const child = screen.getByTestId('appear').element().children[0] as HTMLElement;

    expect(child).toHaveClass('mine');
    expect(child).toHaveClass('mp-anim-slide');
    expect(child.style.color).toBe('rgb(1, 2, 3)');
  });

  it('keeps only the play state on the root', async () => {
    const screen = await render(
      <MPAnimateAppear trigger="manual" data-testid="appear">
        <div>One</div>
      </MPAnimateAppear>
    );
    const root = screen.getByTestId('appear').element() as HTMLElement;

    expect(root).toHaveAttribute('data-mp-state', 'paused');
    expect(root).not.toHaveClass('mp-anim');
    expect(getComputedStyle(root.children[0]).animationPlayState).toBe('paused');
  });
});
