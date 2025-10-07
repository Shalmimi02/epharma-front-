// updateDownloader.js
const fs = require('fs');
const axios = require('axios');
const AdmZip = require('adm-zip');

async function downloadAndProcessUpdate(downloadUrl, localZipPath, extractPath, progressCallback) {
  // Créer un stream pour écrire le fichier téléchargé
  const writer = fs.createWriteStream(localZipPath);

  // Lancer la requête HTTP avec réponse en stream
  const response = await axios({
    url: downloadUrl,
    method: 'GET',
    responseType: 'stream'
  });

  // Récupérer la taille totale du fichier depuis les headers
  const totalLength = response.headers['content-length'];
  console.log('Total size:', totalLength);

  let downloaded = 0;
  // Écouter l’événement "data" pour suivre la progression
  response.data.on('data', (chunk) => {
    console.log(`Téléchargé: ${downloaded} / ${totalLength}`); // Debug
    downloaded += chunk.length;
    if (progressCallback) {
      progressCallback(downloaded, totalLength);
    }
  });

  // Pipe le stream dans le writer (fichier local)
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      
    //   // Copie du fichier ZIP dans backupZipPath (optionnel)
    //   if (backupZipPath) {
    //     fs.copyFileSync(localZipPath, backupZipPath);
    //     console.log(`Fichier ZIP copié vers ${backupZipPath}.`);
    //   }
      // Extraction du fichier ZIP dans le dossier spécifié
      const zip = new AdmZip(localZipPath);
      zip.extractAllTo(extractPath, true);
      console.log(`Fichier dézippé dans ${extractPath}.`);
      resolve({ success: true, message: 'Téléchargement et extraction réussis.' });
    });
    writer.on('error', reject);
  });
}

module.exports = { downloadAndProcessUpdate };
