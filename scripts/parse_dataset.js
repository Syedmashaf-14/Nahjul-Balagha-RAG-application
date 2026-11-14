const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'imam_ali_library.html');
const content = fs.readFileSync(filePath, 'utf8');

const start = content.indexOf('const _D=');
const endMarker = '},"TR":{}}';
const end = content.indexOf(endMarker, start);
const jsonStr = content.substring(start + 9, end + endMarker.length);
console.log('Found json, length:', jsonStr.length);

const data = JSON.parse(jsonStr);
console.log('Keys in data:', Object.keys(data));
console.log('Total passages in data.P:', data.P.length);

const types = {};
data.P.forEach(p => {
  types[p[0]] = (types[p[0]] || 0) + 1;
});
console.log('Breakdown by type (s=sermon, l=letter, h=hikmat/saying):', types);

console.log('\n--- Sample Sermon ---');
console.log('Type:', data.P[0][0], 'Number:', data.P[0][1], 'Part:', data.P[0][2]);
console.log('Arabic snippet:', data.P[0][3]?.substring(0, 150));
console.log('Urdu snippet:', data.P[0][4]?.substring(0, 150));

const firstLetter = data.P.find(p => p[0] === 'l');
if (firstLetter) {
  console.log('\n--- Sample Letter ---');
  console.log('Type:', firstLetter[0], 'Number:', firstLetter[1], 'Part:', firstLetter[2]);
  console.log('Arabic snippet:', firstLetter[3]?.substring(0, 150));
  console.log('Urdu snippet:', firstLetter[4]?.substring(0, 150));
}

const firstHikmat = data.P.find(p => p[0] === 'h');
if (firstHikmat) {
  console.log('\n--- Sample Saying ---');
  console.log('Type:', firstHikmat[0], 'Number:', firstHikmat[1], 'Part:', firstHikmat[2]);
  console.log('Arabic snippet:', firstHikmat[3]?.substring(0, 150));
  console.log('Urdu snippet:', firstHikmat[4]?.substring(0, 150));
}

// Check how many distinct sermons, letters, sayings are represented
const distinctSermons = new Set(data.P.filter(p => p[0] === 's').map(p => p[1]));
const distinctLetters = new Set(data.P.filter(p => p[0] === 'l').map(p => p[1]));
const distinctSayings = new Set(data.P.filter(p => p[0] === 'h').map(p => p[1]));

console.log('\nTitles in data.T sample:');
console.log('s1:', data.T['s1']);
console.log('s3:', data.T['s3']);
console.log('l53:', data.T['l53']);
console.log('h1:', data.T['h1']);
console.log('Total titles in T:', Object.keys(data.T).length);
