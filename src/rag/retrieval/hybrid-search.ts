import { RetrievedDocument, PassageType } from '../../types/passage.types';
import canonicalPassagesJson from '../../ingestion/canonical-passages.json';

export interface EntityMatch {
  passageType?: PassageType;
  passageNumbers?: number[];
  candidatePassages?: Array<{ type: PassageType; number: number }>;
  canonicalTerms: string[];
  entityName: string;
}

export const HISTORICAL_ENTITIES: EntityMatch[] = [
  {
    entityName: 'Hazrat Fatima al-Zahra (s.a.) / Sayyidatu Nisa al-Alamin',
    passageType: 'sermon',
    passageNumbers: [202, 28, 24],
    candidatePassages: [
      { type: 'sermon', number: 202 },
      { type: 'letter', number: 28 },
      { type: 'letter', number: 24 },
    ],
    canonicalTerms: [
      'fatima', 'fatimah', 'hazrat fatima', 'hazrat fatimah', 'zahra', 'al-zahra',
      'sayyidatun nisa', 'sayyidatu nisa', 'sayyida fatima', 'bibi fatima',
      'lady fatima', 'daughter of the prophet', 'burial of fatima', 'funeral of fatima',
      'things mentioned about hazrat fatima', 'fatima in nahj al balagha', 'fatima in nahj',
      // Extended aliases and metaphorical names
      'lady of heaven', 'lady of paradise', 'lady of light', 'mistress of women',
      'mistress of paradise', 'mistress of the worlds', 'chief of women',
      'daughter of prophet', 'daughter of messenger', 'sayyidatu nisa al-alamin',
      'mother of the imams', 'mother of hasan and husayn', 'mother of hassan',
      'بضعۃ الرسول', 'خاتون جنت', 'سیدہ کائنات', 'مادر حسنین', 'سیدۃ النساء العالمین',
      'فاطمة', 'فاطمہ', 'حضرت فاطمہ', 'سيدة النساء', 'الزهراء', 'زہراء', 'بتول', 'دفن فاطمہ',
      'فاطمۃ الزہراء', 'سیدہ فاطمہ', 'دختر رسول', 'بنت رسول', 'فاطمہ زہراء'
    ],
  },
  {
    entityName: 'Imam al-Husayn ibn Ali (a.s.) / Sayyid al-Shuhada',
    passageType: 'letter',
    passageNumbers: [47, 207, 24, 31],
    candidatePassages: [
      { type: 'letter', number: 47 },
      { type: 'sermon', number: 207 },
      { type: 'letter', number: 24 },
      { type: 'letter', number: 31 },
    ],
    canonicalTerms: [
      'imam hussain', 'imam husayn', 'hussain', 'husayn', 'imam husein',
      'al-husayn', 'al-hussain', 'sayyid al-shuhada', 'grandson of the prophet',
      'things mentioned about imam hussain', 'things mentioned about imam husayn',
      'imam hussain in nahj al balagha', 'imam husayn in nahj al balagha',
      'about imam hussain', 'about imam husayn',
      // Extended aliases
      'karbala', 'battle of karbala', 'master of martyrs', 'chief of martyrs',
      'prince of martyrs', 'grandson of prophet', 'grandson of messenger',
      'son of fatima', 'son of ali and fatima', 'third imam',
      'شہید کربلا', 'کربلا', 'سید الشہداء حسین',
      'حسین', 'امام حسین', 'سید الشہداء', 'حسین بن علی', 'امام حسینؑ'
    ],
  },
  {
    entityName: 'Imam al-Hasan ibn Ali (a.s.) / al-Mujtaba',
    passageType: 'letter',
    passageNumbers: [31, 47, 207, 24],
    candidatePassages: [
      { type: 'letter', number: 31 },
      { type: 'letter', number: 47 },
      { type: 'sermon', number: 207 },
      { type: 'letter', number: 24 },
    ],
    canonicalTerms: [
      'imam hasan', 'imam hassan', 'al-hasan', 'al-hassan', 'hasan ibn ali',
      'things mentioned about imam hasan', 'things mentioned about imam hassan',
      'about imam hasan', 'about imam hassan',
      // Extended aliases
      'al-mujtaba', 'mujtaba', 'المجتبی', 'second imam', 'elder son of ali',
      'امام حسن', 'حسن بن علی', 'امام حسن مجتبیٰ', 'امام حسنؑ', 'امام مجتبیٰ'
    ],
  },
  {
    entityName: 'The Holy Prophet Muhammad (s.a.w.)',
    passageType: 'sermon',
    passageNumbers: [1, 2, 26, 94, 95, 105, 116, 161, 190, 235],
    canonicalTerms: [
      'prophet muhammad', 'holy prophet', 'messenger of allah', 'rasool allah', 'rasulullah',
      'rasoolullah', 'burial of the prophet', 'washing of the prophet', 'prophet of islam',
      'about prophet muhammad', 'things mentioned about prophet muhammad',
      // Extended aliases
      'seal of prophets', 'seal of prophethood', 'khatam ul anbiya', 'khatam al anbiya',
      'last prophet', 'final prophet', 'prophet of mercy', 'mercy to worlds',
      'خاتم الانبیاء', 'نبی آخر الزمان', 'سرور کائنات', 'رحمۃ للعالمین', 'ختم نبوت',
      'رسول اللہ', 'پیغمبر اکرم', 'خاتم النبیین', 'نبی کریم', 'رسول خدا'
    ],
  },
  {
    entityName: 'Hamzah ibn Abd al-Muttalib (Chief of Martyrs / Asadullah)',
    passageType: 'letter',
    passageNumbers: [28],
    canonicalTerms: [
      'hamzah', 'hamza', 'sayyid al-shuhada hamzah', 'asadullah', 'uncle hamzah',
      'حمزہ', 'حمزہ بن عبد المطلب', 'سید الشہداء حمزہ'
    ],
  },
  {
    entityName: 'Ja\'far al-Tayyar (Ja\'far ibn Abi Talib / Dhu al-Janahayn)',
    passageType: 'letter',
    passageNumbers: [28, 23],
    canonicalTerms: [
      'jafar al-tayyar', 'ja\'far al-tayyar', 'jafar', 'dhu al-janahayn',
      'two wings in paradise', 'جعفر طیار', 'جعفر بن ابی طالب'
    ],
  },
  {
    entityName: 'Muhammad ibn al-Hanafiyyah (Banner of Jamal)',
    passageType: 'sermon',
    passageNumbers: [11],
    canonicalTerms: [
      'muhammad ibn al-hanafiyyah', 'ibn al-hanafiyyah', 'hanafiyyah', 'banner of jamal',
      'محمد بن الحنفیہ', 'ابن حنفیہ'
    ],
  },
  {
    entityName: 'Muhammad ibn Abi Bakr (Governor of Egypt)',
    passageType: 'letter',
    passageNumbers: [27, 34, 68],
    canonicalTerms: [
      'muhammad ibn abi bakr', 'muhammad bin abi bakr', 'martyrdom of muhammad ibn abi bakr',
      'محمد بن ابی بکر'
    ],
  },
  {
    entityName: 'Abdullah ibn Abbas (Ibn Abbas)',
    passageType: 'letter',
    passageNumbers: [18, 22, 35, 72, 240],
    canonicalTerms: [
      'ibn abbas', 'abdullah ibn abbas', 'abdullah bin abbas', 'ابن عباس', 'عبد اللہ بن عباس'
    ],
  },
  {
    entityName: 'Aisha (Umm al-Mu\'minin / Battle of Jamal)',
    passageType: 'sermon',
    passageNumbers: [13, 80, 156],
    canonicalTerms: [
      'aisha', 'ayesha', 'a\'ishah', 'mother of believers aisha', 'عائشہ'
    ],
  },
  {
    entityName: 'Amr ibn al-Aas',
    passageType: 'sermon',
    passageNumbers: [84, 39],
    canonicalTerms: [
      'amr ibn al-aas', 'amr ibn al-as', 'amr bin aas', 'عمرو بن العاص'
    ],
  },
  {
    entityName: 'Uthman ibn Affan (Third Caliph)',
    passageType: 'sermon',
    passageNumbers: [3, 30, 164, 240],
    canonicalTerms: [
      'uthman', 'uthman ibn affan', 'killing of uthman', 'murder of uthman', 'third caliph',
      'عثمان', 'عثمان بن عفان', 'قتل عثمان'
    ],
  },
  {
    entityName: 'Prophet Moses (Musa a.s.) & Pharaoh',
    passageType: 'sermon',
    passageNumbers: [160, 181, 192],
    canonicalTerms: [
      'prophet musa', 'prophet moses', 'musa', 'moses', 'pharaoh', 'firawn', 'موسیٰ', 'فرعون'
    ],
  },
  {
    entityName: 'Prophet Jesus (Isa ibn Maryam a.s.)',
    passageType: 'sermon',
    passageNumbers: [160],
    canonicalTerms: [
      'prophet isa', 'prophet jesus', 'isa ibn maryam', 'jesus', 'christ', 'عیسیٰ', 'عیسیٰ بن مریم'
    ],
  },
  {
    entityName: 'Prophet Adam (a.s.)',
    passageType: 'sermon',
    passageNumbers: [1, 91, 192],
    canonicalTerms: [
      'prophet adam', 'adam', 'creation of adam', 'حضرت آدم', 'آدم'
    ],
  },
  {
    entityName: 'Prophet Solomon (Sulayman a.s.)',
    passageType: 'sermon',
    passageNumbers: [182],
    canonicalTerms: [
      'prophet sulayman', 'prophet solomon', 'solomon', 'sulaiman', 'سلیمان', 'حضرت سلیمان'
    ],
  },
  {
    entityName: 'Dhi\'lib al-Yamani (Seeing Allah)',
    passageType: 'sermon',
    passageNumbers: [179],
    canonicalTerms: [
      'dhi\'lib', 'dhi\'lib al-yamani', 'did you see your lord', 'ذعلب الیمانی', 'ذعلب'
    ],
  },
  {
    entityName: 'Abu Dharr al-Ghifari (Exile to al-Rabadhah)',
    passageType: 'sermon',
    passageNumbers: [130],
    canonicalTerms: [
      'abu dharr', 'abu dhar', 'abu zarr', 'al-ghifari', 'rabadhah', 'exile of abu dharr',
      'ابوذر', 'ابوذر غفاری', 'ربذہ'
    ],
  },
  {
    entityName: 'Salman al-Farsi (Admonition on the World like a Snake)',
    passageType: 'letter',
    passageNumbers: [68],
    canonicalTerms: [
      'salman al-farsi', 'salman farsi', 'salman', 'snake', 'letter to salman',
      'سلمان فارسی', 'سلمان'
    ],
  },
  {
    entityName: 'Ammar ibn Yasir (Lamenting the Righteous Companions)',
    passageType: 'sermon',
    passageNumbers: [182, 92],
    canonicalTerms: [
      'ammar', 'ammar ibn yasir', 'ammar bin yasir', 'ayna ammar', 'where is ammar',
      'عمار', 'عمار بن یاسر', 'این عمار'
    ],
  },
  {
    entityName: 'Aqil ibn Abi Talib (The Red-Hot Iron & Public Treasury)',
    passageType: 'sermon',
    passageNumbers: [224, 36],
    canonicalTerms: [
      'aqil', 'aqeel', 'aqil ibn abi talib', 'red-hot iron', 'bayt al-mal',
      'عقیل', 'عقیل بن ابی طالب', 'لوہا'
    ],
  },
  {
    entityName: 'Moral Testament to Imam al-Hasan (a.s.)',
    passageType: 'letter',
    passageNumbers: [31],
    canonicalTerms: [
      'wasiiyat to imam hassan', 'wasiyat to imam hasan', 'wasiiyat to imam hasan',
      'wasiyat to imam hassan', 'wasiyat to son', 'wasiiyat to son', 'advice to son',
      'advice to his son', 'advice to hasan', 'testament to hasan', 'moral testament to hasan',
      'letter to son', 'al-hadirayn', 'hadirayn', 'letter 31', 'letter #31',
      'امام حسن کو وصیت', 'فرزند کو وصیت', 'وصیت نامہ', 'وصیت نامہ امام حسن'
    ],
  },
  {
    entityName: 'Final Will and Testament on Deathbed (to Hasan and Husayn)',
    passageType: 'letter',
    passageNumbers: [47],
    canonicalTerms: [
      'struck by ibn muljam', 'ibn muljam', 'deathbed', 'final will', 'dying will',
      'dying testament', 'testament to hasan and husayn', 'testament to his sons',
      'will to hasan and husayn', 'testament after being struck', 'letter 47', 'letter #47',
      'ابن ملجم', 'ضربت کے بعد وصیت', 'آخری وصیت', 'حسن اور حسین کو وصیت'
    ],
  },
  {
    entityName: 'Uthman ibn Hunayf (Governor of Basra / Feast of the Wealthy)',
    passageType: 'letter',
    passageNumbers: [45],
    canonicalTerms: [
      'uthman ibn hunayf', 'uthman bin hunayf', 'uthman bin hunaif', 'ibn hunayf',
      'banquet in basra', 'wealthy banquet', 'feast of the wealthy', 'two loaves of bread',
      'two loaves', 'simple food and garments', 'food of the servants', 'letter 45', 'letter #45',
      'عثمان بن حنیف', 'والی بصرہ', 'دعوت بصرہ', 'امیروں کی دعوت', 'دو روٹیاں', 'دسترخوان'
    ],
  },
  {
    entityName: 'Qadi Shurayh (Purchase of House for 80 Dinars)',
    passageType: 'letter',
    passageNumbers: [3],
    canonicalTerms: [
      'shurayh', 'qadi shurayh', 'judge shurayh', 'house for 80 dinars', '80 dinars',
      'eighty dinars', 'purchased a house for 80 dinars', 'letter 3', 'letter #3',
      'شریح', 'قاضی شریح', 'اسی دینار', '۸۰ دینار', 'مکان خریدا'
    ],
  },
  {
    entityName: 'Letter 50 (Circular to Commanders and Marshals of the Army)',
    passageType: 'letter',
    passageNumbers: [50],
    canonicalTerms: [
      'chiefs of army', 'army commanders', 'generals of army', 'commanders of army',
      'border guards', 'circular to the chiefs', 'chiefs of his army', 'letter 50', 'letter #50',
      'لشکر کے سرداروں', 'سالار لشکر', 'کمانڈروں', 'امرائه على الجيوش', 'اصحاب المسالح'
    ],
  },
  {
    entityName: 'Malik al-Ashtar (Governor of Egypt / Charter of Governance)',
    passageType: 'letter',
    passageNumbers: [53],
    canonicalTerms: [
      'malik ashtar', 'malik al-ashtar', 'malik-e-ashtar', 'malik al ashtar',
      'charter of governance', 'covenant of governance', 'governor of egypt',
      'letter 53', 'letter #53', 'مالک اشتر', 'مالک الاشتر', 'مصر', 'والی مصر', 'عہد نامہ مالک اشتر'
    ],
  },
  {
    entityName: 'Letter to Jarir ibn Abdillah al-Bajali (Envoy to Muawiyah)',
    passageType: 'letter',
    passageNumbers: [8],
    canonicalTerms: [
      'jarir', 'jarir ibn abdullah', 'jarir al-bajali', 'bajali', 'envoy to muawiyah',
      'letter 8', 'letter #8', 'جرير', 'جرير بن عبد الله'
    ],
  },
  {
    entityName: 'Sermon 27 (Jihad is one of the Doors of Paradise)',
    passageType: 'sermon',
    passageNumbers: [27],
    canonicalTerms: [
      'jihad is one of the doors of paradise', 'jihad is a door of paradise',
      'doors of paradise', 'protective armour of allah', 'sermon on jihad',
      'sermon 27', 'sermon #27', 'باب من ابواب الجنة', 'جہاد جنت کے دروازوں', 'جہاد کا خطبہ'
    ],
  },
  {
    entityName: 'Sermon 185 (Creation of the Ant, Locust, and Natural World)',
    passageType: 'sermon',
    passageNumbers: [185],
    canonicalTerms: [
      'creation of the ant', 'creation of ant', 'tiny limbs', 'gathers food',
      'creation of locust', 'creation of peacock', 'sermon 185', 'sermon #185',
      'خلق النملة', 'النملة', 'چیونٹی کی خلقت', 'چیونٹی کے پاؤں', 'چھوٹے جانور'
    ],
  },
  {
    entityName: 'Sermon 224 (Absolute Integrity / Snatching Barley Husk from an Ant)',
    passageType: 'sermon',
    passageNumbers: [224],
    canonicalTerms: [
      'husk of barley', 'seed of barley', 'disobey allah regarding an ant',
      'bit of honey', 'refusal of bribery', 'seven heavens', 'sermon 224', 'sermon #224',
      'سبع سموات', 'جلب شعيرة', 'حلوى', 'عقیل', 'چھلکا'
    ],
  },
  {
    entityName: 'Saying 150 (Warning: Do Not Hope for Afterlife Without Deeds)',
    passageType: 'saying',
    passageNumbers: [150],
    canonicalTerms: [
      'hopes for the afterlife without work', 'hopes for the next life without work',
      'hopes for afterlife without work', 'delays repentance by lengthening hopes',
      'delays repentance', 'speaks like the ascetics', 'saying 150', 'saying #150',
      'لا تكن ممن يرجو الآخرة بغير عمل', 'عمل کے بغیر آخرت کی امید', 'طولانی امیدوں'
    ],
  },
  {
    entityName: 'Saying 289 (Qualities of a True Brother in Allah)',
    passageType: 'saying',
    passageNumbers: [289],
    canonicalTerms: [
      'brother in allah', 'brother in faith', 'elevated in my eyes',
      'world was small in his eyes', 'world was humble in his eyes', 'past companion',
      'saying 289', 'saying #289', 'كان لي فيما مضى أخ في الله', 'کان لی فیما مضی اخ فی اللہ',
      'میرا ایک بھائی تھا', 'دنیا اس کی نگاہوں میں حقیر تھی'
    ],
  },
  {
    entityName: 'Shaqshaqiyya (Sermon on Caliphate and Patience)',
    passageType: 'sermon',
    passageNumbers: [3],
    canonicalTerms: [
      'shaqshaqiyya', 'shaqshaqia', 'shaqshaqiya', 'shiqshiqiyya', 'shiqshiqiyyah',
      'caliphate', 'first caliph', 'abu bakr', 'ibn abi quhafah',
      'most famous sermon', 'famous sermon', 'sermon 3', 'sermon #3', 'شقشقیہ', 'خطبہ شقشقیہ'
    ],
  },
  {
    entityName: 'Sermon of the Pious (Khutba al-Muttaqeen / Hammam)',
    passageType: 'sermon',
    passageNumbers: [193],
    canonicalTerms: [
      'muttaqeen', 'muttaqin', 'pious', 'qualities of pious', 'hammam',
      'sermon 193', 'sermon #193', 'متقین', 'ہمام', 'خطبہ متقین', 'پرہیزگار'
    ],
  },
  {
    entityName: 'Saying 147 (Discourse to Kumayl on Knowledge vs Wealth)',
    passageType: 'saying',
    passageNumbers: [147],
    canonicalTerms: [
      'saying 147', 'knowledge vs wealth', 'three types of people', 'bearers of knowledge',
      'قلوب اوعیہ', 'حکمت 147'
    ],
  },
  {
    entityName: 'Saying 81 (The Worth of Every Person)',
    passageType: 'saying',
    passageNumbers: [81],
    canonicalTerms: [
      'saying 81', 'worth of a person', 'value of every person', 'value of human',
      'قيمۃ كل امرئ', 'قیمۃ کل امرئ', 'قدر و قیمت', 'حکمت 81'
    ],
  },
  {
    entityName: 'Al-Qasi\'ah (The Sermon of Disparagement on Pride and Iblis)',
    passageType: 'sermon',
    passageNumbers: [192],
    canonicalTerms: [
      'qasiah', 'qasi\'ah', 'disparagement', 'pride', 'iblis', 'satan',
      'قاصعہ', 'خطبہ قاصعہ', 'تکبر', 'ابلیس'
    ],
  },
  {
    entityName: 'Al-Ashbah (The Sermon of Skeletons / Angels and Creation)',
    passageType: 'sermon',
    passageNumbers: [91],
    canonicalTerms: [
      'ashbah', 'skeletons', 'ghosts', 'creation of angels',
      'اشباح', 'خطبہ اشباح', 'فرشتے'
    ],
  },
  {
    entityName: 'Muawiyah / Ameer-e-Sham (Governor of Syria)',
    passageType: 'letter',
    passageNumbers: [6, 10, 17, 28, 32, 55, 64, 75],
    canonicalTerms: [
      'muawiya', 'muawiyah', 'moawiya', 'ameer e sham', 'ameer-e-sham', 'ameer sham',
      'ammere sham', 'amir e sham', 'amir sham', 'governor of syria',
      'amir of shaam', 'ruler of syria', 'muawiya ibn abi sufyan', 'muawiyah ibn abi sufyan',
      'معاویہ', 'معاوية', 'امیر شام', 'امیرِ شام', 'شام کے والی', 'اہل شام',
      'معاویہ بن ابی سفیان'
    ],
  },
  {
    entityName: 'Kumayl ibn Ziyad (Nature of Knowledge & Dua Kumayl)',
    passageType: 'dua',
    passageNumbers: [1],
    canonicalTerms: [
      'kumayl', 'kumail', 'dua kumayl', 'dua kumail',
      'کمیل', 'کمیل بن زیاد', 'دعائے کمیل', 'دعاء کمیل'
    ],
  },
  {
    entityName: 'Dua al-Sabah (Morning Supplication)',
    passageType: 'dua',
    passageNumbers: [2],
    canonicalTerms: [
      'sabah', 'dua sabah', 'morning prayer', 'morning supplication',
      'دعائے صباح', 'دعاء الصباح', 'صبح کی دعا'
    ],
  },
  {
    entityName: 'Munajat of Imam Ali in Masjid Kufa',
    passageType: 'dua',
    passageNumbers: [3],
    canonicalTerms: [
      'munajat', 'munajat kufa', 'masjid kufa', 'kufa prayer',
      'مناجات', 'مناجات مسجد کوفہ', 'مسجد کوفہ'
    ],
  },
  {
    entityName: 'Dua al-Istisqa (Supplication for Rain)',
    passageType: 'sermon',
    passageNumbers: [115, 143],
    canonicalTerms: [
      'istisqa', 'dua istisqa', 'prayer for rain', 'drought',
      'بارش کی دعا', 'استسقاء', 'قحط', 'طلب باران'
    ],
  },
  {
    entityName: 'Ziyad ibn Abihi (Accountability and Strict Governance)',
    passageType: 'letter',
    passageNumbers: [20, 21, 44],
    canonicalTerms: [
      'ziyad', 'ziyad ibn abihi', 'زیاد بن ابیہ'
    ],
  },
  {
    entityName: 'Battle of the Camel (Jamal / Talha, Zubayr, Aisha)',
    passageType: 'sermon',
    passageNumbers: [1, 8, 13, 31, 54, 137],
    canonicalTerms: [
      'jamal', 'camel', 'talha', 'zubayr', 'aisha',
      'جمل', 'طلحہ', 'زبیر', 'عائشہ'
    ],
  },
  {
    entityName: 'Battle of Siffin (Arbitration and Syrians)',
    passageType: 'sermon',
    passageNumbers: [35, 51, 56, 122, 124, 125],
    canonicalTerms: [
      'siffin', 'arbitration', 'tahkeem', 'quran on spears',
      'صفین', 'تحکیم', 'نیزوں پر قرآن'
    ],
  },
  {
    entityName: 'Kharijites / Battle of Nahrawan',
    passageType: 'sermon',
    passageNumbers: [36, 40, 58, 59, 60, 92, 122],
    canonicalTerms: [
      'khawarij', 'kharijites', 'nahrawan', 'no judgment but god',
      'خوارج', 'نہروان', 'لا حکم الا للہ'
    ],
  },
];

