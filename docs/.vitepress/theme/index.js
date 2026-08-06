import DefaultTheme from 'vitepress/theme';
import Demo from './components/Demo.vue';
import PropsTable from './components/PropsTable.vue';
import './styles/index.css';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Both are used straight from Markdown, so they are registered globally
    // rather than imported page by page.
    app.component('Demo', Demo);
    app.component('PropsTable', PropsTable);
  }
};
