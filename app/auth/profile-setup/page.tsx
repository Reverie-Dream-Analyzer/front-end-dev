'use client';

import { ProfileSetup } from '@/components/profile-setup';

export default function ProfileSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <ProfileSetup />
    </div>
  );
}
