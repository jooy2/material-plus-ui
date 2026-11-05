import 'package:flutter/widgets.dart';
import 'package:material_plus_showcase/app/page.dart';
import 'package:material_plus_showcase/data/sample.dart';
import 'package:material_plus_ui/material_plus_ui.dart';
import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/glyphs_controls.dart';

const List<MPCommand> _commands = <MPCommand>[
  MPCommand(value: 'new', label: 'New project', group: 'Create', shortcut: 'Mod+N'),
  MPCommand(value: 'invite', label: 'Invite a colleague', group: 'Create'),
  MPCommand(value: 'orders', label: 'Go to orders', group: 'Go to'),
  MPCommand(value: 'settings', label: 'Open the settings', group: 'Go to'),
  MPCommand(
    value: 'theme',
    label: 'Switch the theme',
    group: 'Appearance',
    keywords: <String>['dark'],
  ),
];

/// Every kind of surface that opens over the screen, one button each.
class OverlaysScreen extends StatefulWidget {
  /// Creates the screen.
  const OverlaysScreen({super.key});

  @override
  State<OverlaysScreen> createState() => _OverlaysScreenState();
}

class _OverlaysScreenState extends State<OverlaysScreen> {
  final GlobalKey _tourStart = GlobalKey();
  final GlobalKey _tourEnd = GlobalKey();

  String _project = 'Aurora';
  bool _palette = false;
  bool _hover = false;
  bool _tour = false;
  String? _said;

  void _say(String text) {
    setState(() => _said = text);
  }

