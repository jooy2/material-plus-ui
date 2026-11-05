import { useState } from 'react';
import {
  ICONS,
  MPAvatar,
  MPButton,
  MPCard,
  MPCommandPalette,
  MPContextMenu,
  MPDialog,
  MPDialogClose,
  MPDrawer,
  MPDrawerClose,
  MPHoverCard,
  MPIcon,
  MPMenu,
  MPMenubar,
  MPMenubarMenu,
  MPMenuCheckboxItem,
  MPMenuItem,
  MPMenuRadioGroup,
  MPMenuRadioItem,
  MPMenuSeparator,
  MPMenuSubmenu,
  MPOverlay,
  MPPopconfirm,
  MPPopover,
  MPProgressCircular,
  MPSelect,
  MPShortcut,
  MPSwitch,
  MPTextField,
  MPTooltip,
  MPTour,
  MPTypography,
  useMPConfirm,
  useMPSnackbar,
  type MPCommand,
  type MPSelectValue,
  type MPTourStep
} from 'material-plus-ui';

const commands: MPCommand[] = [
  { value: 'new', label: 'New project', group: 'File', shortcut: 'Mod+N' },
  { value: 'invite', label: 'Invite a colleague', group: 'Team', keywords: ['share'] },
  { value: 'settings', label: 'Open settings', group: 'App' }
];

const steps: MPTourStep[] = [
  { title: 'Overlays', content: 'Everything on this screen floats over the window.' },
  {
    target: '#overlay-buttons',
    title: 'One button each',
    content: 'Each opens a different kind of surface.',
    side: 'bottom',
    align: 'start'
  },
  {
    target: '#overlay-context',
    title: 'Right-click',
    content: 'This area opens a menu of its own.',
    side: 'top'
  }
];

const sizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
];

