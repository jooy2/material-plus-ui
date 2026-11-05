import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeTheme,
  net,
  protocol,
  session,
  shell
} from 'electron';
import { dirname, join, normalize, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, '..', 'dist');
const devServer = process.env.VITE_DEV_SERVER_URL;
const testUserData = process.env.MP_USER_DATA;

// The tests run while someone is working at the same machine, so under them the
// app never puts a window on the screen and never comes to the front. On macOS
// an accessory app has no Dock icon and no menu bar, and launching it does not
// activate it. Set first, before the app finishes launching, which is when
// macOS would bring a regular app to the front.
const hidden = Boolean(process.env.MP_HIDDEN);

if (hidden && process.platform === 'darwin') {
  app.setActivationPolicy('accessory');
}

if (testUserData) {
  app.setPath('userData', testUserData);
}

// A scheme of its own rather than `file://`, as Electron's security guide asks:
// a page served this way has an origin, and `/samples/...` means what it means
// on a website.
protocol.registerSchemesAsPrivileged([
  { scheme: 'mp', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

function serveBuild() {
  protocol.handle('mp', (request) => {
    const { pathname } = new URL(request.url);
    const file = normalize(join(dist, decodeURIComponent(pathname)));

    if (file !== dist && !file.startsWith(dist + sep)) {
      return new Response('Not found', { status: 404 });
    }

    return net.fetch(pathToFileURL(pathname === '/' ? join(dist, 'index.html') : file).toString());
  });
}

function denyPermissions() {
  // The page asks for nothing but the clipboard write the copy buttons need.
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(permission === 'clipboard-sanitized-write');
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 520,
    minHeight: 480,
    title: 'Material Plus Showcase',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#141218' : '#fef7ff',
    show: false,
    webPreferences: {
      preload: join(here, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // A window that is never shown still has to draw and run its timers, or
      // the tests would be looking at a page that stopped at its first frame.
      // This also keeps `document.visibilityState` at `visible`.
      backgroundThrottling: false
    }
  });

  if (!hidden) {
    window.once('ready-to-show', () => window.show());
  }

  // A link leaves for the browser rather than opening a second window here.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) {
      shell.openExternal(url);
    }

    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('mp://') && !(devServer && url.startsWith(devServer))) {
      event.preventDefault();
    }
  });

  window.loadURL(devServer ?? 'mp://app/');
}

app.whenReady().then(() => {
  serveBuild();
  denyPermissions();

  ipcMain.handle('theme:set', (_event, source) => {
    if (['system', 'light', 'dark'].includes(source)) {
      nativeTheme.themeSource = source;
    }
  });

  // The standard menu, which is also what puts copy and paste on their keys.
  Menu.setApplicationMenu(Menu.buildFromTemplate([{ role: 'appMenu' }, { role: 'editMenu' }]));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
