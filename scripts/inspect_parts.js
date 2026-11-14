const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'imam_ali_library.html');
const content = fs.readFileSync(filePath, 'utf8');

const start = content.indexOf('const _D=');
const endMarker = '},"TR":{}}';
const end = content.indexOf(endMarker, start);
const data = JSON.parse(content.substring(start + 9, end + endMarker.length));

// Let's inspect Sermon 1 parts
const s1Parts = data.P.filter(p => p[0] === 's' && p[1] === 1);
console.log('Sermon 1 parts count:', s1Parts.length);
s1Parts.forEach(part => {
  console.log(`Part ${part[2]}: Arabic len ${part[3]?.length}, Urdu len ${part[4]?.length}`);
});

// Let's inspect Letter 53 parts
const l53Parts = data.P.filter(p => p[0] === 'l' && p[1] === 53);
console.log('Letter 53 parts count:', l53Parts.length);
l53Parts.forEach(part => {
  console.log(`Part ${part[2]}: Arabic len ${part[3]?.length}, Urdu len ${part[4]?.length}`);
});

// Let's inspect Saying 1 parts
const h1Parts = data.P.filter(p => p[0] === 'h' && p[1] === 1);
console.log('Saying 1 parts count:', h1Parts.length);
