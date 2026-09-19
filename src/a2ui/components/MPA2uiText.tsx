/**
 * `Text` — the protocol's only way to say words, drawn as `MPTypography`.
 *
 * The variants map one for one onto the type scale: `h1` through `h5` are the
 * headings, `caption` is the small print, and `body` is everything else. So an
 * agent that asks for a heading gets MD3's `headline-large` rather than a
 * browser's `<h1>`, which is the whole point of pointing a catalog at a design
 * system.
 *
 * ## Markdown, and why it is off until a project turns it on
 *
 * The specification says `body` text may carry simple markdown. Rendering
 * markdown means turning a string an *agent* wrote into HTML, and this library
 * has no markdown parser and no sanitizer — adding either would put a parser in
 * everybody's bundle and make this package responsible for the escaping.
 *
 * So the protocol's own arrangement is used. `@a2ui/react` has a context for a
 * markdown renderer, whose contract states that an implementation *must*
 * sanitize what it returns; a project that wants formatted text provides one
 * (`@a2ui/markdown-it`, or its own), and the text is then set as HTML. With no
 * renderer configured there is nothing to trust and nothing is trusted: the
 * string is rendered as text, `**like this**`, which is wrong-looking and safe.
 * That is the same fallback the protocol's reference renderer takes.
 */
import * as React from 'react';
import { createComponentImplementation, useMarkdownRenderer } from '@a2ui/react/v0_9';
import { TextApi } from '@a2ui/web_core/v0_9';
import { MPTypography, type MPTypographyLevel } from '../../components/typography/MPTypography';
import { accessibilityAttributes, weightStyle } from '../internal/common';

/** The protocol's seven variants, in this library's words for the same things. */
const LEVEL: Record<string, MPTypographyLevel> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  caption: 'caption',
  body: 'body'
};

/**
 * The variants markdown is never applied to.
 *
 * A heading is a line of text, and a caption is a note about one. Neither is
 * prose, and running a block parser over either produces a paragraph inside a
 * heading — which is what the protocol's own renderer avoids the same way.
 */
const PLAIN = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'caption']);

/**
 * The text as sanitized HTML, or `null` while there is no renderer to sanitize
 * it — which is also the answer for a project that configured none.
 */
const useMarkdownHtml = (text: string, enabled: boolean) => {
  const renderer = useMarkdownRenderer();
  const [html, setHtml] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!renderer || !enabled) {
      setHtml(null);

      return;
    }

    let active = true;

    /*
     * Inside an `async` function rather than on the promise, so a renderer that
     * throws where it should have rejected is the same case as one that rejects:
     * the text falls back to text. A renderer is somebody else's code, and this
     * effect running in a component means its failure would otherwise take the
     * whole surface down.
     */
    const draw = async () => {
      try {
        const result = await renderer(text);

        if (active) {
          setHtml(typeof result === 'string' ? result : null);
        }
      } catch {
        if (active) {
          setHtml(null);
        }
      }
    };

    void draw();

    return () => {
      active = false;
    };
  }, [renderer, enabled, text]);

  return html;
};

export const MPA2uiText = createComponentImplementation(TextApi, ({ props }) => {
  const variant = props.variant ?? 'body';
  const text = typeof props.text === 'string' ? props.text : String(props.text ?? '');
  const html = useMarkdownHtml(text, !PLAIN.has(variant));
  const shared = {
    level: LEVEL[variant] ?? 'body',
    style: weightStyle(props.weight),
    ...accessibilityAttributes(props.accessibility)
  };

  if (html === null) {
    return <MPTypography {...shared}>{text}</MPTypography>;
  }

  return <MPTypography {...shared} dangerouslySetInnerHTML={{ __html: html }} />;
});
