'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useDreams } from '@/components/dreams-provider';
import { getTrendSummary, getTrendTimeline, getDreamStreaks, getTagFrequencies, getMonthlyActivity } from '@/lib/api/dreamTrend';
import { CelestialBackground } from '@/components/celestial-background';
import { DreamAnalysis } from '@/components/dream-analysis';
import { AstrologicalInsights } from '@/components/astro-insights';
import { ArrowLeft } from 'lucide-react';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({ weight: ['400', '700'], subsets: ['latin'] });

export default function InsightsPage() {
  const router = useRouter();
  const { isAuthenticated, user, token } = useAuth();
  const { dreams, isLoaded } = useDreams();
  const [trends, setTrends] = useState<any>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/signin');
    } else if (user && !user.hasProfile) {
      router.replace('/auth/profile-setup');
    }
  }, [isAuthenticated, router, user]);

  useEffect(() => {
    if (token) {
      setTrendsLoading(true);
      Promise.all([
        getTrendSummary(token),
        getTrendTimeline(token),
        getDreamStreaks(token),
        getTagFrequencies(token),
        getMonthlyActivity(token),
      ])
        .then(([summary, timeline, streaks, tags, monthly]) => {
          setTrends({ summary, timeline, streaks, tags, monthly });
        })
        .catch((error) => console.warn('Failed to fetch trends:', error))
        .finally(() => setTrendsLoading(false));
    }
  }, [token]);

  if (!isAuthenticated || !user?.hasProfile || !isLoaded || !user.profile) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-indigo-100 via-white to-white dark:from-slate-950 dark:via-indigo-950 dark:to-black">
      <CelestialBackground />
      <main className="relative z-10 py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-6 rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-white/30 bg-white/20 px-3 py-1 text-xs font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:border-indigo-400 dark:hover:text-indigo-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to dashboard
            </button>
            <div>
              <p className="text-sm uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
                Patterns & insights
              </p>
              <h1 className={`${cormorant.className} mt-2 text-4xl font-semibold text-slate-900 dark:text-white`}>
                Dive deeper into your dreams!
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Explore detailed dream trends and discover how your zodiac profile influences your nightly adventures.
              </p>
            </div>
          </header>

          <section className="space-y-8">
            <DreamAnalysis dreams={dreams} />
          </section>

          <section className="space-y-8 rounded-3xl border border-white/40 bg-white/85 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
            <AstrologicalInsights profile={user.profile} />
          </section>
        </div>
      </main>
    </div>
  );
}
