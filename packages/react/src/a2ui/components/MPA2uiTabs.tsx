/**
 * `Tabs` — one panel of several, as `MPTabs`.
 *
 * Each tab is keyed by the id of the child it shows, not by its position. A
 * surface arrives over a stream and a payload may add a tab, remove one or
 * reorder them after the first render, and a position is not a name: keyed by
 * index, inserting a tab at the front would move every panel's contents one
 * place along while the reader was looking at one of them.
 *
 * Controlled for the same reason. `defaultValue` is read once, so a `Tabs` that
 * rendered before its `tabs` arrived would open with nothing chosen and stay
 * that way; holding the choice here lets the first tab be the answer until the
 * reader picks another, and lets the reader's pick survive the list growing.
 */
import * as React from 'react';
import { createComponentImplementation } from '@a2ui/react';
import { TabsApi } from '@a2ui/web_core/v1_0';
import { MPTab, MPTabPanel, MPTabs, type MPTabValue } from '../../components/tabs/MPTabs';
import { accessibilityAttributes, asText, weightStyle } from '../internal/common';

export const MPA2uiTabs = createComponentImplementation(TabsApi, ({ props, buildChild }) => {
  const tabs = props.tabs ?? [];
  const [chosen, setChosen] = React.useState<MPTabValue | null>(null);
  /* The reader's choice while it still names a tab, and the first tab until then. */
  const value =
    chosen !== null && tabs.some((tab) => tab.child === chosen) ? chosen : (tabs[0]?.child ?? null);

  return (
    <MPTabs
      value={value}
      onValueChange={setChosen}
      style={weightStyle(props.weight)}
      {...accessibilityAttributes(props.accessibility)}
    >
      {tabs.map((tab, index) => (
        <MPTab key={`tab-${tab.child}-${index}`} value={tab.child}>
          {asText(tab.title)}
        </MPTab>
      ))}

      {tabs.map((tab, index) => (
        <MPTabPanel key={`panel-${tab.child}-${index}`} value={tab.child}>
          {buildChild(tab.child)}
        </MPTabPanel>
      ))}
    </MPTabs>
  );
});
