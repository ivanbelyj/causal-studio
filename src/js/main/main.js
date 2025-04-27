const { app, BrowserWindow } = require("electron");
const { MenuManager } = require("./menu/menu-manager.js");
const { DataManager } = require("./data-management/data-manager.js");
const { ContextMenuManager } = require("./context-menu-manager.js");
const { DataStore } = require("./data-management/data-store.js");
const { SplashScreen } = require("../../splash/splash-screen.js");
const path = require("path");

// Creates the browser window
async function createWindow(appLocale) {
  // 1. Show splash screen
  const splash = new SplashScreen(path.join(__dirname, '../../splash/splash.html'), {
    width: 480,
    height: 300,
    transparent: false
  });

  await splash.show();

  // 2. Create main window (hidden for now)
  const mainWindow = new BrowserWindow({
    width: 800, // 640,
    height: 600, // 360,
    show: false, // Don't show immediately
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      spellcheck: true,
      // Todo: icon on linux
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.once('did-finish-load', async () => {
    mainWindow.webContents.openDevTools();
    mainWindow.maximize();

    await splash.hide();
    mainWindow.show();
  });

  const languages = [appLocale, "en-US"];
  mainWindow.webContents.session.setSpellCheckerLanguages(languages);

  return mainWindow;
}

let mainWindow;

let dataManager;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  const appLocale = app.getLocale();
  mainWindow = await createWindow(appLocale);

  const contextMenuManager = new ContextMenuManager(mainWindow);
  contextMenuManager.setContextMenu();

  const dataStore = new DataStore();
  dataManager = new DataManager(mainWindow, dataStore);

  const menuManager = new MenuManager(dataManager, mainWindow);
  menuManager.render();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  mainWindow.webContents.once('did-finish-load', () => {
    dataManager.createNewProject();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
