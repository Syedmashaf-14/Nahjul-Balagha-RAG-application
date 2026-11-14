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

const url = 'https://archive.org/download/20191230_20191230_1950/%D9%86%D9%87%D8%AC%20%D8%A7%D9%84%D8%A8%D9%84%D8%A7%D8%BA%D8%A9.pdf';
const dest = path.join(__dirname, '..', 'public', 'docs', 'nahj-al-balagha-arabic.pdf');
download(url, dest).then(() => console.log('Arabic PDF ready!')).catch(console.error);
