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
  X,
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
    <div className="h-[calc(100vh-7.5rem)] flex flex-col bg-white rounded-3xl border border-[#ECE7DE] shadow-xs overflow-hidden relative max-w-6xl mx-auto">
      {/* Chat Header */}
      <div className="px-6 py-3.5 border-b border-[#ECE7DE] bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EBF3EE] text-[#143E2E] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#18231C] flex items-center gap-2">
              Nahj al-Balagha Knowledge Companion
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DDECE3] text-[#143E2E]">
                Source Grounded
              </span>
            </h2>
            <p className="text-[11px] text-[#8E877D]">
              Verified against original sermons, letters, and aphorisms
            </p>
          </div>
        </div>

        <button
          onClick={startNewChat}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FBF9F5] border border-[#ECE7DE] hover:border-[#143E2E]/40 text-xs text-[#18231C] font-semibold transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Exploration</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#FBF9F5]/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 md:p-5 text-xs md:text-sm leading-relaxed shadow-xs ${
                msg.role === 'user'
                  ? 'bg-[#143E2E] text-white rounded-br-xs'
                  : 'bg-white border border-[#ECE7DE] text-[#18231C] rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Disclaimer if context was insufficient */}
              {msg.disclaimer && (
                <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-[#FFF2EB] border border-[#F5D5C6] text-[#A25232] text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{msg.disclaimer}</span>
                </div>
              )}

              {/* Citations Grid */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-[#ECE7DE]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#143E2E] flex items-center gap-1.5 mb-2.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Verified Passages & Citations:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.citations.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedCitation(c)}
                        className="p-3 rounded-xl bg-[#FBF9F5] border border-[#ECE7DE] hover:border-[#143E2E]/40 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#18231C] capitalize">
                            {c.passageType} #{c.passageNumber}
                          </span>
                          <span className="text-[10px] text-[#143E2E] font-bold px-1.5 py-0.5 rounded bg-[#EBF3EE]">
                            {Math.round(c.confidence * 100)}% match
                          </span>
                        </div>
                        <p className="text-[11px] text-[#58635B] line-clamp-2 mt-1">
                          {c.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Questions Chips */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#ECE7DE]">
                  <span className="text-[10px] font-bold text-[#8E877D] uppercase tracking-wider block mb-1.5">
                    Suggested Explorations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(q)}
                        className="text-left text-xs px-3 py-1.5 rounded-xl bg-[#EBF3EE] border border-[#D2E4D8] hover:bg-[#DDECE3] text-[#143E2E] font-medium transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Assistant Message Actions Toolbar */}
              {msg.role === 'assistant' && msg.id !== 'welcome' && (
                <div className="mt-3 pt-2 flex items-center justify-between text-xs text-[#8E877D] border-t border-[#ECE7DE]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleFeedback(msg.id, 5)}
                      className="p-1.5 rounded-lg hover:bg-[#FBF9F5] hover:text-[#143E2E] transition-colors"
                      title="Helpful response"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, 1)}
                      className="p-1.5 rounded-lg hover:bg-[#FBF9F5] hover:text-red-500 transition-colors"
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => copyToClipboard(msg.id, msg.content)}
                    className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-[#FBF9F5] hover:text-[#18231C] transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#143E2E]" />
                        <span className="text-[10px] text-[#143E2E] font-bold">Copied</span>
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
            <div className="bg-white p-3.5 px-4 rounded-2xl border border-[#ECE7DE] flex items-center gap-3 text-[#58635B] text-xs shadow-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-[#143E2E]" />
              <span>Consulting sermons, letters, and maxims in knowledge base...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-[#ECE7DE]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask a question in English, Urdu, Roman Urdu, or Arabic..."
            className="flex-1 px-5 py-3 bg-[#FBF9F5] border border-[#ECE7DE] rounded-full text-xs md:text-sm text-[#18231C] placeholder-[#8E877D] focus:outline-none focus:border-[#143E2E]/40 focus:ring-1 focus:ring-[#143E2E]/30 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 rounded-full bg-[#143E2E] hover:bg-[#194B37] text-white font-bold disabled:opacity-40 transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Citation Detail Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 bg-[#18231C]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl border border-[#ECE7DE] p-6 space-y-4 max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3">
              <div>
                <span className="text-[10px] text-[#143E2E] uppercase font-bold tracking-wider">
                  Source Reference
                </span>
                <h3 className="text-lg font-serif font-bold text-[#18231C] capitalize">
                  {selectedCitation.passageType} #{selectedCitation.passageNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-[#8E877D] hover:text-[#18231C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedCitation.arabicText && (
              <div>
                <span className="text-xs text-[#8E877D] block mb-1 font-semibold">
                  Original Arabic:
                </span>
                <p className="font-arabic text-lg text-[#143E2E] text-right leading-loose p-4 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE]">
                  {selectedCitation.arabicText}
                </p>
              </div>
            )}

            <div>
              <span className="text-xs text-[#8E877D] block mb-1 font-semibold">
                Translation ({selectedCitation.translator || 'Syed Ali Reza'}):
              </span>
              <p className="text-sm text-[#18231C] leading-relaxed p-4 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE]">
                {selectedCitation.text}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleBookmark(selectedCitation)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EBF3EE] border border-[#D2E4D8] text-[#143E2E] text-xs font-bold hover:bg-[#DDECE3] transition-colors"
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
    <Suspense
      fallback={
        <div className="py-24 text-center text-[#58635B] text-xs">
          Loading AI companion...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
