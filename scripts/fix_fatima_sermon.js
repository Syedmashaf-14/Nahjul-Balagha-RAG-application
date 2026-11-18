const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/ingestion/canonical-passages.json');
const passages = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const s202 = passages.find(p => p.chapter === 'sermon' && p.number == 202);
if (!s202) {
  console.error('Sermon 202 not found!');
  process.exit(1);
}

const burialTranslation = `What Amir al-mu'minin said on the occasion of the burial of Sayyidatu'n-nisa' (Supreme lady of the worlds) Fatimah (p.b.u.h.) while addressing the Holy Prophet at his grave:

O' Prophet of Allah, peace be upon you from me and from your daughter who has come to you and who has hastened to meet you. O' Prophet of Allah, my patience about your chosen (daughter) has been exhausted, and my power of endurance has weakened, except that I have ground for consolation in having endured the great hardship and heart-rending event of your separation. I laid you down in your grave when your last breath had passed between my neck and chest.

... Verily we are Allah's and verily unto Him shall we return. (Qur'an 2:156)

Now, the trust has been returned and what had been given has been taken back. As to my grief, it knows no bounds, and as to my nights, they will remain sleepless till Allah chooses for me the house in which you are now residing.

Certainly, your daughter will apprise you of the joining together of your ummah (people) for oppressing her. You ask her in detail and get all the news about the position. This has happened when a long time had not elapsed and your remembrance had not disappeared. My salam (salutation) be on you both, the salam of a grief-stricken not a disgusted or hateful person; for if I go away it is not because I am weary (of you), and if I stay it is not due to lack of belief in what Allah has promised the endurers.`;

s202.translationText = burialTranslation;
s202.title = 'Sermon 202: Speech at the Burial of Sayyidatu Nisa al-Alamin Hazrat Fatima (s.a.)';
s202.topics = ['Hazrat Fatima', 'Ahlulbayt', 'Grief', 'Holy Prophet', 'Justice', 'Patience', 'Zahra'];

// Also ensure Letter 28 and Letter 24 have Hazrat Fatima in topics
const l28 = passages.find(p => p.chapter === 'letter' && p.number == 28);
if (l28 && !l28.topics.includes('Hazrat Fatima')) {
  l28.topics.push('Hazrat Fatima', 'Chief of Women of Worlds', 'Ahlulbayt');
}

const l24 = passages.find(p => p.chapter === 'letter' && p.number == 24);
if (l24 && !l24.topics.includes('Hazrat Fatima')) {
  l24.topics.push('Hazrat Fatima', 'Children of Fatima', 'Imam Hasan', 'Imam Husayn');
}

fs.writeFileSync(filePath, JSON.stringify(passages, null, 2), 'utf8');
console.log('✅ Successfully updated Sermon 202, Letter 28, and Letter 24 in canonical-passages.json!');