/** One control for each thing that floats over a window. */
export function Overlays() {
  const [palette, setPalette] = useState(false);
  const [tour, setTour] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [name, setName] = useState('Aurora');
  const [rulers, setRulers] = useState(true);
  const [zoom, setZoom] = useState<string | number>('fit');
  const [size, setSize] = useState<MPSelectValue | null>('medium');
  const snackbar = useMPSnackbar();
  const confirm = useMPConfirm();

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-mp-surface-container rounded-mp-sm self-start px-2 py-1">
        <MPMenubar size="sm" aria-label="Application">
          <MPMenubarMenu label="File">
            <MPMenuItem shortcut={<MPShortcut size="xs" variant="text" keys="Mod+N" />}>
              New
            </MPMenuItem>
            <MPMenuItem shortcut={<MPShortcut size="xs" variant="text" keys="Mod+O" />}>
              Open…
            </MPMenuItem>
          </MPMenubarMenu>
          <MPMenubarMenu label="View">
            <MPMenuCheckboxItem checked={rulers} onCheckedChange={setRulers}>
              Rulers
            </MPMenuCheckboxItem>
            <MPMenuSeparator />
            <MPMenuRadioGroup value={zoom} onValueChange={setZoom}>
              <MPMenuRadioItem value="fit">Fit to window</MPMenuRadioItem>
              <MPMenuRadioItem value="actual">Actual size</MPMenuRadioItem>
            </MPMenuRadioGroup>
          </MPMenubarMenu>
        </MPMenubar>
      </div>

      <div id="overlay-buttons" className="flex flex-wrap items-center gap-3">
        <MPDialog
          trigger={<MPButton variant="tonal">Dialog</MPButton>}
          title="Rename project"
          description="The address changes with it."
          actions={
            <>
              <MPDialogClose render={<MPButton variant="text">Cancel</MPButton>} />
              <MPDialogClose render={<MPButton>Rename</MPButton>} />
            </>
          }
        >
          <MPTextField fullWidth label="Name" value={name} onChange={setName} />
        </MPDialog>

        <MPDrawer
          side="right"
          trigger={<MPButton variant="tonal">Drawer</MPButton>}
          title="Filters"
          description="Show orders that are:"
          actions={<MPDrawerClose render={<MPButton>Done</MPButton>} />}
        >
          <div className="flex flex-col gap-3">
            <MPSwitch label="Paid" defaultChecked />
            <MPSwitch label="Open" defaultChecked />
            <MPSwitch label="Overdue" />
          </div>
        </MPDrawer>

        <MPPopover
          trigger={<MPButton variant="tonal">Popover</MPButton>}
          title="Effective rate"
          description="Updated hourly"
          arrow
        >
          The base rate plus whatever your plan adds to it.
        </MPPopover>

        <MPMenu trigger={<MPButton variant="tonal">Menu</MPButton>}>
          <MPMenuItem
            startIcon={<MPIcon icon={ICONS.copy} size={20} />}
            shortcut={<MPShortcut size="xs" variant="text" keys="Mod+C" />}
          >
            Copy
          </MPMenuItem>
          <MPMenuItem startIcon={<MPIcon icon={ICONS.link} size={20} />}>Copy link</MPMenuItem>
          <MPMenuSubmenu label="Share">
            <MPMenuItem>Email</MPMenuItem>
            <MPMenuItem>Message</MPMenuItem>
          </MPMenuSubmenu>
          <MPMenuSeparator />
          <MPMenuItem color="error" startIcon={<MPIcon icon={ICONS.close} size={20} />}>
            Delete
          </MPMenuItem>
        </MPMenu>

        <MPTooltip content="Saved two minutes ago">
          <MPButton variant="tonal">Tooltip</MPButton>
        </MPTooltip>

        <MPHoverCard
          trigger={<MPButton variant="tonal">Hover card</MPButton>}
          title="Farah Wells"
          description="Platform team"
        >
          <div className="flex items-center gap-3">
            <MPAvatar src="/samples/people/farah-wells.webp" name="Farah Wells" />
            <MPTypography level="caption">Owns the deployment pipeline.</MPTypography>
          </div>
        </MPHoverCard>

        <MPPopconfirm
          trigger={<MPButton variant="tonal">Popconfirm</MPButton>}
          title="Archive this thread?"
          description="It moves out of the inbox."
          confirmLabel="Archive"
          onConfirm={() => snackbar.add({ message: 'Archived' })}
        />

        <MPButton
          variant="tonal"
          onClick={() => {
            const id = snackbar.add({
              message: 'Your changes are live.',
              actionLabel: 'Undo',
              // The action leaves the snackbar up; one that is done with it closes it.
              onAction: () => {
                snackbar.close(id);
                snackbar.add({ message: 'Undone' });
              }
            });
          }}
        >
          Snackbar
        </MPButton>

        <MPButton
          variant="tonal"
          onClick={async () => {
            const ok = await confirm.confirm({
              title: 'Delete this project?',
              description: 'It cannot be undone.',
              confirmLabel: 'Delete',
              color: 'error'
            });

            snackbar.add({ message: ok ? 'Deleted' : 'Kept' });
          }}
        >
          Confirm
        </MPButton>

        <MPButton variant="tonal" onClick={() => setPalette(true)}>
          Command palette
        </MPButton>

        <MPButton variant="tonal" onClick={() => setTour(true)}>
          Tour
        </MPButton>

        <MPButton
          variant="tonal"
          onClick={() => {
            setWaiting(true);
            window.setTimeout(() => setWaiting(false), 1500);
          }}
        >
          Overlay
        </MPButton>
      </div>

      <MPCard title="Inside a popup" className="max-w-md">
        <MPSelect label="Size" items={sizes} value={size} onValueChange={setSize} />
      </MPCard>

      <MPContextMenu
        content={
          <>
            <MPMenuItem>Rename</MPMenuItem>
            <MPMenuItem>Duplicate</MPMenuItem>
            <MPMenuSeparator />
            <MPMenuItem color="error">Delete</MPMenuItem>
          </>
        }
      >
        <div
          id="overlay-context"
          className="border-mp-outline text-mp-on-surface-variant grid h-40 place-items-center rounded-2xl border border-dashed"
        >
          Right-click here
        </div>
      </MPContextMenu>

      <MPCommandPalette
        items={commands}
        open={palette}
        onOpenChange={setPalette}
        onSelect={(item) => snackbar.add({ message: `Ran ${item.label}` })}
      />

      <MPTour steps={steps} open={tour} onOpenChange={setTour} />

      <MPOverlay open={waiting} onOpenChange={setWaiting} label="Publishing">
        <div className="grid justify-items-center gap-4">
          <MPProgressCircular size="lg" />
          <MPTypography>Publishing your changes…</MPTypography>
        </div>
      </MPOverlay>
    </div>
  );
}
