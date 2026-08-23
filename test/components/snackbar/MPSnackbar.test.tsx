import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButton, MPSnackbarProvider, useMPSnackbar } from 'material-plus-ui';
import { translation } from '../../support/style';
import type { MPSnackbarOptions, MPSnackbarProviderProps } from 'material-plus-ui';

/** A button that raises one snackbar, which is the shape a caller actually has. */
function Raise({ label = 'Raise', ...options }: MPSnackbarOptions & { label?: string }) {
  const snackbar = useMPSnackbar();

  return <MPButton onClick={() => snackbar.add(options)}>{label}</MPButton>;
}

function Harness({
  children,
  ...provider
}: MPSnackbarProviderProps & { children?: React.ReactNode }) {
  return <MPSnackbarProvider {...provider}>{children}</MPSnackbarProvider>;
}

describe('MPSnackbar', () => {
  describe('raising one', () => {
    it('puts nothing on the page until something is raised', async () => {
      const screen = await render(
        <Harness>
          <Raise message="Saved" />
        </Harness>
      );

      expect(screen.getByText('Saved').query()).toBeNull();
    });

    it('shows the message a caller handed it', async () => {
      const screen = await render(
        <Harness>
          <Raise message="Draft saved" />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Raise' }).click();

      await expect.element(screen.getByText('Draft saved')).toBeInTheDocument();
    });

    it('renders no action button at all when there is no action', async () => {
      const screen = await render(
        <Harness>
          <Raise message="Deleted" />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Raise' }).click();
      await expect.element(screen.getByText('Deleted')).toBeInTheDocument();

      // Not merely unlabelled — absent. An empty button in the plate would take
      // its padding with it and leave the message off-centre.
      expect(document.querySelectorAll('.mp-snackbar button')).toHaveLength(1);
    });

    it('calls back when the action is pressed', async () => {
      const onAction = vi.fn();
      const screen = await render(
        <Harness>
          <Raise message="Deleted" actionLabel="Undo" onAction={onAction} />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Raise' }).click();
      await screen.getByRole('button', { name: 'Undo' }).click();

      expect(onAction).toHaveBeenCalled();
    });

    it('closes from its ×', async () => {
      const screen = await render(
        <Harness closeLabel="Dismiss">
          <Raise message="Draft saved" />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Raise' }).click();
      await expect.element(screen.getByText('Draft saved')).toBeInTheDocument();

      // Not a role query, and deliberately. Base UI marks the × `aria-hidden`
      // until the stack is focused with F6, so that a screen reader reading a
      // live region does not hear a close button for every message that goes
      // past. It is still a real button for a pointer.
      const close = document.querySelector('[aria-label="Dismiss"]') as HTMLButtonElement;

      expect(close.tagName).toBe('BUTTON');
      close.click();

      await expect.element(screen.getByText('Draft saved')).not.toBeInTheDocument();
    });

    it('drops the × when the stack says not to show one', async () => {
      const screen = await render(
        <Harness showClose={false} closeLabel="Dismiss">
          <Raise message="Draft saved" />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Raise' }).click();
      await expect.element(screen.getByText('Draft saved')).toBeInTheDocument();

      expect(document.querySelector('[aria-label="Dismiss"]')).toBeNull();
    });

    it('renders the message as text rather than as a heading', async () => {
      // Base UI's Title is an `<h2>` by default, which would put every snackbar
      // into the page outline beside the real headings.
      const screen = await render(
        <Harness>
          <Raise message="Draft saved" />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Raise' }).click();
      await expect.element(screen.getByText('Draft saved')).toBeInTheDocument();

      expect(screen.getByRole('heading').query()).toBeNull();
    });
  });

  describe('the plate', () => {
    it('reads the inverse surface unless a family is asked for', async () => {
      // MD3's snackbar is the neutral palette read at the other end of the
      // scheme, and its action is `inverse-primary` for the same reason: on a
      // plate that inverts the page, `primary` is the one colour guaranteed not
      // to read.
      const screen = await render(
        <Harness>
          <Raise message="Saved" />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Raise' }).click();
      await expect.element(screen.getByText('Saved')).toBeInTheDocument();

      const plate = document.querySelector('.mp-snackbar') as HTMLElement;

      expect(plate.style.getPropertyValue('--_mp-plate')).toBe('var(--_mp-color-inverse-surface)');
      expect(plate.style.getPropertyValue('--_mp-plate-action')).toBe(
        'var(--_mp-color-inverse-primary)'
      );
    });

    it('swaps in an accent container when one is named', async () => {
      const screen = await render(
        <Harness>
          <Raise message="Saved" color="error" />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Raise' }).click();
      await expect.element(screen.getByText('Saved')).toBeInTheDocument();

      const plate = document.querySelector('.mp-snackbar') as HTMLElement;

      expect(plate.style.getPropertyValue('--_mp-plate')).toBe('var(--_mp-color-error-container)');
    });

    it('lets one snackbar override the provider’s family', async () => {
      const screen = await render(
        <Harness color="primary">
          <Raise message="Saved" color="tertiary" />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Raise' }).click();
      await expect.element(screen.getByText('Saved')).toBeInTheDocument();

      const plate = document.querySelector('.mp-snackbar') as HTMLElement;

      expect(plate.style.getPropertyValue('--_mp-plate')).toBe(
        'var(--_mp-color-tertiary-container)'
      );
    });
  });

  describe('the stack', () => {
    it('pins itself where the provider says', async () => {
      const screen = await render(
        <Harness position="top-center">
          <Raise message="Saved" />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Raise' }).click();
      await expect.element(screen.getByText('Saved')).toBeInTheDocument();

      const viewport = document.querySelector('.mp-portal.fixed') as HTMLElement;

      expect(viewport.className).toContain('top-0');
      expect(viewport.className).toContain('items-center');
    });

    it('brings the plate in from the edge it is pinned to', async () => {
      // The travel and the flick are derived from one fact, and have to agree: a
      // snackbar that came down from the top and could only be flicked upwards
      // would be asking to be undone.
      const screen = await render(
        <Harness position="bottom-start">
          <Raise message="Saved" />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Raise' }).click();
      await expect.element(screen.getByText('Saved')).toBeInTheDocument();

      const plate = document.querySelector('.mp-snackbar') as HTMLElement;

      // Below its resting place, on the way up to it — asserted as which side of
      // home it is on rather than as a distance, because the travel is 200ms
      // wide and every engine lands somewhere different inside it. Firefox reads
      // 97.7% where Chromium reads 100%, and both of them mean "below".
      //
      // `translate` rather than `transform`, which Base UI writes a swiped
      // plate's offset onto — a travel spelled the same way would be wiped out
      // by the first flick.
      expect(getComputedStyle(plate).transitionProperty).toBe('opacity, translate');
      expect(translation(plate).y).toBeGreaterThan(0);

      await expect.poll(() => getComputedStyle(plate).translate).toBe('none');
    });

    it('brings it down instead when the stack is at the top', async () => {
      const screen = await render(
        <Harness position="top-center">
          <Raise message="Saved" />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Raise' }).click();
      await expect.element(screen.getByText('Saved')).toBeInTheDocument();

      const plate = document.querySelector('.mp-snackbar') as HTMLElement;

      expect(translation(plate).y).toBeLessThan(0);
    });

    it('updates a snackbar in place when its id is reused', async () => {
      function Uploader() {
        const snackbar = useMPSnackbar();

        return (
          <>
            <MPButton onClick={() => snackbar.add({ id: 'upload', message: 'Uploading…' })}>
              Start
            </MPButton>
            <MPButton onClick={() => snackbar.update('upload', { message: 'Uploaded' })}>
              Finish
            </MPButton>
          </>
        );
      }

      const screen = await render(
        <Harness>
          <Uploader />
        </Harness>
      );

      await screen.getByRole('button', { name: 'Start' }).click();
      await expect.element(screen.getByText('Uploading…')).toBeInTheDocument();

      await screen.getByRole('button', { name: 'Finish' }).click();

      await expect.element(screen.getByText('Uploaded')).toBeInTheDocument();
      expect(document.querySelectorAll('.mp-snackbar')).toHaveLength(1);
    });
  });
});
