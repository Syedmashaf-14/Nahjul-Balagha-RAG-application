import { NextRequest } from 'next/server';
import { knowledgeRetriever } from '@/rag/retrieval/retriever';
import { ensureKnowledgeBaseSeeded } from '@/ingestion/seed-runner';
import { SEED_PASSAGES } from '@/ingestion/seed-data';
import { PassageType, RetrievedDocument } from '@/types/passage.types';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    await ensureKnowledgeBaseSeeded();

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim();
    const type = (searchParams.get('type') as PassageType) || undefined;
    const limit = parseInt(searchParams.get('limit') || '18', 10);

    let docs: RetrievedDocument[] = [];

    if (query) {
      // Vector search for specific semantic search query
      const retrieved = await knowledgeRetriever.retrieve(query, limit * 2, {
        passageType: type,
      });

      // Strictly deduplicate by passage type + number so the same sermon/saying never appears twice
      const seen = new Set<string>();
      for (const d of retrieved) {
        const key = `${d.metadata.passageType}_${d.metadata.passageNumber}`;
        if (!seen.has(key)) {
          seen.add(key);
          docs.push(d);
        }
        if (docs.length >= limit) break;
      }
    } else {
      // Category browsing (All sources, Sermons, Letters, Sayings, Duas)
      let matchedPassages = [...SEED_PASSAGES];

      if (type) {
        matchedPassages = matchedPassages.filter(
          (p) => p.chapter?.toLowerCase() === type.toLowerCase()
        );
      }

      docs = matchedPassages.map((p, idx) => ({
        id: `canonical_${p.chapter?.toLowerCase() || 'passage'}_${p.number}`,
        content: p.translationText || p.arabicText || '',
        metadata: {
          book: 'Nahj al-Balagha',
          sourceId: `src_${p.number}`,
          passageType: (p.chapter?.toLowerCase() || 'sermon') as PassageType,
          passageNumber: p.number,
          passageTitle: p.title || `${p.chapter} ${p.number}`,
          language: 'english',
          translator: p.translator || 'Syed Ali Reza / Allama Zeeshan Haider Jawadi',
          contentType: 'translation',
          commentaryAuthor: null,
          chapter: p.chapter || null,
          section: p.section || null,
          chunkIndex: 0,
          totalChunks: 1,
          arabicOriginal: p.arabicText || null,
          urduTranslation: p.urduTranslation || null,
          topics: p.topics || [],
          ingestedAt: new Date().toISOString(),
          chunkSize: (p.translationText || '').length,
        },
        score: 1.0,
      }));
    }

    return successResponse(docs);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
