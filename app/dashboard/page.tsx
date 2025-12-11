'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useDreams } from '@/components/dreams-provider';
import { getUserDreamStats } from '@/lib/api/user';
import { CelestialBackground } from '@/components/celestial-background';
import { DreamEntry, type Dream } from '@/components/dream-entry';
import { Cormorant_Garamond } from 'next/font/google';
import type { LucideIcon } from 'lucide-react';
import {
  AlarmClock,
  BarChart3,
  History,
  List,
  MoonStar,
  Plus,
  Sparkles,
  Tag,
  User,
  Zap,
} from 'lucide-react';
import { ProfileModal } from '@/components/profile-modal';

const cormorant = Cormorant_Garamond({ weight: ['400', '700'], subsets: ['latin'] });

const moodLabels: Record<string, string> = {
  happy: 'Happy',
  peaceful: 'Peaceful',
  excited: 'Excited',
  curious: 'Curious',
  confused: 'Confused',
  anxious: 'Anxious',
  scared: 'Scared',
  sad: 'Sad',
  neutral: 'Neutral',
};

type FeatureCard = {
  id: 'record' | 'history' | 'analysis' | 'alarms';
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  accent: string;
  highlight: string;
  highlightIcon: LucideIcon;
};

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { dreams, addDream, isLoaded } = useDreams();
  const [isRecording, setIsRecording] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [backendStats, setBackendStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(isLoggingOut ? '/' : '/auth/signin');
    } else if (user && !user.hasProfile) {
      router.replace('/auth/profile-setup');
    }
  }, [isAuthenticated, isLoggingOut, router, user]);

  useEffect(() => {
    if (user && user.id) {
      setStatsLoading(true);
      getUserDreamStats(user.id)
        .then(setBackendStats)
        .catch((error) => console.warn('Failed to fetch backend stats:', error))
        .finally(() => setStatsLoading(false));
    }
  }, [user]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
  };

  const handleAddDream = (dream: Dream) => {
    addDream(dream);
    setIsRecording(false);
  };

  const metrics = useMemo(() => {
    if (dreams.length === 0) {
      return {
        total: 0,
        lucidCount: 0,
        lucidityRate: 0,
        uniqueTags: 0,
        recentMood: '—',
        topMood: null as string | null,
        topMoodCount: 0,
        topTag: null as string | null,
        topTagCount: 0,
      };
    }

    const moodCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();
    let lucidCount = 0;

    dreams.forEach((dream) => {
      if (dream.lucidity) {
        lucidCount += 1;
      }

      moodCounts.set(dream.mood, (moodCounts.get(dream.mood) ?? 0) + 1);
      dream.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      });
    });

    let topMood: string | null = null;
    let topMoodCount = 0;
    moodCounts.forEach((count, mood) => {
      if (count > topMoodCount) {
        topMood = mood;
        topMoodCount = count;
      }
    });

    let topTag: string | null = null;
    let topTagCount = 0;
    tagCounts.forEach((count, tag) => {
      if (count > topTagCount) {
        topTag = tag;
        topTagCount = count;
      }
    });

    const lucidityRate = Math.round((lucidCount / dreams.length) * 100);
    const recentMood = moodLabels[dreams[0].mood] ?? dreams[0].mood;

    return {
      total: dreams.length,
      lucidCount,
      lucidityRate,
      uniqueTags: tagCounts.size,
      recentMood,
      topMood,
      topMoodCount,
      topTag,
      topTagCount,
    };
  }, [dreams]);

  const quickStats = useMemo(
    () => [
      { label: 'Total Dreams', value: metrics.total.toString() },
      { label: 'Lucid Dreams', value: metrics.lucidCount.toString() },
      { label: 'Lucidity Rate', value: `${metrics.total > 0 ? metrics.lucidityRate : 0}%` },
      { label: 'Unique Tags', value: metrics.uniqueTags.toString() },
    ],
    [metrics]
  );

  const analysisCards = useMemo(() => {
    if (dreams.length === 0) {
      return [
        {
          label: 'Latest Dream',
          value: 'No dreams yet',
          helper: 'Start by recording your first dream.',
          icon: Sparkles,
        },
        {
          label: 'Most Common Mood',
          value: '—',
          helper: 'Log more dreams to surface trends.',
          icon: List,
        },
        {
          label: 'Lucid Frequency',
          value: '0%',
          helper: 'Lucid dreams recorded: 0',
          icon: MoonStar,
        },
        {
          label: 'Top Tag',
          value: '—',
          helper: 'Add tags to organize your dreams.',
          icon: Tag,
        },
      ];
    }

    const formatDate = (value: string) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const mostRecent = dreams[0];

    return [
      {
        label: 'Latest Dream',
        value: mostRecent.title,
        helper: formatDate(mostRecent.date),
        icon: Sparkles,
      },
      {
        label: 'Most Common Mood',
        value:
          metrics.topMood !== null ? moodLabels[metrics.topMood] ?? metrics.topMood : '—',
        helper:
          metrics.topMood !== null
            ? `${metrics.topMoodCount} entr${metrics.topMoodCount === 1 ? 'y' : 'ies'}`
            : 'Keep recording to surface trends.',
        icon: List,
      },
      {
        label: 'Lucid Frequency',
        value: `${metrics.lucidityRate}%`,
        helper: `${metrics.lucidCount} of ${metrics.total} dreams`,
        icon: MoonStar,
      },
      {
        label: 'Top Tag',
        value: metrics.topTag ? `#${metrics.topTag}` : '—',
        helper:
          metrics.topTag !== null
            ? `${metrics.topTagCount} mention${metrics.topTagCount === 1 ? '' : 's'}`
            : 'Add tags to organize your dreams.',
        icon: Tag,
      },
    ];
  }, [dreams, metrics]);

  const featureCards: FeatureCard[] = [
    {
      id: 'record',
      title: isRecording ? 'Close Dream Form' : 'Dream Entry',
      description:
        'Capture your latest dream with mood, tags, and the details you want to remember.',
      icon: Plus,
      highlight: isRecording ? 'Form visible' : 'Quick capture',
      highlightIcon: Zap,
      gradient: 'from-purple-500/20 via-indigo-500/20 to-blue-500/20',
      accent: 'bg-purple-500/30 text-purple-100 dark:text-purple-100',
    },
    {
      id: 'history',
      title: 'Dream Library & AI Insights',
      description: `Browse your ${metrics.total} recorded dreams, search by tags, and revisit favorites.`,
      icon: History,
      highlight: `${metrics.total} saved`,
      highlightIcon: List,
      gradient: 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
      accent: 'bg-blue-500/30 text-blue-100 dark:text-blue-100',
    },
    {
      id: 'analysis',
      title: 'Patterns & Insights',
      description: 'Track moods, lucidity, and tags to reveal trends in your subconscious.',
      icon: BarChart3,
      highlight: `${metrics.total > 0 ? metrics.lucidityRate : 0}% lucid rate`,
      highlightIcon: BarChart3,
      gradient: 'from-green-500/20 via-emerald-500/20 to-teal-500/20',
      accent: 'bg-green-500/30 text-green-100 dark:text-green-100',
    },
    {
      id: 'alarms',
      title: 'Alarm Clock',
      description: 'Coming Soon! Stay tuned for updates!',
      icon: AlarmClock,
      highlight: 'Manage alarms',
      highlightIcon: AlarmClock,
      gradient: 'from-pink-500/20 via-violet-500/20 to-purple-500/20',
      accent: 'bg-pink-500/30 text-pink-100 dark:text-pink-100',
    },
  ];

  const handleFeatureCardClick = (cardId: FeatureCard['id']) => {
    switch (cardId) {
      case 'record':
        setIsRecording((prev) => !prev);
        break;
      case 'history':
        router.push('/dashboard/dreams');
        break;
      case 'analysis':
        router.push('/dashboard/insights');
        break;
      case 'alarms':
        router.push('/dashboard/alarms');
        break;
      default:
        break;
    }
  };

  if (!isAuthenticated || !user?.hasProfile || !isLoaded) {
    return null;
  }

  const displayName = user.profile?.name?.trim() || user.email || 'dreamer';
  const capitalizedDisplayName =
    displayName.length > 0 ? displayName.charAt(0).toUpperCase() + displayName.slice(1) : displayName;

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-indigo-100 via-white to-white dark:from-slate-950 dark:via-indigo-950 dark:to-black">
      <CelestialBackground />
      <main className="relative z-10 py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-white/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
                  Dream dashboard
                </p>
                <h1 className={`${cormorant.className} mt-1 text-4xl font-semibold text-slate-900 dark:text-white`}>
                  Welcome to your dream journal, {capitalizedDisplayName}!
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Track and analyze your dreams, then uncover fun conclusions from your subconscious.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:text-purple-600 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:border-purple-400 dark:hover:text-purple-200"
                >
                  <User className="h-4 w-4" />
                  Your Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:border-indigo-400 dark:hover:text-indigo-200"
                >
                  Sign out
                </button>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleFeatureCardClick(card.id)}
                  className={`group relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br ${card.gradient} p-6 text-left shadow-xl transition hover:-translate-y-1 hover:border-white/60 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-white/10 dark:bg-white/5`}
                >
                  <div className="relative flex h-full flex-col gap-4">
                    <span
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-medium ${card.accent}`}
                    >
                      <card.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-200">
                        {card.id === 'history' ? (
                          <>Dream Library & <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent font-bold drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] [text-shadow:0_0_20px_rgba(192,132,252,0.9)]">✨ AI Insights</span></>
                        ) : (
                          card.title
                        )}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
                    </div>
                    <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition group-hover:gap-3 dark:text-indigo-200">
                      <card.highlightIcon className="h-4 w-4" />
                      <span>{card.highlight}</span>
                    </div>
                  </div>
                  <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/10" />
                </button>
              ))}
            </div>

            {isRecording && (
              <div className="rounded-3xl border border-indigo-100 bg-white/90 p-6 shadow-xl backdrop-blur-sm dark:border-indigo-500/20 dark:bg-slate-900/80">
                <DreamEntry onAddDream={handleAddDream} onCancel={() => setIsRecording(false)} />
              </div>
            )}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
                Dream library
              </p>
              <h2 className={`${cormorant.className} mt-1 text-3xl font-semibold text-slate-900 dark:text-white`}>
                Recent Dreams
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Dive back into the stories you have captured. Tap a dream to revisit the feelings, symbols, and insights you noted.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {dreams.slice(0, 6).map((dream) => (
                <article
                  key={dream.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/90 p-6 shadow-xl transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-2xl dark:border-white/10 dark:bg-slate-900/70"
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/10" />
                  <div className="relative flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{dream.title}</h3>
                        <time className="mt-1 block text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          {formatDate(dream.date)}
                        </time>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                        {moodLabels[dream.mood] ?? dream.mood}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                      {dream.analysis || dream.description}
                    </p>
                    {dream.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {dream.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600 transition group-hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-100"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {dream.lucidity && (
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-300">
                        ✨ Lucid moment
                      </span>
                    )}
                  </div>
                </article>
              ))}
              {dreams.length === 0 && (
                <div className="rounded-3xl border border-dashed border-indigo-200/60 bg-white/60 p-6 text-sm text-slate-500 dark:border-indigo-500/30 dark:bg-white/5 dark:text-slate-300">
                  No dreams recorded yet. Capture your first dream to see it appear here.
                </div>
              )}
            </div>
            {dreams.length > 6 && (
              <button
                type="button"
                onClick={() => router.push('/dashboard/dreams')}
                className="self-start text-sm font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-100"
              >
                View entire dream bank →
              </button>
            )}
          </section>

          <section className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
                Dream patterns
              </p>
              <h2 className={`${cormorant.className} mt-1 text-3xl font-semibold text-slate-900 dark:text-white`}>
                Insights
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                See the high-level trends from your dream journal to help guide your next lucid adventure.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {analysisCards.map((stat) => (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/85 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70"
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 transition-opacity hover:opacity-100 dark:from-white/10" />
                  <div className="relative flex flex-col gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-200">
                      <stat.icon className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="text-xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{stat.helper}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/insights')}
              className="self-start text-sm font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-100"
            >
              View detailed patterns & astro insights →
            </button>
          </section>
        </div>
      </main>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
