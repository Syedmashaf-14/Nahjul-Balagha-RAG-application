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
  Image as ImageIcon,
  Languages,
} from 'lucide-react';
import { Citation } from '@/types/passage.types';
import { recordDailyStudyActivity } from '@/lib/streak';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string | null;
  citations?: Citation[];
  suggestedFollowUps?: string[];
  relatedTopics?: string[];
  disclaimer?: string | null;
  confidenceLevel?: string;
}

const STORAGE_ACTIVE_CONV = 'nahj_active_conversation_id';

const INITIAL_WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Peace be upon you. I am your Nahj al-Balagha knowledge companion. You may ask me questions regarding Imam Ali’s sermons on theology, his letters on governance and justice, or his maxims on human character. How may I assist your contemplation today?\n\nالسلام علیکم! میں نہج البلاغہ کے علوم و حکمت پر مبنی آپ کا رفیق ہوں۔ آپ خطبات، مکتوبات، حکمتوں یا دعاؤں کے بارے میں اردو یا انگریزی میں استفسار فرما سکتے ہیں۔ آپ خطاطی یا کتابی متن کی تصویر بھی منسلک کر سکتے ہیں۔',
  suggestedFollowUps: [
    'Explain the core advice in Letter 53 to Malik al-Ashtar',
    'مالک اشتر کے نام خط نمبر 53 کے بنیادی نکات کی وضاحت فرمائیں',
    'What does Imam Ali say about knowledge in Saying 147?',
    'حکمت نمبر 147 میں علم کی کیا فضیلت بیان ہوئی ہے؟',
  ],
  relatedTopics: ['Governance / حکمرانی', 'Virtue / تقویٰ', 'Knowledge / علم', 'Justice / عدل'],
};

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [messages, setMessages] = useState<Message[]>([INITIAL_WELCOME_MESSAGE]);
  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedId, setBookmarkedId] = useState<string | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  // Restore prior conversation session from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedConvId = localStorage.getItem(STORAGE_ACTIVE_CONV);
    if (savedConvId && !initialQuery) {
      setLoading(true);
      fetch(`/api/conversations/${savedConvId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.messages && data.data.messages.length > 0) {
            setConversationId(savedConvId);
            const restored: Message[] = data.data.messages.map((m: any) => ({
              id: m.id || Math.random().toString(),
              role: m.role as 'user' | 'assistant',
              content: m.content || '',
              citations: m.citations,
              suggestedFollowUps: m.suggestedFollowUps,
              relatedTopics: m.relatedTopics,
              disclaimer: m.disclaimer,
              confidenceLevel: m.confidenceLevel,
            }));
            setMessages([INITIAL_WELCOME_MESSAGE, ...restored]);
          }
        })
        .catch((err) => {
          console.warn('Could not restore previous session:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [initialQuery]);

  // Multimodal image upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPEG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('The image is larger than 8MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async (textToSend?: string) => {
    const currentImage = selectedImage;
    const rawText = (textToSend !== undefined ? textToSend : input).trim();

    // If an image is attached without text, formulate an insightful default inquiry
    const text =
      rawText ||
      (currentImage
        ? 'Please inspect and transcribe this image, and explain its theological and canonical connection to Nahj al-Balagha and the teachings of Imam Ali (a.s.).'
        : '');

    if (!text && !currentImage) return;
    if (loading) return;

    const userMsgId = Date.now().toString();
    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: text,
        image: currentImage || undefined,
      },
    ];

    setMessages(newMessages);
    setInput('');
    clearImage();
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          image: currentImage || undefined,
          conversationId: conversationId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const activeId = conversationId || data.data.conversationId;
        if (activeId) {
          setConversationId(activeId);
          try {
            localStorage.setItem(STORAGE_ACTIVE_CONV, activeId);
          } catch (e) {}
        }
        recordDailyStudyActivity();

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
    try {
      localStorage.removeItem(STORAGE_ACTIVE_CONV);
    } catch (e) {}
    setMessages([
      {
        id: 'welcome-new',
        role: 'assistant',
        content: 'New exploration started. What topic or passage would you like to investigate?\n\nنیا مکالمہ شروع کر دیا گیا ہے۔ آپ نہج البلاغہ کے کس خطبے، مکتوب یا حکمت کے متعلق دریافت کرنا چاہتے ہیں؟',
        suggestedFollowUps: [
          'What are the qualities of true leaders in Letter 53?',
          'مالک اشتر کے نام خط نمبر 53 کے بنیادی اصول کیا ہیں؟',
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
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FBF9F5] border border-[#ECE7DE] text-[#58635B]">
                <Languages className="w-3 h-3 text-[#143E2E]" />
                Auto: English / اردو
              </span>
            </h2>
            <p className="text-[11px] text-[#8E877D]">
              Verified against original sermons, letters, and aphorisms • Answers in question&apos;s language
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
              {/* User Attached Image Display */}
              {msg.image && (
                <div className="mb-3 overflow-hidden rounded-xl border border-white/20 bg-black/10">
                  <img
                    src={msg.image}
                    alt="Uploaded manuscript / excerpt"
                    className="w-full max-h-60 object-contain rounded-xl bg-[#18231C]/10"
                  />
                  <div className="px-2.5 py-1 bg-black/30 text-[10px] text-white/90 flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3" />
                    <span>Analyzed with Nahj Vision</span>
                  </div>
                </div>
              )}

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
      <div className="bg-white border-t border-[#ECE7DE]">
        {/* Attached Image Preview Strip */}
        {imagePreview && (
          <div className="px-4 py-2.5 bg-[#FBF9F5] border-b border-[#ECE7DE] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-12 h-12 object-cover rounded-xl border border-[#ECE7DE] shadow-xs bg-white"
              />
              <div>
                <span className="text-xs font-bold text-[#143E2E] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Image attached for Nahj Vision analysis
                </span>
                <span className="text-[11px] text-[#8E877D] block">
                  Ask questions about this manuscript, calligraphy, or book excerpt
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={clearImage}
              className="p-1.5 rounded-full hover:bg-[#ECE7DE] text-[#8E877D] hover:text-[#18231C] transition-colors"
              title="Remove attached image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            {/* Hidden File Input for Image Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Image Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title="Upload manuscript, calligraphy, or book image"
              className="p-3 rounded-full border border-[#ECE7DE] bg-[#FBF9F5] hover:bg-[#EBF3EE] hover:border-[#143E2E]/40 text-[#143E2E] transition-all disabled:opacity-40 shadow-2xs shrink-0"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={
                imagePreview
                  ? "Ask about this image (in English or اردو)..."
                  : "Ask in English or اردو (e.g. خطبہ 193 میں متقین کے اوصاف کیا ہیں؟)..."
              }
              className="flex-1 px-5 py-3 bg-[#FBF9F5] border border-[#ECE7DE] rounded-full text-xs md:text-sm text-[#18231C] placeholder-[#8E877D] focus:outline-none focus:border-[#143E2E]/40 focus:ring-1 focus:ring-[#143E2E]/30 transition-all disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading || (!input.trim() && !selectedImage)}
              className="p-3 rounded-full bg-[#143E2E] hover:bg-[#194B37] text-white font-bold disabled:opacity-40 transition-all shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
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
