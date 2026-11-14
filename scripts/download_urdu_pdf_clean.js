const https = require('https');
const fs = require('fs');
const path = require('path');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Starting download: ${url} -> ${dest}`);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Following redirect to ${res.headers.location}`);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`Downloaded ${path.basename(dest)}: ${fs.statSync(dest).size} bytes`);
          resolve();
        });
      });
    }).on('error', reject);
  });
}

const url = 'https://archive.org/download/minhaj-e-nahjul-balagha-by-syed-sibtul-hasan-hasnwi_202104/Minhaj-e-Nahjul%20Balagha%20by%20Syed%20Sibtul%20Hassan%20Haswi_text.pdf';
const dest = path.join(__dirname, '..', 'public', 'docs', 'nahj-al-balagha-urdu.pdf');
download(url, dest).then(() => console.log('Urdu PDF downloaded successfully!')).catch(console.error);
