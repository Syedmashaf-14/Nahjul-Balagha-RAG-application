import { ingestionPipeline } from './pipeline';
import { SEED_PASSAGES } from './seed-data';

export async function ensureKnowledgeBaseSeeded(): Promise<void> {
  try {
    const result = await ingestionPipeline.ingestPassages(SEED_PASSAGES, {
      sourceName: 'Nahj al-Balagha Standard English Edition',
      language: 'english',
      translator: 'Syed Ali Reza',
      book: 'Nahj al-Balagha',
      edition: 'Peak of Eloquence',
    });
    console.log(`✅ Knowledge base successfully seeded: ${result.totalPassages} passages (${result.totalChunks} chunks).`);
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
  }
}
