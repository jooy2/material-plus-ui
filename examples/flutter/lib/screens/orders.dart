import 'package:flutter/widgets.dart';
import 'package:material_plus_showcase/app/page.dart';
import 'package:material_plus_showcase/data/sample.dart';
import 'package:material_plus_ui/material_plus_ui.dart';
import 'package:material_plus_ui_example/demos/glyphs.dart';

const Map<OrderStatus, MPColor> _statusColors = <OrderStatus, MPColor>{
  OrderStatus.paid: MPColor.primary,
  OrderStatus.pending: MPColor.secondary,
  OrderStatus.overdue: MPColor.error,
  OrderStatus.refunded: MPColor.tertiary,
};

/// The orders in a table, filtered from a drawer, each with a menu of actions.
class OrdersScreen extends StatefulWidget {
  /// Creates the screen.
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final List<Order> _orders = List<Order>.of(orders);
  final Set<OrderStatus> _shown = <OrderStatus>{};
  bool _filtersOpen = false;

  List<Order> get _visible {
    return _shown.isEmpty
        ? _orders
        : _orders.where((Order one) => _shown.contains(one.status)).toList();
  }

  Future<void> _delete(Order order) async {
    final bool sure = await MPConfirmProvider.of(context).confirm(
      MPConfirmOptions(
        title: Text('Delete ${order.id}?'),
        description: Text('${order.customer} will not be told. You can undo this for a moment.'),
        confirmLabel: const Text('Delete'),
        color: MPColor.error,
      ),
    );

    if (!sure || !mounted) {
      return;
    }

    final int at = _orders.indexOf(order);

    setState(() => _orders.remove(order));
    MPSnackbarProvider.of(context).add(
      MPSnackbarOptions(
        message: Text('Deleted ${order.id}'),
        actionLabel: const Text('Undo'),
        onAction: () => setState(() => _orders.insert(at, order)),
      ),
    );
  }

  List<MPDataTableColumn<Order>> _columns() {
    return <MPDataTableColumn<Order>>[
      MPDataTableColumn<Order>(
        key: 'id',
        label: const Text('Invoice'),
        width: 110,
        value: (Order row) => row.id,
      ),
      MPDataTableColumn<Order>(
        key: 'customer',
        label: const Text('Customer'),
        width: 170,
        value: (Order row) => row.customer,
      ),
      MPDataTableColumn<Order>(
        key: 'amount',
        label: const Text('Amount'),
        width: 110,
        align: MPAlign.end,
        value: (Order row) => row.amount,
        render: (Order row, int index) => Text(pounds(row.amount)),
      ),
      MPDataTableColumn<Order>(
        key: 'status',
        label: const Text('Status'),
        width: 120,
        value: (Order row) => row.status.index,
        render: (Order row, int index) => Align(
          alignment: AlignmentDirectional.centerStart,
          child: MPChip(
            size: MPSize.xs,
            variant: MPVariant.tonal,
            color: _statusColors[row.status],
            child: Text(row.status.label),
          ),
        ),
      ),
      MPDataTableColumn<Order>(
        key: 'actions',
        width: 64,
        sortable: false,
        searchable: false,
        exportable: false,
        render: (Order row, int index) => MPMenu(
          semanticLabel: 'Actions for ${row.id}',
          align: MPAlign.end,
          trigger: (BuildContext context, VoidCallback open, bool isOpen) => MPIconButton(
            label: 'Actions for ${row.id}',
            size: MPSize.sm,
            variant: MPVariant.text,
            onPressed: open,
            icon: const MPIcon(icon: MoreGlyph()),
          ),
          items: <MPMenuEntry>[
            MPMenuItem(label: 'Send a reminder', onPressed: () {}),
            MPMenuItem(label: 'Download', onPressed: () {}),
            const MPMenuSeparator(),
            MPMenuItem(label: 'Delete', color: MPColor.error, onPressed: () => _delete(row)),
          ],
        ),
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final List<Order> visible = _visible;
    final int total = visible.fold(0, (int sum, Order one) => sum + one.amount);

    return Stack(
      children: <Widget>[
        Positioned.fill(
          child: ScreenScroll(
            title: 'Orders',
            subtitle: '${visible.length} shown',
            action: MPButton(
              variant: MPVariant.tonal,
              onPressed: () => setState(() => _filtersOpen = true),
              child: const Text('Filters'),
            ),
            children: <Widget>[
              if (_shown.isNotEmpty)
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: <Widget>[
                    for (final OrderStatus status in _shown)
                      MPChip(
                        variant: MPVariant.tonal,
                        onDelete: () => setState(() => _shown.remove(status)),
                        child: Text(status.label),
                      ),
                  ],
                ),
              MPDataList(
                dividers: true,
                children: <MPDataListItem>[
                  MPDataListItem(label: const Text('Total'), child: Text(pounds(total))),
                  MPDataListItem(
                    label: const Text('Overdue'),
                    child: Text(
                      '${visible.where((Order one) => one.status == OrderStatus.overdue).length}',
                    ),
                  ),
                ],
              ),
              MPDataTable<Order>(
                headers: _columns(),
                items: visible,
                getRowKey: (Order row, int index) => row.id,
                caption: const Text('Orders raised in October'),
                sortable: true,
                searchable: true,
                paged: true,
                initialPageSize: 10,
                pageSizeOptions: const <int>[10, 25],
                striped: true,
              ),
            ],
          ),
        ),
        MPDrawer(
          side: MPSide.right,
          open: _filtersOpen,
          onOpenChange: (bool next) => setState(() => _filtersOpen = next),
          title: const Text('Filters'),
          description: const Text('Show orders that are:'),
          actions: <Widget>[
            MPDrawerClose(
              builder: (BuildContext context, VoidCallback close) =>
                  MPButton(onPressed: close, child: const Text('Done')),
            ),
          ],
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            spacing: 8,
            children: <Widget>[
              for (final OrderStatus status in OrderStatus.values)
                MPCheckbox(
                  checked: _shown.contains(status),
                  onChanged: (bool next) => setState(() {
                    if (next) {
                      _shown.add(status);
                    } else {
                      _shown.remove(status);
                    }
                  }),
                  label: Text(status.label),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
