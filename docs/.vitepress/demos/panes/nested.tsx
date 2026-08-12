import { MPPane, MPPanes } from 'material-plus-ui';

/**
 * A split inside a split, which is how an editor layout is built.
 *
 * The inner `MPPanes` is simply what one pane holds. It measures itself the same
 * way, so its own `defaultSize` is a share of whatever the outer split currently
 * gives it — resizing the outer handle does not need the inner one to be told.
 *
 * A pane draws no surface of its own on purpose: the moment it did, it would
 * stop being usable as the thing a table, a card or an editor is put inside.
 */
function Region({ title }: { title: string }) {
  return (
    <div className="text-mp-on-surface-variant text-mp-body-small h-full p-3">
      <strong className="text-mp-on-surface">{title}</strong>
    </div>
  );
}

export default function PanesNested() {
  return (
    <div
      className="border-mp-outline-variant rounded-mp-md overflow-hidden border"
      style={{ height: 240, width: '100%' }}
    >
      <MPPanes>
        <MPPane defaultSize="30%" minSize="15%">
          <Region title="Files" />
        </MPPane>
        <MPPane>
          <MPPanes orientation="vertical" color="tertiary">
            <MPPane defaultSize="65%" minSize="20%">
              <Region title="Editor" />
            </MPPane>
            <MPPane minSize="20%">
              <Region title="Terminal" />
            </MPPane>
          </MPPanes>
        </MPPane>
      </MPPanes>
    </div>
  );
}
