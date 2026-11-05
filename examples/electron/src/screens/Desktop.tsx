import { useState } from 'react';
import {
  MPCard,
  MPCodeBlock,
  MPFilePicker,
  MPList,
  MPListItem,
  MPShortcut,
  MPTextLink,
  MPTypography,
  formatFileSize
} from 'material-plus-ui';

const source = `import { MPButton } from 'material-plus-ui';

export function Save({ busy }: { busy: boolean }) {
  return <MPButton loading={busy}>Save changes</MPButton>;
}`;

const python = `def greet(name: str) -> str:
    return f"Hello, {name}"`;

/** What a desktop app does that a page in a browser tab does not. */
export function Desktop() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="flex flex-col gap-4">
      <MPCard title="Files from the disk">
        <MPFilePicker
          label="Attachments"
          multiple
          hint="Drop files from Finder or Explorer"
          value={files}
          onFilesChange={setFiles}
        />
        {files.length > 0 ? (
          <MPList size="sm" aria-label="Paths" className="mt-3">
            {files.map((file) => (
              <MPListItem key={file.name} description={formatFileSize(file.size)}>
                {window.desktop?.pathForFile(file) || file.name}
              </MPListItem>
            ))}
          </MPList>
        ) : null}
      </MPCard>

      <MPCard title="Code, highlighted from a chunk loaded on demand">
        <div className="flex flex-col gap-3">
          <MPCodeBlock code={source} language="tsx" title="src/Save.tsx" lineNumbers />
          <MPCodeBlock code={python} language="python" title="greet.py" />
        </div>
      </MPCard>

      <MPCard title="Keys and links">
        <MPTypography className="flex items-center gap-2">
          Open the command palette with <MPShortcut keys="Mod+K" />
        </MPTypography>
        <MPTypography className="mt-2">
          <MPTextLink href="https://material-plus.cdget.com" newTab>
            The documentation, in the browser
          </MPTextLink>
        </MPTypography>
      </MPCard>
    </div>
  );
}
