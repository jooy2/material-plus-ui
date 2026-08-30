import type { MPNamespace } from '../i18n';

/** The words a page's skeleton says on its own behalf — see `MPMessages['layout']`. */
export const LAYOUT: MPNamespace<'layout'> = {
  name: 'layout',
  en: {
    skipToContent: 'Skip to content',
    sidebar: 'Sidebar',
    openSidebar: 'Open sidebar',
    closeSidebar: 'Close sidebar',
    resizeSidebar: 'Resize sidebar'
  }
};
