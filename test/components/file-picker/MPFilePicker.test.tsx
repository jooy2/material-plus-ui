import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPFilePicker, formatFileSize } from 'material-plus-ui';
import type { MPFileRejection } from 'material-plus-ui';

/** A file of a given name, type and size, without touching the disk. */
function fileOf(name: string, type: string, bytes = 10) {
  return new File([new Uint8Array(bytes)], name, { type });
}

/** The hidden `<input type="file">` the zone clicks for you. */
function fileInput() {
  return document.querySelector('.mp-file-picker input[type="file"]') as HTMLInputElement;
}

/** Hands the input a batch the way the browser's own dialog would. */
function choose(files: File[]) {
  const transfer = new DataTransfer();

  for (const file of files) {
    transfer.items.add(file);
  }

  const input = fileInput();
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));

  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Drops a batch on the zone, which is the path `accept` is *not* enforced on. */
function drop(files: File[]) {
  const transfer = new DataTransfer();

  for (const file of files) {
    transfer.items.add(file);
  }

  const zone = document.querySelector('.mp-file-picker__zone')!.parentElement!;
  const event = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer });

  zone.dispatchEvent(event);

  return new Promise((resolve) => setTimeout(resolve, 0));
}

function ControlledPicker(props: Record<string, unknown>) {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <>
      <MPFilePicker label="Attachments" value={files} onFilesChange={setFiles} {...props} />
      <output data-testid="model">{files.map((file) => file.name).join(',')}</output>
    </>
  );
}

describe('formatFileSize', () => {
  it('speaks the units a file browser speaks', () => {
    // Base 1000 and `MB`, because that is what the reader's own file manager
    // says — a picker that disagrees with the Finder has picked a fight it
    // cannot win.
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(999)).toBe('999 B');
    expect(formatFileSize(1000)).toBe('1.0 kB');
    expect(formatFileSize(1_400_000)).toBe('1.4 MB');
    expect(formatFileSize(24_000_000)).toBe('24 MB');
    expect(formatFileSize(3_200_000_000)).toBe('3.2 GB');
  });
});

