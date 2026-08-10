import { MPContextMenu, MPMenuItem, MPMenuSeparator, MPTypography } from 'material-plus-ui';

/**
 * The same rows, opened by a right-click or a long press. It takes the rows as
 * `content` and the area as `children` — here the trigger is not one element
 * handed over, it is a region of the page.
 */
export default function MenuContext() {
  return (
    <MPContextMenu
      content={
        <>
          <MPMenuItem shortcut="⌘C">Copy</MPMenuItem>
          <MPMenuItem shortcut="⌘V">Paste</MPMenuItem>
          <MPMenuSeparator />
          <MPMenuItem color="error">Delete</MPMenuItem>
        </>
      }
    >
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          width: '100%',
          maxWidth: 340,
          height: 120,
          borderRadius: 12,
          border: '1px dashed var(--_mp-color-outline)'
        }}
      >
        <MPTypography level="body">Right-click, or press and hold</MPTypography>
      </div>
    </MPContextMenu>
  );
}
