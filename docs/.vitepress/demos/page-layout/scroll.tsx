import { MPPageLayout } from 'material-plus-ui';

const PARAGRAPHS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

/**
 * What scrolls, and it is the difference between a document and a workspace.
 *
 * With `scroll="content"` the layout is exactly the height it was given and only
 * the region between the bars moves — so the footer is still on screen at the
 * bottom of a list that is not finished. With `scroll="page"` the whole thing
 * grows and whatever is around it does the scrolling, which on a real page is
 * the window.
 */
export default function PageLayoutScroll() {
  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <MPPageLayout
        height={220}
        scroll="content"
        className="rounded-mp-md border-mp-outline-variant overflow-hidden border"
        header={
          <header className="bg-mp-surface-container text-mp-on-surface text-mp-title-small flex h-11 shrink-0 items-center px-4">
            Held in place
          </header>
        }
        footer={
          <footer className="bg-mp-surface-container text-mp-on-surface-variant border-mp-outline-variant text-mp-body-small flex h-9 shrink-0 items-center border-t px-4">
            And so is this
          </footer>
        }
      >
        <ul className="text-mp-body-medium text-mp-on-surface-variant grid gap-3 px-4 py-3">
          {PARAGRAPHS.map((word) => (
            <li key={word}>{word}. Only this column moves.</li>
          ))}
        </ul>
      </MPPageLayout>
    </div>
  );
}
