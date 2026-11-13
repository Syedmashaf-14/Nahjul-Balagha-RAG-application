'use client';

import { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Folder, X } from 'lucide-react';
import { ICollection } from '@/types/api.types';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<ICollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchCollections = () => {
    setLoading(true);
    fetch('/api/collections')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setCollections(json.data);
        }
      })
      .catch((err) => console.error('Fetch collections error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCollections((prev) => [...prev, json.data]);
        setName('');
        setDescription('');
        setIsCreating(false);
      }
    } catch (err) {
      console.error('Create collection error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/collections/${id}`, { method: 'DELETE' });
      setCollections((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error('Delete collection error:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-widest text-[#8E877D] uppercase">
            ORGANIZED FOLDERS
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#18231C] tracking-tight">
            Topic Collections
          </h1>
          <p className="text-xs md:text-sm text-[#58635B]">
            Group related sermons, letters, aphorisms, and personal notes into focused topical binders.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#143E2E] hover:bg-[#194B37] text-white font-bold text-xs shadow-xs transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-[#58635B]">
          <div className="w-8 h-8 rounded-full border-2 border-[#143E2E] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium">Loading collections...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#ECE7DE] p-8 shadow-xs max-w-md mx-auto">
          <Folder className="w-10 h-10 text-[#8E877D] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#18231C]">No Collections Created Yet</h3>
          <p className="text-xs text-[#58635B] mt-1">
            Group passages by theme like &ldquo;Islamic Economics&rdquo;, &ldquo;Spiritual Discourses&rdquo;, or &ldquo;Public Administration&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-[#ECE7DE] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EBF3EE] text-[#143E2E] flex items-center justify-center">
                    <Folder className="w-4 h-4" />
                  </div>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-1 text-[#8E877D] hover:text-red-500 transition-colors"
                    title="Delete collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-serif font-bold text-[#18231C] mt-4 group-hover:text-[#143E2E] transition-colors">
                  {c.name}
                </h3>

                <p className="text-xs text-[#58635B] leading-relaxed mt-1.5">
                  {c.description || 'Curated compilation of passages and notes.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#ECE7DE] flex items-center justify-between text-xs text-[#8E877D]">
                <span>{(c.bookmarkCount || 0) + (c.noteCount || 0)} items organized</span>
                <span className="font-semibold text-[#143E2E] group-hover:underline">Open →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Collection Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-[#18231C]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl border border-[#ECE7DE] p-6 md:p-8 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3">
              <h3 className="text-lg font-serif font-bold text-[#18231C]">Create Collection</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-[#8E877D] hover:text-[#18231C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#58635B] uppercase mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Principles of Ethical Governance"
                  className="w-full px-4 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#58635B] uppercase mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A curated collection of letters and sermons outlining public integrity..."
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
                  className="px-5 py-2 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white text-xs font-bold shadow-xs"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
