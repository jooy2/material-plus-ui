import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPList, MPListItem } from 'material-plus-ui';

describe('MPList', () => {
  describe('the sheet', () => {
    it('is a list, said out loud', async () => {
      // A host reset may take the bullets off every `<ul>`, and Safari takes the
      // list semantics off with them.
      const screen = await render(
        <MPList>
          <MPListItem>One</MPListItem>
        </MPList>
      );
      const element = screen.getByRole('list').element();

      expect(element.tagName).toBe('UL');
      expect(element).toHaveAttribute('role', 'list');
    });

    it('leaves the surface neutral whatever the accent is', async () => {
      // A list holds other people's content, and that content arrives with its
      // own colours.
      const screen = await render(
        <MPList variant="tonal" color="error">
          <MPListItem>One</MPListItem>
        </MPList>
      );

      expect(screen.getByRole('list').element()).toHaveClass('bg-mp-surface-container');
    });

    it('renders an ordered list when asked', async () => {
      const screen = await render(
        <MPList render={<ol />}>
          <MPListItem>One</MPListItem>
        </MPList>
      );

      expect(screen.getByRole('list').element().tagName).toBe('OL');
    });

    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(
        <MPList className="my-own-class">
          <MPListItem>One</MPListItem>
        </MPList>
      );
      const element = screen.getByRole('list').element();

      expect(element).toHaveClass('my-own-class');
      expect(element).toHaveClass('mp-list');
    });
  });

  describe('dividers', () => {
    it('keeps a hair of padding and rounded rows without them', async () => {
      const screen = await render(
        <MPList>
          <MPListItem>One</MPListItem>
        </MPList>
      );

      expect(screen.getByRole('list').element()).toHaveClass('p-1');
      expect(screen.getByText('One').element().closest('div')).toHaveClass('rounded-mp-sm');
    });

    it('gives up both once the rules have to reach the edge', async () => {
      // A row cannot be a floating tile and a ruled line at the same time.
      const screen = await render(
        <MPList dividers>
          <MPListItem>One</MPListItem>
        </MPList>
      );

      expect(screen.getByRole('list').element()).not.toHaveClass('p-1');
      expect(screen.getByText('One').element().closest('div')).not.toHaveClass('rounded-mp-sm');
    });
  });

  describe('inheritance', () => {
    it('carries the size down to every row', async () => {
      // A list where item four is a size bigger than the rest is the failure
      // this context exists to prevent.
      const screen = await render(
        <MPList size="xs">
          <MPListItem>One</MPListItem>
          <MPListItem>Two</MPListItem>
        </MPList>
      );

      for (const label of ['One', 'Two']) {
        expect(screen.getByText(label).element().closest('div')).toHaveClass('py-1.5');
      }
    });

    it('reaches a row a caller wrapped in a component of their own', async () => {
      function Row({ children }: { children: React.ReactNode }) {
        return <MPListItem>{children}</MPListItem>;
      }

      const screen = await render(
        <MPList size="xs">
          <Row>One</Row>
        </MPList>
      );

      expect(screen.getByText('One').element().closest('div')).toHaveClass('py-1.5');
    });
  });
});

