import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPPagination } from 'material-plus-ui';
import { userEvent } from 'vitest/browser';

/** The row as it reads: numbers, ellipses and the steppers' accessible names. */
const row = (container: Element) =>
  Array.from(container.querySelectorAll('li')).map((item) =>
    item.matches('[aria-hidden="true"]')
      ? '…'
      : (item.firstElementChild!.getAttribute('aria-label') ?? '')
  );

/** The ellipses, which are `<li>`s — not the state layers, which are spans. */
const gaps = (container: Element) => container.querySelectorAll('li[aria-hidden="true"]');

const pages = (container: Element) =>
  Array.from(container.querySelectorAll('.mp-pagination__cell'))
    .map((cell) => cell.textContent!.trim())
    .filter((text) => text !== '');

describe('MPPagination', () => {
  it('renders nothing at all for a single page', async () => {
    const screen = await render(<MPPagination count={1} />);

    expect(screen.container.querySelector('.mp-pagination')).toBeNull();
  });

  it('is a named landmark holding a list', async () => {
    const screen = await render(<MPPagination count={5} />);

    await expect
      .element(screen.getByRole('navigation', { name: 'Pagination' }))
      .toBeInTheDocument();
    expect(screen.container.querySelector('ul[role="list"]')).not.toBeNull();
  });

  it('marks the page being read, and marks nothing else', async () => {
    const screen = await render(<MPPagination count={5} defaultPage={3} />);
    const current = screen.container.querySelectorAll('[aria-current="page"]');

    expect(current).toHaveLength(1);
    expect(current[0].textContent).toBe('3');
  });

  it('moves when a page is pressed', async () => {
    const onPageChange = vi.fn();
    const screen = await render(<MPPagination count={5} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Page 4' }));

    expect(onPageChange).toHaveBeenCalledWith(4);
    expect(screen.container.querySelector('[aria-current="page"]')!.textContent).toBe('4');
  });

  it('leaves a controlled row where the caller put it', async () => {
    const onPageChange = vi.fn();
    const screen = await render(<MPPagination count={5} page={2} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Page 4' }));

    expect(onPageChange).toHaveBeenCalledWith(4);
    expect(screen.container.querySelector('[aria-current="page"]')!.textContent).toBe('2');
  });

  it('steps by one page, and stops at the ends', async () => {
    const screen = await render(<MPPagination count={3} defaultPage={1} />);

    await expect.element(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.container.querySelector('[aria-current="page"]')!.textContent).toBe('2');

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await expect.element(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('jumps to an end when it is asked for the edge steppers', async () => {
    const screen = await render(<MPPagination count={20} defaultPage={10} showEdges />);

    await userEvent.click(screen.getByRole('button', { name: 'Last page' }));

    expect(screen.container.querySelector('[aria-current="page"]')!.textContent).toBe('20');
  });

  it('keeps the number of slots constant as the window slides', async () => {
    // Stepping from page 1 to page 2 must not relayout the row, or every cell
    // moves out from under the pointer that just pressed one.
    const screen = await render(<MPPagination count={20} defaultPage={1} />);
    const before = row(screen.container).length;

    await userEvent.click(screen.getByRole('button', { name: 'Page 2', exact: true }));

    expect(row(screen.container)).toHaveLength(before);
  });

  it('folds the middle away and shows both ends', async () => {
    const screen = await render(<MPPagination count={20} defaultPage={10} showArrows={false} />);

    expect(pages(screen.container)).toEqual(['1', '9', '10', '11', '20']);
    expect(gaps(screen.container)).toHaveLength(2);
  });

  it('fills a gap of exactly one page with that page rather than an ellipsis', async () => {
    // `1 … 3 … 9` would hide a single number behind a symbol wider than the
    // number it replaced.
    const screen = await render(<MPPagination count={7} defaultPage={4} showArrows={false} />);

    expect(pages(screen.container)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    expect(gaps(screen.container)).toHaveLength(0);
  });

  it('widens the window when it is asked for more siblings', async () => {
    const screen = await render(
      <MPPagination count={20} defaultPage={10} siblingCount={2} showArrows={false} />
    );

    expect(pages(screen.container)).toEqual(['1', '8', '9', '10', '11', '12', '20']);
  });

  it('drops the ends when it is asked for no boundary', async () => {
    const screen = await render(
      <MPPagination count={20} defaultPage={10} boundaryCount={0} showArrows={false} />
    );

    expect(pages(screen.container)).toEqual(['9', '10', '11']);
  });

  it('fills only the page being read', async () => {
    const screen = await render(<MPPagination count={5} defaultPage={2} showArrows={false} />);
    const cells = Array.from(screen.container.querySelectorAll('.mp-pagination__cell'));
    const filled = cells.filter(
      (cell) => getComputedStyle(cell).backgroundColor !== 'rgba(0, 0, 0, 0)'
    );

    expect(filled).toHaveLength(1);
    expect(filled[0].textContent).toBe('2');
  });

  it('says where the reader is out loud, which the list length no longer does', async () => {
    const screen = await render(<MPPagination count={20} defaultPage={7} />);
    const status = screen.container.querySelector('[aria-live="polite"]')!;

    expect(status.textContent).toBe('Page 7 of 20');
  });

  it('says it in the language it was given', async () => {
    const screen = await render(<MPPagination count={20} defaultPage={7} locale="ko" />);

    expect(screen.container.querySelector('[aria-live="polite"]')!.textContent).toBe(
      '20페이지 중 7페이지'
    );
    await expect
      .element(screen.getByRole('navigation', { name: '페이지 매기기' }))
      .toBeInTheDocument();
  });

  it('takes a caller’s word over the translation', async () => {
    const screen = await render(
      <MPPagination count={5} locale="ko" labels={{ next: 'Go on then' }} />
    );

    await expect.element(screen.getByRole('button', { name: 'Go on then' })).toBeInTheDocument();
    // The rest of the namespace stays Korean rather than falling back to English.
    await expect.element(screen.getByRole('button', { name: '이전 페이지' })).toBeInTheDocument();
  });

  it('renders real links when it is given addresses', async () => {
    const screen = await render(
      <MPPagination count={5} defaultPage={2} getPageHref={(page) => `/list/${page}`} />
    );
    const three = screen.container.querySelector('a[href="/list/3"]')!;

    expect(three.tagName).toBe('A');
    // The page being read is not somewhere to go, so it stops being a link —
    // and neither is a stepper at the end of the row.
    expect(screen.container.querySelector('a[href="/list/2"]')).toBeNull();
    expect(screen.container.querySelector('a[rel="next"]')).not.toBeNull();
  });

  it('cancels the navigation when a handler wants the press', async () => {
    const onPageChange = vi.fn();
    const screen = await render(
      <MPPagination count={5} onPageChange={onPageChange} getPageHref={(page) => `#page-${page}`} />
    );

    await userEvent.click(screen.getByRole('link', { name: 'Page 3' }));

    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(window.location.hash).not.toBe('#page-3');
  });

  it('stops the whole row answering when it is disabled', async () => {
    const onPageChange = vi.fn();
    const screen = await render(
      <MPPagination count={5} defaultPage={2} disabled onPageChange={onPageChange} />
    );

    for (const cell of screen.container.querySelectorAll('.mp-pagination__cell')) {
      expect(cell).toBeDisabled();
    }
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('publishes the rung it was drawn at', async () => {
    const screen = await render(<MPPagination count={5} size="sm" id="pages" />);
    const nav = screen.container.querySelector('.mp-pagination')!;

    expect(nav).toHaveAttribute('data-mp-size', 'sm');
    expect(nav).toHaveAttribute('id', 'pages');
  });
});
