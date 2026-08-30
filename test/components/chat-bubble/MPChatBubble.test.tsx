import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPChatBubble, MPLocaleProvider } from 'material-plus-ui';

describe('MPChatBubble', () => {
  describe('rendering', () => {
    it('renders the message it was handed', async () => {
      const screen = await render(<MPChatBubble>See you at six.</MPChatBubble>);

      await expect.element(screen.getByText('See you at six.')).toBeInTheDocument();
    });

    it('renders the sender and the time above it', async () => {
      const screen = await render(
        <MPChatBubble name="Ada" time="18:02">
          See you at six.
        </MPChatBubble>
      );

      await expect.element(screen.getByText('Ada')).toBeInTheDocument();
      await expect.element(screen.getByText('18:02')).toBeInTheDocument();
    });

    it('publishes the rung, the variant and the side it was drawn at', async () => {
      const screen = await render(
        <MPChatBubble size="sm" variant="filled" side="end">
          Mine
        </MPChatBubble>
      );
      const root = screen.container.querySelector('.mp-chat-bubble');

      expect(root).toHaveAttribute('data-mp-size', 'sm');
      expect(root).toHaveAttribute('data-mp-variant', 'filled');
      expect(root).toHaveAttribute('data-mp-side', 'end');
    });

    it('cuts the corner nearest the speaker, on the logical side', async () => {
      // A thread in Arabic squares the other corner without being told, which is
      // why these are the logical corners rather than `rounded-tl`.
      const start = await render(<MPChatBubble>Theirs</MPChatBubble>);
      const sheet = start.container.querySelector('.mp-chat-bubble__sheet')!;

      expect(sheet.className).toContain('border-start-start-radius');
    });

    it('runs the row the other way for the reading end', async () => {
      const screen = await render(<MPChatBubble side="end">Mine</MPChatBubble>);

      expect(screen.container.querySelector('.mp-chat-bubble')!.className).toContain(
        'flex-row-reverse'
      );
    });
  });

  describe('the delivery mark', () => {
    it('draws nothing when there is no status', async () => {
      // A received message has no delivery state worth showing.
      const screen = await render(<MPChatBubble>Theirs</MPChatBubble>);

      expect(screen.container.querySelectorAll('svg')).toHaveLength(0);
    });

    it('draws a mark and reads it out as a word', async () => {
      const screen = await render(<MPChatBubble status="read">Mine</MPChatBubble>);

      await expect.element(screen.getByText('Read')).toBeInTheDocument();
    });

    it('says it in the locale it was given', async () => {
      const screen = await render(
        <MPChatBubble status="delivered" locale="ko">
          내 메시지
        </MPChatBubble>
      );

      await expect.element(screen.getByText('전달됨')).toBeInTheDocument();
    });

    it('follows a provider when it has no locale of its own', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ja">
          <MPChatBubble status="failed">送れませんでした</MPChatBubble>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByText('送信できませんでした')).toBeInTheDocument();
    });

    it('takes a word of its own', async () => {
      const screen = await render(
        <MPChatBubble status="sent" statusLabel="Left your phone">
          Mine
        </MPChatBubble>
      );

      await expect.element(screen.getByText('Left your phone')).toBeInTheDocument();
    });

    it('colours only the two steps that mean something', async () => {
      // `read` and `failed`. A thread where every message is marked in colour is
      // a thread where the colour has stopped meaning anything.
      const screen = await render(
        <div>
          {(['sending', 'sent', 'delivered', 'read', 'failed'] as const).map((status) => (
            <MPChatBubble key={status} status={status} className={`row-${status}`}>
              {status}
            </MPChatBubble>
          ))}
        </div>
      );
      const markOf = (status: string) =>
        screen.container.querySelector(`.row-${status} [class*="text-"]`);

      for (const status of ['sending', 'sent', 'delivered']) {
        expect(screen.container.querySelector(`.row-${status}`)!.innerHTML, status).toContain(
          'text-mp-on-surface-variant'
        );
      }

      expect(markOf('read')).not.toBeNull();
      expect(screen.container.querySelector('.row-read')!.innerHTML).toContain('--_mp-accent');
      expect(screen.container.querySelector('.row-failed')!.innerHTML).toContain('text-mp-error');
    });
  });

  describe('typing', () => {
    it('draws the dots instead of the message, and announces them', async () => {
      const screen = await render(<MPChatBubble typing>Not this yet.</MPChatBubble>);

      expect(screen.container.textContent).not.toContain('Not this yet.');
      await expect.element(screen.getByRole('status')).toBeInTheDocument();
      await expect.element(screen.getByText('Typing')).toBeInTheDocument();
    });

    it('gives every dot its own place in the wave', async () => {
      const screen = await render(<MPChatBubble typing />);
      const dots = [...screen.container.querySelectorAll('.mp-chat-typing')];

      expect(dots).toHaveLength(3);
      expect(dots.map((dot) => (dot as HTMLElement).style.getPropertyValue('--_mp-index'))).toEqual(
        ['0', '1', '2']
      );
    });
  });

  describe('the slots', () => {
    it('draws media edge to edge above the text', async () => {
      const screen = await render(
        <MPChatBubble media={<img src="/logo.png" alt="" />}>A photograph</MPChatBubble>
      );
      const sheet = screen.container.querySelector('.mp-chat-bubble__sheet')!;

      expect(sheet.className).toContain('overflow-hidden');
      expect(sheet.querySelector('img')).not.toBeNull();
    });

    it('unfurls a link into a card under the text', async () => {
      const screen = await render(
        <MPChatBubble
          preview={{
            url: 'https://example.com/article',
            title: 'The article',
            description: 'What it says',
            site: 'example.com'
          }}
        >
          Have a look
        </MPChatBubble>
      );
      const link = screen.container.querySelector('a')!;

      expect(link).toHaveAttribute('href', 'https://example.com/article');
      expect(link.textContent).toContain('The article');
    });

    it('opens a preview in a new tab safely when asked', async () => {
      const screen = await render(
        <MPChatBubble preview={{ url: 'https://example.com', title: 'Out', newTab: true }}>
          Have a look
        </MPChatBubble>
      );
      const link = screen.container.querySelector('a')!;

      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    /*
     * A preview's `url` is attached to a message somebody else sent, which makes
     * it the one URL in this library that is untrusted input in the ordinary
     * sense. React renders a `javascript:` href with a development warning and
     * no more, so without a check a hostile preview is a one-click script
     * execution in a thread.
     */
    it('refuses to render a preview URL a reader should not be sent to', async () => {
      for (const url of [
        'javascript:alert(1)',
        'JavaScript:alert(1)',
        // The characters a URL parser throws away before it reads the scheme,
        // which is how a check that reads the string as written is walked past.
        ' java\tscript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)'
      ]) {
        const screen = await render(
          <MPChatBubble preview={{ url, title: 'Trust me' }}>Have a look</MPChatBubble>
        );
        const link = screen.container.querySelector('a')!;

        expect(link, url).not.toHaveAttribute('href');
        // Still drawn, so the message is not silently missing a card.
        expect(link.textContent).toContain('Trust me');
      }
    });

    it('renders the schemes a link legitimately carries', async () => {
      for (const url of [
        'https://example.com',
        'http://example.com',
        'mailto:ada@example.com',
        'tel:+8225550100',
        // No scheme at all is relative, and a relative URL resolves against the
        // page it is already on.
        '/articles/1',
        '#section'
      ]) {
        const screen = await render(
          <MPChatBubble preview={{ url, title: 'Fine' }}>Have a look</MPChatBubble>
        );

        expect(screen.container.querySelector('a')!, url).toHaveAttribute('href', url);
      }
    });

    it('holds a preview picture back from the network until it is near', async () => {
      const screen = await render(
        <MPChatBubble preview={{ url: 'https://example.com', title: 'Out', image: '/shot.png' }}>
          Have a look
        </MPChatBubble>
      );
      const image = screen.container.querySelector('img')!;

      expect(image).toHaveAttribute('loading', 'lazy');
      // A remote image in a thread is a request the *sender* chose.
      expect(image).toHaveAttribute('referrerpolicy', 'no-referrer');
    });

    it('renders the avatar and the actions beside the bubble', async () => {
      const screen = await render(
        <MPChatBubble
          avatar={<span data-testid="avatar">A</span>}
          actions={<button type="button">More</button>}
        >
          Theirs
        </MPChatBubble>
      );

      await expect.element(screen.getByTestId('avatar')).toBeInTheDocument();
      // Outside the bubble's own sheet: it is a control about the message, not
      // part of it.
      expect(screen.container.querySelector('.mp-chat-bubble__sheet')!.textContent).not.toContain(
        'More'
      );
    });
  });
});
