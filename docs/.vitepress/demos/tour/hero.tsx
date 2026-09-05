import * as React from 'react';
import { MPBox, MPButton, MPFlex, MPTextField, MPTour, MPTypography } from 'material-plus-ui';
import type { MPTourStep } from 'material-plus-ui';

/**
 * The ids are prefixed, because a tour finds its targets with
 * `document.querySelector` over the whole page — and this one is a demo on a
 * documentation page that has a search field of its own.
 */
const STEPS: MPTourStep[] = [
  {
    title: 'Welcome',
    content: 'Three things worth knowing about this page. It takes about ten seconds.'
  },
  {
    target: '#mp-tour-demo-search',
    title: 'Search',
    content: 'Everything is findable from here — type a name, a tag or a date.',
    side: 'bottom',
    align: 'start'
  },
  {
    target: '#mp-tour-demo-save',
    title: 'Save',
    content: 'Changes are kept as you go. This is for the moment you want a version back.',
    side: 'bottom',
    align: 'end'
  },
  {
    target: '#mp-tour-demo-panel',
    title: 'Your work',
    content:
      'Anything you open lands here. Try the search — the page still works while this is up.',
    side: 'top',
    padding: 2
  }
];

/** A small page for the tour to stand over. */
export default function TourHero() {
  const [running, setRunning] = React.useState(false);
  const [query, setQuery] = React.useState('');

  return (
    <MPFlex direction="column" gap={16}>
      <MPBox variant="outlined" padded>
        <MPFlex direction="column" gap={12}>
          <MPFlex gap={8} align="center" wrap>
            <MPTextField
              id="mp-tour-demo-search"
              label="Search"
              size="sm"
              value={query}
              onChange={setQuery}
              style={{ flex: 1, minWidth: 160 }}
            />
            <MPButton id="mp-tour-demo-save" size="sm" variant="tonal">
              Save a version
            </MPButton>
          </MPFlex>

          <MPBox id="mp-tour-demo-panel" variant="tonal" padded>
            <MPTypography level="caption">
              {query === '' ? 'Nothing open yet.' : `Looking for “${query}”…`}
            </MPTypography>
          </MPBox>
        </MPFlex>
      </MPBox>

      <MPFlex gap={8} align="center">
        <MPButton onClick={() => setRunning(true)} disabled={running}>
          Start the tour
        </MPButton>
        <MPTypography level="caption">
          The page keeps working while it runs — the dimming never takes the pointer.
        </MPTypography>
      </MPFlex>

      <MPTour steps={STEPS} open={running} onOpenChange={setRunning} />
    </MPFlex>
  );
}
