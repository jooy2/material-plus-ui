import { useState } from 'react';
import { MPPagination, MPSlider, MPTypography } from 'material-plus-ui';

/**
 * What `siblingCount` and `boundaryCount` actually control.
 *
 * `siblingCount` is how many pages stay either side of the current one;
 * `boundaryCount` is how many stay pinned at each end whatever page you are on.
 * Drag either and step through the pages: what changes is which slots are
 * numbers and which are ellipses, never how many slots there are.
 */
export default function PaginationWindow() {
  const [page, setPage] = useState(10);
  const [siblings, setSiblings] = useState<number | number[]>(1);
  const [boundaries, setBoundaries] = useState<number | number[]>(1);

  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 520 }}>
      <MPSlider
        label="siblingCount"
        showValue
        min={0}
        max={3}
        step={1}
        value={siblings}
        onValueChange={setSiblings}
      />
      <MPSlider
        label="boundaryCount"
        showValue
        min={0}
        max={3}
        step={1}
        value={boundaries}
        onValueChange={setBoundaries}
      />

      <MPPagination
        count={20}
        page={page}
        onPageChange={setPage}
        siblingCount={siblings as number}
        boundaryCount={boundaries as number}
        size="xs"
      />

      <MPTypography level="caption">
        A gap of exactly one page is filled with that page — an ellipsis is wider than the number it
        would have replaced.
      </MPTypography>
    </div>
  );
}
