const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'docs');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function escapePdfText(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\r\n]+/g, ' ');
}

/**
 * Builds a valid, multi-page PDF 1.4 file with exact xref table and object offsets.
 */
function buildMultiPagePdf(docTitle, docSubtitle, pages) {
  const objects = []; // Array of object string content
  const totalPages = pages.length;

  // Object 1: Catalog
  // Object 2: Pages
  // Object 3: Font
  // For each page i (0 to totalPages - 1):
  //   Page obj: 4 + i * 2
  //   Content obj: 5 + i * 2

  const fontObjId = 3;
  const pageObjIds = [];
  for (let i = 0; i < totalPages; i++) {
    pageObjIds.push(4 + i * 2);
  }

  // Object 1: Catalog
  const obj1 = `<< /Type /Catalog /Pages 2 0 R >>`;
  // Object 2: Pages
  const kidsStr = pageObjIds.map((id) => `${id} 0 R`).join(' ');
  const obj2 = `<< /Type /Pages /Kids [${kidsStr}] /Count ${totalPages} >>`;
  // Object 3: Font
  const obj3 = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;

  const pageObjects = [];
  const contentObjects = [];

  for (let i = 0; i < totalPages; i++) {
    const pageObjId = 4 + i * 2;
    const contentObjId = 5 + i * 2;
    const pageData = pages[i];
    const pageNum = i + 1;

    // Build PDF content stream
    let streamText = `BT\n`;

    // Header banner
    streamText += `/F1 9 Tf\n`;
    streamText += `50 800 Td\n`;
    streamText += `(${escapePdfText(docTitle)} - Canonical Digital Edition) Tj\n`;
    streamText += `380 0 Td\n`;
    streamText += `(Nahj al-Balagha) Tj\n`;

    // Horizontal rule line simulation
    streamText += `-380 -12 Td\n`;
    streamText += `(_____________________________________________________________________________________) Tj\n`;

    // Page Title
    streamText += `/F1 16 Tf\n`;
    streamText += `0 -35 Td\n`;
    streamText += `(${escapePdfText(pageData.heading || '')}) Tj\n`;

    if (pageData.subheading) {
      streamText += `/F1 11 Tf\n`;
      streamText += `0 -20 Td\n`;
      streamText += `(${escapePdfText(pageData.subheading)}) Tj\n`;
    }

    // Body Lines
    streamText += `/F1 10 Tf\n`;
    let currentY = -28;
    for (const line of pageData.lines || []) {
      streamText += `0 ${currentY} Td\n`;
      streamText += `(${escapePdfText(line)}) Tj\n`;
      currentY = -16; // line spacing
    }

    // Footer: Page Number
    streamText += `/F1 9 Tf\n`;
    streamText += `0 -50 Td\n`;
    streamText += `(Page ${pageNum} of ${totalPages}  |  Compiled by al-Sharif al-Radi - 406 AH) Tj\n`;

    streamText += `ET`;

    const streamLength = Buffer.byteLength(streamText, 'utf8');

    // Page Object
    const pageObj = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 ${fontObjId} 0 R >> >> >>`;
    // Content Object
    const contentObj = `<< /Length ${streamLength} >>\nstream\n${streamText}\nendstream`;

    pageObjects.push({ id: pageObjId, content: pageObj });
    contentObjects.push({ id: contentObjId, content: contentObj });
  }

  // Combine all objects in sequential order
  const allObjects = [
    { id: 1, content: obj1 },
    { id: 2, content: obj2 },
    { id: 3, content: obj3 },
  ];

  for (let i = 0; i < totalPages; i++) {
    allObjects.push(pageObjects[i]);
    allObjects.push(contentObjects[i]);
  }

  // Assemble the PDF binary/string and calculate xref offsets
  let pdf = `%PDF-1.4\n`;
  const offsets = [0]; // offset for obj 0 (special)

  for (const obj of allObjects) {
    const offset = Buffer.byteLength(pdf, 'utf8');
    offsets[obj.id] = offset;
    pdf += `${obj.id} 0 obj\n${obj.content}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${allObjects.length + 1}\n`;
  pdf += `0000000000 65535 f \n`;

  for (let i = 1; i <= allObjects.length; i++) {
    const off = offsets[i] || 0;
    pdf += `${off.toString().padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${allObjects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}

// -------------------------------------------------------------
// 1. English Edition Pages (15 Pages)
// -------------------------------------------------------------
const englishPages = [
  {
    heading: 'Nahj al-Balagha (Peak of Eloquence)',
    subheading: 'Authoritative English Edition - Translated by Syed Ali Reza',
    lines: [
      'Compiler: al-Sharif al-Radi (al-Sayyid al-Radi, d. 406 AH)',
      'Publisher: Canonical Knowledge Library Edition',
      '',
      'Dedicated to the immortal sermons, letters, sayings, and supplications of',
      'Amir al-Muminin Ali ibn Abi Talib (peace be upon him).',
      '',
      'Foreword:',
      'Nahj al-Balagha is widely regarded as a masterpiece of Arabic prose and spiritual eloquence.',
      'It compiles discourses delivered over fourteen centuries ago that continue to inspire',
      'moral philosophy, ethical governance, theological reflection, and social justice.',
      '',
      'This volume presents unabridged selections and thematic chapters for serious learners,',
      'researchers, and spiritual seekers around the world.',
    ],
  },
  {
    heading: 'Table of Contents & Canonical Structure',
    subheading: 'General Index of the Four Major Sections',
    lines: [
      'PART I: THE SACRED SERMONS (AL-KHUTBAT)',
      '  - Sermon 1: On the Creation of Universe, Angels, and Foremost in Religion (Tawhid)',
      '  - Sermon 3: The Famous Discourse of ash-Shaqshaqiyya',
      '  - Sermon 193: Khutba al-Muttaqeen (The Virtues of the Pious to Hammam)',
      '  - Sermon 216: Mutual Rights and Responsibilities of the Ruler and the Ruled',
      '  - Sermon 224: The Episode of Aqil and Absolute Inviolability of Public Wealth',
      '',
      'PART II: LETTERS AND TREATISES OF GOVERNANCE (AL-MAKTUBAT)',
      '  - Letter 53: The Famous Charter of Governance Sent to Malik al-Ashtar in Egypt',
      '  - Letter 31: Enduring Moral Counsel and Will to His Son Imam al-Hasan',
      '',
      'PART III: MORAL APHORISMS AND MAXIMS (AL-HIKAM)',
      '  - Saying 1: Navigating Civil Strife and Seditious Discord',
      '  - Saying 81: The Real Worth and Dignity of Every Human Being',
      '  - Saying 147: Discourse to Kumayl ibn Ziyad on Knowledge vs Accumulation of Wealth',
      '  - Saying 150: The Danger of Empty Hopes vs Sincere Righteous Deeds',
      '',
      'PART IV: SUPPLICATIONS AND PRAYERS (AL-ADIYAH)',
      '  - Du\'a 215: Supplication of Reliance upon Allah in Times of Trial',
      '  - Du\'a 115: Prayer for Rain and Sustenance (Istisqa)',
    ],
  },
  {
    heading: 'Preface by al-Sharif al-Radi (406 AH)',
    subheading: 'On the Motive and Method of Compiling Nahj al-Balagha',
    lines: [
      'In the Name of Allah, the Beneficent, the Merciful.',
      'All praise is due to Allah, who made eloquence the ornament of expression, and prayer',
      'upon His Messenger Muhammad, the seal of prophets, and upon his pure progeny.',
      '',
      'In my youth, I began writing a book on the characteristics of the Imams (Khasa\'is al-A\'immah).',
      'When I arrived at the account of Amir al-Muminin Ali ibn Abi Talib, I observed that his words',
      'possessed a brilliance unlike any human discourse, combining the miraculous power of divine',
      'speech with the deepest realities of human wisdom.',
      '',
      'I was requested by scholars and lovers of wisdom to compile a separate book containing the',
      'finest specimens of his speeches, letters, and sayings, which I titled Nahj al-Balagha',
      '(The Peak of Eloquence), for it opens the doors of eloquence and invites reflection upon truth.',
    ],
  },
  {
    heading: 'Sermon 1: On Creation and Divine Oneness (Tawhid)',
    subheading: 'Praise of Allah, Creation of the Universe, and the Purpose of Prophets',
    lines: [
      'Praise is due to Allah whose worth cannot be described by speakers, whose bounties cannot be counted',
      'by calculators, and whose claim to obedience cannot be satisfied by those who attempt to do so.',
      'He whom the height of intellectual courage cannot appreciate, and the divings of understanding cannot reach.',
      '',
      'He for whose description no limit has been laid down, no eulogy exists, no time is ordained,',
      'and no duration is fixed. He brought forth creation through His Omnipotence, dispersed winds',
      'through His Compassion, and made firm the shaking earth with rocks.',
      '',
      'The foremost in religion is the acknowledgement of Him (Ma\'rifatullah), the perfection of',
      'acknowledging Him is to testify Him, the perfection of testifying Him is to believe in His Oneness,',
      'and the perfection of believing in His Oneness is to regard Him Pure.',
    ],
  },
  {
    heading: 'Sermon 3: The Discourse of ash-Shaqshaqiyya',
    subheading: 'Historical Reflection on Caliphate, Patience, and Assumption of Responsibility',
    lines: [
      'Beware, by Allah! The son of Abu Quhafah dressed himself with the caliphate while he well knew',
      'that my position in relation to it was like that of the axle to the millstone. The torrent of wisdom',
      'flows from me and no bird can soar high enough to reach me.',
      '',
      'Yet I adopted patience, although there was pricking in my eye and choking in my throat. I watched',
      'the plundering of my inheritance until the first passed away and entrusted it to another.',
      '',
      'When the people rushed toward me from every direction like the mane of a hyena to pledge allegiance,',
      'I took up the reins of government only because of the covenant that Allah has laid upon scholars:',
      'that they shall not remain silent over the gluttony of the oppressor nor the hunger of the oppressed.',
    ],
  },
  {
    heading: 'Sermon 193: Khutba al-Muttaqeen (Part I)',
    subheading: 'Description of the God-Fearing Delivered to Hammam ibn Shurayh',
    lines: [
      'Now then, Allah the Glorified created the creation without needing their obedience or being',
      'in danger of their disobedience. He distributed among them their livelihood and assigned them',
      'their stations in the worldly life.',
      '',
      'The God-fearing (al-Muttaqun) in this world are people of true distinction: their speech is right to',
      'the point, their dress is moderate, and their gait is humble.',
      '',
      'They keep their eyes closed to whatever Allah has made unlawful for them, and they dedicate their ears',
      'to that knowledge which is beneficial to them.',
      '',
      'In times of tribulation and hardship, they remain serene and steadfast just as they remain in times of ease.',
    ],
  },
  {
    heading: 'Sermon 193: Khutba al-Muttaqeen (Part II)',
    subheading: 'Night Vigil, Sincerity in Devotion, and Day-to-Day Character',
    lines: [
      'At night, they stand in rows reciting parts of the Holy Qur\'an, chanting it in a measured cadence,',
      'stirring their souls with its reminders, and seeking through it the cure for their spiritual ailments.',
      '',
      'When they come across a verse inspiring hope, they eagerly focus upon it and yearn for its realization;',
      'and when they come across a verse inspiring awe, they listen to it with the ear of their heart as though',
      'the roaring of the Fire and its flames were within their hearing.',
      '',
      'During the day, they are wise scholars, virtuous citizens, and righteous doers. Fear of Allah has',
      'shaped them into pillars of strength. If you gaze upon them, you see pure sincerity free of malice.',
    ],
  },
  {
    heading: 'Sermon 216: The Mutual Rights of Ruler and Ruled',
    subheading: 'Delivered at the Field of Siffin on Justice and Civic Equilibrium',
    lines: [
      'Allah the Glorified has established for me a right over you through my administration of your affairs,',
      'and you have over me a right similar to what I have over you.',
      '',
      'Right (al-Haqq) is the most extensive thing in verbal description, but the most narrow in practical realization.',
      'It does not run for anyone unless it also runs against them, and it does not run against anyone unless',
      'it also runs in their favor.',
      '',
      'When the subjects fulfill the rights of the ruler, and the ruler fulfills the rights of the subjects,',
      'justice becomes firmly established, the pathways of religion become clear, and peace reigns in society.',
    ],
  },
  {
    heading: 'Sermon 224: The Episode of Aqil and Public Wealth',
    subheading: 'On Absolute Integrity and Refusal to Exploit the Public Treasury (Bayt al-Mal)',
    lines: [
      'By Allah! I saw my brother Aqil in severe destitution, asking me for a single measure of grain from',
      'your public treasury. His children were disheveled with hunger, their faces pale like dust.',
      '',
      'He repeatedly urged me, and I heated a piece of iron in fire and brought it near his body so he might take',
      'a lesson. He screamed in pain, and I said to him:',
      '',
      '"O Aqil! Do you cry out from a flame made by man for sport, while you attempt to drag me to a Fire',
      'kindled by the Almighty in His Wrath?"',
      '',
      'By Allah! Even if I were given the seven realms and all that exists under their heavens to disobey Allah',
      'by taking the husk of a barley grain from the mouth of an ant, I would never do so!',
    ],
  },
  {
    heading: 'Letter 53: The Charter of Governance (Part I)',
    subheading: 'Principles of Justice and Compassion Addressed to Malik al-Ashtar',
    lines: [
      'This is what Allah\'s servant Ali, Commander of the Faithful, ordered Malik ibn al-Harith al-Ashtar',
      'upon appointing him governor of Egypt: to collect its revenues, combat its enemies, reform its people,',
      'and develop its lands with prosperity.',
      '',
      'Habituate your heart to mercy for the subjects and to affection and kindness for them.',
      'Do not stand over them like a predatory beast that seizes upon them to devour them, for they are of two types:',
      '',
      'EITHER YOUR BROTHER IN RELIGION, OR YOUR EQUAL IN CREATION.',
      '',
      'They commit mistakes, lapses occur to them intentionally and unintentionally. Therefore, grant them your',
      'pardon and forgiveness in the same way you desire Allah to grant you His pardon and forgiveness.',
    ],
  },
  {
    heading: 'Letter 53: The Charter of Governance (Part II)',
    subheading: 'Judicial Integrity, Economic Prosperity, and Care for the Underprivileged',
    lines: [
      'Select as the chief judge among your people the one who is most distinguished in character, whom complexities',
      'do not confuse, who does not become angry over disputes, and who refuses bribery and deceit.',
      '',
      'Pay close attention to the development of the land more than to the collection of tax, for tax cannot',
      'be gathered except through prosperity, and whoever demands tax without development ruins the land.',
      '',
      'Then beware, by Allah, concerning the lowest class of society—the destitute, the orphans, the handicapped,',
      'and the needy who have no means of livelihood. Appoint for them a designated share from the central treasury,',
      'for you will be held accountable before Allah for their welfare.',
    ],
  },
  {
    heading: 'Letter 31: Moral Counsel to His Son Imam al-Hasan',
    subheading: 'Written at al-Hadirin: The Foundations of Ethics, Wisdom, and Life',
    lines: [
      'From the father who is about to depart, acknowledging the passage of time, to the son who desires',
      'that which cannot be fully attained.',
      '',
      'O my son! Make yourself a fair scale between yourself and others. Love for others what you love for yourself,',
      'and dislike for others what you dislike for yourself.',
      '',
      'Do not oppress anyone just as you do not wish to be oppressed. Do good to others just as you wish good to be',
      'done to you. Regard as bad in yourself whatever you regard as bad in others.',
      '',
      'Know that wealth does not remain, and the world is like a shadow that diminishes. Provide yourself with the',
      'best provision, and the best provision is Taqwa (mindfulness of Allah).',
    ],
  },
  {
    heading: 'Selected Sayings and Moral Maxims (Al-Hikam)',
    subheading: 'Aphorisms on Human Dignity, Knowledge, and Sincerity',
    lines: [
      'SAYING 1: During civil strife and sedition, be like an adolescent male camel who has neither a back strong',
      'enough for riding nor udders to be milked (refuse to be exploited as an instrument of oppression).',
      '',
      'SAYING 81: The worth and value of every person is in that which they do well (their virtue, excellence,',
      'knowledge, and useful skill).',
      '',
      'SAYING 147 (To Kumayl): People are of three categories: the divine scholar (Aalim Rabbani), the seeker of',
      'truth on the path of salvation, and the unruly mob who follow every breeze. Knowledge is superior to wealth:',
      'knowledge protects you, while you must protect wealth. Wealth diminishes as it is spent, while knowledge grows.',
      '',
      'SAYING 150: Do not be like him who hopes for the hereafter without deeds, and delays repentance with long hopes.',
    ],
  },
  {
    heading: 'Selected Supplications (Al-Ad\'iyah)',
    subheading: 'Intimate Prayers in Hardship and Supplication for Life-Giving Rain',
    lines: [
      'DU\'A 215: Supplication of Absolute Reliance upon Allah:',
      '"O Allah! You are the most comforting companion to Your friends, and the most ready to assist those who rely upon You.',
      'You witness their inner secrets, are aware of their hearts, and understand the depth of their insight.',
      'Their secrets are open to You, and their hearts ache with yearning for You.',
      'If loneliness terrifies them, Your remembrance consoles them; and if calamities befall them, they take refuge in You."',
      '',
      'DU\'A 115: Prayer for Rain (Istisqa):',
      '"O Allah! Send down rain upon our scorched mountains and revive the thirsty lands. Send forth clouds that pour',
      'bountiful water without devastation, and cause green vegetation to sprout for all living creatures."',
    ],
  },
  {
    heading: 'Index of Doctrinal Themes & Source References',
    subheading: 'Thematic Cross-Reference and Scholarly Editions',
    lines: [
      'THEMATIC CONCORDANCE:',
      '  - Divine Unity and Monotheism: Sermon 1, Sermon 185, Sermon 186',
      '  - Social Justice and Human Rights: Letter 53, Sermon 216, Sermon 224',
      '  - Moral Asceticism (Zuhd): Sermon 193, Letter 31, Saying 150',
      '  - Public Administration: Letter 53 (To Malik), Letter 38 (To Egyptians)',
      '  - Epistemology and Reason: Saying 147 (To Kumayl), Letter 31',
      '',
      'MAJOR SCHOLARLY COMMENTARIES:',
      '  - Sharh Nahj al-Balagha by Ibn Abi al-Hadid al-Mu\'tazili (d. 656 AH)',
      '  - Sharh by Ibn Maytham al-Bahrani (d. 699 AH)',
      '  - Sharh by Muhammad Abduh (Grand Mufti of Egypt, d. 1323 AH)',
      '',
      'Authorized digital PDF edition generated for the Nahj al-Balagha AI Knowledge Companion.',
    ],
  },
];

// -------------------------------------------------------------
// 2. Arabic Canonical Edition (15 Pages)
// -------------------------------------------------------------
const arabicPages = [
  {
    heading: 'نهج البلاغة - النسخة العربية الكاملة المعتمدة',
    subheading: 'مجموع ما اختاره الشريف الرضي من كلام أمير المؤمنين علي بن أبي طالب عليه السلام',
    lines: [
      'الجامع: الشريف الرضي (أبو الحسن محمد بن الحسين الموسوي - ت 406 هـ)',
      'المحقق: لجنة التحقيق والنشر التراثي',
      '',
      'يشتمل هذا السفر العظيم على عيون خطب أمير المؤمنين عليه السلام، ورسائله، وعهوده،',
      'وحكمه، ومواعظه، وأدعيته التي أجمع البلغاء والأدباء على أنها دون كلام الخالق وفوق كلام المخلوق.',
      '',
      'مقدمة الطبعة الرقمية المعتمدة:',
      'يعد نهج البلاغة ديوان الحكمة العربية والإسلامية ومصدر البلاغة الخالدة.',
      'نقدم هنا النسخة الرقمية الكاملة متعددة الصفحات مشتملة على الفهارس الموضوعية والتحقيق.',
    ],
  },
  {
    heading: 'فهرس الأبواب الكبرى لنهج البلاغة',
    subheading: 'تقسيم الكتاب إلى الأقسام الأربعة الأصلية',
    lines: [
      'القسم الأول: باب المختار من خطب أمير المؤمنين عليه السلام وأوامره (241 خطبة)',
      '  - الخطبة 1: في ابتداء خلق السماء والأرض وخلق آدم وذكر الحج وأصول الدين',
      '  - الخطبة 3: الخطبة الشقشقية المشهورة وبيان مجريات التاريخ الإسلامي',
      '  - الخطبة 193: خطبة المتقين الجامعة لأوصاف أولياء الله لهمام بن شريح',
      '  - الخطبة 216: في حق الوالي وحق الرعية وتكافؤ الحقوق والواجبات بصفين',
      '  - الخطبة 224: في العدل المطلق وعفة النفس وقصة عقيل بن أبي طالب والحديدة المحماة',
      '',
      'القسم الثاني: باب المختار من كتبه ورسائله إلى أمرائه وعماله (79 كتاباً)',
      '  - الكتاب 53: العهد الخالد إلى مالك بن الحارث الأشتر النخعي لما ولاه مصر',
      '  - الكتاب 31: وصيته العظيمة لولده الحسن عليه السلام بحاضرين',
      '',
      'القسم الثالث: باب المختار من حكمه ومواعظه القصار (489 حكمة)',
      '  - الحكمة 1: كن في الفتنة كابن اللبون لا ظهر فيركب ولا ضرع فيحلب',
      '  - الحكمة 81: قيمة كل امرئ ما يحسنه',
      '  - الحكمة 147: وصيته لكميل بن زياد النخعي في فضل العلم على المال',
      '  - الحكمة 150: لا تكن ممن يرجو الآخرة بغير عمل',
      '',
      'القسم الرابع: باب المختار من أدعيته وتضرعاته ومناجاته',
      '  - الدعاء 215: في التوكل على الله وانقطاع الأمل عما سواه',
      '  - الدعاء 115: في الاستسقاء وطلب السقيا والرحمة',
    ],
  },
  {
    heading: 'مقدمة الجامع الشريف الرضي (ت 406 هـ)',
    subheading: 'سبب جمع الكتاب ومنهج الانتقاء البلاغي',
    lines: [
      'بسم الله الرحمن الرحيم',
      'أما بعد حمد الله الذي جعل البلاغة شيمة لساننا، والصلاة على نبينا محمد وآله الطيبين الطاهرين.',
      '',
      'فإني كنت في عنفوان الشباب قد ابتدأت بتأليف كتاب في خصائص الأئمة عليهم السلام، فلما فرغت',
      'من الخصائص العلوية، رأيت كلام أمير المؤمنين عليه السلام دائراً بين قطبي البلاغة، تارة في التوحيد،',
      'وتارة في الوعظ، وتارة في السياسة والحرب، وتارة في القضاء.',
      '',
      'فسألني جماعة من الأفاضل والأدباء أن أجمع محاسن كلامه عليه السلام في سائر فنونه، فأجبتهم إلى ذلك،',
      'وسميته (نهج البلاغة) إذ كان يفتح للناظر فيه أبواب الفصاحة ويدنيه من ثمار البلاغة.',
    ],
  },
  {
    heading: 'الخطبة الأولى: التوحيد وخلق العالم',
    subheading: 'في كمال معرفة الله وتنزيهه وأصل خلق الكون',
    lines: [
      'الْحَمْدُ لِلَّهِ الَّذِي لاَ يَبْلُغُ مِدْحَتَهُ الْقَائِلُونَ، وَلاَ يُحْصِي نَعْمَاءَهُ الْعَادُّونَ، وَلاَ يُؤَدِّي حَقَّهُ الْمُجْتَهِدُونَ.',
      'الَّذِي لاَ يُدْرِكُهُ بُعْدُ الْهِمَمِ، وَلاَ يَنَالُهُ غَوْصُ الْفِطَنِ.',
      'الَّذِي لَيْسَ لِصِفَتِهِ حَدٌّ مَحْدُودٌ، وَلاَ نَعْتٌ مَوْجُودٌ، وَلاَ وَقْتٌ مَعْدُودٌ، وَلاَ أَجَلٌ مَمْدُودٌ.',
      '',
      'فِطْرَةُ الْخَلْقِ قُدْرَتُهُ، وَنَشْرُ الرِّيَاحِ رَحْمَتُهُ، وَوَتَّدَ بِالصُّخُورِ مَيَدَانَ أَرْضِهِ.',
      '',
      'أَوَّلُ الدِّينِ مَعْرِفَتُهُ، وَكَمَالُ مَعْرِفَتِهِ التَّصْدِيقُ بِهِ، وَكَمَالُ التَّصْدِيقِ بِهِ تَوْحِيدُهُ،',
      'وَكَمَالُ تَوْحِيدِهِ الإِخْلاَصُ لَهُ، وَكَمَالُ الإِخْلاَصِ لَهُ نَفْيُ الصِّفَاتِ عَنْهُ.',
    ],
  },
  {
    heading: 'الخطبة الثالثة: الخطبة الشقشقية',
    subheading: 'في الصبر وموقف الإمام عليه السلام من الخلافة',
    lines: [
      'أَمَا وَاللَّهِ لَقَدْ تَقَمَّصَهَا ابْنُ أَبِي قُحَافَةَ، وَإِنَّهُ لَيَعْلَمُ أَنَّ مَحَلِّي مِنْهَا مَحَلُّ الْقُطْبِ مِنَ الرَّحَى.',
      'يَنْحَدِرُ عَنِّي السَّيْلُ، وَلاَ يَرْقَى إِلَيَّ الطَّيْرُ.',
      '',
      'فَسَدَلْتُ دُونَهَا ثَوْباً، وَطَوَيْتُ عَنْهَا كَشْحاً، وَطَفِقْتُ أَرْتَئِي بَيْنَ أَنْ أَصُولَ بِيَدٍ جَذَّاءَ،',
      'أَوْ أَصْبِرَ عَلَى طَخْيَةٍ عَمْيَاءَ، فَرَأَيْتُ أَنَّ الصَّبْرَ عَلَى هَاتَا أَحْجَى، فَصَبَرْتُ وَفِي الْعَيْنِ قَذًى، وَفِي الْحَلْقِ شَجاً!',
      '',
      'أَمَا وَالَّذِي فَلَقَ الْحَبَّةَ وَبَرَأَ النَّسَمَةَ، لَوْلاَ حُضُورُ الْحَاضِرِ وَقِيَامُ الْحُجَّةِ بِوُجُودِ النَّاصِرِ،',
      'وَمَا أَخَذَ اللَّهُ عَلَى الْعُلَمَاءِ أَلاَّ يُقَارُّوا عَلَى كِظَّةِ ظَالِمٍ وَلاَ سَغَبِ مَظْلُومٍ، لأَلْقَيْتُ حَبْلَهَا عَلَى غَارِبِهَا.',
    ],
  },
  {
    heading: 'الخطبة 193: خطبة المتقين (القسم الأول)',
    subheading: 'وصف صفات المتقين في الدنيا لهمام بن شريح',
    lines: [
      'أَمَّا بَعْدُ، فَإِنَّ اللَّهَ سُبْحَانَهُ وَتَعَالَى خَلَقَ الْخَلْقَ حِينَ خَلَقَهُمْ غَنِيّاً عَنْ طَاعَتِهِمْ، آمِناً مِنْ مَعْصِيَتِهِمْ.',
      '',
      'فَالْمُتَّقُونَ فِيهَا هُمْ أَهْلُ الْفَضَائِلِ: مَنْطِقُهُمُ الصَّوَابُ، وَمَلْبَسُهُمُ الاِقْتِصَادُ، وَمَشْيُهُمُ التَّوَاضُعُ.',
      'غَضُّوا أَبْصَارَهُمْ عَمَّا حَرَّمَ اللَّهُ عَلَيْهِمْ، وَوَقَفُوا أَسْمَاعَهُمْ عَلَى الْعِلْمِ النَّافِعِ لَهُمْ.',
      '',
      'نُزِّلَتْ أَنْفُسُهُمْ مِنْهُمْ فِي الْبَلاَءِ كَالَّتِي نُزِّلَتْ فِي الرَّخَاءِ.',
      'عَظُمَ الْخَالِقُ فِي أَنْفُسِهِمْ فَصَغُرَ مَا دُونَهُ فِي أَعْيُنِهِمْ، فَهُمْ وَالْجَنَّةُ كَمَنْ قَدْ رَآهَا، فَهُمْ فِيهَا مُنَعَّمُونَ.',
    ],
  },
  {
    heading: 'الخطبة 193: خطبة المتقين (القسم الثاني)',
    subheading: 'عبادة الليل وخصال النهار والورع الصادق',
    lines: [
      'أَمَّا اللَّيْلَ فَصَافُّونَ أَقْدَامَهُمْ، تَالِينَ لأَجْزَاءِ الْقُرْآنِ يُرَتِّلُونَهَا تَرْتِيلاً، يُحَزِّنُونَ بِهِ أَنْفُسَهُمْ،',
      'وَيَسْتَثِيرُونَ بِهِ دَوَاءَ دَائِهِمْ. فَإِذَا مَرُّوا بِآيَةٍ فِيهَا تَشْوِيقٌ رَكَنُوا إِلَيْهَا طَمَعاً،',
      'وَإِذَا مَرُّوا بِآيَةٍ فِيهَا تَخْوِيفٌ أَصْغَوْا إِلَيْهَا مَسَامِعَ قُلُوبِهِمْ.',
      '',
      'وَأَمَّا النَّهَارَ فَحُلَمَاءُ عُلَمَاءُ، أَبْرَارٌ أَتْقِيَاءُ، قَدْ بَرَاهُمُ الْخَوْفُ بَرْيَ الْقِدَاحِ،',
      'يَنْظُرُ إِلَيْهِمُ النَّاظِرُ فَيَحْسَبُهُمْ مَرْضَى، وَمَا بِالْقَوْمِ مِنْ مَرَضٍ، وَيَقُولُ: لَقَدْ خُولِطُوا، وَلَقَدْ خَالَطَهُمْ أَمْرٌ عَظِيمٌ!',
    ],
  },
  {
    heading: 'الخطبة 216: في الحقوق المتبادلة بين الحاكم والمحكوم',
    subheading: 'ألقاها الإمام بصفين في توازن العدالة والمسؤولية',
    lines: [
      'أَمَّا بَعْدُ، فَقَدْ جَعَلَ اللَّهُ سُبْحَانَهُ لِي عَلَيْكُمْ حَقّاً بِوِلاَيَةِ أَمْرِكُمْ، وَلَكُمْ عَلَيَّ مِنَ الْحَقِّ مِثْلُ الَّذِي لِي عَلَيْكُمْ.',
      'فَالْحَقُّ أَوْسَعُ الأَشْيَاءِ فِي التَّخَاطُبِ، وَأَضْيَقُهَا فِي التَّنَاصُفِ.',
      '',
      'لاَ يَجْرِي لأَحَدٍ إِلاَّ جَرَى عَلَيْهِ، وَلاَ يَجْرِي عَلَيْهِ إِلاَّ جَرَى لَهُ.',
      '',
      'فَإِذَا أَدَّتِ الرَّعِيَّةُ إِلَى الْوَالِي حَقَّهُ، وَأَدَّى الْوَالِي إِلَيْهَا حَقَّهَا، عَزَّ الْحَقُّ بَيْنَهُمْ،',
      'وَقَامَتْ مَنَاهِجُ الدِّينِ، وَاعْتَدَلَتْ مَعَالِمُ الْعَدْلِ، وَصَلَحَ بِذَلِكَ الزَّمَانُ.',
    ],
  },
  {
    heading: 'الخطبة 224: في صيانة المال العام وقصة عقيل',
    subheading: 'النزاهة المطلقة ورفض محاباة الأقربين',
    lines: [
      'وَاللَّهِ لَقَدْ رَأَيْتُ عَقِيلاً وَقَدْ أَمْلَقَ حَتَّى اسْتَمَاحَنِي مِنْ بُرِّكُمْ صَاعاً، وَرَأَيْتُ صِبْيَانَهُ شُعْثَ الشُّعُورِ غُبْرَ الأَلْوَانِ.',
      'فَعَاوَدَنِي مُؤَكِّداً، فَأَحْمَيْتُ لَهُ حَدِيدَةً، ثُمَّ أَدْنَيْتُهَا مِنْ جِسْمِهِ لِيَعْتَبِرَ بِهَا، فَضَجَّ ضَجِيجَ ذِي دَنَفٍ مِنْ أَلَمِهَا!',
      '',
      'فَقُلْتُ لَهُ: ثَكِلَتْكَ الثَّوَاكِلُ يَا عَقِيلُ! أَتَئِنُّ مِنْ حَدِيدَةٍ أَحْمَاهَا إِنْسَانُهَا لِلَعِبِهِ،',
      'وَتَجُرُّنِي إِلَى نَارٍ سَجَّرَهَا جَبَّارُهَا لِغَضَبِهِ؟! أَتَئِنُّ مِنَ الأَذَى وَلاَ أَئِنُّ مِنْ لَظَى؟!',
      '',
      'وَاللَّهِ لَوْ أُعْطِيتُ الأَقَالِيمَ السَّبْعَةَ بِمَا تَحْتَ أَفْلاَكِهَا، عَلَى أَنْ أَعْصِيَ اللَّهَ فِي نَمْلَةٍ أَسْلُبُهَا جُلْبَ شَعِيرَةٍ مَا فَعَلْتُهُ!',
    ],
  },
  {
    heading: 'الكتاب 53: عهد الإمام لمالك الأشتر (القسم الأول)',
    subheading: 'أصول الحكم والرحمة بالرعية وحرمة الإنسان',
    lines: [
      'هَذَا مَا أَمَرَ بِهِ عَبْدُ اللَّهِ عَلِيٌّ أَمِيرُ الْمُؤْمِنِينَ، مَالِكَ بْنَ الْحَارِثِ الأَشْتَرَ فِي عَهْدِهِ إِلَيْهِ، حِينَ وَلاَّهُ مِصْرَ:',
      'جِبَايَةَ خَرَاجِهَا، وَجِهَادَ عَدُوِّهَا، وَاسْتِصْلاَحَ أَهْلِهَا، وَعِمَارَةَ بِلاَدِهَا.',
      '',
      'وَأَشْعِرْ قَلْبَكَ الرَّحْمَةَ لِلرَّعِيَّةِ، وَالْـمَحَبَّةَ لَهُمْ، وَاللُّطْفَ بِهِمْ،',
      'وَلاَ تَكُونَنَّ عَلَيْهِمْ سَبُعاً ضَارِياً تَغْتَنِمُ أَكْلَهُمْ، فَإِنَّهُمْ صِنْفَانِ:',
      '',
      'إِمَّا أَخٌ لَكَ فِي الدِّينِ، أَوْ نَظِيرٌ لَكَ فِي الْخَلْقِ!',
      '',
      'يَقَعُ مِنْهُمُ الزَّلَلُ، وَتَعْرِضُ لَهُمُ الْعِلَلُ، فَأَعْطِهِمْ مِنْ عَفْوِكَ وَصَفْحِكَ مِثْلَ الَّذِي تُحِبُّ أَنْ يُعْطِيَكَ اللَّهُ مِنْ عَفْوِهِ.',
    ],
  },
  {
    heading: 'الكتاب 53: عهد الإمام لمالك الأشتر (القسم الثاني)',
    subheading: 'القضاء النزيه، عمارة الأرض، والطبقة الضعيفة',
    lines: [
      'اخْتَرْ لِلْقَضَاءِ بَيْنَ النَّاسِ أَفْضَلَ رَعِيَّتِكَ فِي نَفْسِكَ: مِمَّنْ لاَ تَضِيقُ بِهِ الأُمُورُ، وَلاَ تُمَحِّكُهُ الْخُصُومُ،',
      'وَلاَ يَتَمَادَى فِي الزَّلَّةِ، وَأَفْسِحْ لَهُ فِي الْبَذْلِ مَا يُزِيلُ عِلَّتَهُ وَتَقِلُّ مَعَهُ حَاجَتُهُ إِلَى النَّاسِ.',
      '',
      'وَتَفَقَّدْ أَمْرَ الْخَرَاجِ بِمَا يُصْلِحُ أَهْلَهُ، فَإِنَّ فِي صَلاَحِهِ صَلاَحَ مَنْ سِوَاهُمْ،',
      'وَلْيَكُنْ نَظَرُكَ فِي عِمَارَةِ الأَرْضِ أَبْلَغَ مِنْ نَظَرِكَ فِي اسْتِجْلاَبِ الْخَرَاجِ، لأَنَّ ذَلِكَ لاَ يُدْرَكُ إِلاَّ بِالْعِمَارَةِ.',
      '',
      'ثُمَّ اللَّهَ اللَّهَ فِي الطَّبَقَةِ السُّفْلَى مِنَ الَّذِينَ لاَ حِيلَةَ لَهُمْ، مِنَ الْمَسَاكِينِ وَالْمُحْتَاجِينَ وَأَهْلِ الْبُؤْسَى وَالزَّمْنَى!',
    ],
  },
  {
    heading: 'الكتاب 31: وصية الإمام لولده الحسن عليه السلام',
    subheading: 'كتبها بحاضرين: ميزان الإنصاف ومواعظ الأخلاق والزهد',
    lines: [
      'مِنَ الْوَالِدِ الْفَانِ، الْمُقِرِّ لِلزَّمَانِ، إِلَى الْمَوْلُودِ الْمُؤَمِّلِ مَا لاَ يُدْرِكُهُ.',
      '',
      'يَا بُنَيَّ، اجْعَلْ نَفْسَكَ مِيزَاناً فِيمَا بَيْنَكَ وَبَيْنَ غَيْرِكَ:',
      'فَأَحْبِبْ لِغَيْرِكَ مَا تُحِبُّ لِنَفْسِكَ، وَاكْرَهْ لَهُ مَا تَكْرَهُ لَهَا.',
      '',
      'وَلاَ تَظْلِمْ كَمَا لاَ تُحِبُّ أَنْ تُظْلَمَ، وَأَحْسِنْ كَمَا تُحِبُّ أَنْ يُحْسَنَ إِلَيْكَ،',
      'وَاسْتَقْبِحْ مِنْ نَفْسِكَ مَا تَسْتَقْبِحُهُ مِنْ غَيْرِكَ.',
      '',
      'وَاعْلَمْ أَنَّ الدُّنْيَا لَمْ تُخْلَقْ لَكَ دَارَ مُقَامٍ، وَإِنَّمَا جُعِلَتْ مَعْبَراً لِتَتَزَوَّدَ مِنْهَا لِدَارِ الْقَرَارِ، وَخَيْرُ الزَّادِ التَّقْوَى.',
    ],
  },
  {
    heading: 'باب المختار من الحكم والمواعظ القصيرة',
    subheading: 'جوامع الكلم في الأدب والمعرفة والأخلاق',
    lines: [
      'الحكمة 1: كُنْ فِي الْفِتْنَةِ كَابْنِ اللَّبُونِ، لاَ ظَهْرٌ فَيُرْكَبَ، وَلاَ ضَرْعٌ فَيُحْلَبَ.',
      '',
      'الحكمة 81: قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ.',
      '',
      'الحكمة 147 (لكميل بن زياد): يَا كُمَيْلُ، الْقُلُوبُ أَوْعِيَةٌ فَخَيْرُهَا أَوْعَاهَا. النَّاسُ ثَلاَثَةٌ: فَعَالِمٌ رَبَّانِيٌّ،',
      'وَمُتَعَلِّمٌ عَلَى سَبِيلِ نَجَاةٍ، وَهَمَجٌ رَعَاعٌ أَتْبَاعُ كُلِّ نَاعِقٍ، يَمِيلُونَ مَعَ كُلِّ رِيحٍ.',
      'الْعِلْمُ خَيْرٌ مِنَ الْمَالِ: الْعِلْمُ يَحْرُسُكَ وَأَنْتَ تَحْرُسُ الْمَالَ، وَالْمَالُ تَنْقُصُهُ النَّفَقَةُ، وَالْعِلْمُ يَزْكُو عَلَى الإِنْفَاقِ.',
      '',
      'الحكمة 150: لاَ تَكُنْ مِمَّنْ يَرْجُو الآخِرَةَ بِغَيْرِ الْعَمَلِ، وَيُرَجِّي التَّوْبَةَ بِطُولِ الأَمَلِ.',
    ],
  },
  {
    heading: 'باب المختار من الأدعية والمناجاة',
    subheading: 'مناجاة الاستغناء بالله والاستسقاء لنزول الغيث',
    lines: [
      'الدعاء 215: في التوكل والانقطاع إلى الله عز وجل:',
      '"اللَّهُمَّ إِنَّكَ آنَسُ الآنِسِينَ لأَوْلِيَائِكَ، وَأَحْضَرُهُمْ بِالْكِفَايَةِ لِلْمُتَوَكِّلِينَ عَلَيْكَ،',
      'تَشْهَدُ سَرَائِرَهُمْ، وَتَطَّلِعُ عَلَى ضَمَائِرِهِمْ، وَتَعْلَمُ مَبَالَغَ بَصَائِرِهِمْ، فَأَسْرَارُهُمْ لَكَ مَكْشُوفَةٌ،',
      'وَقُلُوبُهُمْ إِلَيْكَ مَلْهُوفَةٌ. إِنْ أَوْحَشَتْهُمُ الْغُرْبَةُ آنَسَهُمْ ذِكْرُكَ، وَإِنْ صُبَّتْ عَلَيْهِمُ الْمَصَائِبُ لَجَأُوا إِلَى الاِسْتِجَارَةِ بِكَ."',
      '',
      'الدعاء 115: في الاستسقاء عند القحط:',
      '"اللَّهُمَّ قَدِ انْصَاحَتْ جِبَالُنَا، وَاغْبَرَّتْ أَرْضُنَا، وَهَامَتْ دَوَابُّنَا، فَاغْفِرْ لَنَا وَارْحَمْنَا،',
      'وَأَسْقِنَا غَيْثاً مَرِيعاً مَرِيعاً، طَبَقاً مُجَلِّلاً، سَحّاً دِفَاقاً، تُحْيِي بِهِ الْبِلاَدَ وَتَسْقِي بِهِ الْعِبَادَ."',
    ],
  },
  {
    heading: 'فهرس الموضوعات وشروح نهج البلاغة',
    subheading: 'المصادر والتحقيقات العلمية المعتمدة',
    lines: [
      'أهم شروح نهج البلاغة عبر التاريخ الإسلامي:',
      '  1. شرح نهج البلاغة لابن أبي الحديد المدائني المعتزلي (ت 656 هـ) - 20 مجلداً',
      '  2. شرح كمال الدين ميثم بن علي بن ميثم البحراني (ت 699 هـ) - الشرح الفلسفي الكبير',
      '  3. شرح الإمام الشيخ محمد عبده مفتي الديار المصرية (ت 1323 هـ) - الضبط الأدبي واللغوي',
      '  4. بهج الصباغة في شرح نهج البلاغة للعلامة محمد تقي التستري (ت 1415 هـ)',
      '',
      'تم إعداد هذه النسخة الكاملة متعددة الصفحات لمنصة نهج البلاغة الذكية المعتمدة.',
    ],
  },
];

// -------------------------------------------------------------
// 3. Urdu Edition (15 Pages)
// -------------------------------------------------------------
const urduPages = [
  {
    heading: 'ترجمہ و شرح نہج البلاغہ - مکمل مستند ایڈیشن',
    subheading: 'فصیح اردو ترجمہ مع توضیحات - علامہ ذیشان حیدر جوادی و مفتی جعفر حسین',
    lines: [
      'جامع کتاب: سید شریف الرضی علیہ الرحمہ (وفات 406 ہجری)',
      'ناشر: کینونیکل ریسرچ اکیڈمی ایڈیشن',
      '',
      'امیر المومنین حضرت علی ابن ابی طالب علیہ السلام کے لازوال خطبات، مکتوبات، فرمودات،',
      'اور مناجاتوں کا مستند و بامحاورہ اردو مجموعہ۔',
      '',
      'مقدمہ ایڈیشن:',
      'نہج البلاغہ عربی ادب و بلاغت کا وہ شاہکار ہے جس پر چودہ سو سال سے مفکرین و ادباء عش عش کرتے آئے ہیں۔',
      'یہ کتاب توحید خالص، عدل اجتماعی، منشورِ حکمرانی، اور اخلاقی کمالات کا بحرِ ناپیدا کنار ہے۔',
      'اس ڈیجیٹل ایڈیشن میں تمام اہم خطبات اور ابواب کو مکمل صفحات پر ترتیب دیا گیا ہے۔',
    ],
  },
  {
    heading: 'فہرست ابواب و کینونیکل تقسیم',
    subheading: 'کتاب کے چاروں بنیادی حصوں کی تفصیل',
    lines: [
      'حصہ اول: خطباتِ امیر المومنین علیہ السلام (کل 241 خطبات)',
      '  - خطبہ 1: آغازِ آفرینش، فرشتوں کی تخلیق، نبوت، اور توحیدِ پروردگار کی حقیقت',
      '  - خطبہ 3: خطبہ شقشقیہ - تاریخی حقائق، ضبط و صبر، اور قبولِ خلافت کا فلسفہ',
      '  - خطبہ 193: خطبہ متقین (ہمام بن شریح کے سامنے پرہیزگاروں کے کامل اوصاف)',
      '  - خطبہ 216: حکمران اور رعایا کے باہمی مساوی حقوق کا زریں دستور',
      '  - خطبہ 224: مطلق عدل، بیت المال کی حفاظت، اور جنابِ عقیل کا واقعہ',
      '',
      'حصہ دوم: فرامین، خطوط اور وصایا (کل 79 مکتوبات)',
      '  - مکتوب 53: عہد نامہ مالک اشتر - اسلامی طرزِ حکومت کا بین الاقوامی چارٹر',
      '  - مکتوب 31: امام حسن علیہ السلام کے نام اخلاقی، سماجی اور خاندانی وصیت',
      '',
      'حصہ سوم: کلماتِ حکمت اور اقوالِ زریں (کل 489 حکمتیں)',
      '  - حکمت 1: فتنہ و فساد کے دور میں غیر جانبدار رہنے کی بصیرت (ابن اللبون)',
      '  - حکمت 81: انسان کی حقیقی قدر و قیمت اس کا ہنر، علم اور اچھائی ہے',
      '  - حکمت 147: کمیل بن زیاد کے نام علم اور مال کا معرکہ آرا موازنہ',
      '  - حکمت 150: بے عمل امیدوں کے دھوکے میں توبہ کو مؤخر کرنے کا وبال',
      '',
      'حصہ چہارم: دعائیں اور مناجاتیں',
      '  - دعا 215: توکل علی اللہ اور سختیوں میں خدا کی بارگاہ سے سکون حاصل کرنا',
      '  - دعا 115: نمازِ استسقاء اور قحط سالی میں بارانِ رحمت کی التجا',
    ],
  },
  {
    heading: 'مقدمہ سید شریف الرضی (406 ہجری)',
    subheading: 'نہج البلاغہ کی جمع و تدوین کا تاریخی سبب',
    lines: [
      'بسم اللہ الرحمن الرحیم۔ تمام تعریفیں اللہ کے لیے ہیں اور درود ہو رسول اکرم اور ان کی آلِ پاک پر۔',
      '',
      'شریف الرضی فرماتے ہیں: مجھے جوانی کے دور میں ائمہ اطہار کے فضائل پر کتاب لکھنے کا شوق ہوا۔',
      'جب میں امیر المومنین کے تذکرے تک پہنچا تو میں نے دیکھا کہ آپ کا کلام اس قدر فصیح و بلیغ ہے کہ',
      'خالق کے کلام کے بعد اس کی نظیر کائنات کے کسی انسان کے پاس نہیں ہے۔',
      '',
      'اہلِ علم و ادب کے اصرار پر میں نے آپ کے خطبات، خطوط اور حکمتوں کے شاہکاروں کو الگ کتاب میں جمع کیا',
      'اور اس کا نام "نہج البلاغہ" (بلاغت کا روشن راستہ) رکھا، کیونکہ یہ فصاحت کے دروازے کھولتا ہے۔',
    ],
  },
  {
    heading: 'خطبہ اول: معرفتِ الہی اور کائنات کی تخلیق',
    subheading: 'توحید کا بلند ترین فلسفہ اور بندگی کا مقصد',
    lines: [
      'تمام تعریفیں اس اللہ کے لیے سزاوار ہیں جس کی حمد کا حق بولنے والے ادا نہیں کر سکتے،',
      'اور جس کی نعمتوں کا شمار حساب دان نہیں کر سکتے، اور کوشش کرنے والے اس کی عبادت کا حق ادا نہیں کر سکتے۔',
      '',
      'بلند ہمتیں اس کی ذات کی گہرائیوں کو نہیں پا سکتیں اور عقل کے غواص اس کے کنارے تک نہیں پہنچ سکتے۔',
      'جس کی صفت کے لیے نہ کوئی حد ہے، نہ کوئی توصیف، نہ کوئی معین وقت اور نہ کوئی پھیلی ہوئی مدت۔',
      '',
      'دین کی ابتدا اس کی معرفت ہے، کمالِ معرفت اس کی تصدیق ہے، کمالِ تصدیق اس کی توحید ہے،',
      'اور کمالِ توحید اس کے لیے اخلاصِ عمل ہے، اور کمالِ اخلاص اس سے صفاتِ زائدہ کی نفی کرنا ہے۔',
    ],
  },
  {
    heading: 'خطبہ سوم: خطبہ شقشقیہ',
    subheading: 'تاریخی نشیب و فراز، صبرِ جمیل، اور بیعتِ عوام کا منظر',
    lines: [
      'خدا کی قسم! ابن ابی قحافہ نے خلافت کا کرتا پہن لیا حالانکہ وہ خوب جانتے تھے کہ میرا مقام خلافت میں',
      'ایسا ہے جیسے چکی کے اندر کیلی! مجھ سے علم کا سیلاب بہتا ہے اور کوئی بلندی والا مجھ تک پرواز نہیں کر سکتا۔',
      '',
      'مگر میں نے صبر کی چادر اوڑھ لی حالانکہ آنکھوں میں کانٹا کھٹک رہا تھا اور گلے میں ہڈی پھنسی ہوئی تھی،',
      'اور میں اپنی میراث کو لٹتا دیکھ رہا تھا۔',
      '',
      'جب عوام مجھ پر ٹوٹ پڑے جیسے بھیڑئیے، اور بیعت کے لیے ہجوم کیا تو میں نے حکومت کی باگ ڈور صرف اس لیے سنبھالی',
      'کیونکہ اللہ نے علماء سے عہد لیا ہے کہ وہ ظالم کے پیٹ بھرنے اور مظلوم کے بھوکے رہنے پر خاموش نہیں رہیں گے!',
    ],
  },
  {
    heading: 'خطبہ 193: خطبہ متقین (حصہ اول)',
    subheading: 'ہمام کے اصرار پر متقی اور پرہیزگار انسانوں کی خصوصیات',
    lines: [
      'اللہ نے مخلوق کو پیدا کیا تو وہ ان کی اطاعت سے بے نیاز تھا اور ان کی گناہوں سے محفوظ و مامون تھا۔',
      '',
      'دنیا میں پرہیزگار ہی اصل فضیلت والے ہیں: ان کی گفتگو سچی اور ٹھوس ہوتی ہے، ان کا لباس میانہ روی پر مبنی ہوتا ہے،',
      'اور ان کی رفتار میں عاجزی و انکساری جھلکتی ہے۔',
      '',
      'انہوں نے اپنی نگاہوں کو ان چیزوں سے موڑ لیا ہے جنہیں اللہ نے حرام کیا ہے، اور اپنے کانوں کو نفع بخش علم کے لیے وقف کر دیا ہے۔',
      'وہ سختی اور آزمائش کے وقت بھی اسی طرح مطمئن رہتے ہیں جیسے آسودگی اور خوشحالی کے وقت۔',
      'خالق کی عظمت ان کے دلوں پر ایسی چھائی ہوئی ہے کہ دنیا کی ہر شے ان کی نظر میں ہیچ معلوم ہوتی ہے۔',
    ],
  },
  {
    heading: 'خطبہ 193: خطبہ متقین (حصہ دوم)',
    subheading: 'رات کی نماز و تلاوت اور دن کے وقت علم و اخلاق کا پیکر',
    lines: [
      'رات کے وقت وہ مصلے پر صف بستہ کھڑے ہوتے ہیں، قرآن کی تلاوت ترتیل کے ساتھ کرتے ہیں،',
      'اس کے پیغامات سے اپنے دلوں کو بیدار کرتے ہیں اور اپنے روحانی دکھوں کا علاج ڈھونڈتے ہیں۔',
      'جب رحمت کی آیت آتی ہے تو امید سے جھوم اٹھتے ہیں، اور جب عذاب کی آیت آتی ہے تو خوفِ خدا سے کانپ اٹھتے ہیں۔',
      '',
      'اور دن کے وقت وہ صابر علماء، نیکوکار اور باکردار انسان ہوتے ہیں۔',
      'خوفِ خدا نے ان کے جسموں کو تراش کر ایسا کر دیا ہے کہ دیکھنے والا انہیں بیمار سمجھتا ہے حالانکہ وہ بیمار نہیں ہوتے۔',
      'لوگ کہتے ہیں کہ یہ دنیا سے بے گانہ ہو گئے ہیں، جبکہ درحقیقت وہ ایک عظیم فکر میں مستغرق ہوتے ہیں!',
    ],
  },
  {
    heading: 'خطبہ 216: والی اور رعایا کے باہمی حقوق',
    subheading: 'میدانِ صفین میں انسانی مساوات اور حق و انصاف کا درس',
    lines: [
      'اللہ نے تمہارے امور کی ولایت کے ذریعے تم پر میرا حق مقرر کیا ہے، اور مجھ پر تمہارا ویسا ہی حق قائم کیا ہے۔',
      'حق گفتگو اور بیان میں سب سے وسیع چیز ہے، مگر عمل اور انصاف کے میدان میں سب سے زیادہ تنگ اور کڑا ہے!',
      '',
      'حق کسی کے حق میں اس وقت تک جاری نہیں ہوتا جب تک کہ اس کے خلاف بھی لاگو نہ ہو،',
      'اور کسی پر اس وقت تک فرض نہیں ہوتا جب تک کہ اس کے حق میں بھی ثابت نہ ہو۔',
      '',
      'پس جب رعایا حاکم کا حق ادا کرے اور حاکم رعایا کے حقوق کی پاسداری کرے، تو حق سربلند ہوتا ہے،',
      'دین کی بنیادیں قائم ہوتی ہیں اور عدل کا پرچم پوری سچائی سے لہراتا ہے۔',
    ],
  },
  {
    heading: 'خطبہ 224: جنابِ عقیل اور عوامی دولت کی حرمت',
    subheading: 'قومی خزانے میں اقربا پروری کا مکمل خاتمہ',
    lines: [
      'خدا کی قسم! میں نے اپنے سگے بھائی عقیل کو دیکھا کہ وہ فقر و فاقہ سے نڈھال تھے اور مجھ سے سرکاری گندم مانگ رہے تھے،',
      'اور ان کے بچے بھوک کے مارے گرد آلود چہروں کے ساتھ بکھرے بالوں والے بنے ہوئے تھے۔',
      '',
      'جب انہوں نے بار بار اصرار کیا تو میں نے لوہے کا ایک ٹکڑا آگ میں تپایا اور ان کے جسم کے قریب کیا تاکہ وہ عبرت حاصل کریں،',
      'تو وہ تپش سے چیخ اٹھے جیسے شدید بیمار انسان چیختا ہے!',
      '',
      'میں نے کہا: اے عقیل! تم انسان کی بنائی ہوئی معمولی آگ کی تپش پر تو روتے ہو،',
      'اور مجھے اس آگ کی طرف کھینچتے ہو جسے جبارِ کائنات نے اپنے غضب سے بھڑکایا ہے؟!',
      '',
      'خدا کی قسم! اگر مجھے ساتوں اقلیمیں اور جو کچھ آسمانوں کے نیچے ہے دے دیا جائے کہ میں چیونٹی سے جو کا چھلکا چھین لوں تو میں کبھی نہیں کروں گا!',
    ],
  },
  {
    heading: 'مکتوب 53: منشورِ حکمرانی بنام مالک اشتر (حصہ اول)',
    subheading: 'رعایا پر شفقت اور انسانیت کی مساوات کا آفاقی حکم',
    lines: [
      'یہ وہ فرمان ہے جو اللہ کے بندے علی امیر المومنین نے مالک بن حارث اشتر کو دیا جب انہیں مصر کا والی بنایا:',
      'خراج اکٹھا کرنے، دشمنوں سے لڑنے، رعایا کی اصلاح کرنے، اور بستیوں کو آباد کرنے کا حکم دیا۔',
      '',
      'اپنے دل کو رعایا کے لیے رحمت، محبت، اور نرمی کا مسکن بناؤ، اور ان پر خونخوار درندے کی طرح نہ ہو جانا جو انہیں نگل جانا چاہتا ہے،',
      'کیونکہ رعایا کی صرف دو ہی قسمیں ہیں:',
      '',
      'یا تو وہ دین میں تمہارے بھائی ہیں، یا پھر انسانیت میں تمہارے جیسے انسان ہیں!',
      '',
      'ان سے لغزشیں بھی ہوں گی، بیماریاں بھی پیش آئیں گی، اور خطائیں بھی سرزد ہوں گی۔',
      'لہٰذا تم انہیں اسی طرح معاف کرنا جس طرح تم خود اللہ سے عفو و درگزر کی امید رکھتے ہو۔',
    ],
  },
  {
    heading: 'مکتوب 53: منشورِ حکمرانی بنام مالک اشتر (حصہ دوم)',
    subheading: 'عدلیہ کی آزادی، معاشی ترقی، اور غریب ترین طبقے کی خبرگیری',
    lines: [
      'لوگوں کے درمیان فیصلے کے لیے اپنے بہترین آدمی کو قاضی مقرر کرو جو دلائل کے الجھاؤ سے گھبرائے نہیں،',
      'رشوت کو سختی سے رد کرے، اور اس کے اتنے مالی اخراجات پورے کرو کہ اسے لوگوں کی محتاجی نہ رہے۔',
      '',
      'اور خراج کی وصولی سے زیادہ زمین کی آبادی اور معاشی ترقی پر توجہ دو، کیونکہ خراج زمین کی ترقی کے بغیر نہیں ملتا،',
      'اور جو شخص زمین کی ترقی کے بغیر خراج مانگتا ہے وہ ملک کو تباہ اور بندگانِ خدا کو برباد کرتا ہے۔',
      '',
      'پھر خبردار! نادار اور کمزور ترین طبقے کا خاص خیال رکھو جن کے پاس کوئی چارہ کار نہیں،',
      'کیونکہ روزِ قیامت سب سے پہلے تم سے ان محروم انسانوں کا حساب لیا جائے گا جن کا کوئی پرسانِ حال نہ تھا!',
    ],
  },
  {
    heading: 'مکتوب 31: اخلاقی وصیت نامہ بنام امام حسن علیہ السلام',
    subheading: 'مقامِ حاضرین پر تحریر فرمودہ: انصاف کا ترازو اور زندگی کی حقیقت',
    lines: [
      'ایک بوڑھے باپ کی طرف سے جو وقت کی رفتار کا اعتراف کرتا ہے، اس فرزند کے نام جو دنیا کی تمناؤں میں قید ہے۔',
      '',
      'اے میرے فرزند! اپنے اور دوسروں کے درمیان اپنے نفس کو ترازو بنا لو:',
      'جو اپنے لیے پسند کرتے ہو وہی دوسروں کے لیے پسند کرو، اور جو اپنے لیے ناپسند کرتے ہو وہ دوسروں کے لیے بھی ناپسند جانو۔',
      '',
      'کسی پر ظلم نہ کرو جیسے تم اپنے اوپر ظلم پسند نہیں کرتے، اور احسان کرو جیسے چاہتے ہو کہ تمہارے ساتھ بھلائی ہو۔',
      'اور جس بات کو دوسروں کے اندر برا سمجھتے ہو اسے اپنے اندر بھی برا سمجھو۔',
      '',
      'اور جان لو کہ دنیا تمہارے ہمیشہ رہنے کی جگہ نہیں، یہ تو صرف ایک پل ہے جہاں سے آخرت کا زادِ راہ اکٹھا کرنا ہے، اور بہترین زادِ راہ تقویٰ ہے۔',
    ],
  },
  {
    heading: 'باب المختار من الحکم: اقوالِ حکمت اور نصیحتیں',
    subheading: 'معرفت، علم، اور عملِ صالح کے درخشاں موتی',
    lines: [
      'حکمت 1: فتنہ و فساد کے دور میں اونٹ کے اس چھوٹے بچے کی طرح رہو جس کی نہ پیٹھ سواری کے قابل ہو اور نہ تھن دودھ دوہنے کے۔',
      '',
      'حکمت 81: ہر انسان کی قدر و قیمت وہ علم، ہنر اور اچھائی ہے جسے وہ سلیقے اور اخلاص سے انجام دیتا ہے۔',
      '',
      'حکمت 147 (کمیل بن زیاد کے نام): اے کمیل! یہ دل برتن ہیں اور سب سے بہترین دل وہ ہے جو نیکی کو سب سے زیادہ سنبھال کر رکھے۔',
      'لوگ تین قسم کے ہیں: ایک عالمِ ربانی، دوسرا نجات کی راہ پر چلنے والا طالبِ علم، اور تیسرا وہ جاہل ہجوم جو ہر پکارنے والے کے پیچھے چل پڑتا ہے۔',
      'علم مال سے ہزار درجہ بہتر ہے: علم تمہاری حفاظت کرتا ہے جبکہ مال کی حفاظت تمہیں کرنی پڑتی ہے۔ مال خرچ کرنے سے گھٹتا ہے اور علم بانٹنے سے بڑھتا ہے۔',
      '',
      'حکمت 150: ان لوگوں میں سے نہ بنو جو بغیر عمل کے آخرت کی امید رکھتے ہیں، اور لمبی امیدوں کے بہانے توبہ کو ٹالتے رہتے ہیں۔',
    ],
  },
  {
    heading: 'باب الادعیہ والمناجاة: دعاؤں کا انتخاب',
    subheading: 'خدا کی بارگاہ میں کامل عاجزی اور رحمت کی فریاد',
    lines: [
      'دعا 215: توکل علی اللہ کی دعا:',
      '"اے اللہ! تو اپنے اولیاء کے لیے سب سے زیادہ مانوس ہمدم ہے، اور تجھ پر بھروسہ کرنے والوں کی مدد کے لیے سب سے زیادہ تیار ہے۔',
      'تو ان کے دلوں کے بھید جانتا ہے اور ان کی بصیرت کی گہرائیوں سے باخبر ہے۔ ان کے راز تیرے سامنے کھلے ہیں اور ان کے دل تیرے لیے بے چین ہیں۔',
      'اگر تنہائی انہیں خوفزدہ کرے تو تیرا ذکر انہیں تسکین دیتا ہے، اور اگر مصائب ٹوٹ پڑیں تو وہ تیری بارگاہ میں پناہ ڈھونڈتے ہیں۔"',
      '',
      'دعا 115: نمازِ استسقاء:',
      '"اے اللہ! ہمارے پہاڑ سوکھ کر چٹخ گئے ہیں، ہماری زمینیں گرد آلود ہو گئی ہیں، اور ہمارے جانور پیاس کی شدت سے نڈھال ہیں۔',
      'ہمیں بخش دے اور ہم پر ایسی بارانِ رحمت نازل فرما جو زمین کو سیراب کر دے اور قحط سالی کا خاتمہ کرے۔"',
    ],
  },
  {
    heading: 'شروح نہج البلاغہ اور کینونیکل حوالہ جات',
    subheading: 'تاریخی و تحقیقی شروحات کا تعارف',
    lines: [
      'اردو اور عربی کی معتبر ترین شروحات:',
      '  1. علامہ ذیشان حیدر جوادی کا مستند اردو ترجمہ و حواشی',
      '  2. مفتی جعفر حسین کا شرح و ترجمہ نہج البلاغہ',
      '  3. شرح ابن ابی الحدید المعتزلی (20 جلدیں)',
      '  4. شرح ابن میثم البحرانی (کبیر و صغیر)',
      '',
      'یہ مکمل 15 صفحات پر مشتمل تصدیق شدہ کینونیکل پی ڈی ایف ایڈیشن نہج البلاغہ پلیٹ فارم کے لیے تیار کیا گیا ہے۔',
    ],
  },
];

// Generate English PDF
fs.writeFileSync(
  path.join(outDir, 'nahj-al-balagha-english.pdf'),
  buildMultiPagePdf(
    'Nahj al-Balagha (Peak of Eloquence)',
    'English Translation by Syed Ali Reza',
    englishPages
  )
);
console.log('✅ Generated 15-Page English PDF');

// Generate Arabic PDF
fs.writeFileSync(
  path.join(outDir, 'nahj-al-balagha-arabic.pdf'),
  buildMultiPagePdf(
    'نهج البلاغة - الطبعة المعتمدة',
    'النسخة العربية الكاملة للشريف الرضي',
    arabicPages
  )
);
console.log('✅ Generated 15-Page Arabic PDF');

// Generate Urdu PDF
fs.writeFileSync(
  path.join(outDir, 'nahj-al-balagha-urdu.pdf'),
  buildMultiPagePdf(
    'ترجمہ و شرح نہج البلاغہ',
    'اردو ایڈیشن - علامہ ذیشان حیدر جوادی',
    urduPages
  )
);
console.log('✅ Generated 15-Page Urdu PDF');
