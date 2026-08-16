import { MPAnimateTyping, MPBox } from 'material-plus-ui';

/**
 * Four lines typed in sequence, each held back by a `delay`.
 *
 * The text is in the document from the first frame — a clipped copy for a
 * screen reader, which reads it once rather than sitting through the
 * performance — so nothing here reflows as the characters arrive and nobody is
 * kept waiting on the effect.
 */
export default function AnimateTypingTerminal() {
  const lines = [
    { text: '$ npm install material-plus-ui', delay: 0 },
    { text: 'added 3 packages in 1.4s', delay: 1600 },
    { text: '$ npm run dev', delay: 2600 },
    { text: 'ready — http://localhost:5173', delay: 4000 }
  ];

  return (
    <MPBox variant="filled" style={{ width: '100%', maxWidth: 440 }}>
      <div style={{ display: 'grid', gap: 4, fontFamily: 'ui-monospace, monospace' }}>
        {lines.map((line, index) => (
          <MPAnimateTyping
            key={line.text}
            text={line.text}
            speed={40}
            delay={line.delay}
            caret={index === lines.length - 1}
            style={{ fontSize: '0.85rem' }}
          />
        ))}
      </div>
    </MPBox>
  );
}
