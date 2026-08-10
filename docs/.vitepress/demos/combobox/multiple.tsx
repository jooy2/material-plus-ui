import { useState } from 'react';
import { MPCombobox } from 'material-plus-ui';
import type { MPComboboxValue } from 'material-plus-ui';

const TAGS = [
  { value: 'design', label: 'design' },
  { value: 'infra', label: 'infra' },
  { value: 'docs', label: 'docs' },
  { value: 'a11y', label: 'a11y' }
];

/**
 * The chosen values become chips inside the field and the input goes on
 * filtering after each one, so a set of tags is built without the field ever
 * closing.
 */
export default function ComboboxMultiple() {
  const [tags, setTags] = useState<MPComboboxValue[]>(['design']);

  return (
    <div style={{ width: '100%', maxWidth: 340 }}>
      <MPCombobox
        items={TAGS}
        label="Tags"
        multiple
        clearable
        placeholder="Add a tag"
        customLabel={(query) => `Create “${query}”`}
        value={tags}
        onValueChange={setTags}
        description="Type a name that is not in the list to create it."
        fullWidth
      />
    </div>
  );
}
