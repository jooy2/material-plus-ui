import { MPBox, MPContainer, MPGrid, MPGridItem, MPTypography } from 'material-plus-ui';

/**
 * The three layout components, doing the three separate jobs they exist to do.
 *
 * The container holds the page off the edge of the window and caps the measure.
 * The grid divides what is inside it into columns. The boxes are the surfaces —
 * neither of the other two paints anything, which is what lets them wrap
 * somebody else's content without changing how it looks.
 */
export default function ContainerPage() {
  return (
    <MPContainer maxWidth="md" render={<main />}>
      <MPTypography level="h5" gutter>
        Quarterly summary
      </MPTypography>

      <MPGrid columns={{ compact: 4, medium: 12 }} spacing={{ compact: 4, medium: 6 }}>
        <MPGridItem span={{ compact: 4, medium: 8 }}>
          <MPBox style={{ height: '100%' }}>
            <MPTypography level="h6" gutter>
              Revenue
            </MPTypography>
            <MPTypography level="body">Eight of twelve columns from 600dp up.</MPTypography>
          </MPBox>
        </MPGridItem>

        <MPGridItem span={{ compact: 4, medium: 4 }}>
          <MPBox variant="filled" style={{ height: '100%' }}>
            <MPTypography level="h6" gutter>
              Churn
            </MPTypography>
            <MPTypography level="caption">The remaining four.</MPTypography>
          </MPBox>
        </MPGridItem>
      </MPGrid>
    </MPContainer>
  );
}
