import { MPCodeBlock, MPFlex } from 'material-plus-ui';

const SOURCE = `import { MPButton } from 'material-plus-ui';

export function Toolbar({ onSave }: { onSave: () => void }) {
  return (
    <MPButton variant="filled" onClick={onSave}>
      Save
    </MPButton>
  );
}`;

const SHELL = `npm install material-plus-ui @base-ui/react
npm run dev`;

export default function CodeBlockHero() {
  return (
    <MPFlex direction="column" gap={20} style={{ width: '100%' }}>
      <MPCodeBlock
        code={SOURCE}
        language="tsx"
        title="src/Toolbar.tsx"
        lineNumbers
        markLines="5-9"
        rawToggle
      />

      <MPCodeBlock code={SHELL} language="bash" prompt="$" theme="dark" showLanguage={false} />
    </MPFlex>
  );
}
