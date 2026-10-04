import { act } from 'react';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';

/**
 * A page that arrived from a server and was then hydrated, for the failures that
 * only exist on that path.
 *
 * Every other test here mounts on the client, where there is no earlier markup
 * to disagree with. A component whose first render differs from what the server
 * sent is invisible to all of them, and in an application it is anything but:
 * React reports the mismatch as a recoverable error, throws the server's markup
 * away up to the nearest Suspense boundary — often the whole page — and renders
 * it again on the client. That is a long task where the page should have been
 * interactive, a largest paint timed from the second render, and whatever moved
 * in between.
 *
 * `renderToString` runs here in the browser rather than in Node, which is
 * faithful in the one way that matters: it reads `useSyncExternalStore`'s server
 * snapshot and runs no effects, exactly as a server does. What it does *not*
 * reproduce is a server whose clock, time zone or `Intl` locale differ from the
 * browser's. A test about those has to write the server's answer into `html`
 * itself.
 */
export interface Hydrated {
  container: HTMLElement;
  /** The markup the "server" sent, before the client touched it. */
  html: string;
  /** Every recoverable error React reported while hydrating. Empty is a pass. */
  errors: string[];
  root: Root;
}

const mounted: { root: Root; container: HTMLElement }[] = [];

/** `act`, with React told it is in a test only for as long as it runs. */
async function withAct(callback: () => Promise<void> | void): Promise<void> {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previous = scope.IS_REACT_ACT_ENVIRONMENT;

  scope.IS_REACT_ACT_ENVIRONMENT = true;

  try {
    await act(callback);
  } finally {
    scope.IS_REACT_ACT_ENVIRONMENT = previous;
  }
}

/**
 * Renders `node` to a string, puts it in a container on the page, and hydrates
 * it with the same element. Resolves once React has committed, run the effects
 * that follow and rendered what they asked for, so an assertion sees what a
 * reader would after load.
 *
 * Pass `html` to hydrate markup that a different server would have produced.
 */
export async function hydrateFromServer(node: ReactNode, html?: string): Promise<Hydrated> {
  const container = document.createElement('div');
  const errors: string[] = [];
  const markup = html ?? renderToString(node);

  container.innerHTML = markup;
  document.body.append(container);

  let root!: Root;

  // Inside `act`, as every other render in this suite is: it holds the test
  // until hydration has committed, its effects have run, and whatever they
  // scheduled — a store that answered differently after hydration — has
  // rendered too.
  await withAct(async () => {
    root = hydrateRoot(container, node, {
      onRecoverableError: (error) => {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    });
  });

  mounted.push({ root, container });

  return { container, html: markup, errors, root };
}

/** Unmounts and removes everything `hydrateFromServer` put on the page. */
export async function cleanupHydrated(): Promise<void> {
  for (const { root, container } of mounted.splice(0)) {
    await withAct(() => root.unmount());
    container.remove();
  }
}
