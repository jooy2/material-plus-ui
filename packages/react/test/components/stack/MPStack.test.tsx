import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAvatar, MPStack } from 'material-plus-ui';
import { scaled } from '../../support/style';

/**
 * A pile of five 32px squares with a 10px overlap, which is the shape every
 * measurement below is taken from. Fixed pixels rather than a component, so
 * the numbers mean what they say.
 */
function Pile(props: React.ComponentProps<typeof MPStack>) {
  return (
    <MPStack overlap={10} {...props}>
      {[0, 1, 2, 3, 4].map((index) => (
        <div key={index} data-testid={`card-${index}`} style={{ width: 32, height: 32 }} />
      ))}
    </MPStack>
  );
}

const box = (screen: { container: Element }) =>
  (screen.container.querySelector('.mp-stack') as HTMLElement).getBoundingClientRect();

const wrappers = (screen: { container: Element }) =>
  [...(screen.container.querySelector('.mp-stack') as HTMLElement).children] as HTMLElement[];

describe('MPStack', () => {
  /*
   * The detail nearly every implementation of a pile gets wrong, and the reason
   * these are measurements rather than class-name assertions.
   *
   * With `translate` each item still occupies its full width: the box stays the
   * size of all five, the pile is drawn outside it, and everything after the
   * stack on the page is laid out against a number that is wrong. A negative
   * margin takes the space back, so the box is the size of what is drawn — and
   * the stack can go in a sentence.
   */
  describe('the box is the size of what is drawn', () => {
    it('measures 120 by 32 across', async () => {
      const screen = await render(<Pile />);
      const { width, height } = box(screen);

      // Five 32s less four 10s.
      expect(Math.round(width)).toBe(120);
      expect(Math.round(height)).toBe(32);
    });

    it('measures 32 by 120 down', async () => {
      const screen = await render(<Pile direction="vertical" />);
      const { width, height } = box(screen);

      expect(Math.round(width)).toBe(32);
      expect(Math.round(height)).toBe(120);
    });

    it('measures 120 by 72 on the diagonal', async () => {
      const screen = await render(<Pile direction="diagonal" />);
      const { width, height } = box(screen);

      // The width is the horizontal flow's, and the height is one item plus
      // four drops — which is what the per-item margin below produces.
      expect(Math.round(width)).toBe(120);
      expect(Math.round(height)).toBe(72);
    });
  });

  describe('the overlap', () => {
    it('is a logical margin, so a row flips under RTL without being asked', async () => {
      const screen = await render(<Pile />);
      const [first, second] = wrappers(screen);

      expect(getComputedStyle(first!).marginInlineStart).toBe('0px');
      // The computed value, not the inline string: the browser re-serialises
      // `calc(10px * -1)` and need not agree with itself about how.
      expect(getComputedStyle(second!).marginInlineStart).toBe('-10px');
    });

    it('falls back to a fraction of the rung when nobody said', async () => {
      const screen = await render(
        <MPStack size="md">
          <div style={{ width: 32, height: 32 }} />
          <div style={{ width: 32, height: 32 }} />
        </MPStack>
      );
      const [, second] = wrappers(screen);

      expect(getComputedStyle(second!).marginInlineStart).toBe('-18px');
    });
  });

  /*
   * A flow only overlaps items on the axis it flows along. The other one has to
   * be written per item: a fixed `margin-block-start` in a row does not
   * accumulate, it puts every item at the same offset and there is no fan.
   */
  it('multiplies the diagonal drop by the index rather than repeating it', async () => {
    const screen = await render(<Pile direction="diagonal" drop={10} />);
    const offsets = wrappers(screen).map((item) => getComputedStyle(item).marginBlockStart);

    expect(offsets).toEqual(['0px', '10px', '20px', '30px', '40px']);
  });

  describe('the front of the pile', () => {
    it('paints the first item on top by default', async () => {
      const screen = await render(<Pile />);

      expect(wrappers(screen).map((item) => getComputedStyle(item).zIndex)).toEqual([
        '5',
        '4',
        '3',
        '2',
        '1'
      ]);
    });

    it('turns round for `front="last"`', async () => {
      const screen = await render(<Pile front="last" />);

      expect(wrappers(screen).map((item) => getComputedStyle(item).zIndex)).toEqual([
        '1',
        '2',
        '3',
        '4',
        '5'
      ]);
    });

    it('puts the front item in front where two of them overlap', async () => {
      const screen = await render(<Pile />);
      const [first, second] = wrappers(screen);
      const rect = second!.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + 2, rect.top + rect.height / 2);

      expect(first!.contains(hit)).toBe(true);
    });
  });

  describe('depth', () => {
    it('scales each item against the one in front of it', async () => {
      const screen = await render(<Pile scaleStep={0.9} />);
      const depths = wrappers(screen).map((item) => scaled(item.firstElementChild!));

      // The front item is never scaled, whichever end the front is.
      expect(depths[0]).toBeCloseTo(1, 5);
      expect(depths[1]).toBeCloseTo(0.9, 5);
      expect(depths[2]).toBeCloseTo(0.81, 5);
    });

    it('changes what is drawn and not what is measured', async () => {
      const plain = await render(<Pile />);
      const scaled = await render(<Pile scaleStep={0.8} />);

      // A scaled card does not pull the ones behind it closer: the pile is the
      // same size, which is what keeps the layout stable while a deck is tuned.
      expect(Math.round(box(scaled).width)).toBe(Math.round(box(plain).width));
    });

    it('puts the depth on a layer of its own, so an entrance cannot overwrite it', async () => {
      const screen = await render(<Pile scaleStep={0.9} transition="grow" />);
      const [, second] = wrappers(screen);

      // `grow` animates the individual `scale` property. On one element the
      // keyframe would win and the depth would be gone; here the entrance is on
      // the wrapper and the depth on the item inside it.
      expect(getComputedStyle(second!).animationName).toBe('mp-anim-scale');
      expect(scaled(second!.firstElementChild!)).toBeCloseTo(0.9, 5);
    });
  });

  describe('max, total and overflow', () => {
    it('draws the remainder from the number that did not fit', async () => {
      const screen = await render(
        <MPStack max={2} total={40} overflow={(hidden) => <span>+{hidden}</span>}>
          <div />
          <div />
          <div />
        </MPStack>
      );

      expect(screen.container.textContent).toBe('+38');
      expect(wrappers(screen)).toHaveLength(3);
    });

    it('counts from the children when it was handed all of them', async () => {
      const screen = await render(
        <MPStack max={2} overflow={(hidden) => <span>+{hidden}</span>}>
          <div />
          <div />
          <div />
          <div />
        </MPStack>
      );

      expect(screen.container.textContent).toBe('+2');
    });

    it('draws nothing for a remainder of nought', async () => {
      const screen = await render(
        <MPStack max={4} overflow={(hidden) => <span>+{hidden}</span>}>
          <div />
          <div />
        </MPStack>
      );

      expect(screen.container.textContent).toBe('');
      expect(wrappers(screen)).toHaveLength(2);
    });

    it('keeps the remainder in the pile rather than floating it clear of one', async () => {
      const screen = await render(
        <MPStack max={2} total={40} overflow={(hidden) => <span>+{hidden}</span>}>
          <div />
          <div />
          <div />
        </MPStack>
      );

      expect(wrappers(screen).map((item) => getComputedStyle(item).zIndex)).toEqual([
        '3',
        '2',
        '1'
      ]);
    });
  });

  describe('the entrance', () => {
    it('runs one of the shared effects on each item, held back by its position', async () => {
      const screen = await render(<Pile transition="fade" stagger={60} />);
      const items = wrappers(screen);

      expect(items.map((item) => getComputedStyle(item).animationName)).toEqual(
        Array(5).fill('mp-anim-fade')
      );
      expect(getComputedStyle(items[2]!).animationDelay).toBe('0.12s');
    });

    it('deals from the back when reversed', async () => {
      const screen = await render(<Pile transition="fade" stagger={60} reverse />);
      const items = wrappers(screen);

      expect(getComputedStyle(items[0]!).animationDelay).toBe('0.24s');
      expect(getComputedStyle(items[4]!).animationDelay).toBe('0s');
    });

    it('animates nothing at all without a `transition`', async () => {
      const screen = await render(<Pile />);

      expect(getComputedStyle(wrappers(screen)[0]!).animationName).toBe('none');
    });
  });

  it('rings the item rather than the wrapper, so the line follows the shape', async () => {
    const screen = await render(
      <MPStack ring>
        <MPAvatar name="Ada Lovelace" />
      </MPStack>
    );
    const stack = screen.container.querySelector('.mp-stack') as HTMLElement;
    const avatar = screen.container.querySelector('.mp-avatar') as HTMLElement;

    expect(stack.className).toContain('ring-mp-surface');
    // A square ring around a circular avatar is worse than none, so it has to
    // land on the thing whose shape it is tracing.
    expect(getComputedStyle(avatar).boxShadow).not.toBe('none');
  });

  it('does not touch the children it was given', async () => {
    const screen = await render(
      <MPStack>
        <div data-testid="mine" className="mine" style={{ color: 'rgb(1, 2, 3)' }} />
      </MPStack>
    );
    const child = screen.getByTestId('mine').element() as HTMLElement;

    // Cloning them to add a class would require every child to accept one, and
    // a face wrapped in a router's link has no obligation to.
    expect(child.className).toBe('mine');
    expect(child.style.color).toBe('rgb(1, 2, 3)');
    expect(child.style.zIndex).toBe('');
  });
});
