/**
 * The five components this library adds to the protocol's vocabulary, and the
 * schemas that are their contract.
 *
 * Everything in `a2ui/components` implements schemas A2UI publishes. These are
 * ours: a table and three charts and a figure, which the basic catalog has no way
 * to express and an agent reporting numbers needs first. They are published as
 * `docs/public/a2ui/v1_0/catalog.json`, generated from this file by
 * `scripts/build-a2ui-catalog.mjs`, and served at the `catalogId` in
 * `a2ui/catalog.ts`.
 *
 * ## What a schema here is allowed to be
 *
 * A prop an agent writes is not a prop a React caller writes, and the difference
 * decides what goes in:
 *
 * - **It has to be JSON.** No function, no element, no `Date`. So a column's
 *   `value` accessor, a chart's `Intl` options and a table's `render` — the props
 *   that make these components flexible in a page — have no schema and are not
 *   reachable. What replaces them is a narrower question the agent can answer.
 * - **It has to be bindable where the data is.** A table's rows and a chart's
 *   series live in the data model, so they take a literal *or* a path, which is
 *   what `dynamicList` is for. A payload that streams numbers in updates the
 *   chart without resending the chart.
 * - **It has to be described.** Every field carries a `describe`, because the
 *   description is what the agent reads: this file is the prompt as much as it is
 *   the contract, and a field nobody can tell the purpose of is a field an agent
 *   fills in wrongly.
 * - **It has to be closed.** `.strict()` on every object, so a payload with a
 *   misspelled prop is refused rather than silently drawn without it.
 * - **It has to be written the way the protocol writes its own.** Each schema is
 *   annotated with `spec()` as the SDK's v1.0 basic components are, so
 *   `Catalog.toJson` writes it in the same layout: the protocol closes a
 *   component once, around the envelope, and a component closed again on its
 *   own would refuse the `id` the envelope puts beside its props.
 *
 * ## What is deliberately missing
 *
 * No `onRowClick`, and no per-row action. An A2UI action carries a context
 * resolved from data paths at the moment it fires, which cannot name *which* row
 * was pressed — so a row action would be a callback that could not say what it
 * happened to. Selection says it instead: the agent binds `selectedKeys`, the
 * reader picks rows, and the keys are in the data model for the next message to
 * read. That is the same shape every input in the basic catalog has.
 */
import { z } from 'zod';
import {
  DataBindingSchema,
  DynamicStringSchema,
  FunctionCallSchema,
  WeightSchema,
  spec
} from '@a2ui/web_core/v1_0';

/**
 * A component's props, in the layout the protocol's own v1.0 components use.
 *
 * Validation is unchanged: the object stays strict. What `spec()` changes is the
 * document `Catalog.toJson` writes from it, which leaves the closing to the
 * protocol's envelope, as the basic catalog's document does.
 */
const component = <Schema extends z.ZodTypeAny>(schema: Schema) => spec(schema, { mixins: [] });

/**
 * A string an agent can write out, point at or compute, with what it is for.
 *
 * The description is written in the protocol's `REF:` convention, which is how
 * the SDK's own schemas say "this is the common `DynamicString`". The published
 * document then names that definition instead of spelling the union out, and
 * the words after the bar are the description an agent reads.
 */
const dynamicString = (description: string) =>
  DynamicStringSchema.describe(`REF:#/$defs/DynamicString|${description}`);

/**
 * A list an agent can either write out or point at.
 *
 * The union is the protocol's own for `DynamicStringList`, with the element type
 * swapped: a literal array, a path into the data model, or a function call. The
 * SDK's binder recognises the shape — an object carrying `@path` — and
 * subscribes to the path, so a list bound this way is re-read when the data
 * changes rather than when the component is resent.
 */
const dynamicList = <Element extends z.ZodTypeAny>(element: Element, description: string) =>
  z.union([z.array(element), DataBindingSchema, FunctionCallSchema]).describe(description);

/**
 * The four accent families, and nothing else.
 *
 * A chart's colours come from the token sheet — a series left alone takes the
 * next slot of the palette the page's source colour generated — so what an agent
 * may state is *which role* a series reads, not which colour it is drawn in. An
 * agent picking `#ff0000` would be picking a colour that does not belong to the
 * scheme, cannot answer to a dark theme, and cannot be told from the series
 * beside it by anybody using a high-contrast palette.
 */
