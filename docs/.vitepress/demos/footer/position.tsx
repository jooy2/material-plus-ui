import { MPButton, MPFooter, MPPageLayout, MPTypography } from 'material-plus-ui';

/**
 * `static` is what a footer is — the end of the document, reached by scrolling
 * to it — and it is the default here against [MPHeader]'s `sticky`.
 *
 * `sticky` is for the bar that has to stay in reach: a form's save row, a cookie
 * notice. Inside an [MPPageLayout] a `fixed` one has its height reserved, so the
 * last paragraph never ends up underneath it.
 */
export default function FooterPosition() {
  return (
    <div style={{ width: '100%', maxWidth: 380 }}>
      <MPPageLayout
        height={220}
        scroll="content"
        className="rounded-mp-md border-mp-outline-variant overflow-hidden border"
        footer={
          <MPFooter position="sticky" size="sm" variant="tonal">
            <div className="flex items-center justify-between gap-3">
              <MPTypography level="caption">3 unsaved changes</MPTypography>
              <MPButton size="xs">Save</MPButton>
            </div>
          </MPFooter>
        }
      >
        <div className="grid gap-3 p-4">
          {['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((word) => (
            <MPTypography key={word} level="body">
              {word}. The save row stays in reach while this scrolls.
            </MPTypography>
          ))}
        </div>
      </MPPageLayout>
    </div>
  );
}
