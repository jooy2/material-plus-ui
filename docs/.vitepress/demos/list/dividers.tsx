import { MPList, MPListItem } from 'material-plus-ui';

export default function ListDividers() {
  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 380 }}>
      <MPList size="sm">
        <MPListItem onClick={() => {}}>Tiles, with space between them</MPListItem>
        <MPListItem onClick={() => {}}>Rounded, and inset from the edge</MPListItem>
      </MPList>

      <MPList size="sm" dividers>
        <MPListItem onClick={() => {}}>Ruled lines, edge to edge</MPListItem>
        <MPListItem onClick={() => {}}>Square, because a line is not a tile</MPListItem>
      </MPList>
    </div>
  );
}
