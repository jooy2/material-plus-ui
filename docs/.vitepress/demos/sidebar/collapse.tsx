import {
  MPHeader,
  MPList,
  MPListItem,
  MPPageLayout,
  MPSidebar,
  MPSidebarTrigger
} from 'material-plus-ui';

/**
 * The same sidebar, below the window size class it collapses at.
 *
 * `collapseBelow="extra-large"` is set so the preview is always on the narrow
 * side of the line — in a real page the default is `expanded`, which is MD3's
 * own answer: a standard navigation drawer is what an expanded window gets, and
 * a compact one gets the same destinations behind a modal drawer.
 *
 * Nothing here is conditional. The trigger hides itself from the breakpoint up
 * with a media query, and the sidebar is one component in both shapes, so the
 * children exist once either way.
 */
export default function SidebarCollapse() {
  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <MPPageLayout
        height={220}
        scroll="content"
        collapseBelow="extra-large"
        className="rounded-mp-md border-mp-outline-variant overflow-hidden border"
        header={
          <MPHeader
            size="xs"
            brand={
              <>
                <MPSidebarTrigger size="xs" />
                Acme
              </>
            }
          />
        }
        sidebar={
          <MPSidebar title="Sections" size="sm">
            <MPList variant="text" size="sm">
              <MPListItem onClick={() => {}}>Overview</MPListItem>
              <MPListItem onClick={() => {}}>Schedule</MPListItem>
              <MPListItem onClick={() => {}}>Reports</MPListItem>
            </MPList>
          </MPSidebar>
        }
      >
        <div className="text-mp-body-medium text-mp-on-surface-variant p-4">
          Press the hamburger. The column is a drawer at this width, and the trigger exists exactly
          while the column does not.
        </div>
      </MPPageLayout>
    </div>
  );
}
