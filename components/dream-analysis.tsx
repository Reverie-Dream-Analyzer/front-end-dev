'use client';

import { useMemo, useState, useEffect } from 'react';
import { Calendar, Hash, List, MoonStar, Sparkles, Tag } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { analyzeDream } from '@/lib/api/dream';
import type { Dream } from './dream-entry';

type DreamAnalysisProps = {
  dreams: Dream[];
};

const moodLabels: Record<string, { label: string; emoji: string }> = {
  happy: { label: 'Happy', emoji: '😊' },
  peaceful: { label: 'Peaceful', emoji: '😌' },
  excited: { label: 'Excited', emoji: '🤩' },
  curious: { label: 'Curious', emoji: '🤔' },
  confused: { label: 'Confused', emoji: '😵' },
  anxious: { label: 'Anxious', emoji: '😰' },
  scared: { label: 'Scared', emoji: '😨' },
  sad: { label: 'Sad', emoji: '😢' },
  neutral: { label: 'Neutral', emoji: '😐' },
};

const MAX_RECENT_MONTHS = 6;

export function DreamAnalysis({ dreams }: DreamAnalysisProps) {
  const { token } = useAuth();
  const [gptAnalysis, setGptAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    if (token && dreams.length > 0) {
      setAnalysisLoading(true);
      const firstDream = dreams[0];
      analyzeDream(firstDream.description, token)
        .then(setGptAnalysis)
        .catch((error) => console.warn('Failed to get GPT analysis:', error))
        .finally(() => setAnalysisLoading(false));
    }
  }, [token, dreams]);

  const summary = useMemo(() => {
    if (dreams.length === 0) {
      return null;
    }

    const lucidCount = dreams.filter((dream) => dream.lucidity).length;
    const tagCounts = new Map<string, number>();
    const moodCounts = new Map<string, number>();

    dreams.forEach((dream) => {
      moodCounts.set(dream.mood, (moodCounts.get(dream.mood) ?? 0) + 1);
      dream.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      });
    });

    const frequentTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    const moodBreakdown = Array.from(moodCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: Math.round((count / dreams.length) * 100),
      }));

    const timeline = (() => {
      const months = [];
      const now = new Date();
      for (let offset = MAX_RECENT_MONTHS - 1; offset >= 0; offset -= 1) {
        const current = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const label = current.toLocaleDateString(undefined, { month: 'short' });
        const count = dreams.filter((dream) => {
          const dreamDate = new Date(dream.date);
          return (
            dreamDate.getMonth() === current.getMonth() &&
            dreamDate.getFullYear() === current.getFullYear()
          );
        }).length;
        months.push({ label, count });
      }
      return months;
    })();

    const recentDreams = dreams
      .filter((dream) => {
        const dreamDate = new Date(dream.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return dreamDate >= thirtyDaysAgo;
      })
      .slice(0, 6);

    const insightMessages: string[] = [];

    if (lucidCount > 0) {
      const lucidRate = Math.round((lucidCount / dreams.length) * 100);
      if (lucidRate >= 25) {
        insightMessages.push('High lucid dreaming rate – keep a reality-check routine to maintain it.');
      } else if (lucidRate >= 10) {
        insightMessages.push('Lucid moments are emerging. Reflect on what triggered awareness.');
      } else {
        insightMessages.push('Try journaling immediately after waking to boost lucid frequency.');
      }
    } else {
      insightMessages.push('No lucid dreams recorded yet. Reality checks can help build awareness.');
    }

    if (recentDreams.length >= 5) {
      insightMessages.push('Great recall lately. You captured five or more dreams in the past month.');
    } else if (dreams.length > 5) {
      insightMessages.push('Dream recall has slowed. Consider evening wind-down rituals to improve it.');
    }

    if (moodBreakdown.length > 0) {
      const { mood, percentage } = moodBreakdown[0];
      if (percentage >= 40) {
        const label = moodLabels[mood]?.label ?? mood;
        insightMessages.push(
          `Dreams often feel ${label.toLowerCase()}. Note any waking patterns that match this mood.`
        );
      }
    }

    return {
      total: dreams.length,
      lucidCount,
      lucidRate: dreams.length > 0 ? Math.round((lucidCount / dreams.length) * 100) : 0,
      uniqueTags: tagCounts.size,
      moodBreakdown,
      frequentTags,
      timeline,
      recentDreams,
      latestDream: dreams[0],
      insightMessages,
    };
  }, [dreams]);

  if (!summary) {
    return (
      <div className="rounded-3xl border border-dashed border-indigo-300/40 bg-white/10 p-10 text-center text-indigo-100">
        <p className="text-lg font-medium">No dreams to analyze yet.</p>
        <p className="mt-2 text-sm text-indigo-200/80">
          Record a few dreams to unlock pattern tracking and astrological insights.
        </p>
      </div>
    );
  }

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
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white backdrop-blur">
          <div className="flex items-center gap-2 text-xs uppercase text-indigo-200/80">
            <Calendar className="h-4 w-4" />
            Total Dreams
          </div>
          <div className="mt-2 text-3xl font-semibold">{summary.total}</div>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white backdrop-blur">
          <div className="flex items-center gap-2 text-xs uppercase text-indigo-200/80">
            <MoonStar className="h-4 w-4" />
            Lucid Dreams
          </div>
          <div className="mt-2 text-3xl font-semibold">{summary.lucidCount}</div>
          <p className="text-xs text-indigo-200/80">{summary.lucidRate}% of entries</p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white backdrop-blur">
          <div className="flex items-center gap-2 text-xs uppercase text-indigo-200/80">
            <Tag className="h-4 w-4" />
            Unique Tags
          </div>
          <div className="mt-2 text-3xl font-semibold">{summary.uniqueTags}</div>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white backdrop-blur">
          <div className="flex items-center gap-2 text-xs uppercase text-indigo-200/80">
            <Sparkles className="h-4 w-4" />
            Latest Dream
          </div>
          <div className="mt-2 text-sm font-medium text-white">{summary.latestDream.title}</div>
          <p className="text-xs text-indigo-200/80">{formatDate(summary.latestDream.date)}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
            <List className="h-4 w-4" />
            Mood distribution
          </div>
          <p className="mt-1 text-sm text-indigo-200/80">
            Your most frequent moods and the percentage of dreams they appear in.
          </p>
          <div className="mt-5 space-y-4">
            {summary.moodBreakdown.map(({ mood, count, percentage }) => {
              const moodInfo = moodLabels[mood] ?? { label: mood, emoji: '🌀' };
              return (
                <div key={mood}>
                  <div className="flex justify-between text-sm">
                    <span>
                      {moodInfo.emoji} {moodInfo.label}
                    </span>
                    <span className="text-indigo-200/80">
                      {count} • {percentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-300 to-purple-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
            <Hash className="h-4 w-4" />
            Frequent tags
          </div>
          <p className="mt-1 text-sm text-indigo-200/80">
            Themes and symbols that appear most often across your dream journal.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {summary.frequentTags.length === 0 && (
              <p className="text-sm text-indigo-200/80">
                Add tags to your dreams to see recurring symbols here.
              </p>
            )}
            {summary.frequentTags.map(({ tag, count }) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm text-white"
              >
                #{tag} <span className="text-xs text-indigo-200/80">{count}×</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
            <Calendar className="h-4 w-4" />
            Dream capture rhythm
          </div>
          <p className="mt-1 text-sm text-indigo-200/80">
            How many dreams you captured in the past six months.
          </p>
          <div className="mt-5 grid grid-cols-6 gap-3 text-center text-sm">
            {summary.timeline.map(({ label, count }) => (
              <div key={label}>
                <div className="text-xs text-indigo-200/70">{label}</div>
                <div className="mt-2 rounded-xl border border-white/20 bg-white/10 py-2 font-semibold">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
            <Sparkles className="h-4 w-4" />
            Insight highlights
          </div>
          <p className="mt-1 text-sm text-indigo-200/80">
            Ideas to explore based on your recent recordings.
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {summary.insightMessages.map((message, index) => (
              <li key={`${message}-${index}`} className="flex gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <span className="mt-0.5 text-indigo-200">✦</span>
                <span className="text-indigo-100">{message}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {summary.recentDreams.length > 0 && (
        <section className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
            <Calendar className="h-4 w-4" />
            Recent dream snapshots
          </div>
          <p className="mt-1 text-sm text-indigo-200/80">
            A quick glance at your last {summary.recentDreams.length}{' '}
            {summary.recentDreams.length === 1 ? 'dream' : 'dreams'}.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {summary.recentDreams.map((dream) => (
              <article
                key={dream.id}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{dream.title}</h3>
                  <span className="text-xs text-indigo-200/80">{formatDate(dream.date)}</span>
                </div>
                <p className="mt-2 line-clamp-3 text-indigo-100/80">{dream.analysis || dream.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-100">
                    {moodLabels[dream.mood]?.emoji ?? '🌀'} {moodLabels[dream.mood]?.label ?? dream.mood}
                  </span>
                  {dream.lucidity && (
                    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-100">
                      Lucid
                    </span>
                  )}
                  {dream.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-indigo-100">
                      #{tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
