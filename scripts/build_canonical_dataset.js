const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname);
const outPath = path.join(__dirname, '..', 'src', 'ingestion', 'canonical-passages.json');

// 1. Read WWGTX Arabic data
const khutabData = JSON.parse(fs.readFileSync(path.join(scriptsDir, 'nahj_khutab.json'), 'utf8'));
const kutubData = JSON.parse(fs.readFileSync(path.join(scriptsDir, 'nahj_kutub.json'), 'utf8'));
const hikamData = JSON.parse(fs.readFileSync(path.join(scriptsDir, 'nahj_hikam.json'), 'utf8'));

// 2. Read English Sayings
const englishQuotes = JSON.parse(fs.readFileSync(path.join(scriptsDir, 'english_quotes.json'), 'utf8'));
const englishSayingsMap = new Map();
for (const q of englishQuotes) {
  // e.g. q.id = 1 -> Saying 1
  englishSayingsMap.set(Number(q.id), q.text);
}

// 3. Read Aleeza Urdu dataset
const htmlContent = fs.readFileSync(path.join(scriptsDir, 'imam_ali_library.html'), 'utf8');
const start = htmlContent.indexOf('const _D=');
const endMarker = '},"TR":{}}';
const end = htmlContent.indexOf(endMarker, start);
const aleezaData = JSON.parse(htmlContent.substring(start + 9, end + endMarker.length));

// Build Urdu lookup map by type + number
const urduMap = new Map();
const urduTitles = aleezaData.T || {};

for (const p of aleezaData.P) {
  const type = p[0] === 's' ? 'sermon' : p[0] === 'l' ? 'letter' : 'saying';
  const num = Number(p[1]);
  const key = `${type}_${num}`;
  
  // If Urdu text is present in part 1 (or any part)
  if (p[4] && p[4].trim()) {
    if (!urduMap.has(key)) {
      urduMap.set(key, p[4].trim());
    } else {
      // Append if multi-part
      urduMap.set(key, urduMap.get(key) + '\n\n' + p[4].trim());
    }
  }
}

console.log('Urdu map entries count:', urduMap.size);

// English titles and summaries map for prominent sermons & letters
const PROMINENT_SERMONS = {
  1: {
    title: 'Creation of Universe, Adam, and Obligation of Hajj',
    topics: ['tawhid', 'creation', 'prophethood', 'hajj'],
    en: 'Praise is due to Allah whose worth cannot be described by speakers, whose bounties cannot be counted by calculators, and whose claim to obedience cannot be satisfied by those who attempt to do so...'
  },
  2: {
    title: 'On the condition of the people of Arabia at the advent of the Prophet',
    topics: ['prophethood', 'history', 'ahlulbayt'],
    en: 'I praise Him seeking completion of His blessing, submitting to His glory and expecting safety from committing His sins...'
  },
  3: {
    title: 'The Famous Khutbah ash-Shiqshiqiyyah',
    topics: ['khilafah', 'justice', 'history', 'governance'],
    en: 'Beware! By Allah, the son of Abu Quhafah (Abu Bakr) dressed himself with it (the caliphate) while he well knew that my position in relation to it was the same as the position of the axle in relation to the hand-mill...'
  },
  193: {
    title: 'Khutbah al-Muttaqin (The Sermon of the Pious) to Hammam',
    topics: ['piety', 'character', 'spirituality', 'ethics'],
    en: 'Now then, Allah the Glorified, the Sublime, created creation without any need of their obedience or safety from their sin...'
  },
  216: {
    title: 'The Mutual Rights of the Ruler and the Ruled',
    topics: ['justice', 'governance', 'leadership', 'rights'],
    en: 'Allah, the Glorified, has made for me over you a right by virtue of my being in charge of your affairs, and you have over me a right like that which I have over you...'
  },
  224: {
    title: 'Absolute Integrity and Refusal of Bribery (The Bit of Honey)',
    topics: ['justice', 'integrity', 'governance', 'anti-corruption'],
    en: 'By Allah, even if I were given all the seven heavens with whatever lies under their skies to disobey Allah by snatching the grain of barley from the mouth of an ant, I would never do it...'
  }
};

