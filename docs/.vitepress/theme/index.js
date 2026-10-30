import DefaultTheme from 'vitepress/theme';
import Layout from './components/Layout.vue';
import Demo from './components/Demo.vue';
import Fw from './components/Fw.vue';
import PropsTable from './components/PropsTable.vue';
import { syncFramework } from '../data/framework';
import './styles/index.css';
import './custom.css';

export default {
  extends: DefaultTheme,
  // Adds the framework switch to the sidebar; everything else is the default
  // theme.
  Layout,
  enhanceApp({ app }) {
    // All three are used straight from Markdown, so they are registered
    // globally rather than imported page by page.
    app.component('Demo', Demo);
    app.component('Fw', Fw);
    app.component('PropsTable', PropsTable);

    // Reads the stored choice into the reactive copy the components use, and
    // writes it back onto `<html>`. A no-op during SSR.
    syncFramework();
  }
};
