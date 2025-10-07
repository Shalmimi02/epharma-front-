const Client = require('ssh2-sftp-client');

async function downloadAndProcessSftpFile(sftpOptions, remoteFilePath, localZipPath, extractPath, progressCallback) {
  const sftp = new Client();
  try {
    await sftp.connect(sftpOptions);
    console.log('Connexion SFTP réussie.');

    // Téléchargement avec callback de progression
    await sftp.fastGet(remoteFilePath, localZipPath, {
      step: (total_transferred, chunk, total) => {
        if (progressCallback) progressCallback(total_transferred, chunk, total);
      }
    });
    console.log(`Fichier téléchargé avec succès dans ${localZipPath}.`);


    // Décompression
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(localZipPath);
    zip.extractAllTo(extractPath, true);
    console.log(`Fichier dézippé dans ${extractPath}.`);
  } catch (err) {
    console.error(`Erreur dans le traitement SFTP : ${err}`);
    throw err;
  } finally {
    sftp.end();
  }
}

module.exports = { downloadAndProcessSftpFile };
