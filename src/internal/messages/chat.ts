import type { MPNamespace } from '../i18n';

/** `MPChatBubble`'s delivery states — see `MPMessages['chat']`. */
export const CHAT: MPNamespace<'chat'> = {
  name: 'chat',
  en: {
    sending: 'Sending',
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Read',
    failed: 'Not sent',
    typing: 'Typing'
  }
};
