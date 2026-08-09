import { useState } from 'react';
import { MPFilePicker } from 'material-plus-ui';

export default function FilePickerHero() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <MPFilePicker
        label="Attachments"
        hint="Anything up to 10 MB"
        multiple
        maxSize={10_000_000}
        value={files}
        onFilesChange={setFiles}
      />
    </div>
  );
}
