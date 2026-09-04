import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPPortal } from 'material-plus-ui';
import * as React from 'react';

describe('MPPortal', () => {
  it('renders its children at the end of the body', async () => {
    const screen = await render(
      <div data-testid="here">
        <MPPortal>
          <p data-testid="moved">Elsewhere</p>
        </MPPortal>
      </div>
    );
    const moved = document.querySelector('[data-testid="moved"]')!;

    expect(moved).not.toBeNull();
    expect(screen.getByTestId('here').element().contains(moved)).toBe(false);
    expect(moved.parentElement).toBe(document.body);
  });

  it('renders into a container it was given', async () => {
    function Probe() {
      const box = React.useRef<HTMLDivElement>(null);

      return (
        <div>
          <div ref={box} data-testid="target" />
          <MPPortal container={box}>
            <p data-testid="moved">Here instead</p>
          </MPPortal>
        </div>
      );
    }

    const screen = await render(<Probe />);

    await expect.element(screen.getByTestId('moved')).toBeInTheDocument();
    expect(
      screen.getByTestId('target').element().contains(screen.getByTestId('moved').element())
    ).toBe(true);
  });

  it('waits for a ref rather than falling back to the body', async () => {
    // A ref is `null` on the first render. Falling back would render the
    // content in the body and move it a frame later, which is a flash.
    function Probe({ ready }: { ready: boolean }) {
      const box = React.useRef<HTMLDivElement>(null);

      return (
        <div>
          {ready ? <div ref={box} data-testid="target" /> : null}
          <MPPortal container={ready ? box : { current: null }}>
            <p data-testid="moved">Content</p>
          </MPPortal>
        </div>
      );
    }

    const screen = await render(<Probe ready={false} />);

    expect(document.querySelector('[data-testid="moved"]')).toBeNull();

    await screen.rerender(<Probe ready />);

    await expect.element(screen.getByTestId('moved')).toBeInTheDocument();
  });

  it('renders in place when disabled', async () => {
    const screen = await render(
      <div data-testid="here">
        <MPPortal disabled>
          <p data-testid="moved">Content</p>
        </MPPortal>
      </div>
    );

    expect(
      screen.getByTestId('here').element().contains(screen.getByTestId('moved').element())
    ).toBe(true);
  });

  it('remounts the subtree when `disabled` changes, and says so', async () => {
    // Not a defect to be fixed later: React sees a portal and an inline subtree
    // as different elements, so this is what a branch at the call site does too.
    // The prop saves the branch, not the state.
    const mounts = vi.fn();

    function Child() {
      React.useEffect(() => mounts(), []);

      return <p data-testid="moved">Content</p>;
    }

    const screen = await render(
      <MPPortal disabled>
        <Child />
      </MPPortal>
    );

    expect(mounts).toHaveBeenCalledTimes(1);

    await screen.rerender(
      <MPPortal disabled={false}>
        <Child />
      </MPPortal>
    );

    expect(mounts).toHaveBeenCalledTimes(2);
  });

  it('lets a click inside it reach a handler outside', async () => {
    // React's own behaviour rather than anything added here, and it catches
    // people both ways.
    const onClick = vi.fn();
    const screen = await render(
      <div onClick={onClick}>
        <MPPortal>
          <button type="button">Press</button>
        </MPPortal>
      </div>
    );

    await screen.getByRole('button', { name: 'Press' }).click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
