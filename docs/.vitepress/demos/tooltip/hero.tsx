import { ICONS, MPButton, MPIcon, MPTooltip, MPTooltipProvider } from 'material-plus-ui';

export default function TooltipHero() {
  return (
    <MPTooltipProvider>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <MPTooltip content="Copy to clipboard">
          <MPButton variant="tonal" size="sm" aria-label="Copy">
            <MPIcon icon={ICONS.copy} size={20} />
          </MPButton>
        </MPTooltip>

        <MPTooltip content="Search everything" side="bottom">
          <MPButton variant="tonal" size="sm" aria-label="Search">
            <MPIcon icon={ICONS.search} size={20} />
          </MPButton>
        </MPTooltip>

        <MPTooltip content="This cannot be undone" color="error" side="right">
          <MPButton variant="outlined" size="sm" color="error">
            Delete
          </MPButton>
        </MPTooltip>
      </div>
    </MPTooltipProvider>
  );
}
