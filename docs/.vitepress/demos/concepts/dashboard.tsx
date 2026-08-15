import { useMemo, useState } from 'react';
import {
  ICONS,
  MPAlert,
  MPAvatar,
  MPBadge,
  MPBreadcrumb,
  MPBreadcrumbItem,
  MPButton,
  MPCard,
  MPCheckbox,
  MPChip,
  MPContextMenu,
  MPDateRangePicker,
  MPDialog,
  MPDialogClose,
  MPDrawer,
  MPEmpty,
  MPFloatingActionButton,
  MPIcon,
  MPIconButton,
  MPList,
  MPListItem,
  MPMenu,
  MPMenuItem,
  MPMenuSeparator,
  MPPagination,
  MPPane,
  MPPanes,
  MPPill,
  MPProgressBox,
  MPProgressCircular,
  MPProgressLinear,
  MPSelect,
  MPSwitch,
  MPTab,
  MPTable,
  MPTabPanel,
  MPTabs,
  MPTextField,
  MPTimeline,
  MPTimelineItem,
  MPTooltip,
  MPTypography,
  useMPSnackbar,
  MPSnackbarProvider
} from 'material-plus-ui';
import type { MPDateRange, MPSelectValue, MPTableColumn } from 'material-plus-ui';

/**
 * The back office of Grange, a shop that does not exist.
 *
 * A rail, a filter row, four figures and a table with an action on every row —
 * all on one screen and all at the same `size`, which is the arrangement that
 * shows whether a size ladder actually holds. At `sm` a text field, a select, a
 * date range and a button are the same height, so the filter row keeps one
 * baseline without a single margin being written down.
 *
 * The table is live: search it, filter it by channel, tick some rows and the
 * bulk actions appear. Filtering is ordinary React state — the table renders
 * whatever it is handed and shows `empty` when that is nothing.
 */

/* ---------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------- */

interface Order {
  id: string;
  customer: string;
  channel: 'store' | 'web' | 'wholesale';
  status: 'paid' | 'refunded' | 'pending';
  total: number;
}

const ORDERS: Order[] = [
  { id: 'GR-2841', customer: 'Ada Lovelace', channel: 'web', status: 'paid', total: 128.4 },
  { id: 'GR-2840', customer: '홍길동', channel: 'store', status: 'pending', total: 61.0 },
  { id: 'GR-2839', customer: 'Grace Hopper', channel: 'web', status: 'paid', total: 244.9 },
  {
    id: 'GR-2838',
    customer: 'Northwind Ltd',
    channel: 'wholesale',
    status: 'refunded',
    total: 980.0
  },
  { id: 'GR-2837', customer: 'Mina Park', channel: 'web', status: 'paid', total: 44.5 },
  { id: 'GR-2836', customer: 'Kestrel Inc', channel: 'wholesale', status: 'paid', total: 1320.0 }
];

const STATUS_COLOR = { paid: 'tertiary', refunded: 'error', pending: 'primary' } as const;

const CHANNELS = [
  { value: 'all', label: 'Every channel' },
  { value: 'web', label: 'Web' },
  { value: 'store', label: 'Store' },
  { value: 'wholesale', label: 'Wholesale' }
];

const SECTIONS = [
  { key: 'orders', label: 'Orders', icon: ICONS.check, count: 6 },
  { key: 'products', label: 'Products', icon: ICONS.copy },
  { key: 'customers', label: 'Customers', icon: ICONS.info },
  { key: 'reports', label: 'Reports', icon: ICONS['arrow-up'] }
];

const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

/* ---------------------------------------------------------------------------
 * Pieces
 * ------------------------------------------------------------------------- */

function Figure({
  label,
  value,
  delta,
  better = 'up'
}: {
  label: string;
  value: string;
  delta: number;
  better?: 'up' | 'down';
}) {
  const rose = delta > 0;
  const good = better === 'up' ? rose : !rose;

  return (
    <MPCard variant="filled" size="sm" style={{ height: '100%' }}>
      <div className="text-mp-label-medium text-mp-on-surface-variant">{label}</div>
      <div className="text-mp-title-large text-mp-on-surface" style={{ margin: '2px 0 6px' }}>
        {value}
      </div>
      <MPChip
        size="xs"
        variant="tonal"
        color={good ? 'tertiary' : 'error'}
        startIcon={<MPIcon icon={rose ? ICONS['arrow-up'] : ICONS['arrow-down']} size={14} />}
      >
        {Math.abs(delta)}%
      </MPChip>
    </MPCard>
  );
}

