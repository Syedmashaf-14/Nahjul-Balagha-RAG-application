import { NextRequest } from 'next/server';
import { knowledgeRetriever } from '@/rag/retrieval/retriever';
import { ensureKnowledgeBaseSeeded } from '@/ingestion/seed-runner';
import { PassageType } from '@/types/passage.types';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    await ensureKnowledgeBaseSeeded();

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || 'wisdom ethics justice';
    const type = (searchParams.get('type') as PassageType) || undefined;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const docs = await knowledgeRetriever.retrieve(query, limit, {
      passageType: type,
    });

    return successResponse(docs);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
