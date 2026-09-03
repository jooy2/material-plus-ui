import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  MPButton,
  MPChip,
  MPMenu,
  MPMenuCheckboxItem,
  MPMenuGroup,
  MPMenuItem,
  MPMenuRadioGroup,
  MPMenuRadioItem,
  MPMenuSeparator,
  MPMenuSubmenu
} from 'material-plus-ui';

function Basic(props: Record<string, unknown>) {
  return (
    <MPMenu trigger={<MPButton>Actions</MPButton>} {...props}>
      <MPMenuItem shortcut="⌘X">Cut</MPMenuItem>
      <MPMenuItem>Copy</MPMenuItem>
      <MPMenuSeparator />
      <MPMenuItem color="error">Delete</MPMenuItem>
    </MPMenu>
  );
}

/**
 * Presses the trigger and waits until the popup is actually on the page.
 *
 * The popup is portalled, so it is mounted in an effect rather than in the
 * commit the click produced: when `click()` resolves the menu is opening, not
 * open. `element()` reads the DOM at that instant and throws, where
 * `expect.element` retries — so a test that reads a row straight after the
 * click is a race, and one that only Chromium happens to win.
 */
async function open(screen: Awaited<ReturnType<typeof render>>, trigger = 'Actions') {
  await screen.getByRole('button', { name: trigger }).click();
  await expect.element(screen.getByRole('menu')).toBeInTheDocument();
}

