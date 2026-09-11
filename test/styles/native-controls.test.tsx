import type * as React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
  ICONS,
  MPAlert,
  MPBottomNavigation,
  MPBottomNavigationItem,
  MPButton,
  MPCalendar,
  MPChip,
  MPColorPicker,
  MPCombobox,
  MPDataTable,
  MPDatePicker,
  MPFloatingActionButton,
  MPIcon,
  MPLineChart,
  MPMenubar,
  MPMenubarMenu,
  MPMenuItem,
  MPNavigationMenu,
  MPNavigationMenuItem,
  MPNavigationMenuLink,
  MPNumberField,
  MPPill,
  MPSegmentedButton,
  MPSelect,
  MPStep,
  MPStepper,
  MPTab,
  MPTabs,
  MPTimePicker,
  MPToggle
} from 'material-plus-ui';

/**
 * What a native control still wears when the page under it has no reset.
 *
 * The library ships none, on purpose, so every `<button>` and `<input>` a
 * component draws has to take the browser's own border, fill and type off
 * itself. A page that does have a reset — the documentation site, anything on
 * Tailwind's Preflight — does that for a component that forgot, which is how a
 * filled button came to carry a two-pixel bevel everywhere except the one place
 * anybody looked at it.
 *
 * The comparison is against a bare control measured in the same page rather
 * than against a written-down value, because the three engines draw a native
 * button three different ways. A property counts as left over only when it is
 * exactly what the bare one got.
 */

interface Native {
  border: string;
  fill: string;
  type: string;
}

/** A border's style and width. The colour is left out on purpose: a component can
 * tint the browser's own bevel without taking it off. */
function borderOf(styles: CSSStyleDeclaration): string {
  return `${styles.borderTopStyle} ${styles.borderTopWidth}`;
}

function nativeOf(tag: 'button' | 'input'): Native {
  const element = document.createElement(tag);

  element.textContent = tag === 'button' ? 'Native' : '';
  document.body.append(element);

  const styles = getComputedStyle(element);
  const native = {
    border: borderOf(styles),
    fill: styles.backgroundColor,
    type: styles.fontSize
  };

  element.remove();

  return native;
}

/** Every native control on the page still showing something the browser gave it. */
function leftovers(): string[] {
  const nativeButton = nativeOf('button');
  const nativeInput = nativeOf('input');
  const found: string[] = [];

  for (const element of document.body.querySelectorAll<HTMLElement>('button, input')) {
    const box = element.getBoundingClientRect();
    const styles = getComputedStyle(element);

    // The inputs Base UI keeps for a form to read are clipped to a pixel.
    // Nobody sees them, so nothing about them can look wrong.
    if (box.width <= 2 || box.height <= 2) {
      continue;
    }

    const isButton = element.tagName === 'BUTTON';
    const native = isButton ? nativeButton : nativeInput;
    const name =
      element.getAttribute('aria-label') ??
      (element.textContent?.trim() || element.getAttribute('placeholder') || element.tagName);

    if (borderOf(styles) === native.border) {
      found.push(`${name}: border`);
    }

    if (isButton && styles.backgroundColor === native.fill) {
      found.push(`${name}: fill`);
    }

    if (!isButton && styles.fontSize === native.type) {
      found.push(`${name}: type`);
    }

    if (isButton) {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const holder = node.parentElement;

        if (
          node.textContent?.trim() &&
          holder &&
          getComputedStyle(holder).fontSize === native.type
        ) {
          found.push(`${name}: type`);
          break;
        }
      }
    }
  }

  return found;
}

const noop = () => {};

const TAGS = [
  { value: 'design', label: 'design' },
  { value: 'react', label: 'react' }
];

const ROWS = [{ id: 1, name: 'Ada', score: 3 }];
const HEADERS = [
  { key: 'name', label: 'Name' },
  { key: 'score', label: 'Score' }
];

