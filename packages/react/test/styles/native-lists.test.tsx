import type * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  MPBreadcrumb,
  MPBreadcrumbItem,
  MPLineChart,
  MPList,
  MPListItem,
  MPNavigationMenu,
  MPNavigationMenuItem,
  MPNavigationMenuLink,
  MPStep,
  MPStepper,
  MPTimeline,
  MPTimelineItem
} from 'material-plus-ui';

/**
 * What a list element still wears when the page under it has no reset.
 *
 * `native-controls.test.tsx`'s argument, one element over. A `<ul>` or an `<ol>`
 * arrives with a block margin of one em, forty pixels of indent and a marker on
 * every item, and a component that draws one has to take all three off itself.
 * The documentation site's scoped reset does it for a component that forgot, so
 * a legend with a bullet in front of every series showed nowhere but a real
 * page.
 *
 * Measured against a bare list rendered in the same page. The margin is compared
 * in ems, because the browser's is one em of whatever size the list is set in.
 */

interface Native {
  margin: number;
  indent: string;
}

const emsOf = (styles: CSSStyleDeclaration, length: string) =>
  Number.parseFloat(length) / Number.parseFloat(styles.fontSize);

function nativeOf(tag: 'ul' | 'ol'): Native {
  const element = document.createElement(tag);

  element.append(document.createElement('li'));
  document.body.append(element);

  const styles = getComputedStyle(element);
  const native = {
    margin: emsOf(styles, styles.marginBlockStart),
    indent: styles.paddingInlineStart
  };

  element.remove();

  return native;
}

/** Every list on the page still showing something the browser gave it. */
function leftovers(): string[] {
  const natives = { UL: nativeOf('ul'), OL: nativeOf('ol') };
  const found: string[] = [];

  for (const list of document.body.querySelectorAll<HTMLElement>('ul, ol')) {
    const styles = getComputedStyle(list);
    const native = natives[list.tagName as 'UL' | 'OL'];
    const name = [...list.classList].find((name) => name.startsWith('mp-')) ?? list.tagName;

    if (Math.abs(emsOf(styles, styles.marginBlockStart) - native.margin) < 0.01) {
      found.push(`${name}: margin`);
    }

    if (styles.paddingInlineStart === native.indent) {
      found.push(`${name}: indent`);
    }

    for (const item of list.querySelectorAll<HTMLElement>(':scope > li')) {
      const own = getComputedStyle(item);

      if (own.display === 'list-item' && own.listStyleType !== 'none') {
        found.push(`${name}: marker`);
        break;
      }
    }
  }

  return found;
}

describe('a list inside a component', () => {
  const cases: [string, React.ReactElement][] = [
    [
      'MPList',
      <MPList key="list">
        <MPListItem>Inbox</MPListItem>
        <MPListItem>Archive</MPListItem>
      </MPList>
    ],
    [
      'an MPList with dividers',
      <MPList key="dividers" dividers>
        <MPListItem>Inbox</MPListItem>
        <MPListItem>Archive</MPListItem>
      </MPList>
    ],
    [
      'MPBreadcrumb',
      <MPBreadcrumb key="breadcrumb">
        <MPBreadcrumbItem href="#home">Home</MPBreadcrumbItem>
        <MPBreadcrumbItem>Settings</MPBreadcrumbItem>
      </MPBreadcrumb>
    ],
    [
      'MPTimeline',
      <MPTimeline key="timeline" active={1}>
        <MPTimelineItem title="Ordered" />
        <MPTimelineItem title="Shipped" />
      </MPTimeline>
    ],
    [
      'MPNavigationMenu',
      <MPNavigationMenu key="navigation" aria-label="Main">
        <MPNavigationMenuItem value="product" label="Product">
          <MPNavigationMenuLink href="#overview" title="Overview" />
        </MPNavigationMenuItem>
      </MPNavigationMenu>
    ],
    [
      'MPStepper',
      <MPStepper key="stepper" active={0}>
        <MPStep label="Account" />
        <MPStep label="Payment" />
      </MPStepper>
    ],
    [
      'a chart legend',
      <MPLineChart
        key="chart"
        label="Sessions"
        categories={['Mon', 'Tue']}
        series={[
          { name: 'Organic', data: [1, 3] },
          { name: 'Referral', data: [2, 1] }
        ]}
      />
    ]
  ];

  it.each(cases)('keeps nothing the browser gave it in %s', async (_name, node) => {
    await render(node);

    expect(leftovers()).toEqual([]);
  });
});
