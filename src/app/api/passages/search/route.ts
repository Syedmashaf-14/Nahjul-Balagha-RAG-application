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
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let docs: RetrievedDocument[] = [];
    const seen = new Set<string>();

    if (query) {
      const qLower = query.toLowerCase();
      const numMatch = query.match(/\d+/);
      const targetNum = numMatch ? parseInt(numMatch[0], 10) : null;

      // 1. Direct match on passage number or title or Arabic text from all 792 canonical passages
      const directMatches = SEED_PASSAGES.filter((p) => {
        const matchesType = !type || p.chapter?.toLowerCase() === type.toLowerCase();
        if (!matchesType) return false;

        if (targetNum !== null && p.number === targetNum) return true;
        if (p.title?.toLowerCase().includes(qLower)) return true;
        if (p.arabicText?.includes(query)) return true;
        if (p.translationText?.toLowerCase().includes(qLower)) return true;
        if (p.urduTranslation?.includes(query)) return true;
        return false;
      });

      for (const p of directMatches) {
        const key = `${p.chapter?.toLowerCase()}_${p.number}`;
        if (!seen.has(key)) {
          seen.add(key);
          docs.push({
            id: `canonical_${p.chapter?.toLowerCase() || 'passage'}_${p.number}`,
            content: p.translationText || p.arabicText || '',
            metadata: {
              book: 'Nahj al-Balagha',
              sourceId: `src_${p.number}`,
              passageType: (p.chapter?.toLowerCase() || 'sermon') as PassageType,
              passageNumber: p.number,
              passageTitle: p.title || `${p.chapter} ${p.number}`,
              language: 'english',
              translator: p.translator || 'Syed Ali Reza / Allama Mufti Jafar Hussain',
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
          });
        }
        if (docs.length >= limit) break;
      }

      // 2. Vector search if more results needed
      if (docs.length < limit) {
        const retrieved = await knowledgeRetriever.retrieve(query, (limit - docs.length) * 2, {
          passageType: type,
        });

        for (const d of retrieved) {
          const key = `${d.metadata.passageType}_${d.metadata.passageNumber}`;
          if (!seen.has(key)) {
            seen.add(key);
            docs.push(d);
          }
          if (docs.length >= limit) break;
        }
      }
    } else {
      // Category browsing (All sources, Sermons, Letters, Sayings, Duas)
      let matchedPassages = [...SEED_PASSAGES];

      if (type) {
        matchedPassages = matchedPassages.filter(
          (p) => p.chapter?.toLowerCase() === type.toLowerCase()
        );
      }

      docs = matchedPassages.slice(0, limit).map((p) => ({
        id: `canonical_${p.chapter?.toLowerCase() || 'passage'}_${p.number}`,
        content: p.translationText || p.arabicText || '',
        metadata: {
          book: 'Nahj al-Balagha',
          sourceId: `src_${p.number}`,
          passageType: (p.chapter?.toLowerCase() || 'sermon') as PassageType,
          passageNumber: p.number,
          passageTitle: p.title || `${p.chapter} ${p.number}`,
          language: 'english',
          translator: p.translator || 'Syed Ali Reza / Allama Mufti Jafar Hussain',
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
