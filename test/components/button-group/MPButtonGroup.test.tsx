import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButton, MPButtonGroup, MPIconButton, MPIcon, ICONS } from 'material-plus-ui';

/**
 * The component had no test directory at all.
 *
 * It was touched in passing by `MPButton`'s and `MPToggle`'s suites, which is
 * not the same thing: what a group *is* — the run's outer corners kept and its
 * inner ones cut, and one set of values reaching every member — was the one part
 * nothing asserted. Both of those are silent when they break. A group whose
 * fourth button is a rung out is still a row of buttons, and a run that lost its
 * joins is still a run.
 */
describe('MPButtonGroup', () => {
  describe('what it is', () => {
    it('is a group, so a screen reader offers it as one thing', async () => {
      const screen = await render(
        <MPButtonGroup aria-label="Alignment">
          <MPButton>Left</MPButton>
          <MPButton>Right</MPButton>
        </MPButtonGroup>
      );

      await expect.element(screen.getByRole('group', { name: 'Alignment' })).toBeInTheDocument();
    });

    it('leaves the buttons real buttons', async () => {
      const screen = await render(
        <MPButtonGroup>
          <MPButton>Left</MPButton>
          <MPButton>Right</MPButton>
        </MPButtonGroup>
      );

      expect(screen.getByRole('button').all()).toHaveLength(2);
    });
  });

  /*
   * The other half of the component, and the one that is not visual: `variant`,
   * `size`, `color` and `disabled` are set once for the set rather than repeated
   * on every button. The failure this prevents is silent — a group where one
   * button is a size out is not a group.
   */
  describe('what a member inherits', () => {
    it('hands its size and variant to every button', async () => {
      const screen = await render(
        <MPButtonGroup size="sm" variant="outlined">
          <MPButton>Left</MPButton>
          <MPButton>Right</MPButton>
        </MPButtonGroup>
      );

      for (const button of screen.getByRole('button').elements()) {
        expect(button).toHaveAttribute('data-mp-size', 'sm');
        expect(button).toHaveAttribute('data-mp-variant', 'outlined');
      }
    });

    it('disables the whole set at once', async () => {
      const screen = await render(
        <MPButtonGroup disabled>
          <MPButton>Left</MPButton>
          <MPButton>Right</MPButton>
        </MPButtonGroup>
      );

      for (const button of screen.getByRole('button').elements()) {
        expect(button).toBeDisabled();
      }
    });

    // A row of secondary actions with one destructive button in it is a real
    // thing, so the member's own prop wins over the set's.
    it('lets a button disagree with the group', async () => {
      const screen = await render(
        <MPButtonGroup size="sm" variant="outlined" disabled>
          <MPButton>Left</MPButton>
          <MPButton size="lg" variant="filled" disabled={false}>
            Delete
          </MPButton>
        </MPButtonGroup>
      );
      const odd = screen.getByRole('button', { name: 'Delete' }).element();

      expect(odd).toHaveAttribute('data-mp-size', 'lg');
      expect(odd).toHaveAttribute('data-mp-variant', 'filled');
      expect(odd).not.toBeDisabled();
    });

    /*
     * Every value passes through as-is, `undefined` included: a button reads the
     * group as a *fallback*, so "not set on the group" has to keep meaning "use
     * the button's own default" rather than turning into one.
     */
    it('leaves a button its own defaults when the group named nothing', async () => {
      const screen = await render(
        <MPButtonGroup>
          <MPButton>Save</MPButton>
        </MPButtonGroup>
      );
      const button = screen.getByRole('button').element();

      expect(button).toHaveAttribute('data-mp-size', 'md');
      expect(button).toHaveAttribute('data-mp-variant', 'filled');
    });

    it('reaches an icon button too, which is a button underneath', async () => {
      const screen = await render(
        <MPButtonGroup size="xs">
          <MPIconButton label="Search" icon={<MPIcon icon={ICONS.search} />} />
        </MPButtonGroup>
      );

      expect(screen.getByRole('button', { name: 'Search' }).element()).toHaveAttribute(
        'data-mp-size',
        'xs'
      );
    });
  });

  /*
   * MD3's connected button group keeps the run's *outer* corners fully round and
   * cuts the inner ones back, so the row reads as one shape that has been
   * divided rather than as three pills that happen to be adjacent.
   */
  describe('the shape of the run', () => {
    async function corners(orientation?: 'horizontal' | 'vertical') {
      const screen = await render(
        <MPButtonGroup orientation={orientation}>
          <MPButton>One</MPButton>
          <MPButton>Two</MPButton>
          <MPButton>Three</MPButton>
        </MPButtonGroup>
      );

      return screen
        .getByRole('button')
        .elements()
        .map((element) => getComputedStyle(element));
    }

    it('keeps the outer corners round and cuts the inner ones', async () => {
      const [first, middle, last] = await corners();

      // The leading edge of the first and the trailing edge of the last are the
      // run's own outline; everything between them is a seam.
      expect(Number.parseFloat(first.borderTopLeftRadius)).toBeGreaterThan(
        Number.parseFloat(first.borderTopRightRadius)
      );
      expect(Number.parseFloat(last.borderTopRightRadius)).toBeGreaterThan(
        Number.parseFloat(last.borderTopLeftRadius)
      );
      expect(Number.parseFloat(middle.borderTopLeftRadius)).toBe(
        Number.parseFloat(middle.borderTopRightRadius)
      );
    });

    it('cuts the top and bottom instead when the run is vertical', async () => {
      const [first, , last] = await corners('vertical');

      expect(Number.parseFloat(first.borderTopLeftRadius)).toBeGreaterThan(
        Number.parseFloat(first.borderBottomLeftRadius)
      );
      expect(Number.parseFloat(last.borderBottomLeftRadius)).toBeGreaterThan(
        Number.parseFloat(last.borderTopLeftRadius)
      );
    });

    it('says which way it runs, for a page that wants to know', async () => {
      const screen = await render(
        <MPButtonGroup orientation="vertical">
          <MPButton>One</MPButton>
        </MPButtonGroup>
      );

      expect(screen.getByRole('group').element()).toHaveAttribute(
        'data-mp-orientation',
        'vertical'
      );
    });
  });

  describe('fullWidth', () => {
    it('divides the row between the buttons', async () => {
      const screen = await render(
        <div style={{ width: 400 }}>
          <MPButtonGroup fullWidth>
            <MPButton>One</MPButton>
            <MPButton>A much longer label</MPButton>
          </MPButtonGroup>
        </div>
      );
      const [first, second] = screen
        .getByRole('button')
        .elements()
        .map((button) => button.getBoundingClientRect().width);

      expect(first).toBeCloseTo(second, 0);
    });
  });
});
