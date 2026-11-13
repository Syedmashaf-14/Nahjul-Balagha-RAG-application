'use client';

import { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Folder, Bookmark, FileText } from 'lucide-react';
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
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-emerald-400" />
            Topic Collections
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Group related sermons, letters, aphorisms, and personal notes into focused topical folders.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {isCreating && (
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30">
          <form onSubmit={handleCreate} className="space-y-3">
            <h3 className="text-sm font-bold text-white">Create Collection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Collection Name (e.g. Governance & Leadership Treatises)"
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (e.g. Focus on Letter 53 and Malik al-Ashtar)"
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <p className="text-xs">Loading collections...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 p-8">
          <Folder className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Collections Created</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create topic folders to organize your favorite passages and reflections together.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map((c) => (
            <div
              key={c._id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Folder className="w-4 h-4" />
                </div>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{c.name}</h3>
                {c.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-emerald-400" />
                  {c.bookmarkCount} Bookmarks
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-amber-400" />
                  {c.noteCount} Notes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
