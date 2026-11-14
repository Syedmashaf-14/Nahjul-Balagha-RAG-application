const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://raw.githubusercontent.com/AleezaBatool/Imam-Ali-Library/main/index.html';
const dest = path.join(__dirname, 'imam_ali_library.html');

console.log('Downloading', url);
const file = fs.createWriteStream(dest);

https.get(url, (res) => {
  res.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log('Downloaded successfully. Size:', fs.statSync(dest).size);
      
      // Now inspect _D in the file
      const content = fs.readFileSync(dest, 'utf8');
      const start = content.indexOf('const _D=');
      if (start === -1) {
        console.log('const _D= not found');
        return;
      }
      
      // Find semicolon after start
      // Note: _D might end before a function or next var
      const nextConst = content.indexOf('const KM=', start);
      // Look backwards from nextConst to find the closing bracket or semicolon of _D
      const slice = content.substring(start + 9, nextConst);
      const semi = slice.lastIndexOf(';');
      const jsonStr = slice.substring(0, semi).trim();
      
      console.log('Parsing _D, length:', jsonStr.length);
      try {
        const data = JSON.parse(jsonStr);
        console.log('Keys in _D:', Object.keys(data));
        if (data.P) {
          console.log('Total passages in P:', data.P.length);
          const types = {};
          data.P.forEach(p => {
            types[p[0]] = (types[p[0]] || 0) + 1;
          });
          console.log('Type breakdown:', types);
          console.log('Sample item [0]:', data.P[0].slice(0, 3));
          console.log('Sample item [0] lengths: arabic:', data.P[0][3]?.length, 'urdu/translation:', data.P[0][4]?.length, 'english?:', data.P[0][5]?.length);
        }
      } catch (err) {
        console.error('JSON parse error:', err.message);
        console.log('Ends with:', jsonStr.slice(-200));
      }
    });
  });
}).on('error', (err) => {
  console.error('Download error:', err.message);
});
