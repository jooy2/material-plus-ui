/**
 * `Text` — the protocol's only way to say words, drawn as `MPTypography`.
 *
 * The two variants map onto the type scale: `caption` is the small print, and
 * `body` is everything else.
 *
 * ## Headings are Markdown
 *
 * v1.0 took the `h1`–`h5` variants out of the schema. An agent writes a heading
 * as Markdown instead, `## Sign in`, which is how every example the specification
 * ships does it. A text that is one heading line and nothing else is drawn as
 * that heading of the type scale, so an agent asking for one gets MD3's
 * `headline-large` rather than a browser's `<h1>` or the characters `##` — with
 * or without a renderer, and before one has answered. Only the words go in, as
 * text, so this reads no Markdown beyond the line's leading `#` signs and trusts
 * nothing.
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
import { createComponentImplementation, useMarkdownRenderer } from '@a2ui/react';
import { TextApi } from '@a2ui/web_core/v1_0';
import { MPTypography, type MPTypographyLevel } from '../../components/typography/MPTypography';
import { accessibilityAttributes, weightStyle } from '../internal/common';

/** The protocol's two variants, in this library's words for the same things. */
const LEVEL: Record<string, MPTypographyLevel> = {
  caption: 'caption',
  body: 'body'
};

/** A Markdown heading's depth, as the type scale's heading of that rank. */
const HEADING_LEVELS: MPTypographyLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

const isBlank = (character: string | undefined) => character === ' ' || character === '\t';

/**
 * The heading a text is, or `null` for a text that is not one heading line.
 *
 * One to six `#`, a space, the words, and an optional closing run of `#` after
 * a space, as CommonMark writes an ATX heading. `#tag` is not a heading, and a
 * text with a second line is prose.
 *
 * Read a character at a time rather than with one pattern, because the text is
 * an agent's: a pattern that tries every split between the words and a closing
 * run backtracks over a long line of spaces in time that grows with its square.
 */
const headingOf = (text: string): { level: MPTypographyLevel; words: string } | null => {
  const line = text.trim();
  let depth = 0;

  while (line[depth] === '#') {
    depth += 1;
  }

  if (depth === 0 || depth > HEADING_LEVELS.length || !isBlank(line[depth])) {
    return null;
  }

  if (line.includes('\n') || line.includes('\r')) {
    return null;
  }

  let words = line.slice(depth).trim();
  let end = words.length;

  while (words[end - 1] === '#') {
    end -= 1;
  }

  if (end < words.length && isBlank(words[end - 1])) {
    words = words.slice(0, end).trim();
  }

  return words === '' ? null : { level: HEADING_LEVELS[depth - 1], words };
};

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
  /*
   * A caption is a note about something rather than prose, so Markdown is never
   * applied to it, and a heading is a line the type scale already draws. Running
   * a block parser over either would put a paragraph or a browser heading inside
   * an `MPTypography` that is already one.
   */
  const heading = variant === 'caption' ? null : headingOf(text);
  const html = useMarkdownHtml(text, variant !== 'caption' && heading === null);
  const shared = {
    style: weightStyle(props.weight),
    ...accessibilityAttributes(props.accessibility)
  };

  if (heading) {
    return (
      <MPTypography level={heading.level} {...shared}>
        {heading.words}
      </MPTypography>
    );
  }

  const level = LEVEL[variant] ?? 'body';

  if (html === null) {
    return (
      <MPTypography level={level} {...shared}>
        {text}
      </MPTypography>
    );
  }

  return <MPTypography level={level} {...shared} dangerouslySetInnerHTML={{ __html: html }} />;
});
