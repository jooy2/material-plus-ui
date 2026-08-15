import { useState } from 'react';
import { MPPagination, MPTypography } from 'material-plus-ui';

/**
 * Twenty pages, ten of them showing.
 *
 * Step through it: the number of slots never changes, the window slides toward
 * whichever end it is near, and the cell under the pointer stays where it is.
 */
export default function PaginationHero() {
  const [page, setPage] = useState(1);

  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <MPPagination count={20} page={page} onPageChange={setPage} size="sm" showEdges />

      <MPTypography level="caption">Showing results for page {page}.</MPTypography>
    </div>
  );
}
