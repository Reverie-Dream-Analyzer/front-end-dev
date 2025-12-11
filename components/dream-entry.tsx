'use client';

import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const MOOD_OPTIONS = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'peaceful', label: 'Peaceful', emoji: '😌' },
  { value: 'excited', label: 'Excited', emoji: '🤩' },
  { value: 'curious', label: 'Curious', emoji: '🤔' },
  { value: 'confused', label: 'Confused', emoji: '😵' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'scared', label: 'Scared', emoji: '😨' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
];

export type Dream = {
  id: string;
  title: string;
  description: string;
  date: string;
  mood: string;
  tags: string[];
  lucidity: boolean;
  analysis: string;
};

type DreamEntryProps = {
  onAddDream: (dream: Dream) => void;
  onCancel?: () => void;
};

const emptyFormState = {
  title: '',
  description: '',
  mood: '',
  tagInput: '',
  tags: [] as string[],
  lucidity: false,
};

export function DreamEntry({ onAddDream, onCancel }: DreamEntryProps) {
  const [form, setForm] = useState(emptyFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moodLabel = useMemo(
    () => MOOD_OPTIONS.find((option) => option.value === form.mood)?.label ?? 'Select mood',
    [form.mood]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Prevent double submissions
    if (isSubmitting) return;

    if (!form.title.trim() || !form.description.trim() || !form.mood) {
      setError('Please provide a title, description, and overall mood.');
      return;
    }

    setIsSubmitting(true);

    const newDream: Dream = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString(),
      title: form.title.trim(),
      description: form.description.trim(),
      date: new Date().toISOString(),
      mood: form.mood,
      tags: form.tags,
      lucidity: form.lucidity,
      analysis: form.description.trim(),
    };

    onAddDream(newDream);
    setForm(emptyFormState);
    setIsSubmitting(false);
  };

  const addTag = () => {
    const nextTag = form.tagInput.trim();
    if (!nextTag || form.tags.includes(nextTag)) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, nextTag],
      tagInput: '',
    }));
  };

  const removeTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <motion.section
      className="rounded-2xl border border-indigo-200/40 bg-white/70 p-6 shadow-lg backdrop-blur dark:border-indigo-900/50 dark:bg-slate-900/70"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Record a New Dream</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Capture the details while they are still fresh. You can add mood, lucidity, and helpful tags.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Close
          </button>
        )}
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="dream-title" className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Dream title<span className="text-rose-500">*</span>
          </label>
          <input
            id="dream-title"
            name="dream-title"
            type="text"
            autoComplete="off"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Give your dream a memorable title..."
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="dream-description" className="text-sm font-medium text-slate-800 dark:text-slate-200">
            What happened?<span className="text-rose-500">*</span>
          </label>
          <textarea
            id="dream-description"
            name="dream-description"
            rows={5}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Describe the people, places, feelings, and key moments you remember..."
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <label htmlFor="dream-mood" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Overall mood<span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="dream-mood"
                name="dream-mood"
                value={form.mood}
                onChange={(event) => setForm((prev) => ({ ...prev, mood: event.target.value }))}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
                required
              >
                <option value="" disabled>
                  Select mood
                </option>
                {MOOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.emoji} {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">▾</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mood recorded as: {moodLabel}</p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Lucid dream?</span>
            <label className="flex items-center gap-3 rounded-lg border border-transparent bg-indigo-50 px-4 py-2 text-sm text-indigo-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/20">
              <input
                type="checkbox"
                checked={form.lucidity}
                onChange={(event) => setForm((prev) => ({ ...prev, lucidity: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:checked:bg-indigo-500 dark:focus:ring-indigo-400"
              />
              <span>{form.lucidity ? 'Yes, I knew I was dreaming!' : 'No, it felt like real life.'}</span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="dream-tags" className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Tags
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="dream-tags"
              name="dream-tags"
              type="text"
              value={form.tagInput}
              onChange={(event) => setForm((prev) => ({ ...prev, tagInput: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add themes like flying, water, family..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
            />
            <button
              type="button"
              onClick={addTag}
              className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:bg-indigo-500/20"
            >
              Add tag
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full bg-indigo-200/70 px-1 text-xs text-indigo-700 transition hover:bg-indigo-300 dark:bg-indigo-500/30 dark:text-indigo-100 dark:hover:bg-indigo-500/50"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm font-medium text-rose-500" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save dream entry'}
          </button>
        </div>
      </form>
    </motion.section>
  );
}
