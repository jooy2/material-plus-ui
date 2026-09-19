import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { A2uiSurface } from '@a2ui/react/v0_9';
import type { A2uiMessage } from '@a2ui/web_core/v0_9';
import { MessageProcessor } from '@a2ui/web_core/v0_9';
import {
  MP_A2UI_CATALOG_ID,
  MP_A2UI_EXTENDED_COMPONENTS,
  mpA2uiExtendedCatalog
} from 'material-plus-ui/a2ui';
import published from '../../docs/public/a2ui/v0_9/catalog.json';

/**
 * The five components this library adds to the protocol's vocabulary.
 *
 * Driven through the protocol like the basic ones, and for the same reason. What
 * is different here is that the schemas are ours, so two things are worth testing
 * that the basic catalog did not need: that a list bound to a path arrives as data
 * rather than as a binding, and that data which is *not* what the schema described
 * — which is everything a path can resolve to — draws something instead of taking
 * the surface down with it.
 */
const SURFACE = 'test-surface';

/** A surface on the extended catalog, with an optional starting data model. */
function surfaceOf(components: Record<string, unknown>[], data?: Record<string, unknown>) {
  const processor = new MessageProcessor([mpA2uiExtendedCatalog]);

  processor.processMessages([
    {
      version: 'v0.9',
      createSurface: {
        surfaceId: SURFACE,
        catalogId: MP_A2UI_CATALOG_ID,
        sendDataModel: true
      }
    },
    { version: 'v0.9', updateComponents: { surfaceId: SURFACE, components } }
  ] as A2uiMessage[]);

  const surface = processor.model.surfacesMap.get(SURFACE);

  if (!surface) {
    throw new Error('the surface was refused: the payload does not match the catalog');
  }

  if (data) {
    for (const [path, value] of Object.entries(data)) {
      surface.dataModel.set(path, value);
    }
  }

  return surface;
}

const ROWS = [
  { city: 'Seoul', orders: 128 },
  { city: 'Busan', orders: 64 }
];

const COLUMNS = [
  { key: 'city', label: 'City' },
  { key: 'orders', label: 'Orders', align: 'end' }
];

