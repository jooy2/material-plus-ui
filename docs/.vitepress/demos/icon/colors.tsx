import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { MPIcon, ICONS } from 'material-plus-ui';

export default function IconColors() {
  const theme = useTheme();

  return (
    <Stack spacing={3}>
      {/* A colour named outright. Any CSS colour works, and reading it off the
          theme is what keeps it right in both modes. */}
      <Stack direction="row" spacing={3} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <MPIcon icon={ICONS.info} size={24} color={theme.palette.info.main} label="Info" />
        <MPIcon icon={ICONS.success} size={24} color={theme.palette.success.main} label="Done" />
        <MPIcon icon={ICONS.warning} size={24} color={theme.palette.warning.main} label="Careful" />
        <MPIcon icon={ICONS.error} size={24} color={theme.palette.error.main} label="Failed" />
      </Stack>

      {/* No colour at all. The icon takes whatever the surrounding text is,
          which is why it comes out right inside an Alert without being told. */}
      <Alert severity="warning" icon={<MPIcon icon={ICONS.warning} size={22} />}>
        <Typography variant="body2">This certificate expires in three days.</Typography>
      </Alert>
    </Stack>
  );
}
