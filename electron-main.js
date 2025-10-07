const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const log = require('electron-log');

const { autoUpdater } = require('electron-updater');
require('dotenv').config();
// Import du module ftpZipHandler pour le handler IPC
const { downloadAndProcessSftpFile } = require('./ftpZipHandler.js');
const { downloadAndProcessUpdate } = require('./updateDownloader.js');
const isDev = process.env.NODE_ENV === 'development';
// Configuration du log
log.transports.file.level = 'debug';
log.transports.console.level = 'debug';
log.transports.file.file = path.join(app.getPath('userData'), 'logs', 'main.log');
console.log('Fichier de log configuré ici:', log.transports.file.file);

// Empêcher le lancement de plusieurs instances
if (!app.requestSingleInstanceLock()) {
  log.warn("Une autre instance est déjà en cours. Fermeture de cette instance.");
  app.quit();
  process.exit(0);
}

let mainWindow;
let loadingWindow;

// Création de la fenêtre principale
function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload script path:', preloadPath);
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: isDev ? undefined : path.join(__dirname, 'preload.js'),
      nodeIntegration: isDev,       // activé en dev pour avoir accès à require
      contextIsolation: !isDev      // désactivé en dev (à n'utiliser que pour du dev)
    }
    

  });
  
  // Supprime le menu de l'application
  // Menu.setApplicationMenu(null);
  
  mainWindow.setTitle('Epharma');
  // Chargez ici votre interface (URL ou fichier local)
  // mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.loadURL("http://epg-epharma.epharma");

  mainWindow.on('closed', () => { 
    mainWindow = null; 
  });
}


// Création de la fenêtre de chargement lors de l'installation de la mise à jour
function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  
  loadingWindow.loadFile(path.join(__dirname, 'loading.html'));
}

app.whenReady().then(() => {
  createWindow();

  mainWindow.webContents.on('did-finish-load', () => {
    // Lancer la vérification des mises à jour une fois que la fenêtre est chargée
    autoUpdater.checkForUpdates();
  });

  // Désactive le téléchargement automatique pour que l'utilisateur déclenche l'action manuellement
  autoUpdater.autoDownload = false;

  autoUpdater.on('checking-for-update', () => {
    log.info("Vérification des mises à jour...");
  });

  autoUpdater.on('update-available', (info) => {
    log.info("Mise à jour disponible:", info);
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('update_available', info);
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    log.info("Aucune mise à jour disponible:", info);
  });

  autoUpdater.on('error', (err) => {
    log.error("Erreur de mise à jour:", err);
  });

  autoUpdater.on('download-progress', (progress) => {
    log.info("Progression du téléchargement:", progress);
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('download_progress', progress);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info("Mise à jour téléchargée:", info);
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('update_downloaded', info);
    }
  });

  // // Vérification manuelle des mises à jour
  // autoUpdater.checkForUpdates();

  // Gestionnaire IPC pour obtenir la version de l'application
  ipcMain.handle('get-app-version', () => {
    const version = app.getVersion();
    log.info('get-app-version appelé, version:', version);
    return version;
  });

  // Gestionnaire IPC pour déclencher le téléchargement de la mise à jour
  ipcMain.on('download_update', () => {
    log.info("Téléchargement de la mise à jour demandé par le renderer.");
    autoUpdater.downloadUpdate();
  });

  // Gestionnaire IPC pour installer la mise à jour
  ipcMain.on('install_update', () => {
    log.info("Installation de la mise à jour demandée");
    
    // Fermer la fenêtre principale
    if (mainWindow) {
      mainWindow.close();
      mainWindow = null;
    }
    
    // Ouvrir la fenêtre de chargement
    createLoadingWindow();
    
    // Après un délai (ici 5 secondes pour simuler l'installation), fermer la fenêtre de chargement et installer la mise à jour
    setTimeout(() => {
      if (loadingWindow) {
        loadingWindow.close();
      }
      autoUpdater.quitAndInstall();
    }, 5000);
  });
  // // Gestionnaire IPC pour lancer le téléchargement FTP via ftpZipHandler
  // ipcMain.handle('ftp-download', async (event, sftpOptions, remoteFilePath, localZipPath, extractPath, backupZipPath) => {
  //   try {
  //     // Passez un callback de progression à la fonction SFTP
  //     await downloadAndProcessSftpFile(sftpOptions, remoteFilePath, localZipPath, extractPath, backupZipPath,
  //       (transferred, chunk, total) => {
  //         const percent = (transferred / total) * 100;
  //         // Envoyer l'événement de progression vers le renderer
  //         if (mainWindow && mainWindow.webContents) {
  //           mainWindow.webContents.send('ftp-download-progress', { percent, transferred, total });
  //         }
  //       }
  //     );
  //     return { success: true, message: 'Téléchargement et décompression réussis.' };
  //   } catch (error) {
  //     return { success: false, message: error.message };
  //   }
  // });

  

  ipcMain.handle('update-download', async (event, downloadUrl, localZipPath, extractPath) => {
    try {
      await downloadAndProcessUpdate(downloadUrl, localZipPath, extractPath, (downloaded, total) => {
        const percent = (downloaded / total) * 100;
       
        // Envoyer l'événement de progression au renderer
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('update-download-progress', { percent, downloaded, total });
        }
      });
      return { success: true, message: 'Téléchargement et extraction réussis.' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

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
