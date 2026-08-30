/**
 * Portuguese — Português.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { pt } from 'material-plus-ui/locales/pt';
 *
 *     registerMPMessages(pt);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const pt: MPLocale = {
  locale: 'pt',
  messages: {
    common: {
      close: 'Fechar',
      clear: 'Limpar',
      open: 'Abrir',
      remove: 'Remover',
      removeNamed: 'Remover {label}',
      loading: 'Carregando'
    },
    textField: { showPassword: 'Mostrar a senha', hidePassword: 'Ocultar a senha' },
    empty: { title: 'Não há nada aqui' },
    picker: {
      previousMonth: 'Mês anterior',
      nextMonth: 'Próximo mês',
      previousYear: 'Ano anterior',
      nextYear: 'Próximo ano',
      previousYears: 'Anos anteriores',
      nextYears: 'Próximos anos',
      chooseMonth: 'Escolher um mês',
      chooseYear: 'Escolher um ano',
      today: 'Hoje',
      now: 'Agora',
      clear: 'Limpar',
      done: 'Concluído',
      hour: 'Hora',
      minute: 'Minuto',
      second: 'Segundo',
      meridiem: 'AM/PM',
      start: 'Início',
      end: 'Fim'
    },
    alert: { dismiss: 'Fechar' },
    chat: {
      sending: 'Enviando',
      sent: 'Enviado',
      delivered: 'Entregue',
      read: 'Lido',
      failed: 'Não enviado',
      typing: 'Digitando'
    },
    spoiler: {
      reveal: 'Mostrar',
      hide: 'Ocultar',
      notice: 'Oculto para não ser lido por acidente'
    },
    pagination: {
      label: 'Paginação',
      page: 'Página {page}',
      status: 'Página {page} de {total}',
      previous: 'Página anterior',
      next: 'Próxima página',
      first: 'Primeira página',
      last: 'Última página'
    },
    rating: {
      label: 'Avaliação',
      value: '{value} de {max}',
      empty: 'Sem avaliação'
    },
    transfer: {
      source: 'Disponíveis',
      target: 'Selecionados',
      toTarget: 'Mover para selecionados',
      toSource: 'Devolver para disponíveis',
      search: 'Pesquisar',
      empty: 'Nada aqui'
    },
    command: {
      label: 'Paleta de comandos',
      search: 'Digite um comando ou pesquise…',
      empty: 'Nenhum comando encontrado'
    },
    layout: {
      skipToContent: 'Ir para o conteúdo',
      sidebar: 'Barra lateral',
      openSidebar: 'Abrir a barra lateral',
      closeSidebar: 'Fechar a barra lateral',
      resizeSidebar: 'Redimensionar a barra lateral'
    }
  }
};
