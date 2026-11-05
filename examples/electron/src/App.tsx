import { Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import {
  MPConfigProvider,
  MPConfirmProvider,
  MPList,
  MPListItem,
  MPSnackbarProvider,
  MPTooltipProvider,
  registerMPMessages,
  useMPColorScheme,
  type MPDensity
} from 'material-plus-ui';
import { LOCALES } from 'material-plus-ui/locales';
import { Components } from './screens/Components';
import { Desktop } from './screens/Desktop';
import { Inbox } from './screens/Inbox';
import { Overlays } from './screens/Overlays';
import { Settings } from './screens/Settings';

// The library carries English alone; every other language is handed over once.
registerMPMessages(...LOCALES);

// The documentation's whole-screen examples, unchanged.
const Dashboard = lazy(() => import('../../../docs/.vitepress/demos/concepts/dashboard'));
const Landing = lazy(() => import('../../../docs/.vitepress/demos/concepts/landing'));
const Signup = lazy(() => import('../../../docs/.vitepress/demos/concepts/signup'));
const Showcase = lazy(() => import('../../../docs/.vitepress/demos/showcase/app'));

/** What the Settings screen changes for the whole app. The scheme is the library's own store. */
export interface Preferences {
  rtl: boolean;
  density: MPDensity;
  locale: string;
}

const screens = {
  dashboard: 'Dashboard',
  inbox: 'Inbox',
  overlays: 'Overlays',
  desktop: 'Desktop',
  showcase: 'Showcase',
  signup: 'Sign-up',
  landing: 'Landing',
  components: 'Components',
  settings: 'Settings'
} as const;

type Screen = keyof typeof screens;

function route() {
  const [screen, ...rest] = location.hash.replace(/^#\/?/, '').split('/');

  return {
    screen: (screen in screens ? screen : 'dashboard') as Screen,
    demo: rest.length > 0 ? rest.join('/') : undefined
  };
}

export function App() {
  const [{ screen, demo }, setRoute] = useState(route);
  const [preferences, setPreferences] = useState<Preferences>({
    rtl: false,
    density: 0,
    locale: 'en'
  });
  const { scheme } = useMPColorScheme();

  useEffect(() => {
    const update = () => setRoute(route());

    window.addEventListener('hashchange', update);

    return () => window.removeEventListener('hashchange', update);
  }, []);

  // The window's own chrome and `prefers-color-scheme` follow the same choice.
  useEffect(() => {
    void window.desktop?.setTheme(scheme);
  }, [scheme]);

  // On `<html>` as well as on the provider, because a menu or a dialog is
  // portalled to `<body>` and only sees the direction and language from there.
  useEffect(() => {
    document.documentElement.dir = preferences.rtl ? 'rtl' : 'ltr';
  }, [preferences.rtl]);

  useEffect(() => {
    document.documentElement.lang = preferences.locale;
  }, [preferences.locale]);

  const content: Record<Screen, ReactNode> = {
    dashboard: <Dashboard />,
    inbox: <Inbox />,
    overlays: <Overlays />,
    desktop: <Desktop />,
    showcase: <Showcase />,
    signup: <Signup />,
    landing: <Landing />,
    components: <Components initial={demo} />,
    settings: (
      <Settings
        preferences={preferences}
        onChange={(next) => setPreferences((current) => ({ ...current, ...next }))}
      />
    )
  };

  return (
    <MPConfigProvider
      density={preferences.density}
      locale={preferences.locale}
      dir={preferences.rtl ? 'rtl' : 'ltr'}
    >
      <MPTooltipProvider>
        <MPSnackbarProvider>
          <MPConfirmProvider>
            <div className="bg-mp-surface text-mp-on-surface flex h-full flex-col">
              <div className="title-bar h-10 shrink-0" />
              <div className="flex min-h-0 flex-1 gap-4 px-4 pb-4">
                <nav aria-label="Main" className="w-48 shrink-0 overflow-auto">
                  <MPList>
                    {(Object.keys(screens) as Screen[]).map((one) => (
                      <MPListItem
                        key={one}
                        selected={one === screen}
                        onClick={() => {
                          location.hash = `#/${one}`;
                        }}
                      >
                        {screens[one]}
                      </MPListItem>
                    ))}
                  </MPList>
                </nav>
                <main className="min-h-0 min-w-0 flex-1 overflow-auto">
                  <Suspense fallback={null}>{content[screen]}</Suspense>
                </main>
              </div>
            </div>
          </MPConfirmProvider>
        </MPSnackbarProvider>
      </MPTooltipProvider>
    </MPConfigProvider>
  );
}
