import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MPIcon } from 'material-plus-ui';
import type { MPIconGlyphProps } from 'material-plus-ui';

/** A drawing of your own, as a component: it is handed the size and the colour. */
function SpiralIcon({ size, color, strokeWidth }: MPIconGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <path
        d="M12 3a9 9 0 1 1-9 9 7 7 0 0 1 7-7 5 5 0 0 1 5 5 3 3 0 0 1-3 3"
        stroke={color}
        strokeWidth={strokeWidth ?? 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function IconCustom() {
  return (
    <Stack direction="row" spacing={4} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <Stack spacing={1} sx={{ alignItems: 'center' }}>
        <MPIcon icon={SpiralIcon} size={28} label="Spiral" />
        <Typography variant="caption" color="text.secondary">
          component
        </Typography>
      </Stack>

      <Stack spacing={1} sx={{ alignItems: 'center' }}>
        {/* Already drawn, so nothing is passed into it — the box scales it. */}
        <MPIcon
          icon={
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M9 12h6M12 9v6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          }
          size={28}
          label="Add"
        />
        <Typography variant="caption" color="text.secondary">
          element
        </Typography>
      </Stack>
    </Stack>
  );
}
