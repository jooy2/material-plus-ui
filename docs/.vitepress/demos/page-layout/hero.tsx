import { MPPageLayout } from 'material-plus-ui';

/**
 * The skeleton, drawn as a skeleton.
 *
 * The bars and the column here are plain `<header>`, `<aside>` and `<footer>`
 * elements with a surface class on them, which is what the layout actually
 * arranges: it draws nothing itself, and every landmark on the page comes from
 * whatever was handed to a slot. [MPHeader], [MPFooter] and [MPSidebar] are the
 * ones you would reach for, and each of their pages shows the assembled version.
 */
export default function PageLayoutHero() {
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <MPPageLayout
        height={260}
        scroll="content"
        className="rounded-mp-md border-mp-outline-variant overflow-hidden border"
        header={
          <header className="bg-mp-surface-container text-mp-on-surface text-mp-title-small flex h-12 shrink-0 items-center px-4">
            Header
          </header>
        }
        sidebar={
          <aside className="bg-mp-surface-container-low text-mp-on-surface-variant border-mp-outline-variant text-mp-body-small w-32 shrink-0 border-e px-4 py-3">
            Sidebar
          </aside>
        }
        footer={
          <footer className="bg-mp-surface-container text-mp-on-surface-variant border-mp-outline-variant text-mp-body-small flex h-10 shrink-0 items-center border-t px-4">
            Footer
          </footer>
        }
      >
        <div className="text-mp-body-medium text-mp-on-surface-variant px-4 py-3">
          <p>
            The <code>&lt;main&gt;</code>. Everything else on this page is a landmark of its own,
            which is the whole reason the layout is a component rather than four divs.
          </p>
        </div>
      </MPPageLayout>
    </div>
  );
}