describe('MPListItem', () => {
  describe('shape', () => {
    it('is an inert row when there is nothing to press', async () => {
      const screen = await render(
        <MPList>
          <MPListItem>One</MPListItem>
        </MPList>
      );

      expect(screen.getByRole('button').query()).toBeNull();
      expect(screen.getByRole('link').query()).toBeNull();
    });

    it('becomes a real button with an onClick', async () => {
      const onClick = vi.fn();
      const screen = await render(
        <MPList>
          <MPListItem onClick={onClick}>One</MPListItem>
        </MPList>
      );

      await screen.getByRole('button', { name: 'One' }).click();

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('becomes a real link with an href', async () => {
      const screen = await render(
        <MPList>
          <MPListItem href="/one">One</MPListItem>
        </MPList>
      );

      expect(screen.getByRole('link', { name: 'One' }).element()).toHaveAttribute('href', '/one');
    });

    it('stays inert while disabled', async () => {
      const screen = await render(
        <MPList>
          <MPListItem onClick={() => {}} disabled>
            One
          </MPListItem>
        </MPList>
      );

      expect(screen.getByRole('button').query()).toBeNull();
      expect(screen.getByText('One').element().closest('div')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });

  describe('selected', () => {
    it('is a page on a link and the chosen one on a button', async () => {
      const screen = await render(
        <MPList>
          <MPListItem href="/one" selected>
            One
          </MPListItem>
          <MPListItem onClick={() => {}} selected>
            Two
          </MPListItem>
        </MPList>
      );

      expect(screen.getByRole('link', { name: 'One' }).element()).toHaveAttribute(
        'aria-current',
        'page'
      );
      expect(screen.getByRole('button', { name: 'Two' }).element()).toHaveAttribute(
        'aria-current',
        'true'
      );
    });

    it('fills with the container tone', async () => {
      const screen = await render(
        <MPList>
          <MPListItem selected>One</MPListItem>
        </MPList>
      );

      expect(screen.getByText('One').element().closest('div')).toHaveClass(
        'bg-(--_mp-accent-container)'
      );
    });

    it('keeps that fill on a pressable row rather than losing it to a reset', async () => {
      // A `<button>` arrives with the browser's own grey and this library ships
      // no page reset, so a pressable row says `bg-transparent` — but two
      // backgrounds of equal specificity resolve by their order in the generated
      // stylesheet, so only one of the two may ever be emitted.
      const screen = await render(
        <MPList>
          <MPListItem onClick={() => {}} selected>
            One
          </MPListItem>
        </MPList>
      );
      const row = screen.getByRole('button', { name: 'One' }).element();

      expect(row).toHaveClass('bg-(--_mp-accent-container)');
      expect(row).not.toHaveClass('bg-transparent');
    });

    it('resets the browser’s own grey on a row that is not selected', async () => {
      const screen = await render(
        <MPList>
          <MPListItem onClick={() => {}}>One</MPListItem>
        </MPList>
      );

      expect(screen.getByRole('button', { name: 'One' }).element()).toHaveClass('bg-transparent');
    });
  });

  describe('slots', () => {
    it('stacks a description under the label', async () => {
      const screen = await render(
        <MPList>
          <MPListItem description="Second line">One</MPListItem>
        </MPList>
      );

      expect(screen.getByText('Second line').element()).toHaveClass('text-mp-on-surface-variant');
    });

    it('keeps an action outside the pressable area', async () => {
      // A row that both navigates and holds a toggle has two things to press,
      // and nesting one button inside another is markup the browser rewrites.
      const screen = await render(
        <MPList>
          <MPListItem onClick={() => {}} action={<button type="button">More</button>}>
            One
          </MPListItem>
        </MPList>
      );
      const row = screen.getByRole('button', { name: 'One' }).element();
      const action = screen.getByRole('button', { name: 'More' }).element();

      expect(row.contains(action)).toBe(false);
    });

    it('draws the icon slots', async () => {
      const screen = await render(
        <MPList>
          <MPListItem
            startIcon={<span data-testid="start">▸</span>}
            endIcon={<span data-testid="end">›</span>}
          >
            One
          </MPListItem>
        </MPList>
      );

      expect(screen.getByTestId('start').query()).not.toBeNull();
      expect(screen.getByTestId('end').query()).not.toBeNull();
    });
  });

  describe('the row’s own element', () => {
    it('renders a router’s link in place of the anchor', async () => {
      // The `<li>` stays an `<li>` — it is inside a `<ul>` — and what a caller
      // actually needs to own is the element inside it.
      const Link = ({ href, children, ...rest }: React.ComponentProps<'a'>) => (
        <a href={href} data-router="yes" {...rest}>
          {children}
        </a>
      );

      const screen = await render(
        <MPList>
          <MPListItem href="/inbox" render={<Link />}>
            Inbox
          </MPListItem>
        </MPList>
      );
      const link = screen.getByRole('link', { name: 'Inbox' }).element();

      expect(link).toHaveAttribute('data-router', 'yes');
      expect(link).toHaveAttribute('href', '/inbox');
      expect(link.closest('li')).not.toBeNull();
    });

    it('carries target through, with the rel a new tab needs', async () => {
      const screen = await render(
        <MPList>
          <MPListItem href="https://example.com" target="_blank">
            Docs
          </MPListItem>
        </MPList>
      );
      const link = screen.getByRole('link', { name: 'Docs' }).element();

      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('lets a caller’s rel replace that one rather than extend it', async () => {
      const screen = await render(
        <MPList>
          <MPListItem href="https://example.com" target="_blank" rel="nofollow">
            Docs
          </MPListItem>
        </MPList>
      );

      expect(screen.getByRole('link', { name: 'Docs' }).element()).toHaveAttribute(
        'rel',
        'nofollow'
      );
    });

    it('renders in place of the button when there is no href', async () => {
      const screen = await render(
        <MPList>
          <MPListItem onClick={() => {}} render={<div data-mine="yes" />}>
            Archive
          </MPListItem>
        </MPList>
      );
      const row = screen.container.querySelector('[data-mine="yes"]')!;

      expect(row.tagName).toBe('DIV');
      // `type` belongs to the button this replaced, not to whatever came instead.
      expect(row).not.toHaveAttribute('type');
    });
  });
});
