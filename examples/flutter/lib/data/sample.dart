import 'package:flutter/widgets.dart';

/// A person the sample data talks about. Everyone here is fictional.
@immutable
class Person {
  /// Creates a person.
  const Person(this.name, this.role, [this.picture]);

  /// The full name.
  final String name;

  /// What they do.
  final String role;

  /// The file under `assets/images/`, when there is a portrait.
  final String? picture;

  /// The portrait, when there is one.
  ImageProvider? get image => picture == null ? null : AssetImage('assets/images/$picture');
}

/// The people in the inbox and the orders.
const List<Person> people = <Person>[
  Person('Nadia Rowan', 'Design lead', 'nadia-rowan.webp'),
  Person('Theo Quinn', 'Finance', 'theo-quinn.webp'),
  Person('Anya Sol', 'Engineering', 'anya-sol.webp'),
  Person('Lucas Adebayo', 'Support', 'lucas-adebayo.webp'),
  Person('Noa Marin', 'Marketing', 'noa-marin.webp'),
  Person('Farah Wells', 'Operations', 'farah-wells.webp'),
  Person('Joon Mercer', 'Sales'),
];

/// One message in a conversation.
@immutable
class Message {
  /// Creates a message.
  const Message(this.text, {required this.time, this.mine = false});

  /// What was said.
  final String text;

  /// When, as shown.
  final String time;

  /// Whether the reader sent it.
  final bool mine;
}

/// A conversation in the inbox.
@immutable
class Conversation {
  /// Creates a conversation.
  const Conversation({
    required this.person,
    required this.subject,
    required this.time,
    required this.messages,
    this.unread = 0,
  });

  /// Who it is with.
  final Person person;

  /// What it is about.
  final String subject;

  /// When the last message came, as shown.
  final String time;

  /// What was said, oldest first.
  final List<Message> messages;

  /// How many messages are unread.
  final int unread;

  /// The last line, for the list.
  String get preview => messages.last.text;
}

/// The inbox.
final List<Conversation> conversations = <Conversation>[
  Conversation(
    person: people[0],
    subject: 'Review of the onboarding screens',
    time: '09:41',
    unread: 2,
    messages: const <Message>[
      Message('The new onboarding screens are ready for a look.', time: '09:12'),
      Message('Great, I will go through them before lunch.', time: '09:20', mine: true),
      Message('Could you check the empty states on a small phone too?', time: '09:41'),
    ],
  ),
  Conversation(
    person: people[1],
    subject: 'Invoice for October',
    time: '08:15',
    unread: 1,
    messages: const <Message>[
      Message('The October invoice is attached. It is due on the 30th.', time: '08:15'),
    ],
  ),
  Conversation(
    person: people[2],
    subject: 'Release 2.4 is out',
    time: 'Yesterday',
    messages: const <Message>[
      Message('Release 2.4 went out this morning.', time: 'Yesterday'),
      Message('Nice work. Any issues so far?', time: 'Yesterday', mine: true),
      Message('Two small ones, both fixed on main.', time: 'Yesterday'),
    ],
  ),
  Conversation(
    person: people[3],
    subject: 'Customer asked about refunds',
    time: 'Mon',
    messages: const <Message>[
      Message('A customer wants to know how long a refund takes.', time: 'Mon'),
    ],
  ),
  Conversation(
    person: people[4],
    subject: 'Campaign photos',
    time: 'Sun',
    messages: const <Message>[
      Message('The photos from the shoot are in the shared folder.', time: 'Sun'),
    ],
  ),
  Conversation(
    person: people[5],
    subject: 'Office move on Friday',
    time: 'Fri',
    messages: const <Message>[
      Message('Remember to pack your desk by Thursday evening.', time: 'Fri'),
    ],
  ),
];

/// Where an order stands.
enum OrderStatus {
  /// Paid in full.
  paid('Paid'),

  /// Sent and waiting for payment.
  pending('Pending'),

  /// Past its due date.
  overdue('Overdue'),

  /// Paid and given back.
  refunded('Refunded');

  const OrderStatus(this.label);

  /// The word shown for it.
  final String label;
}

/// An order on the Orders screen.
@immutable
class Order {
  /// Creates an order.
  const Order({
    required this.id,
    required this.customer,
    required this.amount,
    required this.status,
    required this.day,
  });

  /// The invoice number.
  final String id;

  /// Who it is for.
  final String customer;

  /// What it is for, in pounds.
  final int amount;

  /// Where it stands.
  final OrderStatus status;

  /// The day of October it was raised.
  final int day;
}

const List<String> _customers = <String>[
  'Harbour & Co',
  'Northwind Studio',
  'Bluebell Bakery',
  'Atlas Freight',
  'Kestrel Labs',
  'Juniper Hotels',
];

const List<OrderStatus> _cycle = <OrderStatus>[
  OrderStatus.paid,
  OrderStatus.pending,
  OrderStatus.paid,
  OrderStatus.overdue,
  OrderStatus.paid,
  OrderStatus.refunded,
];

/// Twenty-three orders, so a filter has something to take away.
final List<Order> orders = <Order>[
  for (int index = 0; index < 23; index += 1)
    Order(
      id: 'INV-${(101 + index).toString().padLeft(4, '0')}',
      customer: _customers[index % _customers.length],
      amount: 180 + (index * 137) % 2400,
      status: _cycle[index % _cycle.length],
      day: 1 + (index * 3) % 28,
    ),
];

/// Formats [amount] in pounds with a separator, as `£1,240`.
String pounds(num amount) {
  final String digits = amount.round().abs().toString();
  final StringBuffer out = StringBuffer(amount < 0 ? '-£' : '£');

  for (int index = 0; index < digits.length; index += 1) {
    if (index > 0 && (digits.length - index) % 3 == 0) {
      out.write(',');
    }

    out.write(digits[index]);
  }

  return out.toString();
}
