import { RawPassage } from '../types/passage.types';
import canonicalPassagesJson from './canonical-passages.json';

export const SEED_PASSAGES: RawPassage[] = (canonicalPassagesJson as any[]).map((p) => ({
  number: p.number,
  title: p.title,
  chapter:
    p.chapter === 'sermon'
      ? 'Sermon'
      : p.chapter === 'letter'
      ? 'Letter'
      : p.chapter === 'dua'
      ? 'Dua'
      : 'Saying',
  section: p.section || p.chapter,
  language: 'english',
  translator: p.translator || 'Syed Ali Reza / Allama Mufti Jafar Hussain',
  arabicText: p.arabicText,
  translationText: p.translationText,
  urduTranslation: p.urduTranslation,
  topics: p.topics || ['wisdom'],
}));
