import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  MPBadge,
  MPButton,
  MPButtonGroup,
  MPChip,
  MPConfigProvider,
  MPDatePicker,
  MPLocaleProvider,
  MPTextField,
  MPTooltip,
  useMPConfig,
  useMPLocale
} from 'material-plus-ui';

/**
 * `data-mp-size` rather than a class name, for the reason the animation tests
 * give: what is being asserted is which rung the component resolved to, and a
 * height class is one consequence of that which can be spelled differently
 * tomorrow.
 */
function sizeOf(screen: { container: Element }, selector = '[data-mp-size]') {
  return screen.container.querySelector(selector)?.getAttribute('data-mp-size');
}

describe('MPConfigProvider', () => {
  describe('size', () => {
    it('moves the default for everything under it', async () => {
      const screen = await render(
        <MPConfigProvider size="sm">
          <MPButton>Save</MPButton>
        </MPConfigProvider>
      );

      expect(sizeOf(screen)).toBe('sm');
    });

    it('is still beaten by the prop at the call site', async () => {
      const screen = await render(
        <MPConfigProvider size="sm">
          <MPButton size="xl">Save</MPButton>
        </MPConfigProvider>
      );

      expect(sizeOf(screen)).toBe('xl');
    });

    it('leaves `md` in place when there is no provider', async () => {
      const screen = await render(<MPButton>Save</MPButton>);

      expect(sizeOf(screen)).toBe('md');
    });

    it('reaches a component that is not a button', async () => {
      const screen = await render(
        <MPConfigProvider size="lg">
          <MPChip>Draft</MPChip>
        </MPConfigProvider>
      );

      expect(sizeOf(screen)).toBe('lg');
    });

    it('reaches a picker, which resolves its own shell', async () => {
      const screen = await render(
        <MPConfigProvider size="sm">
          <MPDatePicker label="Due" locale="en-US" />
        </MPConfigProvider>
      );

      expect(sizeOf(screen, '.mp-date-picker')).toBe('sm');
    });
  });

  describe('color', () => {
    it('moves the accent for everything under it', async () => {
      const screen = await render(
        <MPConfigProvider color="tertiary">
          <MPButton>Save</MPButton>
        </MPConfigProvider>
      );
      const button = screen.getByRole('button', { name: 'Save' }).element() as HTMLElement;

      expect(button.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-tertiary)');
    });

    it('is beaten by the prop', async () => {
      const screen = await render(
        <MPConfigProvider color="tertiary">
          <MPButton color="error">Delete</MPButton>
        </MPConfigProvider>
      );
      const button = screen.getByRole('button', { name: 'Delete' }).element() as HTMLElement;

      expect(button.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-error)');
    });
  });

  describe('what it deliberately does not reach', () => {
    it('leaves a component that chose its own default alone', async () => {
      // `MPBadge` is `error` because a badge is usually a count of something
      // that wants attention. That is an answer rather than an unfilled default,
      // so an app-wide accent passes it by.
      const screen = await render(
        <MPConfigProvider color="tertiary">
          <MPBadge content={3}>
            <span>Inbox</span>
          </MPBadge>
        </MPConfigProvider>
      );
      const badge = screen.container.querySelector('.mp-badge') as HTMLElement;

      expect(badge.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-error)');
    });

    it('leaves a component whose size default is its own', async () => {
      // `MPTooltip` is `sm` because a tooltip drawn at a control's height is a
      // slab. That is an answer too, so an app-wide `xl` passes it by.
      const screen = await render(
        <MPConfigProvider size="xl">
          <MPTooltip content="Copied" defaultOpen>
            <button type="button">Copy</button>
          </MPTooltip>
        </MPConfigProvider>
      );

      await expect.element(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(document.querySelector('.mp-tooltip')?.getAttribute('data-mp-size')).toBe('sm');
    });
  });

  describe('specificity', () => {
    it('lets a nearer group beat the application', async () => {
      // A group is a statement about these controls; the provider is a statement
      // about the page. The nearer one wins.
      const screen = await render(
        <MPConfigProvider size="xl">
          <MPButtonGroup size="sm">
            <MPButton>One</MPButton>
          </MPButtonGroup>
        </MPConfigProvider>
      );

      expect(
        screen.getByRole('button', { name: 'One' }).element().getAttribute('data-mp-size')
      ).toBe('sm');
    });

    it('reaches a button in a group that says nothing', async () => {
      const screen = await render(
        <MPConfigProvider size="sm">
          <MPButtonGroup>
            <MPButton>One</MPButton>
          </MPButtonGroup>
        </MPConfigProvider>
      );

      expect(
        screen.getByRole('button', { name: 'One' }).element().getAttribute('data-mp-size')
      ).toBe('sm');
    });
  });

  describe('nesting', () => {
    it('merges rather than replaces', async () => {
      const screen = await render(
        <MPConfigProvider size="sm" color="tertiary">
          <MPConfigProvider color="error">
            <MPButton>Delete</MPButton>
          </MPConfigProvider>
        </MPConfigProvider>
      );
      const button = screen.getByRole('button', { name: 'Delete' }).element() as HTMLElement;

      // The inner provider named only the colour; the size survives.
      expect(button.getAttribute('data-mp-size')).toBe('sm');
      expect(button.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-error)');
    });
  });

  describe('locale', () => {
    it('carries the language too, so one provider is enough', async () => {
      function Probe() {
        return <output data-testid="locale">{useMPLocale()}</output>;
      }

      const screen = await render(
        <MPConfigProvider locale="ko">
          <Probe />
        </MPConfigProvider>
      );

      expect(screen.getByTestId('locale').element().textContent).toBe('ko');
    });

    it('inherits a language from an `MPLocaleProvider` above it', async () => {
      function Probe() {
        return <output data-testid="locale">{useMPLocale()}</output>;
      }

      const screen = await render(
        <MPLocaleProvider locale="ja">
          <MPConfigProvider size="sm">
            <Probe />
          </MPConfigProvider>
        </MPLocaleProvider>
      );

      expect(screen.getByTestId('locale').element().textContent).toBe('ja');
    });
  });

  describe('useMPConfig', () => {
    it('reports what was set and leaves the rest undefined', async () => {
      function Probe() {
        const config = useMPConfig();

        return <output data-testid="config">{JSON.stringify(config)}</output>;
      }

      const screen = await render(
        <MPConfigProvider size="lg">
          <Probe />
        </MPConfigProvider>
      );

      // `undefined` means nobody set one, rather than `primary` — the library's
      // own defaults are applied by the components, not stored here.
      expect(JSON.parse(screen.getByTestId('config').element().textContent ?? '{}')).toEqual({
        size: 'lg'
      });
    });

    it('is empty with no provider', async () => {
      function Probe() {
        return <output data-testid="config">{JSON.stringify(useMPConfig())}</output>;
      }

      const screen = await render(<Probe />);

      expect(screen.getByTestId('config').element().textContent).toBe('{}');
    });
  });

  it('does not change how many hooks a control calls', async () => {
    // The resolver reads the context unconditionally. Written as
    // `prop ?? useContext(…)` it would not, and a control handed a `size` on one
    // render and not on the next would call a different number of hooks.
    function Toggling() {
      const [sized, setSized] = useState(true);

      return (
        <>
          <MPTextField label="Name" value="" size={sized ? 'sm' : undefined} />
          <button type="button" onClick={() => setSized(false)}>
            drop the size
          </button>
        </>
      );
    }

    const screen = await render(
      <MPConfigProvider size="lg">
        <Toggling />
      </MPConfigProvider>
    );

    await screen.getByRole('button', { name: 'drop the size' }).click();

    // It fell back to the provider's rung rather than throwing on the way.
    expect(sizeOf(screen, '.mp-text-field')).toBe('lg');
  });
});
