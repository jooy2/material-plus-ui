/**
 * The five components this library adds to the protocol's vocabulary, and the
 * schemas that are their contract.
 *
 * Everything in `a2ui/components` implements schemas A2UI publishes. These are
 * ours: a table and three charts and a figure, which the basic catalog has no way
 * to express and an agent reporting numbers needs first. They are published as
 * `docs/public/a2ui/v0_9/catalog.json`, generated from this file by
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
import { DataBindingSchema, FunctionCallSchema, DynamicStringSchema } from '@a2ui/web_core/v0_9';

/**
 * A list an agent can either write out or point at.
 *
 * The union is the protocol's own for `DynamicStringList`, with the element type
 * swapped: a literal array, a path into the data model, or a function call. The
 * SDK's binder recognises the shape — an option carrying `path` and no
 * `componentId` — and subscribes to the path, so a list bound this way is
 * re-read when the data changes rather than when the component is resent.
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

/** What every component in this catalog carries, exactly as the basic one does. */
const CommonProps = {
  accessibility: z
    .object({
      label: DynamicStringSchema.optional().describe(
        'A short name used by assistive technologies.'
      ),
      description: DynamicStringSchema.optional().describe('Additional detail about the element.')
    })
    .strict()
    .optional(),
  weight: z
    .number()
    .describe(
      "The relative weight of this component within a Row or Column, like CSS 'flex-grow'. Only meaningful as a direct child of one."
    )
    .optional()
};

/** One column of a `DataTable`. */
const DataTableColumnSchema = z
  .object({
    key: z
      .string()
      .describe("The property this column reads from each row. Also the column's own id."),
    label: DynamicStringSchema.optional().describe(
      'The column heading. Defaults to the key itself.'
    ),
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
  schema: z
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
      caption: DynamicStringSchema.optional().describe(
        'A description of the table, read out before its contents. Use it to say what the rows are, since column headings rarely say that on their own.'
      ),
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
  label: DynamicStringSchema.optional().describe(
    'What the chart is of, read out before it. A chart with no label is a picture assistive technology cannot describe.'
  ),
  xAxisLabel: DynamicStringSchema.optional().describe('A name for what the category axis counts.'),
  yAxisLabel: DynamicStringSchema.optional().describe('A name for what the value axis measures.'),
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
  schema: z
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
};

export const LineChartApi = {
  name: 'LineChart',
  schema: z
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
};

export const PieChartApi = {
  name: 'PieChart',
  schema: z
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
      label: DynamicStringSchema.optional().describe('What the chart is of, read out before it.'),
      height: z.number().describe('The plot height in pixels.').optional(),
      legend: z.boolean().describe('Whether to draw the legend. Defaults to on.').optional()
    })
    .strict()
    .describe(
      'A pie or donut chart, for parts of one whole. Use it only when the parts add up to something — a bar chart is easier to read for anything else, and far easier past about six slices.'
    )
};

export const StatisticApi = {
  name: 'Statistic',
  schema: z
    .object({
      ...CommonProps,
      value: z
        .union([z.string(), z.number(), DataBindingSchema, FunctionCallSchema])
        .describe(
          "The figure itself. A number is formatted in the reader's locale; a string is drawn as it is."
        ),
      label: DynamicStringSchema.optional().describe('What the figure is of, drawn above it.'),
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
      unit: DynamicStringSchema.optional().describe(
        'A unit after the figure, such as `ms` or `kg`.'
      ),
      prefix: DynamicStringSchema.optional().describe('A symbol before the figure, such as `$`.'),
      period: DynamicStringSchema.optional().describe(
        'What the change is measured over, such as `vs last week`.'
      ),
      caption: DynamicStringSchema.optional().describe('A line under the figure.'),
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
};
