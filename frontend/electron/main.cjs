const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindows() {
  // 1. Admin Portal Window
  const adminWin = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'CSUCC ANPR — Admin Portal',
    icon: path.join(__dirname, '../src/assets/images/backgrounds/anpr-logo-2.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:admin', // Unique isolated session
    },
    show: false,
  });

  // 2. Security Portal Window
  const securityWin = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'CSUCC ANPR — Security Portal',
    icon: path.join(__dirname, '../src/assets/images/backgrounds/anpr-logo-2.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:security', // Unique isolated session (allows dual-logins)
    },
    show: false,
  });

  Menu.setApplicationMenu(null);

  if (isDev) {
    adminWin.loadURL('http://localhost:3000/#/admin-login');
    securityWin.loadURL('http://localhost:3000/#/security-login');
  } else {
    adminWin.loadFile(path.join(__dirname, '../dist/index.html'), { hash: '/admin-login' });
    securityWin.loadFile(path.join(__dirname, '../dist/index.html'), { hash: '/security-login' });
  }

  adminWin.once('ready-to-show', () => adminWin.show());
  securityWin.once('ready-to-show', () => securityWin.show());

  adminWin.on('page-title-updated', (e) => e.preventDefault());
  securityWin.on('page-title-updated', (e) => e.preventDefault());
}

app.whenReady().then(createWindows);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