const AccentSchema = z
  .enum(['primary', 'secondary', 'tertiary', 'error'])
  .describe(
    "Which accent role this reads, out of the page's own colour scheme. Omit it to take the next slot of the chart palette, which is what keeps a set of series distinguishable."
  );

/**
 * What every component in this catalog carries, exactly as the basic one does.
 *
 * `weight` only. From v1.0 `accessibility` belongs to the component envelope,
 * beside `id`, so the SDK validates it and its binder resolves it for every
 * component whatever the component's own schema says. Declaring it here as well
 * would be a second copy of a definition that already has a newer one.
 *
 * `WeightSchema` is the SDK's, so the published document names the same
 * `#/$defs/Weight` the basic components do.
 */
const CommonProps = {
  weight: WeightSchema.optional()
};

/** One column of a `DataTable`. */
const DataTableColumnSchema = z
  .object({
    key: z
      .string()
      .describe("The property this column reads from each row. Also the column's own id."),
    label: dynamicString('The column heading. Defaults to the key itself.').optional(),
    align: z
      .enum(['start', 'center', 'end'])
      .describe("Where the cell's contents sit. Use 'end' for a column of numbers.")
      .optional(),
    sortable: z
      .boolean()
      .describe('Whether the reader may sort by this column. Defaults to true.')
      .optional(),
    searchable: z
      .boolean()
      .describe('Whether the search box looks in this column. Defaults to true.')
      .optional(),
    width: z.number().describe("The column's width in pixels. Omit to share the room.").optional()
  })
  .strict();

export const DataTableApi = {
  name: 'DataTable',
  schema: component(
    z
      .object({
        ...CommonProps,
        columns: z
          .array(DataTableColumnSchema)
          .min(1)
          .describe('The columns, in the order they are drawn.'),
        rows: dynamicList(
          z.record(z.any()),
          'The rows: an array of objects keyed by the columns above, or a path to one in the data model. Bind a path when the data arrives separately from the table.'
        ),
        rowKey: z
          .string()
          .describe(
            "The column key whose value identifies a row, used for selection. Defaults to the row's position, which is only stable while the rows are."
          )
          .optional(),
        caption: dynamicString(
          'A description of the table, read out before its contents. Use it to say what the rows are, since column headings rarely say that on their own.'
        ).optional(),
        searchable: z
          .boolean()
          .describe('Puts a search box above the table. Defaults to false.')
          .optional(),
        sortable: z
          .boolean()
          .describe('Lets the reader sort by any sortable column. Defaults to true.')
          .optional(),
        paged: z
          .boolean()
          .describe('Splits the rows into pages. Worth it past about twenty rows.')
          .optional(),
        pageSize: z.number().int().positive().describe('Rows per page. Defaults to 10.').optional(),
        selection: z
          .enum(['none', 'single', 'multiple'])
          .describe(
            "Whether the reader may pick rows, and how many. 'multiple' draws a column of checkboxes and 'single' picks the row that is pressed. Bind 'selectedKeys' to read the choice back."
          )
          .optional(),
        selectedKeys: z
          .union([z.array(z.string()), DataBindingSchema])
          .describe(
            'The keys of the selected rows. Bind this to a path to be told what the reader picked.'
          )
          .optional(),
        striped: z
          .boolean()
          .describe('Shades alternate rows, which helps a wide table be read across.')
          .optional()
      })
      .strict()
      .describe(
        'A table of rows and columns, with sorting, searching, paging and selection. Prefer this to a Row-and-Column layout whenever the data is tabular: it is announced as a table, it can be sorted, and it stays readable on a narrow screen.'
      )
  )
};

/** One series of a cartesian chart. */
const ChartSeriesSchema = z
  .object({
    name: z
      .string()
      .describe('The name of this series, in the legend and the hover panel.')
      .optional(),
    data: z
      .array(z.number().nullable())
      .describe('Its values, one per category, in category order. `null` is a gap, not a zero.'),
    color: AccentSchema.optional()
  })
  .strict();

