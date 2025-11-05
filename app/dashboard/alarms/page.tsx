'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { CelestialBackground } from '@/components/celestial-background';
import { AlarmSettings } from '@/components/alarm-settings';
import { ArrowLeft } from 'lucide-react';

export default function AlarmSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/signin');
    } else if (user && !user.hasProfile) {
      router.replace('/auth/profile-setup');
    }
  }, [isAuthenticated, router, user]);

  if (!isAuthenticated || !user?.hasProfile) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-indigo-100 via-white to-white dark:from-slate-950 dark:via-indigo-950 dark:to-black">
      <CelestialBackground />
      <main className="relative z-10 py-12">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
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
                Morning rituals
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                Configure your dream-friendly alarms
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Create gentle wake-up reminders that support journaling right after you open your eyes.
              </p>
            </div>
          </header>

          <section className="rounded-3xl border border-white/40 bg-white/85 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
            <AlarmSettings userEmail={user.email} />
          </section>
        </div>
      </main>
    </div>
  );
}
