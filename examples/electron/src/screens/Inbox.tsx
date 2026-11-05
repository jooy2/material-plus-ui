import { useMemo, useState } from 'react';
import {
  ICONS,
  MPAvatar,
  MPBadge,
  MPButton,
  MPChatBubble,
  MPChip,
  MPDivider,
  MPEmpty,
  MPIcon,
  MPIconButton,
  MPList,
  MPListItem,
  MPTextField,
  MPToolbar,
  MPTooltip,
  MPTypography
} from 'material-plus-ui';

interface Conversation {
  id: string;
  name: string;
  image?: string;
  subject: string;
  message: string;
  time: string;
  unread: number;
}

const conversations: Conversation[] = [
  {
    id: 'nadia',
    name: 'Nadia Rowan',
    image: '/samples/people/nadia-rowan.webp',
    subject: 'Autumn release',
    message: 'The new tonal buttons are in. Could you check them in the dark scheme before Friday?',
    time: '09:12',
    unread: 3
  },
  {
    id: 'theo',
    name: 'Theo Quinn',
    image: '/samples/people/theo-quinn.webp',
    subject: 'Invoice 2041',
    message: 'Paid in full, thank you. The receipt is attached to the order.',
    time: '08:47',
    unread: 0
  },
  {
    id: 'anya',
    name: 'Anya Sol',
    image: '/samples/people/anya-sol.webp',
    subject: 'Design review',
    message: 'Can we move the review to Thursday afternoon?',
    time: 'Mon',
    unread: 1
  },
  {
    id: 'sam',
    name: 'Sam Arden',
    subject: 'On-call rota',
    message: 'I can take the weekend if someone covers Monday.',
    time: 'Sat',
    unread: 0
  }
];

/** Two panes: the conversations, and the one that is open with a reply under it. */
export function Inbox() {
  const [query, setQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [openId, setOpenId] = useState(conversations[0].id);
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<Record<string, string[]>>({});

  const found = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return conversations.filter((one) => {
      const matches =
        needle === '' ||
        one.name.toLowerCase().includes(needle) ||
        one.subject.toLowerCase().includes(needle);

      return matches && (!unreadOnly || one.unread > 0);
    });
  }, [query, unreadOnly]);

  const open = conversations.find((one) => one.id === openId)!;
  const replies = sent[openId] ?? [];

  const send = () => {
    const text = draft.trim();

    if (text) {
      setSent((all) => ({ ...all, [openId]: [...(all[openId] ?? []), text] }));
      setDraft('');
    }
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-[20rem_1fr] gap-4">
      <div className="flex min-h-0 flex-col gap-3">
        <MPTextField
          fullWidth
          type="search"
          aria-label="Search"
          placeholder="Search people and subjects"
          startIcon={<MPIcon icon={ICONS.search} size={18} />}
          value={query}
          onChange={setQuery}
        />
        <div className="flex gap-2">
          <MPChip selected={!unreadOnly} onClick={() => setUnreadOnly(false)}>
            All
          </MPChip>
          <MPChip selected={unreadOnly} onClick={() => setUnreadOnly(true)}>
            Unread
          </MPChip>
        </div>
        {found.length === 0 ? (
          <MPEmpty
            variant="outlined"
            title="Nothing found"
            action={
              <MPButton size="sm" variant="tonal" onClick={() => setQuery('')}>
                Clear the search
              </MPButton>
            }
          >
            Try another name or subject.
          </MPEmpty>
        ) : (
          <MPList dividers className="min-h-0 overflow-auto">
            {found.map((one) => (
              <MPListItem
                key={one.id}
                selected={one.id === openId}
                onClick={() => setOpenId(one.id)}
                startIcon={<MPAvatar size="sm" name={one.name} src={one.image} />}
                description={one.subject}
                endIcon={
                  one.unread > 0 ? (
                    <MPBadge content={one.unread} label={`${one.unread} unread`} />
                  ) : (
                    <MPTypography level="caption">{one.time}</MPTypography>
                  )
                }
              >
                {one.name}
              </MPListItem>
            ))}
          </MPList>
        )}
      </div>

      <section aria-label="Conversation" className="flex min-h-0 flex-col gap-3">
        <MPToolbar
          size="sm"
          divider
          start={<MPAvatar size="sm" name={open.name} src={open.image} />}
          end={
            <MPTooltip content="Archive">
              <MPIconButton
                variant="text"
                size="sm"
                label="Archive"
                icon={<MPIcon icon={ICONS.check} />}
              />
            </MPTooltip>
          }
        >
          <MPTypography level="h6">{open.subject}</MPTypography>
        </MPToolbar>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
          <MPChatBubble
            name={open.name}
            time={open.time}
            avatar={<MPAvatar size="sm" name={open.name} src={open.image} />}
          >
            {open.message}
          </MPChatBubble>
          {replies.map((text, index) => (
            <MPChatBubble key={index} side="end" variant="filled" status="sent">
              {text}
            </MPChatBubble>
          ))}
        </div>
        <MPDivider />
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <MPTextField
            fullWidth
            aria-label="Reply"
            placeholder="Write a reply"
            value={draft}
            onChange={setDraft}
          />
          <MPButton type="submit">Send</MPButton>
        </form>
      </section>
    </div>
  );
}
