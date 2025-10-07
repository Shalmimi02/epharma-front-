const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
  // nous pouvons aussi exposer des variables en plus des fonctions
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download_progress', callback),
  downloadUpdate: () => ipcRenderer.send('download_update'),
  installUpdate: () => ipcRenderer.send('install_update'),
  getAppVersion: () => {
    const promise = ipcRenderer.invoke('get-app-version');
    promise.then(v => console.log('Version récupérée depuis preload:', v));
    return promise;
  }
})


// API FTP
// contextBridge.exposeInMainWorld('ftpApi', {
//   downloadAndProcess: (sftpOptions, remoteFilePath, localZipPath, extractPath, backupZipPath) =>
//     ipcRenderer.invoke('ftp-download', sftpOptions, remoteFilePath, localZipPath, extractPath, backupZipPath)
// });

// // Exposer une API pour écouter la progression FTP
// contextBridge.exposeInMainWorld('ftpProgress', {
//   onProgress: (callback) => ipcRenderer.on('ftp-download-progress', callback)
// });

// Exposer l'API Update pour télécharger la mise à jour via l'URL
contextBridge.exposeInMainWorld('updateApi', {
  downloadAndProcess: (downloadUrl, localZipPath, extractPath) =>
    ipcRenderer.invoke('update-download', downloadUrl, localZipPath, extractPath)
});

// Exposer une API pour écouter la progression de téléchargement update
contextBridge.exposeInMainWorld('updateProgress', {
  onProgress: (callback) => ipcRenderer.on('update-download-progress', callback)
});