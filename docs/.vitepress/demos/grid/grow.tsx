import { MPBox, MPGrid, MPGridItem, MPTypography } from 'material-plus-ui';

/**
 * A thumbnail and the words beside it, which is the layout `span="grow"` is
 * for.
 *
 * The picture is three columns because that is what it is; the body is
 * everything left over, and stays right when the picture's column count
 * changes. Written as two numbers — `span={3}` and `span={9}` — it would be
 * right until somebody edited one of them.
 */
const ARCHIVE = [
  { title: 'Sonic the Hedgehog', meta: '1998 · Flash · 2.1 MB' },
  { title: 'A Duck Has an Adventure', meta: '2012 · Flash · 4.8 MB' }
];

export default function GridGrow() {
  return (
    <MPGrid spacing={4} style={{ width: '100%' }}>
      {ARCHIVE.map((entry) => (
        <MPGridItem key={entry.title} span={12}>
          <MPBox variant="outlined">
            <MPGrid spacing={4} alignItems="center">
              <MPGridItem span={3}>
                <MPBox
                  variant="tonal"
                  style={{ aspectRatio: '4 / 3', display: 'grid', placeItems: 'center' }}
                >
                  <MPTypography level="caption">Thumbnail</MPTypography>
                </MPBox>
              </MPGridItem>

              <MPGridItem span="grow">
                <MPTypography level="h6" gutter>
                  {entry.title}
                </MPTypography>
                <MPTypography level="caption">{entry.meta}</MPTypography>
              </MPGridItem>
            </MPGrid>
          </MPBox>
        </MPGridItem>
      ))}
    </MPGrid>
  );
}
