import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPContainer } from 'material-plus-ui';

const styles = (element: Element) => getComputedStyle(element);

describe('MPContainer', () => {
  it('renders what it was handed', async () => {
    const screen = await render(<MPContainer>Page</MPContainer>);

    await expect.element(screen.getByText('Page')).toBeInTheDocument();
  });

  it('publishes the rung it was drawn at', async () => {
    const screen = await render(<MPContainer size="xl">Page</MPContainer>);

    expect(screen.container.querySelector('.mp-container')).toHaveAttribute('data-mp-size', 'xl');
  });

  it("holds the content off the edge by Material's own margin", async () => {
    // 16dp at `md`, which is MD3's compact margin.
    const screen = await render(<MPContainer>Page</MPContainer>);
    const root = styles(screen.container.querySelector('.mp-container')!);

    expect(root.paddingLeft).toBe('16px');
    expect(root.paddingRight).toBe('16px');
  });

  it('moves the margin up and down the ladder', async () => {
    const screen = await render(
      <div>
        <MPContainer size="xs" className="tight">
          A
        </MPContainer>
        <MPContainer size="lg" className="roomy">
          B
        </MPContainer>
      </div>
    );

    expect(styles(screen.container.querySelector('.tight')!).paddingLeft).toBe('10px');
    expect(styles(screen.container.querySelector('.roomy')!).paddingLeft).toBe('20px');
  });

  it('drops the margin for full-bleed content', async () => {
    const screen = await render(<MPContainer padded={false}>Page</MPContainer>);

    expect(styles(screen.container.querySelector('.mp-container')!).paddingLeft).toBe('0px');
  });

  it('takes no measure until it is asked for one', async () => {
    const screen = await render(<MPContainer>Page</MPContainer>);

    expect(styles(screen.container.querySelector('.mp-container')!).maxWidth).toBe('none');
  });

  it("caps the content at a window size class's boundary", async () => {
    // `md` is 840dp, which is where MD3's expanded window starts.
    const screen = await render(<MPContainer maxWidth="md">Page</MPContainer>);

    expect(styles(screen.container.querySelector('.mp-container')!).maxWidth).toBe('840px');
  });

  it('centres a capped container, and stops when told to', async () => {
    const screen = await render(
      <div style={{ width: 1200 }}>
        <MPContainer maxWidth="sm" className="middle">
          A
        </MPContainer>
        <MPContainer maxWidth="sm" centered={false} className="start">
          B
        </MPContainer>
      </div>
    );

    expect(styles(screen.container.querySelector('.middle')!).marginLeft).toBe('300px');
    expect(styles(screen.container.querySelector('.start')!).marginLeft).toBe('0px');
  });

  it('keeps the margin inside the measure it was given', async () => {
    // `box-border`, so a capped container is exactly as wide as it said it would
    // be rather than that plus two margins.
    const screen = await render(
      <div style={{ width: 1200 }}>
        <MPContainer maxWidth="sm" className="page">
          Page
        </MPContainer>
      </div>
    );

    expect(styles(screen.container.querySelector('.page')!).width).toBe('600px');
  });

  it('paints no surface of its own', async () => {
    // The outermost element on a page is the one thing that must not decide what
    // the page looks like.
    const screen = await render(<MPContainer>Page</MPContainer>);
    const root = styles(screen.container.querySelector('.mp-container')!);

    expect(root.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(root.borderTopWidth).toBe('0px');
    expect(root.boxShadow).toBe('none');
  });

  it('renders a different element when told to', async () => {
    const screen = await render(<MPContainer render={<main />}>Page</MPContainer>);

    expect(screen.container.querySelector('.mp-container')!.tagName).toBe('MAIN');
  });

  it('passes through the attributes a div takes', async () => {
    const screen = await render(
      <MPContainer id="page" aria-label="Article">
        Page
      </MPContainer>
    );
    const root = screen.container.querySelector('.mp-container')!;

    expect(root).toHaveAttribute('id', 'page');
    expect(root).toHaveAttribute('aria-label', 'Article');
  });
});
