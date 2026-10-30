import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class SnackbarHero extends StatelessWidget {
  const SnackbarHero({super.key});

  @override
  Widget build(BuildContext context) {
    // The stack is drawn over what the provider wraps, which in an app is the
    // whole app. Here it is the preview, given room for a message to land in.
    return const SizedBox(
      width: double.infinity,
      height: 200,
      child: MPSnackbarProvider(
        child: Align(alignment: AlignmentDirectional.topStart, child: _Actions()),
      ),
    );
  }
}

/// The call site stays the one thing it should be: what happened. Everything
/// about how the message looks (where the stack sits, how wide it is, how long
/// it lasts) was decided once on the provider.
class _Actions extends StatelessWidget {
  const _Actions();

  @override
  Widget build(BuildContext context) {
    final MPSnackbarController snackbar = MPSnackbarProvider.of(context);

    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: <Widget>[
        MPButton(
          size: MPSize.sm,
          onPressed: () => snackbar.add(const MPSnackbarOptions(message: Text('Draft saved'))),
          child: const Text('Save'),
        ),
        MPButton(
          size: MPSize.sm,
          variant: MPVariant.outlined,
          onPressed: () => snackbar.add(
            MPSnackbarOptions(
              message: const Text('Message archived'),
              actionLabel: const Text('Undo'),
              onAction: () =>
                  snackbar.add(const MPSnackbarOptions(message: Text('Message restored'))),
            ),
          ),
          child: const Text('Archive'),
        ),
      ],
    );
  }
}