describe('MPMenu', () => {
  describe('opening', () => {
    it('puts nothing on the page until the trigger is pressed', async () => {
      const screen = await render(<Basic />);

      expect(screen.getByRole('menu').query()).toBeNull();
    });

    it('opens on click and lists its rows', async () => {
      const screen = await render(<Basic />);

      await screen.getByRole('button', { name: 'Actions' }).click();

      await expect.element(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByRole('menuitem').all()).toHaveLength(3);
    });

    it('reports the change to a controlled parent', async () => {
      const onOpenChange = vi.fn();
      const screen = await render(<Basic onOpenChange={onOpenChange} />);

      await open(screen);

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('opens nothing at all while it is disabled', async () => {
      const screen = await render(<Basic disabled />);

      // The trigger is disabled outright rather than merely ignored, so there is
      // no state where a menu that cannot open still looks pressable.
      expect(screen.getByRole('button', { name: 'Actions' }).element()).toBeDisabled();
      expect(screen.getByRole('menu').query()).toBeNull();
    });
  });

  describe('a row', () => {
    it('calls back when it is picked, and closes', async () => {
      const onClick = vi.fn();
      const screen = await render(
        <MPMenu trigger={<MPButton>Actions</MPButton>}>
          <MPMenuItem onClick={onClick}>Copy</MPMenuItem>
        </MPMenu>
      );

      await screen.getByRole('button', { name: 'Actions' }).click();
      await screen.getByRole('menuitem', { name: 'Copy' }).click();

      expect(onClick).toHaveBeenCalled();
      await expect.element(screen.getByRole('menu')).not.toBeInTheDocument();
    });

    it('is a real link when it is given an href', async () => {
      // A menu of links that are not links cannot be opened in a new tab, cannot
      // be copied, and tells a screen reader the wrong thing about every one.
      const screen = await render(
        <MPMenu trigger={<MPButton>Actions</MPButton>}>
          <MPMenuItem href="https://example.com" target="_blank">
            Docs
          </MPMenuItem>
        </MPMenu>
      );

      await open(screen);

      const row = screen.getByRole('menuitem', { name: 'Docs' }).element();

      expect(row.tagName).toBe('A');
      expect(row).toHaveAttribute('href', 'https://example.com');
      // `target="_blank"` hands the opened page a `window.opener` back into this
      // one unless it is told not to.
      expect(row).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('leaves rel alone on a link that stays in this tab', async () => {
      const screen = await render(
        <MPMenu trigger={<MPButton>Actions</MPButton>}>
          <MPMenuItem href="/docs">Docs</MPMenuItem>
        </MPMenu>
      );

      await open(screen);

      expect(screen.getByRole('menuitem', { name: 'Docs' }).element()).not.toHaveAttribute('rel');
    });

    it('lets a caller replace the rel it would have written', async () => {
      const screen = await render(
        <MPMenu trigger={<MPButton>Actions</MPButton>}>
          <MPMenuItem href="https://example.com" target="_blank" rel="noopener nofollow">
            Docs
          </MPMenuItem>
        </MPMenu>
      );

      await open(screen);

      expect(screen.getByRole('menuitem', { name: 'Docs' }).element()).toHaveAttribute(
        'rel',
        'noopener nofollow'
      );
    });

    it('stops being a link once it is disabled', async () => {
      // Base UI's `LinkItem` has no `disabled` of its own, so a row that kept
      // its `href` while unavailable is one a keyboard still lands on and a
      // crawler still follows.
      const onClick = vi.fn();
      const screen = await render(
        <MPMenu trigger={<MPButton>Actions</MPButton>}>
          <MPMenuItem href="https://example.com" disabled onClick={onClick}>
            Docs
          </MPMenuItem>
        </MPMenu>
      );

      await open(screen);

      const row = screen.getByRole('menuitem', { name: 'Docs' }).element();

      expect(row.tagName).not.toBe('A');
      expect(row).not.toHaveAttribute('href');
      expect(row).toHaveAttribute('aria-disabled', 'true');
    });

    it('re-points its own family when it names one', async () => {
      // Branched rather than appended: two utilities of equal specificity resolve
      // by their order in the generated stylesheet, so appending would silently
      // do nothing.
      const screen = await render(<Basic />);

      await open(screen);

      const row = screen.getByRole('menuitem', { name: 'Delete' }).element() as HTMLElement;

      expect(row.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-error)');
      // Exactly one of the two, never both — the disabled variant is still there
      // and is a different class.
      expect(row.className.split(' ')).toContain('text-(--_mp-accent)');
      expect(row.className.split(' ')).not.toContain('text-mp-on-surface');
    });

    it('lists a disabled row without letting it be taken', async () => {
      const onClick = vi.fn();
      const screen = await render(
        <MPMenu trigger={<MPButton>Actions</MPButton>}>
          <MPMenuItem disabled onClick={onClick}>
            Paste
          </MPMenuItem>
        </MPMenu>
      );

      await open(screen);

      expect(screen.getByRole('menuitem', { name: 'Paste' }).element()).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('sets a shortcut at the end of the row without binding it', async () => {
      const screen = await render(<Basic />);

      await open(screen);

      expect(screen.getByRole('menuitem', { name: /Cut/ }).element().textContent).toContain('⌘X');
    });
  });

  describe('ticking and choosing', () => {
    it('renders a checkbox row that stays open when it is ticked', async () => {
      function Checkable() {
        const [on, setOn] = useState(false);

        return (
          <MPMenu trigger={<MPButton>View</MPButton>}>
            <MPMenuCheckboxItem checked={on} onCheckedChange={setOn}>
              Show grid
            </MPMenuCheckboxItem>
          </MPMenu>
        );
      }

      const screen = await render(<Checkable />);

      await open(screen, 'View');

      const row = screen.getByRole('menuitemcheckbox', { name: 'Show grid' });

      expect(row.element()).toHaveAttribute('aria-checked', 'false');

      await row.click();

      // A list of things to tick is a list you tick more than one of.
      await expect.element(screen.getByRole('menu')).toBeInTheDocument();
      await expect.element(row).toHaveAttribute('aria-checked', 'true');
    });

    it('renders a radio group where only one row is chosen', async () => {
      function Chooser() {
        const [value, setValue] = useState<string | number>('list');

        return (
          <MPMenu trigger={<MPButton>View</MPButton>}>
            <MPMenuRadioGroup value={value} onValueChange={setValue}>
              <MPMenuRadioItem value="list">List</MPMenuRadioItem>
              <MPMenuRadioItem value="grid">Grid</MPMenuRadioItem>
            </MPMenuRadioGroup>
          </MPMenu>
        );
      }

      const screen = await render(<Chooser />);

      await open(screen, 'View');

      expect(screen.getByRole('menuitemradio', { name: 'List' }).element()).toHaveAttribute(
        'aria-checked',
        'true'
      );

      await screen.getByRole('menuitemradio', { name: 'Grid' }).click();

      await expect
        .element(screen.getByRole('menuitemradio', { name: 'Grid' }))
        .toHaveAttribute('aria-checked', 'true');
    });

    it("grows a ticked row's mark in and lets it play back out", async () => {
      // The same pair `MPCheckbox`'s own mark is checked on, and for the same
      // reason: which values it travels between is a starting style, and
      // reading one back would be timing the transition rather than asking
      // whether there is one. What cannot be true by accident is that the mark
      // carries a transition and that unticking leaves it on the page for the
      // length of it.
      function Checkable() {
        const [on, setOn] = useState(true);

        return (
          <MPMenu trigger={<MPButton>View</MPButton>}>
            <MPMenuCheckboxItem checked={on} onCheckedChange={setOn}>
              Show grid
            </MPMenuCheckboxItem>
          </MPMenu>
        );
      }

      const screen = await render(<Checkable />);

      await open(screen, 'View');

      const mark = () => document.querySelector('.mp-menu__mark');

      expect(getComputedStyle(mark()!).transitionProperty).toBe('opacity, scale');
      expect(getComputedStyle(mark()!).transitionDuration).toBe('0.2s');

      await screen.getByRole('menuitemcheckbox', { name: 'Show grid' }).click();

      expect(mark()).not.toBeNull();
      await expect.poll(mark).toBeNull();
    });

    it("grows a chosen row's dot in on the same timing", async () => {
      const screen = await render(
        <MPMenu trigger={<MPButton>View</MPButton>}>
          <MPMenuRadioGroup defaultValue="list">
            <MPMenuRadioItem value="list">List</MPMenuRadioItem>
          </MPMenuRadioGroup>
        </MPMenu>
      );

      await open(screen, 'View');

      const dot = document.querySelector('.mp-menu__dot')!;

      expect(getComputedStyle(dot).transitionProperty).toBe('opacity, scale');
      expect(getComputedStyle(dot).transitionDuration).toBe('0.2s');
    });
  });

  describe('structure', () => {
    it('names a group without making the heading pickable', async () => {
      const screen = await render(
        <MPMenu trigger={<MPButton>Actions</MPButton>}>
          <MPMenuGroup label="Clipboard">
            <MPMenuItem>Cut</MPMenuItem>
          </MPMenuGroup>
        </MPMenu>
      );

      await screen.getByRole('button', { name: 'Actions' }).click();

      await expect.element(screen.getByText('Clipboard')).toBeInTheDocument();
      expect(screen.getByRole('menuitem').all()).toHaveLength(1);
    });

    it('opens a submenu from its own row', async () => {
      const screen = await render(
        <MPMenu trigger={<MPButton>Actions</MPButton>}>
          <MPMenuSubmenu label="Share">
            <MPMenuItem>Email</MPMenuItem>
          </MPMenuSubmenu>
        </MPMenu>
      );

      await screen.getByRole('button', { name: 'Actions' }).click();
      await screen.getByRole('menuitem', { name: 'Share' }).click();

      await expect.element(screen.getByRole('menuitem', { name: 'Email' })).toBeInTheDocument();
    });
  });

  describe('the surface', () => {
    it('declares its accent slots on the popup, which is where the rows are', async () => {
      // A portalled popup renders at the end of `<body>`, so nothing set further
      // up the tree reaches it.
      const screen = await render(<Basic color="tertiary" />);

      await open(screen);

      const popup = screen.getByRole('menu').element() as HTMLElement;

      expect(popup.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-tertiary)');
    });

    it('carries the size it was drawn at', async () => {
      const screen = await render(<Basic size="sm" />);

      await screen.getByRole('button', { name: 'Actions' }).click();

      await expect.element(screen.getByRole('menu')).toHaveAttribute('data-mp-size', 'sm');
    });
  });

  describe('the trigger', () => {
    it('opens from a chip, with the state on the element that holds it', async () => {
      // Base UI merges its handlers and its ARIA onto the element the trigger
      // renders. A chip whose shell was a span put `aria-expanded` on something
      // that was not focusable and left a second tab stop underneath it.
      const screen = await render(
        <MPMenu trigger={<MPChip>Filter</MPChip>}>
          <MPMenuItem>Copy</MPMenuItem>
        </MPMenu>
      );
      const trigger = screen.getByRole('button', { name: 'Filter' }).element();

      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      // One element, so there is nothing underneath to tab to.
      expect(trigger.querySelectorAll('button')).toHaveLength(0);

      await open(screen, 'Filter');

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('says so in the console when the trigger is not a button', async () => {
      // Base UI's own check, and the reason `nativeButton` is a prop: what a
      // trigger renders is only known once it has rendered.
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      await render(
        <MPMenu trigger={<span>Account</span>}>
          <MPMenuItem>Copy</MPMenuItem>
        </MPMenu>
      );

      expect(error.mock.calls.flat().join(' ')).toContain('expected a native <button>');
      error.mockRestore();
    });

    it('takes nativeButton={false} for a trigger that is deliberately not one', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      const screen = await render(
        <MPMenu nativeButton={false} trigger={<span>Account</span>}>
          <MPMenuItem>Copy</MPMenuItem>
        </MPMenu>
      );

      expect(error.mock.calls.flat().join(' ')).not.toContain('expected a native');
      error.mockRestore();

      // And Base UI supplies what a `<button>` would have brought: the role, the
      // tab stop and the press.
      const trigger = screen.getByRole('button', { name: 'Account' }).element();

      expect(trigger.tagName).toBe('SPAN');
      expect(trigger).toHaveAttribute('tabindex', '0');

      await open(screen, 'Account');
    });
  });
});
