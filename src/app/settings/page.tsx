'use client';

import { useState, useEffect } from 'react';
import { Sliders, Save, RotateCcw, Check, Sparkles } from 'lucide-react';
import { UserPreferences } from '@/types/user.types';

const AVAILABLE_TOPICS = [
  { id: 'justice', name: 'Justice & Fair Governance' },
  { id: 'governance', name: 'Leadership & Rule of Law' },
  { id: 'patience', name: 'Patience & Perseverance (Sabr)' },
  { id: 'knowledge', name: 'Knowledge & True Intellectuals' },
  { id: 'piety', name: 'Piety (Taqwa) & God-Consciousness' },
  { id: 'human_rights', name: 'Human Dignity & Equality' },
  { id: 'worldly_detachment', name: 'Asceticism & Detachment (Zuhd)' },
  { id: 'death_afterlife', name: 'The Hereafter & Transcendence' },
  { id: 'prayer_worship', name: 'Prayer & Inner Contemplation' },
  { id: 'ethics_morality', name: 'Moral Philosophy & Ethics' },
  { id: 'wisdom', name: 'Wisdom & Rhetoric' },
];

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/users/me/preferences')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setPrefs(json.data);
        }
      })
      .catch((err) => console.error('Fetch prefs error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefs) return;
    setSaving(true);
    try {
      const res = await fetch('/api/users/me/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Save preferences error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch('/api/users/me/preferences', { method: 'DELETE' });
      const json = await res.json();
      if (json.success && json.data) {
        setPrefs(json.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const toggleTopic = (topicId: string) => {
    if (!prefs) return;
    const current = prefs.topicsOfInterest || [];
    const updated = current.includes(topicId)
      ? current.filter((t) => t !== topicId)
      : [...current, topicId];
    setPrefs({ ...prefs, topicsOfInterest: updated });
  };

  if (loading || !prefs) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-xs">Loading personalization profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Sliders className="w-7 h-7 text-emerald-400" />
          Personalization & AI Directives
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Customize how the AI companion explains Nahj al-Balagha, adapts to your vocabulary, and formats responses.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Language & Tone Card */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-5">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Language & Delivery Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preferred Language */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Preferred Language
              </label>
              <select
                value={prefs.language}
                onChange={(e) => setPrefs({ ...prefs, language: e.target.value as any })}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
              >
                <option value="english">English (Articulate & Philosophical)</option>
                <option value="urdu">اردو (Urdu Literary & Dignified)</option>
                <option value="arabic">العربية (Classical Arabic Fusha)</option>
                <option value="roman_urdu">Roman Urdu (Urdu in Latin Script)</option>
              </select>
            </div>

            {/* Explanation Level */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Explanation Depth
              </label>
              <select
                value={prefs.explanationLevel}
                onChange={(e) =>
                  setPrefs({ ...prefs, explanationLevel: e.target.value as any })
                }
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
              >
                <option value="beginner">Beginner (Clear analogies, simplified concepts)</option>
                <option value="intermediate">Intermediate (Balanced historical & moral context)</option>
                <option value="advanced">Advanced (Deep rhetorical & ethical analysis)</option>
                <option value="researcher">Researcher (Scholarly, textual cross-examination)</option>
              </select>
            </div>

            {/* Response Length */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Target Response Length
              </label>
              <select
                value={prefs.responseLength}
                onChange={(e) =>
                  setPrefs({ ...prefs, responseLength: e.target.value as any })
                }
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
              >
                <option value="short">Short & Concise (Key points only)</option>
                <option value="moderate">Moderate (Standard 3-4 paragraphs)</option>
                <option value="detailed">Detailed (Comprehensive exploration)</option>
              </select>
            </div>

            {/* Explanation Style */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Explanation Style
              </label>
              <select
                value={prefs.explanationStyle}
                onChange={(e) =>
                  setPrefs({ ...prefs, explanationStyle: e.target.value as any })
                }
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
              >
                <option value="reflective">Reflective (Introspective & spiritually inspiring)</option>
                <option value="analytical">Analytical (Structured, logical, and thematic)</option>
                <option value="simplified">Simplified (Accessible & direct)</option>
                <option value="scholarly">Scholarly (Academic, citing historical transmissions)</option>
              </select>
            </div>
          </div>

          {/* Toggle show Arabic */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Always Display Original Arabic Text</p>
              <p className="text-[11px] text-slate-400">
                Presents the sacred Arabic parallel text alongside all AI explanations.
              </p>
            </div>
            <input
              type="checkbox"
              checked={prefs.accessibility?.showArabicText ?? true}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  accessibility: {
                    ...prefs.accessibility,
                    showArabicText: e.target.checked,
                  },
                })
              }
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Topics of Interest */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
            Topics of Active Interest
          </h2>
          <p className="text-xs text-slate-300">
            Select the themes that matter most to your studies. The RAG system will prioritize these
            connections when answering questions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {AVAILABLE_TOPICS.map((topic) => {
              const isSelected = prefs.topicsOfInterest?.includes(topic.id);
              return (
                <div
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{topic.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            {success && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Preferences Updated!
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