const PROMINENT_LETTERS = {
  53: {
    title: 'The Monumental Charter of Governance to Malik al-Ashtar',
    topics: ['governance', 'justice', 'leadership', 'human_rights'],
    en: 'This is what the servant of Allah, Ali, Amir al-Mu\'minin, has ordered Malik ibn al-Harith al-Ashtar in his instrument to him when he appointed him Governor of Egypt... Know that the people consist of two classes: either they are your brothers in faith, or your equals in creation...'
  },
  31: {
    title: 'A Father’s Advice and Moral Testament to Imam al-Hasan',
    topics: ['character', 'ethics', 'wisdom', 'fatherhood', 'youth'],
    en: 'From the father who is shortly to pass away, who admits the hardships of time, who is approaching death... To the son who wishes what cannot be obtained, who is travelling along the path of those who have perished...'
  },
  47: {
    title: 'Last Testament and Dying Injunction to his Sons and Believers',
    topics: ['unity', 'quran', 'justice', 'orphans', 'prayer'],
    en: 'I advise you to fear Allah and not to seek this world even if it tries to entice you. Never weep for anything of this world that is denied to you. Speak the truth and act for reward. Be an enemy to the oppressor and a helper to the oppressed...'
  }
};

const canonicalPassages = [];

// 1. Process all 241 Sermons
for (const s of khutabData) {
  const num = Number(s.number);
  const arabicText = (s.text || '').trim();
  const arabicTitle = s.title || urduTitles[`s${num}`] || `خطبة ${num}`;
  const key = `sermon_${num}`;
  const urduText = urduMap.get(key) || '';
  
  const prominent = PROMINENT_SERMONS[num];
  const title = prominent ? `Sermon ${num}: ${prominent.title}` : `Sermon ${num}: ${arabicTitle}`;
  const topics = prominent ? prominent.topics : ['sermon', 'wisdom', 'guidance'];
  const translationText = prominent?.en || (urduText ? `[Sermon ${num}] Authentic discourse of Imam Ali (AS). Full Arabic original and complete Urdu translation provided.` : `Sermon ${num} of Nahj al-Balagha.`);

  canonicalPassages.push({
    id: `sermon_${num}`,
    chapter: 'sermon',
    number: num,
    title,
    arabicTitle,
    arabicText,
    urduTranslation: urduText,
    translationText,
    topics,
    translator: 'Syed Ali Reza / Allama Mufti Jafar Hussain',
    section: 'Sermons'
  });
}

// 2. Process all 79 Letters
for (const l of kutubData) {
  const num = Number(l.number);
  const arabicText = (l.text || '').trim();
  const arabicTitle = l.title || urduTitles[`l${num}`] || `رسالة ${num}`;
  const key = `letter_${num}`;
  const urduText = urduMap.get(key) || '';
  
  const prominent = PROMINENT_LETTERS[num];
  const title = prominent ? `Letter ${num}: ${prominent.title}` : `Letter ${num}: ${arabicTitle}`;
  const topics = prominent ? prominent.topics : ['letter', 'governance', 'counsel'];
  const translationText = prominent?.en || (urduText ? `[Letter ${num}] Official letter & epistle of Imam Ali (AS). Full Arabic original and complete Urdu translation provided.` : `Letter ${num} of Nahj al-Balagha.`);

  canonicalPassages.push({
    id: `letter_${num}`,
    chapter: 'letter',
    number: num,
    title,
    arabicTitle,
    arabicText,
    urduTranslation: urduText,
    translationText,
    topics,
    translator: 'Syed Ali Reza / Allama Mufti Jafar Hussain',
    section: 'Letters'
  });
}

// 3. Process all 470/480 Sayings
for (const h of hikamData) {
  const num = Number(h.number);
  const arabicText = (h.text || '').trim();
  const key = `saying_${num}`;
  const urduText = urduMap.get(key) || '';
  const engText = englishSayingsMap.get(num) || '';
  
  const title = `Saying ${num}: Maxim of Wisdom`;
  const topics = ['wisdom', 'maxim', 'character', 'ethics'];
  const translationText = engText || (urduText ? `[Saying ${num}] Maxim of Imam Ali (AS). Full Arabic text and Urdu translation provided.` : `Saying ${num} of Nahj al-Balagha.`);

  canonicalPassages.push({
    id: `saying_${num}`,
    chapter: 'saying',
    number: num,
    title,
    arabicTitle: `حكمة ${num}`,
    arabicText,
    urduTranslation: urduText,
    translationText,
    topics,
    translator: 'Syed Ali Reza / Allama Mufti Jafar Hussain',
    section: 'Sayings'
  });
}

