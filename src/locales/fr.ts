/**
 * French — Français.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { fr } from 'material-plus-ui/locales/fr';
 *
 *     registerMPMessages(fr);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const fr: MPLocale = {
  locale: 'fr',
  messages: {
    common: {
      close: 'Fermer',
      clear: 'Effacer',
      open: 'Ouvrir',
      remove: 'Supprimer',
      removeNamed: 'Supprimer {label}',
      loading: 'Chargement'
    },
    textField: {
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe'
    },
    empty: { title: "Il n'y a rien ici" },
    picker: {
      previousMonth: 'Mois précédent',
      nextMonth: 'Mois suivant',
      previousYear: 'Année précédente',
      nextYear: 'Année suivante',
      previousYears: 'Années précédentes',
      nextYears: 'Années suivantes',
      chooseMonth: 'Choisir un mois',
      chooseYear: 'Choisir une année',
      today: "Aujourd'hui",
      now: 'Maintenant',
      clear: 'Effacer',
      done: 'Terminé',
      hour: 'Heure',
      minute: 'Minute',
      second: 'Seconde',
      meridiem: 'AM/PM',
      start: 'Début',
      end: 'Fin'
    },
    alert: { dismiss: 'Fermer' },
    chat: {
      sending: 'Envoi en cours',
      sent: 'Envoyé',
      delivered: 'Distribué',
      read: 'Lu',
      failed: 'Non envoyé',
      typing: "En train d'écrire"
    },
    spoiler: {
      reveal: 'Afficher',
      hide: 'Masquer',
      notice: 'Masqué pour ne pas être lu par accident'
    },
    pagination: {
      label: 'Pagination',
      page: 'Page {page}',
      status: 'Page {page} sur {total}',
      previous: 'Page précédente',
      next: 'Page suivante',
      first: 'Première page',
      last: 'Dernière page'
    },
    rating: {
      label: 'Note',
      value: '{value} sur {max}',
      empty: 'Non noté'
    },
    transfer: {
      source: 'Disponibles',
      target: 'Sélectionnés',
      toTarget: 'Déplacer vers les sélectionnés',
      toSource: 'Renvoyer vers les disponibles',
      search: 'Rechercher',
      empty: 'Rien ici'
    },
    command: {
      label: 'Palette de commandes',
      search: 'Tapez une commande ou recherchez…',
      empty: 'Aucune commande trouvée'
    },
    layout: {
      skipToContent: 'Aller au contenu',
      sidebar: 'Barre latérale',
      openSidebar: 'Ouvrir la barre latérale',
      closeSidebar: 'Fermer la barre latérale',
      resizeSidebar: 'Redimensionner la barre latérale'
    }
  }
};