  Widget _closeButton(String label, {bool primary = false}) {
    return MPDialogClose(
      builder: (BuildContext context, VoidCallback close) => MPButton(
        variant: primary ? MPVariant.filled : MPVariant.text,
        onPressed: close,
        child: Text(label),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final EdgeInsets safe = MediaQuery.paddingOf(context);

    // The palette and the tour are beside the list rather than in it: a list
    // builds only what is near the screen, and a layer that was never built
    // cannot open, however its `open` is set.
    return PushedScreen(
      title: 'Overlays',
      child: Stack(
        children: <Widget>[
          Positioned.fill(child: _list(context, safe)),
          MPCommandPalette(
            items: _commands,
            open: _palette,
            onOpenChange: (bool next) => setState(() => _palette = next),
            onSelect: (MPCommand command) => _say('Ran: ${command.label}'),
          ),
          MPTour(
            open: _tour,
            onOpenChange: (bool next) => setState(() => _tour = next),
            steps: <MPTourStep>[
              const MPTourStep(
                title: Text('Overlays'),
                content: Text('Each button opens one kind of surface.'),
              ),
              MPTourStep(
                target: _tourStart,
                title: const Text('This tour'),
                content: const Text('A tour points at things on the screen, one at a time.'),
              ),
              MPTourStep(
                target: _tourEnd,
                title: const Text('Hover card'),
                content: const Text('On a phone it opens from a button rather than a pointer.'),
                side: MPSide.top,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _list(BuildContext context, EdgeInsets safe) {
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 8, 16, safe.bottom + 24),
      children: <Widget>[
        if (_said != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: MPAlert(child: Text(_said!)),
          ),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: <Widget>[
            MPDialog(
              trigger: (BuildContext context, VoidCallback open) =>
                  MPButton(variant: MPVariant.tonal, onPressed: open, child: const Text('Dialog')),
              title: const Text('Rename project'),
              description: const Text('Everyone on the project sees the new name.'),
              actions: <Widget>[_closeButton('Cancel'), _closeButton('Save', primary: true)],
              child: MPTextField(
                label: const Text('Name'),
                value: _project,
                onChanged: (String next) => setState(() => _project = next),
                fullWidth: true,
              ),
            ),
            MPDialog(
              fullScreen: true,
              trigger: (BuildContext context, VoidCallback open) => MPButton(
                variant: MPVariant.tonal,
                onPressed: open,
                child: const Text('Full-screen dialog'),
              ),
              title: const Text('Terms'),
              actions: <Widget>[_closeButton('Accept', primary: true)],
              child: const Text(
                'These terms cover the sample shop in this app. Nothing is sold, nothing is '
                'stored, and closing the app forgets everything you did in it.',
              ),
            ),
            MPDrawer(
              side: MPSide.bottom,
              trigger: (BuildContext context, VoidCallback open) => MPButton(
                variant: MPVariant.tonal,
                onPressed: open,
                child: const Text('Bottom drawer'),
              ),
              title: const Text('Share'),
              child: MPList(
                variant: MPVariant.text,
                children: <Widget>[
                  MPListItem(
                    startIcon: const MPIcon(icon: CopyGlyph()),
                    onPressed: () {},
                    child: const Text('Copy the link'),
                  ),
                  MPListItem(
                    startIcon: const MPIcon(icon: ShareGlyph()),
                    onPressed: () {},
                    child: const Text('Send to a colleague'),
                  ),
                ],
              ),
            ),
            MPDrawer(
              side: MPSide.left,
              trigger: (BuildContext context, VoidCallback open) => MPButton(
                variant: MPVariant.tonal,
                onPressed: open,
                child: const Text('Side drawer'),
              ),
              title: const Text('Projects'),
              description: const Text('Pick one to open'),
              child: MPTreeView(
                variant: MPVariant.text,
                initialExpanded: const <Object>['shop'],
                children: const <MPTreeItem>[
                  MPTreeItem(
                    value: 'shop',
                    label: Text('Shop'),
                    children: <MPTreeItem>[
                      MPTreeItem(value: 'orders', label: Text('Orders')),
                      MPTreeItem(value: 'stock', label: Text('Stock')),
                    ],
                  ),
                  MPTreeItem(value: 'blog', label: Text('Blog')),
                ],
              ),
            ),
            MPPopover(
              trigger: (BuildContext context, VoidCallback toggle) => MPButton(
                variant: MPVariant.tonal,
                onPressed: toggle,
                child: const Text('Popover'),
              ),
              title: const Text('Effective rate'),
              showClose: true,
              child: const Text('The rate after fees, for the period you picked.'),
            ),
            MPMenu(
              trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
                  MPButton(variant: MPVariant.tonal, onPressed: open, child: const Text('Menu')),
              items: <MPMenuEntry>[
                MPMenuItem(label: 'Cut', shortcut: '⌘X', onPressed: () => _say('Cut')),
                MPMenuItem(label: 'Copy', shortcut: '⌘C', onPressed: () => _say('Copied')),
                MPMenuItem(label: 'Paste', shortcut: '⌘V', onPressed: () => _say('Pasted')),
              ],
            ),
            MPButton(
              variant: MPVariant.tonal,
              onPressed: () => setState(() => _palette = true),
              child: const Text('Command palette'),
            ),
            MPButton(
              variant: MPVariant.tonal,
              onPressed: () async {
                final bool sure = await MPConfirmProvider.of(context).confirm(
                  const MPConfirmOptions(
                    title: Text('Delete this project?'),
                    description: Text('Its orders and files go with it.'),
                    confirmLabel: Text('Delete'),
                    color: MPColor.error,
                  ),
                );

                _say(sure ? 'Deleted' : 'Kept');
              },
              child: const Text('Confirm'),
            ),
            MPPopconfirm(
              trigger: (BuildContext context, VoidCallback toggle) => MPButton(
                variant: MPVariant.tonal,
                onPressed: toggle,
                child: const Text('Popconfirm'),
              ),
              title: const Text('Archive this board?'),
              onConfirm: () => _say('Archived'),
            ),
            MPButton(
              variant: MPVariant.tonal,
              onPressed: () {
                MPSnackbarProvider.of(context).add(
                  MPSnackbarOptions(
                    message: const Text('Your changes are live.'),
                    actionLabel: const Text('View'),
                    onAction: () => _say('Viewed'),
                  ),
                );
              },
              child: const Text('Snackbar'),
            ),
            MPTooltip(
              content: const Text('Saved two minutes ago'),
              child: MPButton(
                variant: MPVariant.tonal,
                onPressed: () {},
                child: const Text('Tooltip'),
              ),
            ),
            MPButton(
              key: _tourStart,
              variant: MPVariant.tonal,
              onPressed: () => setState(() => _tour = true),
              child: const Text('Tour'),
            ),
          ],
        ),
        const SizedBox(height: 24),
        MPCard(
          title: const Text('Hover card'),
          subtitle: const Text('Press the button, or hold the pointer over the face.'),
          child: Row(
            spacing: 16,
            children: <Widget>[
              MPHoverCard(
                open: _hover,
                onOpenChange: (bool next) => setState(() => _hover = next),
                title: Text(people[0].name),
                description: Text(people[0].role),
                trigger: MPAvatar(name: people[0].name, image: people[0].image),
              ),
              MPButton(
                key: _tourEnd,
                variant: MPVariant.outlined,
                onPressed: () => setState(() => _hover = !_hover),
                child: const Text('Show the card'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        const MPTypography('Icons used here', level: MPTypographyLevel.overline),
        const Row(
          spacing: 12,
          children: <Widget>[
            MPIcon(icon: StarGlyph(), label: 'Star'),
            MPIcon(icon: HeartGlyph(), label: 'Heart'),
            MPIcon(icon: BoltGlyph(), label: 'Bolt'),
          ],
        ),
      ],
    );
  }
}
