import { ingestionPipeline } from './pipeline';
import { SEED_PASSAGES } from './seed-data';

let _isSeeded = false;
let _seedingPromise: Promise<void> | null = null;

export async function ensureKnowledgeBaseSeeded(): Promise<void> {
  if (_isSeeded) return;
  if (_seedingPromise) return _seedingPromise;

  _seedingPromise = (async () => {
    try {
      const result = await ingestionPipeline.ingestPassages(SEED_PASSAGES, {
        sourceName: 'Nahj al-Balagha Standard English Edition',
        language: 'english',
        translator: 'Syed Ali Reza / Allama Mufti Jafar Hussain',
        book: 'Nahj al-Balagha',
        edition: 'Peak of Eloquence',
      });
      _isSeeded = true;
      console.log(`✅ Knowledge base successfully seeded: ${result.totalPassages} passages (${result.totalChunks} chunks).`);
    } catch (error) {
      console.error('Error seeding knowledge base:', error);
    } finally {
      _seedingPromise = null;
    }
  })();

  return _seedingPromise;
}
