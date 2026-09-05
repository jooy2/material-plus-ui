import { MPAppLogo, MPFlex, MPTypography } from 'material-plus-ui';

/** A mark drawn as a bare glyph, which is what `shape="app"` is for. */
function Bolt() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
    </svg>
  );
}

export default function AppLogoHero() {
  return (
    <MPFlex direction="column" gap={24}>
      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">Nothing but a name</MPTypography>
        <MPFlex gap={24} align="center" wrap>
          <MPAppLogo name="Voltage" />
          <MPAppLogo name="Voltage" shape="app" />
          <MPAppLogo name="Voltage" shape="circle" variant="tonal" color="tertiary" />
        </MPFlex>
      </MPFlex>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">A glyph, framed three ways</MPTypography>
        <MPFlex gap={24} align="center" wrap>
          <MPAppLogo name="Voltage" shape="app" href="#" showName>
            <Bolt />
          </MPAppLogo>
          <MPAppLogo name="Voltage" shape="circle" variant="tonal" color="secondary">
            <Bolt />
          </MPAppLogo>
          <MPAppLogo name="Voltage" shape="app" variant="outlined" size="sm">
            <Bolt />
          </MPAppLogo>
        </MPFlex>
      </MPFlex>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">A file, which brings its own colour</MPTypography>
        <MPFlex gap={24} align="center" wrap>
          <MPAppLogo name="Voltage" src="/samples/marks/magnet-lightning.webp" href="#" showName />
          <MPAppLogo name="Truenorth" src="/samples/marks/compass-navigation.webp" />
          <MPAppLogo
            name="Lanternpeak"
            src="/samples/marks/lantern-mountain.webp"
            shape="circle"
            variant="tonal"
            color="tertiary"
          />
          <MPAppLogo name="Solarfield" src="/samples/marks/solar-panel-sun.webp" size="sm" />
        </MPFlex>
      </MPFlex>
    </MPFlex>
  );
}
