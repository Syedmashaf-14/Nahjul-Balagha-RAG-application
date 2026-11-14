const https = require('https');
const fs = require('fs');
const path = require('path');

const files = [
  { name: 'nahj_khutab.json', url: 'https://raw.githubusercontent.com/WWGTX/NahjulBalaghah/main/nahj_khutab.json' },
  { name: 'nahj_kutub.json', url: 'https://raw.githubusercontent.com/WWGTX/NahjulBalaghah/main/nahj_kutub.json' },
  { name: 'nahj_hikam.json', url: 'https://raw.githubusercontent.com/WWGTX/NahjulBalaghah/main/nahj_hikam.json' },
  { name: 'nahj_index.json', url: 'https://raw.githubusercontent.com/WWGTX/NahjulBalaghah/main/nahj_index.json' },
];

async function downloadFile(item) {
  const dest = path.join(__dirname, item.name);
  console.log(`Downloading ${item.name} from ${item.url}...`);
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(item.url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${item.name}: status ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`Saved ${item.name}: ${fs.statSync(dest).size} bytes`);
          resolve();
        });
      });
    }).on('error', reject);
  });
}

async function main() {
  for (const f of files) {
    try {
      await downloadFile(f);
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log('All downloads completed!');
}

main();
