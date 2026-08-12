import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAlert, MPDatePicker, MPLocaleProvider, useMPLocale } from 'material-plus-ui';

const JULY = new Date(2026, 6, 1);

/** Reads back whatever the provider is handing out at this point in the tree. */
function Reader({ locale }: { locale?: string }) {
  return <output data-testid="locale">{useMPLocale(locale) ?? 'none'}</output>;
}

describe('MPLocaleProvider', () => {
  describe('what it carries', () => {
    it('hands its tag to everything under it', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ko">
          <Reader />
        </MPLocaleProvider>
      );

      expect(screen.getByTestId('locale').element().textContent).toBe('ko');
    });

    it('is undefined with no provider, which is the platform default', async () => {
      // Deliberately not `'en'`: `undefined` is what makes `Intl` format dates
      // the way the reader's own machine does, while only the words in this
      // library's table fall back to English.
      const screen = await render(<Reader />);

      expect(screen.getByTestId('locale').element().textContent).toBe('none');
    });

    it('lets the nearest one win', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ko">
          <MPLocaleProvider locale="ja">
            <Reader />
          </MPLocaleProvider>
        </MPLocaleProvider>
      );

      expect(screen.getByTestId('locale').element().textContent).toBe('ja');
    });

    it('lets a prop beat the provider, so one control can differ from the page', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ko">
          <Reader locale="pt-BR" />
        </MPLocaleProvider>
      );

      expect(screen.getByTestId('locale').element().textContent).toBe('pt-BR');
    });
  });

  describe('what reads it', () => {
    it('reaches components that write a word of their own', async () => {
      const screen = await render(
        <MPLocaleProvider locale="fr">
          <MPAlert onClose={() => {}}>Bonjour</MPAlert>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument();
    });

    it('reaches Intl as well as the table, so the dates move too', async () => {
      const screen = await render(
        <MPLocaleProvider locale="fr">
          <MPDatePicker label="Date" defaultMonth={JULY} defaultOpen />
        </MPLocaleProvider>
      );

      // The month name is the platform's; the footer's word is this library's.
      await expect
        .element(screen.getByRole('button', { name: 'Choisir un mois' }))
        .toHaveTextContent('juillet');
      await expect.element(screen.getByRole('button', { name: "Aujourd'hui" })).toBeInTheDocument();
    });
  });

  describe('resolving a tag', () => {
    it('matches a bare language from a regional tag', async () => {
      const screen = await render(
        <MPLocaleProvider locale="pt-BR">
          <MPAlert onClose={() => {}}>Olá</MPAlert>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
    });

    it('keys Chinese by script, because that is the axis the words differ on', async () => {
      const screen = await render(
        <MPLocaleProvider locale="zh-TW">
          <MPAlert onClose={() => {}}>你好</MPAlert>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: '關閉' })).toBeInTheDocument();
    });

    it('reads bare zh as Simplified', async () => {
      const screen = await render(
        <MPLocaleProvider locale="zh">
          <MPAlert onClose={() => {}}>你好</MPAlert>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
    });

    it('falls back to English rather than to nothing', async () => {
      const screen = await render(
        <MPLocaleProvider locale="sv-SE">
          <MPAlert onClose={() => {}}>Hej</MPAlert>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    it('survives a tag that is not a tag at all', async () => {
      const screen = await render(
        <MPLocaleProvider locale="!!!">
          <MPAlert onClose={() => {}}>Hello</MPAlert>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });
  });
});
