'use client';

import { useMemo, useState } from 'react';
import { Dream } from './dream-entry';
import { Pencil, Search, Trash2 } from 'lucide-react';

type DreamListProps = {
  dreams: Dream[];
  onDeleteDream: (id: string) => void;
  onEditDream: (id: string, updates: Partial<Dream>) => void;
};

const moodOptions = [
  { value: 'all', label: 'All moods' },
  { value: 'happy', label: 'Happy' },
  { value: 'peaceful', label: 'Peaceful' },
  { value: 'excited', label: 'Excited' },
  { value: 'curious', label: 'Curious' },
  { value: 'confused', label: 'Confused' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'scared', label: 'Scared' },
  { value: 'sad', label: 'Sad' },
  { value: 'neutral', label: 'Neutral' },
];

const moodEmoji: Record<string, string> = {
  happy: '😊',
  peaceful: '😌',
  excited: '🤩',
  curious: '🤔',
  confused: '😵',
  anxious: '😰',
  scared: '😨',
  sad: '😢',
  neutral: '😐',
};

export function DreamList({ dreams, onDeleteDream, onEditDream }: DreamListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [lucidOnly, setLucidOnly] = useState(false);
  const [editingDream, setEditingDream] = useState<Dream | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    mood: 'neutral',
    tags: '',
    lucidity: false,
  });

  const filteredDreams = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return dreams
      .filter((dream) => {
        if (lucidOnly && !dream.lucidity) {
          return false;
        }
        if (selectedMood !== 'all' && dream.mood !== selectedMood) {
          return false;
        }
        if (!normalizedSearch) {
          return true;
        }
        return (
          dream.title.toLowerCase().includes(normalizedSearch) ||
          dream.description.toLowerCase().includes(normalizedSearch) ||
          dream.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
        );
      })
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [dreams, lucidOnly, searchTerm, selectedMood]);

  const beginEditing = (dream: Dream) => {
    setEditingDream(dream);
    setEditForm({
      title: dream.title,
      description: dream.description,
      mood: dream.mood,
      tags: dream.tags.join(', '),
      lucidity: dream.lucidity,
    });
  };

  const saveEdits = () => {
    if (!editingDream) {
      return;
    }

    const updatedTags = editForm.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    onEditDream(editingDream.id, {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      analysis: editForm.description.trim(),
      mood: editForm.mood,
      tags: updatedTags,
      lucidity: editForm.lucidity,
    });
    setEditingDream(null);
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-md">
          <label className="flex items-center gap-2 text-sm text-indigo-200/80">
            <Search className="h-4 w-4" />
            Search dream bank
          </label>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by keyword, tag, or description..."
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/15 px-4 py-2 text-sm text-white placeholder:text-indigo-200/60 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300/40"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="text-sm text-indigo-200/80">
            Mood
            <select
              value={selectedMood}
              onChange={(event) => setSelectedMood(event.target.value)}
              className="mt-2 rounded-xl border border-white/15 bg-white/15 px-3 py-2 text-sm text-white focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300/40"
            >
              {moodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-indigo-200/80">
            <input
              type="checkbox"
              checked={lucidOnly}
              onChange={(event) => setLucidOnly(event.target.checked)}
              className="h-4 w-4 rounded border border-white/20 bg-white/15 text-indigo-400 focus:ring-indigo-300"
            />
            Lucid only
          </label>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredDreams.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-10 text-center text-sm text-indigo-200/80">
            No dreams match your filters. Adjust your search or add new entries.
          </div>
        )}

        {filteredDreams.map((dream) => (
          <article
            key={dream.id}
            className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur transition hover:border-white/30"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{dream.title}</h2>
                <time className="text-xs uppercase tracking-wide text-indigo-200/70">
                  {formatDate(dream.date)}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-100">
                  {moodEmoji[dream.mood] ?? '🌀'} {dream.mood}
                </span>
                {dream.lucidity && (
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-100">
                    Lucid
                  </span>
                )}
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-indigo-100/90">{dream.description}</p>

            {dream.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {dream.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-indigo-200/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => beginEditing(dream)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:border-white/30 hover:bg-white/20"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit dream
              </button>
              <button
                type="button"
                onClick={() => onDeleteDream(dream.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:border-red-400/60 hover:bg-red-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {editingDream && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl border border-white/20 bg-slate-900/90 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Edit dream</h3>
              <button
                type="button"
                onClick={() => setEditingDream(null)}
                className="text-sm text-indigo-200 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block text-sm">
                Title
                <input
                  value={editForm.title}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300/40"
                />
              </label>
              <label className="block text-sm">
                Description
                <textarea
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300/40"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm">
                  Mood
                  <select
                    value={editForm.mood}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, mood: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300/40"
                  >
                    {moodOptions
                      .filter((option) => option.value !== 'all')
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="block text-sm">
                  Tags (comma separated)
                  <input
                    value={editForm.tags}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, tags: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300/40"
                    placeholder="flying, ocean, lucid"
                  />
                </label>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-indigo-200/80">
                <input
                  type="checkbox"
                  checked={editForm.lucidity}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, lucidity: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border border-white/20 bg-white/10 text-indigo-400 focus:ring-indigo-300"
                />
                This was a lucid dream
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingDream(null)}
                className="rounded-xl border border-white/15 bg-transparent px-4 py-2 text-sm text-indigo-200 hover:border-white/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdits}
                className="rounded-xl border border-indigo-300/40 bg-indigo-500/40 px-4 py-2 text-sm font-medium text-white hover:border-indigo-200/60"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