/** What a cartesian chart takes, whichever marks it draws with. */
const CartesianProps = {
  ...CommonProps,
  series: dynamicList(
    ChartSeriesSchema,
    'The series, in the order their colours are handed out. A literal array, or a path to one in the data model.'
  ),
  categories: z
    .union([z.array(z.string()), DataBindingSchema])
    .describe("The category axis' labels, one per value in each series.")
    .optional(),
  label: dynamicString(
    'What the chart is of, read out before it. A chart with no label is a picture assistive technology cannot describe.'
  ).optional(),
  xAxisLabel: dynamicString('A name for what the category axis counts.').optional(),
  yAxisLabel: dynamicString('A name for what the value axis measures.').optional(),
  height: z
    .number()
    .describe('The plot height in pixels. Defaults to a size that suits the chart.')
    .optional(),
  legend: z
    .boolean()
    .describe('Whether to draw the legend. Defaults to on past one series.')
    .optional()
};

export const BarChartApi = {
  name: 'BarChart',
  schema: component(
    z
      .object({
        ...CartesianProps,
        stacked: z
          .boolean()
          .describe(
            'Stacks the series into one bar per category instead of drawing them side by side.'
          )
          .optional(),
        horizontal: z
          .boolean()
          .describe('Turns the bars sideways, which is what long category names need.')
          .optional()
      })
      .strict()
      .describe('A bar chart, for comparing a value across categories.')
  )
};

export const LineChartApi = {
  name: 'LineChart',
  schema: component(
    z
      .object({
        ...CartesianProps,
        curve: z
          .enum(['linear', 'smooth', 'step'])
          .describe(
            "How a line gets from one point to the next. 'step' is for a value that holds and then changes, such as a price."
          )
          .optional(),
        markers: z
          .boolean()
          .describe('Draws a dot at each point. Defaults to on while the points are few enough.')
          .optional()
      })
      .strict()
      .describe('A line chart, for a value that moves over a sequence — usually time.')
  )
};

export const PieChartApi = {
  name: 'PieChart',
  schema: component(
    z
      .object({
        ...CommonProps,
        data: dynamicList(
          z.number().nullable(),
          'One value per slice, in the order of `categories`. A literal array, or a path to one in the data model.'
        ),
        categories: z
          .union([z.array(z.string()), DataBindingSchema])
          .describe("Each slice's name, in the legend and the hover panel.")
          .optional(),
        shape: z
          .enum(['pie', 'donut', 'semi'])
          .describe("The shape it is drawn as. 'donut' leaves room in the middle.")
          .optional(),
        label: dynamicString('What the chart is of, read out before it.').optional(),
        height: z.number().describe('The plot height in pixels.').optional(),
        legend: z.boolean().describe('Whether to draw the legend. Defaults to on.').optional()
      })
      .strict()
      .describe(
        'A pie or donut chart, for parts of one whole. Use it only when the parts add up to something — a bar chart is easier to read for anything else, and far easier past about six slices.'
      )
  )
};

export const StatisticApi = {
  name: 'Statistic',
  schema: component(
    z
      .object({
        ...CommonProps,
        value: z
          .union([z.string(), z.number(), DataBindingSchema, FunctionCallSchema])
          .describe(
            "The figure itself. A number is formatted in the reader's locale; a string is drawn as it is."
          ),
        label: dynamicString('What the figure is of, drawn above it.').optional(),
        previousValue: z
          .number()
          .describe('What the figure was, which is what turns `delta` into a change.')
          .optional(),
        delta: z
          .enum(['percent', 'absolute', 'both', 'none'])
          .describe(
            'How the change from `previousValue` is written. Defaults to a percentage when there is a previous value.'
          )
          .optional(),
        betterWhen: z
          .enum(['up', 'down'])
          .describe(
            'Which direction is good news, which decides the colour of the change. Set it on a figure where down is better, such as a cost or a bounce rate — the default assumes up.'
          )
          .optional(),
        unit: dynamicString('A unit after the figure, such as `ms` or `kg`.').optional(),
        prefix: dynamicString('A symbol before the figure, such as `$`.').optional(),
        period: dynamicString(
          'What the change is measured over, such as `vs last week`.'
        ).optional(),
        caption: dynamicString('A line under the figure.').optional(),
        compact: z
          .boolean()
          .describe(
            'Whether a number of five digits or more is written short: 12.4K rather than 12,400. On by default, because that is what a headline figure wants; pass false for one that has to be read exactly.'
          )
          .optional(),
        align: z
          .enum(['start', 'center', 'end'])
          .describe('Where the block sits. Defaults to the start.')
          .optional()
      })
      .strict()
      .describe(
        'One figure, with what it is and how it has changed. The component to reach for when the answer is a number — a chart of one point is not a chart.'
      )
  )
};
