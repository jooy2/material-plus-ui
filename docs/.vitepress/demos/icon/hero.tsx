import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MPIcon, ICONS } from 'material-plus';

export default function IconHero() {
  return (
    <Stack direction="row" spacing={3} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <MPIcon icon={ICONS.success} size={28} color="#2e7d32" label="Deployed" />
      <Typography variant="body2">
        Deploys finish in <MPIcon icon={ICONS.check} size="1em" /> under a minute.
      </Typography>
    </Stack>
  );
}
