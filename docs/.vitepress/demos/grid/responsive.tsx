import { MPBox, MPGrid, MPGridItem, MPTypography } from 'material-plus-ui';

/**
 * Material's own layout grid: four columns in a compact window, twelve from
 * medium up, with the gutter widening from 16dp to 24dp at the same moment.
 *
 * Narrow the window — or drag the preview's edge — and the cards go from one a
 * row to two and then to four. Nothing re-renders while that happens: the column
 * count is an inherited custom property, so the media query changes it and the
 * browser reflows on its own.
 */
const ARTICLES = [
  { title: 'Window size classes', meta: 'compact · medium · expanded' },
  { title: 'Columns', meta: '4 · 12 · 12' },
  { title: 'Gutters', meta: '16dp · 24dp · 24dp' },
  { title: 'Margins', meta: '16dp · 24dp · 24dp' }
];

export default function GridResponsive() {
  return (
    <MPGrid
      columns={{ compact: 4, medium: 12 }}
      spacing={{ compact: 4, medium: 6 }}
      style={{ width: '100%' }}
    >
      {ARTICLES.map((article) => (
        <MPGridItem key={article.title} span={{ compact: 4, medium: 6, expanded: 3 }}>
          <MPBox variant="elevated" style={{ height: '100%' }}>
            <MPTypography level="h6" gutter>
              {article.title}
            </MPTypography>
            <MPTypography level="caption">{article.meta}</MPTypography>
          </MPBox>
        </MPGridItem>
      ))}
    </MPGrid>
  );
}