describe('the extended catalog', () => {
  describe('what it registers', () => {
    it('answers to an id of this library rather than to the basic one', () => {
      expect(mpA2uiExtendedCatalog.id).toBe(MP_A2UI_CATALOG_ID);
      expect(MP_A2UI_CATALOG_ID).toMatch(/^https:\/\/material-plus\.cdget\.com\//);
    });

    it('holds the basic eighteen and these five', () => {
      expect(mpA2uiExtendedCatalog.components.size).toBe(23);
      expect(MP_A2UI_EXTENDED_COMPONENTS).toHaveLength(5);

      for (const name of ['DataTable', 'BarChart', 'LineChart', 'PieChart', 'Statistic']) {
        expect(mpA2uiExtendedCatalog.components.has(name)).toBe(true);
      }
    });

    it('is described by the schema the site publishes at that id', () => {
      // The file is generated in `npm run build` and committed; this is what says
      // so when it is not. An agent reading a stale catalog asks for props the
      // renderer no longer has, and nothing on either side reports it.
      expect(published.catalogId).toBe(MP_A2UI_CATALOG_ID);
      expect(Object.keys(published.components).sort()).toEqual(
        [...mpA2uiExtendedCatalog.components.keys()].sort()
      );
    });

    it('publishes no reference that does not resolve', () => {
      // Every `$ref` has to be the protocol's own definition file. A pointer into
      // the document itself is what the SDK's conversion emits and what the
      // generator expands, because the envelope leaves it naming nothing.
      const refs = JSON.stringify(published).match(/"\$ref":"[^"]*"/g) ?? [];

      expect(refs.length).toBeGreaterThan(0);

      for (const ref of refs) {
        expect(ref).toContain('common_types.json#/$defs/');
      }
    });
  });

  describe('DataTable', () => {
    it('draws the rows it was given, in the columns it was given', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf([
            { id: 'root', component: 'DataTable', columns: COLUMNS, rows: ROWS, caption: 'Orders' }
          ])}
        />
      );

      await expect.element(screen.getByRole('table', { name: 'Orders' })).toBeInTheDocument();
      await expect.element(screen.getByRole('columnheader', { name: 'City' })).toBeInTheDocument();
      await expect.element(screen.getByText('Seoul')).toBeInTheDocument();
      await expect.element(screen.getByText('128')).toBeInTheDocument();
    });

    it('reads its rows from the data model when they are bound to a path', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf(
            [{ id: 'root', component: 'DataTable', columns: COLUMNS, rows: { path: '/rows' } }],
            { '/rows': ROWS }
          )}
        />
      );

      await expect.element(screen.getByText('Busan')).toBeInTheDocument();
    });

    it('writes the keys of the rows a reader picked back to the data model', async () => {
      const surface = surfaceOf([
        {
          id: 'root',
          component: 'DataTable',
          columns: COLUMNS,
          rows: ROWS,
          rowKey: 'city',
          selection: 'multiple',
          selectedKeys: { path: '/picked' }
        }
      ]);
      const screen = await render(<A2uiSurface surface={surface} />);

      // The first row's own checkbox. Every row's is labelled the same, and the
      // header's — "Select all rows" — picks all of them.
      await screen.getByRole('checkbox', { name: 'Select row' }).first().click();

      expect(surface.dataModel.get('/picked')).toEqual(['Seoul']);
    });

    it('draws a cell holding something that is not a value, rather than throwing', async () => {
      // A bound path can resolve to anything, and React refuses an object as a
      // child. This is the case that would otherwise take the whole surface down.
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf(
            [{ id: 'root', component: 'DataTable', columns: COLUMNS, rows: { path: '/rows' } }],
            { '/rows': [{ city: { name: 'Seoul' }, orders: null }] }
          )}
        />
      );

      await expect.element(screen.getByText('{"name":"Seoul"}')).toBeInTheDocument();
    });
  });

  describe('the charts', () => {
    it('draws a bar chart from a series in the data model', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf(
            [
              {
                id: 'root',
                component: 'BarChart',
                series: { path: '/series' },
                categories: ['Jan', 'Feb'],
                label: 'Orders by month'
              }
            ],
            { '/series': [{ name: 'Orders', data: [12, 18] }] }
          )}
        />
      );

      await expect
        .element(screen.getByRole('img', { name: /Orders by month/ }))
        .toBeInTheDocument();
      expect(screen.container.querySelectorAll('svg').length).toBeGreaterThan(0);
    });

    it('draws a line chart and a pie chart from literal data', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf([
            { id: 'root', component: 'Column', children: ['line', 'pie'] },
            {
              id: 'line',
              component: 'LineChart',
              series: [{ name: 'Visits', data: [1, 4, 9] }],
              categories: ['Mon', 'Tue', 'Wed'],
              curve: 'step',
              label: 'Visits'
            },
            {
              id: 'pie',
              component: 'PieChart',
              data: [3, 1],
              categories: ['Direct', 'Search'],
              shape: 'donut',
              label: 'Sources'
            }
          ])}
        />
      );

      await expect.element(screen.getByRole('img', { name: /Visits/ })).toBeInTheDocument();
      await expect.element(screen.getByRole('img', { name: /Sources/ })).toBeInTheDocument();
    });

    it('draws nothing at all rather than throwing on data that is not a series', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf(
            [{ id: 'root', component: 'BarChart', series: { path: '/series' }, label: 'Pending' }],
            // What a half-written data model looks like: the agent said it would
            // put a series here and has not yet.
            { '/series': 'later' }
          )}
        />
      );

      await expect.element(screen.getByRole('img', { name: /Pending/ })).toBeInTheDocument();
    });
  });

  describe('Statistic', () => {
    it('draws the figure, its name and its change', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf([
            {
              id: 'root',
              component: 'Statistic',
              label: 'Revenue',
              value: 12400,
              previousValue: 10000,
              delta: 'percent',
              prefix: '$'
            }
          ])}
        />
      );

      await expect.element(screen.getByText('Revenue')).toBeInTheDocument();
      // Formatted in the reader's locale, which is what passing a number buys —
      // and shortened past four digits, which is what `MPStatistic` does with a
      // headline figure unless the agent asks for `compact: false`.
      await expect.element(screen.getByText('12.4K')).toBeInTheDocument();
      await expect.element(screen.getByText('+24%')).toBeInTheDocument();
    });

    it('draws a value that is a string as it was written', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf([
            { id: 'root', component: 'Statistic', label: 'Rating', value: '4.8 / 5' }
          ])}
        />
      );

      await expect.element(screen.getByText('4.8 / 5')).toBeInTheDocument();
    });
  });
});
