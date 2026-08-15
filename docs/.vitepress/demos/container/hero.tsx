import { MPContainer, MPTypography } from 'material-plus-ui';

/**
 * The page margin, said once at the top of a page.
 *
 * The dashed rule is the preview's, not the component's — a container paints
 * nothing at all, which is the whole reason it can be the outermost element on
 * a page.
 */
export default function ContainerHero() {
  return (
    <div style={{ width: '100%', outline: '1px dashed var(--mp-sys-color-outline-variant)' }}>
      <MPContainer maxWidth="sm">
        <MPTypography level="h5" gutter>
          Held off the edge
        </MPTypography>
        <MPTypography level="body">
          16dp of margin at <code>md</code>, which is Material&rsquo;s own compact margin, and a
          measure that stops the line getting wider than a medium window.
        </MPTypography>
      </MPContainer>
    </div>
  );
}
