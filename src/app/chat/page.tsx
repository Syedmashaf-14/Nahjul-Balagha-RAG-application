'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  Sparkles,
  Bookmark,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  PlusCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Citation } from '@/types/passage.types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  suggestedFollowUps?: string[];
  relatedTopics?: string[];
  disclaimer?: string | null;
  confidenceLevel?: string;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Peace be upon you. I am your Nahj al-Balagha knowledge companion. You may ask me questions regarding Imam Ali’s sermons on theology, his letters on governance and justice, or his maxims on human character. How may I assist your contemplation today?',
      suggestedFollowUps: [
        'Explain the core advice in Letter 53 to Malik al-Ashtar',
        'What does Imam Ali say about the nature of knowledge in Saying 147?',
        'How are the pious described in Khutba al-Muttaqeen (Sermon 193)?',
      ],
      relatedTopics: ['Governance', 'Virtue', 'Knowledge', 'Patience'],
    },
  ]);

  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedId, setBookmarkedId] = useState<string | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // If initial query was passed in URL, auto-submit
  useEffect(() => {
    if (initialQuery && messages.length === 1) {
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsgId = Date.now().toString();
    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: text,
      },
    ];

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId: conversationId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        if (!conversationId && data.data.conversationId) {
          setConversationId(data.data.conversationId);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: data.data.messageId,
            role: 'assistant',
            content: data.data.content,
            citations: data.data.citations,
            suggestedFollowUps: data.data.suggestedFollowUps,
            relatedTopics: data.data.relatedTopics,
            disclaimer: data.data.disclaimer,
            confidenceLevel: data.data.confidenceLevel,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content:
              'I apologize, but an error occurred while connecting to the knowledge base. Please verify your query or try again.',
          },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'An unexpected connection error occurred. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBookmark = async (citation: Citation) => {
    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passageType: citation.passageType,
          passageNumber: citation.passageNumber,
          title: `${citation.passageType.toUpperCase()} #${citation.passageNumber}`,
          arabicText: citation.arabicText,
          translationText: citation.text,
          language: citation.language,
          translator: citation.translator,
        }),
      });
      setBookmarkedId(`${citation.passageType}_${citation.passageNumber}`);
      setTimeout(() => setBookmarkedId(null), 2500);
    } catch (err) {
      console.error('Failed to bookmark:', err);
    }
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, rating }),
      });
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        id: 'welcome-new',
        role: 'assistant',
        content: 'New exploration started. What topic or passage would you like to investigate?',
        suggestedFollowUps: [
          'What are the qualities of true leaders?',
          'How to overcome anxiety and grief according to Imam Ali?',
          'What is the meaning of Saying 81?',
        ],
      },
    ]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col glass-panel rounded-3xl border border-slate-800 overflow-hidden relative">
      {/* Chat Header */}
      <div className="px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Nahj al-Balagha AI Companion
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Source Grounded
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Verified against sermons, letters, and maxims</p>
          </div>
        </div>

        <button
          onClick={startNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Exploration</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 md:p-5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/10 rounded-br-none'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Disclaimer if context was insufficient */}
              {msg.disclaimer && (
                <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{msg.disclaimer}</span>
                </div>
              )}

              {/* Citations Carousel / Grid */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Verified Sources & Citations:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.citations.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedCitation(c)}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white capitalize">
                            {c.passageType} #{c.passageNumber}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            {Math.round(c.confidence * 100)}% match
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {c.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Questions Chips */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Suggested Explorations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(q)}
                        className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-300 hover:text-white transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Assistant Message Actions Toolbar */}
              {msg.role === 'assistant' && msg.id !== 'welcome' && (
                <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/40">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleFeedback(msg.id, 5)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                      title="Helpful response"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, 1)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-red-400 transition-colors"
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => copyToClipboard(msg.id, msg.content)}
                    className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3 text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Consulting sermons, letters, and maxims in knowledge base...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask a question in English, Urdu, Roman Urdu, or Arabic..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:opacity-95 disabled:opacity-40 transition-all shadow-md shadow-emerald-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Citation Modal / Detail Drawer */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full rounded-2xl border border-emerald-500/30 p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-emerald-400 uppercase font-bold tracking-wider">
                  Source Reference
                </span>
                <h3 className="text-lg font-bold text-white capitalize">
                  {selectedCitation.passageType} #{selectedCitation.passageNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>

            {selectedCitation.arabicText && (
              <div>
                <span className="text-xs text-slate-400 block mb-1 font-semibold">
                  Original Arabic:
                </span>
                <p className="font-arabic text-lg text-amber-200 text-right leading-loose p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  {selectedCitation.arabicText}
                </p>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-400 block mb-1 font-semibold">
                Translation ({selectedCitation.translator || 'Syed Ali Reza'}):
              </span>
              <p className="text-sm text-slate-200 leading-relaxed p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                {selectedCitation.text}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleBookmark(selectedCitation)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>
                  {bookmarkedId ===
                  `${selectedCitation.passageType}_${selectedCitation.passageNumber}`
                    ? 'Saved!'
                    : 'Bookmark Passage'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400 text-xs">Loading AI companion...</div>}>
      <ChatContent />
    </Suspense>
  );
}
