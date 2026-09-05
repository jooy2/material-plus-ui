import * as React from 'react';
import {
  ICONS,
  MPAppLogo,
  MPButton,
  MPFlex,
  MPIcon,
  MPIconButton,
  MPTextField,
  MPToolbar,
  MPTypography
} from 'material-plus-ui';

/** The same three slots as a page header and as an editor's action row. */
export default function ToolbarHero() {
  const [filter, setFilter] = React.useState('');

  return (
    <MPFlex direction="column" gap={24} style={{ width: '100%' }}>
      <MPToolbar
        render={<header />}
        variant="filled"
        divider
        start={<MPAppLogo name="Voltage" src="/samples/marks/magnet-lightning.webp" size="sm" />}
        end={
          <MPFlex gap={4} align="center">
            <MPIconButton
              variant="text"
              size="sm"
              label="Search"
              icon={<MPIcon icon={ICONS.search} />}
            />
            <MPButton variant="filled" size="sm">
              Deploy
            </MPButton>
          </MPFlex>
        }
      >
        <MPTypography level="h6">Voltage</MPTypography>
      </MPToolbar>

      <MPToolbar
        size="sm"
        density={-1}
        end={
          <MPButton variant="text" size="sm">
            Clear
          </MPButton>
        }
      >
        <MPTextField
          size="sm"
          placeholder="Filter rows"
          value={filter}
          onChange={setFilter}
          fullWidth
        />
      </MPToolbar>
    </MPFlex>
  );
}
