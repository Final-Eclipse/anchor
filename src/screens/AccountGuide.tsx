/**
 * ─── LANE C (content) + whoever has spare time to render it ──────────────────
 * How to open an account that stays hers. Delete this placeholder and build it.
 *
 * This screen does NOT open accounts. Opening a bank account is regulated, and
 * wiring up a banking API would send her data off the device, which breaks the
 * first rule of this project. It's a guide. That's the honest scope, and it's
 * still genuinely useful.
 *
 * The moves that actually work, and belong in the content:
 *   · An institution her partner doesn't bank with
 *   · Paperless statements only
 *   · A new email address he doesn't know about
 *   · A phone number that isn't the shared one, for verification codes
 *   · A mailing address that isn't home
 *
 * Then — and this is the part that makes it trustworthy — name what can still
 * expose the account anyway: a joint tax return, a credit report he pulls, a
 * shared family plan that lists her devices. Being straight about the limits is
 * the feature. Anything that promises safety it can't deliver is worse than
 * saying nothing.
 *
 * Not financial or legal advice, and the screen should say so plainly, pointing
 * to legal aid in the directory.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { StyleSheet, Text } from 'react-native';
import { Screen } from '../components/Screen';
import { app, space, type } from '../theme';

export default function AccountGuide() {
  return (
    <Screen title="An account of your own" subtitle="What makes one stay private.">
      <Text style={styles.todo}>
        Content needed — Lane C writes it, anyone can render it. The comment at the top
        of this file lists what goes in, including the limits we have to be honest about.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  todo: {
    ...type.body,
    color: app.subtle,
    backgroundColor: app.surface,
    padding: space.md,
    borderRadius: 10,
  },
});
