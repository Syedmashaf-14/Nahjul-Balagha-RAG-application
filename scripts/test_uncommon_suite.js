const fs = require('fs');
const path = require('path');

const LIVE_API_URL = 'https://nehjulbalagah.vercel.app/api/chat';

const scenarios = [
  // Multi-turn 1: Uthman ibn Hunayf (Letter 45) -> Follow-up on its famous teaching
  {
    thread: 'Thread-1: Letter 45 (Uthman ibn Hunayf & Loaf of Bread)',
    turns: [
      {
        prompt: 'Which letter was written to Uthman ibn Hunayf regarding attending a wealthy banquet in Basra?',
        expectedDiscourse: { type: 'letter', number: 45 },
      },
      {
        prompt: 'What did Imam Ali say in this letter about his own simple food and garments?',
        expectedDiscourse: { type: 'letter', number: 45 },
      },
    ],
  },

  // Multi-turn 2: Final Martyrdom Testament (Letter 47)
  {
    thread: 'Thread-2: Letter 47 (Testament to Hasan and Husayn on deathbed)',
    turns: [
      {
        prompt: 'What is the number of the letter containing Imam Ali’s final will and testament to Hasan and Husayn after being struck by Ibn Muljam?',
        expectedDiscourse: { type: 'letter', number: 47 },
      },
      {
        prompt: 'Summarize the core ethical points mentioned in this final will.',
        expectedDiscourse: { type: 'letter', number: 47 },
      },
    ],
  },

  // Multi-turn 3: Shurayh the Judge (Letter 3)
  {
    thread: 'Thread-3: Letter 3 (Qadi Shurayh buying a house)',
    turns: [
      {
        prompt: 'Which letter did Imam Ali write when his judge Shurayh purchased a house for 80 dinars?',
        expectedDiscourse: { type: 'letter', number: 3 },
      },
    ],
  },

  // Multi-turn 4: Sermon 224 (The Ant, the Gnat, and the Earthly realm)
  {
    thread: 'Thread-4: Sermon 224 / 185 (Creation of the Ant)',
    turns: [
      {
        prompt: 'In which sermon does Imam Ali reflect on the creation of the ant, asking us to look at its tiny limbs and how it gathers food?',
        expectedDiscourse: { type: 'sermon', number: 224 },
      },
      {
        prompt: 'What lesson does he draw from this small creature about Allah’s divine power?',
        expectedDiscourse: { type: 'sermon', number: 224 },
      },
    ],
  },

  // Multi-turn 5: Sermon 27 (The famous Sermon on Jihad)
  {
    thread: 'Thread-5: Sermon 27 (Jihad is a door from the doors of Paradise)',
    turns: [
      {
        prompt: 'Which sermon begins with the statement: Jihad is one of the doors of Paradise which Allah has opened for His special friends?',
        expectedDiscourse: { type: 'sermon', number: 27 },
      },
    ],
  },

  // Multi-turn 6: Saying 150 (Warning against hypocrisy in piety)
  {
    thread: 'Thread-6: Saying 150 (Do not be like him who hopes for the next life without work)',
    turns: [
      {
        prompt: 'Which saying of Imam Ali begins with: Do not be like him who hopes for the afterlife without work, and delays repentance by lengthening hopes?',
        expectedDiscourse: { type: 'saying', number: 150 },
      },
    ],
  },

  // Multi-turn 7: Saying 289 (Qualities of a True Brother)
  {
    thread: 'Thread-7: Saying 289 (A beloved brother in the past)',
    turns: [
      {
        prompt: 'In which saying does Imam Ali describe a past companion: In the past I had a brother in Allah who was elevated in my eyes because the world was small in his eyes?',
        expectedDiscourse: { type: 'saying', number: 289 },
      },
    ],
  },

  // Multi-turn 8: Urdu uncommon query on Letter 50
  {
    thread: 'Thread-8: Letter 50 (فرمان بنام امراء و سالار لشکر)',
    turns: [
      {
        prompt: 'امیر المومنین کا وہ مکتوب نمبر بتائیں جو آپ نے اپنے لشکر کے سرداروں اور کمانڈروں کے نام لکھا تاکہ ان کے اور عوام کے فرائض واضح ہوں؟',
        expectedDiscourse: { type: 'letter', number: 50 },
      },
    ],
  },
];

async function runTurn(prompt, conversationId) {
  const startTime = Date.now();
  const res = await fetch(LIVE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: prompt,
      conversationId: conversationId || undefined,
    }),
  });
  const elapsedMs = Date.now() - startTime;
  const data = await res.json();
  return { elapsedMs, data };
}

async function main() {
  console.log('🧪 Starting Uncommon Discourse & Multi-Conversation Audit...\n');
  const results = [];

  for (let sIdx = 0; sIdx < scenarios.length; sIdx++) {
    const sc = scenarios[sIdx];
    console.log(`=======================================================`);
    console.log(`▶ [Scenario ${sIdx + 1}/${scenarios.length}] ${sc.thread}`);
    console.log(`=======================================================`);

    let convId = null;

    for (let tIdx = 0; tIdx < sc.turns.length; tIdx++) {
      const turn = sc.turns[tIdx];
      console.log(`\n  Turn ${tIdx + 1}: "${turn.prompt}"`);

      try {
        const { elapsedMs, data } = await runTurn(turn.prompt, convId);
        if (!data.success || !data.data) {
          console.log(`   ❌ API Error:`, data.error);
          results.push({ thread: sc.thread, prompt: turn.prompt, success: false, error: data.error });
          continue;
        }

        const payload = data.data;
        convId = payload.conversationId;

        const firstCitation = payload.citations && payload.citations[0]
          ? `${payload.citations[0].passageType} #${payload.citations[0].passageNumber}`
          : 'NONE';

        const allCitations = (payload.citations || []).map(c => `${c.passageType} #${c.passageNumber}`).join(', ');

        const expectedStr = `${turn.expectedDiscourse.type} #${turn.expectedDiscourse.number}`;
        const rank1Matches = firstCitation.toLowerCase() === expectedStr.toLowerCase();

        console.log(`   ⏱️ Latency: ${elapsedMs}ms`);
        console.log(`   💬 AI Answer snippet: "${payload.content.substring(0, 160).replace(/\n/g, ' ')}..."`);
        console.log(`   📚 Source #1: [${firstCitation}] (Expected: [${expectedStr}])`);
        console.log(`   🎯 Rank 1 Match: ${rank1Matches ? '✅ EXACT MATCH' : '⚠️ MISMATCH'}`);
        console.log(`   📑 All Sources: ${allCitations}`);

        results.push({
          thread: sc.thread,
          turnIndex: tIdx + 1,
          prompt: turn.prompt,
          latencyMs: elapsedMs,
          answer: payload.content,
          firstCitation,
          expectedStr,
          rank1Matches,
          allCitations,
        });

      } catch (err) {
        console.log(`   ❌ Exception:`, err.message);
        results.push({ thread: sc.thread, prompt: turn.prompt, success: false, error: err.message });
      }

      await new Promise(r => setTimeout(r, 800));
    }
  }

  const outPath = path.join(__dirname, 'uncommon_test_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n\n🎉 All uncommon multi-turn tests finished! Results saved to ${outPath}`);
}

main().catch(console.error);
