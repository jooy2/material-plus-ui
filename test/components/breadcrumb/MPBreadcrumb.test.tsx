import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPBreadcrumb, MPBreadcrumbItem } from 'material-plus-ui';

/**
 * The step element itself, rather than the truncating span inside it. The state
 * attributes live on the anchor, button or span that wraps the label.
 */
function stepOf(label: Element): HTMLElement {
  return label.parentElement as HTMLElement;
}

describe('MPBreadcrumb', () => {
  describe('the trail', () => {
    it('is navigation with a name', async () => {
      const screen = await render(
        <MPBreadcrumb>
          <MPBreadcrumbItem href="/">Home</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      expect(screen.getByRole('navigation', { name: 'Breadcrumb' }).query()).not.toBeNull();
    });

    it('takes a name of its own', async () => {
      const screen = await render(
        <MPBreadcrumb label="경로">
          <MPBreadcrumbItem href="/">홈</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      expect(screen.getByRole('navigation', { name: '경로' }).query()).not.toBeNull();
    });

    it('draws a mark between two steps and not before the first', async () => {
      const screen = await render(
        <MPBreadcrumb>
          <MPBreadcrumbItem href="/">Home</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/docs">Docs</MPBreadcrumbItem>
          <MPBreadcrumbItem>Page</MPBreadcrumbItem>
        </MPBreadcrumb>
      );
      const marks = screen
        .getByRole('navigation')
        .element()
        .querySelectorAll('li[aria-hidden="true"]');

      expect(marks).toHaveLength(2);
    });

    it('takes a mark of its own', async () => {
      const screen = await render(
        <MPBreadcrumb separator={<span data-testid="mark">»</span>}>
          <MPBreadcrumbItem href="/">Home</MPBreadcrumbItem>
          <MPBreadcrumbItem>Page</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      expect(screen.getByTestId('mark').query()).not.toBeNull();
    });
  });

  describe('the current step', () => {
    it('is the last one, and is not a link', async () => {
      const screen = await render(
        <MPBreadcrumb>
          <MPBreadcrumbItem href="/">Home</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/docs">Docs</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      expect(screen.getByRole('link', { name: 'Home' }).query()).not.toBeNull();
      expect(screen.getByRole('link', { name: 'Docs' }).query()).toBeNull();
      expect(stepOf(screen.getByText('Docs').element())).toHaveAttribute('aria-current', 'page');
    });

    it('moves when a step claims it', async () => {
      // Exactly one element in a trail may carry `aria-current="page"`.
      const screen = await render(
        <MPBreadcrumb>
          <MPBreadcrumbItem href="/" current>
            Home
          </MPBreadcrumbItem>
          <MPBreadcrumbItem href="/docs">Docs</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      expect(stepOf(screen.getByText('Home').element())).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('link', { name: 'Docs' }).query()).not.toBeNull();
    });
  });

  describe('folding', () => {
    it('shows the whole trail when no maximum is set', async () => {
      const screen = await render(
        <MPBreadcrumb>
          <MPBreadcrumbItem href="/">A</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/b">B</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/c">C</MPBreadcrumbItem>
          <MPBreadcrumbItem>D</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      expect(screen.getByRole('button', { name: 'Show hidden steps' }).query()).toBeNull();
      expect(screen.getByText('B').query()).not.toBeNull();
    });

    it('folds the middle away past the maximum', async () => {
      const screen = await render(
        <MPBreadcrumb maxItems={3}>
          <MPBreadcrumbItem href="/">A</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/b">B</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/c">C</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/d">D</MPBreadcrumbItem>
          <MPBreadcrumbItem>E</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      expect(screen.getByText('A').query()).not.toBeNull();
      expect(screen.getByText('E').query()).not.toBeNull();
      expect(screen.getByText('C').query()).toBeNull();
      expect(screen.getByRole('button', { name: 'Show hidden steps' }).query()).not.toBeNull();
    });

    it('puts the trail back when the fold is pressed', async () => {
      const screen = await render(
        <MPBreadcrumb maxItems={3}>
          <MPBreadcrumbItem href="/">A</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/b">B</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/c">C</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/d">D</MPBreadcrumbItem>
          <MPBreadcrumbItem>E</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      await screen.getByRole('button', { name: 'Show hidden steps' }).click();

      expect(screen.getByText('C').query()).not.toBeNull();
    });

    it('does not fold when the mark would stand in for one step', async () => {
      // A `…` replacing a single step is longer than the step it replaced.
      const screen = await render(
        <MPBreadcrumb maxItems={2}>
          <MPBreadcrumbItem href="/">A</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/b">B</MPBreadcrumbItem>
          <MPBreadcrumbItem>C</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      expect(screen.getByRole('button', { name: 'Show hidden steps' }).query()).toBeNull();
      expect(screen.getByText('B').query()).not.toBeNull();
    });

    it('leaves the fold as a plain mark when it is not expandable', async () => {
      const screen = await render(
        <MPBreadcrumb maxItems={3} expandable={false}>
          <MPBreadcrumbItem href="/">A</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/b">B</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/c">C</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/d">D</MPBreadcrumbItem>
          <MPBreadcrumbItem>E</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      expect(screen.getByRole('button').query()).toBeNull();
    });

    it('takes a name for the fold', async () => {
      const screen = await render(
        <MPBreadcrumb maxItems={3} expandLabel="숨겨진 단계 보기">
          <MPBreadcrumbItem href="/">A</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/b">B</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/c">C</MPBreadcrumbItem>
          <MPBreadcrumbItem href="/d">D</MPBreadcrumbItem>
          <MPBreadcrumbItem>E</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      expect(screen.getByRole('button', { name: '숨겨진 단계 보기' }).query()).not.toBeNull();
    });
  });

  describe('MPBreadcrumbItem', () => {
    it('is a button when it has an onClick and no href', async () => {
      const onClick = vi.fn();
      const screen = await render(
        <MPBreadcrumb>
          <MPBreadcrumbItem onClick={onClick}>Back</MPBreadcrumbItem>
          <MPBreadcrumbItem>Page</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      await screen.getByRole('button', { name: 'Back' }).click();

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('stops answering while disabled', async () => {
      const screen = await render(
        <MPBreadcrumb>
          <MPBreadcrumbItem href="/" disabled>
            Home
          </MPBreadcrumbItem>
          <MPBreadcrumbItem>Page</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      expect(screen.getByRole('link', { name: 'Home' }).query()).toBeNull();
      expect(stepOf(screen.getByText('Home').element())).toHaveAttribute('aria-disabled', 'true');
    });

    it('draws its icon slots', async () => {
      const screen = await render(
        <MPBreadcrumb>
          <MPBreadcrumbItem href="/" startIcon={<span data-testid="home">⌂</span>}>
            Home
          </MPBreadcrumbItem>
          <MPBreadcrumbItem>Page</MPBreadcrumbItem>
        </MPBreadcrumb>
      );

      expect(screen.getByTestId('home').query()).not.toBeNull();
    });
  });
});
