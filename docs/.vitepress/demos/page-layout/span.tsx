import { MPPageLayout } from 'material-plus-ui';

/** One shell, so the two arrangements differ only in where the bar starts. */
function Shell({ span, label }: { span: 'full' | 'content'; label: string }) {
  return (
    <MPPageLayout
      height={180}
      scroll="content"
      headerSpan={span}
      className="rounded-mp-md border-mp-outline-variant overflow-hidden border"
      header={
        <header className="bg-mp-primary text-mp-on-primary text-mp-label-large flex h-9 shrink-0 items-center px-3">
          {label}
        </header>
      }
      sidebar={
        <aside className="bg-mp-surface-container text-mp-on-surface-variant text-mp-body-small w-24 shrink-0 px-3 py-2">
          Sidebar
        </aside>
      }
    >
      <div className="text-mp-body-small text-mp-on-surface-variant px-3 py-2">Content</div>
    </MPPageLayout>
  );
}

/**
 * Which of the header and the sidebars takes the top corner.
 *
 * `full` is a website: one bar across the whole width, and the page beneath it.
 * `content` is an application, and MD3's own drawing of a standard navigation
 * drawer — the drawer is the outermost thing on the screen and the app bar
 * belongs to the pane it is over.
 */
export default function PageLayoutSpan() {
  return (
    <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 420 }}>
      <Shell span="full" label='headerSpan="full"' />
      <Shell span="content" label='headerSpan="content"' />
    </div>
  );
}
