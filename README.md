# Nahj al-Balagha AI Knowledge & Learning Platform

A production-ready, personalized **Retrieval-Augmented Generation (RAG)** platform and intelligent learning companion for exploring the sermons, letters, and maxims of Imam Ali ibn Abi Talib (a.s.) as preserved in *Nahj al-Balagha*.

---

## Architecture & Data Storage Design

The system implements strict separation of concerns:
- **MongoDB (Application Data Layer):** Exclusively stores user profiles, preferences, short- and long-term conversation history, bookmarks, personal notes, topic collections, learning paths, and quiz results.
- **Vector Database (Semantic Knowledge Base):** Dedicated vector storage (Pinecone or high-performance in-memory vector store) containing embedded chunks of authentic Nahj al-Balagha sermons, letters, and sayings with rich metadata (Arabic parallel text, chapter, translator, and topical tags).
- **AI / RAG Pipeline:** Multi-stage retrieval with query rewriting, language routing (Arabic, Urdu, Roman Urdu, English), hybrid retrieval, structured citations, and personalized prompt construction.
- **Frontend Layer:** Production-ready Next.js 16 application with an Islamic aesthetic (Emerald & Gold accents, Amiri Arabic calligraphy, glassmorphism, responsive navigation).

---

## Key Features

1. **AI Companion (Conversational RAG):**
   - Source-grounded conversations with verified citations.
   - Preserves original Arabic text alongside translations.
   - Strict religious accuracy directives (never fabricates quotes or attributes AI interpretations to Imam Ali).
   - Generates suggested follow-up questions and topic exploration chips.

2. **Passage Explorer:**
   - Filter through Sermons (Khutbat), Letters (Kutub), and Sayings (Hikam).
   - Real-time semantic and keyword search.
   - Side-by-side Arabic text and English translations (Syed Ali Reza edition).

3. **Personalized Learning Engine:**
   - On-demand AI curriculum generator for topics like *Governance*, *Justice*, *Patience*, and *Ethics*.
   - Dynamic lesson timelines with estimated study times and direct passage links.
   - Multiple-choice comprehension quizzes generated from passage context with instant grading and explanations.

4. **Personal Knowledge Management (PKM):**
   - Bookmarks with passage type and number tracking.
   - Markdown personal notes and AI reflection saver.
   - Topic-based collections (e.g. *Governance Series*, *Spiritual Reflections*).

5. **Personalization Engine:**
   - Configurable language: English, Urdu, Classical Arabic, and Roman Urdu.
   - Explanation depths: Beginner, Intermediate, Advanced, Researcher.
   - Explanation styles: Reflective, Analytical, Simplified, Scholarly.
   - Response length controls and accessibility toggles.

6. **Daily Wisdom & Contemplation:**
   - Automated daily passage delivery matched to user interests.
   - Introspective reflection prompts to stimulate moral development.

---

## Technology Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS + Radix UI + Lucide Icons + Framer Motion
- **AI / RAG:** LangChain Core, LangChain Community, LangChain OpenAI
- **Database:** MongoDB (via Mongoose)
- **Vector DB:** Pinecone SDK + In-Memory Vector Store fallback
- **Authentication:** NextAuth.js (Auth.js v5 beta) + bcryptjs
- **Validation:** Zod

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 20+)
- MongoDB database (local or MongoDB Atlas)
- OpenAI API key (or Google AI API key)

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials:
```env
MONGODB_URI=mongodb://localhost:27017/nahj_al_balagha
NEXTAUTH_SECRET=your-random-32-char-secret-string-here
NEXTAUTH_URL=http://localhost:3000

OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o

EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-large
EMBEDDING_DIMENSIONS=3072

VECTOR_DB_PROVIDER=pinecone # or 'inmemory'
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX=nahj-al-balagha
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Or build and start for production
npm run build
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) to open the platform.

---

## API Documentation

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat` | `POST` | Conversational RAG with personalized prompt construction and source citations |
| `/api/chat/feedback` | `POST` | Record user feedback (rating & comments) |
| `/api/conversations` | `GET` | List user conversation history |
| `/api/passages/search` | `GET` | Semantic and keyword vector search across Nahj al-Balagha passages |
| `/api/bookmarks` | `GET`, `POST` | Manage saved passages and bookmarks |
| `/api/notes` | `GET`, `POST` | Manage personal study notes and AI reflections |
| `/api/collections` | `GET`, `POST` | Group bookmarks and notes into topic folders |
| `/api/learning/paths` | `GET`, `POST` | Generate and fetch structured learning curricula |
| `/api/learning/paths/[id]/lessons/[lessonId]/quiz` | `POST` | Generate comprehension quiz for a lesson |
| `/api/learning/quizzes/submit` | `POST` | Submit quiz answers, calculate score, and unlock progress |
| `/api/recommendations/daily` | `GET` | Retrieve daily wisdom and reflection prompts |
| `/api/users/me/preferences` | `GET`, `PUT` | Retrieve and update personalization directives |