describe('MPFilePicker', () => {
  describe('rendering', () => {
    it('renders a pressable zone with a default sentence in it', async () => {
      const screen = await render(<MPFilePicker label="Attachments" />);

      await expect
        .element(screen.getByRole('button', { name: /Drop files here/ }))
        .toBeInTheDocument();
    });

    it('takes its own title, hint and icon', async () => {
      const screen = await render(
        <MPFilePicker
          label="Attachments"
          title="Add a photo"
          hint="PNG or JPEG, up to 5 MB"
          icon={<span data-testid="glyph">▲</span>}
        />
      );

      await expect.element(screen.getByText('Add a photo')).toBeInTheDocument();
      await expect.element(screen.getByText('PNG or JPEG, up to 5 MB')).toBeInTheDocument();
      expect(document.querySelector('[data-testid="glyph"]')).not.toBeNull();
    });

    it('draws no picture at all when the icon is cleared', async () => {
      await render(<MPFilePicker label="Attachments" icon={null} />);

      expect(document.querySelector('.mp-file-picker__zone .mp-icon')).toBeNull();
    });

    it('keeps the real input reachable rather than hidden', async () => {
      // `display: none` and `visibility: hidden` both make an input unfocusable,
      // and this one still has to be reachable by a form and by a `required`
      // validation message.
      await render(<MPFilePicker label="Attachments" name="files" required />);
      const input = fileInput();

      expect(input).not.toBeNull();
      expect(input.name).toBe('files');
      expect(input.required).toBe(true);
      expect(getComputedStyle(input).display).not.toBe('none');
    });

    it('passes accept and multiple through to the browser’s own dialog', async () => {
      await render(<MPFilePicker label="Attachments" accept="image/*,.pdf" multiple />);

      expect(fileInput().accept).toBe('image/*,.pdf');
      expect(fileInput().multiple).toBe(true);
    });
  });

  describe('choosing', () => {
    it('reports what was chosen', async () => {
      const onFilesChange = vi.fn();
      await render(<MPFilePicker label="Attachments" onFilesChange={onFilesChange} />);

      await choose([fileOf('cat.png', 'image/png')]);

      expect(onFilesChange).toHaveBeenCalledOnce();
      expect(onFilesChange.mock.lastCall?.[0][0].name).toBe('cat.png');
    });

    it('replaces rather than appends unless multiple is set', async () => {
      const screen = await render(<ControlledPicker />);

      await choose([fileOf('one.png', 'image/png')]);
      await choose([fileOf('two.png', 'image/png')]);

      expect(screen.getByTestId('model').element().textContent).toBe('two.png');
    });

    it('appends when multiple is set', async () => {
      const screen = await render(<ControlledPicker multiple />);

      await choose([fileOf('one.png', 'image/png')]);
      await choose([fileOf('two.png', 'image/png')]);

      expect(screen.getByTestId('model').element().textContent).toBe('one.png,two.png');
    });

    it('keeps what was chosen without being controlled', async () => {
      const screen = await render(<MPFilePicker label="Attachments" defaultValue={[]} />);

      await choose([fileOf('cat.png', 'image/png')]);

      await expect.element(screen.getByText('cat.png')).toBeInTheDocument();
    });
  });

  describe('turning files away', () => {
    it('checks accept on a drop, which the browser never does', async () => {
      const onReject = vi.fn();
      const onFilesChange = vi.fn();
      await render(
        <MPFilePicker
          label="Attachments"
          accept="image/*"
          onReject={onReject}
          onFilesChange={onFilesChange}
        />
      );

      await drop([fileOf('notes.pdf', 'application/pdf')]);

      expect(onFilesChange).not.toHaveBeenCalled();
      expect(onReject.mock.lastCall?.[0]).toEqual([
        expect.objectContaining({ reason: 'type' } satisfies Partial<MPFileRejection>)
      ]);
    });

    it('matches an extension as well as a media type', async () => {
      const onFilesChange = vi.fn();
      await render(
        <MPFilePicker label="Attachments" accept=".pdf" onFilesChange={onFilesChange} />
      );

      await drop([fileOf('notes.pdf', 'application/pdf')]);

      expect(onFilesChange).toHaveBeenCalledOnce();
    });

    it('turns away anything over maxSize, and says why', async () => {
      const onReject = vi.fn();
      await render(<MPFilePicker label="Attachments" maxSize={5} onReject={onReject} />);

      await choose([fileOf('big.png', 'image/png', 50)]);

      expect(onReject.mock.lastCall?.[0][0].reason).toBe('size');
    });

    it('counts maxFiles against what is already held', async () => {
      // The difference between "you may drop two files" and "you may end up with
      // two files" — only the second is what `maxFiles` means.
      const onReject = vi.fn();
      const screen = await render(<ControlledPicker multiple maxFiles={2} onReject={onReject} />);

      await choose([fileOf('one.png', 'image/png'), fileOf('two.png', 'image/png')]);
      await choose([fileOf('three.png', 'image/png')]);

      expect(screen.getByTestId('model').element().textContent).toBe('one.png,two.png');
      expect(onReject.mock.lastCall?.[0][0].reason).toBe('count');
    });

    it('keeps the good half of a mixed batch', async () => {
      const onReject = vi.fn();
      const screen = await render(
        <ControlledPicker multiple accept="image/*" onReject={onReject} />
      );

      await drop([fileOf('cat.png', 'image/png'), fileOf('notes.pdf', 'application/pdf')]);

      expect(screen.getByTestId('model').element().textContent).toBe('cat.png');
      expect(onReject.mock.lastCall?.[0]).toHaveLength(1);
    });
  });

  describe('the list', () => {
    it('lists each file with its size', async () => {
      await render(<ControlledPicker />);

      await choose([fileOf('cat.png', 'image/png', 1_400_000)]);

      const list = document.querySelector('.mp-file-picker__list')!;

      expect(list.textContent).toContain('cat.png');
      expect(list.textContent).toContain('1.4 MB');
    });

    it('removes one file without touching the others', async () => {
      const screen = await render(<ControlledPicker multiple />);

      await choose([fileOf('one.png', 'image/png'), fileOf('two.png', 'image/png')]);
      await screen.getByRole('button', { name: 'Remove one.png' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('two.png');
    });

    it('takes its own wording for the remove button', async () => {
      const screen = await render(
        <ControlledPicker removeLabel={(name: string) => `${name} 지우기`} />
      );

      await choose([fileOf('cat.png', 'image/png')]);

      await expect
        .element(screen.getByRole('button', { name: 'cat.png 지우기' }))
        .toBeInTheDocument();
    });

    it('hides the list when asked, without forgetting the file', async () => {
      const screen = await render(<ControlledPicker showList={false} />);

      await choose([fileOf('cat.png', 'image/png')]);

      expect(document.querySelector('.mp-file-picker__list')).toBeNull();
      // The picker still holds it; it is only the listing that is off.
      expect(screen.getByTestId('model').element().textContent).toBe('cat.png');
    });
  });

  describe('states', () => {
    it('shows an error message and marks the picker invalid', async () => {
      const screen = await render(
        <MPFilePicker label="Attachments" errorMessage="Attach at least one." />
      );

      await expect.element(screen.getByText('Attach at least one.')).toBeInTheDocument();
      expect(document.querySelector('.mp-file-picker')).toHaveAttribute('data-invalid');
    });

    it('lets the error replace the description', async () => {
      const screen = await render(
        <MPFilePicker
          label="Attachments"
          description="Up to five files."
          errorMessage="Attach at least one."
        />
      );

      await expect.element(screen.getByText('Attach at least one.')).toBeInTheDocument();
      expect(screen.getByText('Up to five files.').query()).toBeNull();
    });

    it('disables the zone and the input together', async () => {
      const screen = await render(<MPFilePicker label="Attachments" disabled />);

      expect(screen.getByRole('button', { name: /Drop files here/ }).element()).toBeDisabled();
      expect(fileInput().disabled).toBe(true);
    });

    it('shows what was chosen without letting it change when read-only', async () => {
      const onFilesChange = vi.fn();
      const screen = await render(
        <MPFilePicker
          label="Attachments"
          value={[fileOf('cat.png', 'image/png')]}
          readOnly
          onFilesChange={onFilesChange}
        />
      );

      await expect.element(screen.getByText('cat.png')).toBeInTheDocument();
      // No way out of the list, so nothing offers an action that does nothing.
      expect(screen.getByRole('button', { name: /Remove/ }).query()).toBeNull();

      await drop([fileOf('two.png', 'image/png')]);

      expect(onFilesChange).not.toHaveBeenCalled();
    });
  });
});