export class HybridSearchEngine {
  private static allPassages: any[] = canonicalPassagesJson as any[];

  /**
   * Normalizes Arabic text by removing tashkeel / harakat, normalizing alef, yaa, taa marbutah,
   * and standardizing Arabic and Western punctuation and whitespace.
   */
  public static normalizeArabic(text: string): string {
    if (!text) return '';
    return text
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // remove harakat / tashkeel & tatweel
      .replace(/[إأآا]/g, 'ا')
      .replace(/[يى]/g, 'ي')
      .replace(/[ةه]/g, 'ه')
      .replace(/[\u060C\u061B\u061F\u06D4.,\/#!$%\^&\*;:{}=\-_`~()«»؟?!\n\r\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /**
   * Cached pre-normalized Arabic corpus of all 799 canonical discourses for ultra-fast substring matching.
   */
  private static cachedNormalizedPassages: {
    type: PassageType;
    number: number;
    title: string;
    normArabic: string;
  }[] = (canonicalPassagesJson as any[]).map((p) => {
    const pType = (p.chapter || 'saying').toLowerCase() as PassageType;
    const pNum = typeof p.number === 'number' ? p.number : parseInt(p.number, 10);
    return {
      type: pType,
      number: pNum,
      title: p.title || '',
      normArabic: HybridSearchEngine.normalizeArabic(p.arabicText || ''),
    };
  });

  /**
   * Resolves raw Arabic quotations (e.g. from sermons, letters, sayings) to their exact canonical discourse
   * by matching normalized multi-word n-gram sequences against the entire 799-discourse corpus.
   */
  public static resolveArabicQuotePassage(query: string): { type: PassageType; number: number } | null {
    if (!query || !/[\u0600-\u06FF]/.test(query)) return null;

    const normQ = this.normalizeArabic(query);
    const words = normQ.split(' ').filter((w) => w.length > 1);
    if (words.length < 3) return null;

    // For longer quotes (>= 6 words), require at least 5 words or substantial phrase length
    // to prevent common liturgical formulas (e.g. "لا اله الا هو", "الحمد لله الذي") from creating false matches
    const minSize = words.length >= 6 ? Math.min(5, words.length) : 3;

    let bestMatch: { type: PassageType; number: number; size: number } | null = null;
    let maxPhraseLen = 0;

    for (let size = Math.min(words.length, 12); size >= minSize; size--) {
      for (let i = 0; i <= words.length - size; i++) {
        const phrase = words.slice(i, i + size).join(' ');
        if (phrase.length < 12) continue;

        // Skip ubiquitous short liturgical formulas if they are the only match
        if (
          size <= 4 &&
          (phrase === 'لا اله الا هو' ||
            phrase === 'الحمد لله الذي' ||
            phrase === 'صلي الله عليه' ||
            phrase === 'اما بعد فان')
        ) {
          continue;
        }

        for (const p of this.cachedNormalizedPassages) {
          if (p.normArabic.includes(phrase)) {
            if (phrase.length > maxPhraseLen) {
              maxPhraseLen = phrase.length;
              bestMatch = { type: p.type, number: p.number, size };
            }
          }
        }
      }
      const current: { type: PassageType; number: number; size: number } | null = bestMatch;
      if (current && current.size >= 4) break;
    }

    const finalMatch: { type: PassageType; number: number; size: number } | null = bestMatch;
    return finalMatch ? { type: finalMatch.type, number: finalMatch.number } : null;
  }

  /**
   * Extracts an explicitly referenced passage type and number from any English or Urdu query.
   * e.g. "tell me about letter no 31" -> { type: 'letter', number: 31 }
   * e.g. "خطبہ نمبر 193" -> { type: 'sermon', number: 193 }
   */
  public static extractExplicitPassage(query: string): { type: PassageType; number: number } | null {
    const q = query.toLowerCase().trim();

    // 1. English patterns: letter 31, letter no 31, sermon #3, saying 81, dua 1
    const enMatch = q.match(/\b(letter|sermon|khutbah?|saying|maxim|aphorism|dua|supplication)\s*(?:no\.?|#|number)?\s*(\d+)\b/i);
    if (enMatch) {
      const rawType = enMatch[1].toLowerCase();
      const type: PassageType =
        rawType.startsWith('letter') ? 'letter' :
        rawType.startsWith('sermon') || rawType.startsWith('khutba') ? 'sermon' :
        rawType.startsWith('dua') || rawType.startsWith('supplication') ? 'dua' : 'saying';
      return { type, number: parseInt(enMatch[2], 10) };
    }

    // 2. Urdu patterns: خطبہ نمبر 3, مکتوب 31, خط 53, حکمت 81, دعا 1
    const urduMatch = q.match(/(خطبہ|خطبے|مکتوب|خط|حکمت|قول|دعا)\s*(?:نمبر|نمبر؟)?\s*(\d+)/i) ||
                      q.match(/(\d+)\s*(?:واں|ویں)?\s*(خطبہ|مکتوب|خط|حکمت|قول|دعا)/i);
    if (urduMatch) {
      const term = urduMatch[1] || urduMatch[2];
      const num = urduMatch[2] && !isNaN(parseInt(urduMatch[2])) ? urduMatch[2] : urduMatch[1];
      const type: PassageType =
        (term === 'مکتوب' || term === 'خط') ? 'letter' :
        (term === 'خطبہ' || term === 'خطبے') ? 'sermon' :
        (term === 'دعا') ? 'dua' : 'saying';
      return { type, number: parseInt(num, 10) };
    }

    return null;
  }

  /**
   * Resolves query to an exact canonical passage if it matches unique historical entities or canonical discourse titles.
   * When an entity has multiple candidate passages, scores each candidate against query content and returns the best match.
   * e.g. "wasiiyat to imam hassan" -> { type: 'letter', number: 31 }
   * e.g. "lady of heaven" -> { type: 'sermon', number: 202 }  (Fatima burial sermon, NOT sermon #1)
   * e.g. "uthman ibn hunayf" -> { type: 'letter', number: 45 }
   * e.g. "shurayh 80 dinars" -> { type: 'letter', number: 3 }
   * e.g. "ibn muljam deathbed" -> { type: 'letter', number: 47 }
   * e.g. "jihad is one of the doors of paradise" -> { type: 'sermon', number: 27 }
   */
  public static resolveEntityPassage(query: string): { type: PassageType; number: number } | null {
    if (!query) return null;

    // 1. Direct Arabic Quote Match (conclusive exact phrase match)
    const arabicQuote = this.resolveArabicQuotePassage(query);
    if (arabicQuote) {
      return arabicQuote;
    }

    const q = query.toLowerCase().trim();

    // Find the best matching entity (longest canonical term wins for specificity)
    let bestEntityMatch: { entity: EntityMatch; termLength: number } | null = null;

    for (const entity of HISTORICAL_ENTITIES) {
      if (!entity.passageNumbers || entity.passageNumbers.length < 1) continue;
      for (const term of entity.canonicalTerms) {
        const tLower = term.toLowerCase();
        if (q.includes(tLower)) {
          if (!bestEntityMatch || tLower.length > bestEntityMatch.termLength) {
            bestEntityMatch = { entity, termLength: tLower.length };
          }
        }
      }
    }

    if (!bestEntityMatch) return null;

    const { entity } = bestEntityMatch;
    const defaultType: PassageType = entity.passageType || 'sermon';

    // If only 1 candidate, return it directly — no scoring needed
    if (entity.passageNumbers!.length === 1) {
      return { type: defaultType, number: entity.passageNumbers![0] };
    }

    // Multiple candidates — score each against the actual query content to pick the most relevant one
    const queryTokens = q
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);

    // Expand transliteration variations (e.g. hussain <-> husayn, hasan <-> hassan)
    const expandedTokens = new Set<string>();
    for (const t of queryTokens) {
      expandedTokens.add(t);
      if (t.includes('ss')) expandedTokens.add(t.replace(/ss/g, 's'));
      if (t.includes('hus')) {
        expandedTokens.add('husayn');
        expandedTokens.add('hussain');
        expandedTokens.add('husain');
        expandedTokens.add('حسین');
      }
      if (t.includes('has')) {
        expandedTokens.add('hasan');
        expandedTokens.add('hassan');
        expandedTokens.add('حسن');
      }
      if (t.includes('fatim')) {
        expandedTokens.add('fatima');
        expandedTokens.add('fatimah');
        expandedTokens.add('فاطم');
      }
    }

    // Build candidate list from candidatePassages or passageNumbers
    const candidates: Array<{ type: PassageType; number: number }> =
      entity.candidatePassages && entity.candidatePassages.length > 0
        ? entity.candidatePassages
        : (entity.passageNumbers || []).map((num) => ({ type: defaultType, number: num }));

    let bestScore = -1;
    let bestPassage: { type: PassageType; number: number } = candidates[0];

    for (const cand of candidates) {
      const passage = this.allPassages.find((p) => {
        const pt = (p.chapter || 'saying').toLowerCase() as PassageType;
        const pn = typeof p.number === 'number' ? p.number : parseInt(p.number, 10);
        return pt === cand.type && pn === cand.number;
      });

      if (!passage) continue;

      const pType = (passage.chapter || 'saying').toLowerCase() as PassageType;
      const pTitle = (passage.title || '').toLowerCase();
      const pEng = (passage.translationText || '').toLowerCase();
      const pUrdu = (passage.urduTranslation || '').toLowerCase();
      const pTopics = ((passage.topics || []) as string[]).join(' ').toLowerCase();

      let score = 0;
      for (const token of expandedTokens) {
        if (pTitle.includes(token)) score += 10;
        if (pEng.includes(token)) score += 3;
        if (pUrdu.includes(token)) score += 3;
        if (pTopics.includes(token)) score += 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestPassage = { type: pType, number: cand.number };
      }
    }

    return bestPassage;
  }

  /**
   * Resolves an explicitly requested passage or, if the user query is a follow-up or
   * pronoun inquiry (e.g. "yes", "read completely", "what was the content of letter", "explain it"),
   * resolves the active passage from sliding conversation history.
   */
  public static resolveContextualPassage(
    query: string,
    historySummary?: string | null
  ): { type: PassageType; number: number } | null {
    // 1. Direct explicit in current query
    const direct = this.extractExplicitPassage(query) || this.resolveEntityPassage(query);
    if (direct) return direct;

    if (!historySummary) return null;

    const trimmed = query.trim().toLowerCase();

    // 2. Follow-up intent detection (including affirmative requests like "yes", "read completely", "جی ہاں")
    const isAffirmative =
      /^(yes|yeah|sure|yep|yup|ok|okay|please|read|show|read completely|show full|show full text|full text|read full|complete)$/i.test(trimmed) ||
      /^(جی ہاں|ہاں|جی|مکمل پڑھائیں|مکمل متن|پورا پڑھائیں|دکھائیں|جی ضرور)$/.test(trimmed);

    const isFollowUp =
      isAffirmative ||
      /\b(content|meaning|translation|text|read|explain|tell me|more|about|context|full|urdu|arabic|detail|it|this|that|letter|sermon|saying|dua)\b/i.test(query) ||
      /وضاحت|مطلب|ترجمہ|تفصیل|خلاصہ|اس|یہ|خط|خطبہ|مکتوب|کلام/i.test(query);

    if (!isFollowUp) return null;

    // 3. Scan sliding history backwards from most recent message
    const lines = historySummary.split('\n').reverse();
    for (const line of lines) {
      const found = this.extractExplicitPassage(line) || this.resolveEntityPassage(line);
      if (found) {
        // Enforce category filter if current message narrowed it
        const wantsLetter = /\bletter\b|خط\b|مکتوب\b/i.test(query);
        const wantsSermon = /\bsermon\b|خطبہ\b/i.test(query);
        const wantsDua = /\bdua\b|دعا\b/i.test(query);
        const wantsSaying = /\bsaying\b|حکمت\b/i.test(query);

        if (wantsLetter && found.type !== 'letter') continue;
        if (wantsSermon && found.type !== 'sermon') continue;
        if (wantsDua && found.type !== 'dua') continue;
        if (wantsSaying && found.type !== 'saying') continue;

        return found;
      }
    }

    return null;
  }

  /**
   * Performs high-precision lexical and entity search across the entire 799 canonical corpus.
   */
  public static searchLexical(
    query: string,
    limit: number = 6,
    filters?: { passageType?: PassageType; passageNumber?: number }
  ): RetrievedDocument[] {
    const rawLower = query.toLowerCase().trim();
    if (!rawLower) return [];

    // Extract explicit passage or resolve from historical entity mapping
    const explicitPassage = this.extractExplicitPassage(query) || this.resolveEntityPassage(query);

    let requestedType: PassageType | undefined = filters?.passageType || explicitPassage?.type;
    let requestedNumber: number | undefined = filters?.passageNumber !== undefined ? filters.passageNumber : explicitPassage?.number;

    // 1. Detect Category Intent from query keywords if still undefined
    if (!requestedType) {
      if (/\bletter\b|\bletters\b|خط\b|مکتوب\b|مکتوبات\b/.test(rawLower)) {
        requestedType = 'letter';
      } else if (/\bsermon\b|\bsermons\b|خطبہ\b|خطبات\b/.test(rawLower)) {
        requestedType = 'sermon';
      } else if (/\bsaying\b|\bsayings\b|\bmaxim\b|\baphorism\b|حکمت\b|قول\b|اقوال\b/.test(rawLower)) {
        requestedType = 'saying';
      } else if (/\bdua\b|\bprayer\b|\bsupplication\b|دعا\b|مناجات\b/.test(rawLower)) {
        requestedType = 'dua';
      }
    }

    // 2. Extract Specific Number if mentioned and not yet resolved
    if (requestedNumber === undefined) {
      const numMatch = rawLower.match(/(?:letter|sermon|saying|khutba|خط|مکتوب|حکمت)\s*(?:#|no\.?|number)?\s*(\d+)/i) ||
                       rawLower.match(/(\d+)\s*(?:نمبر|خط|خطبہ|حکمت)/i);
      if (numMatch) {
        requestedNumber = parseInt(numMatch[1], 10);
      }
    }

    // 3. Resolve Historical Entities & Aliases
    const matchedEntities: EntityMatch[] = [];
    for (const entity of HISTORICAL_ENTITIES) {
      for (const term of entity.canonicalTerms) {
        if (rawLower.includes(term.toLowerCase())) {
          matchedEntities.push(entity);
          break;
        }
      }
    }

    // Tokenize terms (ignoring common grammatical noise)
    const normArabicQuery = /[\u0600-\u06FF]/.test(rawLower) ? HybridSearchEngine.normalizeArabic(rawLower) : '';
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'that', 'to', 'for',
      'show', 'me', 'what', 'imam', 'ali', 'write', 'wrote', 'says', 'said', 'tell',
      'things', 'thing', 'mentioned', 'mention', 'mentions', 'about', 'hazrat', 'say',
      'does', 'did', 'do', 'any', 'all', 'give', 'detail', 'details', 'us', 'are', 'was',
      'related', 'regarding', 'concerning', 'explain', 'explanation', 'view', 'views',
      'personality', 'personalities', 'person', 'quote', 'quotes', 'reference', 'references',
      // Common prepositions & pronouns causing false-positive BM25 ties
      'of', 'from', 'his', 'her', 'by', 'with', 'its', 'our', 'your', 'their', 'my',
      'he', 'she', 'they', 'we', 'it', 'this', 'these', 'those', 'be', 'been', 'has',
      'have', 'had', 'will', 'would', 'shall', 'should', 'may', 'might', 'can', 'could',
      'not', 'no', 'nor', 'but', 'or', 'so', 'yet', 'as', 'up', 'out', 'if', 'then',
      'than', 'when', 'where', 'who', 'whom', 'whose', 'how', 'why', 'each', 'every',
      'some', 'such', 'into', 'through', 'over', 'under', 'after', 'before', 'between'
    ]);
    const tokens = rawLower
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !stopWords.has(t));

    const scoredPassages: { passage: any; score: number }[] = [];

    for (const p of this.allPassages) {
      const pType = (p.chapter || 'saying').toLowerCase() as PassageType;
      const pNum = typeof p.number === 'number' ? p.number : parseInt(p.number, 10);

      // If user specified an exact number and type, guarantee absolute top score
      if (requestedNumber !== undefined && pNum === requestedNumber) {
        if (!requestedType || pType === requestedType) {
          scoredPassages.push({ passage: p, score: 2500.0 });
          continue;
        }
      }

      let score = 0;

      // Direct normalized Arabic phrase match bonus
      if (normArabicQuery && normArabicQuery.length >= 10) {
        const pNorm = HybridSearchEngine.normalizeArabic(p.arabicText || '');
        if (pNorm.includes(normArabicQuery)) {
          score += 2000.0;
        }
      }

      // Entity match bonus
      for (const entity of matchedEntities) {
        if (entity.passageNumbers?.includes(pNum)) {
          score += 150.0;
        }
      }

      // Category match
      if (requestedType && pType === requestedType) {
        score += 2.0;
      }

      const pTitle = (p.title || '').toLowerCase();
      const pArabic = (p.arabicText || '').toLowerCase();
      const pEnglish = (p.translationText || '').toLowerCase();
      const pUrdu = (p.urduTranslation || '').toLowerCase();
      const pTopics = (p.topics || []).join(' ').toLowerCase();

      // Token matching
      for (const token of tokens) {
        if (pTitle.includes(token)) score += 3.5;
        if (pArabic.includes(token)) score += 2.5;
        if (pUrdu.includes(token)) score += 2.5;
        if (pEnglish.includes(token)) score += 2.0;
        if (pTopics.includes(token)) score += 1.5;
      }

      if (score > 1.5) {
        scoredPassages.push({ passage: p, score });
      }
    }

    // Sort descending by relevance score
    scoredPassages.sort((a, b) => b.score - a.score);

    // Map to RetrievedDocument format
    return scoredPassages.slice(0, limit).map(({ passage: p, score }) => {
      const pType = (p.chapter || 'saying').toLowerCase() as PassageType;
      const pNum = typeof p.number === 'number' ? p.number : parseInt(p.number, 10);

      return {
        id: `lexical_${pType}_${pNum}`,
        content: p.translationText || p.urduTranslation || p.arabicText || '',
        metadata: {
          book: 'Nahj al-Balagha',
          sourceId: `src_${pType}_${pNum}`,
          passageType: pType,
          passageNumber: pNum,
          passageTitle: p.title || null,
          language: 'english',
          translator: p.translator || 'Syed Ali Reza / Allama Zeeshan Haider Jawadi',
          contentType: 'translation',
          commentaryAuthor: null,
          chapter: pType,
          section: p.section || pType,
          chunkIndex: 0,
          totalChunks: 1,
          arabicOriginal: p.arabicText || null,
          urduTranslation: p.urduTranslation || null,
          topics: p.topics || [],
          ingestedAt: new Date().toISOString(),
          chunkSize: (p.translationText || p.arabicText || '').length,
        },
        score: Math.min(1.0, score / 15.0),
      };
    });
  }

  /**
   * Retrieves a verified canonical document directly from the complete corpus
   */
  public static getExactPassage(type: PassageType, number: number): RetrievedDocument | null {
    const found = this.allPassages.find((p) => {
      const pType = (p.chapter || 'saying').toLowerCase() as PassageType;
      const pNum = typeof p.number === 'number' ? p.number : parseInt(p.number, 10);
      return pType === type && pNum === number;
    });

    if (!found) return null;

    const pType = (found.chapter || 'saying').toLowerCase() as PassageType;
    const pNum = typeof found.number === 'number' ? found.number : parseInt(found.number, 10);

    return {
      id: `doc_${pType}_${pNum}`,
      content: found.translationText || found.arabicText || '',
      metadata: {
        book: 'Nahj al-Balagha',
        sourceId: `src_${pType}_${pNum}`,
        passageType: pType,
        passageNumber: pNum,
        passageTitle: found.title || `${pType.toUpperCase()} #${pNum}`,
        language: 'english',
        translator: found.translator || 'Syed Ali Reza / Allama Zeeshan Haider Jawadi',
        contentType: 'translation',
        commentaryAuthor: null,
        chapter: pType,
        section: found.section || pType,
        chunkIndex: 0,
        totalChunks: 1,
        arabicOriginal: found.arabicText || null,
        urduTranslation: found.urduTranslation || null,
        topics: found.topics || [],
        ingestedAt: new Date().toISOString(),
        chunkSize: (found.translationText || found.arabicText || '').length,
      },
      score: 1.0,
    };
  }
}
