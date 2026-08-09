import { MPButton, MPTooltip, MPTooltipProvider } from 'material-plus-ui';
import type { MPSide } from 'material-plus-ui';

const SIDES: MPSide[] = ['top', 'right', 'bottom', 'left'];

export default function TooltipSides() {
  return (
    <MPTooltipProvider>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {SIDES.map((side) => (
          <MPTooltip key={side} content={`Opens on the ${side}`} side={side}>
            <MPButton variant="outlined" size="sm">
              {side}
            </MPButton>
          </MPTooltip>
        ))}
      </div>
    </MPTooltipProvider>
  );
}