// 4. Add canonical Du'as & Supplications (from Sermon 215, 115, etc.)
canonicalPassages.push({
  id: 'dua_215',
  chapter: 'dua',
  number: 215,
  title: "Dua 215: Supplication for Inner Humility & Reliance on God",
  arabicTitle: "دعاء في التذلل لله والاستعانة به",
  arabicText: "اللَّهُمَّ إِنَّكَ آنَسُ الْآنِسِينَ لِأَوْلِيَائِكَ، وَأَحْضَرُهُمْ بِالْكِفَايَةِ لِلْمُتَوَكِّلِينَ عَلَيْكَ، تَشْهَدُهُمْ فِي سَرَائِرِهِمْ، وَتَطَّلِعُ عَلَيْهِمْ فِي ضَمَائِرِهِمْ.",
  urduTranslation: "پروردگارا! تو اپنے دوستوں کے لیے سب سے زیادہ انس و محبت رکھنے والا ہے اور جو لوگ تجھ پر بھروسہ کرتے ہیں ان کے کاموں کو سنوارنے کے لیے سب سے زیادہ حاضر و ناظر ہے۔ تو ان کے باطن سے باخبر ہے اور ان کے دل کے بھیدوں سے آگاہ ہے۔",
  translationText: "O Allah! You are the most comforting companion to Your devotees, and the most ready to suffice those who rely upon You. You behold them in their secrets, know what is in their consciences, and are aware of the extent of their insight.",
  topics: ['dua', 'spirituality', 'reliance', 'tawakkul'],
  translator: 'Syed Ali Reza / Allama Mufti Jafar Hussain',
  section: 'Supplications'
});

canonicalPassages.push({
  id: 'dua_115',
  chapter: 'dua',
  number: 115,
  title: "Dua 115: Supplication for Rain (Istisqa) & Divine Mercy",
  arabicTitle: "دعاء الاستسقاء وطلب الرحمة والغيث",
  arabicText: "اللَّهُمَّ قَدِ انْصَاحَتْ جِبَالُنَا، وَاغْبَرَّتْ أَرْضُنَا، وَهَامَتْ دَوَابُّنَا، وَتَحَيَّرَتْ فِي مَرَابِضِهَا... فَارْحَمْ أَنِينَ الْآنَّةِ، وَحَنِينَ الْحَانَّةِ، وَارْحَمْ تَحَيُّرَهَا فِي مَرَاتِعِهَا.",
  urduTranslation: "پروردگارا! ہمارے پہاڑ پھٹ گئے ہیں، ہماری زمین غبار آلود ہو گئی ہے، ہمارے مویشی پیاس سے تڑپ رہے ہیں اور اپنے باڑوں میں حیران و پریشان کھڑے ہیں۔ پس رحم فرما نالہ کرنے والوں کے نالے پر اور تڑپنے والوں کی تڑپ پر۔",
  translationText: "O Lord! Our mountains have cracked and our earth has grown dusty. Our cattle are thirsty and bewildered in their enclosures... So have mercy on the groaning of those who groan and the yearning of those who yearn.",
  topics: ['dua', 'istisqa', 'mercy', 'nature'],
  translator: 'Syed Ali Reza / Allama Mufti Jafar Hussain',
  section: 'Supplications'
});

fs.writeFileSync(outPath, JSON.stringify(canonicalPassages, null, 2), 'utf8');
console.log(`Successfully generated canonical-passages.json! Total passages: ${canonicalPassages.length}`);
console.log(`- Sermons: ${canonicalPassages.filter(p => p.chapter === 'sermon').length}`);
console.log(`- Letters: ${canonicalPassages.filter(p => p.chapter === 'letter').length}`);
console.log(`- Sayings: ${canonicalPassages.filter(p => p.chapter === 'saying').length}`);
console.log(`- Duas: ${canonicalPassages.filter(p => p.chapter === 'dua').length}`);
