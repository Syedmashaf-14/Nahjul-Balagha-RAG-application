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
      <div className="py-24 text-center text-[#58635B]">
        <div className="w-8 h-8 rounded-full border-2 border-[#143E2E] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="text-xs font-medium">Loading personalization profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-widest text-[#8E877D] uppercase">
            USER CONFIGURATION
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#18231C] tracking-tight">
            Personal Intelligence Settings
          </h1>
          <p className="text-xs md:text-sm text-[#58635B]">
            Configure language, commentary depth, and learning goals for your Nahj al-Balagha companion.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#ECE7DE] hover:border-[#143E2E]/40 text-xs font-semibold text-[#58635B] hover:text-[#18231C] transition-all self-start sm:self-auto shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Language & Explanation Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ECE7DE] shadow-xs space-y-6">
          <h2 className="text-base font-serif font-bold text-[#18231C] flex items-center gap-2 border-b border-[#ECE7DE] pb-3">
            <Sparkles className="w-4 h-4 text-[#143E2E]" />
            Response & Commentary Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold text-[#58635B] uppercase tracking-wider mb-2">
                Primary Language
              </label>
              <select
                value={prefs.language}
                onChange={(e) =>
                  setPrefs({ ...prefs, language: e.target.value as any })
                }
                className="w-full px-4 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
              >
                <option value="english">English (Default)</option>
                <option value="urdu">Urdu (اردو)</option>
                <option value="arabic">Arabic (العربية)</option>
              </select>
            </div>

            {/* Explanation Level */}
            <div>
              <label className="block text-xs font-bold text-[#58635B] uppercase tracking-wider mb-2">
                Depth of Explanation
              </label>
              <select
                value={prefs.explanationLevel}
                onChange={(e) =>
                  setPrefs({ ...prefs, explanationLevel: e.target.value as any })
                }
                className="w-full px-4 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
              >
                <option value="beginner">Beginner (Clear & accessible)</option>
                <option value="intermediate">Intermediate (Contextual & reasoned)</option>
                <option value="advanced">Advanced (Theological & philosophical)</option>
                <option value="researcher">Researcher (Comparative & textual analysis)</option>
              </select>
            </div>

            {/* Response Length */}
            <div>
              <label className="block text-xs font-bold text-[#58635B] uppercase tracking-wider mb-2">
                Preferred Response Length
              </label>
              <select
                value={prefs.responseLength}
                onChange={(e) =>
                  setPrefs({ ...prefs, responseLength: e.target.value as any })
                }
                className="w-full px-4 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
              >
                <option value="short">Concise & Direct (Essential takeaway)</option>
                <option value="moderate">Moderate (Standard balanced view)</option>
                <option value="detailed">Exhaustive & Detailed (Deep study)</option>
              </select>
            </div>

            {/* Primary Learning Objective */}
            <div>
              <label className="block text-xs font-bold text-[#58635B] uppercase tracking-wider mb-2">
                Learning Objective
              </label>
              <select
                value={prefs.learningObjectives?.[0] || 'general_knowledge'}
                onChange={(e) =>
                  setPrefs({ ...prefs, learningObjectives: [e.target.value as any] })
                }
                className="w-full px-4 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
              >
                <option value="general_knowledge">General Knowledge & Literacy</option>
                <option value="spiritual_development">Spiritual Contemplation (Irfan)</option>
                <option value="leadership">Leadership & Governance</option>
                <option value="academic_research">Academic & Scholarly Research</option>
                <option value="ethics">Ethics & Moral Character</option>
                <option value="character_development">Self-Discipline & Tazkiyah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Topics of Interest Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ECE7DE] shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-serif font-bold text-[#18231C]">
              Areas of Special Interest
            </h2>
            <p className="text-xs text-[#58635B] mt-1">
              Select key domains to personalize your daily wisdom, suggestions, and learning syllabus.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {AVAILABLE_TOPICS.map((topic) => {
              const isSelected = prefs.topicsOfInterest?.includes(topic.id);
              return (
                <button
                  type="button"
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#143E2E] text-white shadow-xs'
                      : 'bg-[#FBF9F5] border border-[#ECE7DE] text-[#58635B] hover:border-[#143E2E]/30'
                  }`}
                >
                  {topic.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {success ? (
            <span className="text-xs font-semibold text-[#143E2E] flex items-center gap-1.5 bg-[#EBF3EE] px-4 py-2 rounded-full">
              <Check className="w-4 h-4" />
              Preferences saved successfully!
            </span>
          ) : (
            <span className="text-xs text-[#8E877D]">
              Preferences are synchronized with your profile.
            </span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-[#143E2E] hover:bg-[#194B37] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
