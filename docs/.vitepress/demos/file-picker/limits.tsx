import { useState } from 'react';
import { MPFilePicker, formatFileSize } from 'material-plus-ui';
import type { MPFileRejection } from 'material-plus-ui';

const MAX_SIZE = 500_000;
const MAX_FILES = 2;

/** What each reason means, said the way a person would say it. */
function explain({ file, reason }: MPFileRejection) {
  if (reason === 'type') {
    return `${file.name} is not an image.`;
  }

  if (reason === 'size') {
    return `${file.name} is ${formatFileSize(file.size)} — the limit is ${formatFileSize(MAX_SIZE)}.`;
  }

  return `${file.name} did not fit: ${MAX_FILES} files at most.`;
}

/**
 * `onReject` is the prop worth wiring first.
 *
 * Without it a file that is turned away disappears in silence, which is the
 * single worst thing a dropzone does — the reader watches their file vanish and
 * has no way to tell whether it was rejected or lost. Try dropping a PDF, or
 * three images, or one over 500 kB.
 *
 * Note that `accept` is checked on the drop as well as in the dialog. The
 * browser only ever applies it to its own dialog.
 */
export default function FilePickerLimits() {
  const [files, setFiles] = useState<File[]>([]);
  const [refused, setRefused] = useState<string[]>([]);

  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 420 }}>
      <MPFilePicker
        label="Photos"
        title="Drop up to two images"
        hint={`PNG or JPEG, ${formatFileSize(MAX_SIZE)} each`}
        accept="image/png,image/jpeg"
        multiple
        maxFiles={MAX_FILES}
        maxSize={MAX_SIZE}
        value={files}
        onFilesChange={(next) => {
          setFiles(next);
          setRefused([]);
        }}
        onReject={(rejections) => setRefused(rejections.map(explain))}
        errorMessage={refused.length > 0 ? refused.join(' ') : undefined}
      />
    </div>
  );
}
