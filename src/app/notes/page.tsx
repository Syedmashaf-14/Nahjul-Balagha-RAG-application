'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Search, X } from 'lucide-react';
import { INote } from '@/types/api.types';

export default function NotesPage() {
  const [notes, setNotes] = useState<INote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // New Note Modal / Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('Justice, Leadership');
  const [saving, setSaving] = useState(false);

  const fetchNotes = (query?: string) => {
    setLoading(true);
    const url = query ? `/api/notes?q=${encodeURIComponent(query)}` : '/api/notes';
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setNotes(json.data.notes || []);
        }
      })
      .catch((err) => console.error('Fetch notes error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotes(search);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSaving(true);
    try {
      const tags = newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          tags,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setNotes((prev) => [json.data, ...prev]);
        setIsCreating(false);
        setNewTitle('');
        setNewContent('');
      }
    } catch (err) {
      console.error('Create note error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Delete note error:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-widest text-[#8E877D] uppercase">
            PERSONAL REFLECTIONS
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#18231C] tracking-tight">
            Notes & Reflections
          </h1>
          <p className="text-xs md:text-sm text-[#58635B]">
            Capture personal insights, scholarly annotations, and contemplation on Nahj al-Balagha.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#143E2E] hover:bg-[#194B37] text-white font-bold text-xs shadow-xs transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E877D]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search within your personal notes..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ECE7DE] rounded-full text-xs md:text-sm text-[#18231C] placeholder-[#8E877D] shadow-xs focus:outline-none focus:border-[#143E2E]/40 focus:ring-1 focus:ring-[#143E2E]/30 transition-all"
        />
      </form>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-24 text-center text-[#58635B]">
          <div className="w-8 h-8 rounded-full border-2 border-[#143E2E] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium">Loading personal reflections...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#ECE7DE] p-8 shadow-xs max-w-md mx-auto">
          <FileText className="w-10 h-10 text-[#8E877D] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#18231C]">No Notes Created Yet</h3>
          <p className="text-xs text-[#58635B] mt-1">
            Click &ldquo;New Note&rdquo; above to record your reflections on sermons and teachings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white rounded-2xl border border-[#ECE7DE] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-2.5">
                  <span className="text-[10px] font-bold text-[#8E877D] uppercase tracking-wider">
                    {new Date(note.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="p-1 text-[#8E877D] hover:text-red-500 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-serif font-bold text-[#18231C] mt-3 group-hover:text-[#143E2E] transition-colors">
                  {note.title}
                </h3>

                <p className="text-xs text-[#58635B] leading-relaxed mt-2 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-[#ECE7DE]">
                  {note.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EBF3EE] text-[#143E2E] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Note Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-[#18231C]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-[#ECE7DE] p-6 md:p-8 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3">
              <h3 className="text-lg font-serif font-bold text-[#18231C]">Create New Reflection</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-[#8E877D] hover:text-[#18231C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#58635B] uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Reflections on Letter 53 and Moral Governance"
                  className="w-full px-4 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#58635B] uppercase mb-1">
                  Your Reflection
                </label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your insights, personal applications, or cross-references..."
                  className="w-full px-4 py-3 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#58635B] uppercase mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Justice, Leadership, Letter 53"
                  className="w-full px-4 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ECE7DE]">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#58635B] hover:text-[#18231C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