describe('a native control inside a component', () => {
  const cases: [string, React.ReactElement][] = [
    [
      'MPButton',
      <div key="button">
        <MPButton>Filled</MPButton>
        <MPButton variant="tonal">Tonal</MPButton>
        <MPButton variant="elevated">Elevated</MPButton>
        <MPButton variant="outlined">Outlined</MPButton>
        <MPButton variant="text">Text</MPButton>
        <MPButton disabled>Disabled</MPButton>
      </div>
    ],
    [
      'MPToggle',
      <div key="toggle">
        <MPToggle>Off</MPToggle>
        <MPToggle defaultPressed>On</MPToggle>
        <MPToggle variant="text">Text</MPToggle>
        <MPToggle disabled>Disabled</MPToggle>
      </div>
    ],
    [
      'MPChip',
      <div key="chip">
        <MPChip onClick={noop}>Outlined</MPChip>
        <MPChip variant="tonal" onClick={noop}>
          Tonal
        </MPChip>
        <MPChip variant="text" selected onClick={noop}>
          Text
        </MPChip>
        <MPChip onDelete={noop}>Removable</MPChip>
      </div>
    ],
    [
      'MPFloatingActionButton',
      <MPFloatingActionButton
        key="fab"
        position="static"
        icon={<MPIcon icon={ICONS.add} />}
        label="Compose"
      />
    ],
    [
      'MPMenubar',
      <MPMenubar key="menubar">
        <MPMenubarMenu label="File">
          <MPMenuItem onClick={noop}>New</MPMenuItem>
        </MPMenubarMenu>
      </MPMenubar>
    ],
    [
      'MPNavigationMenu',
      <MPNavigationMenu key="navigation" aria-label="Main">
        <MPNavigationMenuItem value="product" label="Product">
          <MPNavigationMenuLink href="#overview" title="Overview" />
        </MPNavigationMenuItem>
      </MPNavigationMenu>
    ],
    ['MPNumberField', <MPNumberField key="number" label="Seats" defaultValue={3} />],
    [
      'MPStepper',
      <MPStepper key="stepper" active={1} onActiveChange={noop}>
        <MPStep label="Account" />
        <MPStep label="Payment" />
      </MPStepper>
    ],
    [
      'MPBottomNavigation',
      <MPBottomNavigation key="bottom" label="Main" position="static" defaultValue="home">
        <MPBottomNavigationItem value="home" icon={<MPIcon icon={ICONS.info} />}>
          Home
        </MPBottomNavigationItem>
        <MPBottomNavigationItem value="search" icon={<MPIcon icon={ICONS.search} />}>
          Search
        </MPBottomNavigationItem>
      </MPBottomNavigation>
    ],
    [
      'MPSegmentedButton',
      <MPSegmentedButton
        key="segmented"
        aria-label="Range"
        defaultValue={['week']}
        items={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' }
        ]}
      />
    ],
    [
      'MPTabs',
      <MPTabs key="tabs" aria-label="Library" defaultValue="albums">
        <MPTab value="albums">Albums</MPTab>
        <MPTab value="artists">Artists</MPTab>
      </MPTabs>
    ],
    ['MPCalendar', <MPCalendar key="calendar" defaultValue={new Date(2026, 8, 17)} />],
    [
      'MPLineChart',
      <MPLineChart
        key="chart"
        label="Sessions"
        categories={['Mon', 'Tue']}
        series={[
          { name: 'Organic', data: [1, 3] },
          { name: 'Referral', data: [2, 1] }
        ]}
      />
    ],
    [
      'MPAlert',
      <MPAlert key="alert" title="Saved" onClose={noop}>
        Everything is up to date.
      </MPAlert>
    ],
    [
      'MPSelect',
      <MPSelect
        key="select"
        label="City"
        items={[{ value: 'seoul', label: 'Seoul' }]}
        defaultValue="seoul"
      />
    ],
    [
      'MPDatePicker',
      <MPDatePicker key="date" label="Due" defaultValue={new Date(2026, 8, 17)} clearable />
    ],
    ['MPColorPicker', <MPColorPicker key="colour" label="Tag" defaultValue="#00639b" clearable />],
    [
      'MPCombobox',
      <MPCombobox
        key="combobox"
        label="Tags"
        items={TAGS}
        multiple
        defaultValue={['design']}
        clearable
      />
    ],
    ['MPPill', <MPPill key="pill" title="On a call" onClick={noop} />],
    [
      'MPDataTable',
      <MPDataTable
        key="table"
        headers={HEADERS}
        items={ROWS}
        getRowKey={(row) => row.id}
        sortable
      />
    ]
  ];

  it.each(cases)('keeps nothing the browser gave it in %s', async (_name, node) => {
    await render(node);

    expect(leftovers()).toEqual([]);
  });

  it('keeps nothing the browser gave it in an open MPTimePicker', async () => {
    await render(
      <MPTimePicker label="Appointment" defaultValue={new Date(2026, 8, 17, 10, 30)} defaultOpen />
    );

    await expect.element(page.getByRole('listbox').first()).toBeVisible();
    expect(leftovers()).toEqual([]);
  });
});