/** The rail. `mode="standard"` is the same panel in the layout rather than over it. */
function Rail({
  open,
  section,
  onSection
}: {
  open: boolean;
  section: string;
  onSection: (key: string) => void;
}) {
  return (
    <MPDrawer mode="standard" open={open} size="xs" extent={168} title="Grange">
      <div style={{ display: 'grid', gap: 12 }}>
        <MPList variant="text" size="sm" render={<nav />}>
          {SECTIONS.map((item) => (
            <MPListItem
              key={item.key}
              selected={section === item.key}
              startIcon={<MPIcon icon={item.icon} size={18} />}
              action={
                item.count ? (
                  <MPChip size="xs" variant="tonal">
                    {item.count}
                  </MPChip>
                ) : undefined
              }
              onClick={() => onSection(item.key)}
            >
              {item.label}
            </MPListItem>
          ))}
        </MPList>

        <MPCard size="sm" variant="outlined" title="Storage">
          <MPProgressLinear size="sm" label="Used" value={62} showValue />
        </MPCard>
      </div>
    </MPDrawer>
  );
}

/* ---------------------------------------------------------------------------
 * The screen
 * ------------------------------------------------------------------------- */

function Screen() {
  const [railOpen, setRailOpen] = useState(true);
  const [section, setSection] = useState('orders');
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState<MPSelectValue | null>('all');
  const [period, setPeriod] = useState<MPDateRange>({ start: null, end: null });
  const [tab, setTab] = useState('open');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [autoRefund, setAutoRefund] = useState(true);
  const snackbar = useMPSnackbar();

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();

    return ORDERS.filter((order) => {
      const matchesChannel = channel === 'all' || order.channel === channel;
      const matchesTab = tab === 'open' ? order.status !== 'refunded' : order.status === 'refunded';
      const matchesTerm =
        term.length === 0 ||
        order.customer.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term);

      return matchesChannel && matchesTab && matchesTerm;
    });
  }, [query, channel, tab]);

  const allOnPage = rows.length > 0 && rows.every((row) => selected.includes(row.id));
  const someOnPage = rows.some((row) => selected.includes(row.id));

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((one) => one !== id) : [...current, id]
    );

  /*
   * Built here rather than at module scope because three of the four cells read
   * state: the header cell is the select-all checkbox, the first cell is the
   * row's own, and the last is a menu that has to know which row it belongs to.
   */
  const columns = useMemo<MPTableColumn<Order>[]>(
    () => [
      {
        key: 'select',
        width: 44,
        // `indeterminate` is the third state a select-all needs and the reason
        // this is a checkbox rather than a toggle: some, all, none.
        label: (
          <MPCheckbox
            size="sm"
            checked={allOnPage}
            indeterminate={!allOnPage && someOnPage}
            onCheckedChange={(next) => setSelected(next ? rows.map((row) => row.id) : [])}
          />
        ),
        render: (row) => (
          <MPCheckbox
            size="sm"
            checked={selected.includes(row.id)}
            onCheckedChange={() => toggle(row.id)}
          />
        )
      },
      { key: 'id', label: 'Order', width: 96 },
      { key: 'customer', label: 'Customer' },
      {
        key: 'status',
        label: 'Status',
        render: (row) => (
          <MPChip size="xs" variant="tonal" color={STATUS_COLOR[row.status]}>
            {row.status}
          </MPChip>
        )
      },
      {
        key: 'total',
        label: 'Total',
        align: 'end',
        render: (row) => money.format(row.total)
      },
      {
        key: 'actions',
        // Empty rather than absent: a header cell with no `label` falls back to
        // the column's key, and "actions" over a column of menus is a word
        // nobody needs to read.
        label: '',
        width: 52,
        align: 'end',
        render: (row) => (
          <MPMenu
            trigger={
              // The trigger carries the row in its label, so every row action
              // has an accessible name that says which row it belongs to.
              <MPIconButton
                size="xs"
                variant="text"
                icon={<MPIcon icon={ICONS.more} />}
                label={`Actions for ${row.id}`}
              />
            }
          >
            <MPMenuItem startIcon={<MPIcon icon={ICONS.copy} size={20} />}>Duplicate</MPMenuItem>
            <MPMenuItem startIcon={<MPIcon icon={ICONS.link} size={20} />}>Copy link</MPMenuItem>
            <MPMenuSeparator />
            <MPMenuItem
              color="error"
              startIcon={<MPIcon icon={ICONS.close} size={20} />}
              onClick={() => snackbar.add({ message: `${row.id} refunded`, actionLabel: 'Undo' })}
            >
              Refund
            </MPMenuItem>
          </MPMenu>
        )
      }
    ],
    [rows, selected, allOnPage, someOnPage, snackbar]
  );

  return (
    <div
      className="bg-mp-surface text-mp-on-surface border-mp-outline-variant rounded-mp-lg overflow-hidden border"
      style={{ position: 'relative', width: '100%' }}
    >
      <header
        className="bg-mp-surface-container border-mp-outline-variant border-b"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px'
        }}
      >
        <MPIconButton
          size="sm"
          variant="text"
          icon={<MPIcon icon={ICONS.more} />}
          label={railOpen ? 'Hide the rail' : 'Show the rail'}
          onClick={() => setRailOpen((current) => !current)}
        />

        <MPBreadcrumb size="sm" style={{ marginInlineEnd: 'auto' }}>
          <MPBreadcrumbItem href="#">Grange</MPBreadcrumbItem>
          <MPBreadcrumbItem>Orders</MPBreadcrumbItem>
        </MPBreadcrumb>

        <MPTooltip content="Two orders need review">
          <MPBadge content={2} color="error">
            <MPIconButton
              size="sm"
              variant="text"
              icon={<MPIcon icon={ICONS.warning} />}
              label="Review queue"
            />
          </MPBadge>
        </MPTooltip>
        <MPAvatar size="sm" name="Mina Park" color="tertiary" />
      </header>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 12, padding: 12 }}>
        <Rail open={railOpen} section={section} onSection={setSection} />

        <div style={{ display: 'grid', gap: 16, flex: 1, minWidth: 0 }}>
          <MPAlert
            size="sm"
            variant="tonal"
            title="Two payouts are on hold"
            action={
              <MPButton size="xs" variant="text">
                Resolve
              </MPButton>
            }
          >
            The bank asked for one more document before the next transfer.
          </MPAlert>

          <div
            style={{
              display: 'grid',
              gap: 10,
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))'
            }}
          >
            <Figure label="Revenue" value="£24.1k" delta={9} />
            <Figure label="Orders" value="318" delta={4} />
            <Figure label="Refund rate" value="1.8%" delta={-3} better="down" />
            <Figure label="Basket" value="£75.80" delta={2} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: '1 1 150px' }}>
              <MPTextField
                size="sm"
                value={query}
                onChange={(next) => {
                  setQuery(next);
                  setPage(1);
                }}
                placeholder="Order or customer"
                startIcon={<MPIcon icon={ICONS.search} size={18} />}
                fullWidth
              />
            </div>
            <div style={{ width: 150 }}>
              <MPSelect
                size="sm"
                items={CHANNELS}
                value={channel}
                onValueChange={setChannel}
                aria-label="Channel"
                fullWidth
              />
            </div>
            <div style={{ width: 190 }}>
              <MPDateRangePicker
                size="sm"
                value={period}
                onValueChange={setPeriod}
                startPlaceholder="From"
                endPlaceholder="To"
                clearable
                fullWidth
              />
            </div>
          </div>

          {/* Only with a selection, and the destructive one confirms first. */}
          {selected.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              <MPPill
                size="sm"
                variant="tonal"
                title={`${selected.length} selected`}
                description="Actions apply to all of them"
              />
              <MPButton
                size="xs"
                variant="outlined"
                onClick={() => snackbar.add({ message: `${selected.length} orders exported` })}
              >
                Export
              </MPButton>
              <MPDialog
                trigger={
                  <MPButton size="xs" variant="text" color="error">
                    Refund
                  </MPButton>
                }
                title={`Refund ${selected.length} orders?`}
                description="The money goes back tonight and the orders stay in the history."
                actions={
                  <>
                    <MPDialogClose render={<MPButton variant="text">Cancel</MPButton>} />
                    <MPDialogClose
                      render={
                        <MPButton
                          color="error"
                          onClick={() => {
                            snackbar.add({
                              message: `${selected.length} orders refunded`,
                              actionLabel: 'Undo'
                            });
                            setSelected([]);
                          }}
                        >
                          Refund
                        </MPButton>
                      }
                    />
                  </>
                }
              />
            </div>
          ) : null}

          <MPTabs
            value={tab}
            onValueChange={(next) => {
              setTab(String(next));
              setSelected([]);
              setPage(1);
            }}
            aria-label="Orders"
            size="sm"
          >
            <MPTab value="open">Open</MPTab>
            <MPTab value="refunded">Refunded</MPTab>

            {['open', 'refunded'].map((value) => (
              <MPTabPanel key={value} value={value}>
                <div style={{ display: 'grid', gap: 12, paddingTop: 12 }}>
                  {rows.length === 0 ? (
                    <MPEmpty
                      size="sm"
                      variant="outlined"
                      title="Nothing matches those filters"
                      action={
                        <MPButton
                          size="sm"
                          variant="tonal"
                          onClick={() => {
                            setQuery('');
                            setChannel('all');
                          }}
                        >
                          Clear filters
                        </MPButton>
                      }
                    >
                      Try a shorter term, or widen the channel.
                    </MPEmpty>
                  ) : (
                    // The rows have their own menu; the table has one for the
                    // whole selection, opened by a right-click or a long press.
                    <MPContextMenu
                      content={
                        <>
                          <MPMenuItem onClick={() => setSelected(rows.map((row) => row.id))}>
                            Select everything here
                          </MPMenuItem>
                          <MPMenuItem onClick={() => setSelected([])}>Clear selection</MPMenuItem>
                          <MPMenuSeparator />
                          <MPMenuItem
                            onClick={() => snackbar.add({ message: 'Exported as CSV' })}
                            startIcon={<MPIcon icon={ICONS.upload} size={20} />}
                          >
                            Export as CSV
                          </MPMenuItem>
                        </>
                      }
                    >
                      <MPTable
                        headers={columns}
                        items={rows}
                        getRowKey={(row) => row.id}
                        size="sm"
                        hoverable
                        stickyHeader
                      />
                    </MPContextMenu>
                  )}

                  <MPPagination
                    count={5}
                    page={page}
                    onPageChange={setPage}
                    size="sm"
                    style={{ justifyContent: 'center' }}
                  />
                </div>
              </MPTabPanel>
            ))}
          </MPTabs>

          {/* What is low, what happened, and what is set — the three panels
              every console ends with. The split is resizable because the reader
              decides which of the two they are reading. */}
          <div
            className="border-mp-outline-variant rounded-mp-md overflow-hidden border"
            style={{ height: 210 }}
          >
            <MPPanes>
              <MPPane defaultSize="45%" minSize="30%">
                <div style={{ display: 'grid', gap: 10, padding: 12 }}>
                  <MPTypography level="overline" color="secondary">
                    Running low
                  </MPTypography>
                  <MPProgressBox size="sm" value={20} count={5} label="Oat milk" />
                  <MPProgressBox size="sm" value={60} count={5} label="House blend" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MPProgressCircular size="sm" value={72} showValue />
                    <span className="text-mp-body-small text-mp-on-surface-variant">
                      of this month&rsquo;s target
                    </span>
                  </div>
                </div>
              </MPPane>

              <MPPane minSize="30%">
                <div style={{ display: 'grid', gap: 10, padding: 12 }}>
                  <MPTypography level="overline" color="secondary">
                    Today
                  </MPTypography>
                  <MPTimeline size="sm" active={1}>
                    <MPTimelineItem title="Payout sent" meta="09:02" bullet="1" />
                    <MPTimelineItem title="Two orders held" meta="11:20" bullet="2" />
                    <MPTimelineItem
                      title="Restock due"
                      meta="17:00"
                      bullet="3"
                      connector="dashed"
                    />
                  </MPTimeline>
                  <MPSwitch
                    size="sm"
                    label="Refund automatically under £20"
                    checked={autoRefund}
                    onCheckedChange={setAutoRefund}
                    fullWidth
                  />
                </div>
              </MPPane>
            </MPPanes>
          </div>
        </div>
      </div>

      {/* `position="absolute"` pins the button to this sheet rather than to the
          window, which is what makes a FAB usable inside a preview. */}
      <MPFloatingActionButton
        position="absolute"
        corner="bottom-end"
        size="sm"
        icon={<MPIcon icon={ICONS.add} />}
        label="New order"
        onClick={() => snackbar.add({ message: 'Draft order started' })}
      />
    </div>
  );
}

export default function DashboardConcept() {
  return (
    <MPSnackbarProvider position="bottom-center">
      <Screen />
    </MPSnackbarProvider>
  );
}
