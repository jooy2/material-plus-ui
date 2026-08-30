import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  MPAlert,
  MPBreadcrumb,
  MPBreadcrumbItem,
  MPButton,
  MPCarousel,
  MPChip,
  MPCombobox,
  MPDatePicker,
  MPDialog,
  MPEmpty,
  MPFilePicker,
  MPLocaleProvider,
  MPNumberField,
  MPOverlay,
  MPTable,
  MPTextField,
  MPTextLink,
  registerMPMessages,
  useMPLocale
} from 'material-plus-ui';

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

    /*
     * The words that are not any one component's — the × on four different
     * surfaces, the spinner, the two adornments on a combobox — come from one
     * namespace, so a translation cannot disagree with itself about them.
     */
    it('reaches the × on a surface that has one', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ko">
          <MPDialog open title="제목" showClose>
            본문
          </MPDialog>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });

    it('reaches the words a control says about itself', async () => {
      // Rendered apart from the dialog above: a modal takes the rest of the page
      // out of the tree, so a chip beside one is a chip nothing can find.
      const screen = await render(
        <MPLocaleProvider locale="ko">
          <MPButton loading>보내기</MPButton>
          <MPChip onDelete={() => {}}>서울</MPChip>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: '제거' })).toBeInTheDocument();
      await expect.element(screen.getByLabelText('불러오는 중')).toBeInTheDocument();
    });

    it('reaches the one invented string that is drawn rather than read out', async () => {
      // A page in Korean with an empty list used to say "Nothing here" in the
      // middle of it.
      const screen = await render(
        <MPLocaleProvider locale="ko">
          <MPEmpty />
        </MPLocaleProvider>
      );

      await expect.element(screen.getByText('아무것도 없습니다')).toBeInTheDocument();
    });

    it('reaches the reveal toggle, which had no override at all before', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ko">
          <MPTextField value="hunter2" type="password" label="비밀번호" />
        </MPLocaleProvider>
      );

      await expect
        .element(screen.getByRole('button', { name: '비밀번호 표시' }))
        .toBeInTheDocument();
    });

    it('names a remove button for what it removes, in that language’s order', async () => {
      // A row of five buttons all called "Remove" is a row a screen reader
      // cannot tell apart — and Korean puts the name before the verb.
      const screen = await render(
        <MPLocaleProvider locale="ko">
          <MPFilePicker
            label="첨부"
            value={[new File(['x'], 'report.pdf', { type: 'application/pdf' })]}
          />
        </MPLocaleProvider>
      );

      await expect
        .element(screen.getByRole('button', { name: 'report.pdf 제거' }))
        .toBeInTheDocument();
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

  describe('registering a language', () => {
    /*
     * `eo` and not one of the eighteen: `test/setup.ts` registers those on
     * behalf of every suite, and a test that re-registered one would be a test
     * about the table it just wrote rather than about the registry. Esperanto is
     * a tag nothing else in this repository touches, which is what makes it
     * usable twice in a row below.
     */
    it('teaches the library a language it does not ship', async () => {
      registerMPMessages({ locale: 'eo', messages: { alert: { dismiss: 'Forsendi' } } });

      const screen = await render(
        <MPLocaleProvider locale="eo">
          <MPAlert onClose={() => {}}>Saluton</MPAlert>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: 'Forsendi' })).toBeInTheDocument();
    });

    it('fills the rest of the table in from English, as a shipped one would be', async () => {
      registerMPMessages({ locale: 'eo', messages: { alert: { dismiss: 'Forsendi' } } });

      const screen = await render(
        <MPLocaleProvider locale="eo">
          <MPButton loading>Sendi</MPButton>
        </MPLocaleProvider>
      );

      // `common.loading`, which the table above says nothing about.
      await expect.element(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('takes a later table over the one already registered', async () => {
      registerMPMessages({ locale: 'eo', messages: { alert: { dismiss: 'Forsendi' } } });
      registerMPMessages({ locale: 'eo', messages: { alert: { dismiss: 'Malaperigi' } } });

      const screen = await render(
        <MPLocaleProvider locale="eo">
          <MPAlert onClose={() => {}}>Saluton</MPAlert>
        </MPLocaleProvider>
      );

      // The resolved-messages cache is keyed by the tag that was asked for, so
      // this is the assertion that it was dropped rather than answered from.
      await expect.element(screen.getByRole('button', { name: 'Malaperigi' })).toBeInTheDocument();
    });

    it('registers a table under its aliases too', async () => {
      registerMPMessages({
        locale: 'eo',
        aliases: ['eo-XX'],
        messages: { alert: { dismiss: 'Forsendi' } }
      });

      const screen = await render(
        <MPLocaleProvider locale="eo-XX">
          <MPAlert onClose={() => {}}>Saluton</MPAlert>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: 'Forsendi' })).toBeInTheDocument();
    });

    it('leaves a language nobody registered speaking English', async () => {
      // The whole reason the registry exists: an application that never names a
      // language carries none of them, and gets English rather than nothing.
      const screen = await render(
        <MPLocaleProvider locale="cy">
          <MPAlert onClose={() => {}}>Helo</MPAlert>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });
  });

  /*
   * Eight components used to default a word of their own to English in the
   * source, where no `locale` and no `MPLocaleProvider` could reach it. Half of
   * them were *drawn* — a Korean page with a table saying "No data" through the
   * middle of it, a dropzone giving its one instruction in a language nobody had
   * asked for.
   *
   * One test each, because the failure they share is that the string exists at
   * all rather than anything about how it is looked up.
   */
  describe('the words a component invents', () => {
    it('translates the number field’s two steppers', async () => {
      registerMPMessages({
        locale: 'eo',
        // Two words rather than one and its own prefix: `Pliigi` is a
        // substring of `Malpliigi`, and a name match is a substring match.
        messages: { numberField: { increase: 'Pliigi', decrease: 'Redukti' } }
      });

      const screen = await render(
        <MPLocaleProvider locale="eo">
          <MPNumberField label="Kvanto" />
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: 'Pliigi' })).toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: 'Redukti' })).toBeInTheDocument();
    });

    it('translates the carousel’s names, numbers and all', async () => {
      registerMPMessages({
        locale: 'eo',
        messages: {
          carousel: {
            label: 'Karuselo',
            previous: 'Antaŭa',
            next: 'Sekva',
            slide: 'Bildo {index} el {total}'
          }
        }
      });

      const screen = await render(
        <MPLocaleProvider locale="eo">
          <MPCarousel>
            <div>One</div>
            <div>Two</div>
          </MPCarousel>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('region', { name: 'Karuselo' })).toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: 'Sekva' })).toBeInTheDocument();
      // `{index}` and `{total}` are named rather than positional, so a language
      // that counts the total first is one this table can serve.
      await expect.element(screen.getByRole('group', { name: 'Bildo 1 el 2' })).toBeInTheDocument();
    });

    it('translates the breadcrumb’s two names', async () => {
      registerMPMessages({
        locale: 'eo',
        messages: { breadcrumb: { label: 'Panervojo', expand: 'Montri kaŝitajn' } }
      });

      const screen = await render(
        <MPLocaleProvider locale="eo">
          <MPBreadcrumb maxItems={2}>
            <MPBreadcrumbItem href="/">A</MPBreadcrumbItem>
            <MPBreadcrumbItem href="/b">B</MPBreadcrumbItem>
            <MPBreadcrumbItem href="/c">C</MPBreadcrumbItem>
            <MPBreadcrumbItem>D</MPBreadcrumbItem>
          </MPBreadcrumb>
        </MPLocaleProvider>
      );

      await expect
        .element(screen.getByRole('navigation', { name: 'Panervojo' }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: 'Montri kaŝitajn' }))
        .toBeInTheDocument();
    });

    it('translates the combobox’s two drawn lines', async () => {
      registerMPMessages({
        locale: 'eo',
        messages: { combobox: { empty: 'Neniu trafo', add: 'Aldoni {label}' } }
      });

      const screen = await render(
        <MPLocaleProvider locale="eo">
          <MPCombobox items={[{ value: 'a', label: 'Alpha' }]} label="Etikedo" />
        </MPLocaleProvider>
      );

      await screen.getByRole('combobox').fill('zzz');

      await expect.element(screen.getByText('Aldoni zzz')).toBeInTheDocument();
    });

    it('translates the table’s empty row', async () => {
      registerMPMessages({ locale: 'eo', messages: { table: { empty: 'Neniuj datumoj' } } });

      const screen = await render(
        <MPLocaleProvider locale="eo">
          <MPTable headers={[{ key: 'name', label: 'Nomo' }]} items={[]} />
        </MPLocaleProvider>
      );

      await expect.element(screen.getByText('Neniuj datumoj')).toBeInTheDocument();
    });

    it('translates the file picker’s prompt', async () => {
      registerMPMessages({
        locale: 'eo',
        messages: { filePicker: { prompt: 'Faligu dosierojn' } }
      });

      const screen = await render(
        <MPLocaleProvider locale="eo">
          <MPFilePicker label="Dosieroj" />
        </MPLocaleProvider>
      );

      await expect.element(screen.getByText('Faligu dosierojn')).toBeInTheDocument();
    });

    it('translates the link’s spoken warning', async () => {
      registerMPMessages({
        locale: 'eo',
        messages: { textLink: { newTab: 'Malfermas novan langeton' } }
      });

      const screen = await render(
        <MPLocaleProvider locale="eo">
          <MPTextLink href="https://example.com" newTab>
            Ekzemplo
          </MPTextLink>
        </MPLocaleProvider>
      );

      await expect
        .element(screen.getByRole('link', { name: 'Ekzemplo Malfermas novan langeton' }))
        .toBeInTheDocument();
    });

    it('translates the overlay’s own name', async () => {
      registerMPMessages({ locale: 'eo', messages: { overlay: { label: 'Tavolo' } } });

      const screen = await render(
        <MPLocaleProvider locale="eo">
          <MPOverlay open>Atendu</MPOverlay>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('dialog', { name: 'Tavolo' })).toBeInTheDocument();
    });
  });
});
