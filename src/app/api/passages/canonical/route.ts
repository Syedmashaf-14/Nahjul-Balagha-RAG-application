import { NextRequest } from 'next/server';
import { SEED_PASSAGES } from '@/ingestion/seed-data';
import { successResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type')?.toLowerCase();
  const numberParam = searchParams.get('number');

  let results = [...SEED_PASSAGES];

  if (type) {
    results = results.filter((p) => p.chapter?.toLowerCase().includes(type));
  }

  if (numberParam) {
    const num = parseInt(numberParam, 10);
    results = results.filter((p) => p.number === num);
  }

  return successResponse(results);
}
