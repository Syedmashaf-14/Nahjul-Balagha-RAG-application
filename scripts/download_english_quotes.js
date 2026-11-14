const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://raw.githubusercontent.com/aminabhatkar/imamalinspires/master/quotes.json';
const dest = path.join(__dirname, 'english_quotes.json');

console.log('Downloading English sayings from', url);
const file = fs.createWriteStream(dest);

https.get(url, (res) => {
  res.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log('Downloaded english_quotes.json successfully. Size:', fs.statSync(dest).size);
    });
  });
}).on('error', (err) => {
  console.error('Download error:', err.message);
});
