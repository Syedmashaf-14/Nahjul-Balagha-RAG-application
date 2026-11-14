const https = require('https');
const fs = require('fs');
const path = require('path');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Starting download: ${url} -> ${dest}`);
    https.get(url, (res) => {
      // Follow redirects
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

async function main() {
  const publicDocs = path.join(__dirname, '..', 'public', 'docs');
  if (!fs.existsSync(publicDocs)) {
    fs.mkdirSync(publicDocs, { recursive: true });
  }

  // 1. Complete English PDF
  const engPdfDest = path.join(publicDocs, 'nahj-al-balagha-english.pdf');
  await download('https://archive.org/download/NahjulBalagha-PeakOfEloquence/Nahjul-Balagha.pdf', engPdfDest);

  // 2. Complete English Text
  const engTxtDest = path.join(__dirname, 'nahj_english_complete.txt');
  await download('https://archive.org/download/NahjulBalagha-PeakOfEloquence/Nahjul-Balagha_djvu.txt', engTxtDest);

  console.log('Complete English downloads finished!');
}

main().catch(console.error);
