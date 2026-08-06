import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MPIcon, ICONS } from 'material-plus';

const SIZES = [14, 16, 20, 24, 32];

export default function IconSizes() {
  return (
    <Stack direction="row" spacing={4} useFlexGap sx={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {SIZES.map((size) => (
        <Stack key={size} spacing={1} sx={{ alignItems: 'center' }}>
          <MPIcon icon={ICONS.info} size={size} label={`Info, ${size}px`} />
          <Typography variant="caption" color="text.secondary">
            {size}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
